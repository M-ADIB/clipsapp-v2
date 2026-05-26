/**
 * useThumbnailVersions — fetch + realtime-sync thumbnail versions for a video.
 *
 * Returns versions sorted by version_number ascending (v1, v2…), plus
 * the currently active version (is_current) when one is flagged.
 */
import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface ThumbnailVersion {
  id: string;
  tenant_id: string;
  video_id: string;
  version_number: number;
  thumbnail_url: string;
  thumbnail_storage_path: string;
  is_current: boolean | null;
  version_notes: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  created_at: string;
  /** Joined from profiles — populated after fetch. */
  uploader?: {
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const thumbnailVersionsKey = (videoId: string) => ["thumbnail-versions", videoId] as const;

export function useThumbnailVersions(videoId: string | null | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: thumbnailVersionsKey(videoId ?? ""),
    enabled: !!videoId,
    queryFn: async (): Promise<ThumbnailVersion[]> => {
      if (!videoId) return [];
      const { data, error } = await supabase
        .from("thumbnail_versions")
        .select(
          `id, tenant_id, video_id, version_number, thumbnail_url,
           thumbnail_storage_path, is_current, version_notes,
           uploaded_by, uploaded_at, created_at`,
        )
        .eq("video_id", videoId)
        .order("version_number", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as ThumbnailVersion[];

      // Batch-fetch uploader profiles
      const uploaderIds = Array.from(
        new Set(rows.map((r) => r.uploaded_by).filter((id): id is string => !!id)),
      );
      if (uploaderIds.length === 0) return rows;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url")
        .in("id", uploaderIds);
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

      return rows.map((r) => ({
        ...r,
        uploader: r.uploaded_by
          ? {
              full_name: byId.get(r.uploaded_by)?.full_name ?? null,
              display_name: byId.get(r.uploaded_by)?.display_name ?? null,
              avatar_url: byId.get(r.uploaded_by)?.avatar_url ?? null,
            }
          : null,
      }));
    },
  });

  // Realtime subscription
  // Use a unique channel name per mount to avoid "cannot add callbacks after
  // subscribe()" errors when the dialog is reopened (stale channel collision).
  useEffect(() => {
    if (!videoId) return;
    const channelName = `thumbnail-versions:${videoId}:${Date.now()}`;

    // Remove any stale channel with the same base prefix before creating new one
    const existingChannels = supabase.getChannels();
    for (const ch of existingChannels) {
      if (ch.topic.startsWith(`realtime:thumbnail-versions:${videoId}`)) {
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
          table: "thumbnail_versions",
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: thumbnailVersionsKey(videoId) });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, queryClient]);

  const versions = query.data ?? [];

  const currentVersion = useMemo(
    () => versions.find((v) => v.is_current) ?? versions[versions.length - 1] ?? null,
    [versions],
  );

  const setCurrentVersion = useMutation({
    mutationFn: async (versionId: string) => {
      if (!videoId) throw new Error("No video selected");
      // Two-step: unset all, then set the target. Wrapped in RLS.
      const { error: e1 } = await supabase
        .from("thumbnail_versions")
        .update({ is_current: false } as never)
        .eq("video_id", videoId);
      if (e1) throw e1;

      const { error: e2 } = await supabase
        .from("thumbnail_versions")
        .update({ is_current: true } as never)
        .eq("id", versionId);
      if (e2) throw e2;
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: thumbnailVersionsKey(videoId) });
      }
    },
  });

  return {
    versions,
    currentVersion,
    isLoading: query.isLoading,
    error: query.error,
    setCurrentVersion,
  };
}

export function getThumbnailVersionLabel(v: ThumbnailVersion): string {
  return `v${v.version_number}`;
}
