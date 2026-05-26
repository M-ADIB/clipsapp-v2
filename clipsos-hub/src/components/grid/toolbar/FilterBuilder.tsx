/**
 * FilterBuilder — sheet with N filter rows, AND-combined.
 *
 * Wave 3.6:
 *   - Per-type operator list (text vs date vs select)
 *   - Date presets (today, yesterday, this week, this month) injected as
 *     concrete values when chosen
 *   - Real <Select> for status / video_type instead of free text
 *   - Apply-and-clear actions in the sheet footer
 */
import type { ReactNode } from "react";
import { Plus, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStatuses, useVideoTypes } from "@/hooks/use-lookups";
import type { CellType, FilterRule, GridColumn } from "../core/types";

const OPERATORS_BY_TYPE: Partial<Record<CellType, FilterRule["operator"][]>> = {
  text: ["contains", "eq", "neq", "is_empty", "is_not_empty"],
  long_text: ["contains", "is_empty", "is_not_empty"],
  date: ["eq", "gt", "lt", "is_empty", "is_not_empty"],
  number: ["eq", "neq", "gt", "lt", "is_empty"],
  currency: ["eq", "neq", "gt", "lt", "is_empty"],
  status: ["eq", "neq", "is_empty", "is_not_empty"],
  video_type: ["eq", "neq", "is_empty", "is_not_empty"],
  single_select: ["eq", "neq", "is_empty"],
  multi_select: ["contains", "is_empty"],
  url: ["contains", "is_empty"],
  email: ["contains", "is_empty"],
  yes_no: ["eq"],
  editors: ["contains", "is_empty", "is_not_empty"],
};

const OP_LABEL: Record<FilterRule["operator"], string> = {
  eq: "is",
  neq: "is not",
  contains: "contains",
  gt: "is after",
  lt: "is before",
  in: "is one of",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

/* ------------------------------------------------------------------ */
/* Date presets                                                        */
/* ------------------------------------------------------------------ */

type DatePreset = "today" | "yesterday" | "this_week" | "this_month" | "next_7_days";

function presetToISO(p: DatePreset): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (p) {
    case "today":
      return d.toISOString().slice(0, 10);
    case "yesterday":
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    case "this_week": {
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      return d.toISOString().slice(0, 10);
    }
    case "this_month":
      return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
    case "next_7_days":
      return d.toISOString().slice(0, 10);
  }
}

const PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "Start of this week" },
  { value: "this_month", label: "Start of this month" },
];

/* ------------------------------------------------------------------ */

interface FilterBuilderProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  columns: GridColumn[];
  filters: FilterRule[];
  onChange: (next: FilterRule[]) => void;
  /** Optional children to use as the trigger button */
  children?: ReactNode;
}

