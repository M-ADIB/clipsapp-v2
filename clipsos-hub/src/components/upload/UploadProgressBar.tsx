/**
 * UploadProgressBar — Single real progress bar for video uploads.
 * Shows one combined progress bar (weighted average of Stream + R2),
 * with file info, ETA, speed, and action buttons.
 *
 * Accessibility:
 * - Uses role="article" for each upload item with aria-label
 * - Progress bar has aria-valuenow, aria-valuemin, aria-valuemax
 * - Action buttons have aria-label (not just title)
 * - Status changes announced via aria-live region
 */

import { Pause, Play, X, RotateCcw, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { UploadJob } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface UploadProgressBarProps {
  job: UploadJob;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

function formatEta(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return "";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <Check className="h-4 w-4 text-green-500" aria-hidden="true" />;
    case "failed":
    case "cancelled":
      return <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />;
    case "uploading":
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />;
    case "paused":
      return <Pause className="h-4 w-4 text-amber-500" aria-hidden="true" />;
    default:
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "initializing":
      return "Preparing…";
    case "uploading":
      return "Uploading";
    case "processing":
      return "Finalizing…";
    case "completed":
      return "Complete";
    case "paused":
      return "Paused";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function formatSpeed(bytesPerSec: number | null): string {
  if (bytesPerSec === null || bytesPerSec <= 0) return "";
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

export function UploadProgressBar({
  job,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onRemove,
}: UploadProgressBarProps) {
  const isActive = job.status === "uploading" || job.status === "processing";
  const isDone = job.status === "completed";
  const isFailed = job.status === "failed" || job.status === "cancelled";
  const isPaused = job.status === "paused";
  const isInit = job.status === "initializing";
  const showBar = isActive || isPaused || isInit;

  const speedStr = formatSpeed(job.progress.speedBytesPerSec);
  const etaStr = formatEta(job.progress.etaSeconds);

  // Build accessible description for screen readers
  const ariaDescription = [
    job.file.name,
    formatFileSize(job.file.size),
    statusLabel(job.status),
    isActive && speedStr ? speedStr : null,
    isActive && etaStr ? `${etaStr} remaining` : null,
    isFailed && job.error ? job.error : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role="article"
      aria-label={`Upload: ${job.file.name}`}
      className={cn(
        "rounded-lg border border-border bg-card p-3 transition-all",
        isDone && "border-green-500/30 bg-green-500/5",
        isFailed && "border-destructive/30 bg-destructive/5",
      )}
    >
      {/* Top row: icon, filename, size, actions */}
      <div className="flex items-center gap-2">
        <StatusIcon status={job.status} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{job.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(job.file.size)}
            {" • "}
            {statusLabel(job.status)}
            {isActive && speedStr ? ` • ${speedStr}` : ""}
            {isFailed && job.error ? ` — ${job.error}` : ""}
          </p>
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center gap-0.5"
          role="toolbar"
          aria-label={`Actions for ${job.file.name}`}
        >
          {isActive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPause(job.id)}
              aria-label={`Pause upload of ${job.file.name}`}
              title="Pause"
            >
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
          {isPaused && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onResume(job.id)}
              aria-label={`Resume upload of ${job.file.name}`}
              title="Resume"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
          {isFailed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onRetry(job.id)}
              aria-label={`Retry upload of ${job.file.name}`}
              title="Retry"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
          {(isActive || isPaused) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onCancel(job.id)}
              aria-label={`Cancel upload of ${job.file.name}`}
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
          {(isDone || isFailed) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onRemove(job.id)}
              aria-label={`Remove ${job.file.name} from list`}
              title="Remove"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {/* Single real progress bar with ARIA */}
      {showBar && (
        <div className="mt-2 flex items-center gap-2">
          <Progress
            value={job.progress.overallPercent}
            className="h-2 flex-1"
            aria-label={`Upload progress for ${job.file.name}`}
          />
          <span
            className="w-24 text-right text-xs tabular-nums text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {job.progress.overallPercent}%{isActive && etaStr ? ` • ${etaStr}` : ""}
          </span>
        </div>
      )}

      {/* Screen reader live region for status changes */}
      <span className="sr-only" aria-live="assertive">
        {ariaDescription}
      </span>
    </div>
  );
}
