/**
 * use-custom-columns — data layer for the grid's `custom_columns` table.
 * Extracted from ColumnDialog so the dialog no longer issues inline Supabase
 * queries (keeps components UI-only; queries live in hooks).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/integrations/supabase/db-types";

export interface CustomColumnRow {
  id: string;
  column_name: string;
  column_type: string;
  options: string[] | null;
  width_px: number | null;
  editable_roles: AppRole[] | null;
}

export interface CustomColumnInput {
  column_name: string;
  column_type: string;
  options: string[] | null;
  width_px: number;
  editable_roles: AppRole[];
  project_id: string | null;
}

/** Fetch a single custom column by id (for the edit flow). */
export function useCustomColumn(columnId: string | null | undefined) {
  return useQuery({
    queryKey: ["customColumns", "detail", columnId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_columns")
        .select("*")
        .eq("id", columnId!)
        .single();
      if (error) throw error;
      return data as unknown as CustomColumnRow;
    },
    enabled: !!columnId,
  });
}

/** Create or update a custom column. Assigns the next order_index on insert. */
export function useSaveCustomColumn() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      columnId,
      input,
    }: {
      columnId?: string | null;
      input: CustomColumnInput;
    }) => {
      if (!tenantId) throw new Error("No tenant");
      const payload = { ...input, tenant_id: tenantId, show_in_table: true };

      if (columnId) {
        const { error } = await supabase.from("custom_columns").update(payload).eq("id", columnId);
        if (error) throw error;
        return;
      }

      const { data: existing } = await supabase
        .from("custom_columns")
        .select("order_index")
        .eq("tenant_id", tenantId)
        .order("order_index", { ascending: false })
        .limit(1);
      const next = (existing?.[0]?.order_index ?? 0) + 1;
      const { error } = await supabase
        .from("custom_columns")
        .insert({ ...payload, order_index: next });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customColumns"] });
    },
  });
}
