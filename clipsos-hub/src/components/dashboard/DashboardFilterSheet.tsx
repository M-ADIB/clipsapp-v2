/**
 * DashboardFilterSheet — "Filter" slideover for dashboard tables.
 *
 * Shows filter options for each filterable column with multi-select chips.
 * Used by dashboard pages (Projects, Clients, CRM, Studio).
 */
import { X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { DashboardColumn } from "./useDashboardView";

interface DashboardFilterSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  columns: DashboardColumn[];
  filters: Record<string, string[]>;
  onSetFilter: (key: string, values: string[]) => void;
  onClearAll: () => void;
}

export function DashboardFilterSheet({
  open,
  onOpenChange,
  columns,
  filters,
  onSetFilter,
  onClearAll,
}: DashboardFilterSheetProps) {
  const filterableColumns = columns.filter(
    (c) => c.filterable && c.filterOptions && c.filterOptions.length > 0,
  );

  const activeCount = Object.values(filters).filter((v) => v.length > 0).length;

  const toggleFilterValue = (colKey: string, value: string) => {
    const current = filters[colKey] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onSetFilter(colKey, next);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[340px] flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            {activeCount > 0
              ? `${activeCount} filter${activeCount > 1 ? "s" : ""} active`
              : "No filters applied"}
          </SheetDescription>
        </SheetHeader>

        {/* Filter sections */}
        <div className="mt-3 flex-1 space-y-5 overflow-y-auto pr-1 -mr-1">
          {filterableColumns.length === 0 && (
            <div className="py-8 text-center text-sm text-foreground-disabled">
              No filterable columns available
            </div>
          )}

          {filterableColumns.map((col) => {
            const active = filters[col.key] ?? [];
            return (
              <div key={col.key}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    {col.label}
                  </span>
                  {active.length > 0 && (
                    <button
                      onClick={() => onSetFilter(col.key, [])}
                      className="text-[10px] text-foreground-disabled hover:text-foreground-muted"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {col.filterOptions!.map((opt) => {
                    const isActive = active.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleFilterValue(col.key, opt)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-foreground-muted hover:border-foreground-disabled hover:text-foreground",
                        )}
                      >
                        {opt}
                        {isActive && <X className="h-2.5 w-2.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear all */}
        {activeCount > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <Button variant="outline" className="w-full" onClick={onClearAll}>
              Clear all filters
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
