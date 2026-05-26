/**
 * VideosGrid — shared type definitions.
 *
 * One source of truth for column shape, cell types, selection, and view state.
 */
import type { AppRole } from "@/integrations/supabase/db-types";

/* ------------------------------------------------------------------ */
/* Cell types — the universe of supported field renderers              */
/* ------------------------------------------------------------------ */

export type CellType =
  | "text"
  | "long_text"
  | "number"
  | "currency"
  | "date"
  | "single_select"
  | "multi_select"
  | "status" // built-in: bound to statuses table
  | "video_type" // built-in: bound to video_types table
  | "thumbnail"
  | "video"
  | "review"
  | "editors"
  | "url"
  | "email"
  | "phone"
  | "yes_no"
  | "rating"
  | "progress"
  | "file"
  | "image";

/* ------------------------------------------------------------------ */
/* Column descriptors                                                  */
/* ------------------------------------------------------------------ */

interface BaseColumn {
  /** Stable identifier — used for selection, persistence, and keys */
  id: string;
  /** Display label (after tenant rename + user override) */
  label: string;
  /** Cell renderer to use */
  type: CellType;
  /** Pixel width */
  width: number;
  /** Whether this column can be sorted */
  sortable: boolean;
  /** Roles allowed to edit this column inline */
  editableBy: AppRole[];
  /** Whether this column is currently visible */
  visible: boolean;
  /** Position in the grid */
  order: number;
  /** Whether this column is pinned to the left */
  pinned?: boolean;
  /** For select-types: available options */
  options?: string[];
}

export interface BuiltinColumn extends BaseColumn {
  source: "builtin";
  /** Field key on the video row */
  field: string;
}

export interface CustomColumn extends BaseColumn {
  source: "custom";
  /** custom_columns.id — used to lookup the value */
  customColumnId: string;
}

export type GridColumn = BuiltinColumn | CustomColumn;

/* ------------------------------------------------------------------ */
/* Row shape                                                           */
/* ------------------------------------------------------------------ */

export interface GridRow {
  id: string;
  /** All built-in fields from the video row */
  data: Record<string, unknown>;
  /** Custom column values keyed by custom_columns.id */
  custom: Record<string, string | null>;
}

/* ------------------------------------------------------------------ */
/* Selection / editing                                                 */
/* ------------------------------------------------------------------ */

export interface CellAddress {
  rowId: string;
  columnId: string;
}

export interface CellRange {
  /** Start of the range (inclusive) */
  anchor: CellAddress;
  /** End of the range (inclusive) */
  focus: CellAddress;
}

export interface GridSelection {
  /** Set of row ids that are checkbox-selected */
  rows: Set<string>;
  /** The currently focused cell */
  active: CellAddress | null;
  /** Anchor of a multi-cell range selection */
  anchor: CellAddress | null;
  /** Active rectangular cell range (Shift+Arrow / Shift+Click) */
  range: CellRange | null;
}

/* ------------------------------------------------------------------ */
/* View state — persisted per user in saved_filter_views               */
/* ------------------------------------------------------------------ */

export type Density = "compact" | "regular" | "comfortable";

export interface SortRule {
  columnId: string;
  direction: "asc" | "desc";
}

export interface FilterRule {
  columnId: string;
  operator: "eq" | "neq" | "contains" | "gt" | "lt" | "in" | "is_empty" | "is_not_empty";
  value: unknown;
}

export interface ViewConfig {
  /** Per-column width overrides */
  widths: Record<string, number>;
  /** Column ids in order */
  order: string[];
  /** Hidden column ids */
  hidden: string[];
  /** Active sort rules (multi-sort, applied in order) */
  sort: SortRule[];
  /** Active filter rules (AND combined) */
  filters: FilterRule[];
  /** Row density */
  density: Density;
  /** Column id labels overridden by the user */
  labels: Record<string, string>;
  /** Number of leading visible columns to freeze (sticky on horizontal scroll) */
  frozenCount: number;
}

export const EMPTY_VIEW: ViewConfig = {
  widths: {},
  order: [],
  hidden: [],
  sort: [],
  filters: [],
  density: "regular",
  labels: {},
  frozenCount: 3,
};

/* ------------------------------------------------------------------ */
/* Density tokens                                                      */
/* ------------------------------------------------------------------ */

export const DENSITY_ROW_HEIGHT: Record<Density, number> = {
  compact: 40,
  regular: 60,
  comfortable: 88,
};

/* ------------------------------------------------------------------ */
/* Scope — how the grid is filtered at the data layer                  */
/* ------------------------------------------------------------------ */

export interface GridScope {
  clientId?: string;
  projectId?: string;
  cycleId?: string;
}
