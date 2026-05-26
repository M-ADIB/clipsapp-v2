/**
 * SeniorEditorProjectsPage — Senior Editor > Projects
 *
 * Read-only project list. Reuses the same table pattern as ProjectsDashboard
 * but without the "Project Builder" tab or "New Project" button.
 */

import { FullBleed } from "@/components/app-shell/FullBleed";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  Filter,
  FolderGit2,
  LayoutGrid,
  Layers,
  Search,
  Settings2,
} from "lucide-react";
import { useDashboardView, type DashboardColumn } from "@/components/dashboard/useDashboardView";
import { DashboardColumnsPopover } from "@/components/dashboard/DashboardColumnsPopover";
import { DashboardFilterPopover } from "@/components/dashboard/DashboardFilterPopover";
import { DashboardSortPopover } from "@/components/dashboard/DashboardSortPopover";
import { StatusBadge } from "@/components/dashboard";
import { useProjects, useClients } from "@/hooks/data";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type ProjectStatus = "active" | "completed" | "paused" | "archived";
type ProjectList = "all" | ProjectStatus;
type SortField = "name" | "client" | "cadence" | "status" | "created";

const STATUS_MAP: Record<
  ProjectStatus,
  { variant: "approved" | "pending" | "posted" | "draft"; label: string }
> = {
  active: { variant: "approved", label: "Active" },
  completed: { variant: "posted", label: "Completed" },
  paused: { variant: "pending", label: "Paused" },
  archived: { variant: "draft", label: "Archived" },
};

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "client", label: "Client" },
  { key: "cadence", label: "Cadence" },
  { key: "status", label: "Status" },
  { key: "created", label: "Created" },
];

