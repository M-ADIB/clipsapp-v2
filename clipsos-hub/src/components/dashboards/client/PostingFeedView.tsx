import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Film,
  Download,
  Copy,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MessageSquare,
  FileText,
  Calendar,
  Layers,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useVideosByClient, useUpdateVideo, useVideoVersions } from "@/hooks/use-videos";
import { useStatuses } from "@/hooks/use-lookups";
import { CommentsPanel } from "@/components/video/preview/comments/CommentsPanel";
import { usePreviewComments } from "@/components/video/preview/hooks/use-preview-comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { VideoPreviewModal } from "@/components/video/preview/VideoPreviewModalLazy";

interface PostingFeedViewProps {
  clientId: string;
  initialSearch?: string;
  projectId?: string;
  statusSlug?: string;
}

export function PostingFeedView({
  clientId,
  initialSearch,
  projectId,
  statusSlug,
}: PostingFeedViewProps) {
  const { data: videos = [], isLoading } = useVideosByClient(clientId);

  const filteredVideos = useMemo(() => {
    let list = videos;

    // Filter by project
    if (projectId) {
      list = list.filter((v) => v.project_id === projectId);
    }

    // Filter by status slug
    if (statusSlug) {
      list = list.filter((v) => {
        const slug = (v.status as { slug?: string } | null)?.slug ?? "";
        if (statusSlug === "review") {
          return [
            "rough_cut",
            "in_review",
            "internal_review",
            "final_review",
            "revisions_requested",
          ].includes(slug);
        }
        return slug === statusSlug;
      });
    }

    // Filter by search text
    if (initialSearch) {
      const query = initialSearch.toLowerCase();
      list = list.filter(
        (v) =>
          v.video_title?.toLowerCase().includes(query) ||
          (v.project as { project_name?: string } | null)?.project_name
            ?.toLowerCase()
            .includes(query) ||
          (v.status as { display_name?: string } | null)?.display_name
            ?.toLowerCase()
            .includes(query),
      );
    }

    return list;
  }, [videos, projectId, statusSlug, initialSearch]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-[600px] border border-border bg-surface-card rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-lg"
          >
            <Skeleton className="flex-1 h-full bg-black/40" />
            <div className="w-full md:w-[380px] p-5 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-2xl bg-surface-card p-6 mb-4 border border-border">
          <Film className="h-10 w-10 text-foreground-disabled" />
        </div>
        <p className="text-sm text-foreground-muted">No videos match your active filter.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[calc(100vh-14rem)]">
      <div className="w-full h-full flex flex-col items-center gap-8 py-2 md:py-6 snap-y snap-mandatory overflow-y-auto pr-2 scroll-smooth">
        {filteredVideos.map((video) => (
          <PostingFeedCard key={video.id} video={video} clientId={clientId} />
        ))}
      </div>
    </div>
  );
}

/* ─── Individual Feed Card Component ───────────────────────────── */

