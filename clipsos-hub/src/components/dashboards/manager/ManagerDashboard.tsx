/**
 * ManagerDashboard — Production command centre for the Manager role.
 *
 * Layout (desktop):
 *   ┌─ 4 StatCards (full width) ──────────────────────────────────────┐
 *   ├─ Production Queue (2/3) ──────┬─ Team Workload + Activity (1/3)─┤
 *   │  Tab: Active | Review         │  Editor assignment list          │
 *   │  Sortable video table         │  Recent activity feed            │
 *   └───────────────────────────────┴─────────────────────────────────┘
 *
 * Mobile: single column stack, tables collapse to cards.
 * All data from live Supabase hooks. No static mock data.
 */

import { useEffect, useMemo, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Eye,
  Film,
  TrendingUp,
  Users,
  Video,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

import { useWorkspaceHeader, getPersistedTab } from "@/contexts/WorkspaceContext";
import { useVideos, useClients, useActivityLog, useTeam } from "@/hooks/data";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TabPanel } from "@/components/ui/tab-panel";
import { ProductionOverviewTable } from "../shared/ProductionOverviewTable";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type QueueTab = "active" | "review";

const DASHBOARD_TABS = ["Production Command", "Production Overview"] as const;
type DashboardTab = (typeof DASHBOARD_TABS)[number];

const STATUS_MAP: Record<
  string,
  { variant: "approved" | "pending" | "posted" | "in_review" | "draft"; label: string }
> = {
  scripting: { variant: "draft", label: "Scripting" },
  assigned: { variant: "draft", label: "Assigned" },
  in_progress: { variant: "pending", label: "In Progress" },
  editing: { variant: "pending", label: "Editing" },
  in_review: { variant: "in_review", label: "In Review" },
  changes_requested: { variant: "in_review", label: "Changes Requested" },
  approved: { variant: "approved", label: "Approved" },
  scheduled: { variant: "posted", label: "Scheduled" },
  posted: { variant: "posted", label: "Posted" },
  published: { variant: "approved", label: "Published" },
};

const ACTIVE_SLUGS = [
  "scripting",
  "assigned",
  "in_progress",
  "editing",
  "in_review",
  "changes_requested",
];
const REVIEW_SLUGS = ["in_review", "changes_requested"];
const DONE_SLUGS = ["approved", "posted", "published", "scheduled"];

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

