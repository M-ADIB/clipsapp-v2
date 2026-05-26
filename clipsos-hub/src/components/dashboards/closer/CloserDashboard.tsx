/**
 * CloserDashboard — Sales closer's main dashboard.
 *
 * Live data from Supabase:
 *   - Leads (useLeads)
 *   - Deals (useCrmDeals)
 *   - Follow-ups (useFollowUps)
 *
 * Layout:
 *   ┌─ 4 × StatCards ────────────────────────────────────────────────┐
 *   │  Active Leads | Deals This Month | Conversion Rate | Due Today│
 *   ├─ Active Leads DataTable ────────────────────────────────────────┤
 *   │  Name, Email, Company, Source, Status, Created                  │
 *   ├─ Follow-up Queue ──────────────────────────────────────────────┤
 *   │  Time-sorted list of upcoming follow-ups (overdue highlighted)  │
 *   └─────────────────────────────────────────────────────────────────┘
 */
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  TrendingUp,
  Target,
  Clock,
  Plus,
  ArrowRight,
  Search,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import {
  formatDistanceToNow,
  isToday,
  isBefore,
  startOfDay,
  startOfMonth,
  isAfter,
} from "date-fns";

import { FullBleed } from "@/components/app-shell/FullBleed";

import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { StatCard, TaskCard } from "@/components/dashboard";
import { useLeads, useFollowUps, useCrmDeals, useCreateLead } from "@/hooks/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Status config                                                       */
/* ------------------------------------------------------------------ */

const LEAD_STATUSES = [
  { value: "new", label: "New", color: "#3B82F6" },
  { value: "contacted", label: "Contacted", color: "#F59E0B" },
  { value: "qualified", label: "Qualified", color: "#10B981" },
  { value: "unqualified", label: "Unqualified", color: "#6B7280" },
  { value: "lost", label: "Lost", color: "#EF4444" },
] as const;

type StatusFilter = "all" | (typeof LEAD_STATUSES)[number]["value"];

/* ------------------------------------------------------------------ */
/* Quick Add Lead Dialog                                               */
/* ------------------------------------------------------------------ */

