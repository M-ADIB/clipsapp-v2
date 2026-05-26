/**
 * OwnerClientsPage — Table list of all clients.
 *
 * Pulls real data from `clients` table via `useClients()`.
 * Clicking a row navigates to `/owner/clients/:id`.
 */

import { FullBleed } from "@/components/app-shell/FullBleed";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  LayoutGrid,
  Plus,
  Search,
  Settings2,
  Users,
} from "lucide-react";
import { useDashboardView, type DashboardColumn } from "@/components/dashboard/useDashboardView";
import { DashboardColumnsPopover } from "@/components/dashboard/DashboardColumnsPopover";
import { DashboardFilterPopover } from "@/components/dashboard/DashboardFilterPopover";
import { DashboardSortPopover } from "@/components/dashboard/DashboardSortPopover";
import { StatusBadge } from "@/components/dashboard";
import { useClients } from "@/hooks/data";
import { CreateClientDialog } from "./CreateClientDialog";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type AccountStatus = "active" | "trial" | "paused" | "churned" | "onboarding";
type ClientList = "all" | AccountStatus;
type SortField = "name" | "plan" | "videos" | "status" | "startDate";

const STATUS_MAP: Record<
  AccountStatus,
  { variant: "approved" | "pending" | "posted" | "draft"; label: string }
> = {
  active: { variant: "approved", label: "Active" },
  trial: { variant: "pending", label: "Trial" },
  onboarding: { variant: "pending", label: "Onboarding" },
  paused: { variant: "posted", label: "Paused" },
  churned: { variant: "draft", label: "Churned" },
};

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "plan", label: "Plan" },
  { key: "videos", label: "Videos / mo" },
  { key: "status", label: "Status" },
  { key: "startDate", label: "Start date" },
];

