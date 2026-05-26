/**
 * usePreviewComments — scoped comment filtering & action handlers.
 *
 * Handles:
 *  • Version-scoped thread filtering (legacy threads shown everywhere)
 *  • Visibility gating (guests & clients can't see internal comments)
 *  • add / reply / resolve / delete wrappers with toast feedback
 */
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { useVideoComments, type CommentThread } from "./use-video-comments";
import type { VideoPreviewMode } from "../VideoPreviewModal";

interface UsePreviewCommentsOptions {
  open: boolean;
  videoId: string | null;
  mode: VideoPreviewMode;
  role: string | null | undefined;
  selectedVersionId: string | null;
}

export function usePreviewComments({
  open,
  videoId,
  mode,
  role,
  selectedVersionId,
}: UsePreviewCommentsOptions) {
  const commentsEnabled = mode !== "preview";

  const {
    threads: allThreads,
    isLoading: commentsLoading,
    addComment,
    resolveComment,
    deleteComment,
  } = useVideoComments(open && commentsEnabled ? videoId : null);

  // Scope to active version; show legacy (no version_id) on every version.
  // Hide internal comments from guests & clients.
  const threads = useMemo(() => {
    let list = allThreads;
    if (selectedVersionId) {
      list = list.filter((t) => !t.version_id || t.version_id === selectedVersionId);
    }
    if (mode === "guest" || role === "client") {
      list = list.filter((t) => !t.is_internal);
    }
    return list;
  }, [allThreads, selectedVersionId, mode, role]);

  const handleAddComment = useCallback(
    async (input: {
      body: string;
      timestampSeconds: number | null;
      timestampEndSeconds: number | null;
      mentionedUserIds: string[];
      isInternal: boolean;
    }) => {
      try {
        const guestName = mode === "guest" ? localStorage.getItem("guest_reviewer_name") : null;
        const guestEmail = mode === "guest" ? localStorage.getItem("guest_reviewer_email") : null;

        await addComment.mutateAsync({
          comment: input.body,
          timestampSeconds: input.timestampSeconds,
          timestampEndSeconds: input.timestampEndSeconds,
          mentionedUserIds: input.mentionedUserIds,
          isInternal: input.isInternal,
          versionId: selectedVersionId,
          guestName,
          guestEmail,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to post comment");
      }
    },
    [addComment, selectedVersionId, mode],
  );

  const handleReply = useCallback(
    async (parentId: string, body: string, mentionedUserIds?: string[]) => {
      try {
        const guestName = mode === "guest" ? localStorage.getItem("guest_reviewer_name") : null;
        const guestEmail = mode === "guest" ? localStorage.getItem("guest_reviewer_email") : null;

        await addComment.mutateAsync({
          comment: body,
          parentCommentId: parentId,
          mentionedUserIds,
          versionId: selectedVersionId,
          guestName,
          guestEmail,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reply");
      }
    },
    [addComment, selectedVersionId, mode],
  );

  const handleResolve = useCallback(
    (id: string) => {
      resolveComment.mutate(id, {
        onSuccess: () => toast.success("Comment resolved"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to resolve"),
      });
    },
    [resolveComment],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteComment.mutate(id, {
        onSuccess: () => toast.success("Comment deleted"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete"),
      });
    },
    [deleteComment],
  );

  return {
    commentsEnabled,
    threads,
    commentsLoading,
    addComment,
    handleAddComment,
    handleReply,
    handleResolve,
    handleDelete,
  };
}
