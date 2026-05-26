/**
 * GridToolbar — standard ClipsOS table toolbar.
 *
 * Mirrors the design used in OwnerClientsPage / OwnerCrmPage:
 *   - Page header row (title + Share)
 *   - Toolbar row (List selector + Settings | Add field + Manage columns)
 *   - Sort & Filter bar (Sort pill, Filter, search toggle)
 *
 * Built as one shared component so every grid instance (owner, client,
 * project tab) renders the exact same chrome.
 */
import { useState, type ReactNode } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  LayoutGrid,
  Plus,
  Rows3,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { Density, GridColumn, SortRule } from "../core/types";

interface GridToolbarProps {
  title: string;
  search: string;
  onSearchChange: (v: string) => void;
  density: Density;
  onDensityChange: (d: Density) => void;
  onManageColumns: () => void;
  onAddColumn: () => void;
  rowCount: number;
  /** Sort options come from current visible columns */
  columns: GridColumn[];
  sort: SortRule | null;
  onSortChange: (s: SortRule | null) => void;
  onOpenFilter?: () => void;
  onClearFilters?: () => void;
  filterCount?: number;
  /** Wave 2 — undo/redo */
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  /** Wave 3.5 / 3.6 */
  leftSlot?: ReactNode;
  /** Replaces the default New Video button (e.g. AddVideoPicker for tenant-wide view) */
  addRowSlot?: ReactNode;
  onAddRow?: () => void;
  canAddRow?: boolean;
  canAddColumn?: boolean;
  canManage?: boolean;
  /** Inline popover slot for column management (replaces onManageColumns button) */
  manageColumnsSlot?: ReactNode;
  /** Inline popover slot for filter builder (replaces onOpenFilter button) */
  filterSlot?: ReactNode;
}

/* ------------------------------------------------------------------ */

export function GridToolbar({
  title,
  search,
  onSearchChange,
  density,
  onDensityChange,
  onManageColumns,
  onAddColumn,
  rowCount,
  columns,
  sort,
  onSortChange,
  onOpenFilter,
  onClearFilters,
  filterCount = 0,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  leftSlot,
  addRowSlot,
  onAddRow,
  canAddRow = true,
  canAddColumn = true,
  canManage = true,
  manageColumnsSlot,
  filterSlot,
}: GridToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [densityOpen, setDensityOpen] = useState(false);

  const sortableCols = columns.filter((c) => c.sortable);
  const activeSortLabel =
    sort?.columnId === "created_at" && sort?.direction === "desc"
      ? "Recently Added"
      : sort && sortableCols.find((c) => c.id === sort.columnId)?.label;

  const densityLabel =
    density === "compact" ? "Compact" : density === "comfortable" ? "Comfortable" : "Regular";

  return (
    <>
      {/* ── Toolbar Row ──────────────────────────────────── */}
      <div className="flex h-auto min-h-[44px] flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 md:px-5 md:py-0">
        <div className="flex items-center gap-2">
          {leftSlot ?? (
            <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.06]">
              <LayoutGrid className="h-3 w-3 text-primary" />
              All Videos
              <ChevronDown className="h-3 w-3 text-foreground-disabled" />
            </button>
          )}

          <div className="h-4 w-px bg-border" />

          {canManage &&
            (manageColumnsSlot ?? (
              <button
                onClick={onManageColumns}
                className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground md:flex"
              >
                <Settings2 className="h-3 w-3" />
                View settings
              </button>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-disabled">{rowCount}</span>
          {canAddRow &&
            (addRowSlot ?? (
              <button
                onClick={onAddRow}
                disabled={!onAddRow}
                className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 md:px-3.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Video</span>
              </button>
            ))}
        </div>
      </div>

      {/* ── Sort & Filter Bar ────────────────────────────── */}
      <div className="flex h-[38px] items-center gap-2 border-b border-border px-3 md:px-5">
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md bg-foreground/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground-muted transition-colors hover:bg-foreground/[0.1]">
              <ArrowUpDown className="h-3 w-3 text-foreground-disabled" />
              {activeSortLabel ? (
                <>
                  Sorted by <span className="text-foreground-strong">{activeSortLabel}</span>
                  <span className="text-foreground-disabled">
                    ({sort?.direction === "asc" ? "↑" : "↓"})
                  </span>
                </>
              ) : (
                "Sort"
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={4} className="w-[220px] p-1.5">
            {sort && (
              <button
                onClick={() => {
                  onSortChange(null);
                  setSortOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive transition-colors hover:bg-foreground/[0.04]"
              >
                Clear sort
              </button>
            )}
            {/* Quick presets */}
            <button
              onClick={() => {
                onSortChange({ columnId: "created_at", direction: "desc" });
                setSortOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-foreground/[0.04] ${
                sort?.columnId === "created_at" && sort?.direction === "desc"
                  ? "text-primary"
                  : "text-foreground-muted"
              }`}
            >
              <span>Recently Added</span>
              {sort?.columnId === "created_at" && sort?.direction === "desc" && (
                <Check className="h-3 w-3" />
              )}
            </button>
            <div className="my-1 h-px bg-border" />
            {sortableCols.map((col) => {
              const isActive = sort?.columnId === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    const dir = isActive && sort!.direction === "asc" ? "desc" : "asc";
                    onSortChange({ columnId: col.id, direction: dir });
                    setSortOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-foreground/[0.04] ${
                    isActive ? "text-primary" : "text-foreground-muted"
                  }`}
                >
                  <span>{col.label}</span>
                  {isActive && (
                    <span className="text-foreground-disabled">
                      {sort!.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {filterSlot ??
          (onOpenFilter && (
            <div className="flex items-center">
              <button
                onClick={onOpenFilter}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <Filter className="h-3 w-3" />
                Filter
                {filterCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[9px] font-bold text-primary-foreground">
                    {filterCount}
                  </span>
                )}
              </button>
              {filterCount > 0 && onClearFilters && (
                <button
                  onClick={onClearFilters}
                  title="Clear filters"
                  className="flex h-5 w-5 items-center justify-center rounded text-foreground-disabled transition-colors hover:bg-foreground/[0.06] hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ))}

        <Popover open={densityOpen} onOpenChange={setDensityOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
              <Rows3 className="h-3 w-3" />
              {densityLabel}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={4} className="w-[160px] p-1.5">
            {(["compact", "regular", "comfortable"] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  onDensityChange(d);
                  setDensityOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-foreground/[0.04] ${
                  density === d ? "text-primary" : "text-foreground-muted"
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
                {density === d && <Check className="h-3 w-3" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        {searchOpen && (
          <div className="relative flex items-center">
            <input
              autoFocus
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search videos…"
              className="h-6 w-48 rounded bg-foreground/[0.06] px-2 text-[11px] text-foreground placeholder:text-foreground-disabled focus:outline-none"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-1 text-foreground-disabled hover:text-foreground-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex h-6 w-6 items-center justify-center rounded text-foreground-disabled transition-colors hover:bg-foreground/[0.06] hover:text-foreground-muted"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}
