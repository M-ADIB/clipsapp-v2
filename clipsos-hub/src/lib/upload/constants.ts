/**
 * Upload system constants
 */

/** R2 chunk size: 10 MB default (must be >= 5 MB for S3 multipart) */
export const R2_CHUNK_SIZE = 10 * 1024 * 1024;

/** Minimum chunk size for adaptive chunking: 5 MB (S3 minimum) */
export const R2_MIN_CHUNK_SIZE = 5 * 1024 * 1024;

/** Maximum chunk size for adaptive chunking: 100 MB (fast connections) */
export const R2_MAX_CHUNK_SIZE = 100 * 1024 * 1024;

/** Stream TUS chunk size: 50 MB (aligned to 256 KiB multiples) */
export const STREAM_CHUNK_SIZE = 50 * 1024 * 1024;

/** Max concurrent uploads in the queue */
export const MAX_CONCURRENT_UPLOADS = 2;

/** Max concurrent R2 parts uploading in parallel per file */
export const MAX_CONCURRENT_R2_PARTS = 3;

/** Max retry attempts per chunk/part */
export const MAX_RETRIES = 3;

/** Base retry delay in ms (doubles each attempt) */
export const RETRY_BASE_DELAY_MS = 1000;

/** Max retry delay in ms */
export const RETRY_MAX_DELAY_MS = 16000;

/** Maximum allowed file size: 10 GB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;

/** File size threshold for "large file" advisory: 1 GB */
export const LARGE_FILE_WARNING_THRESHOLD = 1 * 1024 * 1024 * 1024;

/** Upload session statuses */
export const UPLOAD_STATUS = {
  INITIALIZING: "initializing",
  UPLOADING: "uploading",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  PAUSED: "paused",
} as const;

/** Accepted video MIME types */
export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "video/mpeg",
  "video/x-m4v",
  "video/3gpp",
] as const;

/** Human-readable file extensions for the accept attribute */
export const ACCEPTED_VIDEO_EXTENSIONS = ".mp4,.mov,.webm,.avi,.mkv,.mpeg,.m4v,.3gp";
