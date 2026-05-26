/**
 * useHQAnalytics — aggregated production analytics for the HQ dashboard.
 *
 * Computes stat card values, status breakdown, weekly trend, and video-type
 * distribution from the videos + statuses + video_types + video_editors tables.
 *
 * useEditorPerformance — per-editor metrics for the Editors tab table.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfWeek,
  subWeeks,
  differenceInDays,
  getDaysInMonth,
  getDate,
} from "date-fns";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface HQStats {
  totalVideos: number;
  inProduction: number;
  inReview: number;
  completed: number;
  activeEditors: number;
}

export interface StatusBreakdown {
  slug: string;
  displayName: string;
  color: string;
  count: number;
  sortOrder: number;
}

export interface WeeklyTrendPoint {
  week: string;
  label: string;
  count: number;
}

export interface TypeDistribution {
  name: string;
  slug: string;
  count: number;
}

export interface EditorRow {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  activeCount: number;
  monthCompleted: number;
  monthlyGoal: number;
  dailyPace: "on_track" | "at_risk" | "behind";
  quarterCompleted: number;
}

/* ------------------------------------------------------------------ */
/* Status slug groups                                                   */
/* ------------------------------------------------------------------ */

const PRODUCTION_SLUGS = ["new", "in_progress", "rough_cut"];
const REVIEW_SLUGS = ["internal_review", "final_review", "revisions_requested"];
const TERMINAL_SLUGS = ["approved", "scheduled", "posted"];
const COMPLETED_SLUGS = ["approved", "posted"];

/* ------------------------------------------------------------------ */
/* useHQAnalytics                                                      */
/* ------------------------------------------------------------------ */

export function useHQAnalytics() {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.hq.analytics(tenantId!),
    queryFn: async () => {
      // ── 1. Fetch all non-archived videos with status + video_type ──
      const { data: videos, error: vErr } = await supabase
        .from("videos")
        .select(
          `
          id, updated_at, status_id, video_type_id,
          status:statuses!videos_status_id_fkey(id, slug, display_name, color, sort_order),
          video_type:video_types!videos_video_type_id_fkey(id, slug, display_name)
        `,
        )
        .eq("tenant_id", tenantId!)
        .is("archived_at", null);

      if (vErr) throw vErr;
      const allVideos = videos ?? [];

      // ── 2. Fetch active editor count ──
      const { data: editorRows, error: eErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("tenant_id", tenantId!)
        .in("role", ["editor", "senior_editor"]);

      if (eErr) throw eErr;
      const activeEditors = editorRows?.length ?? 0;

      // ── 3. Compute stat card values ──
      const stats: HQStats = {
        totalVideos: allVideos.length,
        inProduction: allVideos.filter((v) =>
          PRODUCTION_SLUGS.includes((v.status as { slug: string } | null)?.slug ?? ""),
        ).length,
        inReview: allVideos.filter((v) =>
          REVIEW_SLUGS.includes((v.status as { slug: string } | null)?.slug ?? ""),
        ).length,
        completed: allVideos.filter((v) =>
          TERMINAL_SLUGS.includes((v.status as { slug: string } | null)?.slug ?? ""),
        ).length,
        activeEditors,
      };

      // ── 4. Status breakdown for bar chart ──
      const statusMap = new Map<string, StatusBreakdown>();
      for (const v of allVideos) {
        const s = v.status as {
          slug: string;
          display_name: string;
          color: string;
          sort_order: number;
        } | null;
        if (!s) continue;
        const existing = statusMap.get(s.slug);
        if (existing) {
          existing.count += 1;
        } else {
          statusMap.set(s.slug, {
            slug: s.slug,
            displayName: s.display_name,
            color: s.color,
            count: 1,
            sortOrder: s.sort_order,
          });
        }
      }
      // Fetch all statuses to include zero-count ones
      const { data: allStatuses } = await supabase
        .from("statuses")
        .select("slug, display_name, color, sort_order")
        .eq("tenant_id", tenantId!)
        .order("sort_order");

      for (const s of allStatuses ?? []) {
        if (!statusMap.has(s.slug)) {
          statusMap.set(s.slug, {
            slug: s.slug,
            displayName: s.display_name,
            color: s.color ?? "#888888",
            count: 0,
            sortOrder: s.sort_order,
          });
        }
      }

      const statusBreakdown = Array.from(statusMap.values()).sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );

      // ── 5. Weekly trend (last 4 weeks of completed videos) ──
      const now = new Date();
      const weeklyTrend: WeeklyTrendPoint[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });
        const count = allVideos.filter((v) => {
          const slug = (v.status as { slug: string } | null)?.slug ?? "";
          if (!COMPLETED_SLUGS.includes(slug)) return false;
          const d = new Date(v.updated_at);
          return d >= weekStart && d < weekEnd;
        }).length;
        weeklyTrend.push({
          week: `W${4 - i}`,
          label: `Week ${4 - i}`,
          count,
        });
      }

      // ── 6. Video type distribution (in-production only) ──
      const typeMap = new Map<string, TypeDistribution>();
      const inProductionVideos = allVideos.filter((v) => {
        const slug = (v.status as { slug: string } | null)?.slug ?? "";
        return [...PRODUCTION_SLUGS, ...REVIEW_SLUGS].includes(slug);
      });
      for (const v of inProductionVideos) {
        const vt = v.video_type as { slug: string; display_name: string } | null;
        const name = vt?.display_name ?? "Untyped";
        const slug = vt?.slug ?? "untyped";
        const existing = typeMap.get(slug);
        if (existing) {
          existing.count += 1;
        } else {
          typeMap.set(slug, { name, slug, count: 1 });
        }
      }
      const typeDistribution = Array.from(typeMap.values()).sort((a, b) => b.count - a.count);

      return { stats, statusBreakdown, weeklyTrend, typeDistribution };
    },
    enabled: isAuthenticated && !!tenantId,
    staleTime: 60_000,
  });
}

