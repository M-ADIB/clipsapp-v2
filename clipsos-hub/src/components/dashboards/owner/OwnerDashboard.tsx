/**
 * OwnerDashboard — Two-tab dashboard (Figma: "Owner Dashboard").
 *
 * Tabs injected into universal header via WorkspaceContext:
 *   1. Sales Overview (existing)
 *   2. Production Overview (new — from Figma "Owner Dashboard > Production Overview")
 *
 * Production Overview layout:
 *   ┌─ Production Velocity chart (732px) ─────┬─ 2×2 stat cards (176×175 each) ─┐
 *   │  Line/bar chart placeholder              │  Total Videos | Posted           │
 *   │                                          │  Up for Review | Active Clients  │
 *   ├─ "Your Attention" section ───────────────┴──────────────────────────────────┤
 *   │  5 × VideoReviewCard (thumbnail + title + status badge + date pill)         │
 *   └────────────────────────────────────────────────────────────────────────────────┘
 */
import { useState, useEffect, useMemo } from "react";
import { TabPanel } from "@/components/ui/tab-panel";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { AlertTriangle, DollarSign, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AgencyCommandTab } from "./AgencyCommandTab";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceHeader, getPersistedTab } from "@/contexts/WorkspaceContext";
import { useVideos, useClients, useActivityLog, useStripeCharges, useCrmDeals } from "@/hooks/data";
import { fmtAmount, safeParseDate } from "./finance/finance-helpers";
import {
  StatCard,
  SparklineBar,
  ProgressRow,
  NotificationRow,
  ActivityRow,
  FilterPills,
  DashboardPanel,
  StatusBadge,
} from "@/components/dashboard";

/* ------------------------------------------------------------------ */
/* Tab config                                                          */
/* ------------------------------------------------------------------ */

const DASHBOARD_TABS = ["Agency Command", "Sales Overview", "Production Overview"] as const;
type DashboardTab = (typeof DASHBOARD_TABS)[number];

/* ================================================================== */
/*  SALES OVERVIEW — now uses live data (see SalesOverviewTab)          */
/* ================================================================== */

/* ================================================================== */
/*  PRODUCTION OVERVIEW — now uses live data (see ProductionOverviewTab) */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

/** Mini stat card for Production Overview (176×175 from Figma) */
function MiniStatCard({
  label,
  value,
  valueColor,
  children,
}: {
  label: string;
  value: string;
  valueColor: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col justify-between rounded-lg p-3 md:p-[13px]"
      style={{ background: "var(--surface-card)", minHeight: 140 }}
    >
      <span className="text-xs font-medium tracking-[-0.01em] text-foreground-strong">{label}</span>
      <span
        className="font-display text-[28px] font-medium leading-none tracking-[-0.01em] md:text-[40px]"
        style={{ color: valueColor }}
      >
        {value}
      </span>
      <div className="mt-auto pt-2">{children}</div>
    </div>
  );
}

