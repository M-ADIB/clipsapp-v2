/**
 * useTeamMemberProfile — fetch a single team member's profile + role.
 * useEditorProfileStats — editor-specific analytics for the profile page.
 *
 * These hooks power the universal team member profile pages at /{role}/team/:userId.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  startOfWeek,
  subWeeks,
  getDate,
  getDaysInMonth,
} from "date-fns";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface TeamMemberProfile {
  id: string;
  fullName: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  timezone: string | null;
  role: string;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface EditorProfileStats {
  videosFinished: number;
  currentlyEditing: number;
  monthlyGoal: number;
  monthCompleted: number;
  weeklyAverage: number;
  quarterTotal: number;
  careerTotal: number;
  dailyPace: "on_track" | "at_risk" | "behind";
  weeklyTrend: Array<{ week: string; label: string; count: number }>;
  typeDistribution: Array<{ name: string; slug: string; count: number }>;
  assignedVideos: Array<{
    id: string;
    title: string;
    clientName: string;
    statusSlug: string;
    statusName: string;
    statusColor: string;
    updatedAt: string;
    createdAt: string;
  }>;
}

/* ------------------------------------------------------------------ */
/* useTeamMemberProfile                                                */
/* ------------------------------------------------------------------ */

export function useTeamMemberProfile(userId: string | undefined) {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.teamProfile.detail(tenantId!, userId!),
    queryFn: async (): Promise<TeamMemberProfile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles!inner(role)")
        .eq("id", userId!)
        .single();

      if (error) throw error;

      const roleRow = Array.isArray(data.user_roles) ? data.user_roles[0] : data.user_roles;

      return {
        id: data.id,
        fullName: data.full_name ?? data.email ?? "Unknown",
        displayName: data.display_name,
        email: data.email ?? "",
        avatarUrl: data.avatar_url,
        phone: data.phone,
        timezone: data.timezone,
        role: (roleRow as { role: string } | null)?.role ?? "editor",
        lastSeenAt: data.last_seen_at,
        createdAt: data.created_at,
      };
    },
    enabled: isAuthenticated && !!tenantId && !!userId,
  });
}

/* ------------------------------------------------------------------ */
/* useEditorProfileStats                                               */
/* ------------------------------------------------------------------ */

const COMPLETED_SLUGS = ["approved", "posted"];
const TERMINAL_SLUGS = ["approved", "scheduled", "posted"];
const MONTHLY_GOAL = 40;

