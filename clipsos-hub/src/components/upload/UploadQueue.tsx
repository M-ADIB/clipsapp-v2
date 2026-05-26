/**
 * UploadQueue — Global upload queue panel (floating/collapsible).
 * Shows all active, queued, completed, and failed uploads.
 * Includes clear-all button and offline status awareness.
 */

import { useState } from "react";
import { Upload, ChevronDown, ChevronUp, Minimize2, Trash2, WifiOff, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUploadManager } from "@/hooks/useUploadManager";
import { UploadProgressBar } from "./UploadProgressBar";
import { UploadHistory } from "./UploadHistory";
import { cn } from "@/lib/utils";

export function UploadQueue() {
  const {
    jobs,
    pause,
    resume,
    cancel,
    retry,
    remove,
    clearCompleted,
    hasActiveUploads,
    completedCount,
    isOnline,
  } = useUploadManager();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Don't render if no jobs
  if (jobs.length === 0) return null;

  const activeJobs = jobs.filter(
    (j) =>
      j.status === "uploading" ||
      j.status === "processing" ||
      j.status === "initializing" ||
      j.status === "paused",
  );
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed" || j.status === "cancelled");

  if (isMinimized) {
    // Calculate overall progress for the pill
    const avgProgress =
      activeJobs.length > 0
        ? Math.round(
            activeJobs.reduce((sum, j) => sum + j.progress.overallPercent, 0) / activeJobs.length,
          )
        : 0;

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="relative flex items-center gap-2 rounded-full shadow-lg overflow-hidden"
          size="sm"
          aria-label={
            hasActiveUploads
              ? `Upload progress: ${avgProgress}%, ${activeJobs.length} active`
              : `View ${jobs.length} uploads`
          }
        >
          {/* Mini progress bar background */}
          {hasActiveUploads && (
            <div
              className="absolute inset-0 bg-primary/20 transition-all duration-500"
              style={{ width: `${avgProgress}%` }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {!isOnline && <WifiOff className="h-3.5 w-3.5 text-amber-300" />}
            <Upload className="h-4 w-4" />
            {hasActiveUploads
              ? `${avgProgress}% (${activeJobs.length})`
              : `Uploads (${jobs.length})`}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Upload queue"
      className={cn(
        "fixed bottom-4 right-4 z-50 w-96 overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all",
        isCollapsed ? "max-h-12" : "max-h-[70vh]",
      )}
    >
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? "Expand upload queue" : "Collapse upload queue"}
        className="flex cursor-pointer items-center gap-2 border-b border-border bg-muted/50 px-3 py-2.5"
        onClick={() => setIsCollapsed(!isCollapsed)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }
        }}
      >
        {!isOnline ? (
          <WifiOff className="h-4 w-4 text-amber-500" />
        ) : (
          <Upload className="h-4 w-4 text-primary" />
        )}
        <span className="flex-1 text-sm font-medium">
          {!isOnline
            ? "Offline — uploads paused"
            : hasActiveUploads
              ? `Uploading ${activeJobs.length} file${activeJobs.length === 1 ? "" : "s"}`
              : `${jobs.length} upload${jobs.length === 1 ? "" : "s"}`}
        </span>
        <div className="flex items-center gap-0.5">
          {/* Clear completed button */}
          {completedCount > 0 && !isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                clearCompleted();
              }}
              aria-label="Clear completed uploads"
              title="Clear completed"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            aria-label="Minimize upload queue"
            title="Minimize"
          >
            <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          {isCollapsed ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          {/* Offline banner */}
          {!isOnline && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2"
            >
              <WifiOff className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-hidden="true" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No internet connection. Uploads will resume automatically.
              </p>
            </div>
          )}

          {/* Active uploads */}
          {activeJobs.map((job) => (
            <UploadProgressBar
              key={job.id}
              job={job}
              onPause={pause}
              onResume={resume}
              onCancel={cancel}
              onRetry={retry}
              onRemove={remove}
            />
          ))}

          {/* Failed uploads */}
          {failedJobs.map((job) => (
            <UploadProgressBar
              key={job.id}
              job={job}
              onPause={pause}
              onResume={resume}
              onCancel={cancel}
              onRetry={retry}
              onRemove={remove}
            />
          ))}

          {/* Completed uploads */}
          {completedJobs.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Completed ({completedJobs.length})
                </span>
                <div className="flex-1 border-t border-border" />
              </div>
              {completedJobs.map((job) => (
                <UploadProgressBar
                  key={job.id}
                  job={job}
                  onPause={pause}
                  onResume={resume}
                  onCancel={cancel}
                  onRetry={retry}
                  onRemove={remove}
                />
              ))}
            </>
          )}

          {/* View History link */}
          <div className="flex justify-center pt-2 pb-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsHistoryOpen(true)}
              aria-label="View upload history"
            >
              <History className="mr-1.5 h-3 w-3" aria-hidden="true" />
              View History
            </Button>
          </div>
        </div>
      )}

      {/* Upload History Sheet */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle>Upload History</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-60px)] overflow-auto">
            <UploadHistory />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
