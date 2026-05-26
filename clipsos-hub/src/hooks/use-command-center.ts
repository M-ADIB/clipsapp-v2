/**
 * useCommandCenter — Aggregation hook for the Agency Command Center tab.
 *
 * Combines data from 6+ existing hooks and derives priority-ranked metrics
 * for the owner's unified dashboard view. No new database queries — pure
 * client-side aggregation over cached TanStack Query data.
 */
import { useMemo } from "react";
import {
  useVideos,
  useClients,
  useStripeCharges,
  useCrmDeals,
  useFollowUps,
  useTeam,
  useActivityLog,
} from "@/hooks/data";
import { safeParseDate } from "@/components/dashboards/owner/finance/finance-helpers";

/* ── Types ───────────────────────────────────────────────────────────── */

export interface AttentionItem {
  id: string;
  type: "review" | "payment" | "followup";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  route?: string;
  count: number;
}

export interface StatusSegment {
  slug: string;
  label: string;
  count: number;
  color: string;
  pct: number;
}

export interface VelocityPoint {
  month: string;
  count: number;
  pct: number;
}

export interface TeamMemberWorkload {
  id: string;
  name: string;
  role: string | null;
  avatar: string | null;
  assignedVideos: number;
  completedThisMonth: number;
}

export interface ClientHealthRow {
  id: string;
  name: string;
  logoUrl: string | null;
  totalVideos: number;
  inProgress: number;
  pendingReview: number;
  status: string;
  score: number;
}

export interface CommandCenterData {
  // § 1 — Pulse KPIs
  mrr: number;
  mrrTrend: number[];
  activeClients: number;
  totalClients: number;
  videosInProduction: number;
  pendingReview: number;

  // § 2 — Attention items
  attentionItems: AttentionItem[];
  attentionCount: number;

  // § 3 — Revenue
  grossRevenue: number;
  netRevenue: number;
  revenueSparkline: number[];
  pipeline: { total: number; active: number; closedWon: number; winRate: number };

  // § 4 — Production
  statusDistribution: StatusSegment[];
  velocityData: VelocityPoint[];

  // § 5 — Team
  teamWorkload: TeamMemberWorkload[];

  // § 6 — Client Health
  clientHealth: ClientHealthRow[];

  // Loading
  isLoading: boolean;
}

/* ── Hook ────────────────────────────────────────────────────────────── */

