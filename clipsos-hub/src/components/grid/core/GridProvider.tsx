/**
 * GridProvider — context wrapper that owns reducer state + scope.
 *
 * Cells, header, toolbar and dialogs all read from this context so we
 * never have to thread a dozen props through the tree.
 */
import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

import { gridReducer, INITIAL_GRID_STATE, type GridAction, type GridState } from "./gridReducer";
import type { GridScope } from "./types";

interface GridContextValue {
  state: GridState;
  dispatch: (action: GridAction) => void;
  scope: GridScope;
  /** Convenience helpers */
  isRowSelected: (rowId: string) => boolean;
  isCellActive: (rowId: string, columnId: string) => boolean;
  isCellEditing: (rowId: string, columnId: string) => boolean;
}

const GridContext = createContext<GridContextValue | null>(null);

interface GridProviderProps {
  scope: GridScope;
  children: ReactNode;
}

export function GridProvider({ scope, children }: GridProviderProps) {
  const [state, dispatch] = useReducer(gridReducer, INITIAL_GRID_STATE);

  const isRowSelected = useCallback(
    (rowId: string) => state.selection.rows.has(rowId),
    [state.selection.rows],
  );

  const isCellActive = useCallback(
    (rowId: string, columnId: string) =>
      state.selection.active?.rowId === rowId && state.selection.active?.columnId === columnId,
    [state.selection.active],
  );

  const isCellEditing = useCallback(
    (rowId: string, columnId: string) =>
      state.editing?.rowId === rowId && state.editing?.columnId === columnId,
    [state.editing],
  );

  const value = useMemo<GridContextValue>(
    () => ({ state, dispatch, scope, isRowSelected, isCellActive, isCellEditing }),
    [state, scope, isRowSelected, isCellActive, isCellEditing],
  );

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
}

export function useGrid() {
  const ctx = useContext(GridContext);
  if (!ctx) {
    throw new Error("useGrid must be called inside <GridProvider>");
  }
  return ctx;
}
