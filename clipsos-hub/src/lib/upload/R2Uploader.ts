/**
 * R2Uploader — Multipart upload to Cloudflare R2 via presigned URLs.
 *
 * Browser → (presigned URL) → R2 directly (no proxy through edge functions)
 * Supports: pause/resume, concurrent part uploads, retry with backoff,
 *           adaptive chunk sizing, and 403 re-presign recovery.
 */

import { supabase } from "@/integrations/supabase/client";
import type { R2PartResult } from "./types";
import {
  R2_CHUNK_SIZE,
  R2_MIN_CHUNK_SIZE,
  R2_MAX_CHUNK_SIZE,
  MAX_CONCURRENT_R2_PARTS,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
} from "./constants";

const LOG = "[Upload:R2]";

interface R2UploaderOptions {
  file: File;
  sessionId: string;
  totalParts: number;
  chunkSize?: number;
  onProgress: (percent: number, partsCompleted: number) => void;
  onPartComplete: (part: R2PartResult) => void;
  /** Called with current speed in bytes/sec after each part */
  onSpeedUpdate?: (bytesPerSec: number) => void;
  /** Called when a chunk upload fails and will be retried */
  onChunkFailed?: (partNumber: number, attempt: number, error: string) => void;
  /** Called when a previously-failed chunk succeeds on retry */
  onChunkRecovered?: (partNumber: number, attempt: number) => void;
  /** Called when adaptive chunking changes the chunk size */
  onChunkSizeChanged?: (before: number, after: number, speedMbps: number) => void;
  /** Already-completed parts (for resume) */
  completedParts?: R2PartResult[];
  /** JWT access token for authenticating edge function calls */
  accessToken: string;
}

export class R2Uploader {
  private file: File;
  private sessionId: string;
  private totalParts: number;
  private chunkSize: number;
  private onProgress: (percent: number, partsCompleted: number) => void;
  private onPartComplete: (part: R2PartResult) => void;
  private onSpeedUpdate?: (bytesPerSec: number) => void;
  private onChunkFailed?: (partNumber: number, attempt: number, error: string) => void;
  private onChunkRecovered?: (partNumber: number, attempt: number) => void;
  private onChunkSizeChanged?: (before: number, after: number, speedMbps: number) => void;
  private completedParts: R2PartResult[];
  private accessToken: string;

  private abortController: AbortController | null = null;
  private isPaused = false;
  private isAborted = false;
  private pauseResolve: (() => void) | null = null;

  /** Rolling average of recent part upload speeds (bytes/ms) */
  private partSpeeds: number[] = [];

  constructor(options: R2UploaderOptions) {
    this.file = options.file;
    this.sessionId = options.sessionId;
    this.totalParts = options.totalParts;
    this.chunkSize = options.chunkSize ?? R2_CHUNK_SIZE;
    this.onProgress = options.onProgress;
    this.onPartComplete = options.onPartComplete;
    this.onSpeedUpdate = options.onSpeedUpdate;
    this.onChunkFailed = options.onChunkFailed;
    this.onChunkRecovered = options.onChunkRecovered;
    this.onChunkSizeChanged = options.onChunkSizeChanged;
    this.completedParts = options.completedParts ? [...options.completedParts] : [];
    this.accessToken = options.accessToken;
  }

