/**
 * HQDashboard — Owner & Manager > HQ
 *
 * Production command center with two tabs:
 *   - Overview: stat cards + status bar chart + weekly trend + type distribution
 *   - Editors: performance table with search, sort, goal tracking, drill-down
 *
 * Header Ownership Rule: this is the TOP-LEVEL route component,
 * so it owns setHeaderConfig(). Child tabs NEVER call it.
 */

import { useEffect, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useHQAnalytics, useEditorPerformance } from "@/hooks/use-hq-analytics";
import { HQOverviewTab } from "@/components/dashboards/shared/hq/HQOverviewTab";
import { HQEditorsTab } from "@/components/dashboards/shared/hq/HQEditorsTab";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function HQDashboard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [activeTab, setActiveTab] = useState<"overview" | "editors">("overview");

  // ── Data hooks ──
  const { data: analytics, isLoading: analyticsLoading } = useHQAnalytics();

  const { data: editorRows = [], isLoading: editorsLoading } = useEditorPerformance();

  // ── Header config (top-level ownership) ──
  useEffect(() => {
    setHeaderConfig({
      title: "HQ",
      tabs: [
        { key: "overview", label: "Overview" },
        {
          key: "editors",
          label: `Editors${editorRows.length ? ` (${editorRows.length})` : ""}`,
        },
      ],
      activeTab,
      onTabChange: (v: string) => setActiveTab(v as "overview" | "editors"),
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, activeTab, editorRows.length]);

  // ── Tab content ──
  if (activeTab === "editors") {
    return (
      <FullBleed>
        <HQEditorsTab data={editorRows} isLoading={editorsLoading} />
      </FullBleed>
    );
  }

  return (
    <FullBleed>
      <HQOverviewTab
        stats={
          analytics?.stats ?? {
            totalVideos: 0,
            inProduction: 0,
            inReview: 0,
            completed: 0,
            activeEditors: 0,
          }
        }
        statusBreakdown={analytics?.statusBreakdown ?? []}
        weeklyTrend={analytics?.weeklyTrend ?? []}
        typeDistribution={analytics?.typeDistribution ?? []}
        isLoading={analyticsLoading}
      />
    </FullBleed>
  );
}
