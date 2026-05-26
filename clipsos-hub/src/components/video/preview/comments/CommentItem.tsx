/**
 * CommentItem — single comment card (Frame.io-style).
 *
 * Layout:
 *   Row 1:  Avatar  Name  TimeAgo         #N  Globe/Lock
 *   Row 2:  [00:37:53:22] comment body text
 *   Row 3:  Reply                      😊  ⋯  ✓
 */
import { useCallback, useRef, useState } from "react";
import {
  Check,
  Globe,
  Link as LinkIcon,
  Lock,
  Mic,
  MoreHorizontal,
  Pencil,
  Smile,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MentionRenderer, MentionTextarea } from "@/components/mentions";
import type { MentionTextareaRef } from "@/components/mentions";
import { useMentionUsers } from "@/hooks/use-mention";

import type { CommentThread, VideoComment } from "../hooks/use-video-comments";
import { formatTimecode } from "../lib/format";

interface CommentItemProps {
  thread: CommentThread;
  /** 1-based display index for the comment (shown as #N). */
  index?: number;
  currentUserId: string | null;
  canModerate: boolean;
  onSeek: (seconds: number) => void;
  onReply: (parentId: string, body: string, mentionedUserIds?: string[]) => Promise<void> | void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newBody: string) => Promise<void> | void;
}

