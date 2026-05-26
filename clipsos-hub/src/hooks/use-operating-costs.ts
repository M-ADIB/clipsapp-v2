/**
 * useOperatingCosts — CRUD hooks for the operating_costs table.
 * Finance data is owner-only at the RLS level.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/db-types";

// ── Types ────────────────────────────────────────────────────────────────────
export type OperatingCost = Tables<"operating_costs">;
export type OperatingCostInsert = TablesInsert<"operating_costs">;
export type OperatingCostUpdate = TablesUpdate<"operating_costs">;

// ── Query key ────────────────────────────────────────────────────────────────
const OPERATING_COSTS_KEY = "operating_costs";

// ── Hooks ───────────────────────────────────────────────────────────────────

export function useOperatingCosts() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: [OPERATING_COSTS_KEY, tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operating_costs")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("is_active", { ascending: false })
        .order("category")
        .order("name");
      if (error) throw error;
      return data as OperatingCost[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateOperatingCost() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<OperatingCostInsert, "tenant_id">) => {
      const { data, error } = await supabase
        .from("operating_costs")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();
      if (error) throw error;
      return data as OperatingCost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [OPERATING_COSTS_KEY, tenantId] });
    },
  });
}

export function useUpdateOperatingCost() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: OperatingCostUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("operating_costs")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();
      if (error) throw error;
      return data as OperatingCost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [OPERATING_COSTS_KEY, tenantId] });
    },
  });
}

export function useDeleteOperatingCost() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("operating_costs")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [OPERATING_COSTS_KEY, tenantId] });
    },
  });
}