export function useCommandCenter(): CommandCenterData {
  const { data: videos = [], isLoading: vLoading } = useVideos();
  const { data: clients = [], isLoading: cLoading } = useClients();
  const { data: charges = [], isLoading: chLoading } = useStripeCharges();
  const { data: deals = [] } = useCrmDeals();
  const { data: followUps = [] } = useFollowUps();
  const { data: team = [] } = useTeam();
  const { data: _activity = [] } = useActivityLog({ limit: 10 });

  const isLoading = vLoading || cLoading || chLoading;

  /* ── § 1: Pulse KPIs ───────────────────────────────────── */

  const pulseKPIs = useMemo(() => {
    const now = new Date();

    // MRR from Stripe charges this month
    const successful = charges.filter((c: Record<string, unknown>) => c.status === "succeeded");
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

    // MRR trend — last 6 months
    const mrrTrend: number[] = [];
    for (let i = 5; i >= 0; i--) {
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
      mrrTrend.push(tot);
    }

    const activeClients = clients.filter((c) => c.account_status === "active").length;
    const totalClients = clients.length;

    // Videos currently in the pipeline (not posted/published/archived)
    const terminalStatuses = new Set(["posted", "published", "archived"]);
    const videosInProduction = videos.filter(
      (v) => !terminalStatuses.has(v.status?.slug || ""),
    ).length;

    // Pending review
    const pendingReview = videos.filter((v) =>
      ["in_review", "changes_requested"].includes(v.status?.slug || ""),
    ).length;

    return { mrr, mrrTrend, activeClients, totalClients, videosInProduction, pendingReview };
  }, [charges, clients, videos]);

  /* ── § 2: Attention Items ──────────────────────────────── */

  const attentionItems = useMemo(() => {
    const items: AttentionItem[] = [];
    const now = new Date();

    // Reviews pending
    const reviewCount = pulseKPIs.pendingReview;
    if (reviewCount > 0) {
      items.push({
        id: "review",
        type: "review",
        severity: reviewCount >= 5 ? "critical" : "warning",
        title: `${reviewCount} video${reviewCount !== 1 ? "s" : ""} awaiting review`,
        description: "Content waiting for owner approval before publishing",
        route: "/owner/videos",
        count: reviewCount,
      });
    }

    // Failed / pending payments in the current month
    const failedPayments = charges.filter((c: Record<string, unknown>) => {
      if (c.status !== "failed" && c.status !== "pending") return false;
      const d = safeParseDate(c.stripe_created_at as string);
      if (!d) return false;
      return d.getUTCMonth() === now.getUTCMonth() && d.getUTCFullYear() === now.getUTCFullYear();
    });
    if (failedPayments.length > 0) {
      const totalFailed =
        failedPayments.reduce(
          (sum: number, c: Record<string, unknown>) => sum + ((c.amount as number) ?? 0),
          0,
        ) / 100;
      items.push({
        id: "payments",
        type: "payment",
        severity: "critical",
        title: `${failedPayments.length} payment${failedPayments.length !== 1 ? "s" : ""} need attention`,
        description: `AED ${totalFailed.toLocaleString("en-AE", { minimumFractionDigits: 2 })} in failed/pending charges`,
        route: "/owner/finance",
        count: failedPayments.length,
      });
    }

    // Overdue follow-ups
    const overdue = followUps.filter((f) => {
      if (!f.due_at) return false;
      return new Date(f.due_at) < now && f.status !== "done";
    });
    if (overdue.length > 0) {
      items.push({
        id: "followups",
        type: "followup",
        severity: overdue.length >= 3 ? "critical" : "warning",
        title: `${overdue.length} overdue follow-up${overdue.length !== 1 ? "s" : ""}`,
        description: "Sales follow-ups past their due date",
        route: "/owner/crm",
        count: overdue.length,
      });
    }

    return items;
  }, [pulseKPIs.pendingReview, charges, followUps]);

  /* ── § 3: Revenue ──────────────────────────────────────── */

  const revenue = useMemo(() => {
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

    // Sparkline: last 8 months
    const now = new Date();
    const sparkline: number[] = [];
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
      sparkline.push(tot);
    }

    // Pipeline
    const total = deals.length;
    const closedWon = deals.filter((d) => d.stage === "closed_won" || d.stage === "won").length;
    const active = deals.filter((d) => d.stage !== "lost" && d.stage !== "closed_lost").length;
    const winRate = total > 0 ? Math.round((closedWon / total) * 100) : 0;

    return {
      grossRevenue: gross,
      netRevenue: net,
      revenueSparkline: sparkline,
      pipeline: { total, active, closedWon, winRate },
    };
  }, [charges, deals]);

  /* ── § 4: Production ───────────────────────────────────── */

  const production = useMemo(() => {
    // Status distribution
    const statusMap = new Map<string, { label: string; color: string; count: number }>();
    for (const v of videos) {
      const slug = v.status?.slug || "unknown";
      const existing = statusMap.get(slug);
      if (existing) {
        existing.count++;
      } else {
        statusMap.set(slug, {
          label: v.status?.display_name || slug,
          color: v.status?.color || "#666",
          count: 1,
        });
      }
    }
    const totalVideos = videos.length || 1;
    const statusDistribution: StatusSegment[] = Array.from(statusMap.entries())
      .map(([slug, { label, color, count }]) => ({
        slug,
        label,
        color,
        count,
        pct: Math.round((count / totalVideos) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Velocity — videos created per month this year
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const counts = new Array(12).fill(0);
    for (const v of videos) {
      const d = new Date(v.created_at);
      if (d.getFullYear() === now.getFullYear()) counts[d.getMonth()]++;
    }
    const max = Math.max(...counts, 1);
    const velocityData: VelocityPoint[] = months.map((m, i) => ({
      month: m,
      count: counts[i],
      pct: (counts[i] / max) * 100,
    }));

    return { statusDistribution, velocityData };
  }, [videos]);

  /* ── § 5: Team Workload (Editors Only — ranked by completed this month) */

  const teamWorkload = useMemo((): TeamMemberWorkload[] => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const completedStatuses = new Set(["posted", "published", "approved"]);

    // Count videos assigned to each editor (total)
    const editorVideoCount = new Map<string, number>();
    // Count videos completed this month per editor
    const editorCompletedThisMonth = new Map<string, number>();

    for (const v of videos) {
      const editorId = (v as Record<string, unknown>).assigned_editor_id as string | null;
      if (editorId) {
        editorVideoCount.set(editorId, (editorVideoCount.get(editorId) ?? 0) + 1);

        // Check if this video was completed this month
        const slug = v.status?.slug || "";
        if (completedStatuses.has(slug)) {
          const updatedAt = new Date(v.updated_at);
          if (updatedAt.getMonth() === currentMonth && updatedAt.getFullYear() === currentYear) {
            editorCompletedThisMonth.set(
              editorId,
              (editorCompletedThisMonth.get(editorId) ?? 0) + 1,
            );
          }
        }
      }
    }

    return team
      .filter((m) => m.role === "editor" || m.role === "senior_editor") // Editors only
      .map((m) => ({
        id: m.id,
        name: m.full_name || m.email || "Unknown",
        role: m.role,
        avatar: m.avatar_url,
        assignedVideos: editorVideoCount.get(m.id) ?? 0,
        completedThisMonth: editorCompletedThisMonth.get(m.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.completedThisMonth - a.completedThisMonth || b.assignedVideos - a.assignedVideos,
      );
  }, [team, videos]);

  /* ── § 6: Client Health ────────────────────────────────── */

  const clientHealth = useMemo((): ClientHealthRow[] => {
    // Group videos by client
    const clientVideoMap = new Map<
      string,
      { total: number; inProgress: number; pendingReview: number }
    >();
    const terminalStatuses = new Set(["posted", "published", "archived"]);
    const reviewStatuses = new Set(["in_review", "changes_requested"]);

    for (const v of videos) {
      const cid = v.client_id;
      if (!cid) continue;
      const existing = clientVideoMap.get(cid) || { total: 0, inProgress: 0, pendingReview: 0 };
      existing.total++;
      const slug = v.status?.slug || "";
      if (!terminalStatuses.has(slug)) existing.inProgress++;
      if (reviewStatuses.has(slug)) existing.pendingReview++;
      clientVideoMap.set(cid, existing);
    }

    return clients
      .map((c) => {
        const stats = clientVideoMap.get(c.id) || { total: 0, inProgress: 0, pendingReview: 0 };
        // Attention score = pendingReview * 3 + inProgress (higher = more attention needed)
        const score = stats.pendingReview * 3 + stats.inProgress;
        return {
          id: c.id,
          name: c.name,
          logoUrl: c.logo_url ?? null,
          totalVideos: stats.total,
          inProgress: stats.inProgress,
          pendingReview: stats.pendingReview,
          status: c.account_status ?? "active",
          score,
        };
      })
      .filter((c) => c.status === "active")
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [clients, videos]);

  /* ── Return ────────────────────────────────────────────── */

  return {
    ...pulseKPIs,
    attentionItems,
    attentionCount: attentionItems.reduce((s, i) => s + i.count, 0),
    ...revenue,
    ...production,
    teamWorkload,
    clientHealth,
    isLoading,
  };
}
