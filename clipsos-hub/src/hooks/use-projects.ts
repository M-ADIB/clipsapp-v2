/**
 * useProjects / useCycles — fetch + mutate projects and cycles.
 *
 * Projects belong to clients and contain cycles (production batches).
 * Cycles contain videos.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/db-types";

// ─── List all projects ──────────────────────────────────────────────────────

export function useProjects() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.all(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          client:clients!projects_client_id_fkey(id, name, logo_url),
          template:project_type_templates!projects_project_type_template_id_fkey(id, display_name, icon)
        `,
        )
        .eq("tenant_id", tenantId!)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

// ─── Projects by client ─────────────────────────────────────────────────────

export function useProjectsByClient(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.byClient(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          template:project_type_templates!projects_project_type_template_id_fkey(id, display_name, icon)
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

// ─── Single project detail ──────────────────────────────────────────────────

export function useProject(projectId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.detail(tenantId!, projectId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          client:clients!projects_client_id_fkey(id, name, logo_url),
          template:project_type_templates!projects_project_type_template_id_fkey(*)
        `,
        )
        .eq("id", projectId!)
        .eq("tenant_id", tenantId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!projectId,
  });
}

// ─── Create project ─────────────────────────────────────────────────────────

export function useCreateProject() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"projects">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(tenantId!) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.byClient(tenantId!, variables.client_id),
      });
    },
  });
}

// ─── Update project ─────────────────────────────────────────────────────────

export function useUpdateProject() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"projects"> & { id: string }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(tenantId!) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(tenantId!, variables.id),
      });
    },
  });
}

// ─── Cycles by project ──────────────────────────────────────────────────────

export function useCycles(projectId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.cycles.list(tenantId!, projectId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cycles")
        .select("*")
        .eq("project_id", projectId!)
        .eq("tenant_id", tenantId!)
        .order("cycle_number");

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!projectId,
  });
}

// ─── Cycles by client ───────────────────────────────────────────────────────

export function useCyclesByClient(clientId: string | undefined) {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.cycles.byClient(tenantId!, clientId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cycles")
        .select(
          `
          *,
          project:projects!cycles_project_id_fkey(id, project_name)
        `,
        )
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!clientId,
  });
}

// ─── Create cycle ───────────────────────────────────────────────────────────

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
        queryKey: queryKeys.cycles.list(tenantId!, variables.project_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.cycles.byClient(tenantId!, variables.client_id),
      });
    },
  });
}
