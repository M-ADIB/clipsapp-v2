/**
 * ManagerProfileContent — Profile content for manager & senior_editor roles.
 *
 * Shows: team overview stats (team size, total videos, etc.)
 * Since managers see the same HQ dashboard, this provides a personal summary.
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { useTeam } from "@/hooks/use-team";
import { useVideos } from "@/hooks/data";
import { useMemo } from "react";

export function ManagerProfileContent() {
  const { data: team = [], isLoading: teamLoading } = useTeam();
  const { data: videos = [], isLoading: videosLoading } = useVideos();

  const isLoading = teamLoading || videosLoading;

  const stats = useMemo(() => {
    const editors = team.filter((m) => m.role === "editor" || m.role === "senior_editor");
    const totalVideos = videos.length;
    const approvedCount = videos.filter(
      (v) => v.status?.slug === "approved" || v.status?.slug === "posted",
    ).length;
    const inReview = videos.filter(
      (v) => v.status?.slug === "internal_review" || v.status?.slug === "final_review",
    ).length;

    return {
      teamSize: team.length,
      editors: editors.length,
      totalVideos,
      approvedCount,
      inReview,
      approvalRate: totalVideos > 0 ? Math.round((approvedCount / totalVideos) * 100) : 0,
    };
  }, [team, videos]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-border bg-surface-card"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard title="Team Members" value={String(stats.teamSize)} />
        <StatCard title="Active Editors" value={String(stats.editors)} />
        <StatCard title="Total Videos" value={String(stats.totalVideos)} />
        <StatCard title="Completion Rate" value={`${stats.approvalRate}%`} changeColor="success" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <MiniInfo label="Videos Approved" value={String(stats.approvedCount)} />
        <MiniInfo label="In Review" value={String(stats.inReview)} />
        <MiniInfo
          label="Team Composition"
          value={`${stats.editors} editors • ${stats.teamSize - stats.editors} others`}
        />
      </div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-card p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-foreground-strong tabular-nums">
        {value}
      </p>
    </div>
  );
}