function PostingFeedCard({ video, clientId }: { video: any; clientId: string }) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"feedback" | "details">("feedback");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Pause local video if full screen preview opens
  useEffect(() => {
    if (previewOpen && isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [previewOpen, isPlaying]);

  // Fetch lookups & mutations
  const { data: statuses = [] } = useStatuses();
  const updateVideo = useUpdateVideo();

  // Version management
  const { data: versions = [], isLoading: versionsLoading } = useVideoVersions(video.id);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Auto-select latest version
  useEffect(() => {
    if (versions.length > 0 && !selectedVersionId) {
      setSelectedVersionId(versions[0].id);
    }
  }, [versions, selectedVersionId]);

  const activeVersion = useMemo(() => {
    if (!selectedVersionId) return versions[0] ?? null;
    return versions.find((v) => v.id === selectedVersionId) ?? versions[0] ?? null;
  }, [versions, selectedVersionId]);

  // Fallbacks for URLs
  const playbackUrl = activeVersion?.video_playback_url ?? video.video_playback_url;
  const thumbnailUrl = activeVersion?.video_thumbnail_url ?? video.video_thumbnail_url;

  // Comments hook
  const { threads, commentsLoading, handleAddComment, handleReply, handleResolve, handleDelete } =
    usePreviewComments({
      open: true,
      videoId: video.id,
      mode: "review",
      role: "client",
      selectedVersionId: selectedVersionId,
    });

  // Status mapping
  const approvedStatus = statuses.find((s) => s.slug === "approved");
  const revisionsStatus = statuses.find((s) => s.slug === "revisions_requested");

  const currentStatusSlug = (video.status as { slug?: string } | null)?.slug ?? "";
  const currentStatusLabel =
    (video.status as { display_name?: string } | null)?.display_name ?? "Pending";
  const currentStatusColor = (video.status as { color?: string } | null)?.color ?? "#9CA3AF";

  // Playback handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      if (!isPlaying) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  const handleApprove = () => {
    if (!approvedStatus) return;
    updateVideo.mutate(
      { id: video.id, status_id: approvedStatus.id },
      {
        onSuccess: () => toast.success("Video approved successfully! 🎉"),
        onError: () => toast.error("Failed to approve video."),
      },
    );
  };

  const handleRequestRevisions = () => {
    if (!revisionsStatus) return;
    updateVideo.mutate(
      { id: video.id, status_id: revisionsStatus.id },
      {
        onSuccess: () => toast.success("Revisions requested. Feedback saved."),
        onError: () => toast.error("Failed to update status."),
      },
    );
  };

  const handleCopyCaption = () => {
    if (!video.caption) {
      toast.error("No caption available to copy.");
      return;
    }
    navigator.clipboard.writeText(video.caption);
    toast.success("Caption copied to clipboard!", { duration: 1500 });
  };

  return (
    <div className="w-full max-w-4xl h-[540px] md:h-[580px] border border-border/80 bg-surface-card rounded-2xl flex flex-col md:flex-row overflow-hidden snap-start shrink-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-border-strong relative">
      {/* ── Left side: Video Player ── */}
      <div className="flex-1 bg-black relative flex items-center justify-center min-h-[320px] md:min-h-0 md:h-full group">
        {playbackUrl ? (
          <>
            <video
              ref={videoRef}
              src={playbackUrl}
              poster={thumbnailUrl ?? undefined}
              className="h-full w-full object-contain"
              playsInline
              loop
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
            />

            {/* Click to expand review overlay */}
            <div
              onClick={() => setPreviewOpen(true)}
              className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer z-10 text-white"
            >
              <div className="rounded-full bg-black/60 backdrop-blur-md p-3 border border-white/20 transition-transform duration-200 hover:scale-110 shadow-lg">
                <Maximize2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold tracking-wide drop-shadow-sm select-none">
                Click to review in full screen
              </span>
            </div>

            {/* Custom control overlays on hover */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6 text-foreground-disabled">
            <Film className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Video upload is pending...</p>
          </div>
        )}
      </div>

      {/* ── Right side: Action Bar & Comments/Details Panel ── */}
      <div className="w-full md:w-[380px] border-t md:border-t-0 md:border-l border-border h-[320px] md:h-full flex flex-col bg-background relative z-10">
        {/* Header */}
        <header className="p-4 border-b border-border flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-sm truncate text-foreground-strong">
              {video.video_title ?? "Untitled Video"}
            </h3>
            <span
              className="inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: `${currentStatusColor}15`,
                color: currentStatusColor,
                border: `1px solid ${currentStatusColor}25`,
              }}
            >
              {currentStatusLabel}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1 text-[11px] text-foreground-disabled">
              <Layers className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {(video.project as { project_name?: string } | null)?.project_name ?? "No Project"}
              </span>
            </div>

            {/* Version selection */}
            {versions.length > 0 && (
              <Select
                value={selectedVersionId ?? undefined}
                onValueChange={(val) => setSelectedVersionId(val)}
              >
                <SelectTrigger className="h-6 w-24 text-[10px] px-2 py-0">
                  <SelectValue placeholder="Version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="text-[10px]">
                      v{v.version_number} (
                      {v.version_type === "rough_cut"
                        ? "Rough"
                        : v.version_type === "final"
                          ? "Final"
                          : "Rev"}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </header>

        {/* Tab row: Feedback vs Details */}
        <div className="flex border-b border-border shrink-0 text-xs">
          <button
            onClick={() => setActiveTab("feedback")}
            className={cn(
              "flex-1 py-2 font-medium text-center transition-colors border-b-2",
              activeTab === "feedback"
                ? "border-primary text-foreground-strong"
                : "border-transparent text-foreground-muted hover:text-foreground",
            )}
          >
            <div className="flex items-center justify-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Feedback ({threads.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "flex-1 py-2 font-medium text-center transition-colors border-b-2",
              activeTab === "details"
                ? "border-primary text-foreground-strong"
                : "border-transparent text-foreground-muted hover:text-foreground",
            )}
          >
            <div className="flex items-center justify-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Caption & Script
            </div>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === "feedback" ? (
            <CommentsPanel
              threads={threads}
              isLoading={commentsLoading}
              currentUserId={user?.id ?? null}
              canComment={true}
              canModerate={false}
              currentTime={currentTime}
              onSeek={handleSeek}
              onAdd={handleAddComment}
              onReply={handleReply}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ) : (
            <div className="p-4 space-y-4">
              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Caption Copy
                  </h4>
                  {video.caption && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-foreground-disabled hover:text-foreground"
                      onClick={handleCopyCaption}
                      title="Copy Caption"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="rounded-lg bg-surface-muted/40 p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap border border-border/40 max-h-[180px] overflow-y-auto">
                  {video.caption ? (
                    video.caption
                  ) : (
                    <span className="italic text-foreground-disabled">
                      No caption scripted yet.
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled mb-1.5">
                  Notes
                </h4>
                <div className="rounded-lg bg-surface-muted/40 p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap border border-border/40">
                  {video.notes ? (
                    video.notes
                  ) : (
                    <span className="italic text-foreground-disabled">No editor notes.</span>
                  )}
                </div>
              </div>

              {/* Meta */}
              {video.post_date && (
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <Calendar className="h-4 w-4 text-foreground-disabled shrink-0" />
                  <span>
                    Scheduled Post:{" "}
                    <span className="font-semibold text-foreground-strong">
                      {new Date(video.post_date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Panel Footer */}
        <footer className="p-3 border-t border-border bg-surface-muted/30 flex items-center justify-between gap-2 shrink-0">
          {activeVersion?.video_playback_url && (
            <a
              href={activeVersion.video_playback_url}
              download={activeVersion.video_file_name ?? "video.mp4"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-raised transition-colors shrink-0"
              title="Download video file"
            >
              <Download className="h-4 w-4" />
            </a>
          )}

          {currentStatusSlug !== "approved" ? (
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-orange-400 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:text-orange-300"
                onClick={handleRequestRevisions}
              >
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                Revisions
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleApprove}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Approve
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold ml-auto py-1">
              <CheckCircle className="h-4 w-4" /> Approved
            </div>
          )}
        </footer>
      </div>

      <VideoPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        videoId={video.id}
        mode="review"
      />
    </div>
  );
}
