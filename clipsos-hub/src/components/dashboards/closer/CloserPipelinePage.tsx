/**
 * CloserPipelinePage — Closer's view of the deal pipeline.
 *
 * Reuses the Owner's PipelineDashboard component directly.
 * The closer sees the same pipeline Kanban/table but cannot access
 * finance data (enforced by sidebar nav, not this component).
 *
 * This is the TOP-LEVEL route component, so it owns the header.
 */
import { useEffect } from "react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { PipelineDashboard } from "@/components/dashboards/owner/PipelineDashboard";

export function CloserPipelinePage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Pipeline" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  return <PipelineDashboard />;
}
