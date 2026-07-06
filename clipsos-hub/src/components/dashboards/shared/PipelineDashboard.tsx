/**
 * PipelineDashboard — Owner > Sales > Deals
 *
 * CRM deal pipeline with Kanban board and table toggle.
 * Uses denormalized `stage` text column (not FK-based `stage_id`).
 * Real stages: Closed/Paid, No Stage, Payment Pending, Ghosted, Pre-Booking Seat
 */

import { FullBleed } from "@/components/app-shell/FullBleed";
import { useMemo, useState, type ReactNode } from "react";
import { useCrmDeals } from "@/hooks/data";
import { StatusBadge } from "@/components/dashboard";
import { NewDealDialog } from "@/components/dashboards/owner/pipeline/NewDealDialog";
import { EditDealDialog } from "@/components/dashboards/owner/pipeline/EditDealDialog";
import {
  ArrowUpDown,
  ChevronDown,
  DollarSign,
  Filter,
  GripVertical,
  LayoutGrid,
  List,
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
import { formatDate } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type ViewMode = "kanban" | "table";
type SortField = "name" | "plan" | "stage" | "updatedAt";

interface DealCard {
  id: string;
  name: string;
  plan: string;
  stage: string;
  personName: string;
  updatedAt: string;
  totalVideos: number;
  region: string;
  notes?: string;
}

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: "name", label: "Deal name" },
  { key: "plan", label: "Plan" },
  { key: "stage", label: "Stage" },
  { key: "updatedAt", label: "Last updated" },
];

/** Real stage values from the database with their visual mappings */
const STAGE_CONFIG: {
  label: string;
  color: string;
  variant: "approved" | "pending" | "posted" | "in_review" | "draft";
}[] = [
  { label: "Pre-Booking Seat", color: "hsl(210 80% 60%)", variant: "posted" },
  { label: "Payment Pending", color: "hsl(45 90% 50%)", variant: "pending" },
  { label: "Closed/Paid", color: "hsl(140 60% 45%)", variant: "approved" },
  { label: "Ghosted", color: "hsl(0 70% 55%)", variant: "in_review" },
  { label: "No Stage", color: "hsl(220 10% 50%)", variant: "draft" },
];

const COLUMNS: DashboardColumn[] = [
  { key: "name", label: "Deal", width: "240px", pinned: true },
  { key: "contact", label: "Contact", width: "180px" },
  {
    key: "stage",
    label: "Stage",
    width: "140px",
    filterable: true,
    filterOptions: ["Pre-Booking Seat", "Payment Pending", "Closed/Paid", "Ghosted", "No Stage"],
  },
  { key: "plan", label: "Plan", width: "120px" },
  { key: "totalVideos", label: "Videos", width: "100px" },
  { key: "updatedAt", label: "Updated", width: "140px" },
];