  async upload(): Promise<R2PartResult[]> {
    this.abortController = new AbortController();
    this.isAborted = false;

    // Build list of parts that still need uploading
    const completedPartNumbers = new Set(this.completedParts.map((p) => p.part_number));
    const pendingParts: number[] = [];
    for (let i = 1; i <= this.totalParts; i++) {
      if (!completedPartNumbers.has(i)) {
        pendingParts.push(i);
      }
    }

    console.log(
      `%c${LOG}`,
      "color: #f97316; font-weight: bold",
      `Starting multipart upload: ${pendingParts.length} pending parts, ${completedPartNumbers.size} already completed, chunk size: ${(this.chunkSize / 1024 / 1024).toFixed(0)}MB`,
    );

    // Upload in parallel batches
    let cursor = 0;
    let batchNum = 0;
    while (cursor < pendingParts.length && !this.isAborted) {
      if (this.isPaused) {
        console.log(`%c${LOG}`, "color: #f97316", "⏸ Paused — waiting for resume...");
        await new Promise<void>((resolve) => {
          this.pauseResolve = resolve;
        });
      }

      const batch = pendingParts.slice(cursor, cursor + MAX_CONCURRENT_R2_PARTS);
      batchNum++;
      console.log(
        `%c${LOG}`,
        "color: #f97316",
        `Batch ${batchNum}: uploading parts [${batch.join(", ")}] (${MAX_CONCURRENT_R2_PARTS} concurrent, chunk: ${(this.chunkSize / 1024 / 1024).toFixed(0)}MB)`,
      );

      const results = await Promise.allSettled(
        batch.map((partNumber) => this.uploadPart(partNumber)),
      );

      for (const result of results) {
        if (result.status === "rejected") {
          console.error(
            `%c${LOG}`,
            "color: #ef4444; font-weight: bold",
            "Part upload failed:",
            result.reason?.message || result.reason,
          );
          throw new Error(`R2 part upload failed: ${result.reason?.message || result.reason}`);
        }
      }

      cursor += batch.length;

      // Adaptive chunking: adjust chunk size based on average speed
      this.adaptChunkSize();
    }

    if (this.isAborted) {
      throw new Error("Upload cancelled");
    }

    console.log(
      `%c${LOG}`,
      "color: #22c55e; font-weight: bold",
      `✅ All ${this.totalParts} parts uploaded successfully`,
    );
    return this.completedParts;
  }

