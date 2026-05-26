/**
 * useRowReorder — drag rows by `order_index`.
 *
 * Owner / manager / senior_editor only. Updates each moved row in a single
 * batch and invalidates the grid rows query on settle.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { gridRowsKey } from "./useGridRows";
import type { GridScope } from "./types";

export function useRowReorder(scope: GridScope) {
  const { tenantId, role } = useAuth();
  const qc = useQueryClient();
  const canReorder = role === "owner" || role === "manager" || role === "senior_editor";

  const reorder = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!tenantId) return;
      // Update each row's order_index. Could batch via RPC later.
      await Promise.all(
        orderedIds.map((id, idx) =>
          supabase
            .from("videos")
            .update({ order_index: idx })
            .eq("id", id)
            .eq("tenant_id", tenantId),
        ),
      );
    },
    onError: () => toast.error("Could not reorder rows"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: gridRowsKey(tenantId ?? "", scope) });
    },
  });

  return { canReorder, reorder };
}
