/**
 * StudioClientsTable — Table landing view for the Content Studio.
 *
 * Matches the standard table design used across the platform (OwnerClientsPage,
 * LeadsPage): FullBleed wrapper, toolbar row with list selector + action button,
 * sort/filter bar, native `<table>` with checkboxes, and footer aggregation.
 */
import { useState, useMemo, type ReactNode } from "react";
import {
  useStudioOverview,
  TOTAL_FOUNDATION_FIELDS,
  type StudioClientRow,
} from "@/hooks/useStudioOverview";
import { StatusBadge } from "@/components/dashboard";
import { FullBleed } from "@/components/app-shell/FullBleed";
import {
  Search,
  ArrowUpDown,
  Filter,
  ChevronDown,
  LayoutGrid,
  Plus,
  Settings2,
} from "lucide-react";
import { useDashboardView, type DashboardColumn } from "@/components/dashboard/useDashboardView";
import { DashboardColumnsPopover } from "@/components/dashboard/DashboardColumnsPopover";
import { DashboardFilterPopover } from "@/components/dashboard/DashboardFilterPopover";
import { DashboardSortPopover } from "@/components/dashboard/DashboardSortPopover";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface StudioClientsTableProps {
  onSelectClient: (clientId: string) => void;
}

type AccountStatus = "active" | "trial" | "paused" | "churned" | "onboarding";
type StatusFilter = "all" | AccountStatus;
type SortField = "name" | "foundation" | "sessions" | "production" | "status";

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
  { key: "foundation", label: "Foundation" },
  { key: "sessions", label: "Sessions" },
  { key: "production", label: "Production" },
  { key: "status", label: "Status" },
];

const COLUMNS: DashboardColumn[] = [
  { key: "name", label: "Client", width: "220px", pinned: true },
  { key: "foundation", label: "Foundation", width: "170px" },
  { key: "sessions", label: "Sessions", width: "170px" },
  { key: "production", label: "Production", width: "140px" },
  {
    key: "status",
    label: "Status",
    width: "120px",
    filterable: true,
    filterOptions: ["active", "trial", "onboarding", "paused", "churned"],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Reusable UI primitives (same pattern as OwnerClientsPage)           */
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

function FoundationBar({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor:
              pct === 100
                ? "var(--color-emerald-500, #10b981)"
                : pct >= 50
                  ? "var(--color-amber-500, #f59e0b)"
                  : "var(--color-primary)",
          }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-foreground-muted">
        {filled}/{total}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function StudioClientsTable({ onSelectClient }: StudioClientsTableProps) {
  const { data: clients = [], isLoading } = useStudioOverview();

  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const dashView = useDashboardView("studio", COLUMNS);
  const visibleSet = useMemo(
    () => new Set(dashView.visibleColumns.map((c) => c.key)),
    [dashView.visibleColumns],
  );
  const show = (key: string) => visibleSet.has(key);

  // ── List counts ──────────────────────────────────────────────────
  const lists = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
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
      { key: "all" as StatusFilter, label: "All Clients", count: counts.all },
      { key: "active" as StatusFilter, label: "Active", count: counts.active },
      {
        key: "onboarding" as StatusFilter,
        label: "Onboarding",
        count: counts.onboarding,
      },
      { key: "trial" as StatusFilter, label: "Trial", count: counts.trial },
      { key: "paused" as StatusFilter, label: "Paused", count: counts.paused },
      { key: "churned" as StatusFilter, label: "Churned", count: counts.churned },
    ].filter((l) => l.key === "all" || l.count > 0);
  }, [clients]);

  const activeListData = lists.find((l) => l.key === activeFilter) ?? lists[0];
  const activeSortLabel = SORT_OPTIONS.find((s) => s.key === sortField)!.label;

  // ── Filtered + sorted rows ───────────────────────────────────────
  const filteredClients = useMemo(() => {
    let rows = clients;
    if (activeFilter !== "all") rows = rows.filter((c) => c.account_status === activeFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(
        (c) => c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name);
        case "foundation":
          return b.foundationPct - a.foundationPct;
        case "sessions":
          return b.cyclesCount - a.cyclesCount;
        case "production":
          return b.videosInProduction - a.videosInProduction;
        case "status":
          return (a.account_status ?? "").localeCompare(b.account_status ?? "");
        default:
          return 0;
      }
    });
    return sorted;
  }, [clients, activeFilter, searchTerm, sortField]);

  // ── Selection ────────────────────────────────────────────────────
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
                    active={list.key === activeFilter}
                    onClick={() => {
                      setActiveFilter(list.key);
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
            </button>
          </DashboardColumnsPopover>

          <DashboardFilterPopover
            columns={COLUMNS}
            filters={dashView.filters}
            onSetFilter={dashView.setFilter}
            onClearAll={dashView.clearFilters}
          >
            <button className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-surface-raised/50 hover:text-foreground-strong md:flex">
              <Filter className="h-3 w-3" />
              Filter
              {dashView.filterCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[9px] font-bold text-primary-foreground">
                  {dashView.filterCount}
                </span>
              )}
            </button>
          </DashboardFilterPopover>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:px-3.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Client</span>
          </button>
        </div>
      </div>

      {/* ── Sort & Search Bar ────────────────────────────── */}
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
              {COLUMNS.filter((c) => show(c.key)).map((col) => (
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
                  colSpan={COLUMNS.length + 2}
                  className="px-4 py-12 text-center text-xs text-foreground-disabled"
                >
                  Loading clients…
                </td>
              </tr>
            )}
            {!isLoading && filteredClients.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 2}
                  className="px-4 py-12 text-center text-xs text-foreground-disabled"
                >
                  {searchTerm ? "No clients match your search." : "No clients found."}
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
                  className={`cursor-pointer transition-colors hover:bg-surface-raised/50 ${
                    isSelected ? "bg-surface-raised" : ""
                  }`}
                  onClick={() => onSelectClient(client.id)}
                >
                  {/* Checkbox */}
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

                  {/* Avatar */}
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

                  {/* Client name — always visible (pinned) */}
                  {show("name") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground">{client.name}</span>
                        {client.industry && (
                          <span className="text-[10px] text-foreground-disabled">
                            {client.industry}
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Foundation */}
                  {show("foundation") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <FoundationBar
                        filled={client.foundationFilled}
                        total={client.foundationTotal}
                      />
                    </td>
                  )}

                  {/* Sessions */}
                  {show("sessions") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground">{client.cyclesCount}</span>
                      <span className="text-[10px] text-foreground-disabled">
                        {" "}
                        cycle{client.cyclesCount !== 1 ? "s" : ""} ·{" "}
                      </span>
                      <span className="text-xs text-foreground">{client.scriptsCount}</span>
                      <span className="text-[10px] text-foreground-disabled">
                        {" "}
                        script{client.scriptsCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                  )}

                  {/* Production */}
                  {show("production") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      {client.videosInProduction > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {client.videosInProduction} in production
                        </span>
                      ) : (
                        <span className="text-xs text-foreground-disabled">—</span>
                      )}
                    </td>
                  )}

                  {/* Status */}
                  {show("status") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <StatusBadge variant={s.variant} label={s.label} />
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
    </FullBleed>
  );
}
