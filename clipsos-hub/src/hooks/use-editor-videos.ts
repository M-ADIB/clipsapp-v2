/**
 * useEditorVideos — fetch videos assigned to the current editor via `video_editors` join.
 *
 * Editors only see videos where they appear in the `video_editors` table.
 * This hook first resolves assigned video IDs, then fetches the full video rows
 * with joins to status, client, project, and cycle lookups.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

// ─── Assigned video IDs for current editor ──────────────────────────────────

export function useEditorAssignments() {
  const { user, tenantId } = useAuth();

  return useQuery({
    queryKey: ["editor", "assignments", tenantId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_editors")
        .select("video_id, client_id, project_id")
        .eq("editor_id", user!.id)
        .eq("tenant_id", tenantId!);

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!user?.id,
    staleTime: 60_000,
  });
}

// ─── Full video rows for assigned videos ────────────────────────────────────

export function useEditorVideos() {
  const { user, tenantId } = useAuth();
  const { data: assignments } = useEditorAssignments();

  const videoIds = (assignments ?? []).map((a) => a.video_id).filter((id): id is string => !!id);

  return useQuery({
    queryKey: ["editor", "videos", tenantId, user?.id, videoIds],
    queryFn: async () => {
      if (videoIds.length === 0) return [];

      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          status:statuses!videos_status_id_fkey(id, display_name, slug, color),
          video_type:video_types!videos_video_type_id_fkey(id, display_name, slug),
          client:clients!videos_client_id_fkey(id, name, logo_url),
          project:projects!videos_project_id_fkey(id, project_name),
          cycle:cycles!videos_cycle_id_fkey(id, name, cycle_number)
        `,
        )
        .eq("tenant_id", tenantId!)
        .in("id", videoIds)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!user?.id && videoIds.length > 0,
    staleTime: 60_000,
  });
}

// ─── Update video status (editor can change status of assigned videos) ──────

export function useEditorUpdateVideoStatus() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, statusId }: { videoId: string; statusId: string }) => {
      const { data, error } = await supabase
        .from("videos")
        .update({ status_id: statusId })
        .eq("id", videoId)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editor"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all(tenantId!) });
    },
  });
}

// ─── Editor's assigned client IDs (for filtering client chats) ──────────────

export function useEditorClientIds() {
  const { data: assignments } = useEditorAssignments();

  const clientIds = [
    ...new Set((assignments ?? []).map((a) => a.client_id).filter((id): id is string => !!id)),
  ];

  return clientIds;
}
