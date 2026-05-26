/**
 * useVideoVersions — fetch + realtime-sync versions for a video.
 *
 * Returns versions sorted by version_number ascending (v1, v2…), plus
 * the currently active version (is_current) when one is flagged.
 */
import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface VideoVersion {
  id: string;
  video_id: string;
  tenant_id: string;
  version_number: number;
  version_type: string;
  custom_version_label: string | null;
  is_current: boolean | null;
  video_cloudflare_id: string | null;
  video_playback_url: string | null;
  video_thumbnail_url: string | null;
  video_duration: number | null;
  video_file_name: string | null;
  video_upload_status: string | null;
  uploaded_at: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const videoVersionsKey = (videoId: string) => ["video-versions", videoId] as const;

export function useVideoVersions(videoId: string | null | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: videoVersionsKey(videoId ?? ""),
    enabled: !!videoId,
    queryFn: async (): Promise<VideoVersion[]> => {
      if (!videoId) return [];
      const { data, error } = await supabase
        .from("video_versions")
        .select(
          `id, video_id, tenant_id, version_number, version_type,
           custom_version_label, is_current, video_cloudflare_id,
           video_playback_url, video_thumbnail_url, video_duration,
           video_file_name, video_upload_status, uploaded_at, uploaded_by,
           created_at, updated_at`,
        )
        .eq("video_id", videoId)
        .order("version_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as VideoVersion[];
    },
  });

  // Realtime
  useEffect(() => {
    if (!videoId) return;
    const channelId = `video-versions:${videoId}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_versions",
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: videoVersionsKey(videoId) });
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
      // Two-step swap: unset all → set target. Fast enough to avoid flicker.
      const { error: clearErr } = await supabase
        .from("video_versions")
        .update({ is_current: false })
        .eq("video_id", videoId);
      if (clearErr) throw clearErr;

      const { error: setErr } = await supabase
        .from("video_versions")
        .update({ is_current: true })
        .eq("id", versionId);
      if (setErr) throw setErr;
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: videoVersionsKey(videoId) });
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

export function getVersionLabel(v: VideoVersion): string {
  if (v.custom_version_label && v.custom_version_label.trim()) {
    return v.custom_version_label;
  }
  return `v${v.version_number}`;
}
