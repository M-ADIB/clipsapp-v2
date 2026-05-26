/**
 * Pure reducer for the VideosGrid.
 */
import type { CellAddress, CellRange, GridSelection } from "./types";

export interface GridState {
  selection: GridSelection;
  editing: CellAddress | null;
  clipboard: { value: unknown; type: string } | null;
}

export const INITIAL_GRID_STATE: GridState = {
  selection: { rows: new Set(), active: null, anchor: null, range: null },
  editing: null,
  clipboard: null,
};

export type GridAction =
  | { type: "SELECT_ROW"; rowId: string; mode: "toggle" | "only" | "range"; allRowIds?: string[] }
  | { type: "SELECT_ALL_ROWS"; rowIds: string[] }
  | { type: "CLEAR_ROW_SELECTION" }
  | { type: "FOCUS_CELL"; address: CellAddress }
  | { type: "EXTEND_RANGE"; focus: CellAddress }
  | { type: "SET_RANGE"; range: CellRange | null }
  | { type: "BEGIN_EDIT"; address: CellAddress }
  | { type: "END_EDIT" }
  | { type: "COPY"; value: unknown; cellType: string }
  | { type: "RESET" };

export function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case "SELECT_ROW": {
      const next = new Set(state.selection.rows);
      if (action.mode === "only") {
        next.clear();
        next.add(action.rowId);
      } else if (action.mode === "range" && action.allRowIds && state.selection.active) {
        const start = action.allRowIds.indexOf(state.selection.active.rowId);
        const end = action.allRowIds.indexOf(action.rowId);
        if (start !== -1 && end !== -1) {
          const [a, b] = start < end ? [start, end] : [end, start];
          for (let i = a; i <= b; i++) next.add(action.allRowIds[i]);
        } else {
          next.add(action.rowId);
        }
      } else if (next.has(action.rowId)) {
        next.delete(action.rowId);
      } else {
        next.add(action.rowId);
      }
      return { ...state, selection: { ...state.selection, rows: next } };
    }
    case "SELECT_ALL_ROWS": {
      const allSelected = state.selection.rows.size === action.rowIds.length;
      return {
        ...state,
        selection: {
          ...state.selection,
          rows: allSelected ? new Set() : new Set(action.rowIds),
        },
      };
    }
    case "CLEAR_ROW_SELECTION":
      return {
        ...state,
        selection: { ...state.selection, rows: new Set() },
      };
    case "FOCUS_CELL":
      return {
        ...state,
        selection: {
          ...state.selection,
          active: action.address,
          anchor: action.address,
          range: null,
        },
        editing: null,
      };
    case "EXTEND_RANGE": {
      const anchor = state.selection.anchor ?? state.selection.active ?? action.focus;
      return {
        ...state,
        selection: {
          ...state.selection,
          active: action.focus,
          anchor,
          range: { anchor, focus: action.focus },
        },
        editing: null,
      };
    }
    case "SET_RANGE":
      return {
        ...state,
        selection: { ...state.selection, range: action.range },
      };
    case "BEGIN_EDIT":
      return { ...state, editing: action.address };
    case "END_EDIT":
      return { ...state, editing: null };
    case "COPY":
      return {
        ...state,
        clipboard: { value: action.value, type: action.cellType },
      };
    case "RESET":
      return INITIAL_GRID_STATE;
    default:
      return state;
  }
}
