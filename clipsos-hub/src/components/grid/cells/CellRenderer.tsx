/**
 * CellRenderer — the single switch that picks a renderer per CellType.
 *
 * Every cell takes the same `CellProps` shape so the grid never has to
 * branch on type at the call site. Editing is opt-in via `isEditing`.
 *
 * Heavy renderers (status, video_type, editors) are kept in this file
 * for now since each is a few dozen lines; if any grows we extract it.
 */
import { format } from "date-fns";
import { CalendarIcon, ExternalLink, Star, Expand } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStatuses, useVideoTypes } from "@/hooks/use-lookups";
import { cn } from "@/lib/utils";

import type { GridColumn, GridRow } from "../core/types";
import { EditorsCellInner } from "./EditorsCell";
import {
  ReviewStubCell,
  ThumbnailCell as ThumbnailMediaCell,
  VideoCell as VideoMediaCell,
} from "./MediaStubCells";
import { ReviewToggleCell } from "./ReviewToggleCell";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

export interface CellProps {
  column: GridColumn;
  value: unknown;
  /** Full row — needed by media cells that read sibling fields. */
  row?: GridRow;
  isEditing: boolean;
  isReadOnly: boolean;
  density?: "compact" | "regular" | "comfortable";
  onCommit: (next: unknown) => void;
  onCancel: () => void;
  onBeginEdit: () => void;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getReadClass(density?: string) {
  if (density === "compact") return "px-3 py-0.5 text-xs text-foreground truncate";
  if (density === "comfortable") return "px-3 py-2 text-base text-foreground truncate";
  return "px-3 py-1 text-sm text-foreground truncate";
}

function getReadMuted(density?: string) {
  if (density === "compact") return "px-3 py-0.5 text-xs text-foreground-muted italic";
  if (density === "comfortable") return "px-3 py-2 text-base text-foreground-muted italic";
  return "px-3 py-1 text-sm text-foreground-muted italic";
}

function getEditInput(density?: string) {
  if (density === "compact") return "h-full w-full border-0 bg-transparent px-3 py-0.5 text-xs shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0";
  if (density === "comfortable") return "h-full w-full border-0 bg-transparent px-3 py-2 text-base shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0";
  return "h-full w-full border-0 bg-transparent px-3 py-1 text-sm shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0";
}

function useEditingValue<T>(initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => setV(initial), [initial]);
  return [v, setV] as const;
}

/* ------------------------------------------------------------------ */
/* Text-like cells                                                     */
/* ------------------------------------------------------------------ */

function TextCell({ value, isEditing, isReadOnly, density, onCommit, onCancel }: CellProps) {
  const [draft, setDraft] = useEditingValue(String(value ?? ""));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) ref.current?.focus();
  }, [isEditing]);

  if (isEditing && !isReadOnly) {
    return (
      <Input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onCommit(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(draft);
          if (e.key === "Escape") onCancel();
        }}
        className={getEditInput(density)}
      />
    );
  }
  return (
    <div className={cn(value ? getReadClass(density) : getReadMuted(density), !isReadOnly && "cursor-text")}>
      {value ? String(value) : "—"}
    </div>
  );
}

