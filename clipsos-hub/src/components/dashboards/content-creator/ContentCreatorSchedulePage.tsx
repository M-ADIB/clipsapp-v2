/**
 * ContentCreatorSchedulePage — Content creator's schedule view.
 *
 * Reuses the ScheduleDashboard with `mode="live"` to pull
 * real Calendly events from the database.
 *
 * This is the TOP-LEVEL route component, so it owns the header.
 */
import { useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { ScheduleDashboard } from "@/components/dashboards/shared/ScheduleDashboard";

export function ContentCreatorSchedulePage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Schedule" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  return (
    <FullBleed>
      <ScheduleDashboard mode="live" />
    </FullBleed>
  );
}
