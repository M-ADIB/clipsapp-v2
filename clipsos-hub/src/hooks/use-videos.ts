/**
 * useVideos — fetch + mutate videos with version/comment support.
 *
 * The video table is the largest domain object, with relationships to:
 *  - clients, projects, cycles (ownership)
 *  - statuses, video_types (lookups)
 *  - video_versions, video_comments, trial_reels (children)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/db-types";

// ─── List all videos (tenant-wide) ─────────────────────────────────────────

export function useVideos(filters?: { clientId?: string; projectId?: string; statusId?: string }) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.videos.list(tenantId!, filters),
    queryFn: async () => {
      let query = supabase
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
        .is("archived_at", null);

      if (filters?.clientId) query = query.eq("client_id", filters.clientId);
      if (filters?.projectId) query = query.eq("project_id", filters.projectId);
      if (filters?.statusId) query = query.eq("status_id", filters.statusId);

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

// ─── Videos by client ───────────────────────────────────────────────────────

export function useVideosByClient(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.videos.byClient(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          status:statuses!videos_status_id_fkey(id, display_name, slug, color),
          video_type:video_types!videos_video_type_id_fkey(id, display_name, slug),
          project:projects!videos_project_id_fkey(id, project_name),
          cycle:cycles!videos_cycle_id_fkey(id, name, cycle_number)
        `,
        )
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!clientId,
  });
}

// ─── Single video detail ────────────────────────────────────────────────────

export function useVideo(videoId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.videos.detail(tenantId!, videoId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          status:statuses!videos_status_id_fkey(*),
          video_type:video_types!videos_video_type_id_fkey(*),
          client:clients!videos_client_id_fkey(id, name, logo_url),
          project:projects!videos_project_id_fkey(id, project_name),
          cycle:cycles!videos_cycle_id_fkey(id, name, cycle_number)
        `,
        )
        .eq("id", videoId!)
        .eq("tenant_id", tenantId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!videoId,
  });
}

// ─── Create video ───────────────────────────────────────────────────────────

export function useCreateVideo() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"videos">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("videos")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all(tenantId!) });
    },
  });
}

// ─── Update video ───────────────────────────────────────────────────────────

export function useUpdateVideo() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"videos"> & { id: string }) => {
      const { data, error } = await supabase
        .from("videos")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all(tenantId!) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.videos.detail(tenantId!, variables.id),
      });
    },
  });
}

// ─── Video versions ─────────────────────────────────────────────────────────

export function useVideoVersions(videoId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.videos.versions(tenantId!, videoId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_versions")
        .select("*")
        .eq("video_id", videoId!)
        .eq("tenant_id", tenantId!)
        .order("version_number", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!videoId,
  });
}

// ─── Video comments ─────────────────────────────────────────────────────────

export function useVideoComments(videoId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.videos.comments(tenantId!, videoId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_comments")
        .select("*")
        .eq("video_id", videoId!)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!videoId,
  });
}

// ─── Create video comment ───────────────────────────────────────────────────

export function useCreateVideoComment() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"video_comments">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("video_comments")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.videos.comments(tenantId!, variables.video_id),
      });
    },
  });
}

// ─── Video status history ───────────────────────────────────────────────────

export function useVideoStatusHistory(videoId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.videos.statusHistory(tenantId!, videoId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_status_history")
        .select("*")
        .eq("video_id", videoId!)
        .eq("tenant_id", tenantId!)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!videoId,
  });
}
