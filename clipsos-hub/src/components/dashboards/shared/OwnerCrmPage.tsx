/**
 * OwnerCrmPage — Attio-inspired CRM for ClipsOS.
 *
 * Wired to live Supabase data via useCrmPeoplePaginated.
 * Features: search, source filter, sort, pagination, row click → detail.
 */

import { FullBleed } from "@/components/app-shell/FullBleed";
import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useCrmPeoplePaginated } from "@/hooks/data";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/dashboard";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Grid3X3,
  Import,
  LayoutGrid,
  Plus,
  Search,
  Settings2,
  Upload,
  X,
} from "lucide-react";
import { useDashboardView, type DashboardColumn } from "@/components/dashboard/useDashboardView";
import { DashboardColumnsPopover } from "@/components/dashboard/DashboardColumnsPopover";
import { DashboardFilterPopover } from "@/components/dashboard/DashboardFilterPopover";
import { DashboardSortPopover } from "@/components/dashboard/DashboardSortPopover";
import { formatDate } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Types & Constants                                                   */
/* ------------------------------------------------------------------ */

type SortField = "last_interaction" | "name" | "company" | "source";

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: "last_interaction", label: "Last interaction" },
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "source", label: "Source" },
];

const SOURCE_OPTIONS = ["All", "Attio", "Career Form", "Intake Form", "Client", "Partnership"];

const STATUS_MAP: Record<
  string,
  { variant: "approved" | "pending" | "posted" | "in_review" | "draft"; label: string }
> = {
  Attio: { variant: "posted", label: "Attio" },
  "Career Form": { variant: "in_review", label: "Career" },
  "Intake Form": { variant: "pending", label: "Intake" },
  Client: { variant: "approved", label: "Client" },
  Partnership: { variant: "draft", label: "Partner" },
};

const COLUMNS: DashboardColumn[] = [
  { key: "name", label: "Person", width: "240px", pinned: true },
  { key: "company", label: "Company", width: "160px" },
  { key: "phone", label: "Phone", width: "140px" },
  {
    key: "source",
    label: "Source",
    width: "120px",
    filterable: true,
    filterOptions: ["Attio", "Career Form", "Intake Form", "Client", "Partnership"],
  },
  { key: "status", label: "Status", width: "100px" },
  { key: "created", label: "Created", width: "140px" },
];