function getStageVariant(stage: string): "approved" | "pending" | "posted" | "in_review" | "draft" {
  return STAGE_CONFIG.find((s) => s.label === stage)?.variant ?? "draft";
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
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
        className={`absolute top-full z-50 mt-1 min-w-[180px] rounded-lg border border-[var(--border)] bg-surface-card py-1.5 shadow-2xl ${
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

/* ------------------------------------------------------------------ */
/* Kanban Card                                                         */
/* ------------------------------------------------------------------ */

function KanbanCard({ deal }: { deal: DealCard }) {
  return (
    <div className="cursor-pointer rounded-lg border border-[var(--border)] bg-surface-card p-3 transition-all hover:border-primary/30 hover:shadow-sm group">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-medium text-foreground line-clamp-2">{deal.name}</h4>
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-foreground-disabled opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised">
          <User className="h-2.5 w-2.5 text-foreground-muted" />
        </div>
        <span className="text-[10px] text-foreground-muted truncate">{deal.personName}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{deal.plan || "—"}</span>
        <span className="text-[10px] text-foreground-disabled">{formatDate(deal.updatedAt)}</span>
      </div>
      {deal.totalVideos > 0 && (
        <div className="mt-1.5">
          <span className="text-[10px] text-foreground-disabled">{deal.totalVideos} videos</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export function PipelineDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [newDealStage, setNewDealStage] = useState<string | undefined>();
  const [editingDeal, setEditingDeal] = useState<DealCard | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const { data: rawDeals = [], isLoading: dealsLoading } = useCrmDeals();

  const dashView = useDashboardView("pipeline", COLUMNS);
  const visibleSet = useMemo(
    () => new Set(dashView.visibleColumns.map((c) => c.key)),
    [dashView.visibleColumns],
  );
  const show = (key: string) => visibleSet.has(key);

  /* -- Build deal cards from denormalized data -- */
  const deals: DealCard[] = useMemo(() => {
    return rawDeals.map((d) => {
      const personObj = d.person as { full_name?: string; email?: string } | null;
      return {
        id: d.id,
        name: d.name,
        plan: d.plan ?? "—",
        stage: (d.stage as string) ?? "No Stage",
        personName: personObj?.full_name ?? personObj?.email ?? "—",
        updatedAt: d.updated_at ?? d.created_at ?? "",
        totalVideos: Number(d.total_videos ?? 0),
        region: d.region ?? "—",
        notes: d.notes ?? "",
      };
    });
  }, [rawDeals]);

  /* -- Filter & Sort deals -- */
  const filteredDeals = useMemo(() => {
    let rows = deals;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(
        (d) => d.name.toLowerCase().includes(q) || d.personName.toLowerCase().includes(q),
      );
    }

    const stageFilters = dashView.filters.stage;
    if (stageFilters && stageFilters.length > 0) {
      rows = rows.filter((d) => stageFilters.includes(d.stage));
    }

    return [...rows].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "plan":
          comparison = a.plan.localeCompare(b.plan);
          break;
        case "stage":
          comparison = a.stage.localeCompare(b.stage);
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [deals, searchTerm, sortField, sortDirection, dashView.filters]);

  /* -- Group deals by real stage for Kanban -- */
  const stages = useMemo(() => {
    return STAGE_CONFIG.map((stg) => {
      const stageDeals = filteredDeals.filter((d) => d.stage === stg.label);
      return {
        label: stg.label,
        color: stg.color,
        deals: stageDeals,
        count: stageDeals.length,
      };
    });
  }, [filteredDeals]);

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
      prev.size === filteredDeals.length ? new Set() : new Set(filteredDeals.map((d) => d.id)),
    );
  };

  return (
    <FullBleed>
      {/* ── Toolbar Row ──────────────────────────────────── */}
      <div
        className="flex h-auto min-h-[44px] flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-5 md:py-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-md bg-surface-raised p-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-surface-card text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              Board
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-surface-card text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <List className="h-3 w-3" />
              List
            </button>
          </div>

          <div className="h-4 w-px" style={{ background: "var(--border)" }} />

          <span className="text-xs text-foreground-muted">
            {filteredDeals.length} {filteredDeals.length === 1 ? "deal" : "deals"}
          </span>

          {viewMode === "table" && (
            <>
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
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewDealStage(undefined);
              setShowNewDeal(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:px-3.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Deal</span>
          </button>
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
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search deals…"
              className="h-6 w-48 rounded bg-surface-raised px-2 text-[11px] text-foreground placeholder:text-foreground-disabled focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-foreground-disabled hover:text-foreground-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex h-6 w-6 items-center justify-center rounded text-foreground-disabled transition-colors hover:bg-surface-raised/50 hover:text-foreground-muted"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Content Area ────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {dealsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : viewMode === "kanban" ? (
          /* ── KANBAN VIEW ── */
          <div className="flex gap-4 p-4 md:p-5 overflow-x-auto min-h-[calc(100vh-220px)]">
            {stages.map((stg) => (
              <div key={stg.label} className="flex w-[280px] shrink-0 flex-col gap-3">
                {/* Stage Header */}
                <div className="flex items-center justify-between rounded-lg bg-surface-card px-3 py-2 border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: stg.color }} />
                    <span className="text-xs font-medium text-foreground">{stg.label}</span>
                    <span className="rounded-full bg-surface-raised px-1.5 py-0.5 text-[10px] text-foreground-muted">
                      {stg.count}
                    </span>
                  </div>
                </div>

                {/* Stage Cards */}
                <div className="flex flex-col gap-2">
                  {stg.deals.map((deal) => (
                    <div key={deal.id} onClick={() => setEditingDeal(deal)}>
                      <KanbanCard deal={deal} />
                    </div>
                  ))}
                  {stg.deals.length === 0 && (
                    <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center">
                      <p className="text-[10px] text-foreground-disabled">No deals</p>
                    </div>
                  )}
                </div>

                {/* Add deal to stage */}
                <button
                  onClick={() => {
                    setNewDealStage(stg.label);
                    setShowNewDeal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] text-foreground-disabled transition-colors hover:bg-surface-card hover:text-foreground-muted"
                >
                  <Plus className="h-3 w-3" />
                  Add deal
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* ── TABLE VIEW ── */
          <div className="flex-1 overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="w-10 border-b border-border px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.size === filteredDeals.length && filteredDeals.length > 0
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
                {filteredDeals.length === 0 && (
                  <tr>
                    <td
                      colSpan={dashView.visibleColumns.length + 1}
                      className="px-4 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised">
                          <DollarSign className="h-5 w-5 text-foreground-muted" />
                        </div>
                        <p className="text-sm text-foreground-muted">
                          No deals in the pipeline yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredDeals.map((deal) => {
                  const isSelected = selectedRows.has(deal.id);
                  return (
                    <tr
                      key={deal.id}
                      className={`cursor-pointer transition-colors hover:bg-surface-raised/50 ${isSelected ? "bg-surface-raised" : ""}`}
                      onClick={() => setEditingDeal(deal)}
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
                      {/* Name — always visible (pinned) */}
                      <td className="border-b border-border/50 px-3 py-2.5">
                        <span className="text-xs font-medium text-foreground">{deal.name}</span>
                      </td>
                      {show("contact") && (
                        <td className="border-b border-border/50 px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised">
                              <User className="h-2.5 w-2.5 text-foreground-muted" />
                            </div>
                            <span className="text-xs text-foreground-muted">{deal.personName}</span>
                          </div>
                        </td>
                      )}
                      {show("stage") && (
                        <td className="border-b border-border/50 px-3 py-2.5">
                          <StatusBadge variant={getStageVariant(deal.stage)} label={deal.stage} />
                        </td>
                      )}
                      {show("plan") && (
                        <td className="border-b border-border/50 px-3 py-2.5">
                          <span className="text-xs text-foreground">{deal.plan}</span>
                        </td>
                      )}
                      {show("totalVideos") && (
                        <td className="border-b border-border/50 px-3 py-2.5">
                          <span className="text-xs text-foreground-muted">
                            {deal.totalVideos || "—"}
                          </span>
                        </td>
                      )}
                      {show("updatedAt") && (
                        <td className="border-b border-border/50 px-3 py-2.5">
                          <span className="text-xs text-foreground-muted">
                            {formatDate(deal.updatedAt)}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      {viewMode === "table" ? (
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
      ) : (
        <div
          className="flex h-[36px] items-center justify-between px-3 md:px-5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span className="text-[11px] text-foreground-disabled">{filteredDeals.length} deals</span>
        </div>
      )}

      {/* ── Dialogs ── */}
      <NewDealDialog open={showNewDeal} onOpenChange={setShowNewDeal} defaultStage={newDealStage} />
      <EditDealDialog
        open={!!editingDeal}
        onOpenChange={(v) => !v && setEditingDeal(null)}
        deal={editingDeal}
      />
    </FullBleed>
  );
}
