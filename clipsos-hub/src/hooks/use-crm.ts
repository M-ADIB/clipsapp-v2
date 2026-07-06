/**
 * useCrm — CRM domain hooks (people, companies, deals, editors).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/db-types";

// ── People ──────────────────────────────────────────────────────────────────

/** Lightweight list — loads first 200 rows (use paginated version for full table) */
export function useCrmPeople() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.all(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_people")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

/** Server-side paginated people list with optional search & source filter */
export function useCrmPeoplePaginated({
  page = 0,
  pageSize = 50,
  search,
  source,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  source?: string;
} = {}) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.list(tenantId!, { page, pageSize, search, source }),
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      let query = supabase
        .from("crm_people")
        .select("*", { count: "exact" })
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (search?.trim()) {
        const q = `%${search.trim()}%`;
        query = query.or(`full_name.ilike.${q},email.ilike.${q},company_name.ilike.${q}`);
      }
      if (source) {
        query = query.eq("source", source);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data ?? [], totalCount: count ?? 0 };
    },
    enabled: !!tenantId,
    placeholderData: (prev) => prev,
  });
}

export function useCrmPerson(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.detail(tenantId!, personId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_people")
        .select("*")
        .eq("id", personId!)
        .eq("tenant_id", tenantId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!personId,
  });
}

// crm_people has no `slug` column (identified by `id`), so person routing uses
// the id. The route param is still named personSlug but carries the id value.
export function useCrmPersonById(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.crm.people.all(tenantId!), "byId", personId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_people")
        .select("*")
        .eq("id", personId!)
        .eq("tenant_id", tenantId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!personId,
  });
}

/** Deals linked to a specific person */
export function usePersonDeals(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.crm.deals.all(tenantId!), "byPerson", personId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_deals")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("person_id", personId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!personId,
  });
}

export function useCreateCrmPerson() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"crm_people">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("crm_people")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.crm.people.all(tenantId!) });
    },
  });
}

export function useUpdateCrmPerson() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"crm_people"> & { id: string }) => {
      const { data, error } = await supabase
        .from("crm_people")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: queryKeys.crm.people.all(tenantId!) });
      qc.invalidateQueries({ queryKey: queryKeys.crm.people.detail(tenantId!, v.id) });
    },
  });
}

/** Calendly events for a specific person */
export function usePersonCalendlyEvents(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.calendly(tenantId!, personId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendly_events")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("person_id", personId!)
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!personId,
  });
}

/** Follow-ups for a specific person */
export function usePersonFollowUps(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.followUps(tenantId!, personId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("person_id", personId!)
        .order("due_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!personId,
  });
}

/** Emails sent to this person (matched by email address) */
export function usePersonEmails(email: string | null | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.emails(tenantId!, email ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_queue")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("to_email", email!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!email,
  });
}

/** Leads linked to a specific person */
export function usePersonLeads(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.leads(tenantId!, personId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("person_id", personId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!personId,
  });
}

/** Form submissions linked to a specific person */
export function usePersonFormSubs(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.formSubs(tenantId!, personId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*, form:forms!form_submissions_form_id_fkey(id, title)")
        .eq("tenant_id", tenantId!)
        .eq("crm_person_id", personId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!personId,
  });
}

/** Tasks linked to a specific person (via linked_entity_type = 'person') */
export function usePersonTasks(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.tasks(tenantId!, personId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("linked_entity_type", "person")
        .eq("linked_entity_id", personId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!personId,
  });
}

/** Check if this person is linked to a client workspace */
export function usePersonLinkedClient(personId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.people.linkedClient(tenantId!, personId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, slug, person_id")
        .eq("person_id", personId!)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; name: string; slug: string; person_id: string } | null;
    },
    enabled: !!tenantId && !!personId,
  });
}

// ── Companies ───────────────────────────────────────────────────────────────

/** Single company detail */
export function useCrmCompany(companyId: string | null | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.companies.detail(tenantId!, companyId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_companies")
        .select("*")
        .eq("id", companyId!)
        .eq("tenant_id", tenantId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!companyId,
  });
}

export function useCrmCompanies() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.companies.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_companies")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

// ── Deals ───────────────────────────────────────────────────────────────────

export function useCrmDeals() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.deals.all(tenantId!),
    queryFn: async () => {
      // NOTE: stage_id is 0% populated — do NOT join deal_stages via FK.
      // person_id is ~66% populated — left join is safe but nullable.
      const { data, error } = await supabase
        .from("crm_deals")
        .select(
          `
          *,
          person:crm_people!crm_deals_person_id_fkey(id, full_name, email)
        `,
        )
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

export function useCreateCrmDeal() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"crm_deals">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("crm_deals")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.crm.deals.all(tenantId!) });
    },
  });
}

export function useUpdateCrmDeal() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"crm_deals"> & { id: string }) => {
      const { data, error } = await supabase
        .from("crm_deals")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.crm.deals.all(tenantId!) });
    },
  });
}

// ── Deal options ────────────────────────────────────────────────────────────

export function useCrmDealOptions() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.dealOptions.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_deal_options")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("category")
        .order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── CRM Editors (talent network) ────────────────────────────────────────────

export function useCrmEditors() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.crm.editors.list(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_editors")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}
