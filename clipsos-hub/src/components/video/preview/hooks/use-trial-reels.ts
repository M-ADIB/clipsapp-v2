/**
 * useTrialReels — fetch + realtime sync for trial hook variants on a video.
 */
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface TrialReel {
  id: string;
  video_id: string;
  version_id: string | null;
  tenant_id: string;
  trial_number: number;
  trial_date: string | null;
  hook_description: string | null;
  hook_cloudflare_id: string | null;
  hook_playback_url: string | null;
  hook_thumbnail_url: string | null;
  hook_duration: number | null;
  hook_upload_status: string | null;
  is_active: boolean | null;
  is_winner: boolean | null;
  created_at: string;
  updated_at: string;
}

export const trialReelsKey = (videoId: string) => ["trial-reels", videoId] as const;

export function useTrialReels(videoId: string | null | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: trialReelsKey(videoId ?? ""),
    enabled: !!videoId,
    queryFn: async (): Promise<TrialReel[]> => {
      if (!videoId) return [];
      const { data, error } = await supabase
        .from("trial_reels")
        .select(
          `id, video_id, version_id, tenant_id, trial_number, trial_date,
           hook_description, hook_cloudflare_id, hook_playback_url,
           hook_thumbnail_url, hook_duration, hook_upload_status,
           is_active, is_winner, created_at, updated_at`,
        )
        .eq("video_id", videoId)
        .order("trial_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TrialReel[];
    },
  });

  useEffect(() => {
    if (!videoId) return;
    const channel = supabase
      .channel(`trial-reels:${videoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trial_reels",
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: trialReelsKey(videoId) });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, queryClient]);

  return {
    trials: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
