/**
 * useVideoComments — fetch + mutate comments for a video.
 *
 * Returns a flat list plus a derived threaded tree (top-level + replies).
 * Realtime: subscribes to postgres_changes on video_comments for this video.
 */
import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VideoComment {
  id: string;
  tenant_id: string;
  video_id: string;
  version_id: string | null;
  user_id: string | null;
  parent_comment_id: string | null;
  comment: string;
  comment_type: string | null;
  timestamp_seconds: number | null;
  timestamp_end_seconds: number | null;
  mentioned_user_ids: string[] | null;
  status: string;
  resolved_at: string | null;
  resolved_by: string | null;
  is_internal: boolean | null;
  guest_name: string | null;
  guest_email: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface CommentThread extends VideoComment {
  replies: VideoComment[];
}

export const videoCommentsKey = (videoId: string) => ["video-comments", videoId] as const;

export function useVideoComments(videoId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { user, tenantId } = useAuth();

  const query = useQuery({
    queryKey: videoCommentsKey(videoId ?? ""),
    enabled: !!videoId,
    queryFn: async (): Promise<VideoComment[]> => {
      if (!videoId) return [];
      const { data, error } = await supabase
        .from("video_comments")
        .select(
          `id, tenant_id, video_id, version_id, user_id, parent_comment_id,
           comment, comment_type, timestamp_seconds, timestamp_end_seconds,
           mentioned_user_ids, status, resolved_at,
           resolved_by, is_internal, guest_name, guest_email, created_at, updated_at`,
        )
        .eq("video_id", videoId)
        .eq("status", "active")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as VideoComment[];

      // Fetch author profiles in one batch.
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
  useEffect(() => {
    if (!videoId) return;
    const channelId = `video-comments:${videoId}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_comments",
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: videoCommentsKey(videoId) });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, queryClient]);

  const threads = useMemo<CommentThread[]>(() => {
    const all = query.data ?? [];
    const byParent = new Map<string, VideoComment[]>();
    const roots: VideoComment[] = [];
    for (const c of all) {
      if (c.parent_comment_id) {
        const arr = byParent.get(c.parent_comment_id) ?? [];
        arr.push(c);
        byParent.set(c.parent_comment_id, arr);
      } else {
        roots.push(c);
      }
    }
    return roots
      .sort((a, b) => {
        const at = a.timestamp_seconds ?? Number.POSITIVE_INFINITY;
        const bt = b.timestamp_seconds ?? Number.POSITIVE_INFINITY;
        if (at !== bt) return at - bt;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      })
      .map((root) => ({
        ...root,
        replies: (byParent.get(root.id) ?? []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
      }));
  }, [query.data]);

  const addComment = useMutation({
    mutationFn: async (input: {
      comment: string;
      timestampSeconds?: number | null;
      timestampEndSeconds?: number | null;
      mentionedUserIds?: string[];
      parentCommentId?: string | null;
      versionId?: string | null;
      isInternal?: boolean;
      guestName?: string | null;
      guestEmail?: string | null;
    }) => {
      if (!videoId) throw new Error("No video selected");
      const payload = {
        video_id: videoId,
        tenant_id: tenantId ?? null,
        user_id: user?.id ?? null,
        comment: input.comment.trim(),
        timestamp_seconds: input.timestampSeconds ?? null,
        timestamp_end_seconds: input.timestampEndSeconds ?? null,
        mentioned_user_ids: input.mentionedUserIds ?? [],
        parent_comment_id: input.parentCommentId ?? null,
        version_id: input.versionId ?? null,
        is_internal: input.isInternal ?? false,
        guest_name: input.guestName ?? null,
        guest_email: input.guestEmail ?? null,
      };
      const { data, error } = await supabase
        .from("video_comments")
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    // Optimistic update — show the comment instantly in the sidebar.
    onMutate: async (input) => {
      if (!videoId) return;
      await queryClient.cancelQueries({ queryKey: videoCommentsKey(videoId) });

      const previous = queryClient.getQueryData<VideoComment[]>(videoCommentsKey(videoId));

      const optimistic: VideoComment = {
        id: `optimistic-${crypto.randomUUID()}`,
        tenant_id: tenantId ?? "",
        video_id: videoId,
        version_id: input.versionId ?? null,
        user_id: user?.id ?? null,
        parent_comment_id: input.parentCommentId ?? null,
        comment: input.comment.trim(),
        comment_type: null,
        timestamp_seconds: input.timestampSeconds ?? null,
        timestamp_end_seconds: input.timestampEndSeconds ?? null,
        mentioned_user_ids: input.mentionedUserIds ?? null,
        status: "active",
        resolved_at: null,
        resolved_by: null,
        is_internal: input.isInternal ?? false,
        guest_name: input.guestName ?? null,
        guest_email: input.guestEmail ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: user ? { full_name: null, display_name: null, avatar_url: null } : null,
      };

      queryClient.setQueryData<VideoComment[]>(videoCommentsKey(videoId), (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous };
    },
    onError: (_err, _input, context) => {
      // Rollback on failure
      if (videoId && context?.previous) {
        queryClient.setQueryData(videoCommentsKey(videoId), context.previous);
      }
    },
    onSettled: () => {
      // Always re-fetch to reconcile with server truth
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: videoCommentsKey(videoId) });
      }
    },
  });

  const resolveComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("video_comments")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id ?? null,
        } as never)
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: videoCommentsKey(videoId) });
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
        queryClient.invalidateQueries({ queryKey: videoCommentsKey(videoId) });
      }
    },
  });

  const refresh = useCallback(() => {
    if (videoId) {
      queryClient.invalidateQueries({ queryKey: videoCommentsKey(videoId) });
    }
  }, [videoId, queryClient]);

  return {
    comments: query.data ?? [],
    threads,
    isLoading: query.isLoading,
    error: query.error,
    addComment,
    resolveComment,
    deleteComment,
    refresh,
  };
}