  private async uploadPart(partNumber: number): Promise<void> {
    const start = (partNumber - 1) * this.chunkSize;
    const end = Math.min(start + this.chunkSize, this.file.size);
    const chunk = this.file.slice(start, end);
    const chunkSizeMB = ((end - start) / 1024 / 1024).toFixed(1);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (this.isAborted) throw new Error("Upload cancelled");

      try {
        if (attempt > 0) {
          console.log(
            `%c${LOG}`,
            "color: #f59e0b",
            `Part ${partNumber}: retry attempt ${attempt + 1}/${MAX_RETRIES}`,
          );
          // This is a recovery attempt — if previous attempt failed, the onChunkFailed
          // callback was already invoked in the catch block below.
        }

        // Get presigned URL from edge function
        const { data, error } = await supabase.functions.invoke("presign-r2-part", {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          body: { session_id: this.sessionId, part_number: partNumber },
        });

        if (error || !data?.presigned_url) {
          const realError = data?.error || error?.message || "Failed to get presigned URL";
          throw new Error(realError);
        }

        // Upload chunk directly to R2
        const uploadStart = performance.now();
        const response = await fetch(data.presigned_url, {
          method: "PUT",
          body: chunk,
          signal: this.abortController?.signal,
        });

        if (!response.ok) {
          const respText = await response.text().catch(() => "");

          // 403 = expired presigned URL → re-fetch on next retry
          if (response.status === 403 && attempt < MAX_RETRIES - 1) {
            console.warn(
              `%c${LOG}`,
              "color: #f59e0b",
              `Part ${partNumber}: presigned URL expired (403), re-fetching...`,
            );
            // Short delay then retry (will get new presigned URL)
            await new Promise((r) => setTimeout(r, 500));
            continue;
          }

          throw new Error(`R2 PUT failed: ${response.status} ${response.statusText} — ${respText}`);
        }

        const uploadMs = performance.now() - uploadStart;
        const etag = response.headers.get("etag") || `"part-${partNumber}"`;
        const partResult: R2PartResult = { part_number: partNumber, etag };

        // Track speed for adaptive chunking
        const chunkBytes = end - start;
        if (uploadMs > 0) {
          this.partSpeeds.push(chunkBytes / uploadMs); // bytes/ms
          if (this.partSpeeds.length > 10) this.partSpeeds.shift();

          // Report speed to parent
          const avgBytesPerMs = this.partSpeeds.reduce((a, b) => a + b, 0) / this.partSpeeds.length;
          this.onSpeedUpdate?.(Math.round(avgBytesPerMs * 1000));
        }

        // Only push via callback — UploadManager owns the canonical parts array.
        this.onPartComplete(partResult);

        // Update progress
        const percent = Math.round((this.completedParts.length / this.totalParts) * 100);
        this.onProgress(percent, this.completedParts.length);

        console.log(
          `%c${LOG}`,
          "color: #6b7280",
          `Part ${partNumber}/${this.totalParts} done (${chunkSizeMB}MB in ${uploadMs.toFixed(0)}ms, etag: ${etag})`,
        );

        // If this was a retry (attempt > 0), signal chunk recovery
        if (attempt > 0) {
          this.onChunkRecovered?.(partNumber, attempt + 1);
        }

        return; // Success — if this was a retry, signal recovery
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (this.isAborted) throw lastError;

        console.warn(
          `%c${LOG}`,
          "color: #f59e0b",
          `Part ${partNumber} failed (attempt ${attempt + 1}):`,
          lastError.message,
        );

        // Notify telemetry of chunk failure
        this.onChunkFailed?.(partNumber, attempt + 1, lastError.message);

        // Exponential backoff
        const delay = Math.min(RETRY_BASE_DELAY_MS * Math.pow(2, attempt), RETRY_MAX_DELAY_MS);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError || new Error(`Part ${partNumber} failed after ${MAX_RETRIES} attempts`);
  }

  /**
   * Adaptive chunking: adjust chunk size based on measured upload speed.
   * Faster connections get larger chunks (less overhead per presign call).
   * Slower connections get smaller chunks (faster retries on failure).
   */
  private adaptChunkSize(): void {
    if (this.partSpeeds.length < 3) return; // Need enough samples

    const avgBytesPerMs = this.partSpeeds.reduce((a, b) => a + b, 0) / this.partSpeeds.length;
    const avgMbps = (avgBytesPerMs * 1000 * 8) / (1024 * 1024); // Convert to Mbps

    let newChunkSize: number;
    if (avgMbps > 100) {
      // Very fast (>100 Mbps): use 100 MB chunks
      newChunkSize = R2_MAX_CHUNK_SIZE;
    } else if (avgMbps > 50) {
      // Fast (50-100 Mbps): use 50 MB chunks
      newChunkSize = 50 * 1024 * 1024;
    } else if (avgMbps > 20) {
      // Medium (20-50 Mbps): use 20 MB chunks
      newChunkSize = 20 * 1024 * 1024;
    } else if (avgMbps > 5) {
      // Slow (5-20 Mbps): use 10 MB chunks (default)
      newChunkSize = R2_CHUNK_SIZE;
    } else {
      // Very slow (<5 Mbps): use 5 MB minimum
      newChunkSize = R2_MIN_CHUNK_SIZE;
    }

    if (newChunkSize !== this.chunkSize) {
      console.log(
        `%c${LOG}`,
        "color: #8b5cf6; font-weight: bold",
        `📡 Adaptive chunking: ${(this.chunkSize / 1024 / 1024).toFixed(0)}MB → ${(newChunkSize / 1024 / 1024).toFixed(0)}MB (avg speed: ${avgMbps.toFixed(1)} Mbps)`,
      );
      const oldChunkSize = this.chunkSize;
      this.chunkSize = newChunkSize;
      this.onChunkSizeChanged?.(oldChunkSize, newChunkSize, parseFloat(avgMbps.toFixed(1)));
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
  }

  abort(): void {
    this.isAborted = true;
    this.abortController?.abort();
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
  }

  getCompletedParts(): R2PartResult[] {
    return [...this.completedParts];
  }
}
