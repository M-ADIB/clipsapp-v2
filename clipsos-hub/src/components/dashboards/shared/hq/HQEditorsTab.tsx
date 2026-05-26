/**
 * HQEditorsTab — Editor performance table with search, sort, and drill-down.
 *
 * Columns: Editor (avatar + name + email), Role, Active, Month Done,
 * Goal Progress bar, Daily Pace badge, Quarter Total.
 * Row click navigates to the team member profile page.
 */

import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Search, ArrowUpDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorRow } from "@/hooks/use-hq-analytics";

interface HQEditorsTabProps {
  data: EditorRow[];
  isLoading: boolean;
}

type SortField = "fullName" | "activeCount" | "monthCompleted" | "dailyPace" | "quarterCompleted";

const PACE_CONFIG = {
  on_track: { label: "On Track", className: "bg-emerald-500/15 text-emerald-400" },
  at_risk: { label: "At Risk", className: "bg-amber-500/15 text-amber-400" },
  behind: { label: "Behind", className: "bg-red-500/15 text-red-400" },
} as const;

const ROLE_LABELS: Record<string, string> = {
  editor: "Editor",
  senior_editor: "Senior Editor",
};

export function HQEditorsTab({ data, isLoading }: HQEditorsTabProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const basePath = role === "manager" ? "/manager" : "/owner";

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filter + sort
  const rows = useMemo(() => {
    let filtered = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = data.filter(
        (e) => e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
      );
    }

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "fullName") {
        cmp = a.fullName.localeCompare(b.fullName);
      } else if (sortField === "dailyPace") {
        const order = { on_track: 0, at_risk: 1, behind: 2 };
        cmp = order[a.dailyPace] - order[b.dailyPace];
      } else {
        cmp = (a[sortField] as number) - (b[sortField] as number);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, search, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  if (isLoading) {
    return <EditorsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search editors..."
            className="h-9 w-full rounded-md border border-border bg-surface-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {rows.length} editor{rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-card/50">
              <SortableHeader
                label="Editor"
                field="fullName"
                current={sortField}
                dir={sortDir}
                onToggle={toggleSort}
                className="min-w-[200px]"
              />
              <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Role
              </th>
              <SortableHeader
                label="Active"
                field="activeCount"
                current={sortField}
                dir={sortDir}
                onToggle={toggleSort}
              />
              <SortableHeader
                label="Month Done"
                field="monthCompleted"
                current={sortField}
                dir={sortDir}
                onToggle={toggleSort}
              />
              <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-[140px]">
                Goal Progress
              </th>
              <SortableHeader
                label="Pace"
                field="dailyPace"
                current={sortField}
                dir={sortDir}
                onToggle={toggleSort}
              />
              <SortableHeader
                label="Quarter"
                field="quarterCompleted"
                current={sortField}
                dir={sortDir}
                onToggle={toggleSort}
              />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-sm text-muted-foreground">
                  {search ? "No editors match your search" : "No editors found"}
                </td>
              </tr>
            ) : (
              rows.map((editor) => {
                const paceConfig = PACE_CONFIG[editor.dailyPace];
                const goalPercent = Math.min(
                  Math.round((editor.monthCompleted / editor.monthlyGoal) * 100),
                  100,
                );

                return (
                  <tr
                    key={editor.userId}
                    onClick={() =>
                      navigate({
                        to: `${basePath}/team/$userId`,
                        params: { userId: editor.userId },
                      })
                    }
                    className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-surface-card/70"
                  >
                    {/* Editor */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <EditorAvatar name={editor.fullName} url={editor.avatarUrl} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground-strong">
                            {editor.fullName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{editor.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-3 py-2.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        {ROLE_LABELS[editor.role] ?? editor.role}
                      </span>
                    </td>

                    {/* Active */}
                    <td className="px-3 py-2.5 text-center font-medium text-foreground-strong tabular-nums">
                      {editor.activeCount}
                    </td>

                    {/* Month Done */}
                    <td className="px-3 py-2.5 text-center font-medium text-foreground-strong tabular-nums">
                      {editor.monthCompleted}
                    </td>

                    {/* Goal Progress */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${goalPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {editor.monthCompleted}/{editor.monthlyGoal}
                        </span>
                      </div>
                    </td>

                    {/* Pace */}
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          paceConfig.className,
                        )}
                      >
                        {paceConfig.label}
                      </span>
                    </td>

                    {/* Quarter */}
                    <td className="px-3 py-2.5 text-center font-medium text-foreground-strong tabular-nums">
                      {editor.quarterCompleted}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Sortable header cell ── */
function SortableHeader({
  label,
  field,
  current,
  dir,
  onToggle,
  className,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: "asc" | "desc";
  onToggle: (f: SortField) => void;
  className?: string;
}) {
  const isActive = current === field;
  return (
    <th
      className={cn(
        "whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors",
        className,
      )}
      onClick={() => onToggle(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn("h-3 w-3 transition-opacity", isActive ? "opacity-100" : "opacity-30")}
        />
        {isActive && dir === "desc" && <ChevronDown className="h-3 w-3 -ml-1" />}
      </span>
    </th>
  );
}

/* ── Avatar ── */
function EditorAvatar({ name, url }: { name: string; url: string | null }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (url) {
    return <img src={url} alt={name} className="h-8 w-8 shrink-0 rounded-full object-cover" />;
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
      {initials}
    </div>
  );
}

/* ── Skeleton ── */
function EditorsSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 md:p-6">
      <div className="h-9 w-48 animate-pulse rounded-md bg-surface-card" />
      <div className="overflow-hidden rounded-lg border border-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-0"
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-card" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-32 animate-pulse rounded bg-surface-card" />
              <div className="h-2 w-24 animate-pulse rounded bg-surface-card" />
            </div>
            <div className="h-4 w-12 animate-pulse rounded bg-surface-card" />
            <div className="h-4 w-12 animate-pulse rounded bg-surface-card" />
            <div className="h-1.5 w-24 animate-pulse rounded-full bg-surface-card" />
          </div>
        ))}
      </div>
    </div>
  );
}
