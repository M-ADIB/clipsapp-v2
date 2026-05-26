/**
 * useCloserProfileStats — fetch deal performance metrics for a closer.
 *
 * Since `crm_deals.deal_owner` is a TEXT field (not a FK), we match
 * it against the closer's `profiles.full_name`.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import { startOfMonth, endOfMonth, startOfQuarter } from "date-fns";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface CloserProfileStats {
  totalDeals: number;
  activeDeals: number;
  closedWon: number;
  closedLost: number;
  winRate: number;
  monthDeals: number;
  quarterDeals: number;
  avgTotalVideos: number;
  /** Stage funnel: name → count */
  stageFunnel: Array<{ stage: string; count: number }>;
  /** Plan distribution */
  planDistribution: Array<{ plan: string; count: number }>;
  /** Region distribution */
  regionDistribution: Array<{ region: string; count: number }>;
  /** Recent deals */
  recentDeals: Array<{
    id: string;
    name: string;
    stage: string;
    plan: string;
    totalVideos: number;
    region: string;
    createdAt: string | null;
  }>;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useCloserProfileStats(userId: string | undefined, fullName: string | undefined) {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.teamProfile.closerStats(tenantId!, userId!),
    queryFn: async (): Promise<CloserProfileStats> => {
      if (!fullName) {
        return emptyStats();
      }

      // Fetch all deals owned by this closer (text match)
      const { data: deals, error } = await supabase
        .from("crm_deals")
        .select(
          `
          id, name, stage, plan, total_videos, region, payment_method, 
          created_at, updated_at,
          deal_stage:deal_stages!crm_deals_stage_id_fkey(display_name, slug, order_position)
        `,
        )
        .eq("tenant_id", tenantId!)
        .eq("deal_owner", fullName)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const allDeals = deals ?? [];

      if (allDeals.length === 0) return emptyStats();

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const quarterStart = startOfQuarter(now);

      // ── Metrics ──
      let closedWon = 0;
      let closedLost = 0;
      let activeDeals = 0;
      let monthDeals = 0;
      let quarterDeals = 0;
      let totalVideosSum = 0;
      let totalVideosCount = 0;

      const stageMap = new Map<string, number>();
      const planMap = new Map<string, number>();
      const regionMap = new Map<string, number>();

      for (const d of allDeals) {
        const stageObj = d.deal_stage as {
          display_name: string;
          slug: string;
          order_position: number;
        } | null;
        const stageName = stageObj?.display_name ?? d.stage ?? "Unknown";
        const stageSlug = stageObj?.slug ?? d.stage?.toLowerCase() ?? "";

        // Stage funnel
        stageMap.set(stageName, (stageMap.get(stageName) ?? 0) + 1);

        // Win/loss
        if (
          stageSlug === "won" ||
          stageSlug === "closed_won" ||
          stageName.toLowerCase().includes("won")
        ) {
          closedWon++;
        } else if (
          stageSlug === "lost" ||
          stageSlug === "closed_lost" ||
          stageName.toLowerCase().includes("lost")
        ) {
          closedLost++;
        } else {
          activeDeals++;
        }

        // Time-based
        const created = new Date(d.created_at ?? 0);
        if (created >= monthStart && created <= monthEnd) monthDeals++;
        if (created >= quarterStart) quarterDeals++;

        // Plan
        const plan = d.plan ?? "No Plan";
        planMap.set(plan, (planMap.get(plan) ?? 0) + 1);

        // Region
        const region = d.region ?? "No Region";
        regionMap.set(region, (regionMap.get(region) ?? 0) + 1);

        // Video stats
        if (d.total_videos && Number(d.total_videos) > 0) {
          totalVideosSum += Number(d.total_videos);
          totalVideosCount++;
        }
      }

      const totalClosed = closedWon + closedLost;
      const winRate = totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;
      const avgTotalVideos =
        totalVideosCount > 0 ? Math.round(totalVideosSum / totalVideosCount) : 0;

      // Stage funnel sorted by count
      const stageFunnel = Array.from(stageMap.entries())
        .map(([stage, count]) => ({ stage, count }))
        .sort((a, b) => b.count - a.count);

      const planDistribution = Array.from(planMap.entries())
        .map(([plan, count]) => ({ plan, count }))
        .sort((a, b) => b.count - a.count);

      const regionDistribution = Array.from(regionMap.entries())
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count);

      // Recent deals (last 10)
      const recentDeals = allDeals.slice(0, 10).map((d) => ({
        id: d.id,
        name: d.name ?? "Untitled Deal",
        stage: (d.deal_stage as { display_name: string } | null)?.display_name ?? d.stage ?? "",
        plan: d.plan ?? "—",
        totalVideos: Number(d.total_videos ?? 0),
        region: d.region ?? "—",
        createdAt: d.created_at,
      }));

      return {
        totalDeals: allDeals.length,
        activeDeals,
        closedWon,
        closedLost,
        winRate,
        monthDeals,
        quarterDeals,
        avgTotalVideos,
        stageFunnel,
        planDistribution,
        regionDistribution,
        recentDeals,
      };
    },
    enabled: isAuthenticated && !!tenantId && !!userId && !!fullName,
    staleTime: 60_000,
  });
}

function emptyStats(): CloserProfileStats {
  return {
    totalDeals: 0,
    activeDeals: 0,
    closedWon: 0,
    closedLost: 0,
    winRate: 0,
    monthDeals: 0,
    quarterDeals: 0,
    avgTotalVideos: 0,
    stageFunnel: [],
    planDistribution: [],
    regionDistribution: [],
    recentDeals: [],
  };
}
