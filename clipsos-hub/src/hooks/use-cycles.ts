/**
 * use-cycles — list/create/update cycles for a client.
 *
 * Cycles are auto-created (Cycle 1) on project insert via DB trigger.
 * Team leads can add Cycle 2/3/… manually via `useCreateCycle`.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Cycle } from "@/integrations/supabase/db-types";

export const cyclesKey = (tenantId: string, clientId: string | null | undefined) =>
  ["cycles", tenantId, clientId ?? "all"] as const;

export function useCyclesForClient(clientId: string | null | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: cyclesKey(tenantId ?? "", clientId),
    enabled: !!tenantId && !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cycles")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("client_id", clientId!)
        .order("cycle_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Cycle[];
    },
  });
}

export function useCreateCycle(clientId: string | null | undefined) {
  const { tenantId } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { projectId: string; name?: string }) => {
      if (!tenantId || !clientId) throw new Error("Missing tenant or client");
      // Compute next number via RPC helper
      const { data: nextNum, error: rpcErr } = await supabase.rpc(
        "next_cycle_number" as never,
        { _project_id: args.projectId } as never,
      );
      if (rpcErr) throw rpcErr;
      const cycle_number = Number(nextNum ?? 1);
      const name = args.name?.trim() || `Cycle ${cycle_number}`;
      const { data, error } = await supabase
        .from("cycles")
        .insert({
          tenant_id: tenantId,
          client_id: clientId,
          project_id: args.projectId,
          name,
          cycle_number,
          order_index: cycle_number - 1,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Cycle;
    },
    onSuccess: () => {
      toast.success("Cycle created");
      qc.invalidateQueries({ queryKey: cyclesKey(tenantId ?? "", clientId) });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not create cycle"),
  });
}

export function useUpdateCycle(clientId: string | null | undefined) {
  const { tenantId } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; patch: Partial<Cycle> }) => {
      const { error } = await supabase
        .from("cycles")
        .update(args.patch as never)
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cyclesKey(tenantId ?? "", clientId) });
    },
    onError: () => toast.error("Could not update cycle"),
  });
}
