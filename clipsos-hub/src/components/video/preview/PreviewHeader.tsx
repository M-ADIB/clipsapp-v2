/**
 * PreviewHeader — Frame.io-style header bar.
 *
 * Desktop: solid bar in document flow (not overlaying the video).
 *   Left:  X close | title | V1 badge | version selector | + New Version
 *   Right: status workflow | download | share
 *
 * Mobile: absolute overlay with gradient (legacy behavior preserved).
 */
import { Download, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewHeaderProps {
  title: string | null;
  isMobile: boolean;
  isVisible: boolean;
  isDownloading: boolean;
  canDownload: boolean;
  onClose: () => void;
  onDownload: () => void;
  /** Slot rendered inside the right-aligned action cluster, before
   *  Download and Close (e.g. version selector, share button). */
  rightActions?: React.ReactNode;
  /** Optional sub-row rendered under the main bar (e.g. status workflow).
   *  On desktop this is inline in the right side of the header. */
  workflow?: React.ReactNode;
  /** Version selector slot — on desktop rendered left-side after the title. */
  versionSelector?: React.ReactNode;
}

export function PreviewHeader({
  title,
  isMobile,
  isVisible,
  isDownloading,
  canDownload,
  onClose,
  onDownload,
  rightActions,
  workflow,
  versionSelector,
}: PreviewHeaderProps) {
  /* ─── Mobile: keep the old overlay behavior ────────────────────────── */
  if (isMobile) {
    return (
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/90 to-transparent transition-opacity duration-300",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <h2 className="min-w-0 flex-1 truncate text-xs font-medium text-white">
            {title ?? "Untitled video"}
          </h2>
          <div className="flex items-center gap-1">
            {rightActions}
            {canDownload && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isDownloading}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                className="h-8 w-8 text-white hover:bg-white/15"
                aria-label={isDownloading ? "Downloading…" : "Download video"}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="h-8 w-8 text-white hover:bg-white/15"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {workflow && <div className="flex justify-center px-3 pb-2">{workflow}</div>}
      </div>
    );
  }

  /* ─── Desktop: solid bar in document flow ──────────────────────────── */
  return (
    <div className="z-20 flex items-center gap-3 border-b border-white/10 bg-black px-4 py-2">
      {/* Left cluster: close + title + version */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="h-8 w-8 shrink-0 text-white hover:bg-white/15"
        aria-label="Close preview"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-sm font-medium text-white">{title ?? "Untitled video"}</h2>
        {versionSelector}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right cluster: workflow + actions + download */}
      <div className="flex items-center gap-2">
        {workflow}
        {rightActions}
        {canDownload && (
          <Button
            variant="ghost"
            size="icon"
            disabled={isDownloading}
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="h-8 w-8 text-white hover:bg-white/15"
            aria-label={isDownloading ? "Downloading…" : "Download video"}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
