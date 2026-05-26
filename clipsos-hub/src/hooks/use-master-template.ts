/**
 * useMasterTemplate — fetch + mutate the email master template for the current tenant.
 *
 * The master template provides the global HTML wrapper (logo, accent color,
 * footer) that all individual email templates inherit.
 *
 * Each tenant has exactly one active master template (enforced by a unique
 * partial index on tenant_id WHERE is_active = true).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

export interface MasterTemplateRow {
  id: string;
  tenant_id: string;
  wrapper_html: string;
  logo_url: string;
  accent_color: string;
  footer_html: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MasterTemplatePatch {
  wrapper_html?: string;
  logo_url?: string;
  accent_color?: string;
  footer_html?: string;
}

// ─── Fetch ──────────────────────────────────────────────────────────────────

export function useMasterTemplate() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.masterTemplate.detail(tenantId!),
    queryFn: async (): Promise<MasterTemplateRow | null> => {
      const { data, error } = await supabase
        .from("email_master_template")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown as MasterTemplateRow) ?? null;
    },
    enabled: !!tenantId,
  });
}

// ─── Update ─────────────────────────────────────────────────────────────────

export function useUpdateMasterTemplate() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: MasterTemplatePatch & { id: string }) => {
      const { data, error } = await supabase
        .from("email_master_template")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(updates as any)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as MasterTemplateRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterTemplate.detail(tenantId!),
      });
    },
  });
}