function QuickAddLeadForm({ onClose }: { onClose: () => void }) {
  const createLead = useCreateLead();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    createLead.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim() || "",
        email: email.trim() || "",
        business_type: businessType.trim() || null,
        status: "new",
      },
      {
        onSuccess: () => {
          toast.success("Lead added successfully");
          onClose();
        },
        onError: () => {
          toast.error("Failed to add lead");
        },
      },
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface-card p-6 shadow-2xl">
        <h3 className="mb-4 text-sm font-semibold text-foreground-strong">Quick Add Lead</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              autoFocus
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name *"
              className="h-9 rounded-lg border bg-transparent px-3 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ borderColor: "var(--border)" }}
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="h-9 rounded-lg border bg-transparent px-3 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="h-9 rounded-lg border bg-transparent px-3 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary"
            style={{ borderColor: "var(--border)" }}
          />
          <input
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="Business / Company"
            className="h-9 rounded-lg border bg-transparent px-3 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary"
            style={{ borderColor: "var(--border)" }}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-foreground-muted transition-colors hover:bg-foreground/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!firstName.trim() || createLead.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {createLead.isPending ? "Adding…" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CloserDashboard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAddLead, setShowAddLead] = useState(false);

  // ── Real data hooks ──────────────────────────────────────────────
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: deals = [] } = useCrmDeals();
  const { data: followUps = [], isLoading: followUpsLoading } = useFollowUps();

  useEffect(() => {
    setHeaderConfig({ title: "Sales Dashboard" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  // ── Computed metrics ─────────────────────────────────────────────
  const activeLeads = useMemo(
    () => leads.filter((l) => l.status !== "lost" && l.status !== "unqualified"),
    [leads],
  );

  const dealsThisMonth = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    return deals.filter((d) => {
      const created = d.created_at ? new Date(d.created_at) : null;
      return created && isAfter(created, monthStart);
    });
  }, [deals]);

  const conversionRate = useMemo(() => {
    const won = deals.filter(
      (d) =>
        (d.stage as string)?.toLowerCase().includes("closed") ||
        (d.stage as string)?.toLowerCase().includes("paid"),
    );
    const total = deals.length;
    if (total === 0) return 0;
    return Math.round((won.length / total) * 100);
  }, [deals]);

  const todayFollowUps = useMemo(
    () =>
      followUps.filter((f) => {
        const due = f.due_at ? new Date(f.due_at) : null;
        return due && isToday(due);
      }),
    [followUps],
  );

  const overdueFollowUps = useMemo(
    () =>
      followUps.filter((f) => {
        const due = f.due_at ? new Date(f.due_at) : null;
        return due && isBefore(due, startOfDay(new Date())) && f.status !== "done";
      }),
    [followUps],
  );

  const pendingFollowUps = useMemo(
    () =>
      followUps
        .filter((f) => f.status !== "done")
        .sort((a, b) => {
          const aDate = a.due_at ? new Date(a.due_at).getTime() : Infinity;
          const bDate = b.due_at ? new Date(b.due_at).getTime() : Infinity;
          return aDate - bDate;
        })
        .slice(0, 8),
    [followUps],
  );

  // ── Filtered leads ──────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    let out = leads;
    if (statusFilter !== "all") {
      out = out.filter((l) => l.status === statusFilter);
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
    return out;
  }, [leads, statusFilter, search]);

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* ── Stat Cards ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Active Leads"
            value={String(activeLeads.length)}
            change={leads.length > 0 ? `${leads.length} total` : undefined}
            changeColor="accent"
          />
          <StatCard
            title="Deals This Month"
            value={String(dealsThisMonth.length)}
            change={deals.length > 0 ? `${deals.length} total` : undefined}
            changeColor="success"
          />
          <StatCard title="Conversion Rate" value={`${conversionRate}%`} percent={conversionRate} />
          <StatCard
            title="Follow-ups Due"
            value={String(todayFollowUps.length + overdueFollowUps.length)}
            change={overdueFollowUps.length > 0 ? `${overdueFollowUps.length} overdue` : undefined}
            changeColor={overdueFollowUps.length > 0 ? "danger" : "accent"}
          />
        </div>

        {/* ── Active Leads Table ────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddLead(true)}
                className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Lead
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-disabled" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads…"
                className="h-9 w-full rounded-lg border bg-transparent pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-surface-card-2 p-1">
              {[{ value: "all" as const, label: "All" }, ...LEAD_STATUSES].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                    statusFilter === s.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground-muted hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto rounded-lg border"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-surface-card-2" style={{ borderColor: "var(--border)" }}>
                  <th className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Company
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Source
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Created
                  </th>
                  <th className="w-10 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {leadsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-5 animate-pulse rounded bg-foreground/[0.06]" />
                      </td>
                    </tr>
                  ))
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                        <UserPlus className="h-6 w-6 text-foreground-disabled" />
                        <p className="text-sm font-medium text-foreground">No leads found</p>
                        <p className="text-xs text-foreground-muted">
                          {search
                            ? "Try adjusting your search."
                            : "Leads will appear here once added."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const status = LEAD_STATUSES.find((s) => s.value === lead.status);
                    return (
                      <tr
                        key={lead.id}
                        className="border-b transition-colors hover:bg-foreground/[0.02]"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised text-[10px] font-bold text-foreground-muted">
                              {`${lead.first_name?.[0] ?? ""}${lead.last_name?.[0] ?? ""}`.toUpperCase() ||
                                "?"}
                            </div>
                            <span className="text-xs font-medium text-foreground-strong">
                              {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground-muted">
                          {lead.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground-muted">
                          {lead.business_type ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-xs capitalize text-foreground-muted">
                          {lead.country ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {status && (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                              style={{
                                backgroundColor: `${status.color}18`,
                                color: status.color,
                              }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: status.color }}
                              />
                              {status.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground-disabled">
                          {lead.created_at
                            ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
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
        </div>

        {/* ── Follow-up Queue ───────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-medium text-foreground-strong">
              Follow-up Queue
            </h2>
            <span className="text-xs text-foreground-disabled">
              {followUps.filter((f) => f.status !== "done").length} pending
            </span>
          </div>

          {followUpsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-foreground/[0.04]" />
              ))}
            </div>
          ) : pendingFollowUps.length === 0 ? (
            <div
              className="rounded-lg border border-dashed p-8 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <Clock className="mx-auto h-6 w-6 text-foreground-disabled" />
              <p className="mt-2 text-sm text-foreground-muted">No follow-ups scheduled</p>
              <p className="text-xs text-foreground-disabled">
                Follow-ups will appear here once created from deals or leads.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingFollowUps.map((item) => {
                const personObj = item.person as { full_name?: string } | null;
                const dueDate = item.due_at ? new Date(item.due_at) : null;
                const isOverdue = dueDate && isBefore(dueDate, startOfDay(new Date()));
                const isDueToday = dueDate && isToday(dueDate);

                let badgeLabel = "Upcoming";
                let badgeColor: "danger" | "warning" | "accent" = "accent";
                if (isOverdue) {
                  badgeLabel = "Overdue";
                  badgeColor = "danger";
                } else if (isDueToday) {
                  badgeLabel = "Today";
                  badgeColor = "warning";
                }

                return (
                  <TaskCard
                    key={item.id}
                    title={personObj?.full_name ?? "Unknown contact"}
                    description={`${item.title ?? "Follow-up"} • ${
                      dueDate ? formatDistanceToNow(dueDate, { addSuffix: true }) : "No due date"
                    }${item.notes ? ` • ${item.notes}` : ""}`}
                    badgeLabel={badgeLabel}
                    badgeColor={badgeColor}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick Add Lead Overlay ────────────────────── */}
        {showAddLead && <QuickAddLeadForm onClose={() => setShowAddLead(false)} />}
      </div>
    </FullBleed>
  );
}
