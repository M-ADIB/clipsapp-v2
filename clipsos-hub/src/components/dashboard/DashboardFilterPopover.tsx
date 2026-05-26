/**
 * DashboardFilterPopover — ClickUp-style "Filter" popover for dashboard tables.
 *
 * Shows filterable columns side-by-side in a multi-column layout.
 * Each column shows its filter options as selectable rows.
 * Drops down inline from the toolbar button.
 */
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DashboardColumn } from "./useDashboardView";

interface DashboardFilterPopoverProps {
  columns: DashboardColumn[];
  filters: Record<string, string[]>;
  onSetFilter: (key: string, values: string[]) => void;
  onClearAll: () => void;
  children: React.ReactNode; // trigger button
}

export function DashboardFilterPopover({
  columns,
  filters,
  onSetFilter,
  onClearAll,
  children,
}: DashboardFilterPopoverProps) {
  const filterableColumns = columns.filter(
    (c) => c.filterable && c.filterOptions && c.filterOptions.length > 0,
  );

  const activeCount = Object.values(filters).filter((v) => v.length > 0).length;

  const toggleFilterValue = (colKey: string, value: string) => {
    const current = filters[colKey] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onSetFilter(colKey, next);
  };

  if (filterableColumns.length === 0) {
    return (
      <Popover>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="w-[240px] p-4">
          <p className="text-center text-xs text-foreground-disabled">
            No filterable columns available
          </p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-auto max-w-[90vw] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <h4 className="text-sm font-semibold text-foreground">Quick filters</h4>
          {activeCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-medium text-primary hover:text-primary/80"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Multi-column filter grid */}
        <div className="flex gap-0 border-t border-border">
          {filterableColumns.map((col, idx) => {
            const active = filters[col.key] ?? [];
            return (
              <div
                key={col.key}
                className={cn("min-w-[150px] max-w-[180px]", idx > 0 && "border-l border-border")}
              >
                {/* Column header */}
                <div className="px-3 py-2">
                  <span className="text-[11px] font-semibold text-foreground">{col.label}</span>
                </div>

                {/* Options list */}
                <div className="max-h-[240px] overflow-y-auto pb-2">
                  {col.filterOptions!.map((opt) => {
                    const isActive = active.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleFilterValue(col.key, opt)}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground-muted hover:bg-foreground/[0.04] hover:text-foreground",
                        )}
                      >
                        {/* Selection dot */}
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            isActive ? "bg-primary" : "bg-foreground-disabled/40",
                          )}
                        />
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