/** Skeleton shimmer for loading states */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-raised ${className ?? ""}`} />;
}

/** Mobile video card — collapses table row into card */
function VideoCard({
  video,
  clientName,
  onClick,
}: {
  video: {
    id: string;
    video_title: string;
    status?: { slug: string; display_name: string } | null;
    updated_at: string;
  };
  clientName: string;
  onClick: () => void;
}) {
  const slug = video.status?.slug ?? "draft";
  const sm = STATUS_MAP[slug] ?? { variant: "draft" as const, label: slug };

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-card p-3 text-left transition-colors hover:bg-surface-raised/60 active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
        <Video className="h-4 w-4 text-foreground-muted" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium text-foreground">{video.video_title}</span>
        <span className="text-xs text-foreground-muted">{clientName}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusBadge variant={sm.variant} label={sm.label} />
        <span className="text-[10px] text-foreground-disabled">
          {formatDistanceToNow(new Date(video.updated_at), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
}

/** Tab pill button */
function TabPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
      style={{
        background: active ? "var(--primary)" : "var(--surface-raised)",
        color: active ? "var(--primary-foreground)" : "var(--foreground-muted)",
      }}
    >
      {label}
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold"
        style={{
          background: active
            ? "color-mix(in oklab, var(--primary-foreground) 20%, transparent)"
            : "var(--border)",
          color: active ? "var(--primary-foreground)" : "var(--foreground-muted)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function ManagerDashboard() {
  const navigate = useNavigate();
  const { headerConfig, setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [queueTab, setQueueTab] = useState<QueueTab>("active");

  /* ── Header ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const persisted = getPersistedTab("/manager/dashboard") as DashboardTab | undefined;
    const initial: DashboardTab =
      persisted && DASHBOARD_TABS.includes(persisted as DashboardTab)
        ? (persisted as DashboardTab)
        : "Production Command";
    setHeaderConfig({
      title: "Dashboard",
      tabs: DASHBOARD_TABS.map((t) => ({ key: t, label: t })),
      activeTab: initial,
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const activeTab = (headerConfig?.activeTab as DashboardTab) ?? "Production Command";

  /* ── Data ───────────────────────────────────────────────────────── */
  const { data: videos = [], isLoading: videosLoading } = useVideos();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: activity = [] } = useActivityLog();
  const { data: team = [] } = useTeam();

  /* ── Derived stats ──────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const activeClients = clients.filter((c) => c.account_status === "active").length;
    const inProduction = videos.filter((v) => ACTIVE_SLUGS.includes(v.status?.slug ?? "")).length;
    const pendingReview = videos.filter((v) => REVIEW_SLUGS.includes(v.status?.slug ?? "")).length;
    const completed = videos.filter((v) => DONE_SLUGS.includes(v.status?.slug ?? "")).length;
    return { activeClients, inProduction, pendingReview, completed };
  }, [videos, clients]);

  /* ── Filtered video lists ───────────────────────────────────────── */
  const activeVideos = useMemo(
    () =>
      videos
        .filter((v) => ACTIVE_SLUGS.includes(v.status?.slug ?? ""))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [videos],
  );

  const reviewVideos = useMemo(
    () =>
      videos
        .filter((v) => REVIEW_SLUGS.includes(v.status?.slug ?? ""))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [videos],
  );

  const queueVideos = queueTab === "review" ? reviewVideos : activeVideos;

  /* ── Client name/slug lookup ────────────────────────────────────── */
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, c.name);
    return map;
  }, [clients]);

  const clientSlugMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, c.slug ?? c.id);
    return map;
  }, [clients]);

  const isLoading = videosLoading || clientsLoading;

  /* ── Navigate to client workspace ───────────────────────────────── */
  const goToClient = (clientId: string) =>
    navigate({
      to: "/manager/clients/$clientSlug",
      params: { clientSlug: clientSlugMap.get(clientId) ?? clientId },
    });

  /* ================================================================ */
  /* Render                                                           */
  /* ================================================================ */
  return (
    <FullBleed>
      <div className="px-3 py-5 md:px-5 md:py-6">
        <TabPanel active={activeTab === "Production Command"}>
          <div className="flex w-full flex-col gap-6">
            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[90px] sm:h-[104px]" />
                ))
              ) : (
                <>
                  <StatCard title="Active Clients" value={stats.activeClients.toString()} />
                  <StatCard title="In Production" value={stats.inProduction.toString()} />
                  <StatCard title="Pending Review" value={stats.pendingReview.toString()} />
                  <StatCard title="Completed" value={stats.completed.toString()} />
                </>
              )}
            </div>

            {/* ── Main content: 2-column on desktop ──────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
              {/* LEFT — Production queue ──────────────────────────────────── */}
              <div className="flex flex-col gap-4 lg:col-span-2">
                {/* Queue header + tab switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2
                    className="text-base font-semibold text-foreground-strong sm:text-lg"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Production Queue
                  </h2>
                  <div className="flex items-center gap-2">
                    <TabPill
                      label="Active"
                      count={activeVideos.length}
                      active={queueTab === "active"}
                      onClick={() => setQueueTab("active")}
                    />
                    <TabPill
                      label="Review"
                      count={reviewVideos.length}
                      active={queueTab === "review"}
                      onClick={() => setQueueTab("review")}
                    />
                  </div>
                </div>

                {/* Loading */}
                {isLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : queueVideos.length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-card py-14">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised">
                      <CheckCircle2 className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <p className="mt-3 text-sm text-foreground-muted">
                      {queueTab === "review"
                        ? "No videos pending review"
                        : "No active production items"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mobile card list (hidden on lg+) */}
                    <div className="flex flex-col gap-3 lg:hidden">
                      {queueVideos.slice(0, 20).map((video) => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          clientName={clientMap.get(video.client_id) ?? "—"}
                          onClick={() => goToClient(video.client_id)}
                        />
                      ))}
                    </div>

                    {/* Desktop table (hidden on <lg) */}
                    <div className="hidden overflow-hidden rounded-xl border border-border bg-surface-card lg:block">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-4 py-2.5 text-left">
                              <span className="text-[11px] font-normal text-foreground-disabled">
                                Video
                              </span>
                            </th>
                            <th className="px-4 py-2.5 text-left">
                              <span className="text-[11px] font-normal text-foreground-disabled">
                                Client
                              </span>
                            </th>
                            <th className="px-4 py-2.5 text-left">
                              <span className="text-[11px] font-normal text-foreground-disabled">
                                Status
                              </span>
                            </th>
                            <th className="px-4 py-2.5 text-left">
                              <span className="text-[11px] font-normal text-foreground-disabled">
                                Updated
                              </span>
                            </th>
                            <th className="w-8 px-2 py-2.5" />
                          </tr>
                        </thead>
                        <tbody>
                          {queueVideos.slice(0, 20).map((video) => {
                            const slug = video.status?.slug ?? "draft";
                            const sm = STATUS_MAP[slug] ?? { variant: "draft" as const, label: slug };
                            return (
                              <tr
                                key={video.id}
                                className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-surface-raised/50"
                                onClick={() => goToClient(video.client_id)}
                              >
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
                                      <Video className="h-3.5 w-3.5 text-foreground-muted" />
                                    </div>
                                    <span className="max-w-[200px] truncate text-xs font-medium text-foreground">
                                      {video.video_title}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="text-xs text-foreground-muted">
                                    {clientMap.get(video.client_id) ?? "—"}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <StatusBadge variant={sm.variant} label={sm.label} />
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="text-[10px] text-foreground-disabled">
                                    {formatDistanceToNow(new Date(video.updated_at), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </td>
                                <td className="px-2 py-2.5">
                                  <ChevronRight className="h-3.5 w-3.5 text-foreground-disabled" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT — Team workload + activity ──────────────────────────── */}
              <div className="flex flex-col gap-4">
                {/* Team Workload ──────────────────────────────── */}
                <div className="rounded-xl border border-border bg-surface-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3
                      className="text-sm font-semibold text-foreground-strong"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Team Workload
                    </h3>
                    <Users className="h-4 w-4 text-foreground-muted" />
                  </div>

                  {team.length === 0 ? (
                    <p className="py-4 text-center text-xs text-foreground-muted">
                      No team members yet
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {team.slice(0, 6).map((member) => {
                        const assigned = videos.filter(
                          (v) =>
                            ACTIVE_SLUGS.includes(v.status?.slug ?? "") &&
                            /* rough proxy — replace with video_editors join when available */
                            v.created_by === member.id,
                        ).length;
                        const maxLoad = 10;
                        const pct = Math.min(Math.round((assigned / maxLoad) * 100), 100);
                        const barColor =
                          pct >= 80
                            ? "var(--status-danger)"
                            : pct >= 50
                              ? "var(--status-warning)"
                              : "var(--status-success)";

                        return (
                          <div key={member.id} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">
                                {member.full_name ?? member.email ?? "Unknown"}
                              </span>
                              <span className="text-[10px] text-foreground-disabled">
                                {assigned} active
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: barColor }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Stats ────────────────────────────────── */}
                <div className="rounded-xl border border-border bg-surface-card p-4">
                  <h3
                    className="mb-3 text-sm font-semibold text-foreground-strong"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Quick Stats
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {[
                      {
                        icon: Film,
                        label: "Total Videos",
                        value: videos.length.toString(),
                      },
                      {
                        icon: Users,
                        label: "Active Clients",
                        value: stats.activeClients.toString(),
                      },
                      {
                        icon: TrendingUp,
                        label: "Completion Rate",
                        value:
                          videos.length > 0
                            ? `${Math.round((stats.completed / videos.length) * 100)}%`
                            : "—",
                      },
                      {
                        icon: Clock,
                        label: "Avg / Client",
                        value:
                          stats.activeClients > 0
                            ? (videos.length / stats.activeClients).toFixed(1)
                            : "—",
                      },
                    ].map(({ icon: Icon, label, value }, i, arr) => (
                      <div key={label}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-foreground-muted" />
                            <span className="text-xs text-foreground-muted">{label}</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground">{value}</span>
                        </div>
                        {i < arr.length - 1 && <div className="mt-2.5 h-px bg-border" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity ─────────────────────────────── */}
                <div className="rounded-xl border border-border bg-surface-card p-4">
                  <h3
                    className="mb-3 text-sm font-semibold text-foreground-strong"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Recent Activity
                  </h3>
                  {activity.length === 0 ? (
                    <p className="py-4 text-center text-xs text-foreground-muted">No recent activity</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {activity.slice(0, 8).map((item) => (
                        <div key={item.id} className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-raised">
                            <TrendingUp className="h-2.5 w-2.5 text-foreground-muted" />
                          </div>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <p className="text-xs leading-relaxed text-foreground">
                              <span className="font-medium">{item.action?.replace(/_/g, " ")}</span>
                              {item.entity_type && (
                                <span className="text-foreground-muted"> on {item.entity_type}</span>
                              )}
                            </p>
                            <span className="text-[10px] text-foreground-disabled">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Needs attention alert — only show if review queue is non-empty */}
                {reviewVideos.length > 0 && (
                  <button
                    onClick={() => setQueueTab("review")}
                    className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:opacity-90"
                    style={{
                      borderColor: "color-mix(in oklab, var(--status-danger) 40%, transparent)",
                      background: "color-mix(in oklab, var(--status-danger) 8%, var(--surface-card))",
                    }}
                  >
                    <AlertCircle
                      className="h-4 w-4 shrink-0"
                      style={{ color: "var(--status-danger)" }}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-foreground">
                        {reviewVideos.length} video{reviewVideos.length > 1 ? "s" : ""} need review
                      </span>
                      <span className="text-[10px] text-foreground-muted">Tap to see review queue</span>
                    </div>
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-foreground-muted" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel active={activeTab === "Production Overview"} lazy>
          <ProductionOverviewTable />
        </TabPanel>
      </div>
    </FullBleed>
  );
}

