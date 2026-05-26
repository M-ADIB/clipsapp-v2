/**
 * ThumbnailCommentsSidebar — scrollable comment thread + composer for thumbnails.
 *
 * Simplified version of the video CommentsSidebar — no timestamp features,
 * no filters/sort/search. Just a clean list of CommentItem cards and a
 * composer at the bottom with @mention support.
 */
import { useCallback, useRef, useState } from "react";
import { EyeOff, Globe, Loader2, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { MentionTextarea } from "@/components/mentions";
import type { MentionTextareaRef } from "@/components/mentions";
import { useMentionUsers } from "@/hooks/use-mention";

import { CommentItem } from "@/components/video/preview/comments/CommentItem";
import type { CommentThread } from "@/components/video/preview/hooks/use-video-comments";

interface ThumbnailCommentsSidebarProps {
  threads: CommentThread[];
  isLoading: boolean;
  currentUserId: string | null;
  canComment: boolean;
  canModerate: boolean;
  onAdd: (body: string, isInternal: boolean, mentionedUserIds?: string[]) => Promise<void> | void;
  onReply: (parentId: string, body: string, mentionedUserIds?: string[]) => Promise<void> | void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ThumbnailCommentsSidebar({
  threads,
  isLoading,
  currentUserId,
  canComment,
  canModerate,
  onAdd,
  onReply,
  onResolve,
  onDelete,
}: ThumbnailCommentsSidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border/60">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
        <MessageSquare className="h-4 w-4 text-foreground-muted" />
        <span className="text-sm font-medium">Comments</span>
        {threads.length > 0 && (
          <span className="text-xs text-foreground-muted">({threads.length})</span>
        )}
      </div>

      {/* Scrollable comment list */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading comments...
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-foreground-muted">
                <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No comments yet</p>
                {canComment && <p className="text-xs mt-1">Leave feedback on this thumbnail.</p>}
              </div>
            ) : (
              threads.map((t, i) => (
                <CommentItem
                  key={t.id}
                  thread={t}
                  index={i + 1}
                  currentUserId={currentUserId}
                  canModerate={canModerate}
                  onSeek={() => {}} // No-op: thumbnails don't have timecodes
                  onReply={onReply}
                  onResolve={onResolve}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Composer */}
      {canComment && <ThumbnailCommentComposer onSubmit={onAdd} canMarkInternal={canModerate} />}
    </div>
  );
}

/* ─── Simplified composer with @mention support ───────────────────────── */

interface ThumbnailCommentComposerProps {
  onSubmit: (
    body: string,
    isInternal: boolean,
    mentionedUserIds?: string[],
  ) => Promise<void> | void;
  canMarkInternal: boolean;
}

function ThumbnailCommentComposer({ onSubmit, canMarkInternal }: ThumbnailCommentComposerProps) {
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const mentionRef = useRef<MentionTextareaRef>(null);

  // Global mention users
  const mentionUsers = useMentionUsers();

  const handleSubmit = useCallback(async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed, isInternal, mentionedUserIds);
      setBody("");
      setIsInternal(false);
      setMentionedUserIds([]);
    } finally {
      setSubmitting(false);
    }
  }, [body, isInternal, mentionedUserIds, onSubmit]);

  return (
    <div className="flex flex-col gap-2 border-t border-border/60 bg-surface-card/95 backdrop-blur p-3">
      {/* Internal toggle */}
      {canMarkInternal && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsInternal((v) => !v)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors",
              isInternal
                ? "bg-status-warning/15 text-status-warning border border-status-warning/30"
                : "bg-surface-raised text-foreground-muted border border-border/60 hover:bg-surface-raised/80",
            )}
            aria-label={isInternal ? "Internal — hidden from clients" : "Visible to client"}
            aria-pressed={isInternal}
          >
            {isInternal ? (
              <>
                <EyeOff className="h-3 w-3" /> Internal
              </>
            ) : (
              <>
                <Globe className="h-3 w-3" /> Public
              </>
            )}
          </button>
        </div>
      )}

      {/* MentionTextarea — replaces plain Textarea */}
      <MentionTextarea
        ref={mentionRef}
        value={body}
        onChange={setBody}
        onMentionsChange={setMentionedUserIds}
        onSubmit={handleSubmit}
        users={mentionUsers}
        placeholder="Leave feedback on this thumbnail..."
        rows={2}
        className="min-h-[60px]"
        pickerPosition="above"
      />

      {/* Send */}
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          className="h-7 gap-1 px-3"
          onClick={handleSubmit}
          disabled={submitting || !body.trim()}
          aria-label={submitting ? "Posting comment" : "Post comment"}
        >
          <Send className="h-3 w-3" />
          {submitting ? "Posting..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
