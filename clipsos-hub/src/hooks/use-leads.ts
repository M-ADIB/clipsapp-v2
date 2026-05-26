/**
 * useLeads / useFollowUps — sales pipeline hooks.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/db-types";

export function useLeads() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.leads.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`*, person:crm_people!leads_person_id_fkey(id, full_name)`)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

export function useCreateLead() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"leads">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("leads")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads.list(tenantId!) });
    },
  });
}

export function useUpdateLead() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"leads"> & { id: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads.list(tenantId!) });
    },
  });
}

export function useFollowUps(filters?: { personId?: string }) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: filters?.personId
      ? queryKeys.followUps.byPerson(tenantId!, filters.personId)
      : queryKeys.followUps.list(tenantId!),
    queryFn: async () => {
      let query = supabase
        .from("follow_ups")
        .select(`*, person:crm_people!follow_ups_person_id_fkey(id, full_name)`)
        .eq("tenant_id", tenantId!);
      if (filters?.personId) query = query.eq("person_id", filters.personId);
      const { data, error } = await query.order("due_at");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

export function useCreateFollowUp() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"follow_ups">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("follow_ups")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.followUps.list(tenantId!) });
    },
  });
}

export function useCalendlyEvents() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.calendlyEvents.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendly_events")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}
