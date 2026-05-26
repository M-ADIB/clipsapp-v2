/**
 * DashboardColumnsPopover — ClickUp-style "Columns" popover for dashboard tables.
 *
 * Shows all columns with toggle switches, drag-handle grip dots, search,
 * and "REQUIRED" badges for pinned columns.
 * Drops down inline from the toolbar button instead of a right-side sheet.
 */
import { useState } from "react";
import { GripVertical, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DashboardColumn } from "./useDashboardView";

interface DashboardColumnsPopoverProps {
  columns: DashboardColumn[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
  onShowAll: () => void;
  children: React.ReactNode; // trigger button
}

export function DashboardColumnsPopover({
  columns,
  hidden,
  onToggle,
  onShowAll,
  children,
}: DashboardColumnsPopoverProps) {
  const [search, setSearch] = useState("");
  const visibleCount = columns.filter((c) => c.pinned || !hidden.has(c.key)).length;

  const filtered = search.trim()
    ? columns.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()))
    : columns;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-[280px] p-0">
        {/* Header */}
        <div className="px-3 pt-3 pb-2">
          <h4 className="text-sm font-semibold text-foreground">Display Columns</h4>
          <p className="text-[11px] text-foreground-disabled">Choose which columns to show</p>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-raised/50 px-2 py-1.5">
            <Search className="h-3 w-3 text-foreground-disabled" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search column to show/hide"
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-foreground-disabled focus:outline-none"
            />
          </div>
        </div>

        {/* Column list */}
        <div className="max-h-[320px] overflow-y-auto border-t border-border">
          {filtered.map((col) => {
            const isHidden = hidden.has(col.key);
            return (
              <div
                key={col.key}
                className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-foreground/[0.04]"
              >
                {/* Drag grip */}
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-foreground-disabled/50" />

                {/* Label */}
                <span
                  className={cn(
                    "flex-1 text-xs",
                    isHidden ? "text-foreground-disabled" : "text-foreground",
                  )}
                >
                  {col.label}
                </span>

                {/* Pinned badge or toggle */}
                {col.pinned ? (
                  <span className="rounded bg-foreground/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-foreground-disabled">
                    Required
                  </span>
                ) : (
                  <button
                    onClick={() => onToggle(col.key)}
                    className={cn(
                      "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                      isHidden ? "bg-foreground/10" : "bg-primary",
                    )}
                    aria-label={isHidden ? "Show column" : "Hide column"}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                        isHidden ? "left-0.5" : "left-[18px]",
                      )}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {hidden.size > 0 && (
          <div className="border-t border-border px-3 py-2">
            <button
              onClick={onShowAll}
              className="w-full text-center text-[11px] font-medium text-primary hover:text-primary/80"
            >
              Show all columns ({visibleCount}/{columns.length})
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
