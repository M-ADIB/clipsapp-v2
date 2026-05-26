/**
 * DashboardSortPopover — ClickUp-style "Sort" popover for dashboard tables.
 *
 * Shows a "Sort by" column picker + direction toggle in a compact popover.
 * Drops down inline from the toolbar button.
 */
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SortOption {
  key: string;
  label: string;
}

interface DashboardSortPopoverProps {
  options: SortOption[];
  activeKey: string;
  direction: "asc" | "desc";
  onSort: (key: string, direction: "asc" | "desc") => void;
  children: React.ReactNode; // trigger button
}

export function DashboardSortPopover({
  options,
  activeKey,
  direction,
  onSort,
  children,
}: DashboardSortPopoverProps) {
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const activeLabel = options.find((o) => o.key === activeKey)?.label ?? "Choose Column";

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-[320px] p-0">
        {/* Header */}
        <div className="px-3 pt-3 pb-2">
          <h4 className="text-sm font-semibold text-foreground">Sort by</h4>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 border-t border-border px-3 py-3">
          {/* Column selector */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="flex w-full items-center justify-between rounded-md border border-border bg-surface-raised/50 px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-raised"
            >
              <span>{activeLabel}</span>
              <ChevronDown className="h-3 w-3 text-foreground-disabled" />
            </button>

            {showColumnPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColumnPicker(false)} />
                <div className="absolute top-full left-0 z-50 mt-1 max-h-[200px] w-full overflow-y-auto rounded-md border border-border bg-surface-card py-1 shadow-lg">
                  {options.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        onSort(opt.key, direction);
                        setShowColumnPicker(false);
                      }}
                      className={cn(
                        "flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors",
                        opt.key === activeKey
                          ? "bg-primary/10 text-primary"
                          : "text-foreground-muted hover:bg-foreground/[0.04] hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Direction toggle */}
          <button
            onClick={() => onSort(activeKey, direction === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface-raised/50 px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-raised"
          >
            <ArrowUpDown className="h-3 w-3 text-foreground-disabled" />
            {direction === "asc" ? "Ascending" : "Descending"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
