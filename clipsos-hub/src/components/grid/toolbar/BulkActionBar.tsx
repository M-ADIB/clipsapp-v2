/**
 * BulkActionBar — appears at the bottom when rows are selected.
 *
 * Mirrors the action set of the legacy table: bulk delete, bulk status,
 * bulk type, bulk editor assign, bulk post date, export CSV.
 *
 * Renders via React.createPortal into document.body to escape the
 * overflow-y-auto scroll container in AppShell, ensuring the fixed-position
 * bar is always visible in the viewport regardless of scroll position.
 */
import { Archive, Calendar, ChevronDown, Layers, Share2, Tag, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useStatuses, useVideoTypes } from "@/hooks/use-lookups";
import { useTenantEditors } from "../core/useTenantEditors";
import { useCyclesForClient } from "@/hooks/use-cycles";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { useAuth } from "@/contexts/AuthContext";

interface BulkActionBarProps {
  selectedCount: number;
  /** IDs of selected videos — required for multi-share. */
  selectedIds?: string[];
  onClear: () => void;
  onArchive: () => void;
  onSetStatus: (statusId: string) => void;
  onSetType: (typeId: string) => void;
  onAssignEditor: (editorId: string) => void;
  onSetPostDate: (date: string) => void;
  onSetCycle?: (cycleId: string | null) => void;
  onExportCsv: () => void;
  /** Required to populate cycle picker */
  clientId?: string;
}

export function BulkActionBar({
  selectedCount,
  selectedIds = [],
  onClear,
  onArchive,
  onSetStatus,
  onSetType,
  onAssignEditor,
  onSetPostDate,
  onSetCycle,
  onExportCsv,
  clientId,
}: BulkActionBarProps) {
  const { data: statuses = [] } = useStatuses();
  const { data: types = [] } = useVideoTypes();
  const { data: editors = [] } = useTenantEditors();
  const { data: cycles = [] } = useCyclesForClient(clientId);
  const [date, setDate] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const { role } = useAuth();

  if (selectedCount === 0) return null;

  const bar = (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface-card/95 px-3 py-1.5 shadow-xl backdrop-blur">
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
          {selectedCount} selected
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted hover:bg-foreground/[0.06]">
            Status <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuLabel className="text-[10px] uppercase">Set status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statuses.map((s) => (
              <DropdownMenuItem key={s.id} onClick={() => onSetStatus(s.id)}>
                <span
                  className="mr-2 h-1.5 w-1.5 rounded-full"
                  style={{ background: s.color ?? "currentColor" }}
                />
                {s.display_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted hover:bg-foreground/[0.06]">
            <Tag className="h-3 w-3" /> Type <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            {types.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => onSetType(t.id)}>
                {t.display_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted hover:bg-foreground/[0.06]">
            <UserPlus className="h-3 w-3" /> Editor <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            {editors.map((e) => (
              <DropdownMenuItem key={e.id} onClick={() => onAssignEditor(e.id)}>
                {e.full_name ?? "Unnamed"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {onSetCycle && cycles.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted hover:bg-foreground/[0.06]">
              <Layers className="h-3 w-3" /> Cycle <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuLabel className="text-[10px] uppercase">Move to cycle</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {cycles.map((c) => (
                <DropdownMenuItem key={c.id} onClick={() => onSetCycle(c.id)}>
                  {c.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSetCycle(null)}>
                No cycle (Shoots)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted hover:bg-foreground/[0.06]">
            <Calendar className="h-3 w-3" /> Post date
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 p-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              variant="default"
              size="sm"
              onClick={() => date && onSetPostDate(date)}
              className="mt-2 w-full text-[11px] font-semibold"
            >
              Apply
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExportCsv}
          className="px-2 text-xs text-foreground-muted"
        >
          Export CSV
        </Button>

        {selectedIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="gap-1 px-2 text-xs text-foreground-muted"
          >
            <Share2 className="h-3 w-3" /> Share
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onArchive}
          className="gap-1 px-2 text-xs text-destructive hover:bg-destructive/10"
        >
          <Archive className="h-3 w-3" /> Archive
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="ml-1 h-6 w-6 text-foreground-disabled hover:text-foreground"
          aria-label="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          target={{ scope: "videos", videoIds: selectedIds }}
          role={role}
        />
      )}
    </div>
  );

  return createPortal(bar, document.body);
}