/* ------------------------------------------------------------------ */
/* useEditorPerformance                                                */
/* ------------------------------------------------------------------ */

export function useEditorPerformance() {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.hq.editors(tenantId!),
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const quarterStart = startOfQuarter(now);
      const quarterEnd = endOfQuarter(now);

      // 1. Fetch all editors + senior_editors with profiles
      const { data: editors, error: edErr } = await supabase
        .from("profiles")
        .select("*, user_roles!inner(role)")
        .in("user_roles.role", ["editor", "senior_editor"])
        .order("full_name", { ascending: true });

      if (edErr) throw edErr;

      // 2. Fetch ALL video_editors assignments for the tenant
      const { data: allAssignments, error: aErr } = await supabase
        .from("video_editors")
        .select("editor_id, video_id")
        .eq("tenant_id", tenantId!);

      if (aErr) throw aErr;

      // 3. If there are any assignments, fetch the relevant videos
      const assignedVideoIds = [
        ...new Set((allAssignments ?? []).map((a) => a.video_id).filter(Boolean)),
      ] as string[];

      const videoMap = new Map<
        string,
        { slug: string; updated_at: string; archived_at: string | null }
      >();

      if (assignedVideoIds.length > 0) {
        // Fetch in batches of 500 to avoid URL limits
        const batches: string[][] = [];
        for (let i = 0; i < assignedVideoIds.length; i += 500) {
          batches.push(assignedVideoIds.slice(i, i + 500));
        }

        for (const batch of batches) {
          const { data: vids } = await supabase
            .from("videos")
            .select("id, updated_at, archived_at, status:statuses!videos_status_id_fkey(slug)")
            .in("id", batch)
            .is("archived_at", null);

          for (const v of vids ?? []) {
            videoMap.set(v.id, {
              slug: (v.status as { slug: string } | null)?.slug ?? "",
              updated_at: v.updated_at,
              archived_at: v.archived_at,
            });
          }
        }
      }

      // 4. Build assignment index: editorId → videoId[]
      const editorVideoIds = new Map<string, string[]>();
      for (const a of allAssignments ?? []) {
        if (!a.video_id) continue;
        const arr = editorVideoIds.get(a.editor_id) ?? [];
        arr.push(a.video_id);
        editorVideoIds.set(a.editor_id, arr);
      }

      // 5. Compute per-editor metrics
      const MONTHLY_GOAL = 40;
      const dayOfMonth = getDate(now);
      const daysInMonth = getDaysInMonth(now);

      const rows: EditorRow[] = (editors ?? []).map((p) => {
        const roleRow = Array.isArray(p.user_roles) ? p.user_roles[0] : p.user_roles;
        const role = (roleRow as { role: string } | null)?.role ?? "editor";

        const videoIds = editorVideoIds.get(p.id) ?? [];

        let activeCount = 0;
        let monthCompleted = 0;
        let quarterCompleted = 0;

        for (const vid of videoIds) {
          const v = videoMap.get(vid);
          if (!v) continue;

          const isTerminal = TERMINAL_SLUGS.includes(v.slug);
          if (!isTerminal) {
            activeCount++;
          }

          if (COMPLETED_SLUGS.includes(v.slug)) {
            const d = new Date(v.updated_at);
            if (d >= monthStart && d <= monthEnd) monthCompleted++;
            if (d >= quarterStart && d <= quarterEnd) quarterCompleted++;
          }
        }

        // Daily pace
        const expectedProgress = (dayOfMonth / daysInMonth) * MONTHLY_GOAL;
        let dailyPace: "on_track" | "at_risk" | "behind" = "on_track";
        if (monthCompleted < expectedProgress * 0.7) {
          dailyPace = "behind";
        } else if (monthCompleted < expectedProgress) {
          dailyPace = "at_risk";
        }

        return {
          userId: p.id,
          fullName: p.full_name ?? p.email ?? "Unknown",
          email: p.email ?? "",
          avatarUrl: p.avatar_url,
          role,
          activeCount,
          monthCompleted,
          monthlyGoal: MONTHLY_GOAL,
          dailyPace,
          quarterCompleted,
        };
      });

      return rows;
    },
    enabled: isAuthenticated && !!tenantId,
    staleTime: 60_000,
  });
}
