/**
 * StatusWorkflowBar — role-aware status control in the preview header.
 *
 * Renders different UIs based on the user's role:
 *   • Admin roles (owner/manager/content_creator/senior_editor) → dropdown
 *   • Editor → "Submit for Review" button (→ internal_review)
 *   • Client → "Approve" + "Request Revision" buttons
 *   • Moderator/Closer → view-only badge
 */
import { useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Send, ThumbsUp, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { AppRole } from "@/integrations/supabase/db-types";
import {
  getStatusViewMode,
  canEditorSubmit,
  getDropdownStatuses,
  type StatusSlug,
  type StatusOption,
} from "./status-workflow";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatusWorkflowBarProps {
  /** Current status slug from the video's status relation. */
  currentStatusSlug: StatusSlug | null | undefined;
  /** Human-readable status label. */
  currentStatusLabel: string | null | undefined;
  /** Status dot color. */
  currentStatusColor: string | null | undefined;
  /** Current user's role. */
  role: AppRole | null;
  /** All available statuses from the lookup table. */
  statuses: Array<{
    id: string;
    slug: string;
    display_name: string;
    color: string | null;
  }>;
  /** The video object — needed for editor guard (hasVideo + hasThumbnail). */
  video:
    | {
        video_cloudflare_id?: string | null;
        video_playback_url?: string | null;
        video_original_url?: string | null;
        video_thumbnail_url?: string | null;
        thumbnail_storage_path?: string | null;
      }
    | null
    | undefined;
  /** Called when the user selects a new status (slug string). */
  onStatusChange: (targetSlug: string) => Promise<void> | void;
  /** Whether a status update mutation is in progress. */
  isPending?: boolean;
  /** Compact mode for mobile. */
  compact?: boolean;
}

// ─── Status badge (shared) ──────────────────────────────────────────────────

function StatusBadge({
  label,
  color,
  compact,
}: {
  label: string;
  color: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      )}
      style={{
        backgroundColor: `${color}33`,
        color: "#e2e8f0",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function StatusWorkflowBar({
  currentStatusSlug,
  currentStatusLabel,
  currentStatusColor,
  role,
  statuses,
  video,
  onStatusChange,
  isPending,
  compact,
}: StatusWorkflowBarProps) {
  const viewMode = getStatusViewMode(role);

  const dropdownOptions = useMemo(() => getDropdownStatuses(statuses), [statuses]);

  const [confirmAction, setConfirmAction] = useState<{
    slug: string;
    label: string;
    message: string;
  } | null>(null);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    await onStatusChange(confirmAction.slug);
    setConfirmAction(null);
  };

  const statusBadge = currentStatusLabel ? (
    <StatusBadge
      label={currentStatusLabel}
      color={currentStatusColor ?? "#64748b"}
      compact={compact}
    />
  ) : null;

  /* ─── Hidden / guest ───────────────────────────────────────────────── */
  if (viewMode === "hidden") return null;

  /* ─── View only (moderator / closer) ───────────────────────────────── */
  if (viewMode === "view_only") {
    return <div className="flex items-center">{statusBadge}</div>;
  }

  /* ─── Admin dropdown ───────────────────────────────────────────────── */
  if (viewMode === "dropdown") {
    return (
      <>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                className={cn(
                  "h-7 gap-1.5 rounded-full border border-white/10 px-3 text-xs font-medium text-white/90 hover:bg-white/10",
                  isPending && "opacity-60",
                )}
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                {currentStatusLabel ? (
                  <>
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: currentStatusColor ?? "#64748b",
                      }}
                    />
                    {currentStatusLabel}
                  </>
                ) : (
                  "Set Status"
                )}
                <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px] bg-zinc-900 border-white/10">
              {dropdownOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.id}
                  disabled={opt.slug === currentStatusSlug}
                  onClick={() => onStatusChange(opt.slug)}
                  className={cn(
                    "flex items-center gap-2 text-sm text-white/80 hover:text-white focus:bg-white/10",
                    opt.slug === currentStatusSlug && "opacity-50 pointer-events-none",
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: opt.color }}
                  />
                  {opt.displayName}
                  {opt.slug === currentStatusSlug && (
                    <Check className="ml-auto h-3.5 w-3.5 text-emerald-400" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  }

  /* ─── Editor: Submit for Review ────────────────────────────────────── */
  if (viewMode === "editor_submit") {
    const canSubmit = canEditorSubmit(video);
    // Only show the button when the video isn't already in/past internal_review
    const alreadySubmitted =
      currentStatusSlug === "internal_review" ||
      currentStatusSlug === "final_review" ||
      currentStatusSlug === "approved" ||
      currentStatusSlug === "scheduled" ||
      currentStatusSlug === "posted";

    return (
      <div className="flex items-center gap-2">
        {statusBadge}
        {!alreadySubmitted && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="button"
                  size="sm"
                  disabled={!canSubmit || isPending}
                  className={cn(
                    "h-7 gap-1.5 px-3 text-xs font-medium",
                    canSubmit
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "bg-white/10 text-white/40 cursor-not-allowed",
                  )}
                  onClick={() =>
                    setConfirmAction({
                      slug: "internal_review",
                      label: "Submit for Review",
                      message:
                        "This will submit the video for internal review. A senior editor will review it before it's visible to the client.",
                    })
                  }
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  Submit for Review
                </Button>
              </span>
            </TooltipTrigger>
            {!canSubmit && (
              <TooltipContent
                side="bottom"
                className="bg-zinc-800 text-white text-xs border-white/10"
              >
                Upload both a video and a thumbnail to submit
              </TooltipContent>
            )}
          </Tooltip>
        )}
        {alreadySubmitted && <span className="text-xs text-white/40 italic">Submitted</span>}
      </div>
    );
  }

  /* ─── Client: Approve / Request Revision ───────────────────────────── */
  if (viewMode === "client_review") {
    // Only show action buttons when the video is in final_review
    const canAct = currentStatusSlug === "final_review";

    return (
      <>
        <div className="flex items-center gap-2">
          {statusBadge}
          {canAct && (
            <>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                className="h-7 gap-1.5 bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-500"
                onClick={() =>
                  setConfirmAction({
                    slug: "approved",
                    label: "Approve",
                    message:
                      "Approving this video means you're happy with the final version. It will be scheduled for posting.",
                  })
                }
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ThumbsUp className="h-3 w-3" />
                )}
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                className="h-7 gap-1.5 bg-orange-600 px-3 text-xs font-medium text-white hover:bg-orange-500"
                onClick={() =>
                  setConfirmAction({
                    slug: "revisions_requested",
                    label: "Request Revision",
                    message:
                      "This will send the video back to the editing team with a revision request. Please leave a comment explaining what changes you need.",
                  })
                }
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="h-3 w-3" />
                )}
                Request Revision
              </Button>
            </>
          )}
        </div>

        {/* Confirmation dialog */}
        <AlertDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmAction?.label}?</AlertDialogTitle>
              <AlertDialogDescription>{confirmAction?.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  /* ─── Confirm dialog for editor_submit ──────────────────────────────── */
  return (
    <>
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.label}?</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