const COLUMNS: DashboardColumn[] = [
  { key: "name", label: "Client", width: "220px", pinned: true },
  { key: "plan", label: "Plan", width: "180px" },
  { key: "videos", label: "Videos / mo", width: "110px" },
  {
    key: "status",
    label: "Status",
    width: "120px",
    filterable: true,
    filterOptions: ["active", "trial", "onboarding", "paused", "churned"],
  },
  { key: "startDate", label: "Start Date", width: "140px" },
  { key: "industry", label: "Industry", width: "160px" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatStartDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function readPlan(settings: unknown): string {
  if (settings && typeof settings === "object") {
    const s = settings as Record<string, unknown>;
    const v =
      (s.plan_type as string) || (s.solution_type as string) || (s.custom_solution_type as string);
    if (v)
      return String(v)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return "—";
}

/* ------------------------------------------------------------------ */
/* Reusable UI primitives                                              */
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

export function OwnerClientsPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  // Derive the client workspace path prefix based on the current role
  const rolePathMap: Record<string, string> = {
    owner: "/owner/clients/$clientSlug",
    manager: "/manager/clients/$clientSlug",
    senior_editor: "/senior-editor/clients/$clientSlug",
    content_creator: "/content-creator/clients/$clientSlug",
  };
  const clientWorkspaceBase = rolePathMap[role ?? "owner"] ?? "/owner/clients/$clientSlug";
  const { data: clients = [], isLoading } = useClients();

  const [activeList, setActiveList] = useState<ClientList>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const dashView = useDashboardView("clients", COLUMNS);
  const visibleSet = useMemo(
    () => new Set(dashView.visibleColumns.map((c) => c.key)),
    [dashView.visibleColumns],
  );
  const show = (key: string) => visibleSet.has(key);

  const lists = useMemo(() => {
    const counts: Record<ClientList, number> = {
      all: clients.length,
      active: 0,
      trial: 0,
      onboarding: 0,
      paused: 0,
      churned: 0,
    };
    for (const c of clients) {
      const s = c.account_status as AccountStatus;
      if (counts[s] !== undefined) counts[s] += 1;
    }
    return [
      { key: "all" as ClientList, label: "All Clients", count: counts.all },
      { key: "active" as ClientList, label: "Active", count: counts.active },
      { key: "onboarding" as ClientList, label: "Onboarding", count: counts.onboarding },
      { key: "trial" as ClientList, label: "Trial", count: counts.trial },
      { key: "paused" as ClientList, label: "Paused", count: counts.paused },
      { key: "churned" as ClientList, label: "Churned", count: counts.churned },
    ].filter((l) => l.key === "all" || l.count > 0);
  }, [clients]);

  const activeListData = lists.find((l) => l.key === activeList) ?? lists[0];
  const activeSortLabel = SORT_OPTIONS.find((s) => s.key === sortField)!.label;

  const filteredClients = useMemo(() => {
    let rows = clients;
    if (activeList !== "all") rows = rows.filter((c) => c.account_status === activeList);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (c.industry ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name);
        case "plan":
          return readPlan(a.settings).localeCompare(readPlan(b.settings));
        case "videos":
          return (b.videos_per_month ?? 0) - (a.videos_per_month ?? 0);
        case "status":
          return (a.account_status ?? "").localeCompare(b.account_status ?? "");
        case "startDate":
          return new Date(b.start_date ?? 0).getTime() - new Date(a.start_date ?? 0).getTime();
        default:
          return 0;
      }
    });
    return sorted;
  }, [clients, activeList, searchTerm, sortField, dashView.filters]);

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredClients.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(filteredClients.map((c) => c.id)));
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

        <div className="flex items-center gap-2">
          {(role === "owner" || role === "manager") && (
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:px-3.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Client</span>
            </button>
          )}
        </div>
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
            placeholder="Search clients…"
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
                    selectedRows.size === filteredClients.length && filteredClients.length > 0
                  }
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                />
              </th>
              <th className="w-[58px] border-b border-border px-2 py-2" />
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
                  colSpan={dashView.visibleColumns.length + 2}
                  className="px-4 py-12 text-center text-xs text-foreground-disabled"
                >
                  Loading clients…
                </td>
              </tr>
            )}
            {!isLoading && filteredClients.length === 0 && (
              <tr>
                <td
                  colSpan={dashView.visibleColumns.length + 2}
                  className="px-4 py-12 text-center text-xs text-foreground-disabled"
                >
                  No clients found.
                </td>
              </tr>
            )}
            {filteredClients.map((client) => {
              const isSelected = selectedRows.has(client.id);
              const status = (client.account_status as AccountStatus) ?? "active";
              const s = STATUS_MAP[status] ?? STATUS_MAP.active;
              return (
                <tr
                  key={client.id}
                  className={`cursor-pointer transition-colors hover:bg-surface-raised/50 ${isSelected ? "bg-surface-raised" : ""}`}
                  onClick={() =>
                    navigate({
                      to: clientWorkspaceBase,
                      params: { clientSlug: client.slug ?? client.id },
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
                      onChange={() => toggleRow(client.id)}
                      className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                    />
                  </td>
                  <td className="border-b border-border/50 px-2 py-2.5">
                    {client.logo_url ? (
                      <img
                        src={client.logo_url}
                        alt={client.name}
                        className="h-[27px] w-[27px] rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-[27px] w-[27px] items-center justify-center rounded bg-surface-muted text-[9px] font-bold text-foreground-subtle">
                        {getInitials(client.name)}
                      </div>
                    )}
                  </td>
                  {/* Name — always visible (pinned) */}
                  <td className="border-b border-border/50 px-3 py-2.5">
                    <div className="flex flex-col">
                      <span className="text-xs text-foreground">{client.name}</span>
                      {client.email && (
                        <span className="text-[10px] text-foreground-disabled">{client.email}</span>
                      )}
                    </div>
                  </td>
                  {show("plan") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground">{readPlan(client.settings)}</span>
                    </td>
                  )}
                  {show("videos") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground">
                        {client.videos_per_month ?? "—"}
                      </span>
                    </td>
                  )}
                  {show("status") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <StatusBadge variant={s.variant} label={s.label} />
                    </td>
                  )}
                  {show("startDate") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground">
                        {formatStartDate(client.start_date)}
                      </span>
                    </td>
                  )}
                  {show("industry") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground-muted">
                        {client.industry ?? "—"}
                      </span>
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
          Count: <span className="text-foreground-muted">{filteredClients.length}</span>
        </span>
        <button className="text-[11px] text-foreground-disabled transition-colors hover:text-foreground-muted">
          + Add calculation
        </button>
      </div>

      {/* ── Create Client Dialog ── */}
      <CreateClientDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </FullBleed>
  );
}
