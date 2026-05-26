/**
 * DealsDashboard — Owner > Sales > Deals
 *
 * Full 3-row toolbar table page. Wired to useCrmDeals().
 */

import { FullBleed } from "@/components/app-shell/FullBleed";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useCrmDeals } from "@/hooks/data";
import { StatusBadge } from "@/components/dashboard";
import {
  ArrowUpDown,
  Briefcase,
  ChevronDown,
  Filter,
  LayoutGrid,
  Plus,
  Search,
  Settings2,
  User,
  X,
} from "lucide-react";
import { useDashboardView, type DashboardColumn } from "@/components/dashboard/useDashboardView";
import { DashboardColumnsPopover } from "@/components/dashboard/DashboardColumnsPopover";
import { DashboardFilterPopover } from "@/components/dashboard/DashboardFilterPopover";
import { DashboardSortPopover } from "@/components/dashboard/DashboardSortPopover";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type DealList = "all" | string;
type SortField = "name" | "value" | "stage" | "updated";

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: "name", label: "Deal name" },
  { key: "value", label: "Value" },
  { key: "stage", label: "Stage" },
  { key: "updated", label: "Last updated" },
];

const COLUMNS: DashboardColumn[] = [
  { key: "name", label: "Deal", width: "240px", pinned: true },
  { key: "contact", label: "Contact", width: "180px" },
  {
    key: "stage",
    label: "Stage",
    width: "140px",
    filterable: true,
    filterOptions: ["Closed/Paid", "No Stage", "Payment Pending", "Ghosted", "Pre-Booking Seat"],
  },
  { key: "value", label: "Value", width: "120px" },
  { key: "probability", label: "Probability", width: "100px" },
  { key: "updated", label: "Updated", width: "140px" },
];

const STAGE_BADGE: Record<string, "in_review" | "pending" | "approved" | "posted" | "draft"> = {
  "Closed/Paid": "approved",
  "No Stage": "draft",
  "Payment Pending": "pending",
  Ghosted: "in_review",
  "Pre-Booking Seat": "posted",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Dropdown({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full left-0 z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-surface-card py-1.5 shadow-lg">
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
      className={`flex w-full items-center justify-between gap-4 px-3 py-1.5 text-xs transition-colors hover:bg-surface-raised/50 ${active ? "text-primary" : "text-foreground-muted"}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function DealsDashboard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Deals", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const { data: deals = [], isLoading } = useCrmDeals();

  const [activeList, setActiveList] = useState<DealList>("all");
  const [sortField, setSortField] = useState<SortField>("updated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const dashView = useDashboardView("deals", COLUMNS);
  const visibleSet = useMemo(
    () => new Set(dashView.visibleColumns.map((c) => c.key)),
    [dashView.visibleColumns],
  );
  const show = (key: string) => visibleSet.has(key);

  const getPersonName = (deal: (typeof deals)[0]) => {
    const p = (deal as any).person;
    if (p) return p.full_name || p.email || "Unknown";
    return "—";
  };

  const lists = useMemo(() => {
    const stageCount = new Map<string, number>();
    for (const d of deals) {
      const stageText = d.stage ?? "No Stage";
      stageCount.set(stageText, (stageCount.get(stageText) ?? 0) + 1);
    }
    const stageEntries = Array.from(stageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ key: label, label, count }));
    return [{ key: "all", label: "All Deals", count: deals.length }, ...stageEntries];
  }, [deals]);

  const activeListData = lists.find((l) => l.key === activeList) ?? lists[0];

  const filteredDeals = useMemo(() => {
    let rows = deals;
    if (activeList !== "all") rows = rows.filter((d) => (d.stage ?? "No Stage") === activeList);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(
        (d) => d.name.toLowerCase().includes(q) || getPersonName(d).toLowerCase().includes(q),
      );
    }
    
    const stageFilters = dashView.filters.stage;
    if (stageFilters && stageFilters.length > 0) {
      rows = rows.filter((d) => stageFilters.includes(d.stage ?? "No Stage"));
    }

    return [...rows].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "value":
          comparison = (b.stage_order ?? 0) - (a.stage_order ?? 0);
          break;
        case "stage":
          comparison = (a.stage ?? "").localeCompare(b.stage ?? "");
          break;
        case "updated":
          comparison = new Date(a.updated_at ?? 0).getTime() - new Date(b.updated_at ?? 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [deals, activeList, searchTerm, sortField, sortDirection, dashView.filters]);

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedRows((prev) =>
      prev.size === filteredDeals.length ? new Set() : new Set(filteredDeals.map((d) => d.id)),
    );
  };

  return (
    <FullBleed>
      {/* ── Toolbar ── */}
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
                {lists.map((l) => (
                  <DropdownItem
                    key={l.key}
                    active={l.key === activeList}
                    onClick={() => {
                      setActiveList(l.key);
                      setShowListDropdown(false);
                    }}
                  >
                    <span>{l.label}</span>
                    <span className="text-foreground-disabled">{l.count}</span>
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
        <button className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:px-3.5">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Deal</span>
        </button>
      </div>

      {/* ── Sort / Filter ── */}
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
            placeholder="Search deals…"
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

      {/* ── Table ── */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="w-10 border-b border-border px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredDeals.length && filteredDeals.length > 0}
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
                  Loading deals…
                </td>
              </tr>
            )}
            {!isLoading && filteredDeals.length === 0 && (
              <tr>
                <td colSpan={dashView.visibleColumns.length + 1} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised">
                      <Briefcase className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <p className="text-sm text-foreground-muted">No deals found.</p>
                  </div>
                </td>
              </tr>
            )}
            {filteredDeals.map((deal) => {
              const isSelected = selectedRows.has(deal.id);
              const stageText = deal.stage ?? "No Stage";
              return (
                <tr
                  key={deal.id}
                  className={`cursor-pointer transition-colors hover:bg-surface-raised/50 ${isSelected ? "bg-surface-raised" : ""}`}
                >
                  <td
                    className="border-b border-border/50 px-3 py-2.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(deal.id)}
                      className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                    />
                  </td>
                  <td className="border-b border-border/50 px-3 py-2.5">
                    <span className="text-xs font-medium text-foreground">{deal.name}</span>
                  </td>
                  {show("contact") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised">
                          <User className="h-2.5 w-2.5 text-foreground-muted" />
                        </div>
                        <span className="text-xs text-foreground-muted">{getPersonName(deal)}</span>
                      </div>
                    </td>
                  )}
                  {show("stage") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <StatusBadge variant={STAGE_BADGE[stageText] ?? "draft"} label={stageText} />
                    </td>
                  )}
                  {show("value") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs font-semibold text-foreground">
                        {deal.plan ?? "—"}
                      </span>
                    </td>
                  )}
                  {show("probability") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground-muted">
                        {deal.total_videos ?? 0} videos
                      </span>
                    </td>
                  )}
                  {show("updated") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground-muted">
                        {formatDate(deal.updated_at)}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex h-[36px] items-center justify-between px-3 md:px-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-[11px] text-foreground-disabled">
          Count: <span className="text-foreground-muted">{filteredDeals.length}</span>
        </span>
        <button className="text-[11px] text-foreground-disabled transition-colors hover:text-foreground-muted">
          + Add calculation
        </button>
      </div>
    </FullBleed>
  );
}
