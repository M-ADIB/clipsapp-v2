/**
 * useVideoAnnotations — fetch annotations for a video, plus a save mutation.
 *
 * Annotations are tied to either a comment (preferred) or stand alone with
 * just a frame_timestamp. We always insert; updates happen by deleting and
 * re-inserting (annotations are small + immutable per draw session).
 */
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import type { AnnotationPayload, VideoAnnotation } from "../annotations/types";

export const videoAnnotationsKey = (videoId: string) => ["video-annotations", videoId] as const;

export function useVideoAnnotations(videoId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  const query = useQuery({
    queryKey: videoAnnotationsKey(videoId ?? ""),
    enabled: !!videoId,
    queryFn: async (): Promise<VideoAnnotation[]> => {
      if (!videoId) return [];
      const { data, error } = await supabase
        .from("video_annotations")
        .select("*")
        .eq("video_id", videoId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as VideoAnnotation[];
    },
  });

  // Realtime — invalidate when annotations change for this video
  useEffect(() => {
    if (!videoId) return;
    const channelId = `video-annotations:${videoId}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_annotations",
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: videoAnnotationsKey(videoId) });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, queryClient]);

  const saveAnnotation = useMutation({
    mutationFn: async (input: {
      annotationData: AnnotationPayload;
      frameTimestamp: number;
      commentId?: string | null;
      versionId?: string | null;
      frameThumbnail?: string | null;
    }) => {
      if (!videoId) throw new Error("No video selected");
      const payload = {
        video_id: videoId,
        tenant_id: tenantId,
        annotation_data: input.annotationData as unknown as object,
        frame_timestamp: input.frameTimestamp,
        comment_id: input.commentId ?? null,
        version_id: input.versionId ?? null,
        frame_thumbnail: input.frameThumbnail ?? null,
      };
      const { data, error } = await supabase
        .from("video_annotations")
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: videoAnnotationsKey(videoId) });
      }
    },
  });

  const deleteAnnotation = useMutation({
    mutationFn: async (annotationId: string) => {
      const { error } = await supabase.from("video_annotations").delete().eq("id", annotationId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: videoAnnotationsKey(videoId) });
      }
    },
  });

  return {
    annotations: query.data ?? [],
    isLoading: query.isLoading,
    saveAnnotation,
    deleteAnnotation,
  };
}