const PAGE_SIZE = 50;

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export function OwnerCrmPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
    setHeaderConfig({ title: "CRM", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("last_interaction");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const dashView = useDashboardView("crm", COLUMNS);
  const visibleSet = useMemo(
    () => new Set(dashView.visibleColumns.map((c) => c.key)),
    [dashView.visibleColumns],
  );
  const show = (key: string) => visibleSet.has(key);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useCrmPeoplePaginated({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    source: sourceFilter || undefined,
  });

  const people = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.key === sortField)!.label;

  const toggleRow = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedRows((prev) =>
      prev.size === people.length ? new Set() : new Set(people.map((p) => p.id)),
    );
  }, [people]);

  const handleRowClick = useCallback(
    (slug: string) => {
      const basePath = role === "manager" ? "/manager" : "/owner";
      navigate({ to: `${basePath}/people/${slug}` as string });
    },
    [navigate, role],
  );

  return (
    <FullBleed className="crm-wrap">
      {/* ── Toolbar Row ──────────────────────────────────── */}
      <div
        className="flex h-auto min-h-[44px] flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-5 md:py-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {/* Left: Source filter + View settings */}
        <div className="flex items-center gap-2">
          {/* Source filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSourceDropdown(!showSourceDropdown)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.06]"
            >
              <LayoutGrid className="h-3 w-3 text-primary" />
              {sourceFilter || "All People"}
              <ChevronDown className="h-3 w-3 text-foreground-disabled" />
            </button>
            {showSourceDropdown && (
              <Dropdown onClose={() => setShowSourceDropdown(false)}>
                {SOURCE_OPTIONS.map((src) => (
                  <DropdownItem
                    key={src}
                    active={src === "All" ? !sourceFilter : sourceFilter === src}
                    onClick={() => {
                      setSourceFilter(src === "All" ? "" : src);
                      setPage(0);
                      setShowSourceDropdown(false);
                    }}
                  >
                    <span>{src}</span>
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>

          <div className="h-4 w-px" style={{ background: "var(--border)" }} />

          {/* Columns */}
          <DashboardColumnsPopover
            columns={COLUMNS}
            hidden={dashView.hidden}
            onToggle={dashView.toggleColumn}
            onShowAll={dashView.showAllColumns}
          >
            <button className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground md:flex">
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

        {/* Right: Import/Export + New Person */}
        <div className="flex items-center gap-2">
          {/* Import / Export */}
          <div className="relative">
            <button
              onClick={() => setShowImportMenu(!showImportMenu)}
              className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground md:flex"
            >
              Import / Export
              <ChevronDown className="h-3 w-3" />
            </button>
            {showImportMenu && (
              <Dropdown onClose={() => setShowImportMenu(false)} align="right">
                <DropdownItem onClick={() => setShowImportMenu(false)}>
                  <Upload className="h-3 w-3 text-foreground-disabled" />
                  <span>Import CSV</span>
                </DropdownItem>
                <DropdownItem onClick={() => setShowImportMenu(false)}>
                  <Download className="h-3 w-3 text-foreground-disabled" />
                  <span>Export CSV</span>
                </DropdownItem>
                <DropdownItem onClick={() => setShowImportMenu(false)}>
                  <Import className="h-3 w-3 text-foreground-disabled" />
                  <span>Sync contacts</span>
                </DropdownItem>
              </Dropdown>
            )}
          </div>

          {/* + New Person */}
          <button className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:px-3.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Person</span>
          </button>
        </div>
      </div>

      {/* ── Sort & Filter Bar ────────────────────────────── */}
      <div
        className="flex h-[38px] items-center gap-2 px-3 md:px-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {/* Sort pill */}
        <DashboardSortPopover
          options={SORT_OPTIONS}
          activeKey={sortField}
          direction={sortDirection}
          onSort={(key, dir) => {
            setSortField(key as SortField);
            setSortDirection(dir);
          }}
        >
          <button className="flex items-center gap-1.5 rounded-md bg-foreground/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground-muted transition-colors hover:bg-foreground/[0.1]">
            <ArrowUpDown className="h-3 w-3 text-foreground-disabled" />
            Sort
          </button>
        </DashboardSortPopover>

        {/* Filter button */}
        <DashboardFilterPopover
          columns={COLUMNS}
          filters={dashView.filters}
          onSetFilter={dashView.setFilter}
          onClearAll={dashView.clearFilters}
        >
          <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
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

        {/* Search */}
        {searchOpen && (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, company…"
              className="h-6 w-48 rounded bg-foreground/[0.06] px-2 text-[11px] text-foreground placeholder:text-foreground-disabled focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                }}
                className="text-foreground-disabled hover:text-foreground-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex h-6 w-6 items-center justify-center rounded text-foreground-disabled transition-colors hover:bg-foreground/[0.06] hover:text-foreground-muted"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          {/* Column headers */}
          <thead>
            <tr>
              {/* Checkbox */}
              <th className="w-10 border-b border-[var(--border)] px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.size === people.length && people.length > 0}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-[var(--border-strong)] bg-transparent checked:bg-primary"
                />
              </th>
              {COLUMNS.filter((col) => col.pinned || visibleSet.has(col.key)).map((col) => (
                <th
                  key={col.key}
                  className="border-b border-[var(--border)] px-3 py-2 text-left"
                  style={{ width: col.width, minWidth: col.width }}
                >
                  <span className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Aggregation footer row */}
          <thead>
            <tr className="bg-foreground/[0.015]">
              <td className="border-b border-[var(--border)] px-3 py-1.5" />
              <td className="border-b border-[var(--border)] px-3 py-1.5">
                <span className="text-[10px] text-foreground-disabled">
                  {totalCount.toLocaleString()} count
                </span>
              </td>
              {COLUMNS.filter((c) => !c.pinned && visibleSet.has(c.key)).map((col) => (
                <td key={col.key} className="border-b border-[var(--border)] px-3 py-1.5">
                  <button className="text-[10px] text-foreground-disabled transition-colors hover:text-foreground-muted">
                    + Add calculation
                  </button>
                </td>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={dashView.visibleColumns.length + 1}
                  className="px-4 py-16 text-center text-xs text-foreground-disabled"
                >
                  Loading contacts…
                </td>
              </tr>
            )}
            {!isLoading && people.length === 0 && (
              <tr>
                <td colSpan={dashView.visibleColumns.length + 1} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised">
                      <Grid3X3 className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <p className="text-sm text-foreground-muted">No contacts found.</p>
                  </div>
                </td>
              </tr>
            )}
            {people.map((person) => {
              const isSelected = selectedRows.has(person.id);
              const s = STATUS_MAP[person.source ?? ""] ?? {
                variant: "draft" as const,
                label: person.source ?? "—",
              };
              return (
                <tr
                  key={person.id}
                  onClick={() => handleRowClick(person.id)}
                  className={`h-[42px] cursor-pointer border-b border-[var(--border)] transition-colors ${
                    isSelected ? "bg-primary/[0.06]" : "hover:bg-foreground/[0.03]"
                  }`}
                >
                  <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(person.id)}
                      className="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-[var(--border-strong)] bg-transparent checked:bg-primary"
                    />
                  </td>
                  {/* Person — always visible (pinned) */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised text-[10px] font-bold text-foreground-muted">
                        {(person.full_name ?? "?")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">
                          {person.full_name || "—"}
                        </span>
                        <span className="text-[10px] text-foreground-disabled">
                          {person.email || "—"}
                        </span>
                      </div>
                    </div>
                  </td>
                  {show("company") && (
                    <td className="px-3 py-2">
                      <span className="text-xs text-foreground-muted">
                        {person.company_name || "—"}
                      </span>
                    </td>
                  )}
                  {show("phone") && (
                    <td className="px-3 py-2">
                      <span className="text-xs text-foreground-muted">{person.phone || "—"}</span>
                    </td>
                  )}
                  {show("source") && (
                    <td className="px-3 py-2">
                      <StatusBadge variant={s.variant} label={s.label} />
                    </td>
                  )}
                  {show("status") && (
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          person.active !== false
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {person.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                  )}
                  {show("created") && (
                    <td className="px-3 py-2">
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

      {/* ── Pagination Footer ────────────────────────────── */}
      <div
        className="flex h-[40px] items-center justify-between px-3 md:px-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-[11px] text-foreground-disabled">
          Page <span className="text-foreground-muted">{page + 1}</span> of{" "}
          <span className="text-foreground-muted">{totalPages || 1}</span>
          {" · "}
          <span className="text-foreground-muted">{totalCount.toLocaleString()}</span> total
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex h-7 w-7 items-center justify-center rounded text-foreground-muted transition-colors hover:bg-foreground/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex h-7 w-7 items-center justify-center rounded text-foreground-muted transition-colors hover:bg-foreground/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </FullBleed>
  );
}

/* ------------------------------------------------------------------ */
/* Shared sub-components                                               */
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
        className={`absolute top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-[var(--border)] bg-surface-card py-1 shadow-2xl ${
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
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground-muted hover:bg-foreground/[0.06] hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
