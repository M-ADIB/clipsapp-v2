/**
 * useThumbnailComments — fetch + mutate comments for a thumbnail version.
 *
 * Uses the `video_comments` table with `comment_type = 'thumbnail'` to
 * distinguish from video playback comments. Version-scoped: each thumbnail
 * version has its own comment thread.
 */
import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CommentThread, VideoComment } from "../../preview/hooks/use-video-comments";

export const thumbnailCommentsKey = (videoId: string) => ["thumbnail-comments", videoId] as const;

export function useThumbnailComments(
  videoId: string | null | undefined,
  versionId: string | null | undefined,
) {
  const queryClient = useQueryClient();
  const { user, tenantId, role } = useAuth();

  const query = useQuery({
    queryKey: [...thumbnailCommentsKey(videoId ?? ""), versionId ?? "all"],
    enabled: !!videoId,
    queryFn: async (): Promise<VideoComment[]> => {
      if (!videoId) return [];

      let q = supabase
        .from("video_comments")
        .select(
          `id, tenant_id, video_id, version_id, user_id, parent_comment_id,
           comment, comment_type, timestamp_seconds, timestamp_end_seconds,
           mentioned_user_ids, status, resolved_at,
           resolved_by, is_internal, guest_name, guest_email, created_at, updated_at`,
        )
        .eq("video_id", videoId)
        .eq("comment_type", "thumbnail")
        .eq("status", "active")
        .order("created_at", { ascending: true });

      // Scope to the current thumbnail version (but include legacy unscoped)
      if (versionId) {
        q = q.or(`version_id.eq.${versionId},version_id.is.null`);
      }

      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as VideoComment[];

      // Batch-fetch author profiles
      const authorIds = Array.from(
        new Set(rows.map((r) => r.user_id).filter((id): id is string => !!id)),
      );
      if (authorIds.length === 0) return rows;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url")
        .in("id", authorIds);
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

      return rows.map((r) => ({
        ...r,
        author: r.user_id
          ? {
              full_name: byId.get(r.user_id)?.full_name ?? null,
              display_name: byId.get(r.user_id)?.display_name ?? null,
              avatar_url: byId.get(r.user_id)?.avatar_url ?? null,
            }
          : null,
      }));
    },
  });

  // Realtime subscription
  // Unique channel name per mount to avoid stale channel collisions
  useEffect(() => {
    if (!videoId) return;
    const channelName = `thumbnail-comments:${videoId}:${Date.now()}`;

    // Remove any stale channel with the same base prefix
    const existingChannels = supabase.getChannels();
    for (const ch of existingChannels) {
      if (ch.topic.startsWith(`realtime:thumbnail-comments:${videoId}`)) {
        supabase.removeChannel(ch);
      }
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_comments",
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: thumbnailCommentsKey(videoId) });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, queryClient]);

  // Build threaded structure
  const threads = useMemo<CommentThread[]>(() => {
    const all = query.data ?? [];
    // Filter out internal comments for clients
    const visible = role === "client" ? all.filter((c) => !c.is_internal) : all;

    const byParent = new Map<string, VideoComment[]>();
    const roots: VideoComment[] = [];
    for (const c of visible) {
      if (c.parent_comment_id) {
        const arr = byParent.get(c.parent_comment_id) ?? [];
        arr.push(c);
        byParent.set(c.parent_comment_id, arr);
      } else {
        roots.push(c);
      }
    }
    return roots
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((root) => ({
        ...root,
        replies: (byParent.get(root.id) ?? []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
      }));
  }, [query.data, role]);

  // ── Mutations ───────────────────────────────────────────────────

  const addComment = useMutation({
    mutationFn: async (input: {
      comment: string;
      isInternal?: boolean;
      parentCommentId?: string | null;
      mentionedUserIds?: string[];
    }) => {
      if (!videoId) throw new Error("No video selected");
      const payload = {
        video_id: videoId,
        tenant_id: tenantId ?? null,
        user_id: user?.id ?? null,
        comment: input.comment.trim(),
        comment_type: "thumbnail",
        version_id: versionId ?? null,
        is_internal: input.isInternal ?? false,
        parent_comment_id: input.parentCommentId ?? null,
        mentioned_user_ids: input.mentionedUserIds ?? [],
        timestamp_seconds: null,
        timestamp_end_seconds: null,
      };
      const { data, error } = await supabase
        .from("video_comments")
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: thumbnailCommentsKey(videoId) });
      }
    },
  });

  const resolveComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("video_comments")
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id ?? null,
        } as never)
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: thumbnailCommentsKey(videoId) });
      }
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from("video_comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: thumbnailCommentsKey(videoId) });
      }
    },
  });

  // ── Action handlers with toast feedback ─────────────────────────

  const handleAddComment = useCallback(
    async (body: string, isInternal: boolean, mentionedUserIds?: string[]) => {
      try {
        await addComment.mutateAsync({
          comment: body,
          isInternal,
          mentionedUserIds,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to post comment");
      }
    },
    [addComment],
  );

  const handleReply = useCallback(
    async (parentId: string, body: string) => {
      try {
        await addComment.mutateAsync({
          comment: body,
          parentCommentId: parentId,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reply");
      }
    },
    [addComment],
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
    threads,
    isLoading: query.isLoading,
    error: query.error,
    addComment,
    handleAddComment,
    handleReply,
    handleResolve,
    handleDelete,
  };
}
