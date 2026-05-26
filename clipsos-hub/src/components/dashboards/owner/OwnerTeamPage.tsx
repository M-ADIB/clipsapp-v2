/**
 * OwnerTeamPage — Standalone Team Management page.
 *
 * This is the TOP-LEVEL route component for /owner/team.
 * It sets its own header and renders TeamSettingsPanel as the content.
 *
 * Header Ownership Rule: only this component calls setHeaderConfig().
 */
import { useEffect } from "react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { TeamSettingsPanel } from "./management/TeamSettingsPanel";

export function OwnerTeamPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Team" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  return <TeamSettingsPanel />;
}
