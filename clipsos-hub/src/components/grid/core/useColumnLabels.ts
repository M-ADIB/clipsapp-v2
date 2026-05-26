/**
 * useColumnLabels — tenant-wide rename map for built-in & custom columns.
 *
 * Backed by `tenants.video_column_labels` JSONB:
 *   { "video_title": "Idea", "custom:abc": "Hook score" }
 *
 * Only owner/manager/senior_editor can update; others get read-only.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const labelsKey = (tenantId: string) => ["grid", "column_labels", tenantId] as const;

export function useColumnLabels() {
  const { tenantId, role } = useAuth();
  const qc = useQueryClient();

  const canRename = role === "owner" || role === "manager" || role === "senior_editor";

  const query = useQuery({
    queryKey: labelsKey(tenantId ?? ""),
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase
        .from("tenants")
        .select("video_column_labels")
        .eq("id", tenantId!)
        .maybeSingle();
      if (error) throw error;
      return (data?.video_column_labels as Record<string, string>) ?? {};
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });

  const update = useMutation({
    mutationFn: async (next: Record<string, string>) => {
      if (!tenantId) return;
      const { error } = await supabase
        .from("tenants")
        .update({ video_column_labels: next })
        .eq("id", tenantId);
      if (error) throw error;
    },
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: labelsKey(tenantId ?? "") });
      const prev = qc.getQueryData(labelsKey(tenantId ?? ""));
      qc.setQueryData(labelsKey(tenantId ?? ""), next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(labelsKey(tenantId ?? ""), ctx.prev);
      toast.error("Could not rename column");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: labelsKey(tenantId ?? "") }),
  });

  const setLabel = (columnId: string, label: string) => {
    const next = { ...(query.data ?? {}) };
    if (label.trim()) next[columnId] = label.trim();
    else delete next[columnId];
    update.mutate(next);
  };

  return {
    labels: query.data ?? {},
    canRename,
    setLabel,
    isLoading: query.isLoading,
  };
}
