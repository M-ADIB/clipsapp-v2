/**
 * VideoPreviewModal — unified preview/review modal for all video surfaces.
 *
 * Desktop layout (Frame.io-style):
 *   [Header bar — solid, in document flow]
 *   [Video player (flex-1) | Comments sidebar]
 *   [Controls bar — timeline + left/center/right groups]
 *
 * Mobile layout:
 *   [Header overlay]
 *   [Video player (flex-1)]
 *   [Bottom sheet (comments + composer)]
 *   [Controls overlay at bottom of player]
 *
 * Business logic is delegated to hooks:
 *  • usePreviewState      – version/trial selection, player, controls
 *  • usePreviewComments   – filtered threads, add/reply/resolve/delete
 *  • usePreviewAnnotations – drawing state, save workflow
 *  • useQueueNavigation   – prev/next, swipe, keyboard shortcuts
 */
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { useIsMobile } from "@/hooks/use-mobile";
import { useVideo, useUpdateVideo } from "@/hooks/use-videos";
import { useStatuses } from "@/hooks/use-lookups";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { ShareDialog, canShare } from "@/components/sharing/ShareDialog";
import { useVideoDownload } from "./hooks/use-video-download";

import type { TimeDisplayFormat } from "./lib/format";
import type { GuideAspect, ZoomMode } from "./ViewSettingsPopover";

import { PreviewHeader } from "./PreviewHeader";
import { PreviewPlayer } from "./PreviewPlayer";
import { PlayerControls, type ToolAction } from "./PlayerControls";
import { CommentTimelineMarkers } from "./CommentTimelineMarkers";
import { CommentsSidebar } from "./comments/CommentsSidebar";
import { CommentsBottomSheet } from "./comments/CommentsBottomSheet";
import { FloatingCommentCard } from "./comments/FloatingCommentCard";
import { VoiceNoteRecorder } from "./comments/VoiceNoteRecorder";
import { AnnotationCanvas } from "./annotations/AnnotationCanvas";
import { AnnotationOverlay } from "./annotations/AnnotationOverlay";
import { AnnotationToolbar } from "./annotations/AnnotationToolbar";
import { VersionSelector } from "./VersionSelector";
import { SectionMarkerInput } from "./SectionMarkerInput";
import { StatusWorkflowBar } from "./workflow/StatusWorkflowBar";
import type { StatusSlug } from "./workflow/status-workflow";

import { usePreviewState } from "./hooks/use-preview-state";
import { usePreviewComments } from "./hooks/use-preview-comments";
import { usePreviewAnnotations } from "./hooks/use-preview-annotations";
import { useQueueNavigation } from "./hooks/use-queue-navigation";

export type VideoPreviewMode = "preview" | "review" | "guest";

interface VideoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string | null;
  mode?: VideoPreviewMode;
  canDownload?: boolean;
  canComment?: boolean;
  queue?: {
    ids: string[];
    currentIndex: number;
    onNavigate: (nextIndex: number) => void;
  };
}

const MODERATOR_ROLES = new Set(["owner", "manager", "senior_editor", "content_creator", "editor"]);

