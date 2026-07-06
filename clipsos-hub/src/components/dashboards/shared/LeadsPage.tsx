/**
 * LeadsPage — CRM leads table with status tracking, source filtering,
 * and closer assignment. Shared across Owner and Manager.
 */
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import {
  Search,
  Plus,
  UserPlus,
  ChevronDown,
  Mail,
  Phone,
  Globe,
  MoreHorizontal,
  LayoutGrid,
  Settings2,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useLeads, useCreateLead, useUpdateLead } from "@/hooks/use-leads";
import { useDashboardView, type DashboardColumn } from "@/components/dashboard/useDashboardView";
import { DashboardColumnsPopover } from "@/components/dashboard/DashboardColumnsPopover";
import { DashboardFilterPopover } from "@/components/dashboard/DashboardFilterPopover";
import { DashboardSortPopover } from "@/components/dashboard/DashboardSortPopover";
import { StatusBadge } from "@/components/dashboard";

// ── Status config ──────────────────────────────────────────────────────────
const LEAD_STATUSES = [
  { value: "new", label: "New", color: "#3B82F6" },
  { value: "contacted", label: "Contacted", color: "#F59E0B" },
  { value: "qualified", label: "Qualified", color: "#10B981" },
  { value: "unqualified", label: "Unqualified", color: "#6B7280" },
  { value: "lost", label: "Lost", color: "#EF4444" },
] as const;

type StatusFilter = "all" | (typeof LEAD_STATUSES)[number]["value"];

const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "country", label: "Country" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created" },
];

const COLUMNS: DashboardColumn[] = [
  { key: "name", label: "Name", width: "200px", pinned: true },
  { key: "email", label: "Email", width: "220px" },
  { key: "company", label: "Company", width: "160px" },
  { key: "country", label: "Country", width: "145px" },
  {
    key: "status",
    label: "Status",
    width: "120px",
    filterable: true,
    filterOptions: ["new", "contacted", "qualified", "unqualified", "lost"],
  },
  { key: "created_at", label: "Created", width: "140px" },
];

/* ------------------------------------------------------------------ */
/* Reusable UI primitives (same as CRM/Clients)                        */
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

export function LeadsPage({ embedded }: { embedded?: boolean } = {}) {
  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  
  const [activeList, setActiveList] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const dashView = useDashboardView("leads", COLUMNS);
  const visibleSet = useMemo(
    () => new Set(dashView.visibleColumns.map((c) => c.key)),
    [dashView.visibleColumns],
  );
  const show = (key: string) => visibleSet.has(key);

  useEffect(() => {
    if (embedded) return;
    setHeaderConfig({ title: "Leads", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, embedded]);

  const lists = useMemo(() => {
    const counts: Record<string, number> = {
      all: leads.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      unqualified: 0,
      lost: 0,
    };
    for (const l of leads) {
      const s = l.status;
      if (counts[s] !== undefined) counts[s] += 1;
    }
    return [
      { key: "all", label: "All Leads", count: counts.all },
      { key: "new", label: "New", count: counts.new },
      { key: "contacted", label: "Contacted", count: counts.contacted },
      { key: "qualified", label: "Qualified", count: counts.qualified },
      { key: "unqualified", label: "Unqualified", count: counts.unqualified },
      { key: "lost", label: "Lost", count: counts.lost },
    ];
  }, [leads]);

  const activeListData = lists.find((l) => l.key === activeList) ?? lists[0];

  const filtered = useMemo(() => {
    let out = leads;
    if (activeList !== "all") {
      out = out.filter((l) => l.status === activeList);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (l) =>
          `${l.first_name ?? ""} ${l.last_name ?? ""}`.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.business_type?.toLowerCase().includes(q),
      );
    }

    const statusFilters = dashView.filters.status;
    if (statusFilters && statusFilters.length > 0) {
      out = out.filter((l) => statusFilters.includes(l.status));
    }

    const sorted = [...out].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          const nameA = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
          const nameB = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();
          comparison = nameA.localeCompare(nameB);
          break;
        case "email":
          comparison = (a.email ?? "").localeCompare(b.email ?? "");
          break;
        case "company":
          comparison = (a.business_type ?? "").localeCompare(b.business_type ?? "");
          break;
        case "country":
          comparison = (a.country ?? "").localeCompare(b.country ?? "");
          break;
        case "status":
          comparison = (a.status ?? "").localeCompare(b.status ?? "");
          break;
        case "created_at":
          comparison = new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [leads, activeList, search, sortField, sortDirection, dashView.filters]);

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedRows((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((l) => l.id)),
    );
  };

  const Wrapper = embedded ? "div" : FullBleed;

  return (
    <Wrapper>
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
          {/* Action button if needed */}
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
            setSortField(key);
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
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

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              <th className="w-10 border-b border-border px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filtered.length && filtered.length > 0}
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
              <th className="w-10 border-b border-border px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={COLUMNS.length + 2} className="px-4 py-3">
                    <div className="h-5 animate-pulse rounded bg-foreground/[0.06]" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-4 py-16 text-center">
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                    <UserPlus className="h-6 w-6 text-foreground-disabled" />
                    <p className="text-sm font-medium text-foreground">No leads found</p>
                    <p className="text-xs text-foreground-muted">
                      {search
                        ? "Try adjusting your search or filters."
                        : "Leads will appear here once added."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const isSelected = selectedRows.has(lead.id);
                const statusObj = LEAD_STATUSES.find((s) => s.value === lead.status);
                return (
                  <tr
                    key={lead.id}
                    className={cn(
                      "border-b transition-colors hover:bg-foreground/[0.02] cursor-pointer",
                      isSelected ? "bg-surface-raised" : ""
                    )}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(lead.id)}
                        className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                      />
                    </td>
                    {/* Name — pinned */}
                    <td className="px-3 py-2.5 font-medium text-foreground-strong">
                      {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    {show("email") && (
                      <td className="px-3 py-2.5 text-foreground-muted">{lead.email ?? "—"}</td>
                    )}
                    {show("company") && (
                      <td className="px-3 py-2.5 text-foreground-muted">
                        {lead.business_type ?? "—"}
                      </td>
                    )}
                    {show("country") && (
                      <td className="px-3 py-2.5">
                        <span className="text-foreground-muted capitalize">
                          {lead.country ?? "—"}
                        </span>
                      </td>
                    )}
                    {show("status") && (
                      <td className="px-3 py-2.5">
                        {statusObj && (
                          <StatusBadge variant={
                            statusObj.value === "qualified" ? "approved" :
                            statusObj.value === "lost" ? "draft" : "pending"
                          } label={statusObj.label} />
                        )}
                      </td>
                    )}
                    {show("created_at") && (
                      <td className="px-3 py-2.5 text-xs text-foreground-disabled">
                        {lead.created_at
                          ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })
                          : "—"}
                      </td>
                    )}
                    <td className="px-3 py-2.5 text-right">
                      <button className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-disabled transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: Aggregation ──────────────────────────── */}
      <div
        className="flex h-[36px] items-center justify-between px-3 md:px-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-[11px] text-foreground-disabled">
          Count: <span className="text-foreground-muted">{filtered.length}</span>
        </span>
        <button className="text-[11px] text-foreground-disabled transition-colors hover:text-foreground-muted">
          + Add calculation
        </button>
      </div>
    </Wrapper>
  );
}
