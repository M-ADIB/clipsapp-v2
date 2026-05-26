/**
 * GridQueueContext — exposes the visible row ids of the current grid so
 * cell-level launchers (e.g. VideoCell) can wire prev/next navigation
 * inside the VideoPreviewModal without re-passing props through every
 * cell renderer.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

interface GridQueueValue {
  ids: string[];
}

const GridQueueContext = createContext<GridQueueValue | null>(null);

export function GridQueueProvider({ ids, children }: { ids: string[]; children: ReactNode }) {
  // Stable reference per id-list identity so consumers don't re-render
  // on every parent render.
  const value = useMemo(() => ({ ids }), [ids]);
  return <GridQueueContext.Provider value={value}>{children}</GridQueueContext.Provider>;
}

export function useGridQueue(): GridQueueValue | null {
  return useContext(GridQueueContext);
}
