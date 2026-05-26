/**
 * Range helpers — convert a CellRange (anchor + focus) into the rectangle
 * of (rowIndex, colIndex) bounds, and serialize/parse TSV grids for the
 * system clipboard.
 */
import type { CellRange, GridColumn, GridRow } from "./types";

export interface RangeBounds {
  r0: number;
  r1: number;
  c0: number;
  c1: number;
}

export function rangeBounds(
  range: CellRange,
  rows: { id: string }[],
  columns: { id: string }[],
): RangeBounds | null {
  const ra = rows.findIndex((r) => r.id === range.anchor.rowId);
  const rf = rows.findIndex((r) => r.id === range.focus.rowId);
  const ca = columns.findIndex((c) => c.id === range.anchor.columnId);
  const cf = columns.findIndex((c) => c.id === range.focus.columnId);
  if (ra === -1 || rf === -1 || ca === -1 || cf === -1) return null;
  return {
    r0: Math.min(ra, rf),
    r1: Math.max(ra, rf),
    c0: Math.min(ca, cf),
    c1: Math.max(ca, cf),
  };
}

export function isInRange(
  rowId: string,
  columnId: string,
  range: CellRange | null,
  rows: { id: string }[],
  columns: { id: string }[],
): boolean {
  if (!range) return false;
  const b = rangeBounds(range, rows, columns);
  if (!b) return false;
  const ri = rows.findIndex((r) => r.id === rowId);
  const ci = columns.findIndex((c) => c.id === columnId);
  return ri >= b.r0 && ri <= b.r1 && ci >= b.c0 && ci <= b.c1;
}

function readValue(row: GridRow, col: GridColumn): unknown {
  if (col.source === "custom") return row.custom[col.id] ?? null;
  return row.data[col.field];
}

/** Serialize a rectangle of cells to TSV (Excel / Sheets compatible). */
export function rangeToTsv(bounds: RangeBounds, rows: GridRow[], columns: GridColumn[]): string {
  const lines: string[] = [];
  for (let r = bounds.r0; r <= bounds.r1; r++) {
    const cells: string[] = [];
    for (let c = bounds.c0; c <= bounds.c1; c++) {
      const v = readValue(rows[r], columns[c]);
      const s = v == null ? "" : String(v);
      // Escape tabs/newlines per TSV convention
      cells.push(s.replace(/\t/g, " ").replace(/\r?\n/g, " "));
    }
    lines.push(cells.join("\t"));
  }
  return lines.join("\n");
}

/** Parse a TSV blob (from clipboard) into a 2D string grid. */
export function parseTsv(text: string): string[][] {
  const rows = text.replace(/\r\n/g, "\n").split("\n");
  // Trim a trailing empty line (common from copy)
  if (rows.length > 0 && rows[rows.length - 1] === "") rows.pop();
  return rows.map((r) => r.split("\t"));
}
