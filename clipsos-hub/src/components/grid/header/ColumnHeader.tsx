/**
 * ColumnHeader — header cell matching the standard ClipsOS table style.
 *
 * Clean interaction model:
 *   - 11px uppercase label — click to cycle sort
 *   - Sort indicator (arrow) when active
 *   - Right-click → context menu for Sort / Rename / Hide / Edit / Delete
 *   - Drag-to-reorder via the label area (cursor changes to grab)
 *   - Resize handle on the right edge
 *
 * No hover-to-reveal icons (grip, gear, chevron) — keeps the UI clean.
 */
import { ArrowDown, ArrowUp, EyeOff, Pencil, Trash2, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

import type { GridColumn, SortRule } from "../core/types";

interface ColumnHeaderProps {
  column: GridColumn;
  sort: SortRule | null;
  onSort: (direction: "asc" | "desc" | null, additive: boolean) => void;
  onResize: (width: number) => void;
  onHide: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRename: (label: string) => void;
  canRename?: boolean;
  /** Drag-to-reorder handle (injected by parent SortableHeader wrapper) */
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  setNodeRef?: (el: HTMLElement | null) => void;
  dragStyle?: CSSProperties;
  /** Sticky-pin styling (frozen columns) */
  pinned?: boolean;
  pinLeft?: number;
  /** True when this is the last frozen column — adds a shadow border */
  lastPinned?: boolean;
}

export function ColumnHeader({
  column,
  sort,
  onSort,
  onResize,
  onHide,
  onEdit,
  onDelete,
  onRename,
  canRename = true,
  dragHandleProps,
  setNodeRef,
  dragStyle,
  pinned,
  pinLeft,
  lastPinned,
}: ColumnHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftLabel, setDraftLabel] = useState(column.label);
  const startX = useRef(0);
  const startW = useRef(column.width);

  useEffect(() => setDraftLabel(column.label), [column.label]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startX.current = e.clientX;
      startW.current = column.width;
      const move = (ev: MouseEvent) => {
        const delta = ev.clientX - startX.current;
        const next = Math.max(60, Math.min(600, startW.current + delta));
        onResize(next);
      };
      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [column.width, onResize],
  );

  const headerContent = (
    <th
      ref={setNodeRef as never}
      className={cn(
        "group relative border-b border-border px-3 py-2 text-left",
        pinned && "sticky z-20",
        lastPinned && "shadow-[2px_0_6px_-2px_rgba(0,0,0,0.15)]",
      )}
      style={{
        width: column.width,
        minWidth: column.width,
        maxWidth: column.width,
        ...(pinned ? { backgroundColor: "var(--background)" } : {}),
        ...(pinned && pinLeft != null ? { left: pinLeft } : {}),
        ...(dragStyle ?? {}),
      }}
    >
      <div className="flex items-center justify-between gap-1">
        {isRenaming ? (
          <input
            autoFocus
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onBlur={() => {
              setIsRenaming(false);
              if (draftLabel.trim() && draftLabel !== column.label) onRename(draftLabel.trim());
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setDraftLabel(column.label);
                setIsRenaming(false);
              }
            }}
            className="h-5 w-full rounded border border-primary/40 bg-surface-raised px-1 text-[11px]"
          />
        ) : (
          <button
            type="button"
            onClick={(e) =>
              column.sortable && onSort(sort?.direction === "asc" ? "desc" : "asc", e.shiftKey)
            }
            onDoubleClick={() => canRename && setIsRenaming(true)}
            className={cn(
              "flex flex-1 items-center gap-1 truncate text-left text-[11px] font-normal text-foreground-disabled",
              column.sortable && "cursor-pointer hover:text-foreground-muted",
              // When drag is enabled, show grab cursor (no visible icon needed)
              dragHandleProps && "cursor-grab active:cursor-grabbing",
            )}
            {...(dragHandleProps ?? {})}
          >
            <span className="truncate uppercase tracking-wide">{column.label}</span>
            {sort?.direction === "asc" && <ArrowUp className="h-2.5 w-2.5 shrink-0" />}
            {sort?.direction === "desc" && <ArrowDown className="h-2.5 w-2.5 shrink-0" />}
          </button>
        )}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
        className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/40"
      />
    </th>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{headerContent}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {column.sortable && (
          <>
            <ContextMenuItem onClick={() => onSort("asc", false)}>
              <ArrowUp className="mr-2 h-3.5 w-3.5" /> Sort ascending
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onSort("desc", false)}>
              <ArrowDown className="mr-2 h-3.5 w-3.5" /> Sort descending
            </ContextMenuItem>
            {sort && (
              <ContextMenuItem onClick={() => onSort(null, false)}>
                <X className="mr-2 h-3.5 w-3.5" /> Clear sort
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
          </>
        )}
        {canRename && (
          <ContextMenuItem onClick={() => setIsRenaming(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={onHide}>
          <EyeOff className="mr-2 h-3.5 w-3.5" /> Hide column
        </ContextMenuItem>
        {column.source === "custom" && onEdit && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit field
            </ContextMenuItem>
            {onDelete && (
              <ContextMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete column
              </ContextMenuItem>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