function LongTextCell({ value, isEditing, isReadOnly, density, onCommit, onCancel }: CellProps) {
  const [draft, setDraft] = useEditingValue(String(value ?? ""));
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && !expanded) ref.current?.focus();
  }, [isEditing, expanded]);

  // Expanded popover for reading/editing the full text
  if (expanded) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={() => {
          setExpanded(false);
          if (draft !== String(value ?? "")) onCommit(draft);
        }}
      >
        <div
          className="mx-4 flex w-full max-w-lg flex-col gap-2 rounded-lg border border-border bg-background p-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Textarea
            autoFocus
            value={draft}
            readOnly={isReadOnly}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Escape") {
                setExpanded(false);
                onCancel();
              }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                setExpanded(false);
                onCommit(draft);
              }
            }}
            className="min-h-[120px] resize-y text-sm"
          />
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span>{isReadOnly ? "Read-only" : "⌘+Enter to save · Esc to cancel"}</span>
            <button
              className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              onClick={() => {
                setExpanded(false);
                if (!isReadOnly) onCommit(draft);
              }}
            >
              {isReadOnly ? "Close" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing && !isReadOnly) {
    return (
      <div className="flex h-full items-center gap-1">
        <Textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onCommit(draft)}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onCommit(draft);
          }}
          className={cn(getEditInput(density), "min-h-0 resize-none")}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          className="mr-1 flex-shrink-0 rounded p-0.5 text-foreground-disabled hover:text-foreground-muted"
          title="Expand"
        >
          <Expand className="h-3 w-3" />
        </button>
      </div>
    );
  }
  return (
    <div
      className={cn(value ? getReadClass(density) : getReadMuted(density), "line-clamp-2", !isReadOnly && "cursor-text")}
      onClick={(e) => {
        // If there's actual content and we're read-only or there's long text, expand it
        if (value && String(value).length > 60) {
          e.stopPropagation();
          setExpanded(true);
        }
      }}
    >
      {value ? String(value) : "—"}
    </div>
  );
}

function NumberCell({ value, isEditing, isReadOnly, density, onCommit, onCancel }: CellProps) {
  const [draft, setDraft] = useEditingValue(value == null ? "" : String(value));
  if (isEditing && !isReadOnly) {
    return (
      <Input
        type="number"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onCommit(draft === "" ? null : Number(draft))}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(draft === "" ? null : Number(draft));
          if (e.key === "Escape") onCancel();
        }}
        className={cn(getEditInput(density), "tabular-nums")}
      />
    );
  }
  return (
    <div className={cn(getReadClass(density), "tabular-nums", !isReadOnly && "cursor-text")}>
      {value != null ? String(value) : "—"}
    </div>
  );
}

function CurrencyCell(props: CellProps) {
  const { value, isEditing, density } = props;
  if (isEditing) return <NumberCell {...props} />;
  const n = typeof value === "number" ? value : value ? Number(value) : null;
  return (
    <div className={cn(getReadClass(density), "tabular-nums", !props.isReadOnly && "cursor-text")}>
      {n != null ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
    </div>
  );
}

function DateCell({ value, isReadOnly, isEditing, density, onCommit, onCancel }: CellProps) {
  const [open, setOpen] = useState(false);
  const dateVal = value ? new Date(String(value)) : undefined;

  // Auto-open popover when grid transitions cell to editing state
  useEffect(() => {
    if (isEditing && !isReadOnly) {
      setOpen(true);
    }
  }, [isEditing, isReadOnly]);

  let pretty = "—";
  if (value) {
    try {
      pretty = format(new Date(String(value)), "MMM d, yyyy");
    } catch {
      pretty = String(value);
    }
  }

  const readClass = getReadClass(density);
  const readMuted = getReadMuted(density);

  if (isReadOnly) {
    return <div className={pretty === "—" ? readMuted : readClass}>{pretty}</div>;
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // When popover closes, exit edit mode
    if (!next) onCancel();
  };

  const iconSize = density === "compact" ? "h-2.5 w-2.5" : density === "comfortable" ? "h-3.5 w-3.5" : "h-3 w-3";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-full w-full items-center gap-1.5 text-left",
            pretty === "—" ? readMuted : readClass,
            "cursor-pointer hover:bg-foreground/[0.04]",
          )}
        >
          <CalendarIcon className={cn(iconSize, "shrink-0 text-foreground-disabled")} />
          {pretty}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateVal}
          onSelect={(day) => {
            if (day) {
              // Commit as ISO date string (YYYY-MM-DD)
              const iso = format(day, "yyyy-MM-dd");
              onCommit(iso);
            } else {
              onCommit(null);
            }
            setOpen(false);
          }}
          defaultMonth={dateVal}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/* Select cells                                                        */
/* ------------------------------------------------------------------ */