/** Time-range filter pills (Today / This Week / This Month) */
function TimeFilterPills({ active, onSelect }: { active: string; onSelect: (v: string) => void }) {
  const pills = ["Today", "This Week", "This Month"];
  return (
    <div className="flex items-center gap-[3px]">
      {pills.map((p) => {
        const isActive = p === active;
        return (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className="rounded-full px-1.5 py-1 text-[7px] font-medium tracking-[-0.01em]"
            style={{
              border: isActive ? "0.7px solid var(--primary)" : "0.7px solid var(--border-strong)",
              background: isActive ? "var(--primary)" : "transparent",
              color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
            }}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}

/** Video card for "Your Attention" section */
function VideoReviewCard({ title, status, date }: { title: string; status: string; date: string }) {
  return (
    <div
      className="flex items-center gap-0 overflow-hidden rounded-xl md:rounded-[20px]"
      style={{ background: "var(--surface-card)", minHeight: 100 }}
    >
      {/* Thumbnail placeholder */}
      <div
        className="hidden h-[80px] w-[80px] shrink-0 rounded-lg sm:block md:h-[103px] md:w-[103px] md:rounded-[11px]"
        style={{ background: "var(--surface-raised)", margin: 12 }}
      />

      {/* Content */}
      <div className="flex flex-col gap-1.5 py-3 pr-4 sm:gap-2 sm:py-4">
        <span className="font-display text-base font-medium leading-none tracking-[-0.01em] text-foreground-strong sm:text-lg md:text-[22px]">
          {title}
        </span>
        <StatusBadge variant="in_review" label={status} />
        <span
          className="inline-flex w-fit items-center rounded-[7px] px-2 py-[2.5px] text-[10px] text-foreground"
          style={{ border: "0.85px solid var(--border-strong)" }}
        >
          {date}
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TABS                                                               */
/* ================================================================== */

/** Sales Overview tab content — LIVE DATA */
function SalesOverviewTab() {
  const [filterActive, setFilterActive] = useState("failed");
  const { data: charges = [], isLoading: chargesLoading } = useStripeCharges();
  const { data: deals = [] } = useCrmDeals();
  const { data: activity = [] } = useActivityLog({ limit: 10 });

  /** Format AED — Stripe stores amounts in AED cents, so values passed here are already AED after /100 */
  const fmt = (n: number) => fmtAmount(n);

  // Finance stats from Stripe charges
  const financeStats = useMemo(() => {
    const successful = charges.filter((c: Record<string, unknown>) => c.status === "succeeded");
    const gross =
      successful.reduce(
        (sum: number, c: Record<string, unknown>) => sum + ((c.amount as number) ?? 0),
        0,
      ) / 100;
    const refunded =
      charges
        .filter((c: Record<string, unknown>) => c.refunded)
        .reduce(
          (sum: number, c: Record<string, unknown>) => sum + ((c.amount_refunded as number) ?? 0),
          0,
        ) / 100;
    const net = gross - refunded;
    const now = new Date();
    const thisMonth = successful.filter((c: Record<string, unknown>) => {
      const d = safeParseDate(c.stripe_created_at as string);
      if (!d) return false;
      return d.getUTCMonth() === now.getUTCMonth() && d.getUTCFullYear() === now.getUTCFullYear();
    });
    const mrr =
      thisMonth.reduce(
        (sum: number, c: Record<string, unknown>) => sum + ((c.amount as number) ?? 0),
        0,
      ) / 100;
    // Sparkline: last 8 months
    const spark: number[] = [];
    for (let i = 7; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const tot =
        successful
          .filter((c: Record<string, unknown>) => {
            const d = safeParseDate(c.stripe_created_at as string);
            if (!d) return false;
            return d.getUTCMonth() === m.getUTCMonth() && d.getUTCFullYear() === m.getUTCFullYear();
          })
          .reduce((s: number, c: Record<string, unknown>) => s + ((c.amount as number) ?? 0), 0) /
        100;
      spark.push(tot);
    }
    const maxS = Math.max(...spark, 1);
    return { gross, mrr, net, spark: spark.map((v) => (v / maxS) * 10) };
  }, [charges]);

  // Pipeline from CRM deals (no monetary value column — use deal count)
  const pipeline = useMemo(() => {
    const total = deals.length;
    const wonDeals = deals.filter((d) => d.stage === "closed_won" || d.stage === "won");
    const closedWon = wonDeals.length;
    const active = deals.filter((d) => d.stage !== "lost" && d.stage !== "closed_lost").length;
    const max = Math.max(total, 1);
    return {
      total,
      closedWon,
      active,
      cwPct: Math.round((closedWon / max) * 100),
      aPct: Math.round((active / max) * 100),
    };
  }, [deals]);

  // Failed payments in the current month
  const failedPayments = useMemo(
    () => {
      const now = new Date();
      return charges
        .filter((c: Record<string, unknown>) => {
          if (c.status !== "failed" && c.status !== "pending") return false;
          const d = safeParseDate(c.stripe_created_at as string);
          if (!d) return false;
          return d.getUTCMonth() === now.getUTCMonth() && d.getUTCFullYear() === now.getUTCFullYear();
        })
        .slice(0, 5)
        .map((c: Record<string, unknown>) => {
          const clientRaw = c.client;
          const clientObj = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
          const clientName = (clientObj as { name?: string })?.name;
          const ident = clientName ?? (c.customer_email as string) ?? (c.description as string) ?? "Unknown Customer";
          return {
            title: `${fmt(((c.amount as number) ?? 0) / 100)} • Payment ${c.status === "failed" ? "Failed" : "Pending"}`,
            description: `${ident} payment overdue`,
            actions: [
              { label: "Send reminder", color: "danger" as const },
              { label: "Draft message", color: "accent" as const },
            ],
          };
        });
    },
    [charges],
  );

  const totalOverdue = useMemo(
    () => {
      const now = new Date();
      return charges
        .filter((c: Record<string, unknown>) => {
          if (c.status !== "failed" && c.status !== "pending") return false;
          const d = safeParseDate(c.stripe_created_at as string);
          if (!d) return false;
          return d.getUTCMonth() === now.getUTCMonth() && d.getUTCFullYear() === now.getUTCFullYear();
        })
        .reduce((sum: number, c: Record<string, unknown>) => sum + ((c.amount as number) ?? 0), 0) /
      100;
    },
    [charges],
  );

  // Recent activity
  const recentItems = useMemo(
    () =>
      activity.slice(0, 5).map((a) => ({
        iconVariant: (a.action?.includes("payment") ? "success" : "accent") as "success" | "accent",
        title: (a.action ?? "Activity").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: a.entity_type ? `${a.entity_type}` : "System event",
        rightValue: "",
        rightSub: formatDistanceToNow(new Date(a.created_at), { addSuffix: true }),
      })),
    [activity],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_460px]">
        <div className="flex flex-col gap-5">
          <StatCard
            title="Gross Volume"
            value={chargesLoading ? "…" : fmt(financeStats.gross)}
            change=""
            changeColor="accent"
            updatedAt={chargesLoading ? "Loading…" : `${charges.length} charges`}
            onViewDetails={() => {}}
          >
            <SparklineBar data={financeStats.spark} color="accent" />
          </StatCard>
          <StatCard
            title="Net Volume"
            value={chargesLoading ? "…" : fmt(financeStats.net)}
            change=""
            changeColor="success"
            updatedAt="After refunds"
            onViewDetails={() => {}}
          >
            <SparklineBar data={financeStats.spark} color="success" />
          </StatCard>
        </div>
        <div className="flex flex-col gap-5">
          <StatCard
            title="Monthly Recurring"
            value={chargesLoading ? "…" : fmt(financeStats.mrr)}
            change=""
            changeColor="accent"
            updatedAt="This month"
            onViewDetails={() => {}}
          >
            <SparklineBar data={financeStats.spark} color="accent" />
          </StatCard>
          <div className="flex h-full flex-1 flex-col rounded-xl bg-surface-card p-4 pb-3">
            <h3 className="font-display text-sm font-medium tracking-tight text-foreground-strong">
              Sales Pipeline
            </h3>
            <p className="mt-3 font-display text-[30px] font-medium leading-none tracking-tight text-foreground-strong">
              {pipeline.total} deals
            </p>
            <div className="mt-4 flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground-strong">
                {pipeline.active} active
              </span>
              <span className="text-xs text-foreground-muted">Across all stages</span>
            </div>
            <div className="mt-auto flex flex-col gap-3 pt-6">
              <ProgressRow
                label="Closed-Won"
                value={`${pipeline.closedWon}`}
                percent={pipeline.cwPct}
              />
              <ProgressRow
                label="Active Deals"
                value={`${pipeline.active}`}
                percent={pipeline.aPct}
              />
            </div>
          </div>
        </div>
        <DashboardPanel
          title="Payment Status"
          dangerSummary={totalOverdue > 0 ? `Total Overdue: ${fmt(totalOverdue)}` : undefined}
          filters={
            <FilterPills
              pills={[
                { label: "Failed", value: "failed" },
                { label: "Successful", value: "success" },
                { label: "Disputed", value: "disputed" },
              ]}
              active={filterActive}
              onSelect={setFilterActive}
            />
          }
        >
          <div className="flex flex-col gap-6">
            {failedPayments.length === 0 ? (
              <p className="text-xs text-foreground-muted text-center py-4">
                No failed payments 🎉
              </p>
            ) : (
              failedPayments.map((notif, i) => (
                <NotificationRow
                  key={i}
                  icon={AlertTriangle}
                  iconVariant="danger"
                  title={notif.title}
                  description={notif.description}
                  actions={notif.actions}
                />
              ))
            )}
          </div>
        </DashboardPanel>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-medium tracking-tight text-foreground-strong">
          Recent Activity
        </h2>
        {recentItems.length === 0 ? (
          <p className="text-sm text-foreground-muted">No recent activity</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recentItems.map((a, i) => (
              <ActivityRow
                key={i}
                icon={a.iconVariant === "success" ? DollarSign : FileText}
                iconVariant={a.iconVariant}
                heading={a.title}
                subtext={a.description}
                amount={a.rightValue}
                timestamp={a.rightSub}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { ProductionOverviewTable } from "../shared/ProductionOverviewTable";

/** Production Overview tab content — LIVE DATA */
function ProductionOverviewTab() {
  return <ProductionOverviewTable />;
}

/* ================================================================== */
/*  Main Page Component                                                */
/* ================================================================== */

export function OwnerDashboard() {
  const auth = useAuth();
  const { headerConfig, setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  const _firstName =
    auth.profile?.full_name?.split(" ")[0] ?? auth.user?.email?.split("@")[0] ?? "there";

  // Register tabs in the universal header.
  // Restore the last visited tab from localStorage; default to "Agency Command".
  useEffect(() => {
    const persisted = getPersistedTab("/owner/dashboard") as DashboardTab | undefined;
    const initial: DashboardTab =
      persisted && DASHBOARD_TABS.includes(persisted as DashboardTab)
        ? (persisted as DashboardTab)
        : "Agency Command";
    setHeaderConfig({
      title: "Dashboard",
      tabs: DASHBOARD_TABS.map((t) => ({ key: t, label: t })),
      activeTab: initial,
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const activeTab = (headerConfig?.activeTab as DashboardTab) ?? "Agency Command";

  return (
    <FullBleed>
      <div className="px-3 py-5 md:px-5 md:py-6">
        <TabPanel active={activeTab === "Agency Command"}>
          <AgencyCommandTab />
        </TabPanel>
        <TabPanel active={activeTab === "Sales Overview"} lazy>
          <SalesOverviewTab />
        </TabPanel>
        <TabPanel active={activeTab === "Production Overview"} lazy>
          <ProductionOverviewTab />
        </TabPanel>
      </div>
    </FullBleed>
  );
}