const COLUMNS: DashboardColumn[] = [
  { key: "name", label: "Project", width: "240px", pinned: true },
  { key: "client", label: "Client", width: "180px" },
  { key: "cadence", label: "Cadence", width: "130px" },
  {
    key: "status",
    label: "Status",
    width: "120px",
    filterable: true,
    filterOptions: ["active", "completed", "paused", "archived"],
  },
  { key: "created", label: "Created", width: "140px" },
  { key: "videos", label: "Videos", width: "100px" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCadence(cadence: string | null | undefined): string {
  if (!cadence) return "—";
  return cadence.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* UI primitives                                                       */
/* ------------------------------------------------------------------ */

function Dropdown({
  children,
  onClose,
  align = "left",
}: {
  children: ReactNode;
  onClose: () => void;
  align?: "left" | "right";
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-surface-card py-1.5 shadow-lg ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}

function DropdownItem({
  children,
  onClick,
  active = false,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 px-3 py-1.5 text-xs transition-colors hover:bg-surface-raised/50 ${
        active ? "text-primary" : "text-foreground-muted"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function SeniorEditorProjectsPage() {
  const navigate = useNavigate();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { data: projects = [], isLoading } = useProjects();
  const { data: clients = [] } = useClients();

  const clientSlugMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, c.slug ?? c.id);
    return map;
  }, [clients]);

  // Register header — no tabs for senior editor (no Project Builder)
  useEffect(() => {
    setHeaderConfig({ title: "Projects" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const [activeList, setActiveList] = useState<ProjectList>("all");
  const [sortField, setSortField] = useState<SortField>("created");
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const dashView = useDashboardView("se-projects", COLUMNS);
  const visibleSet = useMemo(
    () => new Set(dashView.visibleColumns.map((c) => c.key)),
    [dashView.visibleColumns],
  );
  const show = (key: string) => visibleSet.has(key);

  const getClientName = (p: (typeof projects)[number]) =>
    (p as { client?: { name?: string } }).client?.name ?? "Unknown";

  const lists = useMemo(() => {
    const counts: Record<ProjectList, number> = {
      all: projects.length,
      active: 0,
      completed: 0,
      paused: 0,
      archived: 0,
    };
    for (const p of projects) {
      const s = (p.status as ProjectStatus) ?? "active";
      if (counts[s] !== undefined) counts[s] += 1;
    }
    return [
      { key: "all" as ProjectList, label: "All Projects", count: counts.all },
      { key: "active" as ProjectList, label: "Active", count: counts.active },
      { key: "completed" as ProjectList, label: "Completed", count: counts.completed },
      { key: "paused" as ProjectList, label: "Paused", count: counts.paused },
      { key: "archived" as ProjectList, label: "Archived", count: counts.archived },
    ].filter((l) => l.key === "all" || l.count > 0);
  }, [projects]);

  const activeListData = lists.find((l) => l.key === activeList) ?? lists[0];

  const filteredProjects = useMemo(() => {
    let rows = projects;
    if (activeList !== "all") rows = rows.filter((p) => p.status === activeList);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.project_name.toLowerCase().includes(q) || getClientName(p).toLowerCase().includes(q),
      );
    }
    const statusFilter = dashView.filters.status;
    if (statusFilter && statusFilter.length > 0) {
      rows = rows.filter((p) => statusFilter.includes(p.status ?? "active"));
    }
    const sorted = [...rows].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":
          return dir * a.project_name.localeCompare(b.project_name);
        case "client":
          return dir * getClientName(a).localeCompare(getClientName(b));
        case "cadence":
          return dir * (a.cadence ?? "").localeCompare(b.cadence ?? "");
        case "status":
          return dir * (a.status ?? "").localeCompare(b.status ?? "");
        case "created":
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        default:
          return 0;
      }
    });
    return sorted;
  }, [projects, activeList, searchTerm, sortField, sortDirection, dashView.filters]);

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredProjects.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(filteredProjects.map((p) => p.id)));
  };

  return (
    <FullBleed>
      {/* ── Toolbar Row ──────────────────────────────────── */}
      <div
        className="flex h-auto min-h-[44px] flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-5 md:py-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-foreground-strong transition-colors hover:bg-surface-raised/50"
            >
              <LayoutGrid className="h-3 w-3 text-primary" />
              {activeListData.label}
              <ChevronDown className="h-3 w-3 text-foreground-muted" />
            </button>
            {showListDropdown && (
              <Dropdown onClose={() => setShowListDropdown(false)}>
                {lists.map((list) => (
                  <DropdownItem
                    key={list.key}
                    active={list.key === activeList}
                    onClick={() => {
                      setActiveList(list.key);
                      setShowListDropdown(false);
                    }}
                  >
                    <span>{list.label}</span>
                    <span className="text-foreground-disabled">{list.count}</span>
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>

          <div className="h-4 w-px bg-border" />

          <DashboardColumnsPopover
            columns={COLUMNS}
            hidden={dashView.hidden}
            onToggle={dashView.toggleColumn}
            onShowAll={dashView.showAllColumns}
          >
            <button className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-surface-raised/50 hover:text-foreground-strong md:flex">
              <Settings2 className="h-3 w-3" />
              Columns
              {dashView.hidden.size > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[9px] font-bold text-primary-foreground">
                  {COLUMNS.length - dashView.hidden.size}
                </span>
              )}
            </button>
          </DashboardColumnsPopover>
        </div>

        {/* No "New Project" button — senior editors are read-only */}
        <div />
      </div>

      {/* ── Sort & Filter Bar ────────────────────────────── */}
      <div
        className="flex h-[38px] items-center gap-2 px-3 md:px-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <DashboardSortPopover
          options={SORT_OPTIONS}
          activeKey={sortField}
          direction={sortDirection}
          onSort={(key, dir) => {
            setSortField(key as SortField);
            setSortDirection(dir);
          }}
        >
          <button className="flex items-center gap-1.5 rounded-md bg-surface-raised px-2.5 py-1 text-[11px] font-medium text-foreground-muted transition-colors hover:bg-surface-muted">
            <ArrowUpDown className="h-3 w-3 text-foreground-disabled" />
            Sort
          </button>
        </DashboardSortPopover>

        <DashboardFilterPopover
          columns={COLUMNS}
          filters={dashView.filters}
          onSetFilter={dashView.setFilter}
          onClearAll={dashView.clearFilters}
        >
          <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] text-foreground-muted transition-colors hover:bg-surface-raised/50 hover:text-foreground-strong">
            <Filter className="h-3 w-3" />
            Filter
            {dashView.filterCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[9px] font-bold text-primary-foreground">
                {dashView.filterCount}
              </span>
            )}
          </button>
        </DashboardFilterPopover>

        <div className="flex-1" />

        {searchOpen && (
          <input
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects…"
            className="h-6 w-48 rounded bg-surface-raised px-2 text-[11px] text-foreground placeholder:text-foreground-disabled focus:outline-none"
          />
        )}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex h-6 w-6 items-center justify-center rounded text-foreground-disabled transition-colors hover:bg-surface-raised/50 hover:text-foreground-muted"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="w-10 border-b border-border px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.size === filteredProjects.length && filteredProjects.length > 0
                  }
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                />
              </th>
              {COLUMNS.filter((col) => col.pinned || visibleSet.has(col.key)).map((col) => (
                <th
                  key={col.key}
                  className="border-b border-border px-3 py-2 text-left"
                  style={{ width: col.width, minWidth: col.width }}
                >
                  <span className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={dashView.visibleColumns.length + 1}
                  className="px-4 py-12 text-center text-xs text-foreground-disabled"
                >
                  Loading projects…
                </td>
              </tr>
            )}
            {!isLoading && filteredProjects.length === 0 && (
              <tr>
                <td colSpan={dashView.visibleColumns.length + 1} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised">
                      <Layers className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <p className="text-sm text-foreground-muted">No projects found.</p>
                  </div>
                </td>
              </tr>
            )}
            {filteredProjects.map((project) => {
              const isSelected = selectedRows.has(project.id);
              const status = (project.status as ProjectStatus) ?? "active";
              const s = STATUS_MAP[status] ?? STATUS_MAP.active;
              const clientName = getClientName(project);

              return (
                <tr
                  key={project.id}
                  className={`cursor-pointer transition-colors hover:bg-surface-raised/50 ${isSelected ? "bg-surface-raised" : ""}`}
                  onClick={() =>
                    navigate({
                      to: "/senior-editor/clients/$clientSlug" as "/owner/clients/$clientSlug",
                      params: {
                        clientSlug: clientSlugMap.get(project.client_id) ?? project.client_id,
                      },
                    })
                  }
                >
                  <td
                    className="border-b border-border/50 px-3 py-2.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(project.id)}
                      className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                    />
                  </td>
                  {/* Project Name — always visible (pinned) */}
                  <td className="border-b border-border/50 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FolderGit2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">
                          {project.project_name}
                        </span>
                        <span className="text-[10px] text-foreground-disabled">{clientName}</span>
                      </div>
                    </div>
                  </td>
                  {show("client") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground-muted">{clientName}</span>
                    </td>
                  )}
                  {show("cadence") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-foreground-disabled" />
                        <span className="text-xs text-foreground-muted">
                          {formatCadence(project.cadence)}
                        </span>
                      </div>
                    </td>
                  )}
                  {show("status") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <StatusBadge variant={s.variant} label={s.label} />
                    </td>
                  )}
                  {show("created") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground-muted">
                        {formatDate(project.created_at)}
                      </span>
                    </td>
                  )}
                  {show("videos") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground-muted">—</span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer: Aggregation ──────────────────────────── */}
      <div
        className="flex h-[36px] items-center justify-between px-3 md:px-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-[11px] text-foreground-disabled">
          Count: <span className="text-foreground-muted">{filteredProjects.length}</span>
        </span>
      </div>
    </FullBleed>
  );
}
