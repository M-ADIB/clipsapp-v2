/**
 * useGridMutations — single place for cell + row writes.
 *
 * Built-in fields → videos table. Custom fields → custom_column_values.
 * Editors → video_editors join table (special-cased).
 * Bulk update / archive / duplicate / add row also live here.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { gridRowsKey, type GridPagination } from "./useGridRows";
import type { GridColumn, GridScope } from "./types";

interface UpdateCellArgs {
  rowId: string;
  column: GridColumn;
  value: unknown;
}

export function useGridMutations(scope: GridScope, pagination?: GridPagination) {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  // Must match the exact key used by useGridRows (including pagination)
  const rowsKey = gridRowsKey(tenantId ?? "", scope, pagination);

  const invalidateAll = () => {
    // Broad invalidation — catches all pagination variants
    qc.invalidateQueries({ queryKey: ["grid", "rows"] });
    qc.invalidateQueries({ queryKey: ["grid", "values"] });
    qc.invalidateQueries({ queryKey: ["grid", "video_editors"] });
  };

  /* ── Editors join helper ─────────────────────────────────── */
  const setEditors = async (videoId: string, editorIds: string[]) => {
    if (!tenantId) return;
    // Fetch existing
    const { data: existing } = await supabase
      .from("video_editors")
      .select("id, editor_id")
      .eq("video_id", videoId);
    const have = new Set((existing ?? []).map((r) => r.editor_id));
    const want = new Set(editorIds);
    const toAdd = editorIds.filter((id) => !have.has(id));
    const toRemove = (existing ?? []).filter((r) => !want.has(r.editor_id)).map((r) => r.id);

    if (toRemove.length > 0) {
      await supabase.from("video_editors").delete().in("id", toRemove);
    }
    if (toAdd.length > 0) {
      await supabase.from("video_editors").insert(
        toAdd.map((editor_id) => ({
          tenant_id: tenantId,
          editor_id,
          video_id: videoId,
          assigned_by: user?.id ?? null,
        })),
      );
    }
  };

  /* ── Helper to resolve video/thumbnail clear fields ──────── */
  const getVideoUpdateObject = (columnId: string, field: string, value: unknown) => {
    if (value === null) {
      if (columnId === "thumbnail") {
        return {
          video_thumbnail_url: null,
          thumbnail_storage_path: null,
        };
      }
      if (columnId === "video") {
        return {
          video_playback_url: null,
          video_cloudflare_id: null,
          video_file_name: null,
          video_file_size: null,
          video_original_storage_path: null,
          video_original_url: null,
          video_upload_status: null,
          video_upload_progress: null,
          video_error_message: null,
          video_uploaded_at: null,
          video_uploaded_by: null,
        };
      }
    }
    return { [field]: value };
  };

  /* ── Single-cell update ──────────────────────────────────── */
  const updateCell = useMutation({
    mutationFn: async ({ rowId, column, value }: UpdateCellArgs) => {
      if (!tenantId) return;
      if (column.source === "builtin") {
        if (column.id === "editors") {
          const ids = Array.isArray(value) ? (value as string[]) : [];
          await setEditors(rowId, ids);
          return;
        }
        if (column.id === "review") {
          // Stub: no write yet; review modal in Wave 4.
          return;
        }
        const update = getVideoUpdateObject(column.id, column.field, value) as never;
        const { error } = await supabase
          .from("videos")
          .update(update)
          .eq("id", rowId)
          .eq("tenant_id", tenantId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("custom_column_values").upsert(
          {
            tenant_id: tenantId,
            column_id: column.customColumnId,
            video_id: rowId,
            value: value == null ? null : String(value),
          },
          { onConflict: "column_id,video_id" },
        );
        if (error) throw error;
      }
    },
    onMutate: async ({ rowId, column, value }) => {
      await qc.cancelQueries({ queryKey: rowsKey });
      const previous = qc.getQueryData(rowsKey);
      // useGridRows stores { data: Video[], count: number } in the cache
      qc.setQueryData(
        rowsKey,
        (old: { data: Record<string, unknown>[]; count: number } | undefined) => {
          if (!old?.data) return old;
          if (column.source === "builtin" && column.id !== "editors" && column.id !== "review") {
            const updateObj = getVideoUpdateObject(column.id, column.field, value);
            return {
              ...old,
              data: old.data.map((v: Record<string, unknown>) =>
                v.id === rowId ? { ...v, ...updateObj } : v,
              ),
            };
          }
          return old;
        },
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(rowsKey, ctx.previous);
      toast.error("Failed to save change");
    },
    onSettled: invalidateAll,
  });

  /* ── Bulk archive ────────────────────────────────────────── */
  const archiveRows = useMutation({
    mutationFn: async (rowIds: string[]) => {
      if (!tenantId) return;
      const { error } = await supabase
        .from("videos")
        .update({ archived_at: new Date().toISOString() })
        .in("id", rowIds)
        .eq("tenant_id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Videos archived"),
    onError: () => toast.error("Failed to archive"),
    onSettled: invalidateAll,
  });

  /* ── Bulk update field ───────────────────────────────────── */
  const bulkUpdate = useMutation({
    mutationFn: async (args: { rowIds: string[]; patch: Record<string, unknown> }) => {
      if (!tenantId) return;
      const { error } = await supabase
        .from("videos")
        .update(args.patch as never)
        .in("id", args.rowIds)
        .eq("tenant_id", tenantId);
      if (error) throw error;
    },
    onError: () => toast.error("Bulk update failed"),
    onSettled: invalidateAll,
  });

  const bulkAssignEditor = useMutation({
    mutationFn: async (args: { rowIds: string[]; editorId: string }) => {
      if (!tenantId) return;
      // Insert one row per video, ignore conflict
      const inserts = args.rowIds.map((video_id) => ({
        tenant_id: tenantId,
        editor_id: args.editorId,
        video_id,
        assigned_by: user?.id ?? null,
      }));
      const { error } = await supabase.from("video_editors").upsert(inserts, {
        onConflict: "editor_id,client_id,project_id,video_id",
        ignoreDuplicates: true,
      });
      if (error) throw error;
    },
    onError: () => toast.error("Editor assign failed"),
    onSuccess: () => toast.success("Editor assigned"),
    onSettled: invalidateAll,
  });

  /* ── Duplicate ───────────────────────────────────────────── */
  const duplicateRow = useMutation({
    mutationFn: async (rowId: string) => {
      if (!tenantId) return;
      const { data: src, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", rowId)
        .single();
      if (error || !src) throw error ?? new Error("Source not found");
      const { id: _id, created_at: _ca, updated_at: _ua, order_index, ...rest } = src;
      const { error: insErr } = await supabase.from("videos").insert({
        ...rest,
        video_title: `${src.video_title} (copy)`,
        order_index: (order_index ?? 0) + 1,
        created_by: user?.id ?? null,
      });
      if (insErr) throw insErr;
    },
    onError: () => toast.error("Could not duplicate"),
    onSuccess: () => toast.success("Row duplicated"),
    onSettled: invalidateAll,
  });

  /* ── Add row ─────────────────────────────────────────────── */
  const addRow = useMutation({
    mutationFn: async (defaults: {
      client_id: string;
      project_id?: string;
      video_title?: string;
    }) => {
      if (!tenantId) return null;
      // Find max order_index
      const { data: maxRow } = await supabase
        .from("videos")
        .select("order_index")
        .eq("tenant_id", tenantId)
        .order("order_index", { ascending: false })
        .limit(1)
        .maybeSingle();
      const next = (maxRow?.order_index ?? 0) + 1;
      const { data, error } = await supabase
        .from("videos")
        .insert({
          tenant_id: tenantId,
          client_id: defaults.client_id,
          project_id: defaults.project_id ?? null,
          video_title: defaults.video_title ?? "Untitled video",
          order_index: next,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data?.id ?? null;
    },
    onError: () => toast.error("Could not add row"),
    onSettled: invalidateAll,
  });

  /* ── Move to top / bottom ───────────────────────────────── */
  const moveRowEdge = useMutation({
    mutationFn: async (args: { rowId: string; edge: "top" | "bottom" }) => {
      if (!tenantId) return;
      const { data: extreme } = await supabase
        .from("videos")
        .select("order_index")
        .eq("tenant_id", tenantId)
        .order("order_index", { ascending: args.edge === "top" })
        .limit(1)
        .maybeSingle();
      const next = (extreme?.order_index ?? 0) + (args.edge === "top" ? -1 : 1);
      await supabase.from("videos").update({ order_index: next }).eq("id", args.rowId);
    },
    onSettled: invalidateAll,
  });

  return {
    updateCell,
    archiveRows,
    deleteRows: archiveRows, // backward compat
    bulkUpdate,
    bulkAssignEditor,
    duplicateRow,
    addRow,
    moveRowEdge,
  };
}