export function VideoPreviewModal({
  open,
  onOpenChange,
  videoId,
  mode = "preview",
  canDownload,
  canComment,
  queue,
}: VideoPreviewModalProps) {
  const isMobile = useIsMobile();
  const { user, role } = useAuth();
  const { data: video } = useVideo(open ? (videoId ?? undefined) : undefined);

  /* ─── Preview state ─────────────────────────────────────────────── */
  const preview = usePreviewState({ open, videoId, isMobile, video });
  const {
    containerRef,
    versions,
    setCurrentVersion,
    selectedVersionId,
    setSelectedVersionId,
    trials,
    trialsLoading,
    activeTrial,
    setActiveTrial,
    player,
    manifestUrl,
    cloudflareId,
    controlsVisible,
    showControls,
  } = preview;

  const isModerator = !!role && MODERATOR_ROLES.has(role);

  /* ─── Comments ──────────────────────────────────────────────────── */
  const comments = usePreviewComments({
    open,
    videoId,
    mode,
    role,
    selectedVersionId,
  });
  const {
    commentsEnabled,
    threads,
    commentsLoading,
    addComment,
    handleAddComment,
    handleReply,
    handleResolve,
    handleDelete,
  } = comments;

  const allowComment = canComment ?? (commentsEnabled && (mode === "guest" || !!user));

  /* ─── Annotations ───────────────────────────────────────────────── */
  const ann = usePreviewAnnotations({
    open,
    videoId,
    commentsEnabled,
    isModerator,
    selectedVersionId,
    player,
    addCommentAsync: (input) => {
      const guestName = mode === "guest" ? localStorage.getItem("guest_reviewer_name") : null;
      const guestEmail = mode === "guest" ? localStorage.getItem("guest_reviewer_email") : null;
      return addComment.mutateAsync({
        comment: input.comment,
        timestampSeconds: input.timestampSeconds,
        versionId: input.versionId,
        guestName,
        guestEmail,
      });
    },
  });

  const annotations = useMemo(() => {
    if (!selectedVersionId) return ann.allAnnotations;
    return ann.allAnnotations.filter((a) => !a.version_id || a.version_id === selectedVersionId);
  }, [ann.allAnnotations, selectedVersionId]);

  /* ─── Tool action state (floating comment card, annotation) ────── */
  const [activeToolAction, setActiveToolAction] = useState<ToolAction | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ─── View settings state ───────────────────────────────────────── */
  const [timeDisplayFormat, setTimeDisplayFormat] = useState<TimeDisplayFormat>("timecode");
  const [guide, setGuide] = useState<GuideAspect>("off");
  const [showMask, setShowMask] = useState(false);
  const [zoom, setZoom] = useState<ZoomMode>("fit");

  const handleToolAction = useCallback(
    (tool: ToolAction) => {
      // Toggle behavior: clicking the same tool again deactivates it.
      if (activeToolAction === tool) {
        setActiveToolAction(null);
        if (tool === "annotate") ann.cancelAnnotating();
        return;
      }

      // Deactivate previous tool.
      if (activeToolAction === "annotate") ann.cancelAnnotating();

      switch (tool) {
        case "comment":
          player.pause();
          setActiveToolAction("comment");
          break;
        case "annotate":
          ann.startAnnotating();
          setActiveToolAction("annotate");
          break;
        case "voice":
          player.pause();
          setActiveToolAction("voice");
          break;
        case "section":
          player.pause();
          setActiveToolAction("section");
          break;
      }
    },
    [activeToolAction, ann, player],
  );

  // Close floating comment card.
  const closeFloatingComment = useCallback(() => {
    setActiveToolAction(null);
  }, []);

  /* ─── Queue navigation ──────────────────────────────────────────── */
  const nav = useQueueNavigation({
    open,
    queue,
    isMobile,
    isAnnotating: ann.isAnnotating,
    player,
    onClose: () => onOpenChange(false),
    onToolShortcut: commentsEnabled ? (tool) => handleToolAction(tool as ToolAction) : undefined,
  });

  /* ─── Download ──────────────────────────────────────────────────── */
  const { download, isDownloading } = useVideoDownload();
  const handleDownload = useCallback(() => {
    if (!video) return;
    download({
      videoId: video.id,
      videoTitle: video.video_title,
      cloudflareId,
      directUrl: video.video_original_url ?? null,
    });
  }, [video, cloudflareId, download]);

  /* ─── Share ─────────────────────────────────────────────────────── */
  const [shareOpen, setShareOpen] = useState(false);

  /* ─── Status workflow ───────────────────────────────────────────── */
  const workflowEnabled = mode !== "guest";
  const { data: statuses } = useStatuses();
  const updateVideo = useUpdateVideo();

  const currentStatus = (
    video as { status?: { slug?: string; display_name?: string; color?: string } } | undefined
  )?.status;
  const currentStatusSlug = (currentStatus?.slug ?? null) as StatusSlug | null;

  const handleStatusChange = useCallback(
    async (targetSlug: string) => {
      if (!video) return;
      const target = (statuses ?? []).find((s) => s.slug === targetSlug);
      if (!target) {
        toast.error(`Status "${targetSlug}" is not configured`);
        return;
      }
      try {
        await updateVideo.mutateAsync({
          id: video.id,
          status_id: target.id,
        });
        toast.success(`Moved to "${target.display_name}"`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update status");
      }
    },
    [video, statuses, updateVideo],
  );

  /* ─── Seek handler ──────────────────────────────────────────────── */
  const handleSeek = useCallback(
    (seconds: number) => {
      player.seek(seconds);
      showControls();
    },
    [player, showControls],
  );

  if (!open) return null;

  const allowDownload = canDownload ?? mode !== "guest";

  const commentsPanelProps = {
    threads,
    isLoading: commentsLoading,
    currentUserId: user?.id ?? null,
    canComment: allowComment,
    canModerate: isModerator,
    currentTime: player.currentTime,
    onSeek: handleSeek,
    onAdd: handleAddComment,
    onReply: handleReply,
    onResolve: handleResolve,
    onDelete: handleDelete,
  };

  /* ─── Version selector element ──────────────────────────────────── */
  const versionSelectorEl =
    versions.length > 0 ? (
      <VersionSelector
        versions={versions}
        selectedId={selectedVersionId}
        onSelect={(id) => {
          setSelectedVersionId(id);
          setActiveTrial(null);
        }}
        canManage={isModerator}
        onSetCurrent={(id) =>
          setCurrentVersion.mutate(id, {
            onSuccess: () => toast.success("Version is now live"),
            onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update"),
          })
        }
        compact={isMobile}
      />
    ) : null;

  /* ─── Share button ─────────────────────────────────────────────── */
  const shareButtonEl =
    mode !== "guest" && video && canShare(role) ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setShareOpen(true);
        }}
        className="h-8 w-8 text-white hover:bg-white/15"
        aria-label="Share video"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    ) : null;

  /* ─── Workflow element ──────────────────────────────────────────── */
  const workflowEl =
    workflowEnabled && role ? (
      <StatusWorkflowBar
        currentStatusSlug={currentStatusSlug}
        currentStatusLabel={currentStatus?.display_name ?? null}
        currentStatusColor={currentStatus?.color ?? null}
        role={role}
        statuses={statuses ?? []}
        video={video ?? null}
        isPending={updateVideo.isPending}
        onStatusChange={handleStatusChange}
        compact={isMobile}
      />
    ) : null;

  /* ─── Timeline overlay ──────────────────────────────────────────── */
  const timelineOverlayEl = commentsEnabled ? (
    <CommentTimelineMarkers threads={threads} duration={player.duration} onSeek={handleSeek} />
  ) : null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={video?.video_title ?? "Video preview"}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col bg-black outline-none"
      style={{ height: "100dvh" }}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      {/* ─── Header ────────────────────────────────────────────────── */}
      <PreviewHeader
        title={video?.video_title ?? null}
        isMobile={isMobile}
        isVisible={controlsVisible}
        isDownloading={isDownloading}
        canDownload={allowDownload && !!cloudflareId}
        onClose={() => onOpenChange(false)}
        onDownload={handleDownload}
        versionSelector={isMobile ? undefined : versionSelectorEl}
        rightActions={
          isMobile ? (
            <>
              {versionSelectorEl}
              {shareButtonEl}
            </>
          ) : (
            shareButtonEl
          )
        }
        workflow={workflowEl}
      />

      {/* ─── Main content area ─────────────────────────────────────── */}
      <div className={cn("relative flex flex-1 min-h-0", isMobile ? "flex-col" : "flex-row")}>
        {/* Player + controls column */}
        <div
          className={cn(
            "relative flex min-w-0 flex-col",
            isMobile ? "flex-1 min-h-[120px]" : "flex-1",
          )}
        >
          {/* Video player area */}
          <div className="relative flex-1 min-h-0" {...nav.swipeProps}>
            <PreviewPlayer
              player={player}
              onPrimaryClick={() => {
                if (ann.isAnnotating) return;
                player.togglePlay();
                showControls();
              }}
            />

            {/* Queue navigation arrows (desktop) */}
            {queue && !isMobile && controlsVisible && !ann.isAnnotating && (
              <>
                {nav.canGoPrev && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      nav.goPrev();
                    }}
                    className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur transition-colors hover:bg-black/80"
                    aria-label="Previous video"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                {nav.canGoNext && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      nav.goNext();
                    }}
                    className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur transition-colors hover:bg-black/80"
                    aria-label="Next video"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}

            {/* Queue position indicator */}
            {queue && controlsVisible && (
              <div className="absolute right-3 top-3 z-30 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white shadow backdrop-blur">
                {nav.queueIndex + 1} / {nav.queueLength}
              </div>
            )}

            {/* Active trial banner */}
            {activeTrial && controlsVisible && (
              <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground shadow-lg backdrop-blur">
                Playing Trial {activeTrial.trial_number} ·{" "}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setActiveTrial(null)}
                  className="h-auto p-0 text-xs text-primary-foreground underline-offset-2 hover:underline"
                  aria-label="Return to main video"
                >
                  Back to main
                </Button>
              </div>
            )}

            {/* Read-only saved annotations */}
            {commentsEnabled && !ann.isAnnotating && (
              <AnnotationOverlay annotations={annotations} currentTime={player.currentTime} />
            )}

            {/* Live drawing canvas + toolbar */}
            {ann.isAnnotating && (
              <>
                <div className="absolute inset-0 z-20 bg-black/30" aria-hidden />
                <div className="absolute inset-0 z-30">
                  <AnnotationCanvas
                    draftStrokes={ann.draftStrokes}
                    onDraftChange={ann.setDraftStrokes}
                    tool={ann.annotationTool}
                    color={ann.annotationColor}
                    enabled
                  />
                </div>
                <AnnotationToolbar
                  tool={ann.annotationTool}
                  onToolChange={ann.setAnnotationTool}
                  color={ann.annotationColor}
                  onColorChange={ann.setAnnotationColor}
                  canUndo={ann.draftStrokes.length > 0}
                  canSave={ann.draftStrokes.length > 0}
                  onUndo={ann.undoStroke}
                  onClear={ann.clearStrokes}
                  onSave={ann.saveAnnotationDraft}
                  onCancel={ann.cancelAnnotating}
                  saving={ann.savingAnnotation}
                />
              </>
            )}

            {/* Floating comment card (desktop only, Frame.io-style) */}
            {!isMobile && activeToolAction === "comment" && allowComment && (
              <FloatingCommentCard
                currentTime={player.currentTime}
                duration={player.duration}
                onClose={closeFloatingComment}
                onSubmit={handleAddComment}
                canMarkInternal={isModerator}
              />
            )}

            {/* Voice note recorder (desktop only) */}
            {!isMobile && activeToolAction === "voice" && allowComment && (
              <VoiceNoteRecorder
                videoId={videoId}
                currentTime={player.currentTime}
                duration={player.duration}
                onClose={() => setActiveToolAction(null)}
                onSubmit={handleAddComment}
              />
            )}

            {/* Section marker input (desktop only) */}
            {!isMobile && activeToolAction === "section" && isModerator && (
              <SectionMarkerInput
                currentTime={player.currentTime}
                duration={player.duration}
                onClose={() => setActiveToolAction(null)}
                onSubmit={handleAddComment}
              />
            )}

            {/* Mobile: controls overlay inside the player area */}
            {manifestUrl && isMobile && (
              <PlayerControls
                player={player}
                isMobile={isMobile}
                isVisible={controlsVisible}
                timelineOverlay={timelineOverlayEl}
              />
            )}
          </div>

          {/* Desktop: controls bar BELOW the video, in document flow */}
          {manifestUrl && !isMobile && (
            <PlayerControls
              player={player}
              isMobile={isMobile}
              isVisible={controlsVisible}
              timelineOverlay={timelineOverlayEl}
              timeDisplayFormat={timeDisplayFormat}
              onTimeDisplayFormatChange={setTimeDisplayFormat}
              guide={guide}
              onGuideChange={setGuide}
              showMask={showMask}
              onShowMaskChange={setShowMask}
              zoom={zoom}
              onZoomChange={setZoom}
            />
          )}
        </div>

        {/* Mobile bottom sheet */}
        {commentsEnabled && isMobile && <CommentsBottomSheet {...commentsPanelProps} />}

        {/* Desktop sidebar */}
        {commentsEnabled && !isMobile && (
          <CommentsSidebar
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
            {...commentsPanelProps}
            onToolAction={handleToolAction}
            activeToolAction={activeToolAction}
            versions={versions}
            selectedVersionId={selectedVersionId}
            onSelectVersion={(id) => {
              setSelectedVersionId(id);
              setActiveTrial(null);
            }}
            onSetCurrentVersion={(id) =>
              setCurrentVersion.mutate(id, {
                onSuccess: () => toast.success("Version is now live"),
                onError: (err) =>
                  toast.error(err instanceof Error ? err.message : "Failed to update"),
              })
            }
            trials={trials}
            trialsLoading={trialsLoading}
            activeTrialId={activeTrial?.id ?? null}
            onPlayTrial={setActiveTrial}
          />
        )}
      </div>

      {video && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          target={{
            scope: "video",
            videoId: video.id,
            videoTitle: video.video_title,
          }}
          projectId={(video as { project_id?: string | null }).project_id ?? null}
          role={role}
        />
      )}
    </div>,
    document.body,
  );
}
