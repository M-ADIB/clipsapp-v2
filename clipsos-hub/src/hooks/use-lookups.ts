/**
 * useLookups — fetch tenant-scoped lookup tables.
 *
 * Small, infrequently-changing datasets with long staleTime (5 min).
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

const LOOKUP_STALE_TIME = 5 * 60 * 1000;

export function useStatuses() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.statuses.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("statuses")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useDealStages() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.dealStages.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_stages")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useVideoTypes() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.videoTypes.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_types")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useProjectTypeTemplates() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.projectTypeTemplates.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_type_templates")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: LOOKUP_STALE_TIME,
  });
}
