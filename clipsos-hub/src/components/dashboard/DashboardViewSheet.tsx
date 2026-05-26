/**
 * DashboardViewSheet — "View settings" slideover for dashboard tables.
 *
 * Shows all columns with eye-toggle and indicates which are pinned.
 * Used by dashboard pages (Projects, Clients, CRM, Studio).
 */
import { Eye, EyeOff, Lock } from "lucide-react";

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

interface DashboardViewSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  columns: DashboardColumn[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
  onShowAll: () => void;
}

export function DashboardViewSheet({
  open,
  onOpenChange,
  columns,
  hidden,
  onToggle,
  onShowAll,
}: DashboardViewSheetProps) {
  const visibleCount = columns.filter((c) => c.pinned || !hidden.has(c.key)).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[340px] flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>View settings</SheetTitle>
          <SheetDescription>
            {visibleCount} of {columns.length} columns visible
          </SheetDescription>
        </SheetHeader>

        {/* Column list */}
        <div className="mt-3 flex-1 space-y-1 overflow-y-auto pr-1 -mr-1">
          {columns.map((col) => {
            const isHidden = hidden.has(col.key);
            return (
              <div
                key={col.key}
                className={cn(
                  "flex items-center gap-2 rounded-md border border-border px-3 py-2 transition-colors",
                  isHidden && "opacity-40",
                )}
              >
                <div className="flex-1 min-w-0">
                  <span className={cn("text-sm", isHidden && "line-through text-foreground-muted")}>
                    {col.label}
                  </span>
                </div>

                {col.pinned ? (
                  <div
                    className="flex h-7 w-7 items-center justify-center text-foreground-disabled"
                    title="This column is pinned and cannot be hidden"
                  >
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => onToggle(col.key)}
                    aria-label={isHidden ? "Show column" : "Hide column"}
                  >
                    {isHidden ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Show all */}
        {hidden.size > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <Button variant="outline" className="w-full" onClick={onShowAll}>
              Show all columns
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
