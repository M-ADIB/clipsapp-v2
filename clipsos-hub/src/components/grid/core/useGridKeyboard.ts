/**
 * useGridKeyboard — wires arrow / Enter / Escape / Tab / clipboard
 * shortcuts onto a grid container.
 *
 * Range support (Wave 3.6):
 *   - Shift+Arrow / Shift+Tab extends the rectangle range from the anchor.
 *   - Cmd/Ctrl+C copies the range as TSV to the system clipboard.
 *   - Cmd/Ctrl+V pastes a TSV grid starting at the active cell.
 */
import { useEffect } from "react";

import { useGrid } from "./GridProvider";
import { parseTsv, rangeBounds, rangeToTsv } from "./rangeUtils";
import type { GridColumn, GridRow } from "./types";

interface UseGridKeyboardArgs {
  rows: GridRow[];
  columns: GridColumn[];
  enabled?: boolean;
  onCommitFromClipboard?: (rowId: string, column: GridColumn, value: unknown) => void;
  onClearCell?: (rowId: string, column: GridColumn) => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useGridKeyboard({
  rows,
  columns,
  enabled = true,
  onCommitFromClipboard,
  onClearCell,
  onUndo,
  onRedo,
}: UseGridKeyboardArgs) {
  const { state, dispatch } = useGrid();

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditable =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      const meta = e.metaKey || e.ctrlKey;

      // Undo / Redo (global shortcut)
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) onRedo?.();
        else onUndo?.();
        return;
      }

      if (state.editing) return;

      const active = state.selection.active;
      if (!active) return;

      const rowIdx = rows.findIndex((r) => r.id === active.rowId);
      const colIdx = columns.findIndex((c) => c.id === active.columnId);
      if (rowIdx === -1 || colIdx === -1) return;

      const focusAt = (nr: number, nc: number) => {
        const r = Math.max(0, Math.min(rows.length - 1, nr));
        const c = Math.max(0, Math.min(columns.length - 1, nc));
        return { rowId: rows[r].id, columnId: columns[c].id };
      };

      const move = (dr: number, dc: number, extend: boolean) => {
        const nextAddr = focusAt(rowIdx + dr, colIdx + dc);
        if (extend) {
          dispatch({ type: "EXTEND_RANGE", focus: nextAddr });
        } else {
          dispatch({ type: "FOCUS_CELL", address: nextAddr });
        }
      };

      switch (e.key) {
        case "ArrowUp":
          if (inEditable) return;
          e.preventDefault();
          move(-1, 0, e.shiftKey);
          break;
        case "ArrowDown":
          if (inEditable) return;
          e.preventDefault();
          move(1, 0, e.shiftKey);
          break;
        case "ArrowLeft":
          if (inEditable) return;
          e.preventDefault();
          move(0, -1, e.shiftKey);
          break;
        case "ArrowRight":
          if (inEditable) return;
          e.preventDefault();
          move(0, 1, e.shiftKey);
          break;
        case "Tab":
          e.preventDefault();
          move(0, e.shiftKey ? -1 : 1, false);
          break;
        case "Enter":
        case "F2":
          if (inEditable) return;
          e.preventDefault();
          dispatch({ type: "BEGIN_EDIT", address: active });
          break;
        case "Escape":
          if (state.selection.range) {
            dispatch({ type: "SET_RANGE", range: null });
          } else {
            dispatch({ type: "END_EDIT" });
          }
          break;
        case "Delete":
        case "Backspace": {
          if (inEditable) return;
          e.preventDefault();
          if (!onClearCell) return;
          const range = state.selection.range;
          if (range) {
            const b = rangeBounds(range, rows, columns);
            if (b) {
              for (let r = b.r0; r <= b.r1; r++) {
                for (let c = b.c0; c <= b.c1; c++) {
                  onClearCell(rows[r].id, columns[c]);
                }
              }
            }
          } else {
            onClearCell(active.rowId, columns[colIdx]);
          }
          break;
        }
        default:
          // ─── Copy ───────────────────────────────────────────
          if (meta && e.key.toLowerCase() === "c") {
            const range = state.selection.range;
            if (range) {
              const b = rangeBounds(range, rows, columns);
              if (b) {
                const tsv = rangeToTsv(b, rows, columns);
                dispatch({ type: "COPY", value: tsv, cellType: "tsv" });
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(tsv).catch(() => {});
                }
                e.preventDefault();
              }
            } else {
              const row = rows[rowIdx];
              const col = columns[colIdx];
              const value = readValue(row, col);
              dispatch({ type: "COPY", value, cellType: col.type });
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(value == null ? "" : String(value)).catch(() => {});
              }
            }
          }
          // ─── Paste ──────────────────────────────────────────
          else if (meta && e.key.toLowerCase() === "v") {
            if (!onCommitFromClipboard) return;
            // Async path: read from system clipboard for TSV
            if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
              e.preventDefault();
              navigator.clipboard
                .readText()
                .then((text) => {
                  if (!text) {
                    if (state.clipboard) {
                      onCommitFromClipboard(active.rowId, columns[colIdx], state.clipboard.value);
                    }
                    return;
                  }
                  if (text.includes("\t") || text.includes("\n")) {
                    const grid = parseTsv(text);
                    for (let r = 0; r < grid.length; r++) {
                      for (let c = 0; c < grid[r].length; c++) {
                        const tr = rowIdx + r;
                        const tc = colIdx + c;
                        if (tr >= rows.length || tc >= columns.length) continue;
                        onCommitFromClipboard(rows[tr].id, columns[tc], grid[r][c]);
                      }
                    }
                  } else {
                    onCommitFromClipboard(active.rowId, columns[colIdx], text);
                  }
                })
                .catch(() => {
                  if (state.clipboard) {
                    onCommitFromClipboard(active.rowId, columns[colIdx], state.clipboard.value);
                  }
                });
            } else if (state.clipboard) {
              onCommitFromClipboard(active.rowId, columns[colIdx], state.clipboard.value);
            }
          }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, state, rows, columns, dispatch, onCommitFromClipboard, onClearCell, onUndo, onRedo]);
}

function readValue(row: GridRow, col: GridColumn): unknown {
  if (col.source === "custom") return row.custom[col.id] ?? null;
  return row.data[col.field];
}
