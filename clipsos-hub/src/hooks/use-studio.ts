/**
 * useStudio — TanStack Query hooks for the Content Studio module.
 *
 * Tables used:
 *  - `studio_scripts`     → Scripts per cycle
 *  - `studio_hooks`       → Hooks library
 *  - `content_vault`      → Reference content vault
 *  - `client_foundation`  → Client brain (foundation, bios, avatars, pillars, transcripts)
 *  - `cycles`             → Content cycles
 *
 * All queries are tenant-scoped via the AuthContext.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type {
  StudioScript,
  StudioHook,
  ContentVaultEntry,
  ClientFoundation,
  Cycle,
  TablesInsert,
} from "@/integrations/supabase/db-types";

// ─── Cycles ───────────────────────────────────────────────────────────────

export function useClientCycles(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.studio.sessions(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cycles")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("cycle_number", { ascending: true });

      if (error) throw error;
      return data as Cycle[];
    },
    enabled: !!tenantId && !!clientId,
  });
}

export function useCreateCycle() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"cycles">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("cycles")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studio.sessions(tenantId!, variables.client_id),
      });
    },
  });
}

// ─── Cycle Body (freeform content) ────────────────────────────────────────

/** Fetch the body_json for a specific cycle (used by CycleEditor). */
export function useCycleBody(cycleId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ["studio", "cycle-body", tenantId, cycleId],
    queryFn: async () => {
      // body_json exists on the DB but not yet in generated types —
      // use select('*') and cast to access it safely.
      const { data, error } = await supabase
        .from("cycles")
        .select("*")
        .eq("id", cycleId!)
        .eq("tenant_id", tenantId!)
        .single();

      if (error) throw error;
      const row = data as Record<string, unknown>;
      return (row?.body_json as Record<string, unknown>) ?? null;
    },
    enabled: !!tenantId && !!cycleId,
  });
}

/** Save cycle freeform content (body_json) — called on editor blur. */
export function useUpdateCycleBody() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cycleId, body_json }: { cycleId: string; body_json: unknown }) => {
      // body_json column exists but not in generated types yet —
      // use type assertion to bypass.
      const { error } = await supabase
        .from("cycles")
        .update({ body_json } as never)
        .eq("id", cycleId)
        .eq("tenant_id", tenantId!);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studio", "cycle-body", tenantId, variables.cycleId],
      });
    },
  });
}

/** Update foundation_ready flag on client_foundation. */
export function useToggleFoundationReady() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, ready }: { clientId: string; ready: boolean }) => {
      // foundation_ready column exists but not in generated types yet —
      // use type assertion to bypass.
      const { error } = await supabase
        .from("client_foundation")
        .upsert(
          {
            client_id: clientId,
            tenant_id: tenantId!,
            foundation_ready: ready,
          } as never,
          { onConflict: "client_id" }
        );

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studio.brain(tenantId!, variables.clientId),
      });
    },
  });
}

// ─── Scripts (per cycle) ──────────────────────────────────────────────────

export function useStudioScripts(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.studio.scripts(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_scripts")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as StudioScript[];
    },
    enabled: !!tenantId && !!clientId,
  });
}

export function useCycleScripts(cycleId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ["studio", "cycle-scripts", tenantId, cycleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_scripts")
        .select("*")
        .eq("cycle_id", cycleId!)
        .eq("tenant_id", tenantId!)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as StudioScript[];
    },
    enabled: !!tenantId && !!cycleId,
  });
}

export function useCreateScript() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"studio_scripts">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("studio_scripts")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studio.scripts(tenantId!, variables.client_id),
      });
      if (variables.cycle_id) {
        queryClient.invalidateQueries({
          queryKey: ["studio", "cycle-scripts", tenantId, variables.cycle_id],
        });
      }
    },
  });
}

export function useUpdateScript() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      client_id,
      ...updates
    }: { id: string; client_id?: string } & Partial<StudioScript>) => {
      const { data, error } = await supabase
        .from("studio_scripts")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      if (variables.client_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.studio.scripts(tenantId!, variables.client_id),
        });
      }
      // Also invalidate cycle-level queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "studio" &&
          query.queryKey[1] === "cycle-scripts",
      });
    },
  });
}