export function FilterBuilder({
  open,
  onOpenChange,
  columns,
  filters,
  onChange,
  children,
}: FilterBuilderProps) {
  const filterableColumns = columns.filter((c) => OPERATORS_BY_TYPE[c.type]);
  const { data: statuses = [] } = useStatuses();
  const { data: videoTypes = [] } = useVideoTypes();

  const addRule = () => {
    if (filterableColumns.length === 0) return;
    const c = filterableColumns[0];
    const op = OPERATORS_BY_TYPE[c.type]?.[0] ?? "contains";
    onChange([...filters, { columnId: c.id, operator: op, value: "" }]);
  };
  const updateRule = (i: number, patch: Partial<FilterRule>) => {
    onChange(filters.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  };
  const removeRule = (i: number) => onChange(filters.filter((_, idx) => idx !== i));

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {children && <PopoverTrigger asChild>{children}</PopoverTrigger>}
      <PopoverContent align="start" sideOffset={4} className="w-[440px] p-0">
        <div className="border-b border-border px-3 py-2.5">
          <span className="text-xs font-semibold text-foreground">Filter videos</span>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-3 space-y-2">
          {filters.length === 0 && (
            <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-foreground-disabled">
              No filters yet.
            </div>
          )}

          {filters.map((f, i) => {
            const col = columns.find((c) => c.id === f.columnId);
            const ops: FilterRule["operator"][] = col
              ? (OPERATORS_BY_TYPE[col.type] ?? ["contains"])
              : ["contains"];
            const needsValue = f.operator !== "is_empty" && f.operator !== "is_not_empty";
            return (
              <div
                key={i}
                className="flex flex-col gap-1.5 rounded-md border border-border bg-surface-raised/60 p-2"
              >
                <div className="flex items-center gap-1.5">
                  <Select
                    value={f.columnId}
                    onValueChange={(v) => {
                      const c = filterableColumns.find((x) => x.id === v);
                      const op = c ? (OPERATORS_BY_TYPE[c.type]?.[0] ?? "contains") : "contains";
                      updateRule(i, { columnId: v, operator: op, value: "" });
                    }}
                  >
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterableColumns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={f.operator}
                    onValueChange={(v) => updateRule(i, { operator: v as FilterRule["operator"] })}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ops.map((op) => (
                        <SelectItem key={op} value={op}>
                          {OP_LABEL[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6"
                    onClick={() => removeRule(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* ── Value input (per type) ───────────────── */}
                {needsValue && col && (
                  <ValueInput
                    column={col}
                    value={f.value}
                    onChange={(v) => updateRule(i, { value: v })}
                    statuses={statuses}
                    videoTypes={videoTypes}
                  />
                )}
              </div>
            );
          })}

          <Button variant="outline" size="sm" onClick={addRule} className="w-full">
            <Plus className="mr-1 h-3 w-3" /> Add filter
          </Button>

          {filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="w-full text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/* Value input (per cell type)                                         */
/* ------------------------------------------------------------------ */

function ValueInput({
  column,
  value,
  onChange,
  statuses,
  videoTypes,
}: {
  column: GridColumn;
  value: unknown;
  onChange: (v: unknown) => void;
  statuses: { id: string; display_name: string }[];
  videoTypes: { id: string; display_name: string }[];
}) {
  if (column.type === "status") {
    return (
      <Select value={String(value ?? "")} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Pick status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (column.type === "video_type") {
    return (
      <Select value={String(value ?? "")} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Pick type" />
        </SelectTrigger>
        <SelectContent>
          {videoTypes.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (column.type === "yes_no") {
    return (
      <Select value={String(value ?? "")} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Yes / No" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (column.type === "date") {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 flex-1 text-xs"
        />
        <Select value="" onValueChange={(p) => onChange(presetToISO(p as DatePreset))}>
          <SelectTrigger className="h-7 w-20 text-xs">
            <SelectValue placeholder="…" />
          </SelectTrigger>
          <SelectContent>
            {PRESET_OPTIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (column.type === "number" || column.type === "currency") {
    return (
      <Input
        type="number"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-xs"
        placeholder="Value"
      />
    );
  }

  return (
    <Input
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 text-xs"
      placeholder="Value"
    />
  );
}

/* ------------------------------------------------------------------ */

/** Apply filters in-memory to a GridRow list. */
export function applyFilters(
  rows: { id: string; data: Record<string, unknown>; custom: Record<string, string | null> }[],
  filters: FilterRule[],
  columns: GridColumn[],
) {
  if (filters.length === 0) return rows;
  return rows.filter((r) =>
    filters.every((f) => {
      const col = columns.find((c) => c.id === f.columnId);
      if (!col) return true;
      const raw = col.source === "custom" ? r.custom[col.id] : r.data[col.field];

      // Editors is an array
      if (col.type === "editors") {
        const arr = Array.isArray(raw) ? (raw as string[]) : [];
        switch (f.operator) {
          case "is_empty":
            return arr.length === 0;
          case "is_not_empty":
            return arr.length > 0;
          case "contains":
            return arr.includes(String(f.value ?? ""));
          default:
            return true;
        }
      }

      const value = raw == null ? null : String(raw).toLowerCase();
      const fv = f.value == null ? "" : String(f.value).toLowerCase();
      switch (f.operator) {
        case "is_empty":
          return value == null || value === "";
        case "is_not_empty":
          return value != null && value !== "";
        case "eq":
          return value === fv;
        case "neq":
          return value !== fv;
        case "contains":
          return value != null && value.includes(fv);
        case "gt":
          return value != null && value > fv;
        case "lt":
          return value != null && value < fv;
        default:
          return true;
      }
    }),
  );
}