export function CommentItem({
  thread,
  index,
  currentUserId,
  canModerate,
  onSeek,
  onReply,
  onResolve,
  onDelete,
  onEdit,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyMentionIds, setReplyMentionIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const replyMentionRef = useRef<MentionTextareaRef>(null);

  // Global mention users for reply @mention support
  const mentionUsers = useMentionUsers();

  const isResolved = thread.resolved_at != null;

  const handleReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onReply(thread.id, trimmed, replyMentionIds);
      setReplyText("");
      setReplyMentionIds([]);
      setReplyOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border/60 bg-surface-raised/40 p-3 space-y-2">
      <CommentRow
        comment={thread}
        index={index}
        currentUserId={currentUserId}
        canModerate={canModerate}
        onSeek={onSeek}
        onResolve={onResolve}
        onDelete={onDelete}
        onEdit={onEdit}
      />

      {thread.replies.length > 0 && (
        <div className="space-y-2 border-l-2 border-border/40 pl-3 ml-4">
          {thread.replies.map((r) => (
            <CommentRow
              key={r.id}
              comment={r}
              currentUserId={currentUserId}
              canModerate={canModerate}
              onSeek={onSeek}
              onResolve={onResolve}
              onDelete={onDelete}
              onEdit={onEdit}
              isReply
            />
          ))}
        </div>
      )}

      {/* ── Footer: Reply + emoji / more / resolve icons ─────── */}
      <div className="flex items-center gap-2 pt-1">
        {!replyOpen ? (
          <>
            <button
              type="button"
              className="text-xs text-foreground-muted hover:text-foreground transition-colors"
              onClick={() => setReplyOpen(true)}
            >
              Reply
            </button>

            <span className="flex-1" />

            {/* Emoji reaction */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="h-6 w-6 flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                  aria-label="Add reaction"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Add reaction</TooltipContent>
            </Tooltip>

            {/* Inline 3-dot for quick actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-6 w-6 flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                  aria-label="More"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {currentUserId && thread.user_id === currentUserId && onEdit && (
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("comment", thread.id);
                    navigator.clipboard.writeText(url.toString());
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <LinkIcon className="mr-2 h-3.5 w-3.5" /> Copy Link
                </DropdownMenuItem>
                {((currentUserId && thread.user_id === currentUserId) || canModerate) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-status-danger focus:text-status-danger"
                      onClick={() => onDelete(thread.id)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resolve checkmark */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onResolve(thread.id)}
                  className={cn(
                    "h-6 w-6 flex items-center justify-center rounded-md transition-colors",
                    isResolved
                      ? "text-status-success bg-status-success/10"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-raised",
                  )}
                  aria-label={isResolved ? "Unresolve" : "Resolve"}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isResolved ? "Unresolve" : "Mark as complete"}
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <div className="flex-1 space-y-2">
            <MentionTextarea
              ref={replyMentionRef}
              value={replyText}
              onChange={setReplyText}
              onMentionsChange={setReplyMentionIds}
              onSubmit={handleReply}
              users={mentionUsers}
              placeholder="Write a reply..."
              rows={2}
              className="min-h-[60px]"
              pickerPosition="above"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyOpen(false);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleReply} disabled={submitting || !replyText.trim()}>
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Voice note detection ─────────────────────────────────────── */
const VOICE_NOTE_RE = /^🎤\s*Voice note:\s*(.+)$/s;

/**
 * Render comment body with inline highlighted timestamp.
 */
function renderCommentBody(
  body: string,
  timestampSeconds: number | null,
  timestampEndSeconds: number | null,
  onSeek: (seconds: number) => void,
) {
  // Voice note
  const match = body.match(VOICE_NOTE_RE);
  if (match) {
    const audioSrc = match[1].trim();
    return (
      <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-primary/10 p-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Mic className="h-4 w-4 text-primary" />
        </div>
        <audio
          src={audioSrc}
          controls
          controlsList="nodownload"
          preload="metadata"
          className="h-8 flex-1 min-w-0"
          style={{ maxWidth: "100%" }}
        />
      </div>
    );
  }

  // Normal comment with optional inline timestamp badge
  return (
    <p className="text-sm whitespace-pre-wrap break-words mt-1">
      {timestampSeconds != null && (
        <button
          type="button"
          onClick={() => onSeek(timestampSeconds)}
          className="inline-flex items-center rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary hover:bg-primary/25 transition-colors mr-1.5 align-baseline"
          aria-label={`Seek to ${formatTimecode(timestampSeconds)}`}
        >
          {formatTimecode(timestampSeconds)}
          {timestampEndSeconds != null && ` → ${formatTimecode(timestampEndSeconds)}`}
        </button>
      )}
      <MentionRenderer text={body} />
    </p>
  );
}

/* ─── Single row (used for top-level + reply rows) ─────────────── */
interface RowProps {
  comment: VideoComment;
  index?: number;
  currentUserId: string | null;
  canModerate: boolean;
  onSeek: (seconds: number) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newBody: string) => Promise<void> | void;
  isReply?: boolean;
}

function CommentRow({
  comment,
  index,
  currentUserId,
  canModerate,
  onSeek,
  onResolve,
  onDelete,
  onEdit,
  isReply,
}: RowProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [saving, setSaving] = useState(false);

  const name =
    comment.author?.display_name || comment.author?.full_name || comment.guest_name || "User";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const isOwn = currentUserId && comment.user_id === currentUserId;
  const isInternal = comment.is_internal === true;

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: false,
  });

  const handleCopyLink = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("comment", comment.id);
    navigator.clipboard.writeText(url.toString());
    toast.success("Link copied to clipboard");
  }, [comment.id]);

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === comment.comment) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onEdit?.(comment.id, trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Avatar className={cn("shrink-0", isReply ? "h-6 w-6" : "h-8 w-8")}>
        {comment.author?.avatar_url && <AvatarImage src={comment.author.avatar_url} alt={name} />}
        <AvatarFallback className="text-xs">{initials || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        {/* Header row: Name  time     #N  icon */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{name}</span>
          <span className="text-[11px] text-foreground-muted">{timeAgo}</span>

          {/* Spacer pushes right-side items */}
          <span className="flex-1" />

          {/* Comment number */}
          {index != null && (
            <span className="text-[11px] text-foreground-muted font-mono">#{index}</span>
          )}

          {/* Public / Internal icon */}
          {isInternal ? (
            <Lock className="h-3.5 w-3.5 text-status-warning" aria-label="Internal comment" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-foreground-muted" aria-label="Public comment" />
          )}
        </div>

        {/* Body — edit mode or display mode */}
        {editing ? (
          <div className="mt-1 space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[60px] text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={saving || !editText.trim()}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          renderCommentBody(
            comment.comment,
            comment.timestamp_seconds,
            comment.timestamp_end_seconds,
            onSeek,
          )
        )}
      </div>
    </div>
  );
}
