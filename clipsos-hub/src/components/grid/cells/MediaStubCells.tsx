/**
 * Media cells for the videos grid — Video, Thumbnail, Review.
 *
 * The Video cell renders at a 9:16 aspect ratio (short-form portrait)
 * and uses Cloudflare Stream's hosted thumbnail + iframe player when
 * a `video_cloudflare_id` is present on the row.
 *
 * The Thumbnail cell ONLY shows user-uploaded thumbnails from the
 * `thumbnail_versions` table — NOT auto-generated Cloudflare thumbnails.
 * When no user thumbnail exists, it shows an upload placeholder that
 * lets the user pick an image file.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, MessageSquare, Play, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoPreviewModal } from "@/components/video/preview";
import { ThumbnailPreviewDialog } from "@/components/video/thumbnail";
import { useThumbnailVersions } from "@/components/video/thumbnail/hooks/use-thumbnail-versions";
import { useUploadThumbnail } from "@/components/video/thumbnail/hooks/use-upload-thumbnail";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { useUploadManager } from "@/hooks/useUploadManager";
import { useGridQueue } from "../core/GridQueueContext";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Shared 9:16 frame                                                   */
/* ------------------------------------------------------------------ */

/**
 * The grid renders cells inside fixed-width <td> elements (~110px).
 * A 9:16 frame at width 36px = 64px tall, which fits comfortably
 * inside the regular density row height (48px) when centered with
 * `overflow-visible` and a small vertical inset.
 */
