import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { ScheduleDashboard } from "@/components/dashboards/owner/ScheduleDashboard";

function OwnerSchedulePage() {
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

export const Route = createFileRoute("/_authenticated/owner/schedule")({
  component: OwnerSchedulePage,
});
