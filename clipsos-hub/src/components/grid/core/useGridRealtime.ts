/**
 * useGridRealtime — Supabase Realtime subscription for live grid updates.
 *
 * Subscribes to Postgres Changes on `videos`, `video_editors`, and
 * `custom_column_values` tables, scoped to the current tenant.
 * On any change from another session, the TanStack Query cache is
 * invalidated so the grid re-fetches automatically — no page refresh.
 *
 * Key design decisions:
 *   - 300ms debounce: batches rapid-fire events (e.g. bulk edits) into one refetch
 *   - Channel per grid instance: scoped by tenantId + full scope so concurrent
 *     cycle sections each get their own unique channel name
 *   - Stable dep primitives: scope fields are spread into primitive deps to avoid
 *     object-identity churn causing spurious re-subscriptions
 *   - Cleanup on unmount: unsubscribes the channel
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import type { GridScope } from "./types";
import { gridRowsKey } from "./useGridRows";

export function useGridRealtime(scope: GridScope) {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract primitive values to avoid object-identity re-subscription on every render
  const clientId = scope.clientId;
  const projectId = scope.projectId;
  const cycleId = scope.cycleId;

  useEffect(() => {
    if (!tenantId) return;

    const rowsKey = gridRowsKey(tenantId, scope);

    const debouncedInvalidate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        qc.invalidateQueries({ queryKey: rowsKey });
        qc.invalidateQueries({ queryKey: ["grid", "values"] });
        qc.invalidateQueries({ queryKey: ["grid", "video_editors"] });
      }, 300);
    };

    // Include cycleId in channel name so each cycle section gets a unique channel
    const channelName = [
      "grid-realtime",
      tenantId,
      clientId ?? "all",
      projectId ?? "all",
      cycleId ?? "all",
    ].join("-");

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "videos",
          filter: `tenant_id=eq.${tenantId}`,
        },
        debouncedInvalidate,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_editors",
          filter: `tenant_id=eq.${tenantId}`,
        },
        debouncedInvalidate,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "custom_column_values",
          filter: `tenant_id=eq.${tenantId}`,
        },
        debouncedInvalidate,
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
    // Use primitive deps (not scope object) to prevent re-subscription on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, clientId, projectId, cycleId, qc]);
}
