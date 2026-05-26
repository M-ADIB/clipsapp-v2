/**
 * useEmailTemplates — fetch + mutate email templates for the current tenant.
 *
 * The Email Hub is the single source of truth for all transactional emails.
 * Edge Functions look up templates by `slug`; the UI edits them by id.
 *
 * NOTE: This hook references columns added by the Phase 1 migration
 * (category, headline, body, cta_text, cta_url, preview_text, edit_mode).
 * Until that migration runs in Supabase, those columns will be null and
 * the editor will show empty fields — but the page will still render.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

export interface EmailTemplate {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  variables: string[] | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  // Phase 1 additions (may be null until migration runs)
  category?: string | null;
  headline?: string | null;
  body?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  preview_text?: string | null;
  edit_mode?: "visual" | "html" | string | null;
}

// ─── List ───────────────────────────────────────────────────────────────────

export function useEmailTemplates() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: queryKeys.emailTemplates.list(tenantId!),
    queryFn: async (): Promise<EmailTemplate[]> => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("name");

      if (error) throw error;
      return (data as unknown as EmailTemplate[]) ?? [];
    },
    enabled: !!tenantId,
  });
}

// ─── Update ─────────────────────────────────────────────────────────────────

export interface EmailTemplatePatch {
  id: string;
  name?: string;
  subject?: string;
  body_html?: string;
  is_active?: boolean;
  category?: string | null;
  headline?: string | null;
  body?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  preview_text?: string | null;
  edit_mode?: "visual" | "html";
}

export function useUpdateEmailTemplate() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: EmailTemplatePatch) => {
      const { data, error } = await supabase
        .from("email_templates")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(updates as any)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as EmailTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailTemplates.list(tenantId!),
      });
    },
  });
}
