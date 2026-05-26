import { createFileRoute } from "@tanstack/react-router";
import { StudioDashboard } from "@/components/dashboards/owner/StudioDashboard";

export const Route = createFileRoute("/_authenticated/content-creator/studio")({
  component: StudioDashboard,
});
