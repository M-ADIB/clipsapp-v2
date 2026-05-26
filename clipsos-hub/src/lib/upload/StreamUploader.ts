/**
 * StreamUploader — TUS-based resumable upload to Cloudflare Stream.
 *
 * Uses tus-js-client for protocol compliance. The TUS URL is a
 * Direct Creator Upload endpoint (self-authenticating, no API token needed).
 */

import * as tus from "tus-js-client";
import { STREAM_CHUNK_SIZE } from "./constants";

const LOG = "[Upload:Stream]";

interface StreamUploaderOptions {
  file: File;
  tusUrl: string;
  onProgress: (percent: number) => void;
  onSuccess: (streamMediaId: string | null) => void;
  onError: (error: Error) => void;
}

export class StreamUploader {
  private upload: tus.Upload | null = null;
  private tusUrl: string;
  private file: File;
  private onProgress: (percent: number) => void;
  private onSuccess: (streamMediaId: string | null) => void;
  private onError: (error: Error) => void;
  private startTime = 0;

  constructor(options: StreamUploaderOptions) {
    this.file = options.file;
    this.tusUrl = options.tusUrl;
    this.onProgress = options.onProgress;
    this.onSuccess = options.onSuccess;
    this.onError = options.onError;
  }

  start(): void {
    this.startTime = performance.now();
    console.log(
      `%c${LOG}`,
      "color: #a855f7; font-weight: bold",
      `Starting TUS upload: ${this.file.name} (${(this.file.size / 1024 / 1024).toFixed(1)}MB)`,
      `\n  URL: ${this.tusUrl.substring(0, 80)}...`,
    );

    this.upload = new tus.Upload(this.file, {
      endpoint: this.tusUrl,
      // Direct Creator Upload URL is the endpoint itself
      uploadUrl: this.tusUrl,
      retryDelays: [0, 1000, 3000, 5000],
      chunkSize: STREAM_CHUNK_SIZE,
      metadata: {
        filename: this.file.name,
        filetype: this.file.type,
      },
      onError: (error) => {
        const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1);
        console.error(
          `%c${LOG}`,
          "color: #ef4444; font-weight: bold",
          `TUS upload FAILED after ${elapsed}s:`,
          error,
        );
        this.onError(error instanceof Error ? error : new Error(String(error)));
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percent = Math.round((bytesUploaded / bytesTotal) * 100);
        this.onProgress(percent);
        // Log every 25%
        if (percent % 25 === 0 && percent > 0) {
          console.log(
            `%c${LOG}`,
            "color: #a855f7",
            `${percent}% (${(bytesUploaded / 1024 / 1024).toFixed(1)}MB / ${(bytesTotal / 1024 / 1024).toFixed(1)}MB)`,
          );
        }
      },
      onSuccess: () => {
        const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1);
        // Extract stream-media-id from the upload URL if available
        const mediaId = this.extractMediaId();
        console.log(
          `%c${LOG}`,
          "color: #22c55e; font-weight: bold",
          `✅ TUS upload complete in ${elapsed}s — media ID: ${mediaId}`,
        );
        this.onSuccess(mediaId);
      },
    });

    // Check if there's a previous upload to resume
    const previousUploads = (this.upload as tus.Upload).findPreviousUploads?.();
    if (previousUploads instanceof Promise) {
      previousUploads.then((uploads: tus.PreviousUpload[]) => {
        if (uploads.length > 0) {
          console.log(
            `%c${LOG}`,
            "color: #a855f7",
            `Resuming from previous upload (${uploads.length} found)`,
          );
          this.upload!.resumeFromPreviousUpload(uploads[0]);
        }
        this.upload!.start();
      });
    } else {
      this.upload.start();
    }
  }

  pause(): void {
    console.log(`%c${LOG}`, "color: #a855f7", "⏸ Paused");
    this.upload?.abort();
  }

  resume(): void {
    console.log(`%c${LOG}`, "color: #a855f7", "▶ Resumed");
    this.upload?.start();
  }

  abort(): void {
    console.log(`%c${LOG}`, "color: #a855f7", "⏹ Aborted");
    this.upload?.abort();
    this.upload = null;
  }

  private extractMediaId(): string | null {
    // The stream-media-id is typically in the URL path
    // e.g., https://upload.videodelivery.net/tus/abc123
    const url = this.upload?.url;
    if (!url) return null;
    const parts = url.split("/");
    // The media ID is typically the last segment
    return parts[parts.length - 1] || null;
  }
}