function getFrameClass(density?: "compact" | "regular" | "comfortable", isEmpty = false) {
  if (density === "compact") {
    return isEmpty
      ? "flex h-[36px] w-[20px] flex-col items-center justify-center rounded-sm border border-dashed border-border-strong text-foreground-disabled"
      : "relative flex h-[36px] w-[20px] items-center justify-center overflow-hidden rounded-sm";
  }
  if (density === "comfortable") {
    return isEmpty
      ? "flex h-[78px] w-[44px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong text-foreground-disabled"
      : "relative flex h-[78px] w-[44px] items-center justify-center overflow-hidden rounded-lg";
  }
  // Default to regular
  return isEmpty
    ? "flex h-[54px] w-[30px] flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-border-strong text-foreground-disabled"
    : "relative flex h-[54px] w-[30px] items-center justify-center overflow-hidden rounded-md";
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

interface RowMedia {
  id?: string | null;
  video_cloudflare_id?: string | null;
  video_playback_url?: string | null;
  video_thumbnail_url?: string | null;
  video_title?: string | null;
}

function getCloudflareId(row: RowMedia | undefined): string | null {
  if (!row) return null;
  if (row.video_cloudflare_id) return row.video_cloudflare_id;
  // Try to derive from a stream URL of the form
  //   https://customer-XXXX.cloudflarestream.com/<id>/manifest/video.m3u8
  const url = row.video_playback_url ?? row.video_thumbnail_url;
  if (!url) return null;
  const m = url.match(/cloudflarestream\.com\/([a-f0-9]{20,})/i);
  return m?.[1] ?? null;
}

function thumbnailUrlFor(row: RowMedia | undefined): string | null {
  if (!row) return null;
  if (row.video_thumbnail_url) return row.video_thumbnail_url;
  const id = getCloudflareId(row);
  if (!id) return null;
  // Cloudflare iframe.videodelivery.net thumbnail endpoint
  return `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg?height=200`;
}

function iframeSrcFor(id: string): string {
  return `https://iframe.videodelivery.net/${id}?autoplay=true&muted=false`;
}

/* ------------------------------------------------------------------ */
/* Video cell — 9:16 poster + click-to-play modal                      */
/* ------------------------------------------------------------------ */

interface VideoCellProps {
  row?: RowMedia;
  density?: "compact" | "regular" | "comfortable";
}

export function VideoCell({ row, density }: VideoCellProps) {
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const queueCtx = useGridQueue();
  const { jobs } = useUploadManager();
  const rowId = row?.id ?? null;
  // Track the active video id locally so prev/next inside the modal can
  // swap between rows of the visible grid.
  const [activeId, setActiveId] = useState<string | null>(rowId);
  useEffect(() => {
    if (open && rowId) setActiveId(rowId);
  }, [open, rowId]);

  const id = getCloudflareId(row);
  const poster = thumbnailUrlFor(row);
  const title = row?.video_title || "Video preview";

  // Check if this row has an active upload job
  const activeJob = rowId
    ? jobs.find(
        (j) => j.videoId === rowId && (j.status === "uploading" || j.status === "processing"),
      )
    : null;

  const queue =
    queueCtx && activeId
      ? (() => {
          const idx = queueCtx.ids.indexOf(activeId);
          if (idx === -1) return undefined;
          return {
            ids: queueCtx.ids,
            currentIndex: idx,
            onNavigate: (next: number) => {
              const nextId = queueCtx.ids[next];
              if (nextId) setActiveId(nextId);
            },
          };
        })()
      : undefined;

  // Upload in progress — show spinner with progress
  if (activeJob) {
    const pct =
      activeJob.status === "uploading" && typeof activeJob.progress === "number"
        ? Math.round(activeJob.progress * 100)
        : null;
    const loaderSize = density === "compact" ? "h-3 w-3" : density === "comfortable" ? "h-6 w-6" : "h-4 w-4";
    const textClass = density === "comfortable" ? "text-[9px]" : "text-[7px]";
    return (
      <div className="flex h-full items-center justify-center px-1">
        <div
          className={cn(
            getFrameClass(density, false),
            "border border-primary/30 bg-primary/[0.06]"
          )}
          title={
            activeJob.status === "processing"
              ? "Processing video…"
              : `Uploading${pct != null ? ` ${pct}%` : "…"}`
          }
        >
          <Loader2 className={cn("animate-spin text-primary", loaderSize)} />
          {density !== "compact" && (
            <span className={cn("absolute bottom-0.5 font-semibold tabular-nums text-primary", textClass)}>
              {activeJob.status === "processing" ? "Processing" : pct != null ? `${pct}%` : "…"}
            </span>
          )}
          {density === "compact" && pct != null && (
            <span className="absolute bottom-0.5 text-[6px] font-semibold tabular-nums text-primary">
              {pct}%
            </span>
          )}
        </div>
      </div>
    );
  }

  if (!id) {
    const uploadIconSize = density === "compact" ? "h-2.5 w-2.5" : density === "comfortable" ? "h-4 w-4" : "h-3 w-3";
    const uploadTextClass = density === "comfortable" ? "text-[10px]" : "text-[8px]";
    return (
      <>
        <div className="flex h-full items-center justify-center px-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (rowId) setUploadOpen(true);
            }}
            className={cn(
              getFrameClass(density, true),
              "cursor-pointer transition-colors hover:border-primary hover:text-primary"
            )}
            title={rowId ? "Upload video" : "No video ID"}
          >
            <Upload className={uploadIconSize} />
            {density !== "compact" && (
              <span className={cn("uppercase tracking-wide", uploadTextClass)}>Upload</span>
            )}
          </button>
        </div>

        {rowId && (
          <UploadDropzone videoId={rowId} asDialog open={uploadOpen} onOpenChange={setUploadOpen} />
        )}
      </>
    );
  }

  const playIconSize = density === "compact" ? "h-3 w-3" : density === "comfortable" ? "h-6 w-6" : "h-4 w-4";

  return (
    <>
      <div className="flex h-full items-center justify-center px-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className={cn(
            getFrameClass(density, false),
            "group bg-black/60 transition hover:ring-2 hover:ring-primary/60"
          )}
          aria-label={`Play ${title}`}
        >
          {poster ? (
            <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : null}
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-90 transition group-hover:opacity-100">
            <Play className={cn("fill-white text-white", playIconSize)} />
          </span>
        </button>
      </div>

      <VideoPreviewModal
        open={open}
        onOpenChange={setOpen}
        videoId={activeId}
        mode="review"
        queue={queue}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Thumbnail cell — user-uploaded only + click to upload/review         */
/* ------------------------------------------------------------------ */

interface ThumbnailCellProps {
  row?: RowMedia;
  density?: "compact" | "regular" | "comfortable";
}

export function ThumbnailCell({ row, density }: ThumbnailCellProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const title = row?.video_title || "Thumbnail";
  const videoId = row?.id ?? null;

  // Fetch user-uploaded thumbnail versions — NOT auto-generated
  const { currentVersion, isLoading: versionsLoading } = useThumbnailVersions(videoId);
  const uploadMutation = useUploadThumbnail();

  // The URL is ONLY from user-uploaded thumbnail_versions, never from video_thumbnail_url
  const userUploadedUrl = currentVersion?.thumbnail_url ?? null;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !videoId) return;

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.");
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }

      uploadMutation.mutate(
        { videoId, file },
        {
          onSuccess: () => toast.success("Thumbnail uploaded!"),
          onError: (err) => toast.error(err instanceof Error ? err.message : "Upload failed"),
        },
      );

      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [videoId, uploadMutation],
  );

  // Upload in progress
  if (uploadMutation.isPending) {
    const loaderSize = density === "compact" ? "h-3 w-3" : density === "comfortable" ? "h-6 w-6" : "h-4 w-4";
    const textClass = density === "comfortable" ? "text-[9px]" : "text-[7px]";
    return (
      <div className="flex h-full items-center justify-center px-1">
        <div
          className={cn(
            getFrameClass(density, false),
            "border border-primary/30 bg-primary/[0.06]"
          )}
          title="Uploading thumbnail…"
        >
          <Loader2 className={cn("animate-spin text-primary", loaderSize)} />
          {density !== "compact" && (
            <span className={cn("absolute bottom-0.5 font-semibold text-primary", textClass)}>
              Uploading
            </span>
          )}
        </div>
      </div>
    );
  }

  // No user-uploaded thumbnail — show upload placeholder
  if (!userUploadedUrl) {
    const uploadIconSize = density === "compact" ? "h-2.5 w-2.5" : density === "comfortable" ? "h-4 w-4" : "h-3 w-3";
    const uploadTextClass = density === "comfortable" ? "text-[10px]" : "text-[8px]";
    return (
      <>
        <div className="flex h-full items-center justify-center px-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (videoId) fileInputRef.current?.click();
            }}
            className={cn(
              getFrameClass(density, true),
              "cursor-pointer transition-colors hover:border-primary hover:text-primary"
            )}
            title={videoId ? "Upload thumbnail" : "No video ID"}
          >
            <Upload className={uploadIconSize} />
            {density !== "compact" && (
              <span className={cn("uppercase tracking-wide", uploadTextClass)}>Upload</span>
            )}
          </button>
        </div>

        {/* Hidden file input */}
        {videoId && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileSelect}
          />
        )}
      </>
    );
  }

  // User-uploaded thumbnail exists — show it with click to review
  return (
    <>
      <div className="flex h-full items-center justify-center px-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className={cn(
            getFrameClass(density, false),
            "bg-black/60 hover:ring-2 hover:ring-primary/60"
          )}
          aria-label={`View thumbnail for ${title}`}
        >
          <img src={userUploadedUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        </button>
      </div>

      {videoId && <ThumbnailPreviewDialog videoId={videoId} open={open} onOpenChange={setOpen} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Review cell — unchanged from previous wave                          */
/* ------------------------------------------------------------------ */

interface ReviewProps {
  commentCount?: number;
  status?: string | null;
  density?: "compact" | "regular" | "comfortable";
}

export function ReviewStubCell({ commentCount = 0, status, density }: ReviewProps) {
  const tone =
    status === "approved"
      ? "bg-success/15 text-success"
      : status === "revisions_requested" || status === "revision"
        ? "bg-warning/15 text-warning"
        : "bg-foreground/[0.06] text-foreground-muted";

  // Density-specific classes
  const containerClass = density === "compact"
    ? "px-2 gap-1"
    : density === "comfortable"
      ? "px-4 gap-2.5"
      : "px-3 gap-2";

  const badgeClass = density === "compact"
    ? "px-1.5 py-0 text-[9px]"
    : density === "comfortable"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[10px]";

  const commentsClass = density === "compact"
    ? "text-[10px]"
    : density === "comfortable"
      ? "text-sm"
      : "text-[11px]";

  const commentIconSize = density === "compact"
    ? "h-2.5 w-2.5"
    : density === "comfortable"
      ? "h-3.5 w-3.5"
      : "h-3 w-3";

  return (
    <div className={cn("flex h-full items-center", containerClass)}>
      <span className={cn("rounded-full font-medium whitespace-nowrap", badgeClass, tone)}>
        {status === "approved"
          ? "Approved"
          : status === "revisions_requested" || status === "revision"
            ? "Needs revision"
            : "Pending"}
      </span>
      <span className={cn("flex items-center gap-0.5 text-foreground-disabled shrink-0 select-none", commentsClass)}>
        <MessageSquare className={commentIconSize} />
        {commentCount}
      </span>
    </div>
  );
}
