/**
 * AgencyCommandTab — Full agency command center dashboard.
 *
 * 6 priority-ranked sections:
 *  1. Pulse Bar — 4 hero KPIs
 *  2. Needs Your Attention — urgent action items
 *  3. Revenue Snapshot — MRR trend + pipeline
 *  4. Production Status — status distribution + velocity
 *  5. Team Pulse — workload cards
 *  6. Client Health — top clients by urgency
 */
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CreditCard,
  Eye,
  Phone,
  TrendingUp,
  Video,
  Loader2,
} from "lucide-react";

import { useCommandCenter } from "@/hooks/use-command-center";
import type {
  AttentionItem,
  StatusSegment,
  VelocityPoint,
} from "@/hooks/use-command-center";
import { RecentMessagesWidget } from "./RecentMessagesWidget";
import { fmtAmount } from "./finance/finance-helpers";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ── Recharts custom tooltip ─────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
  prefix,
  suffix,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 shadow-lg"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
      }}
    >
      <p className="text-[10px] font-medium text-foreground-muted">{label}</p>
      <p className="text-sm font-semibold text-foreground-strong">
        {prefix}
        {payload[0].value.toLocaleString()}
        {suffix}
      </p>
    </div>
  );
}

/* ================================================================== */
/*  § 1 — PULSE BAR (4 Hero KPIs)                                     */
/* ================================================================== */

function PulseCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
  onClick,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-tight text-foreground-muted">
          {label}
        </span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklab, ${color} 15%, transparent)` }}
        >
          <span style={{ color }}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      <p className="font-display text-[28px] font-semibold leading-none tracking-tight text-foreground-strong md:text-[32px]">
        {value}
      </p>
      {subtitle && <span className="text-[10px] text-foreground-disabled">{subtitle}</span>}
    </button>
  );
}

function PulseBar({
  mrr,
  activeClients,
  videosInProduction,
  pendingReview,
}: {
  mrr: number;
  activeClients: number;
  videosInProduction: number;
  pendingReview: number;
}) {
  const navigate = useNavigate();

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <PulseCard
        label="Monthly Revenue"
        value={fmtAmount(mrr)}
        icon={TrendingUp}
        color="var(--primary)"
        subtitle="This month's charges"
      />
      <PulseCard
        label="Active Clients"
        value={activeClients.toString()}
        icon={Briefcase}
        color="var(--status-success)"
        subtitle="Active workspaces"
        onClick={() => navigate({ to: "/owner/clients" })}
      />
      <PulseCard
        label="In Production"
        value={videosInProduction.toString()}
        icon={Video}
        color="rgb(59, 130, 246)"
        subtitle="Videos in pipeline"
        onClick={() => navigate({ to: "/owner/videos" })}
      />
      <PulseCard
        label="Pending Review"
        value={pendingReview.toString()}
        icon={Eye}
        color={pendingReview > 0 ? "var(--status-danger)" : "var(--status-success)"}
        subtitle={pendingReview > 0 ? "Needs your attention" : "All clear"}
        onClick={() => navigate({ to: "/owner/videos" })}
      />
    </section>
  );
}

/* ================================================================== */
/*  § 2 — NEEDS YOUR ATTENTION                                         */
/* ================================================================== */

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  critical: {
    bg: "color-mix(in oklab, var(--status-danger) 8%, transparent)",
    border: "color-mix(in oklab, var(--status-danger) 25%, transparent)",
    icon: "var(--status-danger)",
  },
  warning: {
    bg: "color-mix(in oklab, var(--status-warning) 8%, transparent)",
    border: "color-mix(in oklab, var(--status-warning) 25%, transparent)",
    icon: "var(--status-warning)",
  },
  info: {
    bg: "color-mix(in oklab, var(--primary) 8%, transparent)",
    border: "color-mix(in oklab, var(--primary) 25%, transparent)",
    icon: "var(--primary)",
  },
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  review: Eye,
  payment: CreditCard,
  followup: Phone,
};

function AttentionSection({ items }: { items: AttentionItem[] }) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section
        className="flex items-center gap-3 rounded-xl px-5 py-4"
        style={{
          background: "color-mix(in oklab, var(--status-success) 6%, transparent)",
          border: "1px solid color-mix(in oklab, var(--status-success) 20%, transparent)",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "color-mix(in oklab, var(--status-success) 15%, transparent)" }}
        >
          <span className="text-sm">✅</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground-strong">All clear</p>
          <p className="text-xs text-foreground-muted">
            Nothing urgent — your agency is running smoothly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-foreground-strong">
        <AlertTriangle className="h-4 w-4 text-[color:var(--status-danger)]" />
        Needs Your Attention
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
          style={{ background: "var(--status-danger)" }}
        >
          {items.reduce((s, i) => s + i.count, 0)}
        </span>
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const styles = SEVERITY_STYLES[item.severity];
          const Icon = TYPE_ICONS[item.type] || AlertTriangle;
          return (
            <button
              key={item.id}
              onClick={() => item.route && navigate({ to: item.route })}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.005]"
              style={{
                background: styles.bg,
                border: `1px solid ${styles.border}`,
              }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${styles.icon} 15%, transparent)` }}
              >
                <span style={{ color: styles.icon }}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground-strong">{item.title}</p>
                <p className="text-xs text-foreground-muted">{item.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-foreground-disabled" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  § 3 — REVENUE SNAPSHOT                                             */
/* ================================================================== */

function RevenueSnapshot({
  grossRevenue,
  netRevenue,
  sparkline,
  pipeline,
}: {
  grossRevenue: number;
  netRevenue: number;
  sparkline: number[];
  pipeline: { total: number; active: number; closedWon: number; winRate: number };
}) {
  const navigate = useNavigate();
  const maxVal = Math.max(...sparkline, 1);

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {/* MRR Trend */}
      <div
        className="flex flex-col rounded-xl p-4"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-semibold tracking-tight text-foreground-strong">
            Revenue Trend
          </h3>
          <button
            onClick={() => navigate({ to: "/owner/finance" })}
            className="flex items-center gap-1 text-[10px] font-medium text-primary transition-opacity hover:opacity-70"
          >
            View Details <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-1 flex items-baseline gap-3">
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground-strong">
            {fmtAmount(grossRevenue)}
          </p>
          <span className="text-[10px] text-foreground-disabled">Net: {fmtAmount(netRevenue)}</span>
        </div>

        {/* Mini sparkline — interactive Recharts */}
        <div className="mt-4 flex-1" style={{ minHeight: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sparkline.map((val, i) => {
                const now = new Date();
                const d = new Date(
                  now.getFullYear(),
                  now.getMonth() - (sparkline.length - 1 - i),
                  1,
                );
                return {
                  name: d.toLocaleString("default", { month: "short" }),
                  value: Math.round(val),
                  isCurrent: i === sparkline.length - 1,
                };
              })}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: "var(--foreground-disabled)" }}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltip
                    active={active}
                    payload={payload as Array<{ value: number }>}
                    label={label}
                    prefix="AED "
                  />
                )}
                cursor={{ fill: "color-mix(in oklab, var(--primary) 8%, transparent)", radius: 4 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
                {sparkline.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === sparkline.length - 1
                        ? "var(--primary)"
                        : "color-mix(in oklab, var(--primary) 40%, transparent)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div
        className="flex flex-col rounded-xl p-4"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-semibold tracking-tight text-foreground-strong">
            Sales Pipeline
          </h3>
          <button
            onClick={() => navigate({ to: "/owner/crm" })}
            className="flex items-center gap-1 text-[10px] font-medium text-primary transition-opacity hover:opacity-70"
          >
            View CRM <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground-strong">
          {pipeline.total} <span className="text-sm font-normal text-foreground-muted">deals</span>
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {/* Funnel bars */}
          <div className="flex flex-col gap-2">
            <FunnelBar
              label="Active"
              value={pipeline.active}
              total={pipeline.total}
              color="var(--primary)"
            />
            <FunnelBar
              label="Closed Won"
              value={pipeline.closedWon}
              total={pipeline.total}
              color="var(--status-success)"
            />
          </div>

          <div
            className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: "color-mix(in oklab, var(--status-success) 8%, transparent)" }}
          >
            <TrendingUp className="h-3.5 w-3.5 text-[color:var(--status-success)]" />
            <span className="text-xs font-medium text-foreground-strong">
              {pipeline.winRate}% win rate
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FunnelBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-foreground-muted">{label}</span>
        <span className="text-[11px] font-medium text-foreground-strong">{value}</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--surface-raised)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  § 4 — PRODUCTION STATUS                                            */
