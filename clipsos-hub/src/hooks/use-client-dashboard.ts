/**
 * use-client-dashboard — pipeline stats + projects for the client home
 * dashboard. Extracted from ClientDashboard so the component carries no inline
 * Supabase queries.
 */
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PipelineStats {
  total: number;
  in_progress: number;
  review: number;
  scheduled: number;
  posted: number;
}

export function usePipelineStats(clientId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["client-pipeline", tenantId, clientId],
    enabled: !!tenantId && !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`id, status:statuses!videos_status_id_fkey(slug)`)
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .is("archived_at", null);

      if (error) throw error;

      const stats: PipelineStats = {
        total: data.length,
        in_progress: 0,
        review: 0,
        scheduled: 0,
        posted: 0,
      };

      for (const v of data) {
        const slug = (v.status as { slug?: string } | null)?.slug ?? "";
        switch (slug) {
          case "in_progress":
            stats.in_progress++;
            break;
          case "rough_cut":
          case "in_review":
          case "internal_review":
          case "final_review":
          case "revisions_requested":
            stats.review++;
            break;
          case "scheduled":
            stats.scheduled++;
            break;
          case "posted":
            stats.posted++;
            break;
        }
      }

      return stats;
    },
  });
}

export function useClientProjects(clientId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["client-projects", tenantId, clientId],
    enabled: !!tenantId && !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          id,
          project_name,
          status,
          video_count,
          videos_completed,
          progress,
          start_date,
          cadence
        `,
        )
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
