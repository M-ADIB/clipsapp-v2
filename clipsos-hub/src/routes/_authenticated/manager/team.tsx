import { useEffect } from "react";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { TeamSettingsPanel } from "@/components/dashboards/owner/management/TeamSettingsPanel";

export const Route = createFileRoute("/_authenticated/manager/team")({
  component: ManagerTeamLayout,
});

function ManagerTeamPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Team" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  return <TeamSettingsPanel />;
}

function ManagerTeamLayout() {
  // Check if we're at an exact /manager/team path vs a child like /manager/team/:userId
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isExactTeamPath = pathname === "/manager/team" || pathname === "/manager/team/";

  // If at exact path, show the team settings panel
  if (isExactTeamPath) {
    return <ManagerTeamPage />;
  }

  // Otherwise render child route via Outlet
  return <Outlet />;
}
