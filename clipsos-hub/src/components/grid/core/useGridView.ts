/**
 * useGridView — manages saved views (per user + tenant-shared) for a grid page.
 *
 * Each row in `saved_filter_views` is one view. The active view's `filters`
 * JSONB column holds the entire ViewConfig. We expose:
 *   - view: the active config (always present, falls back to EMPTY_VIEW)
 *   - setView: patch the active config (debounced upsert)
 *   - views: list of available named views
 *   - activeId: id of active view (null = unsaved Default)
 *   - selectView / saveAs / updateActive / toggleShared / deleteView
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { EMPTY_VIEW, type ViewConfig } from "./types";

const viewsKey = (userId: string, tenantId: string, page: string) =>
  ["grid", "views", userId, tenantId, page] as const;

export interface SavedViewSummary {
  id: string;
  name: string;
  is_default: boolean;
  is_shared: boolean;
  is_owner: boolean;
}

export function useGridView(page: string) {
  const { user, tenantId } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;

  /* ──────────────────────────────────────────────────────────────── */
  /* Load all available views                                         */
  /* ──────────────────────────────────────────────────────────────── */
  const viewsQuery = useQuery({
    queryKey: viewsKey(userId ?? "", tenantId ?? "", page),
    enabled: !!userId && !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_filter_views")
        .select("id, user_id, name, page, filters, is_default, is_shared")
        .eq("page", page)
        .or(`user_id.eq.${userId},and(is_shared.eq.true,tenant_id.eq.${tenantId})`)
        .order("is_default", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const allViews = viewsQuery.data ?? [];

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ViewConfig | null>(null);

  // Pick a default active view on first load: user's default → first shared → null
  useEffect(() => {
    if (activeId !== null || draft !== null) return;
    const own = allViews.find((v) => v.user_id === userId && v.is_default);
    if (own) {
      setActiveId(own.id);
      setDraft({ ...EMPTY_VIEW, ...((own.filters as Partial<ViewConfig>) ?? {}) });
    }
  }, [allViews, userId, activeId, draft]);

  const activeView = allViews.find((v) => v.id === activeId);
  const view: ViewConfig = useMemo(() => draft ?? EMPTY_VIEW, [draft]);

  const summaries: SavedViewSummary[] = allViews.map((v) => ({
    id: v.id,
    name: v.name,
    is_default: v.is_default,
    is_shared: v.is_shared,
    is_owner: v.user_id === userId,
  }));

  /* ──────────────────────────────────────────────────────────────── */
  /* Mutations                                                        */
  /* ──────────────────────────────────────────────────────────────── */

  const upsertView = useMutation({
    mutationFn: async (args: {
      id?: string;
      name: string;
      filters: ViewConfig;
      is_default?: boolean;
      is_shared?: boolean;
    }) => {
      if (!userId || !tenantId) return;
      const payload = {
        ...(args.id ? { id: args.id } : {}),
        tenant_id: tenantId,
        user_id: userId,
        page,
        name: args.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filters: args.filters as any,
        is_default: args.is_default ?? false,
        is_shared: args.is_shared ?? false,
      };
      const { data, error } = await supabase
        .from("saved_filter_views")
        .upsert(payload, { onConflict: args.id ? "id" : "user_id,page,name" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: viewsKey(userId ?? "", tenantId ?? "", page) }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save view"),
  });

  const deleteView = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_filter_views").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("View deleted");
      qc.invalidateQueries({ queryKey: viewsKey(userId ?? "", tenantId ?? "", page) });
    },
  });

  /* ──────────────────────────────────────────────────────────────── */
  /* Public API                                                       */
  /* ──────────────────────────────────────────────────────────────── */

  const setView = useCallback(
    (patch: Partial<ViewConfig>) => {
      const next = { ...view, ...patch };
      setDraft(next);
      // Auto-persist if we're editing a view we own
      if (activeView && activeView.user_id === userId) {
        upsertView.mutate({
          id: activeView.id,
          name: activeView.name,
          filters: next,
          is_default: activeView.is_default,
          is_shared: activeView.is_shared,
        });
      }
    },
    [view, activeView, userId, upsertView],
  );

  const selectView = useCallback(
    (id: string | null) => {
      setActiveId(id);
      if (id === null) {
        setDraft(EMPTY_VIEW);
        return;
      }
      const v = allViews.find((x) => x.id === id);
      if (v) setDraft({ ...EMPTY_VIEW, ...((v.filters as Partial<ViewConfig>) ?? {}) });
    },
    [allViews],
  );

  const saveAs = useCallback(
    async (name: string) => {
      const result = await upsertView.mutateAsync({ name, filters: view });
      if (result?.id) {
        setActiveId(result.id);
        toast.success("View saved");
      }
    },
    [upsertView, view],
  );

  const updateActive = useCallback(() => {
    if (!activeView || activeView.user_id !== userId) return;
    upsertView.mutate({
      id: activeView.id,
      name: activeView.name,
      filters: view,
      is_default: activeView.is_default,
      is_shared: activeView.is_shared,
    });
    toast.success("View updated");
  }, [activeView, userId, upsertView, view]);

  const toggleShared = useCallback(
    (id: string, shared: boolean) => {
      const v = allViews.find((x) => x.id === id);
      if (!v || v.user_id !== userId) return;
      upsertView.mutate({
        id: v.id,
        name: v.name,
        filters: { ...EMPTY_VIEW, ...((v.filters as Partial<ViewConfig>) ?? {}) },
        is_default: v.is_default,
        is_shared: shared,
      });
    },
    [allViews, userId, upsertView],
  );

  return {
    view,
    setView,
    isLoading: viewsQuery.isLoading,
    /* multi-view API */
    views: summaries,
    activeId,
    selectView,
    saveAs,
    updateActive,
    toggleShared,
    deleteView: (id: string) => {
      deleteView.mutate(id);
      if (activeId === id) {
        setActiveId(null);
        setDraft(EMPTY_VIEW);
      }
    },
  };
}
