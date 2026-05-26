import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useStatuses } from "@/hooks/use-lookups";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ReviewStubCell } from "./MediaStubCells";

interface ReviewToggleCellProps {
  videoId: string | undefined;
  videoTitle: string;
  currentStatusId: string | null | undefined;
  projectId?: string | null;
  clientId?: string | null;
  isReadOnly?: boolean;
  row?: {
    data: Record<string, unknown>;
  };
  commentCount?: number;
  density?: "compact" | "regular" | "comfortable";
}

export function ReviewToggleCell({
  videoId,
  videoTitle,
  currentStatusId,
  projectId,
  clientId,
  isReadOnly = false,
  row,
  commentCount = 0,
  density,
}: ReviewToggleCellProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { role, user, tenantId } = useAuth();
  const { data: statuses = [] } = useStatuses();

  // Track if we just toggled to prevent immediate reset from our own status update
  const justToggledRef = useRef<'submit' | 'ready' | null>(null);

  // 1. Resolve current status slug
  const currentStatusSlug = statuses.find((s) => s.id === currentStatusId)?.slug ?? null;

  // 2. Query lead project editor assignment
  const { data: isProjectEditor = false } = useQuery({
    queryKey: ["is-project-editor", projectId, user?.id],
    queryFn: async () => {
      if (!projectId || !user?.id || role !== "editor") return false;
      const { data, error } = await supabase
        .from("video_editors")
        .select("id")
        .eq("editor_id", user.id)
        .eq("project_id", projectId)
        .is("video_id", null)
        .limit(1);
      if (error) return false;
      return (data?.length ?? 0) > 0;
    },
    enabled: !!projectId && !!user?.id && role === "editor",
    staleTime: 5 * 60 * 1000,
  });

  // Role checks
  const isEditor = (role === "editor" || role === "content_creator") && !isProjectEditor;
  const isAdminEditor =
    role === "owner" ||
    role === "manager" ||
    role === "senior_editor" ||
    isProjectEditor;

  // Toggles are active only when status matches target slugs
  const submitIsActive = currentStatusSlug === "internal_review";
  const readyIsActive = currentStatusSlug === "final_review";

  const [localSubmitToggle, setLocalSubmitToggle] = useState(submitIsActive);
  const [localReadyToggle, setLocalReadyToggle] = useState(readyIsActive);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [skipReminder, setSkipReminder] = useState(false);

  // Sync state when database status changes
  useEffect(() => {
    if (justToggledRef.current === 'submit') {
      justToggledRef.current = null;
      return;
    }
    setLocalSubmitToggle(submitIsActive);
  }, [submitIsActive, currentStatusSlug]);

  useEffect(() => {
    if (justToggledRef.current === 'ready') {
      justToggledRef.current = null;
      return;
    }
    setLocalReadyToggle(readyIsActive);
  }, [readyIsActive, currentStatusSlug]);

  const updateVideoStatus = async (targetSlug: string) => {
    if (!videoId || !tenantId) return;

    const targetStatus = statuses.find((s) => s.slug === targetSlug);
    if (!targetStatus) {
      throw new Error(`Target status '${targetSlug}' not found in lookups.`);
    }

    const { error } = await supabase
      .from("videos")
      .update({ status_id: targetStatus.id } as never)
      .eq("id", videoId)
      .eq("tenant_id", tenantId);

    if (error) throw error;

    // Invalidate grid query to force refetch
    queryClient.invalidateQueries({ queryKey: ["grid", "rows"] });
  };

  // Submit for internal review
  const handleSubmitForReview = async () => {
    if (!videoId) return;
    setIsSubmitting(true);
    justToggledRef.current = 'submit';

    try {
      // Validate video has video file & thumbnail
      const videoData = row?.data || {};
      const hasVideo = !!(
        videoData.video_cloudflare_id ||
        videoData.video_playback_url ||
        videoData.video_original_url
      );
      const hasThumbnail = !!(
        videoData.video_thumbnail_url ||
        videoData.thumbnail_storage_path
      );

      if (!hasVideo || !hasThumbnail) {
        const missing = [];
        if (!hasVideo) missing.push("video");
        if (!hasThumbnail) missing.push("thumbnail");
        toast.error(`Cannot submit for review: missing ${missing.join(" and ")}`);
        setLocalSubmitToggle(false);
        justToggledRef.current = null;
        setIsSubmitting(false);
        return;
      }

      await updateVideoStatus("internal_review");

      toast.success("Video submitted for internal review");
    } catch (error) {
      console.error("Error submitting for review:", error);
      toast.error("Failed to submit for review");
      setLocalSubmitToggle(false);
      justToggledRef.current = null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send to Client (Ready)
  const handleSendToClient = async () => {
    setIsSubmitting(true);
    justToggledRef.current = 'ready';

    try {
      await updateVideoStatus("final_review");
      toast.success("Video sent to client");
    } catch (error) {
      console.error("Error sending to client:", error);
      toast.error("Failed to send to client");
      setLocalReadyToggle(false);
      justToggledRef.current = null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitToggleChange = (checked: boolean) => {
    if (isReadOnly) return;
    setLocalSubmitToggle(checked);
    if (checked) {
      handleSubmitForReview();
    }
  };

  const handleReadyToggleChange = (checked: boolean) => {
    if (isReadOnly) return;
    setLocalReadyToggle(checked);
    if (checked) {
      const skipUntil = localStorage.getItem('ready-toggle-skip-confirm');
      if (skipUntil && Date.now() < Number(skipUntil)) {
        handleSendToClient();
      } else {
        setSkipReminder(false);
        setShowConfirmDialog(true);
      }
    }
  };

  const handleConfirmSendToClient = () => {
    if (skipReminder) {
      localStorage.setItem(
        'ready-toggle-skip-confirm',
        String(Date.now() + 24 * 60 * 60 * 1000)
      );
    }
    setShowConfirmDialog(false);
    handleSendToClient();
  };

  const handleCancelSendToClient = () => {
    setShowConfirmDialog(false);
    setLocalReadyToggle(false);
  };

  if (role === "client") return null;

  if (!isEditor && !isAdminEditor) {
    return <ReviewStubCell commentCount={commentCount} status={currentStatusSlug} density={density} />;
  }

  // Density-specific UI scaling helper classes
  const containerClass = density === "compact"
    ? "px-2 py-0.5 gap-1"
    : density === "comfortable"
      ? "px-4 py-2 gap-2.5"
      : "px-3 py-1 gap-1.5";

  const switchScaleClass = density === "compact"
    ? "scale-75"
    : density === "comfortable"
      ? "scale-100"
      : "scale-90";

  const labelTextClass = density === "compact"
    ? "text-[9px]"
    : density === "comfortable"
      ? "text-xs"
      : "text-[10px]";

  const spinnerSizeClass = density === "compact"
    ? "h-2.5 w-2.5"
    : density === "comfortable"
      ? "h-3.5 w-3.5"
      : "h-3 w-3";

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
    <>
      <div className={cn("flex h-full items-center justify-between", containerClass)}>
        {/* Editor toggle: Submit for Review */}
        {isEditor && (
          <div className="flex items-center gap-1">
            <Switch
              checked={localSubmitToggle}
              onCheckedChange={handleSubmitToggleChange}
              disabled={isSubmitting || isReadOnly}
              className={cn("data-[state=checked]:bg-violet-600 origin-left shrink-0", switchScaleClass)}
            />
            <span
              className={cn(
                "font-medium whitespace-nowrap",
                labelTextClass,
                localSubmitToggle ? "text-violet-400" : "text-muted-foreground"
              )}
            >
              {isSubmitting ? "..." : "Submit"}
            </span>
            {isSubmitting && <Loader2 className={cn("animate-spin text-violet-400", spinnerSizeClass)} />}
          </div>
        )}

        {/* Admin toggle: Ready for Client */}
        {isAdminEditor && (
          <div className="flex items-center gap-1">
            <Switch
              checked={localReadyToggle}
              onCheckedChange={handleReadyToggleChange}
              disabled={isSubmitting || isReadOnly}
              className={cn("data-[state=checked]:bg-emerald-600 origin-left shrink-0", switchScaleClass)}
            />
            <span
              className={cn(
                "font-medium whitespace-nowrap",
                labelTextClass,
                localReadyToggle ? "text-emerald-400" : "text-muted-foreground"
              )}
            >
              {isSubmitting ? "..." : "Ready"}
            </span>
            {isSubmitting && <Loader2 className={cn("animate-spin text-emerald-400", spinnerSizeClass)} />}
          </div>
        )}

        {/* Comments count */}
        <span className={cn("flex items-center gap-0.5 text-foreground-disabled shrink-0 select-none", commentsClass)}>
          <MessageSquare className={commentIconSize} />
          {commentCount}
        </span>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Send to Client?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm">
              This will notify the client that "{videoTitle}" is ready for review.
              They will receive an email, push notification, and in-app alert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              id="skip-reminder"
              checked={skipReminder}
              onCheckedChange={(checked) => setSkipReminder(checked === true)}
              className="border-white/20 data-[state=checked]:bg-emerald-600"
            />
            <label
              htmlFor="skip-reminder"
              className="text-sm text-zinc-400 cursor-pointer select-none"
            >
              Don't remind me for 24 hours
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelSendToClient}
              className="border-white/10 bg-transparent text-white hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmSendToClient();
              }}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Yes, Send to Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
