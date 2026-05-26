/**
 * CommentsPanel — list + composer for comments. Used by both the desktop
 * sidebar and the mobile bottom sheet.
 */
import { Loader2, MessageSquare } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";

import type { CommentThread } from "../hooks/use-video-comments";
import type { ToolAction } from "../PlayerControls";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";

export interface CommentsPanelProps {
  threads: CommentThread[];
  isLoading: boolean;
  currentUserId: string | null;
  canComment: boolean;
  canModerate: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onAdd: (input: {
    body: string;
    timestampSeconds: number | null;
    timestampEndSeconds: number | null;
    mentionedUserIds: string[];
    isInternal: boolean;
  }) => Promise<void> | void;
  onReply: (parentId: string, body: string, mentionedUserIds?: string[]) => Promise<void> | void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  /** Tool action callbacks — passed through to CommentComposer. */
  onToolAction?: (tool: ToolAction) => void;
  activeToolAction?: ToolAction | null;
}

export function CommentsPanel({
  threads,
  isLoading,
  currentUserId,
  canComment,
  canModerate,
  currentTime,
  onSeek,
  onAdd,
  onReply,
  onResolve,
  onDelete,
  onToolAction,
  activeToolAction,
}: CommentsPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading comments...
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-foreground-muted">
                <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No comments yet</p>
                {canComment && <p className="text-xs mt-1">Be the first to leave feedback.</p>}
              </div>
            ) : (
              threads.map((t, i) => (
                <CommentItem
                  key={t.id}
                  thread={t}
                  index={i + 1}
                  currentUserId={currentUserId}
                  canModerate={canModerate}
                  onSeek={onSeek}
                  onReply={onReply}
                  onResolve={onResolve}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      {canComment && (
        <CommentComposer
          currentTime={currentTime}
          onSubmit={onAdd}
          canMarkInternal={canModerate}
          canMention={canComment}
          onToolAction={onToolAction}
          activeToolAction={activeToolAction}
        />
      )}
    </div>
  );
}
