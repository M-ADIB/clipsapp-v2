/**
 * CloserProfileContent — Role-specific content for closer profiles.
 *
 * Layout:
 *   Row 1: 4 stat cards (Total Deals, Active, Win Rate, Month Deals)
 *   Row 2: Stage Funnel bar chart + Plan distribution
 *   Row 3: Recent deals table
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { useCloserProfileStats, type CloserProfileStats } from "@/hooks/use-closer-profile";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface CloserProfileContentProps {
  userId: string;
  fullName: string;
}

export function CloserProfileContent({ userId, fullName }: CloserProfileContentProps) {
  const { data: stats, isLoading } = useCloserProfileStats(userId, fullName);

  if (isLoading) return <CloserSkeleton />;
  if (!stats || stats.totalDeals === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard title="Total Deals" value={String(stats.totalDeals)} />
        <StatCard title="Active Deals" value={String(stats.activeDeals)} changeColor="success" />
        <StatCard
          title="Win Rate"
          value={stats.winRate > 0 ? `${stats.winRate}%` : "—"}
          subtitle={`${stats.closedWon}W / ${stats.closedLost}L`}
        />
        <StatCard
          title="This Month"
          value={String(stats.monthDeals)}
          subtitle={`${stats.quarterDeals} this quarter`}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {/* Stage Funnel */}
        <div className="rounded-lg border border-border bg-surface-card p-3 md:p-4">
          <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
            Deal Stage Funnel
          </h3>
          {stats.stageFunnel.length > 0 ? (
            <StageFunnelChart data={stats.stageFunnel} />
          ) : (
            <EmptyChart message="No stage data available" />
          )}
        </div>

        {/* Plan Distribution + Region */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-surface-card p-3 md:p-4">
            <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
              Plans Sold
            </h3>
            {stats.planDistribution.length > 0 ? (
              <div className="space-y-2">
                {stats.planDistribution.map((p) => (
                  <PlanBar key={p.plan} label={p.plan} count={p.count} total={stats.totalDeals} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No plan data</p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-surface-card p-3 md:p-4">
            <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
              Regions
            </h3>
            {stats.regionDistribution.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.regionDistribution.map((r) => (
                  <span
                    key={r.region}
                    className="inline-flex items-center gap-1 rounded-full bg-surface-overlay px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {r.region}
                    <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
                      {r.count}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No region data</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Performance insights ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <MiniStatCard label="Quarter Deals" value={String(stats.quarterDeals)} />
        <MiniStatCard label="Avg Videos/Deal" value={String(stats.avgTotalVideos)} />
        <MiniStatCard
          label="Close Rate"
          value={stats.winRate > 0 ? `${stats.winRate}%` : "—"}
          accent={stats.winRate >= 50 ? "success" : stats.winRate >= 30 ? "warning" : "danger"}
        />
        <MiniStatCard label="Closed Won" value={String(stats.closedWon)} accent="success" />
      </div>

      {/* ── Recent Deals ── */}
      <div>
        <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
          Recent Deals
        </h3>
        <RecentDealsTable deals={stats.recentDeals} />
      </div>
    </div>
  );
}

/* ── Stage Funnel Chart ── */
function StageFunnelChart({ data }: { data: CloserProfileStats["stageFunnel"] }) {
  const COLORS = [
    "hsl(220, 90%, 60%)",
    "hsl(200, 85%, 55%)",
    "hsl(180, 80%, 50%)",
    "hsl(160, 75%, 45%)",
    "hsl(140, 70%, 40%)",
    "hsl(120, 65%, 45%)",
    "hsl(80, 60%, 50%)",
    "hsl(45, 90%, 55%)",
  ];

  const chartConfig = data.reduce(
    (acc, item, idx) => {
      acc[item.stage] = {
        label: item.stage,
        color: COLORS[idx % COLORS.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>,
  );

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <YAxis
            dataKey="stage"
            type="category"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            width={100}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

/* ── Plan Bar ── */
function PlanBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-[80px] truncate text-xs text-muted-foreground">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-overlay">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="min-w-[32px] text-right text-xs tabular-nums text-foreground-strong">
        {count}
      </span>
    </div>
  );
}

/* ── Recent Deals Table ── */
function RecentDealsTable({ deals }: { deals: CloserProfileStats["recentDeals"] }) {
  if (deals.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-surface-card p-8">
        <p className="text-xs text-muted-foreground">No deals found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface-overlay/50">
            <th className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground">
              Deal
            </th>
            <th className="hidden px-3 py-2 text-left text-[11px] font-medium text-muted-foreground sm:table-cell">
              Stage
            </th>
            <th className="hidden px-3 py-2 text-left text-[11px] font-medium text-muted-foreground md:table-cell">
              Plan
            </th>
            <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">
              Videos
            </th>
            <th className="hidden px-3 py-2 text-right text-[11px] font-medium text-muted-foreground md:table-cell">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {deals.map((d) => (
            <tr key={d.id} className="border-b border-border/50 last:border-0">
              <td className="px-3 py-2">
                <p className="truncate text-xs font-medium text-foreground-strong">{d.name}</p>
                <p className="truncate text-[10px] text-muted-foreground sm:hidden">{d.stage}</p>
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                <span className="inline-flex rounded-full bg-surface-overlay px-2 py-0.5 text-[10px] font-medium text-foreground">
                  {d.stage}
                </span>
              </td>
              <td className="hidden px-3 py-2 text-xs text-muted-foreground md:table-cell">
                {d.plan}
              </td>
              <td className="px-3 py-2 text-right text-xs tabular-nums text-foreground-strong">
                {d.totalVideos || "—"}
              </td>
              <td className="hidden px-3 py-2 text-right text-[10px] text-muted-foreground md:table-cell">
                {d.createdAt
                  ? formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Mini stat card ── */
function MiniStatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "success" | "warning" | "danger";
}) {
  const accentColors = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  return (
    <div className="rounded-lg border border-border bg-surface-card p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-lg font-semibold tabular-nums ${accent ? accentColors[accent] : "text-foreground-strong"}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ── Empty chart placeholder ── */
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface-card p-12">
      <p className="text-sm font-medium text-foreground-strong">No Deal Data</p>
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        This closer doesn't have any deals attributed yet. Deals are matched by the "Deal Owner"
        field in the CRM.
      </p>
    </div>
  );
}

/* ── Loading skeleton ── */
function CloserSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-border bg-surface-card"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="h-[280px] animate-pulse rounded-lg border border-border bg-surface-card" />
        <div className="h-[280px] animate-pulse rounded-lg border border-border bg-surface-card" />
      </div>
    </div>
  );
}
