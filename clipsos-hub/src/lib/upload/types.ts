/**
 * Upload system shared types
 */

export type UploadTrackStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "skipped"
  | "completing";

export type OverallUploadStatus =
  | "initializing"
  | "uploading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "paused";

export interface UploadSessionInit {
  session_id: string;
  tus_url: string | null;
  stream_media_id: string | null;
  r2_upload_id: string | null;
  r2_key: string;
  r2_parts_total: number;
  r2_chunk_size: number;
}

export interface R2PartResult {
  part_number: number;
  etag: string;
}

export interface UploadProgress {
  /** 0-100 */
  streamPercent: number;
  /** 0-100 */
  r2Percent: number;
  /** Combined weighted average */
  overallPercent: number;
  /** Bytes uploaded so far (both tracks) */
  bytesUploaded: number;
  /** Total file size */
  bytesTotal: number;
  /** Estimated time remaining in seconds */
  etaSeconds: number | null;
  /** Current upload speed in bytes per second */
  speedBytesPerSec: number | null;
}

export interface UploadJob {
  id: string;
  file: File;
  videoId: string;
  versionId: string;
  sessionId: string | null;
  status: OverallUploadStatus;
  progress: UploadProgress;
  error: string | null;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;

  // Internal tracking
  tusUrl: string | null;
  streamMediaId: string | null;
  r2UploadId: string | null;
  r2Key: string | null;
  r2PartsTotal: number;
  r2CompletedParts: R2PartResult[];
}

export type UploadManagerListener = (jobs: UploadJob[]) => void;

export interface InitializeUploadParams {
  video_id: string;
  version_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface CompleteUploadParams {
  session_id: string;
  action?: "complete" | "cancel";
  r2_parts?: R2PartResult[];
  stream_status?: string;
  stream_media_id?: string;
  stream_progress?: number;
}
