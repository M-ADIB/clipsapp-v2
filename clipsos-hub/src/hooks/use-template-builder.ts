/**
 * Hooks for the Template Builder — CRUD operations on project_type_templates
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/hooks/query-keys";
import type { TemplateConfig } from "@/lib/templateBuilder";
import type { Json } from "@/integrations/supabase/types";

// ─── Fetch single template ─────────────────────────────────────────────────

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("project_type_templates")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useTemplateBySlug(slug: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["template", "bySlug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("project_type_templates")
        .select("*")
        .eq("slug", slug)
        .eq("tenant_id", tenantId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug && !!tenantId,
  });
}

// ─── Create template ────────────────────────────────────────────────────────

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      display_name: string;
      slug: string;
      description?: string;
      icon?: string;
      default_cadence?: string;
      default_video_count?: number;
      default_posting_days?: string[];
      config?: TemplateConfig;
    }) => {
      if (!tenantId) throw new Error("No tenant");
      const { data, error } = await supabase
        .from("project_type_templates")
        .insert({
          tenant_id: tenantId,
          display_name: input.display_name,
          slug: input.slug,
          description: input.description ?? null,
          icon: input.icon ?? null,
          default_cadence: (input.default_cadence as never) ?? null,
          default_video_count: input.default_video_count ?? null,
          default_posting_days: input.default_posting_days ?? null,
          config: (input.config as unknown as Json) ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectTypeTemplates.list(tenantId!),
      });
    },
  });
}

// ─── Update template ────────────────────────────────────────────────────────

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      display_name?: string;
      description?: string;
      icon?: string;
      default_cadence?: string;
      default_video_count?: number;
      default_posting_days?: string[];
      config?: TemplateConfig;
    }) => {
      const { id, config, ...rest } = input;

      const { data, error } = await supabase
        .from("project_type_templates")
        .update({
          ...(rest.display_name !== undefined && { display_name: rest.display_name }),
          ...(rest.description !== undefined && { description: rest.description }),
          ...(rest.icon !== undefined && { icon: rest.icon }),
          ...(rest.default_cadence !== undefined && {
            default_cadence: rest.default_cadence as never,
          }),
          ...(rest.default_video_count !== undefined && {
            default_video_count: rest.default_video_count,
          }),
          ...(rest.default_posting_days !== undefined && {
            default_posting_days: rest.default_posting_days,
          }),
          ...(config !== undefined && {
            config: config as unknown as Json,
          }),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectTypeTemplates.list(tenantId!),
      });
    },
  });
}

// ─── Delete template ────────────────────────────────────────────────────────

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_type_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectTypeTemplates.list(tenantId!),
      });
    },
  });
}
