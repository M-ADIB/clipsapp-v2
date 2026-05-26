/**
 * Upload Telemetry — Lightweight, local-first telemetry for the upload pipeline.
 *
 * Features:
 * - Structured event tracking with typed event names and metadata
 * - In-memory ring buffer (last 100 events) for debugging
 * - Buffered flush (every 5s or on page unload via sendBeacon)
 * - External sink hook for future Sentry/Posthog integration
 * - Zero dependencies — no database tables, no network calls (yet)
 */

// ═══════════════════════════════════════════════════════════════════
// Event Types
// ═══════════════════════════════════════════════════════════════════

const TELEMETRY_EVENT_TYPES = [
  "upload_started",
  "upload_initialized",
  "upload_progress",
  "upload_completed",
  "upload_failed",
  "upload_cancelled",
  "upload_retried",
  "chunk_failed",
  "chunk_recovered",
  "speed_adapted",
] as const;

export type TelemetryEventType = (typeof TELEMETRY_EVENT_TYPES)[number];

/** Metadata varies per event type — keep it flexible but typed */
export interface TelemetryEventMetadata {
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  video_id?: string;
  version_id?: string;
  job_id?: string;
  speed_bytes_per_sec?: number;
  chunk_size_before?: number;
  chunk_size_after?: number;
  error?: string;
  failed_at?: string;
  duration_ms?: number;
  avg_speed_bytes_per_sec?: number;
  overall_percent?: number;
  part_number?: number;
  attempt?: number;
  max_retries?: number;
  /** Catch-all for event-specific data not covered above */
  [key: string]: string | number | boolean | undefined;
}

export interface TelemetryEvent {
  /** Upload session ID — null for pre-init events like upload_started */
  session_id: string | null;
  event_type: TelemetryEventType;
  metadata: TelemetryEventMetadata;
  timestamp: string; // ISO 8601
}

// ═══════════════════════════════════════════════════════════════════
// External Sink — hook point for Sentry / Posthog / custom backend
// ═══════════════════════════════════════════════════════════════════

export type ExternalSinkCallback = (events: TelemetryEvent[]) => void;

// ═══════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════

const RING_BUFFER_MAX = 100;
const FLUSH_INTERVAL_MS = 5_000;
const LOG_PREFIX = "[Upload:Telemetry]";

// ═══════════════════════════════════════════════════════════════════
// UploadTelemetry Class
// ═══════════════════════════════════════════════════════════════════

export class UploadTelemetry {
  private static instance: UploadTelemetry | null = null;

  /** Ring buffer of the last N events (oldest evicted first) */
  private ringBuffer: TelemetryEvent[] = [];

  /** Pending events waiting for the next flush */
  private pendingBuffer: TelemetryEvent[] = [];

  /** External sink callback — set via setExternalSink() */
  private externalSink: ExternalSinkCallback | null = null;

  /** Flush interval timer handle */
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Start periodic flush
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

    // Register page-unload handler for reliable last-chance delivery
    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", this.handleVisibilityChange);
      window.addEventListener("pagehide", this.handlePageHide);
    }
  }

  static getInstance(): UploadTelemetry {
    if (!UploadTelemetry.instance) {
      UploadTelemetry.instance = new UploadTelemetry();
    }
    return UploadTelemetry.instance;
  }

  // ────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────

  /**
   * Track a structured upload event.
   * Events are buffered and flushed periodically or on page unload.
   */
  trackEvent(event: {
    session_id: string | null;
    event_type: TelemetryEventType;
    metadata?: TelemetryEventMetadata;
  }): void {
    const telemetryEvent: TelemetryEvent = {
      session_id: event.session_id,
      event_type: event.event_type,
      metadata: event.metadata ?? {},
      timestamp: new Date().toISOString(),
    };

    // Add to ring buffer (evict oldest if full)
    this.ringBuffer.push(telemetryEvent);
    if (this.ringBuffer.length > RING_BUFFER_MAX) {
      this.ringBuffer.shift();
    }

    // Add to pending flush buffer
    this.pendingBuffer.push(telemetryEvent);

    // Log to console as structured JSON
    console.log(
      `%c${LOG_PREFIX} ${telemetryEvent.event_type}`,
      "color: #a855f7; font-weight: bold",
      JSON.stringify(
        {
          session_id: telemetryEvent.session_id,
          ...telemetryEvent.metadata,
          timestamp: telemetryEvent.timestamp,
        },
        null,
        0,
      ),
    );
  }

  /**
   * Return the most recent events from the ring buffer.
   * Useful for debugging in DevTools: `uploadTelemetry.getRecentEvents()`
   */
  getRecentEvents(limit?: number): TelemetryEvent[] {
    if (limit === undefined) {
      return [...this.ringBuffer];
    }
    return this.ringBuffer.slice(-limit);
  }

  /**
   * Set an external sink callback for forwarding events to
   * Sentry, Posthog, or a custom analytics backend.
   *
   * The callback receives batches of events on each flush cycle.
   * Pass `null` to remove the sink.
   */
  setExternalSink(sink: ExternalSinkCallback | null): void {
    this.externalSink = sink;
  }

  /**
   * Force an immediate flush of pending events.
   * Called automatically every 5 seconds and on page unload.
   */
  flush(): void {
    if (this.pendingBuffer.length === 0) return;

    const batch = [...this.pendingBuffer];
    this.pendingBuffer = [];

    // Forward to external sink if configured
    if (this.externalSink) {
      try {
        this.externalSink(batch);
      } catch (e) {
        console.warn(`${LOG_PREFIX} External sink error:`, e);
      }
    }
  }

  /**
   * Flush remaining events using sendBeacon for reliable delivery on page close.
   * This is the last-chance handler — data survives even if the tab is closed.
   */
  private beaconFlush(): void {
    if (this.pendingBuffer.length === 0) return;

    const batch = [...this.pendingBuffer];
    this.pendingBuffer = [];

    // Forward to external sink (best-effort)
    if (this.externalSink) {
      try {
        this.externalSink(batch);
      } catch {
        // Can't do much here — page is closing
      }
    }

    // Future: use navigator.sendBeacon to a real endpoint
    // For now, just log that we would have sent them
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      // When a real endpoint is configured, replace this with:
      // navigator.sendBeacon('/api/telemetry', JSON.stringify(batch));
      console.log(
        `%c${LOG_PREFIX} 📡 Beacon flush: ${batch.length} event(s)`,
        "color: #a855f7; font-weight: bold",
      );
    }
  }

  // ────────────────────────────────────────
  // Lifecycle Handlers
  // ────────────────────────────────────────

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === "hidden") {
      this.beaconFlush();
    }
  };

  private handlePageHide = (): void => {
    this.beaconFlush();
  };

  /**
   * Tear down the telemetry instance (for testing or hot-reload).
   * Not typically called in production.
   */
  destroy(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("visibilitychange", this.handleVisibilityChange);
      window.removeEventListener("pagehide", this.handlePageHide);
    }
    this.beaconFlush();
    UploadTelemetry.instance = null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════════

export const uploadTelemetry = UploadTelemetry.getInstance();
