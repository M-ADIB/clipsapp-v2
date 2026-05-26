/**
 * ThumbnailPreviewDialog — lightweight image review dialog.
 *
 * Opens when a user clicks a video's thumbnail. Displays the full-resolution
 * thumbnail with annotations, a comment thread sidebar, version switching,
 * and Approve / Send Revision action buttons.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Header:  [Video Title]   V3 ▾   │  [✓ Approve] [↩ Send]  X│
 * ├─────────────────────────────┬───────────────────────────────┤
 * │   Thumbnail Image           │  Comments sidebar             │
 * │   + Annotation overlay      │  (scrollable list + composer) │
 * ├─────────────────────────────┴───────────────────────────────┤
 * │  Version strip:  v1  ·  v2  ·  ★ v3 (current)              │
 * └─────────────────────────────────────────────────────────────┘
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Image as ImageIcon, Loader2, RotateCcw, Star, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { ThumbnailViewer } from "./ThumbnailViewer";
import { ThumbnailCommentsSidebar } from "./ThumbnailCommentsSidebar";
import { ThumbnailVersionSelector } from "./ThumbnailVersionSelector";
import { useThumbnailVersions, getThumbnailVersionLabel } from "./hooks/use-thumbnail-versions";
import { useThumbnailComments } from "./hooks/use-thumbnail-comments";
import { useUploadThumbnail } from "./hooks/use-upload-thumbnail";

// Status IDs for the action buttons
const STATUS_APPROVED = "1526effe-981f-4b94-a136-9be56b0c25e0";
const STATUS_REVISIONS_REQUESTED = "0938c541-dde1-4fcb-ba30-8e6ca6105ea1";

const MODERATOR_ROLES = new Set(["owner", "manager", "senior_editor", "content_creator"]);

interface ThumbnailPreviewDialogProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThumbnailPreviewDialog({
  videoId,
  open,
  onOpenChange,
}: ThumbnailPreviewDialogProps) {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const isModerator = MODERATOR_ROLES.has(role ?? "");
  const currentUserId = user?.id ?? null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadThumbnail();

  const handleThumbnailFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !videoId) return;

      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }

      uploadMutation.mutate(
        { videoId, file },
        {
          onSuccess: () => toast.success("New thumbnail version uploaded!"),
          onError: (err) => toast.error(err instanceof Error ? err.message : "Upload failed"),
        },
      );
      e.target.value = "";
    },
    [videoId, uploadMutation],
  );

  // ── Fetch video title + fallback thumbnail ──────────────────────
  const { data: video } = useQuery({
    queryKey: ["video-meta", videoId],
    enabled: open && !!videoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, video_title, video_thumbnail_url")
        .eq("id", videoId)
        .single();
      if (error) throw error;
      return data as {
        id: string;
        video_title: string;
        video_thumbnail_url: string | null;
      };
    },
  });

  // Fallback thumbnail from the videos table itself
  const fallbackThumbnailUrl = video?.video_thumbnail_url ?? null;

  // ── Thumbnail versions ──────────────────────────────────────────
  const {
    versions,
    currentVersion,
    isLoading: versionsLoading,
  } = useThumbnailVersions(open ? videoId : null);

  // Track the selected version (defaults to current)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Reset selection when dialog opens or versions change
  useEffect(() => {
    if (open && currentVersion) {
      setSelectedVersionId(currentVersion.id);
    }
  }, [open, currentVersion]);

  const selectedVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId) ?? currentVersion,
    [versions, selectedVersionId, currentVersion],
  );

  // ── Comments ────────────────────────────────────────────────────
  const {
    threads,
    isLoading: commentsLoading,
    addComment,
    handleAddComment,
    handleReply,
    handleResolve,
    handleDelete,
  } = useThumbnailComments(open ? videoId : null, selectedVersionId);

  // ── Status mutations ────────────────────────────────────────────
  const approveVideo = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("videos")
        .update({ status_id: STATUS_APPROVED } as never)
        .eq("id", videoId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thumbnail approved");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video-meta", videoId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    },
  });

  const requestRevision = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("videos")
        .update({ status_id: STATUS_REVISIONS_REQUESTED } as never)
        .eq("id", videoId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Revision requested");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video-meta", videoId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to request revision");
    },
  });

  // Wrap addComment for annotation anchoring
  const addCommentForAnnotation = useCallback(
    async (input: { comment: string; versionId?: string | null }) => {
      return addComment.mutateAsync({
        comment: input.comment,
        isInternal: false,
      });
    },
    [addComment],
  );

  const videoTitle = video?.video_title ?? "Thumbnail Preview";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-[95vw] h-[85vh] max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden"
        aria-describedby="thumbnail-dialog-desc"
      >
        {/* Accessible title + description */}
        <DialogTitle className="sr-only">{videoTitle}</DialogTitle>
        <DialogDescription id="thumbnail-dialog-desc" className="sr-only">
          Review thumbnail for {videoTitle}
        </DialogDescription>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 pl-4 pr-12 py-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-sm font-semibold truncate">{videoTitle}</h2>
            <ThumbnailVersionSelector
              versions={versions}
              selectedId={selectedVersionId}
              onSelect={setSelectedVersionId}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Upload new version button */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploadMutation.isPending ? "Uploading..." : "Upload New"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleThumbnailFileSelect}
            />

            {isModerator && (
              <>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => approveVideo.mutate()}
                  disabled={approveVideo.isPending}
                >
                  <Check className="h-3.5 w-3.5" />
                  {approveVideo.isPending ? "Approving..." : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
                  onClick={() => requestRevision.mutate()}
                  disabled={requestRevision.isPending}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {requestRevision.isPending ? "Sending..." : "Send Revision"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Body: Image + Comments ──────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Thumbnail viewer */}
          <div className="flex-1 min-w-0 p-3">
            {selectedVersion ? (
              <ThumbnailViewer
                thumbnailUrl={selectedVersion.thumbnail_url}
                videoId={videoId}
                versionId={selectedVersionId}
                canAnnotate={isModerator}
                addCommentAsync={addCommentForAnnotation}
              />
            ) : versionsLoading ? (
              <div className="flex h-full items-center justify-center text-foreground-muted">
                Loading thumbnail...
              </div>
            ) : fallbackThumbnailUrl ? (
              /* No versioned thumbnails — show the video's own thumbnail */
              <ThumbnailViewer
                thumbnailUrl={fallbackThumbnailUrl}
                videoId={videoId}
                versionId={null}
                canAnnotate={isModerator}
                addCommentAsync={addCommentForAnnotation}
              />
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-foreground-muted gap-3">
                <ImageIcon className="h-10 w-10 opacity-30" />
                <p className="text-sm">No thumbnail uploaded yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {uploadMutation.isPending ? "Uploading..." : "Upload Thumbnail"}
                </Button>
              </div>
            )}
          </div>

          {/* Right: Comments sidebar */}
          <div className="w-[320px] shrink-0">
            <ThumbnailCommentsSidebar
              threads={threads}
              isLoading={commentsLoading}
              currentUserId={currentUserId}
              canComment={true}
              canModerate={isModerator}
              onAdd={handleAddComment}
              onReply={handleReply}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* ── Footer: Version strip ───────────────────────────────── */}
        {versions.length > 1 && (
          <div className="flex items-center gap-1 px-4 py-2.5 border-t border-border/60 shrink-0 overflow-x-auto">
            <span className="text-xs text-foreground-muted mr-2 shrink-0">Versions:</span>
            {versions.map((v) => {
              const isSelected = v.id === selectedVersionId;
              return (
                <Tooltip key={v.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setSelectedVersionId(v.id)}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-surface-raised text-foreground-muted hover:bg-surface-raised/80 hover:text-foreground",
                      )}
                      aria-label={`Switch to ${getThumbnailVersionLabel(v)}${v.is_current ? " (current)" : ""}`}
                      aria-pressed={isSelected}
                    >
                      {v.is_current && <Star className="h-3 w-3 fill-current" />}
                      {getThumbnailVersionLabel(v)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {getThumbnailVersionLabel(v)}
                    {v.is_current && " (current)"}
                    {v.version_notes && ` — ${v.version_notes}`}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
