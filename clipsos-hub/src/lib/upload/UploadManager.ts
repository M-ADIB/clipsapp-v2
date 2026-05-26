/**
 * UploadManager — Singleton orchestrator for dual-destination video uploads.
 *
 * Manages a queue of upload jobs, each uploading simultaneously to:
 * 1. Cloudflare Stream (TUS protocol for playback)
 * 2. Cloudflare R2 (S3 multipart for original archival)
 *
 * Features:
 * - Max concurrent uploads (configurable)
 * - Pause/resume/cancel per job
 * - Retry with exponential backoff
 * - State subscription for React integration
 * - Query cache invalidation on completion
 */

import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/queryClient";

import { StreamUploader } from "./StreamUploader";
import { R2Uploader } from "./R2Uploader";
import { uploadTelemetry } from "./telemetry";
import { MAX_CONCURRENT_UPLOADS, MAX_FILE_SIZE } from "./constants";
import type {
  UploadJob,
  UploadManagerListener,
  UploadSessionInit,
  OverallUploadStatus,
  R2PartResult,
} from "./types";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════
// Console logging utility — prefixed for easy filtering in DevTools
// ═══════════════════════════════════════════════════════════════════
const LOG_PREFIX = "[Upload]";
const log = {
  info: (...args: unknown[]) =>
    console.log(`%c${LOG_PREFIX}`, "color: #22c55e; font-weight: bold", ...args),
  warn: (...args: unknown[]) =>
    console.warn(`%c${LOG_PREFIX}`, "color: #f59e0b; font-weight: bold", ...args),
  error: (...args: unknown[]) =>
    console.error(`%c${LOG_PREFIX}`, "color: #ef4444; font-weight: bold", ...args),
  step: (step: string, detail?: unknown) => {
    const msg =
      detail !== undefined
        ? [`%c${LOG_PREFIX} ▸ ${step}`, "color: #3b82f6; font-weight: bold", detail]
        : [`%c${LOG_PREFIX} ▸ ${step}`, "color: #3b82f6; font-weight: bold"];
    console.log(...msg);
  },
  table: (data: Record<string, unknown>) => {
    console.log(`%c${LOG_PREFIX} 📊`, "color: #8b5cf6; font-weight: bold");
    console.table(data);
  },
};

class UploadManagerSingleton {
  private static instance: UploadManagerSingleton | null = null;

  private jobs = new Map<string, UploadJob>();
  private listeners = new Set<UploadManagerListener>();
  private activeCount = 0;
  private staleSessionsChecked = false;

  /** Cached snapshot for useSyncExternalStore — only refreshed on notify() */
  private _snapshot: UploadJob[] = [];

  // Active uploader instances (keyed by job id)
  private streamUploaders = new Map<string, StreamUploader>();
  private r2Uploaders = new Map<string, R2Uploader>();

  // Speed tracking for ETA
  private speedSamples = new Map<string, { time: number; bytes: number }[]>();

  // Current JWT access token for edge function auth (refreshed per job)
  private currentAccessToken: string | null = null;

