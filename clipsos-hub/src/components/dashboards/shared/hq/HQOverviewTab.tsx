/**
 * HQOverviewTab — Production analytics dashboard.
 *
 * Modular layout using ChartCard wrappers:
 *   Row 1: 5 minimal StatCards (consistent with rest of app)
 *   Row 2: StatusBarChart (full width) in ChartCard
 *   Row 3: WeeklyTrendChart (1/2) + TypeDistributionChart (1/2) in ChartCards
 *
 * Design: Minimal stat cards, restrained color palette, high-contrast charts.
 */

import { useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBarChart } from "./charts/StatusBarChart";
import { WeeklyTrendChart } from "./charts/WeeklyTrendChart";
import { TypeDistributionChart } from "./charts/TypeDistributionChart";
import { ChartCard } from "./charts/ChartCard";
import type {
  HQStats,
  StatusBreakdown,
  WeeklyTrendPoint,
  TypeDistribution,
} from "@/hooks/use-hq-analytics";

interface HQOverviewTabProps {
  stats: HQStats;
  statusBreakdown: StatusBreakdown[];
  weeklyTrend: WeeklyTrendPoint[];
  typeDistribution: TypeDistribution[];
  isLoading: boolean;
}

export function HQOverviewTab({
  stats,
  statusBreakdown,
  weeklyTrend,
  typeDistribution,
  isLoading,
}: HQOverviewTabProps) {
  if (isLoading) {
    return <OverviewSkeleton />;
  }

  const totalInPipeline = useMemo(
    () => statusBreakdown.reduce((s, d) => s + d.count, 0),
    [statusBreakdown],
  );

  const weeklyTotal = useMemo(() => weeklyTrend.reduce((s, w) => s + w.count, 0), [weeklyTrend]);

  const activeTypes = useMemo(
    () => typeDistribution.filter((t) => t.count > 0).length,
    [typeDistribution],
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* ── Stat Cards — minimal, consistent with the rest of the app ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
        <StatCard title="Total Videos" value={String(stats.totalVideos)} />
        <StatCard
          title="In Production"
          value={String(stats.inProduction)}
          subtitle={`${stats.totalVideos > 0 ? ((stats.inProduction / stats.totalVideos) * 100).toFixed(0) : 0}% of total`}
        />
        <StatCard
          title="In Review"
          value={String(stats.inReview)}
          subtitle={`${stats.totalVideos > 0 ? ((stats.inReview / stats.totalVideos) * 100).toFixed(0) : 0}% of total`}
        />
        <StatCard
          title="Completed"
          value={String(stats.completed)}
          subtitle={`${stats.totalVideos > 0 ? ((stats.completed / stats.totalVideos) * 100).toFixed(0) : 0}% completion`}
        />
        <StatCard title="Active Editors" value={String(stats.activeEditors)} />
      </div>

      {/* ── Status Breakdown ── */}
      <ChartCard
        title="Video Status Breakdown"
        subtitle="Distribution across all pipeline stages"
        badge={totalInPipeline > 0 ? { label: `${totalInPipeline} total` } : undefined}
      >
        {statusBreakdown.length > 0 ? (
          <StatusBarChart data={statusBreakdown} />
        ) : (
          <EmptyChartMessage message="No video data available" />
        )}
      </ChartCard>

      {/* ── Bottom Row: Trend + Type ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <ChartCard
          title="Weekly Completion Trend"
          subtitle="Last 4 weeks"
          badge={weeklyTotal > 0 ? { label: `${weeklyTotal} total` } : undefined}
        >
          {weeklyTrend.some((w) => w.count > 0) ? (
            <WeeklyTrendChart data={weeklyTrend} />
          ) : (
            <EmptyChartMessage message="No completions in the last 4 weeks" />
          )}
        </ChartCard>

        <ChartCard
          title="Active by Video Type"
          subtitle="In-production breakdown"
          badge={activeTypes > 0 ? { label: `${activeTypes} types` } : undefined}
        >
          {typeDistribution.length > 0 ? (
            <TypeDistributionChart data={typeDistribution} />
          ) : (
            <EmptyChartMessage message="No active videos by type" />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border/40 bg-surface-card"
          />
        ))}
      </div>
      <div className="h-[350px] animate-pulse rounded-xl border border-border/40 bg-surface-card" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="h-[320px] animate-pulse rounded-xl border border-border/40 bg-surface-card" />
        <div className="h-[320px] animate-pulse rounded-xl border border-border/40 bg-surface-card" />
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyChartMessage({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center">
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