/* ================================================================== */

function ProductionStatus({
  statusDistribution,
  velocityData,
}: {
  statusDistribution: StatusSegment[];
  velocityData: VelocityPoint[];
}) {
  const totalVideos = statusDistribution.reduce((s, d) => s + d.count, 0);

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {/* Status Distribution */}
      <div
        className="flex flex-col rounded-xl p-4"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
      >
        <h3 className="font-display text-xs font-semibold tracking-tight text-foreground-strong">
          Video Pipeline
        </h3>
        <p className="mt-1 text-[10px] text-foreground-disabled">
          {totalVideos} total videos across all statuses
        </p>

        {/* Stacked horizontal bar */}
        <div className="mt-4 flex h-5 w-full overflow-hidden rounded-full">
          {statusDistribution.map((seg) => (
            <div
              key={seg.slug}
              className="transition-all"
              style={{
                width: `${seg.pct}%`,
                background: seg.color,
                minWidth: seg.pct > 0 ? 4 : 0,
              }}
              title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {statusDistribution.slice(0, 6).map((seg) => (
            <div key={seg.slug} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: seg.color }} />
              <span className="text-[10px] text-foreground-muted">
                {seg.label} <span className="font-medium text-foreground">{seg.count}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Velocity — interactive Recharts */}
      <div
        className="flex flex-col rounded-xl p-4"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
      >
        <h3 className="font-display text-xs font-semibold tracking-tight text-foreground-strong">
          Production Velocity
        </h3>
        <p className="mt-1 text-[10px] text-foreground-disabled">
          Videos created per month ({new Date().getFullYear()})
        </p>

        <div className="mt-4 flex-1" style={{ minHeight: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={velocityData.map((bar, i) => ({
                name: bar.month,
                count: bar.count,
                isCurrent: i === new Date().getMonth(),
              }))}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: "var(--foreground-disabled)" }}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltip
                    active={active}
                    payload={payload as Array<{ value: number }>}
                    label={label}
                    suffix=" videos"
                  />
                )}
                cursor={{ fill: "color-mix(in oklab, var(--primary) 8%, transparent)", radius: 4 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={800}>
                {velocityData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === new Date().getMonth()
                        ? "var(--primary)"
                        : "color-mix(in oklab, var(--primary) 35%, transparent)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  § 6 — RECENT MESSAGES (replaces Client Health)                     */
/* ================================================================== */
// RecentMessagesWidget is imported at the top of this file.

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export function AgencyCommandTab() {
  const data = useCommandCenter();

  if (data.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-foreground-muted">Loading command center…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PulseBar
        mrr={data.mrr}
        activeClients={data.activeClients}
        videosInProduction={data.videosInProduction}
        pendingReview={data.pendingReview}
      />

      <AttentionSection items={data.attentionItems} />

      <RevenueSnapshot
        grossRevenue={data.grossRevenue}
        netRevenue={data.netRevenue}
        sparkline={data.revenueSparkline}
        pipeline={data.pipeline}
      />

      <ProductionStatus
        statusDistribution={data.statusDistribution}
        velocityData={data.velocityData}
      />

      <RecentMessagesWidget />
    </div>
  );
}
