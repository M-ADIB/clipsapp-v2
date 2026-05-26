/**
 * ManagerSettingsPage — Manager > Settings
 *
 * Managers only see the Team tab — no App Branding, Billing, or Integrations.
 * This is a simplified version of OwnerSettingsPage.
 */
import { useEffect } from "react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { TeamSettingsPanel } from "@/components/dashboards/owner/management/TeamSettingsPanel";

export function ManagerSettingsPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Settings" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  return <TeamSettingsPanel />;
}
