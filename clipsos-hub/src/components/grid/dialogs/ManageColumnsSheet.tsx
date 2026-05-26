/**
 * ManageColumnsSheet — full-featured drawer for column management.
 *
 * Features:
 *  - Scrollable column list showing ALL columns (visible + hidden)
 *  - Eye toggle to show/hide each column
 *  - Drag-and-drop reorder via @dnd-kit
 *  - "Add field" button at the bottom
 *  - Search to filter columns when the list is long
 */
import { useState, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Plus, Search } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { GridColumn, ViewConfig } from "../core/types";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ManageColumnsSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** ALL columns — both visible and hidden */
  columns: GridColumn[];
  view: ViewConfig;
  onViewChange: (patch: Partial<ViewConfig>) => void;
  /** Opens the "Add custom field" dialog */
  onAddColumn?: () => void;
  /** Optional children to use as the trigger button */
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Sortable column row                                                */
/* ------------------------------------------------------------------ */

function SortableColumnRow({
  col,
  isHidden,
  onToggle,
}: {
  col: GridColumn;
  isHidden: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: col.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border px-2 py-1.5 transition-colors",
        isHidden && "opacity-40",
        isDragging && "z-50 border-primary/50 bg-surface-card shadow-lg",
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="flex cursor-grab touch-none items-center text-foreground-disabled hover:text-foreground-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Label + meta */}
      <div className="flex-1 min-w-0">
        <div className={cn("truncate text-sm", isHidden && "line-through")}>{col.label}</div>
        <div className="text-[10px] uppercase text-foreground-disabled">
          {col.source} · {col.type}
        </div>
      </div>

      {/* Visibility toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onToggle}
        aria-label={isHidden ? "Show column" : "Hide column"}
      >
        {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ManageColumnsSheet({
  open,
  onOpenChange,
  columns,
  view,
  onViewChange,
  onAddColumn,
  children,
}: ManageColumnsSheetProps) {
  const [search, setSearch] = useState("");
  const hidden = new Set(view.hidden ?? []);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Toggle column visibility
  const toggle = (id: string) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onViewChange({ hidden: Array.from(next) });
  };

  // Handle drag end — reorder
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = columns.findIndex((c) => c.id === active.id);
    const newIdx = columns.findIndex((c) => c.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;

    const reordered = arrayMove(
      columns.map((c) => c.id),
      oldIdx,
      newIdx,
    );
    onViewChange({ order: reordered });
  };

  // Filter columns by search
  const filteredColumns = search
    ? columns.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()))
    : columns;

  const visibleCount = columns.filter((c) => !hidden.has(c.id)).length;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {children && <PopoverTrigger asChild>{children}</PopoverTrigger>}
      <PopoverContent align="start" sideOffset={4} className="w-[340px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div>
            <span className="text-xs font-semibold text-foreground">Manage columns</span>
            <span className="ml-2 text-[10px] text-foreground-disabled">
              {visibleCount}/{columns.length}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative px-3 pt-2.5">
          <Search className="absolute left-5.5 top-1/2 h-3 w-3 -translate-y-1/2 text-foreground-disabled" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search columns…"
            className="h-7 w-full rounded-md border border-border bg-transparent pl-7 pr-3 text-xs text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Scrollable column list */}
        <div className="mt-2 max-h-[300px] overflow-y-auto px-3 space-y-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredColumns.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredColumns.map((c) => (
                <SortableColumnRow
                  key={c.id}
                  col={c}
                  isHidden={hidden.has(c.id)}
                  onToggle={() => toggle(c.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {filteredColumns.length === 0 && (
            <div className="py-8 text-center text-sm text-foreground-disabled">
              No columns match "{search}"
            </div>
          )}
        </div>

        {/* Add field button */}
        {onAddColumn && (
          <div className="border-t border-border px-3 py-2.5">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                onAddColumn();
                onOpenChange(false);
              }}
            >
              <Plus className="h-3 w-3" />
              Add custom field
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
