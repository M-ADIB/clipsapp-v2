/**
 * useGridColumns — merges built-in columns with custom_columns from DB,
 * applies the user's view (visibility, order, widths, labels), and
 * returns a stable, ordered, filtered list of GridColumn.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

import { BUILTIN_COLUMNS, defaultVisibleColumns } from "./builtinColumns";
import { useColumnLabels } from "./useColumnLabels";
import type { CellType, CustomColumn, GridColumn, GridScope, ViewConfig } from "./types";

type CustomColumnRow = Database["public"]["Tables"]["custom_columns"]["Row"];

export const customColumnsKey = (tenantId: string, projectId?: string) =>
  ["grid", "custom_columns", tenantId, projectId ?? "tenant"] as const;

export function useGridColumns(scope: GridScope, view: ViewConfig) {
  const { tenantId, role } = useAuth();
  const { labels: tenantLabels } = useColumnLabels();

  const customColumnsQuery = useQuery({
    queryKey: customColumnsKey(tenantId ?? "", scope.projectId),
    queryFn: async () => {
      let q = supabase.from("custom_columns").select("*").eq("tenant_id", tenantId!);

      if (scope.projectId) {
        q = q.or(`project_id.eq.${scope.projectId},project_id.is.null`);
      } else {
        q = q.is("project_id", null);
      }

      const { data, error } = await q.order("order_index", { ascending: true });
      if (error) throw error;
      return data as CustomColumnRow[];
    },
    enabled: !!tenantId,
    staleTime: 30_000,
  });

  const columns = useMemo<GridColumn[]>(() => {
    const defaults = defaultVisibleColumns(role);
    // Tenant rename map first, user view override wins on top.
    const userLabels = view.labels ?? {};
    const widths = view.widths ?? {};
    const hidden = new Set(view.hidden ?? []);
    const labelFor = (id: string, fallback: string) =>
      userLabels[id] ?? tenantLabels[id] ?? fallback;

    // Start with built-ins
    const builtins: GridColumn[] = BUILTIN_COLUMNS.map((c, idx) => ({
      ...c,
      order: idx,
      visible: !hidden.has(c.id) && defaults.has(c.id),
      width: widths[c.id] ?? c.width,
      label: labelFor(c.id, c.label),
    }));

    // Append custom columns
    const customs: CustomColumn[] = (customColumnsQuery.data ?? []).map((c, idx) => ({
      source: "custom",
      id: `custom:${c.id}`,
      customColumnId: c.id,
      label: labelFor(`custom:${c.id}`, c.column_name),
      type: (c.column_type as CellType) ?? "text",
      width: widths[`custom:${c.id}`] ?? c.width_px ?? 150,
      sortable: true,
      editableBy: c.editable_roles ?? [],
      visible: !hidden.has(`custom:${c.id}`) && (c.show_in_table ?? true),
      order: BUILTIN_COLUMNS.length + idx,
      options: Array.isArray(c.options) ? (c.options as string[]) : undefined,
    }));

    const all = [...builtins, ...customs];

    // Apply user-defined order, if present
    if (view.order && view.order.length > 0) {
      const orderMap = new Map(view.order.map((id, i) => [id, i]));
      all.sort((a, b) => {
        const ai = orderMap.get(a.id) ?? 1000 + a.order;
        const bi = orderMap.get(b.id) ?? 1000 + b.order;
        return ai - bi;
      });
    }

    return all;
  }, [customColumnsQuery.data, role, view, tenantLabels]);

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  return {
    columns,
    visibleColumns,
    isLoading: customColumnsQuery.isLoading,
    refetch: customColumnsQuery.refetch,
  };
}
