/**
 * /manager/team/:userId — Team member profile page (manager view).
 *
 * Header Ownership: This IS the top-level route component.
 * It owns setHeaderConfig() and delegates rendering to TeamMemberProfile.
 */
import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useTeamMemberProfile } from "@/hooks/use-team-member-profile";
import { TeamMemberProfile } from "@/components/dashboards/shared/profile/TeamMemberProfile";

export const Route = createFileRoute("/_authenticated/manager/team/$userId")({
  component: ManagerTeamMemberPage,
});

function ManagerTeamMemberPage() {
  const { userId } = Route.useParams();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { data: profile } = useTeamMemberProfile(userId);

  // Header config — set title to the member's name once loaded
  useEffect(() => {
    setHeaderConfig({
      title: profile?.fullName ?? "Team Member",
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, profile?.fullName]);

  return <TeamMemberProfile userId={userId} />;
}
