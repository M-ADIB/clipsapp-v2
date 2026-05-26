/**
 * useForms — Form Builder domain hooks (forms, fields, submissions).
 *
 * Aligned to actual DB schema:
 *   forms: is_published, is_archived, settings (jsonb), form_type
 *   form_fields: sort_order, help_text, validation, options (jsonb), width
 *   form_submissions: data (jsonb), submitter_email, status, created_at
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type { TablesInsert, TablesUpdate, Json } from "@/integrations/supabase/db-types";

// ── Forms ───────────────────────────────────────────────────────────────────

export function useForms(filters?: { published?: boolean }) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.forms.list(tenantId!, filters),
    queryFn: async () => {
      let query = supabase
        .from("forms")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });

      if (filters?.published !== undefined) {
        query = query.eq("is_published", filters.published);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

export function useForm(formId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.forms.detail(tenantId!, formId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId!)
        .eq("tenant_id", tenantId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!formId,
  });
}

/** Fetch a form by its slug (for slug-based edit URLs). */
export function useFormBySlug(slug: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.forms.all(tenantId!), "bySlug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("slug", slug!)
        .eq("tenant_id", tenantId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!slug,
  });
}

export function useCreateForm() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"forms">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("forms")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all(tenantId!) });
    },
  });
}

export function useUpdateForm() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"forms"> & { id: string }) => {
      const { data, error } = await supabase
        .from("forms")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all(tenantId!) });
      qc.invalidateQueries({
        queryKey: queryKeys.forms.detail(tenantId!, vars.id),
      });
    },
  });
}

export function useDeleteForm() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formId: string) => {
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", formId)
        .eq("tenant_id", tenantId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all(tenantId!) });
    },
  });
}

// ── Form Fields ─────────────────────────────────────────────────────────────

export function useFormFields(formId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.forms.fields(tenantId!, formId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId!)
        .eq("tenant_id", tenantId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!formId,
  });
}

export function useSaveFormFields() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      formId,
      fields,
    }: {
      formId: string;
      fields: Omit<TablesInsert<"form_fields">, "tenant_id" | "form_id">[];
    }) => {
      const { error: delError } = await supabase
        .from("form_fields")
        .delete()
        .eq("form_id", formId)
        .eq("tenant_id", tenantId!);
      if (delError) throw delError;

      if (fields.length === 0) return [];

      const rows = fields.map((f, i) => ({
        ...f,
        form_id: formId,
        tenant_id: tenantId!,
        sort_order: i,
      }));

      const { data, error } = await supabase.from("form_fields").insert(rows).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: queryKeys.forms.fields(tenantId!, vars.formId),
      });
    },
  });
}

// ── Submissions ─────────────────────────────────────────────────────────────

export function useFormSubmissions(
  formId: string | undefined,
  opts?: { page?: number; pageSize?: number },
) {
  const { tenantId } = useAuth();
  const page = opts?.page ?? 0;
  const pageSize = opts?.pageSize ?? 50;

  return useQuery({
    queryKey: queryKeys.forms.submissions(tenantId!, formId!),
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("form_submissions")
        .select("*", { count: "exact" })
        .eq("form_id", formId!)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data, total: count ?? 0 };
    },
    enabled: !!tenantId && !!formId,
  });
}

export function useFormSubmission(submissionId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.forms.submissionDetail(tenantId!, submissionId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("id", submissionId!)
        .eq("tenant_id", tenantId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!submissionId,
  });
}

// ── Public Form (no auth) ───────────────────────────────────────────────────

export function usePublicForm(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.forms.publicBySlug(slug!),
    queryFn: async () => {
      const { data: form, error: formErr } = await supabase
        .from("forms")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .eq("is_archived", false)
        .single();
      if (formErr) throw formErr;

      const { data: fields, error: fieldsErr } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", form.id)
        .order("sort_order", { ascending: true });
      if (fieldsErr) throw fieldsErr;

      return { form, fields };
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitPublicForm() {
  return useMutation({
    mutationFn: async ({
      formId,
      data: formData,
      tenantId,
      submitterEmail,
      submitterName,
    }: {
      formId: string;
      data: Record<string, unknown>;
      tenantId: string;
      submitterEmail?: string;
      submitterName?: string;
    }) => {
      const { data, error } = await supabase.rpc("submit_public_form", {
        p_form_id: formId,
        p_data: formData as Json,
        p_tenant_id: tenantId,
        p_submitter_email: submitterEmail,
        p_submitter_name: submitterName,
      });
      if (error) throw error;
      return data;
    },
  });
}
