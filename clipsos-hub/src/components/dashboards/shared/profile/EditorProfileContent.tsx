/**
 * EditorProfileContent — Role-specific content for editor profiles.
 *
 * Layout:
 *   Row 1: 4 stat cards (Finished, Editing, Goal, Weekly Avg)
 *   Row 2: Weekly trend chart + Type distribution chart
 *   Row 3: Assigned videos table
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { WeeklyTrendChart } from "@/components/dashboards/shared/hq/charts/WeeklyTrendChart";
import { TypeDistributionChart } from "@/components/dashboards/shared/hq/charts/TypeDistributionChart";
import { ProfileVideosList } from "./ProfileVideosList";
import type { EditorProfileStats } from "@/hooks/use-team-member-profile";

interface EditorProfileContentProps {
  stats: EditorProfileStats;
  isLoading: boolean;
}

export function EditorProfileContent({ stats, isLoading }: EditorProfileContentProps) {
  if (isLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          title="Videos Finished"
          value={String(stats.videosFinished)}
          changeColor="success"
        />
        <StatCard title="Currently Editing" value={String(stats.currentlyEditing)} />
        <StatCard
          title="Monthly Goal"
          value={`${stats.monthCompleted}/${stats.monthlyGoal}`}
          percent={
            stats.monthlyGoal > 0 ? Math.round((stats.monthCompleted / stats.monthlyGoal) * 100) : 0
          }
        />
        <StatCard
          title="Weekly Average"
          value={String(stats.weeklyAverage)}
          subtitle="last 4 weeks"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="rounded-lg border border-border bg-surface-card p-3 md:p-4">
          <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
            Weekly Completion Trend
          </h3>
          {stats.weeklyTrend.some((w) => w.count > 0) ? (
            <WeeklyTrendChart data={stats.weeklyTrend} />
          ) : (
            <EmptyChart message="No completions in the last 4 weeks" />
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-card p-3 md:p-4">
          <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
            Video Types
          </h3>
          {stats.typeDistribution.length > 0 ? (
            <TypeDistributionChart data={stats.typeDistribution} />
          ) : (
            <EmptyChart message="No video type data" />
          )}
        </div>
      </div>

      {/* ── Performance insights ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <MiniStatCard label="Quarter Total" value={String(stats.quarterTotal)} />
        <MiniStatCard label="Career Total" value={String(stats.careerTotal)} />
        <MiniStatCard
          label="Daily Pace"
          value={
            stats.dailyPace === "on_track"
              ? "On Track"
              : stats.dailyPace === "at_risk"
                ? "At Risk"
                : "Behind"
          }
          accent={
            stats.dailyPace === "on_track"
              ? "success"
              : stats.dailyPace === "at_risk"
                ? "warning"
                : "danger"
          }
        />
        <MiniStatCard
          label="Goal Progress"
          value={`${Math.round((stats.monthCompleted / (stats.monthlyGoal || 1)) * 100)}%`}
        />
      </div>

      {/* ── Assigned Videos ── */}
      <div>
        <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
          Assigned Videos
        </h3>
        <ProfileVideosList
          videos={stats.assignedVideos}
          emptyMessage="No videos currently assigned"
        />
      </div>
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
    <div className="flex h-[240px] items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ── Loading skeleton ── */
function EditorSkeleton() {
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
