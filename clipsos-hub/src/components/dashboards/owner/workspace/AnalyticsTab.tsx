/**
 * AnalyticsTab — Computed stats from videos for this client.
 *
 * Wired to: useVideosByClient(clientId)
 * Shows: 4 stat cards + monthly bar chart + status breakdown
 */
import { useMemo } from "react";
import { useVideosByClient } from "@/hooks/data";
import { StatCard, SparklineBar } from "@/components/dashboard";
import { Film, Eye, Clock, TrendingUp, Loader2 } from "lucide-react";

interface AnalyticsTabProps {
  clientId: string;
}

export function AnalyticsTab({ clientId }: AnalyticsTabProps) {
  const { data: videos, isLoading, error } = useVideosByClient(clientId);

  const stats = useMemo(() => {
    if (!videos) return null;

    const total = videos.length;
    const posted = videos.filter((v) => v.status?.slug === "posted").length;
    const inReview = videos.filter((v) => v.status?.slug === "in_review").length;
    const inProgress = videos.filter(
      (v) => v.status?.slug && !["posted", "draft"].includes(v.status.slug),
    ).length;
    const completionRate = total > 0 ? Math.round((posted / total) * 100) : 0;

    // Monthly distribution (last 6 months)
    const now = new Date();
    const monthBuckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { month: d.toLocaleString("default", { month: "short" }), count: 0 };
    });

    for (const v of videos) {
      const created = new Date(v.created_at);
      for (const bucket of monthBuckets) {
        const bucketDate = new Date(`${bucket.month} 1, ${now.getFullYear()}`);
        if (
          created.getMonth() === bucketDate.getMonth() &&
          created.getFullYear() === bucketDate.getFullYear()
        ) {
          bucket.count++;
        }
      }
    }

    const maxCount = Math.max(...monthBuckets.map((b) => b.count), 1);
    const bars = monthBuckets.map((b) => Math.round((b.count / maxCount) * 100));

    // Status breakdown
    const statusMap = new Map<string, { label: string; color: string; count: number }>();
    for (const v of videos) {
      const slug = v.status?.slug ?? "unknown";
      const existing = statusMap.get(slug);
      if (existing) {
        existing.count++;
      } else {
        statusMap.set(slug, {
          label: v.status?.display_name ?? "Unknown",
          color: v.status?.color ?? "#666",
          count: 1,
        });
      }
    }

    return {
      total,
      posted,
      inReview,
      inProgress,
      completionRate,
      bars,
      months: monthBuckets.map((b) => b.month),
      statusBreakdown: Array.from(statusMap.values()).sort((a, b) => b.count - a.count),
    };
  }, [videos]);

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-[color:var(--status-danger)]/20">
        <span className="text-sm text-[color:var(--status-danger)]">
          Failed to load analytics: {error.message}
        </span>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-4">
      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard title="Total Videos" value={String(stats.total)}>
          <Film className="h-5 w-5 text-primary opacity-40" />
        </StatCard>
        <StatCard
          title="Posted"
          value={String(stats.posted)}
          change={`${stats.completionRate}%`}
          changeColor="success"
        >
          <Eye className="h-5 w-5 text-[#E7E384] opacity-40" />
        </StatCard>
        <StatCard title="In Review" value={String(stats.inReview)}>
          <Clock className="h-5 w-5 text-[#8A8CD9] opacity-40" />
        </StatCard>
        <StatCard title="In Progress" value={String(stats.inProgress)}>
          <TrendingUp className="h-5 w-5 text-[#59A8D4] opacity-40" />
        </StatCard>
      </div>

      {/* ── Monthly Production + Status Breakdown ─────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.5fr_1fr]">
        {/* Bar chart */}
        <div className="flex flex-col gap-4 rounded-xl bg-surface-card p-6">
          <h3 className="font-display text-sm font-medium text-foreground-strong">
            Monthly Production
          </h3>
          <SparklineBar data={stats.bars} />
          <div className="flex justify-between">
            {stats.months.map((m) => (
              <span key={m} className="text-caption text-foreground-muted">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="flex flex-col gap-4 rounded-xl bg-surface-card p-6">
          <h3 className="font-display text-sm font-medium text-foreground-strong">
            Status Breakdown
          </h3>
          <div className="flex flex-col gap-3">
            {stats.statusBreakdown.length === 0 && (
              <span className="text-caption text-foreground-muted">No videos yet</span>
            )}
            {stats.statusBreakdown.map((s) => {
              const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
              return (
                <div key={s.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="block h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-xs text-foreground-strong">{s.label}</span>
                    </div>
                    <span className="text-caption text-foreground-muted">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-card-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
