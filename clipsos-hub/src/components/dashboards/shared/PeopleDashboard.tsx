/**
 * PeopleDashboard — Owner > Sales > People
 *
 * CRM contacts table with server-side pagination.
 * Schema: crm_people has full_name, email, phone, company_name, source, etc.
 */

import { FullBleed } from "@/components/app-shell/FullBleed";
import { useEffect, useMemo, useState, type ReactNode, useCallback } from "react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useCrmPeoplePaginated } from "@/hooks/data";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  Mail,
  Phone,
  Plus,
  Search,
  Settings2,
  Users,
  X,
} from "lucide-react";
import { useDashboardView, type DashboardColumn } from "@/components/dashboard/useDashboardView";
import { DashboardColumnsPopover } from "@/components/dashboard/DashboardColumnsPopover";
import { DashboardFilterPopover } from "@/components/dashboard/DashboardFilterPopover";
import { DashboardSortPopover } from "@/components/dashboard/DashboardSortPopover";
import { formatDate } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type SortField = "name" | "email" | "company" | "created";

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "created", label: "Created" },
];

const SOURCE_OPTIONS = ["All", "Attio", "Career Form", "Intake Form", "Client", "Partnership"];

const COLUMNS: DashboardColumn[] = [
  { key: "name", label: "Name", width: "220px", pinned: true },
  { key: "email", label: "Email", width: "220px" },
  { key: "phone", label: "Phone", width: "140px" },
  { key: "company", label: "Company", width: "160px" },
  {
    key: "source",
    label: "Source",
    width: "120px",
    filterable: true,
    filterOptions: ["attio", "career_form", "intake_form", "client", "partnership"],
  },
  { key: "created", label: "Added", width: "140px" },
];