function SingleSelectCell({ column, value, isReadOnly, density, onCommit }: CellProps) {
  const opts = column.options ?? [];
  const triggerTextClass = density === "compact" ? "text-xs px-3" : density === "comfortable" ? "text-base px-3" : "text-sm px-3";
  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(v) => onCommit(v)}
      disabled={isReadOnly}
    >
      <SelectTrigger className={cn("h-full rounded-none border-0 bg-transparent focus:ring-1", triggerTextClass)}>
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {opts.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiSelectCell({ column, value, isReadOnly, density, onCommit }: CellProps) {
  const opts = column.options ?? [];
  const selected: string[] = Array.isArray(value)
    ? (value as string[])
    : value
      ? String(value)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const toggle = (opt: string) => {
    if (isReadOnly) return;
    const next = selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt];
    onCommit(next.join(", "));
  };

  const containerClass = density === "compact"
    ? "flex h-full flex-wrap items-center gap-0.5 px-3 py-0.5"
    : density === "comfortable"
      ? "flex h-full flex-wrap items-center gap-1.5 px-3 py-2"
      : "flex h-full flex-wrap items-center gap-1 px-3 py-1";

  const badgeClass = density === "compact"
    ? "cursor-pointer text-[9px] px-1 py-0"
    : density === "comfortable"
      ? "cursor-pointer text-[11px] px-2 py-0.5"
      : "cursor-pointer text-[10px] px-1.5 py-0.5";

  return (
    <div className={containerClass}>
      {opts.length === 0 && <span className={getReadMuted(density)}>No options</span>}
      {opts.map((o) => (
        <Badge
          key={o}
          variant={selected.includes(o) ? "default" : "outline"}
          onClick={() => toggle(o)}
          className={badgeClass}
        >
          {o}
        </Badge>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status / VideoType — bound to lookup tables                         */
/* ------------------------------------------------------------------ */

function StatusCell({ value, isReadOnly, density, onCommit }: CellProps) {
  const { data: statuses } = useStatuses();
  const current = statuses?.find((s) => s.id === value);
  const triggerTextClass = density === "compact" ? "text-xs px-3" : density === "comfortable" ? "text-base px-3" : "text-sm px-3";
  const badgeClass = density === "compact"
    ? "inline-flex items-center gap-1 rounded-full px-1.5 py-0 text-[10px] font-medium"
    : density === "comfortable"
      ? "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-medium"
      : "inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium";

  const dotSize = density === "compact" ? "h-1 w-1" : density === "comfortable" ? "h-2 w-2" : "h-1.5 w-1.5";

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={onCommit}
      disabled={isReadOnly}
    >
      <SelectTrigger className={cn("h-full rounded-none border-0 bg-transparent focus:ring-1", triggerTextClass)}>
        <span
          className={badgeClass}
          style={{
            backgroundColor: current?.color ? `${current.color}22` : "transparent",
            color: current?.color ?? "inherit",
          }}
        >
          {current && (
            <span
              className={cn("rounded-full", dotSize)}
              style={{ backgroundColor: current.color ?? "currentColor" }}
            />
          )}
          {current?.display_name ?? "—"}
        </span>
      </SelectTrigger>
      <SelectContent>
        {statuses?.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            <span className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: s.color ?? "currentColor" }}
              />
              {s.display_name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function VideoTypeCell({ value, isReadOnly, density, onCommit }: CellProps) {
  const { data: types } = useVideoTypes();
  const current = types?.find((t) => t.id === value);
  const triggerTextClass = density === "compact" ? "text-xs px-3" : density === "comfortable" ? "text-base px-3" : "text-sm px-3";
  const badgeClass = density === "compact"
    ? "text-[10px] px-1 py-0"
    : density === "comfortable"
      ? "text-xs px-2 py-0.5"
      : "text-[11px] px-1.5 py-0.5";

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={onCommit}
      disabled={isReadOnly}
    >
      <SelectTrigger className={cn("h-full rounded-none border-0 bg-transparent focus:ring-1", triggerTextClass)}>
        <Badge variant="outline" className={badgeClass}>
          {current?.display_name ?? "—"}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {types?.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.display_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ */
/* Media cells                                                         */
/* ------------------------------------------------------------------ */

function ThumbnailCell({ row, density }: CellProps) {
  return <ThumbnailMediaCell row={row?.data as any} density={density} />;
}

function VideoCell({ row, density }: CellProps) {
  return <VideoMediaCell row={row?.data as any} density={density} />;
}

function ReviewCell({ row, value, isReadOnly, density }: CellProps) {
  const v = (value as { commentCount?: number; status?: string | null } | null) ?? null;
  return (
    <ReviewToggleCell
      videoId={row?.id}
      videoTitle={(row?.data?.video_title as string) ?? ""}
      currentStatusId={row?.data?.status_id as string | null | undefined}
      projectId={row?.data?.project_id as string | null | undefined}
      clientId={row?.data?.client_id as string | null | undefined}
      isReadOnly={isReadOnly}
      row={row}
      commentCount={v?.commentCount ?? 0}
      density={density}
    />
  );
}

function EditorsCell({ value, isReadOnly, density, onCommit }: CellProps) {
  const ids: string[] = Array.isArray(value) ? (value as string[]) : [];
  return (
    <EditorsCellInner value={ids} isReadOnly={isReadOnly} onCommit={(next) => onCommit(next)} density={density} />
  );
}

/* ------------------------------------------------------------------ */
/* Validated text cells                                                */
/* ------------------------------------------------------------------ */

function UrlCell(props: CellProps) {
  const { value, isEditing, density } = props;
  if (isEditing) return <TextCell {...props} />;
  if (!value) return <div className={getReadMuted(density)}>—</div>;
  const linkTextClass = density === "compact" ? "text-xs px-3" : density === "comfortable" ? "text-base px-3" : "text-sm px-3";
  const iconSize = density === "compact" ? "h-2.5 w-2.5" : density === "comfortable" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <a
      href={String(value)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("flex h-full items-center gap-1 text-primary hover:underline", linkTextClass)}
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink className={cn(iconSize, "shrink-0")} />
      <span className="truncate">{String(value)}</span>
    </a>
  );
}

function EmailCell(props: CellProps) {
  const { value, isEditing, density } = props;
  if (isEditing) return <TextCell {...props} />;
  if (!value) return <div className={getReadMuted(density)}>—</div>;
  const linkTextClass = density === "compact" ? "text-xs px-3 py-0.5" : density === "comfortable" ? "text-base px-3 py-2" : "text-sm px-3 py-1";
  return (
    <a
      href={`mailto:${String(value)}`}
      className={cn("block h-full text-primary hover:underline", linkTextClass)}
      onClick={(e) => e.stopPropagation()}
    >
      {String(value)}
    </a>
  );
}

function PhoneCell(props: CellProps) {
  const { value, isEditing, density } = props;
  if (isEditing) return <TextCell {...props} />;
  if (!value) return <div className={getReadMuted(density)}>—</div>;
  const linkTextClass = density === "compact" ? "text-xs px-3 py-0.5" : density === "comfortable" ? "text-base px-3 py-2" : "text-sm px-3 py-1";
  return (
    <a
      href={`tel:${String(value)}`}
      className={cn("block h-full tabular-nums text-foreground hover:underline", linkTextClass)}
      onClick={(e) => e.stopPropagation()}
    >
      {String(value)}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

function YesNoCell({ value, isReadOnly, onCommit }: CellProps) {
  const checked = value === true || value === "true";
  return (
    <div className="flex h-full items-center justify-center">
      <Checkbox
        checked={checked}
        disabled={isReadOnly}
        onCheckedChange={(v) => onCommit(Boolean(v))}
      />
    </div>
  );
}

function RatingCell({ value, isReadOnly, density, onCommit }: CellProps) {
  const n = typeof value === "number" ? value : value ? Number(value) : 0;
  const starSize = density === "compact" ? "h-3 w-3" : density === "comfortable" ? "h-4 w-4" : "h-3.5 w-3.5";
  const containerClass = density === "compact" ? "px-2" : density === "comfortable" ? "px-4" : "px-3";
  return (
    <div className={cn("flex h-full items-center gap-0.5", containerClass)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={isReadOnly}
          onClick={() => onCommit(i === n ? 0 : i)}
          className="text-foreground-muted hover:text-warning"
        >
          <Star className={cn(starSize, i <= n && "fill-warning text-warning")} />
        </button>
      ))}
    </div>
  );
}

function ProgressCell({ value, density }: CellProps) {
  const n = typeof value === "number" ? value : value ? Number(value) : 0;
  const pct = Math.max(0, Math.min(100, n));
  const containerClass = density === "compact" ? "px-2" : density === "comfortable" ? "px-4" : "px-3";
  const textClass = density === "compact"
    ? "w-8 text-right text-[10px] tabular-nums text-foreground-muted"
    : density === "comfortable"
      ? "w-12 text-right text-sm tabular-nums text-foreground-muted"
      : "w-10 text-right text-xs tabular-nums text-foreground-muted";
  const progressHeight = density === "compact" ? "h-1" : density === "comfortable" ? "h-2" : "h-1.5";
  return (
    <div className={cn("flex h-full items-center gap-2", containerClass)}>
      <div className={cn("flex-1 overflow-hidden rounded-full bg-surface-raised", progressHeight)}>
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className={textClass}>{pct}%</span>
    </div>
  );
}

function FileCell({ value, density }: CellProps) {
  if (!value) return <div className={getReadMuted(density)}>—</div>;
  const textClass = density === "compact" ? "text-xs px-3" : density === "comfortable" ? "text-base px-3" : "text-sm px-3";
  const iconSize = density === "compact" ? "h-2.5 w-2.5" : density === "comfortable" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <a
      href={String(value)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("flex h-full items-center gap-1 text-primary hover:underline", textClass)}
    >
      <ExternalLink className={cn(iconSize, "shrink-0")} />
      File
    </a>
  );
}

function ImageCell({ value, density }: CellProps) {
  if (!value) {
    const size = density === "compact" ? "h-3.5 w-3.5" : density === "comfortable" ? "h-6 w-6" : "h-4 w-4";
    return (
      <div className="flex h-full items-center justify-center">
        <div className={cn("rounded-sm bg-foreground/[0.08]", size)} />
      </div>
    );
  }
  const size = density === "compact" ? "h-8 w-8 rounded-sm" : density === "comfortable" ? "h-16 w-16 rounded-md" : "h-10 w-10 rounded";
  return (
    <div className="flex h-full items-center justify-center">
      <img src={String(value)} alt="" className={cn("object-cover", size)} loading="lazy" />
    </div>
  );
}



/* ------------------------------------------------------------------ */
/* Factory                                                             */
/* ------------------------------------------------------------------ */

export function CellRenderer(props: CellProps) {
  switch (props.column.type) {
    case "text":
      return <TextCell {...props} />;
    case "long_text":
      return <LongTextCell {...props} />;
    case "number":
      return <NumberCell {...props} />;
    case "currency":
      return <CurrencyCell {...props} />;
    case "date":
      return <DateCell {...props} />;
    case "single_select":
      return <SingleSelectCell {...props} />;
    case "multi_select":
      return <MultiSelectCell {...props} />;
    case "status":
      return <StatusCell {...props} />;
    case "video_type":
      return <VideoTypeCell {...props} />;
    case "thumbnail":
      return <ThumbnailCell {...props} />;
    case "video":
      return <VideoCell {...props} />;
    case "review":
      return <ReviewCell {...props} />;
    case "editors":
      return <EditorsCell {...props} />;
    case "url":
      return <UrlCell {...props} />;
    case "email":
      return <EmailCell {...props} />;
    case "phone":
      return <PhoneCell {...props} />;
    case "yes_no":
      return <YesNoCell {...props} />;
    case "rating":
      return <RatingCell {...props} />;
    case "progress":
      return <ProgressCell {...props} />;
    case "file":
      return <FileCell {...props} />;
    case "image":
      return <ImageCell {...props} />;
    default: {
      // Fallback — render as text
      return <TextCell {...(props as CellProps)} />;
    }
  }
}