  // Network state — tracks browser online/offline for auto-pause
  private _isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  private constructor() {
    log.info("🚀 UploadManager singleton initialized");

    // Singleton — set up tab-close protection + network detection
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.handleBeforeUnload);
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }

    // Auth state listener — cancel all uploads on sign-out, recover stale on sign-in
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        log.warn("Auth state: SIGNED_OUT — cancelling all uploads");
        this.staleSessionsChecked = false;
        this.cancelAllActive("signed_out");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Auto-recover stale sessions when user signs in or token refreshes, but only check once per session
        if (this.staleSessionsChecked) return;
        this.staleSessionsChecked = true;
        this.recoverStaleSessions().catch(() => {});
      }
    });
  }

  /**
   * Network: Went offline — pause all active uploads and notify user.
   */
  private handleOffline = (): void => {
    this._isOnline = false;
    log.warn("🔌 Network OFFLINE — pausing all active uploads");
    for (const job of this.jobs.values()) {
      if (job.status === "uploading") {
        this.pause(job.id);
      }
    }
    toast.warning("You're offline — uploads paused", {
      description: "Uploads will resume automatically when your connection returns.",
      duration: Infinity,
      id: "upload-offline",
    });
    this.notify();
  };

  /**
   * Network: Back online — resume paused uploads.
   */
  private handleOnline = (): void => {
    this._isOnline = true;
    log.info("🌐 Network ONLINE — resuming paused uploads");
    toast.dismiss("upload-offline");
    toast.success("You're back online — resuming uploads", { duration: 3000 });
    for (const job of this.jobs.values()) {
      if (job.status === "paused") {
        this.resume(job.id);
      }
    }
    this.notify();
  };

  /**
   * Warn user if they try to close the tab while uploads are active.
   * The browser will show a generic "Changes you made may not be saved" prompt.
   */
  private handleBeforeUnload = (e: BeforeUnloadEvent): void => {
    const hasActive = Array.from(this.jobs.values()).some(
      (j) => j.status === "uploading" || j.status === "processing" || j.status === "initializing",
    );
    if (hasActive) {
      e.preventDefault();
      // Modern browsers ignore custom messages, but returnValue must be set
      e.returnValue = "";
    }
  };

  static getInstance(): UploadManagerSingleton {
    if (!UploadManagerSingleton.instance) {
      UploadManagerSingleton.instance = new UploadManagerSingleton();
    }
    return UploadManagerSingleton.instance;
  }

  // ────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────

  /**
   * Add a file to the upload queue.
   * Returns a temporary job ID (replaced by session_id after initialization).
   */
  addFile(file: File, videoId: string, versionId: string): string {
    // ── File size gate ──
    if (file.size > MAX_FILE_SIZE) {
      const maxGB = (MAX_FILE_SIZE / (1024 * 1024 * 1024)).toFixed(0);
      const fileGB = (file.size / (1024 * 1024 * 1024)).toFixed(2);
      toast.error(`File too large: ${fileGB} GB`, {
        description: `Maximum upload size is ${maxGB} GB. Please compress or split the file.`,
      });
      log.error(`File rejected — too large: ${file.name} (${fileGB}GB > ${maxGB}GB)`);
      throw new Error(`File exceeds ${maxGB}GB limit`);
    }

    const jobId = crypto.randomUUID();
    log.info(`📁 Adding file to queue: "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    log.step("Job created", {
      jobId,
      videoId,
      versionId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    // Telemetry: upload_started (pre-session, so session_id is null)
    uploadTelemetry.trackEvent({
      session_id: null,
      event_type: "upload_started",
      metadata: {
        job_id: jobId,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        video_id: videoId,
        version_id: versionId,
      },
    });

    const job: UploadJob = {
      id: jobId,
      file,
      videoId,
      versionId,
      sessionId: null,
      status: "initializing",
      progress: {
        streamPercent: 0,
        r2Percent: 0,
        overallPercent: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        etaSeconds: null,
        speedBytesPerSec: null,
      },
      error: null,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      tusUrl: null,
      streamMediaId: null,
      r2UploadId: null,
      r2Key: null,
      r2PartsTotal: 0,
      r2CompletedParts: [],
    };

    this.jobs.set(jobId, job);
    this.notify();
    this.processQueue();
    return jobId;
  }

  /**
   * Cancel all active/paused uploads.
   * Called automatically on sign-out to prevent orphaned connections.
   */
  cancelAllActive(reason = "user_cancelled"): void {
    log.warn(`Cancelling all active uploads (reason: ${reason})`);
    for (const job of this.jobs.values()) {
      if (job.status === "uploading" || job.status === "paused" || job.status === "initializing") {
        // Abort uploaders
        this.streamUploaders.get(job.id)?.abort();
        this.r2Uploaders.get(job.id)?.abort();
        this.streamUploaders.delete(job.id);
        this.r2Uploaders.delete(job.id);

        // Notify backend (fire and forget — include auth header)
        if (job.sessionId) {
          supabase.functions
            .invoke("complete-upload", {
              headers: this.currentAccessToken
                ? { Authorization: `Bearer ${this.currentAccessToken}` }
                : undefined,
              body: { session_id: job.sessionId, action: "cancel" },
            })
            .catch(() => {});
        }

        job.status = "cancelled";
        job.error = reason === "signed_out" ? "Signed out" : "Cancelled";
        job.completedAt = Date.now();

        // Telemetry: upload_cancelled
        uploadTelemetry.trackEvent({
          session_id: job.sessionId,
          event_type: "upload_cancelled",
          metadata: {
            job_id: job.id,
            file_name: job.file.name,
            file_size: job.file.size,
            overall_percent: job.progress.overallPercent,
            error: job.error,
          },
        });
      }
    }
    this.activeCount = 0;
    this.notify();
  }

  /**
   * Query DB for orphaned upload sessions (crashed/abandoned).
   * Returns sessions that were left in 'uploading' status.
   * Future agents: wire this into the auth flow to offer resume-after-crash.
   */
  async recoverStaleSessions() {
    log.step("Checking for stale/orphaned upload sessions...");
    // Only target sessions that haven't been updated for at least 5 minutes to avoid marking active uploads as failed
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("upload_sessions")
      .select(
        "id, video_id, version_id, file_name, file_size, overall_status, r2_parts_completed, r2_parts_total, created_at",
      )
      .in("overall_status", ["uploading", "initializing"])
      .or(`updated_at.lt.${fiveMinutesAgo},and(updated_at.is.null,created_at.lt.${fiveMinutesAgo})`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      log.warn("Failed to query stale sessions:", error.message);
      return [];
    }
    log.info(`Found ${data?.length ?? 0} stale session(s)`);

    if (data && data.length > 0) {
      const ids = data.map((s) => s.id);
      const { error: updateError } = await supabase
        .from("upload_sessions")
        .update({ overall_status: "failed" })
        .in("id", ids);
      if (updateError) {
        log.warn("Failed to mark stale sessions as failed:", updateError.message);
      } else {
        log.info(`Successfully marked ${ids.length} stale session(s) as failed`);
      }
    }

    return data ?? [];
  }

  pause(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "uploading") return;

    log.step("Pausing upload", { jobId, fileName: job.file.name });
    this.streamUploaders.get(jobId)?.pause();
    this.r2Uploaders.get(jobId)?.pause();

    job.status = "paused";
    this.notify();
  }

  resume(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "paused") return;

    log.step("Resuming upload", { jobId, fileName: job.file.name });
    this.streamUploaders.get(jobId)?.resume();
    this.r2Uploaders.get(jobId)?.resume();

    job.status = "uploading";
    this.notify();
  }

  async cancel(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    log.step("Cancelling upload", { jobId, fileName: job.file.name, sessionId: job.sessionId });

    // Abort active uploaders
    this.streamUploaders.get(jobId)?.abort();
    this.r2Uploaders.get(jobId)?.abort();
    this.streamUploaders.delete(jobId);
    this.r2Uploaders.delete(jobId);

    // Notify backend
    if (job.sessionId) {
      try {
        await supabase.functions.invoke("complete-upload", {
          headers: this.currentAccessToken
            ? { Authorization: `Bearer ${this.currentAccessToken}` }
            : undefined,
          body: { session_id: job.sessionId, action: "cancel" },
        });
        log.step("Backend cancel confirmed", { sessionId: job.sessionId });
      } catch (e) {
        log.warn("Failed to cancel upload on backend:", e);
      }
    }

    job.status = "cancelled";
    job.completedAt = Date.now();
    this.activeCount = Math.max(0, this.activeCount - 1);

    // Telemetry: upload_cancelled
    uploadTelemetry.trackEvent({
      session_id: job.sessionId,
      event_type: "upload_cancelled",
      metadata: {
        job_id: job.id,
        file_name: job.file.name,
        file_size: job.file.size,
        overall_percent: job.progress.overallPercent,
      },
    });

    this.notify();
    this.processQueue();
  }

  async retry(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || (job.status !== "failed" && job.status !== "cancelled")) return;

    log.step("Retrying upload", { jobId, fileName: job.file.name });

    // Telemetry: upload_retried (before state reset so we capture previous error)
    uploadTelemetry.trackEvent({
      session_id: job.sessionId,
      event_type: "upload_retried",
      metadata: {
        job_id: job.id,
        file_name: job.file.name,
        file_size: job.file.size,
        error: job.error ?? undefined,
      },
    });

    // Reset state but keep the file reference
    job.status = "initializing";
    job.error = null;
    job.progress = {
      streamPercent: 0,
      r2Percent: 0,
      overallPercent: 0,
      bytesUploaded: 0,
      bytesTotal: job.file.size,
      etaSeconds: null,
      speedBytesPerSec: null,
    };
    job.sessionId = null;
    job.tusUrl = null;
    job.streamMediaId = null;
    job.r2UploadId = null;
    job.r2Key = null;
    job.r2CompletedParts = [];
    job.completedAt = null;

    this.notify();
    this.processQueue();
  }

  remove(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && (job.status === "uploading" || job.status === "paused")) {
      this.cancel(jobId);
    }
    this.jobs.delete(jobId);
    this.speedSamples.delete(jobId);
    log.step("Job removed from queue", { jobId });
    this.notify();
  }

  getJobs(): UploadJob[] {
    return this._snapshot;
  }

  getJob(jobId: string): UploadJob | undefined {
    return this.jobs.get(jobId);
  }

  subscribe(listener: UploadManagerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // ────────────────────────────────────────
  // Queue Processing
  // ────────────────────────────────────────

  private processQueue(): void {
    if (this.activeCount >= MAX_CONCURRENT_UPLOADS) {
      log.step("Queue full", { activeCount: this.activeCount, max: MAX_CONCURRENT_UPLOADS });
      return;
    }

    // Find the next queued job
    for (const job of this.jobs.values()) {
      if (job.status === "initializing" && this.activeCount < MAX_CONCURRENT_UPLOADS) {
        log.step("Starting next job from queue", { jobId: job.id, fileName: job.file.name });
        this.activeCount++;
        this.startJob(job).catch((err) => {
          log.error(`Unhandled error in startJob for job ${job.id}:`, err);
        });
      }
    }
  }

  private async startJob(job: UploadJob): Promise<void> {
    try {
      job.startedAt = Date.now();
      this.notify();

      // ── 0. Ensure we have a fresh auth session ──
      // With publishable keys (sb_publishable_*), the SDK may not auto-send
      // a valid user JWT to edge functions. We explicitly refresh and pass it.
      log.step("Step 0/4: Refreshing auth session");
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError || !authData.session?.access_token) {
        log.error("Auth session missing or expired — user must re-login", { authError });
        throw new Error("Your session has expired. Please refresh the page and log in again.");
      }
      const accessToken = authData.session.access_token;
      this.currentAccessToken = accessToken;
      log.step("Step 0/4: Auth OK", {
        userId: authData.session.user.id.substring(0, 8),
        expiresAt: new Date((authData.session.expires_at ?? 0) * 1000).toISOString(),
      });

      // ── 1. Initialize session via edge function ──
      log.step("Step 1/4: Calling initialize-upload edge function", {
        videoId: job.videoId,
        versionId: job.versionId,
        fileName: job.file.name,
        fileSize: job.file.size,
      });

      const { data: sessionData, error: initError } = await supabase.functions.invoke(
        "initialize-upload",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            video_id: job.videoId,
            version_id: job.versionId,
            file_name: job.file.name,
            file_size: job.file.size,
            mime_type: job.file.type,
          },
        },
      );

      if (initError || !sessionData?.session_id) {
        // FunctionsHttpError: the function ran but returned non-2xx.
        // The response body is in error.context, NOT in data (data is null).
        let realError = "Failed to initialize upload session";
        let failedAt = "unknown";
        let steps: string[] = [];

        if (initError && typeof initError === "object" && "context" in initError) {
          // FunctionsHttpError — parse the JSON body from the Response object
          try {
            const errorBody = await (initError as { context: Response }).context.json();
            realError = errorBody?.error || realError;
            failedAt = errorBody?.failed_at || failedAt;
            steps = errorBody?.steps || steps;
          } catch {
            // context.json() failed, fall through
          }
        }

        // Fallback: try sessionData (might be populated in some SDK versions)
        if (realError === "Failed to initialize upload session") {
          realError = sessionData?.error || initError?.message || realError;
          failedAt = sessionData?.failed_at || failedAt;
          steps = sessionData?.steps || steps;
        }

        log.error("Step 1 FAILED: initialize-upload error", {
          initError: initError?.message,
          errorType: initError?.constructor?.name,
          realError,
          failedAt,
          steps,
          sessionData,
        });
        throw new Error(this.friendlyError(realError, failedAt));
      }

      const session = sessionData as UploadSessionInit;
      log.info("✅ Step 1 COMPLETE: Session initialized");
      log.step("Session details", {
        sessionId: session.session_id,
        tusUrl: session.tus_url ? "✓ received" : "✗ null",
        streamMediaId: session.stream_media_id,
        r2UploadId: session.r2_upload_id ? "✓ received" : "✗ null",
        r2Key: session.r2_key,
        r2PartsTotal: session.r2_parts_total,
        r2ChunkSize: session.r2_chunk_size,
      });

      job.sessionId = session.session_id;
      job.tusUrl = session.tus_url;
      job.streamMediaId = session.stream_media_id;
      job.r2UploadId = session.r2_upload_id;
      job.r2Key = session.r2_key;
      job.r2PartsTotal = session.r2_parts_total;
      job.status = "uploading";
      this.notify();

      // Telemetry: upload_initialized (session is ready, both tracks starting)
      uploadTelemetry.trackEvent({
        session_id: session.session_id,
        event_type: "upload_initialized",
        metadata: {
          job_id: job.id,
          file_name: job.file.name,
          file_size: job.file.size,
          video_id: job.videoId,
          version_id: job.versionId,
          r2_parts_total: session.r2_parts_total,
          r2_chunk_size: session.r2_chunk_size,
          has_stream: session.tus_url ? true : false,
          has_r2: session.r2_upload_id ? true : false,
        },
      });

      // ── 2. Start both uploads in parallel ──
      log.step("Step 2/4: Starting parallel uploads", {
        stream: session.tus_url ? "YES (TUS)" : "SKIP",
        r2: session.r2_upload_id ? `YES (${session.r2_parts_total} parts)` : "SKIP",
      });

      const uploadPromises: Promise<void>[] = [];

      // Stream upload (TUS)
      if (session.tus_url) {
        uploadPromises.push(this.startStreamUpload(job, session.tus_url));
      }

      // R2 upload (multipart)
      if (session.r2_upload_id) {
        uploadPromises.push(this.startR2Upload(job));
      }

      // Wait for both to complete
      try {
        await Promise.all(uploadPromises);
        log.info("✅ Step 2 COMPLETE: Both upload tracks finished");
      } catch (err) {
        if ((job.status as string) === "cancelled") {
          log.warn("Upload was cancelled during transfer");
          return; // Don't mark as failed if user cancelled
        }
        log.error("Step 2 FAILED: Upload track error", err);
        throw err;
      }

      // ── 3. Finalize ──
      if ((job.status as string) === "cancelled") return;

      job.status = "processing";
      this.notify();

      log.step("Step 3/4: Calling complete-upload edge function", {
        sessionId: job.sessionId,
        r2PartsCount: job.r2CompletedParts.length,
        streamStatus: job.tusUrl ? "ready" : "skipped",
      });

      const { data: completeData, error: completeError } = await supabase.functions.invoke(
        "complete-upload",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          body: {
            session_id: job.sessionId,
            r2_parts: job.r2CompletedParts,
            stream_status: job.tusUrl ? "ready" : "skipped",
            stream_media_id: job.streamMediaId,
            stream_progress: 100,
          },
        },
      );

      if (completeError) {
        const realError =
          completeData?.error || completeError.message || "Failed to finalize upload";
        log.error("Step 3 FAILED: complete-upload error", { completeError, completeData });
        throw new Error(this.friendlyError(realError));
      }

      log.info("✅ Step 3 COMPLETE: Backend finalization successful");
      log.step("Complete-upload response", completeData);
      job.status = "completed";
      job.progress.overallPercent = 100;
      job.progress.streamPercent = 100;
      job.progress.r2Percent = 100;
      job.completedAt = Date.now();

      // Telemetry: upload_completed
      const durationMs = job.completedAt - job.startedAt;
      uploadTelemetry.trackEvent({
        session_id: job.sessionId,
        event_type: "upload_completed",
        metadata: {
          job_id: job.id,
          file_name: job.file.name,
          file_size: job.file.size,
          duration_ms: durationMs,
          avg_speed_bytes_per_sec:
            durationMs > 0 ? Math.round((job.file.size / durationMs) * 1000) : undefined,
          r2_parts_completed: job.r2CompletedParts.length,
        },
      });

      // ── 4. Invalidate query cache + notify user ──
      try {
        // Invalidate ALL grid queries (rows, values, editors) — these are the
        // cache keys used by useGridRows, not ["videos"]
        queryClient.invalidateQueries({ queryKey: ["grid"] });
        // Also invalidate legacy video queries for other consumers
        queryClient.invalidateQueries({ queryKey: ["videos"] });
        log.info("✅ Step 4 COMPLETE: Query cache invalidated — UI should refresh");
        const elapsed = ((job.completedAt - job.startedAt) / 1000).toFixed(1);
        log.info(`🎉 Upload complete: "${job.file.name}" in ${elapsed}s`);
        toast.success(`"${job.file.name}" uploaded successfully`, {
          description: `Completed in ${elapsed}s — video is ready for playback.`,
        });
      } catch (e) {
        log.warn("Cache invalidation failed (non-fatal):", e);
      }
    } catch (err: any) {
      if ((job.status as string) === "cancelled") {
        log.warn("Upload was cancelled, ignoring error:", err?.message || err);
        return;
      }
      log.error(`Job ${job.id} failed:`, err?.message || err);
      job.status = "failed";
      job.error = err?.message || "Failed to start upload";
      job.completedAt = Date.now();

      // Telemetry: upload_failed
      uploadTelemetry.trackEvent({
        session_id: job.sessionId,
        event_type: "upload_failed",
        metadata: {
          job_id: job.id,
          file_name: job.file.name,
          file_size: job.file.size,
          error: job.error ?? undefined,
          duration_ms: job.startedAt ? Date.now() - job.startedAt : undefined,
          overall_percent: job.progress.overallPercent,
        },
      });

      // Display toast error
      toast.error(`Upload failed: ${job.file.name}`, {
        description: job.error || "An unknown error occurred. You can retry from the upload queue.",
      });
    } finally {
      if (job.status !== "cancelled") {
        this.activeCount = Math.max(0, this.activeCount - 1);
      }
      this.notify();
      this.processQueue();
    }
  }

  private startStreamUpload(job: UploadJob, tusUrl: string): Promise<void> {
    log.step("Stream: Starting TUS upload", { tusUrl: tusUrl.substring(0, 60) + "..." });
    return new Promise<void>((resolve, reject) => {
      const uploader = new StreamUploader({
        file: job.file,
        tusUrl,
        onProgress: (percent) => {
          job.progress.streamPercent = percent;
          this.updateOverallProgress(job);
          this.notify();
          // Log every 25%
          if (percent % 25 === 0 && percent > 0) {
            log.step(`Stream: ${percent}% uploaded`);
          }
        },
        onSuccess: (mediaId) => {
          job.streamMediaId = mediaId || job.streamMediaId;
          job.progress.streamPercent = 100;
          this.updateOverallProgress(job);
          this.notify();
          log.info("✅ Stream upload complete", { mediaId: job.streamMediaId });
          resolve();
        },
        onError: (error) => {
          log.error("Stream upload failed (non-fatal):", error.message);
          // Stream failure is non-fatal — R2 upload continues
          job.progress.streamPercent = -1; // Signal failure
          this.notify();
          resolve(); // Don't reject — we still want R2 to complete
        },
      });

      this.streamUploaders.set(job.id, uploader);
      uploader.start();
    });
  }

  private startR2Upload(job: UploadJob): Promise<void> {
    log.step("R2: Starting multipart upload", {
      totalParts: job.r2PartsTotal,
      sessionId: job.sessionId,
    });

    return new Promise<void>((resolve, reject) => {
      const uploader = new R2Uploader({
        file: job.file,
        sessionId: job.sessionId!,
        totalParts: job.r2PartsTotal,
        completedParts: job.r2CompletedParts,
        accessToken: this.currentAccessToken!,
        onProgress: (percent, partsCompleted) => {
          job.progress.r2Percent = percent;
          this.updateOverallProgress(job);
          this.trackSpeed(job.id, partsCompleted * 10 * 1024 * 1024); // approximate
          this.notify();
          // Log every 10%
          if (percent % 10 === 0 && percent > 0) {
            log.step(`R2: ${percent}% (${partsCompleted}/${job.r2PartsTotal} parts)`);
          }
        },
        onPartComplete: (part) => {
          job.r2CompletedParts.push(part);
        },
        onSpeedUpdate: (bytesPerSec) => {
          // Use the direct speed from R2Uploader instead of approximation
          job.progress.speedBytesPerSec = bytesPerSec;
          this.notify();
        },
        onChunkFailed: (partNumber, attempt, error) => {
          // Telemetry: chunk_failed
          uploadTelemetry.trackEvent({
            session_id: job.sessionId,
            event_type: "chunk_failed",
            metadata: {
              job_id: job.id,
              file_name: job.file.name,
              part_number: partNumber,
              attempt,
              error,
            },
          });
        },
        onChunkRecovered: (partNumber, attempt) => {
          // Telemetry: chunk_recovered
          uploadTelemetry.trackEvent({
            session_id: job.sessionId,
            event_type: "chunk_recovered",
            metadata: {
              job_id: job.id,
              file_name: job.file.name,
              part_number: partNumber,
              attempt,
            },
          });
        },
        onChunkSizeChanged: (before, after, speedMbps) => {
          // Telemetry: speed_adapted
          uploadTelemetry.trackEvent({
            session_id: job.sessionId,
            event_type: "speed_adapted",
            metadata: {
              job_id: job.id,
              file_name: job.file.name,
              chunk_size_before: before,
              chunk_size_after: after,
              speed_mbps: speedMbps,
            },
          });
        },
      });

      this.r2Uploaders.set(job.id, uploader);

      uploader
        .upload()
        .then(() => {
          job.progress.r2Percent = 100;
          this.updateOverallProgress(job);
          this.notify();
          log.info("✅ R2 multipart upload complete", {
            totalParts: job.r2CompletedParts.length,
          });
          resolve();
        })
        .catch((err) => {
          if (job.status === "cancelled") {
            resolve();
          } else {
            log.error("R2 upload failed:", err.message);
            reject(new Error(this.friendlyError(err.message)));
          }
        });
    });
  }

  // ────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────

  private updateOverallProgress(job: UploadJob): void {
    const streamWeight = job.tusUrl ? 0.5 : 0;
    const r2Weight = job.r2UploadId ? (job.tusUrl ? 0.5 : 1) : 0;

    const streamPct = job.progress.streamPercent < 0 ? 0 : job.progress.streamPercent;

    job.progress.overallPercent = Math.round(
      streamPct * streamWeight + job.progress.r2Percent * r2Weight,
    );

    job.progress.bytesUploaded = Math.round((job.progress.overallPercent / 100) * job.file.size);

    // ETA + speed calculation
    const samples = this.speedSamples.get(job.id);
    if (samples && samples.length >= 2) {
      const recent = samples.slice(-5);
      const timeDelta = recent[recent.length - 1].time - recent[0].time;
      const bytesDelta = recent[recent.length - 1].bytes - recent[0].bytes;
      if (timeDelta > 0 && bytesDelta > 0) {
        const bytesPerMs = bytesDelta / timeDelta;
        const remaining = job.file.size - job.progress.bytesUploaded;
        job.progress.etaSeconds = Math.round(remaining / (bytesPerMs * 1000));
        job.progress.speedBytesPerSec = Math.round(bytesPerMs * 1000);
      }
    }
  }

  private trackSpeed(jobId: string, bytesUploaded: number): void {
    if (!this.speedSamples.has(jobId)) {
      this.speedSamples.set(jobId, []);
    }
    const samples = this.speedSamples.get(jobId)!;
    samples.push({ time: Date.now(), bytes: bytesUploaded });
    // Keep last 20 samples
    if (samples.length > 20) {
      samples.splice(0, samples.length - 20);
    }
  }

  /**
   * Map developer-facing errors to user-friendly messages.
   */
  private friendlyError(rawError: string, _failedAt?: string): string {
    const lower = rawError.toLowerCase();
    if (
      lower.includes("unauthorized") ||
      lower.includes("no auth header") ||
      lower.includes("session has expired")
    ) {
      return "Your session has expired. Please refresh the page and sign in again.";
    }
    if (lower.includes("no tenant") || lower.includes("profile missing")) {
      return "Your account setup is incomplete. Please contact your workspace admin.";
    }
    if (
      lower.includes("file too large") ||
      (lower.includes("exceeds") && lower.includes("limit"))
    ) {
      return rawError; // Already user-friendly
    }
    if (lower.includes("r2 config missing") || lower.includes("r2 upload not initialized")) {
      return "Storage configuration error. Please contact support.";
    }
    if (lower.includes("invalid mime type")) {
      return rawError; // Already descriptive
    }
    if (lower.includes("missing fields") || lower.includes("invalid json")) {
      return "Upload request was malformed. Please try again.";
    }
    if (
      lower.includes("fetch") ||
      lower.includes("networkerror") ||
      lower.includes("failed to fetch")
    ) {
      return "Network error — check your internet connection and try again.";
    }
    // R2 part errors with HTTP status
    const r2Match = rawError.match(/R2 PUT failed: (\d+)/);
    if (r2Match) {
      const status = parseInt(r2Match[1]);
      if (status === 403) return "Upload authorization expired. Please retry.";
      if (status >= 500) return "Cloud storage temporarily unavailable. Please retry in a moment.";
      return `Upload failed (error ${status}). Please try again.`;
    }
    // Fallback: return the raw error if it's short enough, otherwise generic
    if (rawError.length > 120) {
      return "Upload failed due to an unexpected error. Please try again.";
    }
    return rawError;
  }

  private notify(): void {
    // Refresh the cached snapshot (new array reference triggers useSyncExternalStore)
    this._snapshot = Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
    for (const listener of this.listeners) {
      try {
        listener(this._snapshot);
      } catch (e) {
        log.error("Upload listener error:", e);
      }
    }
  }

  /**
   * Remove all completed + cancelled + failed jobs from the queue.
   */
  clearCompleted(): void {
    const toRemove: string[] = [];
    for (const job of this.jobs.values()) {
      if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
        toRemove.push(job.id);
      }
    }
    for (const id of toRemove) {
      this.jobs.delete(id);
      this.speedSamples.delete(id);
    }
    if (toRemove.length > 0) {
      log.step(`Cleared ${toRemove.length} finished job(s) from queue`);
      this.notify();
    }
  }

  /**
   * Whether the browser currently has network connectivity.
   */
  getIsOnline(): boolean {
    return this._isOnline;
  }
}

/** Export the singleton instance */
export const uploadManager = UploadManagerSingleton.getInstance();
