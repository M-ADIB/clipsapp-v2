/**
 * TeamMemberProfile — Orchestrator for /{role}/team/:userId profile pages.
 *
 * Fetches profile + role, renders ProfileHeader + role-specific content.
 * This is NOT a top-level route component — the route file wraps this
 * and passes `embedded={false}` since the route IS the top-level.
 *
 * Header Ownership: The ROUTE component calls setHeaderConfig, not this one.
 */

import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  useTeamMemberProfile,
  useEditorProfileStats,
  type EditorProfileStats,
  type TeamMemberProfile as TeamMemberProfileType,
} from "@/hooks/use-team-member-profile";
import { ProfileHeader } from "./ProfileHeader";
import { EditorProfileContent } from "./EditorProfileContent";
import { CloserProfileContent } from "./CloserProfileContent";
import { ManagerProfileContent } from "./ManagerProfileContent";
import { ContentCreatorProfileContent } from "./ContentCreatorProfileContent";

interface TeamMemberProfileProps {
  userId: string;
}

export function TeamMemberProfile({ userId }: TeamMemberProfileProps) {
  const navigate = useNavigate();
  const { role: viewerRole } = useAuth();
  const basePath = viewerRole === "manager" ? "/manager" : "/owner";

  // ── Profile data ──
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useTeamMemberProfile(userId);

  // ── Editor stats (only fetched when user is an editor/senior_editor) ──
  const isEditorRole = profile?.role === "editor" || profile?.role === "senior_editor";
  const { data: editorStats, isLoading: editorStatsLoading } = useEditorProfileStats(
    isEditorRole ? userId : undefined,
  );

  // ── Loading state ──
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error state ──
  if (profileError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12">
        <p className="text-sm text-muted-foreground">
          {profileError ? "Failed to load team member profile" : "Team member not found"}
        </p>
        <button
          onClick={() => navigate({ to: `${basePath}/hq` })}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to HQ
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* ── Back button ── */}
      <button
        onClick={() => navigate({ to: `${basePath}/hq` })}
        className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to HQ
      </button>

      {/* ── Profile header ── */}
      <ProfileHeader
        fullName={profile.fullName}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
        role={profile.role}
        monthCompleted={isEditorRole ? editorStats?.monthCompleted : undefined}
        monthlyGoal={isEditorRole ? editorStats?.monthlyGoal : undefined}
        dailyPace={isEditorRole ? editorStats?.dailyPace : undefined}
      />

      {/* ── Role-specific content ── */}
      <RoleContent
        profile={profile}
        editorStats={editorStats ?? null}
        editorStatsLoading={editorStatsLoading}
      />
    </div>
  );
}

/* ── Role → Content dispatcher ── */
function RoleContent({
  profile,
  editorStats,
  editorStatsLoading,
}: {
  profile: TeamMemberProfileType;
  editorStats: EditorProfileStats | null;
  editorStatsLoading: boolean;
}) {
  switch (profile.role) {
    case "editor":
    case "senior_editor":
      return (
        <EditorProfileContent
          stats={
            editorStats ?? {
              videosFinished: 0,
              currentlyEditing: 0,
              monthlyGoal: 40,
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
            }
          }
          isLoading={editorStatsLoading}
        />
      );

    case "closer":
      return <CloserProfileContent userId={profile.id} fullName={profile.fullName} />;

    case "manager":
    case "owner":
      return <ManagerProfileContent />;

    case "content_creator":
      return <ContentCreatorProfileContent userId={profile.id} />;

    default:
      return (
        <div className="flex items-center justify-center rounded-lg border border-border bg-surface-card p-8">
          <p className="text-sm text-muted-foreground">
            No profile analytics available for this role
          </p>
        </div>
      );
  }
}