export function useEditorProfileStats(userId: string | undefined) {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.teamProfile.editorStats(tenantId!, userId!),
    queryFn: async (): Promise<EditorProfileStats> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const quarterStart = startOfQuarter(now);

      // 1. Get all video IDs assigned to this editor
      const { data: assignments, error: aErr } = await supabase
        .from("video_editors")
        .select("video_id")
        .eq("editor_id", userId!)
        .eq("tenant_id", tenantId!);

      if (aErr) throw aErr;

      const videoIds = [
        ...new Set((assignments ?? []).map((a) => a.video_id).filter(Boolean) as string[]),
      ];

      if (videoIds.length === 0) {
        return {
          videosFinished: 0,
          currentlyEditing: 0,
          monthlyGoal: MONTHLY_GOAL,
          monthCompleted: 0,
          weeklyAverage: 0,
          quarterTotal: 0,
          careerTotal: 0,
          dailyPace: "on_track",
          weeklyTrend: [
            { week: "W1", label: "Week 1", count: 0 },
            { week: "W2", label: "Week 2", count: 0 },
            { week: "W3", label: "Week 3", count: 0 },
            { week: "W4", label: "Week 4", count: 0 },
          ],
          typeDistribution: [],
          assignedVideos: [],
        };
      }

      // 2. Fetch all assigned videos with joins
      const { data: videos, error: vErr } = await supabase
        .from("videos")
        .select(
          `
          id, video_title, updated_at, created_at,
          status:statuses!videos_status_id_fkey(slug, display_name, color),
          video_type:video_types!videos_video_type_id_fkey(slug, display_name),
          client:clients!videos_client_id_fkey(name)
        `,
        )
        .in("id", videoIds)
        .is("archived_at", null)
        .order("updated_at", { ascending: false });

      if (vErr) throw vErr;
      const allVideos = videos ?? [];

      // 3. Compute metrics
      let currentlyEditing = 0;
      let videosFinished = 0;
      let monthCompleted = 0;
      let quarterTotal = 0;

      for (const v of allVideos) {
        const slug = (v.status as { slug: string } | null)?.slug ?? "";
        const isTerminal = TERMINAL_SLUGS.includes(slug);
        const isCompleted = COMPLETED_SLUGS.includes(slug);

        if (!isTerminal) currentlyEditing++;
        if (isCompleted) videosFinished++;

        if (isCompleted) {
          const d = new Date(v.updated_at);
          if (d >= monthStart && d <= monthEnd) monthCompleted++;
          if (d >= quarterStart) quarterTotal++;
        }
      }

      // 4. Weekly average (over 4 weeks)
      const fourWeeksAgo = subWeeks(now, 4);
      const recentCompleted = allVideos.filter((v) => {
        const slug = (v.status as { slug: string } | null)?.slug ?? "";
        return COMPLETED_SLUGS.includes(slug) && new Date(v.updated_at) >= fourWeeksAgo;
      }).length;
      const weeklyAverage = Math.round((recentCompleted / 4) * 10) / 10;

      // 5. Daily pace
      const dayOfMonth = getDate(now);
      const daysInMonth = getDaysInMonth(now);
      const expectedProgress = (dayOfMonth / daysInMonth) * MONTHLY_GOAL;
      let dailyPace: "on_track" | "at_risk" | "behind" = "on_track";
      if (monthCompleted < expectedProgress * 0.7) {
        dailyPace = "behind";
      } else if (monthCompleted < expectedProgress) {
        dailyPace = "at_risk";
      }

      // 6. Weekly trend
      const weeklyTrend = [];
      for (let i = 3; i >= 0; i--) {
        const wStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        const wEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });
        const count = allVideos.filter((v) => {
          const slug = (v.status as { slug: string } | null)?.slug ?? "";
          if (!COMPLETED_SLUGS.includes(slug)) return false;
          const d = new Date(v.updated_at);
          return d >= wStart && d < wEnd;
        }).length;
        weeklyTrend.push({
          week: `W${4 - i}`,
          label: `Week ${4 - i}`,
          count,
        });
      }

      // 7. Type distribution
      const typeMap = new Map<string, { name: string; slug: string; count: number }>();
      for (const v of allVideos) {
        const vt = v.video_type as { slug: string; display_name: string } | null;
        const name = vt?.display_name ?? "Untyped";
        const slug = vt?.slug ?? "untyped";
        const existing = typeMap.get(slug);
        if (existing) {
          existing.count++;
        } else {
          typeMap.set(slug, { name, slug, count: 1 });
        }
      }

      // 8. Assigned videos list
      const assignedVideos = allVideos.map((v) => ({
        id: v.id,
        title: v.video_title ?? "Untitled",
        clientName: (v.client as { name: string } | null)?.name ?? "—",
        statusSlug: (v.status as { slug: string } | null)?.slug ?? "",
        statusName: (v.status as { display_name: string } | null)?.display_name ?? "",
        statusColor: (v.status as { color: string } | null)?.color ?? "#6B7280",
        updatedAt: v.updated_at,
        createdAt: v.created_at,
      }));

      return {
        videosFinished,
        currentlyEditing,
        monthlyGoal: MONTHLY_GOAL,
        monthCompleted,
        weeklyAverage,
        quarterTotal,
        careerTotal: videosFinished,
        dailyPace,
        weeklyTrend,
        typeDistribution: Array.from(typeMap.values()).sort((a, b) => b.count - a.count),
        assignedVideos,
      };
    },
    enabled: isAuthenticated && !!tenantId && !!userId,
    staleTime: 60_000,
  });
}