const PAGE_SIZE = 50;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function sourceBadgeColor(source: string | null): string {
  switch (source?.toLowerCase()) {
    case "attio":
      return "bg-blue-500/15 text-blue-400";
    case "career_form":
      return "bg-purple-500/15 text-purple-400";
    case "intake_form":
      return "bg-emerald-500/15 text-emerald-400";
    case "client":
      return "bg-amber-500/15 text-amber-400";
    case "partnership":
      return "bg-pink-500/15 text-pink-400";
    default:
      return "bg-surface-raised text-foreground-muted";
  }
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

export function PeopleDashboard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const navigate = useNavigate();

  useEffect(() => {
    setHeaderConfig({ title: "People", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  // Pagination & filter state
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const dashView = useDashboardView("people", COLUMNS);
  const visibleSet = useMemo(
    () => new Set(dashView.visibleColumns.map((c) => c.key)),
    [dashView.visibleColumns],
  );
  const show = (key: string) => visibleSet.has(key);

  // Sync filter options back from dashView.filters to trigger query
  useEffect(() => {
    const activeSources = dashView.filters.source;
    if (activeSources && activeSources.length > 0) {
      setSourceFilter(activeSources[0]);
    } else {
      setSourceFilter("");
    }
  }, [dashView.filters.source]);

  // Debounce search to avoid hammering the API
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset to first page on search
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Reset page when source filter changes
  useEffect(() => {
    setPage(0);
  }, [sourceFilter]);

  const { data, isLoading } = useCrmPeoplePaginated({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    source: sourceFilter || undefined,
  });

  const people = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Client-side sort (within the page)
  const sorted = useMemo(() => {
    return [...people].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = (a.full_name ?? "").localeCompare(b.full_name ?? "");
          break;
        case "email":
          comparison = (a.email ?? "").localeCompare(b.email ?? "");
          break;
        case "company":
          comparison = (a.company_name ?? "").localeCompare(b.company_name ?? "");
          break;
        case "created":
          comparison =
            new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [people, sortField, sortDirection]);

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    setSelectedRows((prev) =>
      prev.size === sorted.length ? new Set() : new Set(sorted.map((p) => p.id)),
    );
  };

  const handleRowClick = (slug: string) => {
    // Detect current role prefix from URL
    const path = window.location.pathname;
    const rolePrefix = path.startsWith("/manager")
      ? "/manager"
      : path.startsWith("/closer")
        ? "/closer"
        : "/owner";
    navigate({ to: `${rolePrefix}/people/${slug}` as string });
  };

  const activeSourceLabel = sourceFilter
    ? SOURCE_OPTIONS.find((s) => s.toLowerCase() === sourceFilter.toLowerCase()) || sourceFilter
    : "All People";

  return (
    <FullBleed>
      {/* ── Toolbar ── */}
      <div
        className="flex h-auto min-h-[44px] flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-5 md:py-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          {/* Source filter */}
          <div className="relative">
            <button
              onClick={() => setShowSourceDropdown(!showSourceDropdown)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-foreground-strong transition-colors hover:bg-surface-raised/50"
            >
              <LayoutGrid className="h-3 w-3 text-primary" />
              {activeSourceLabel}
              <ChevronDown className="h-3 w-3 text-foreground-muted" />
            </button>
            {showSourceDropdown && (
              <Dropdown onClose={() => setShowSourceDropdown(false)}>
                {SOURCE_OPTIONS.map((s) => (
                  <DropdownItem
                    key={s}
                    active={
                      (s === "All" && !sourceFilter) ||
                      s.toLowerCase() === sourceFilter.toLowerCase()
                    }
                    onClick={() => {
                      const newFilter = s === "All" ? "" : s.toLowerCase();
                      setSourceFilter(newFilter);
                      // Update useDashboardView filters
                      dashView.setFilter("source", newFilter ? [newFilter] : []);
                      setShowSourceDropdown(false);
                    }}
                  >
                    <span>{s}</span>
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
          <span className="hidden sm:inline">Add Person</span>
        </button>
      </div>

      {/* ── Sort / Filter / Search ── */}
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
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search people…"
              className="h-6 w-48 rounded bg-surface-raised px-2 text-[11px] text-foreground placeholder:text-foreground-disabled focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                }}
                className="flex h-5 w-5 items-center justify-center rounded text-foreground-disabled hover:text-foreground-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => {
            setSearchOpen(!searchOpen);
            if (searchOpen) setSearchTerm("");
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-foreground-disabled transition-colors hover:bg-surface-raised/50 hover:text-foreground-muted"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr>
              <th className="w-10 border-b border-border px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sorted.length && sorted.length > 0}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                />
              </th>
              {COLUMNS.filter((col) => col.pinned || visibleSet.has(col.key)).map((col) => (
                <th
                  key={col.key}
                  className="border-b border-border px-3 py-2 text-left"
                  style={{ width: col.width }}
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
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && sorted.length === 0 && (
              <tr>
                <td colSpan={dashView.visibleColumns.length + 1} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised">
                      <Users className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <p className="text-sm text-foreground-muted">No contacts found.</p>
                  </div>
                </td>
              </tr>
            )}
            {sorted.map((person) => {
              const isSelected = selectedRows.has(person.id);
              return (
                <tr
                  key={person.id}
                  onClick={() => handleRowClick(person.id)}
                  className={`cursor-pointer transition-colors hover:bg-surface-raised/50 ${isSelected ? "bg-surface-raised" : ""}`}
                >
                  <td
                    className="border-b border-border/50 px-3 py-2.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(person.id)}
                      className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                    />
                  </td>
                  <td className="border-b border-border/50 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[9px] font-bold text-foreground-subtle">
                        {getInitials(person.full_name)}
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {person.full_name ?? "—"}
                      </span>
                    </div>
                  </td>
                  {show("email") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      {person.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-foreground-disabled" />
                          <span className="text-xs text-foreground-muted">{person.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-foreground-disabled">—</span>
                      )}
                    </td>
                  )}
                  {show("phone") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      {person.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-foreground-disabled" />
                          <span className="text-xs text-foreground-muted">{person.phone}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-foreground-disabled">—</span>
                      )}
                    </td>
                  )}
                  {show("company") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground-muted">
                        {person.company_name ?? "—"}
                      </span>
                    </td>
                  )}
                  {show("source") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${sourceBadgeColor(person.source)}`}
                      >
                        {person.source ?? "—"}
                      </span>
                    </td>
                  )}
                  {show("created") && (
                    <td className="border-b border-border/50 px-3 py-2.5">
                      <span className="text-xs text-foreground-muted">
                        {formatDate(person.created_at)}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer ── */}
      <div
        className="flex h-[42px] items-center justify-between px-3 md:px-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-[11px] text-foreground-disabled">
          Showing{" "}
          <span className="text-foreground-muted">
            {sorted.length > 0 ? page * PAGE_SIZE + 1 : 0}–
            {Math.min((page + 1) * PAGE_SIZE, totalCount)}
          </span>{" "}
          of <span className="text-foreground-muted">{totalCount.toLocaleString()}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[60px] text-center text-[11px] text-foreground-muted">
            {page + 1} / {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </FullBleed>
  );
}