export function useDeleteScript() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; client_id: string; cycle_id?: string }) => {
      const { error } = await supabase
        .from("studio_scripts")
        .delete()
        .eq("id", input.id)
        .eq("tenant_id", tenantId!);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studio.scripts(tenantId!, variables.client_id),
      });
      if (variables.cycle_id) {
        queryClient.invalidateQueries({
          queryKey: ["studio", "cycle-scripts", tenantId, variables.cycle_id],
        });
      }
    },
  });
}

// ─── Hooks Library ────────────────────────────────────────────────────────

export function useStudioHooks(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.studio.hooks(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_hooks")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as StudioHook[];
    },
    enabled: !!tenantId && !!clientId,
  });
}

export function useCreateHook() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"studio_hooks">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("studio_hooks")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studio.hooks(tenantId!, variables.client_id),
      });
    },
  });
}

// ─── Content Vault ────────────────────────────────────────────────────────

export function useContentVault(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.studio.vault(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_vault")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContentVaultEntry[];
    },
    enabled: !!tenantId && !!clientId,
  });
}

export function useCreateVaultEntry() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"content_vault">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("content_vault")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studio.vault(tenantId!, variables.client_id),
      });
    },
  });
}

// ─── Client Brain (Foundation) ────────────────────────────────────────────

export function useClientBrain(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.studio.brain(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_foundation")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .maybeSingle();

      if (error) throw error;
      return data as ClientFoundation | null;
    },
    enabled: !!tenantId && !!clientId,
  });
}

/** Alias used by PillarsView — same query, clearer name for the view */
export const useClientFoundation = useClientBrain;

export function useUpdateClientBrain() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      ...updates
    }: { clientId: string } & Partial<ClientFoundation>) => {
      const { data, error } = await supabase
        .from("client_foundation")
        .upsert(
          {
            client_id: clientId,
            tenant_id: tenantId!,
            ...updates,
          },
          { onConflict: "client_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studio.brain(tenantId!, variables.clientId),
      });
    },
  });
}

/** Updates foundation by row id (used by PillarsView for pillar_contents save) */
export function useUpdateFoundation() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ClientFoundation>) => {
      const { data, error } = await supabase
        .from("client_foundation")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all foundation queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "studio" &&
          query.queryKey[1] === "brain",
      });
    },
  });
}

// ─── Client Docs (Google Doc Style) ───────────────────────────────────────

export function useClientDocs(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ["studio", "docs", tenantId, clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_docs")
        .select("*")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!tenantId && !!clientId,
  });
}

export function useCreateClientDoc() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, title }: { clientId: string; title: string }) => {
      const { data, error } = await supabase
        .from("client_docs")
        .insert({
          client_id: clientId,
          tenant_id: tenantId!,
          title,
          content: { type: "doc", content: [{ type: "paragraph" }] },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studio", "docs", tenantId, variables.clientId],
      });
    },
  });
}

export function useUpdateClientDoc() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      clientId,
      ...updates
    }: { id: string; clientId: string; title?: string; content?: any }) => {
      const { data, error } = await supabase
        .from("client_docs")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studio", "docs", tenantId, variables.clientId],
      });
    },
  });
}

export function useDeleteClientDoc() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase
        .from("client_docs")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId!);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studio", "docs", tenantId, variables.clientId],
      });
    },
  });
}

// ─── Studio Templates (Custom strategist templates) ───────────────────────

export function useStudioTemplates() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ["studio", "templates", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_templates")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateStudioTemplate() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, emoji, questions }: { name: string; emoji: string; questions: any[] }) => {
      const { data, error } = await supabase
        .from("studio_templates")
        .insert({
          tenant_id: tenantId!,
          name,
          emoji,
          questions,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studio", "templates", tenantId],
      });
    },
  });
}
