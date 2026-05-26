/**
 * useClients — fetch + mutate clients for the current tenant.
 *
 * Provides:
 *  - useClients()              → all clients for the tenant
 *  - useClient(clientId)       → single client detail by UUID
 *  - useClientBySlug(slug)     → single client detail by slug (vanity URLs)
 *  - useCreateClient()         → mutation to create a client
 *  - useUpdateClient()         → mutation to patch a client
 *  - useClientNotes(clientId)  → notes for a client
 *  - useCreateClientNote()     → mutation to add a note
 *
 * All queries are tenant-scoped via the AuthContext.
 * RLS enforces row-level access — these hooks just query.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type { TablesInsert, TablesUpdate, ClientNote } from "@/integrations/supabase/db-types";

// ─── List all clients ───────────────────────────────────────────────────────

export function useClients() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.clients.all(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("tenant_id", tenantId!)
        .is("archived_at", null)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

// ─── Single client detail (by UUID) ─────────────────────────────────────────

export function useClient(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.clients.detail(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select(
          `
          *,
          deal_owner:profiles!clients_deal_owner_id_fkey(id, full_name, avatar_url),
          person:crm_people!fk_clients_person(id, full_name, email)
        `,
        )
        .eq("id", clientId!)
        .eq("tenant_id", tenantId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!clientId,
  });
}

// ─── Single client detail (by slug — vanity URL) ────────────────────────────

export function useClientBySlug(slug: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.clients.bySlug(tenantId!, slug!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select(
          `
          *,
          deal_owner:profiles!clients_deal_owner_id_fkey(id, full_name, avatar_url),
          person:crm_people!fk_clients_person(id, full_name, email)
        `,
        )
        .eq("slug", slug!)
        .eq("tenant_id", tenantId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!slug,
  });
}

// ─── Create client ──────────────────────────────────────────────────────────

export function useCreateClient() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"clients">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all(tenantId!) });
    },
  });
}

// ─── Update client ──────────────────────────────────────────────────────────

export function useUpdateClient() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"clients"> & { id: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all(tenantId!) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.detail(tenantId!, variables.id),
      });
    },
  });
}

// ─── Client members ─────────────────────────────────────────────────────────

export function useClientMembers(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.clients.members(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_members")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!clientId,
  });
}

// ─── Client journey steps ───────────────────────────────────────────────────

export function useClientJourney(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.clients.journey(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_journey_steps")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!clientId,
  });
}

// ─── Client foundation ─────────────────────────────────────────────────────

export function useClientFoundation(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.clients.foundation(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_foundation")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!clientId,
  });
}

// ─── Client notes ───────────────────────────────────────────────────────────

export function useClientNotes(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.clients.notes(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_notes")
        .select(
          `
          *,
          author:profiles!client_notes_author_id_fkey(id, full_name, avatar_url)
        `,
        )
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (ClientNote & {
        author: { id: string; full_name: string | null; avatar_url: string | null } | null;
      })[];
    },
    enabled: !!tenantId && !!clientId,
  });
}

// ─── Create client note ─────────────────────────────────────────────────────

export function useCreateClientNote() {
  const { tenantId } = useAuth();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { client_id: string; title?: string; body: string }) => {
      const { data, error } = await supabase
        .from("client_notes")
        .insert({
          tenant_id: tenantId!,
          client_id: input.client_id,
          author_id: user?.id,
          title: input.title || null,
          body: input.body,
        })
        .select(
          `
          *,
          author:profiles!client_notes_author_id_fkey(id, full_name, avatar_url)
        `,
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.notes(tenantId!, variables.client_id),
      });
    },
  });
}

// ─── Update a journey step status ────────────────────────────────────────────

export function useUpdateJourneyStep() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      client_id: string;
      status?: string;
      step_label?: string;
      metadata?: any;
      order_index?: number;
      completed_at?: string | null;
    }) => {
      const { id, client_id, ...updates } = input;

      if (updates.status !== undefined && updates.completed_at === undefined) {
        updates.completed_at = updates.status === "completed" ? new Date().toISOString() : null;
      }

      const { data, error } = await supabase
        .from("client_journey_steps")
        .update(updates as any)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.journey(tenantId!, variables.client_id),
      });
    },
  });
}

export function useCreateJourneyStep() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      client_id: string;
      step_key: string;
      step_label: string;
      status: string;
      order_index: number;
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .from("client_journey_steps")
        .insert({
          ...input,
          tenant_id: tenantId!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.journey(tenantId!, variables.client_id),
      });
    },
  });
}

export function useDeleteJourneyStep() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; client_id: string }) => {
      const { error } = await supabase
        .from("client_journey_steps")
        .delete()
        .eq("id", input.id)
        .eq("tenant_id", tenantId!);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.journey(tenantId!, variables.client_id),
      });
    },
  });
}

export function useSeedJourneyFromTemplate() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      const { data: defaultSteps, error: fetchErr } = await supabase
        .from("custom_journey_steps")
        .select("*")
        .eq("tenant_id", tenantId!);

      if (fetchErr) throw fetchErr;

      const stepsToInsert: any[] = [];

      if (defaultSteps && defaultSteps.length > 0) {
        defaultSteps.forEach((step, idx) => {
          stepsToInsert.push({
            tenant_id: tenantId!,
            client_id: clientId,
            step_key: step.step_key,
            step_label: step.name,
            status: "upcoming",
            order_index: idx + 1,
            metadata: {
              description: step.client_description,
              phase:
                step.step_key.includes("rough") ||
                step.step_key.includes("samples") ||
                step.step_key.includes("batch")
                  ? "recurring"
                  : "onboarding",
              visibility: step.default_visibility || "client",
              component_key: step.component_key,
            },
          });
        });
      } else {
        const fallbacks = [
          {
            label: "Fill in onboarding document",
            desc: "Fill out the onboarding document so we can learn about your brand.",
            key: "onboarding_doc",
            phase: "onboarding",
          },
          {
            label: "Book Kickoff call",
            desc: "Schedule a call with your content strategist to align on your vision.",
            key: "kickoff_call",
            phase: "onboarding",
          },
          {
            label: "Book Practice session",
            desc: "Get comfortable on camera with a guided practice session.",
            key: "practice_session",
            phase: "onboarding",
          },
          {
            label: "Book Shoot",
            desc: "Pick a date and location for your professional content shoot.",
            key: "book_shoot",
            phase: "onboarding",
          },
          {
            label: "Rough cuts",
            desc: "Your editor is creating the first draft of your videos.",
            key: "rough_cuts",
            phase: "recurring",
          },
          {
            label: "First Batch",
            desc: "Your first set of polished, ready-to-post videos.",
            key: "first_batch",
            phase: "recurring",
          },
        ];

        fallbacks.forEach((fb, idx) => {
          stepsToInsert.push({
            tenant_id: tenantId!,
            client_id: clientId,
            step_key: fb.key,
            step_label: fb.label,
            status: "upcoming",
            order_index: idx + 1,
            metadata: {
              description: fb.desc,
              phase: fb.phase,
              visibility: "client",
            },
          });
        });
      }

      const { data, error } = await supabase
        .from("client_journey_steps")
        .insert(stepsToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.journey(tenantId!, variables.clientId),
      });
    },
  });
}

/** Check if the current client user's foundation is ready (onboarding sent/complete) */
export function useClientFoundationReady() {
  const { user, role } = useAuth();

  const { data: clientAccess, isLoading: accessLoading } = useQuery({
    queryKey: ["client_access_ready", user?.id],
    enabled: role === "client" && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_access")
        .select("client_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const clientId = clientAccess?.[0]?.client_id;

  const { data: foundation, isLoading: foundationLoading } = useQuery({
    queryKey: ["client_foundation_status", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_foundation")
        .select("foundation_ready")
        .eq("client_id", clientId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return {
    clientId,
    isReady: foundation?.foundation_ready === true,
    isLoading: (role === "client" && accessLoading) || foundationLoading,
  };
}

// ─── Client team/editor assignments ─────────────────────────────────────────

export function useClientTeamAssignments() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ["client_team_assignments", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_team_assignments")
        .select(`
          *,
          profile:profiles!client_team_assignments_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq("tenant_id", tenantId!);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useAssignTeamMember() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, userId }: { clientId: string; userId: string }) => {
      const { data, error } = await supabase
        .from("client_team_assignments")
        .insert({
          client_id: clientId,
          user_id: userId,
          tenant_id: tenantId!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_team_assignments", tenantId] });
    },
  });
}

export function useUnassignTeamMember() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, userId }: { clientId: string; userId: string }) => {
      const { error } = await supabase
        .from("client_team_assignments")
        .delete()
        .eq("client_id", clientId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_team_assignments", tenantId] });
    },
  });
}

