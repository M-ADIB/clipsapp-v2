import { createFileRoute } from "@tanstack/react-router";
import { ProjectsDashboard } from "@/components/dashboards/owner/ProjectsDashboard";

export const Route = createFileRoute("/_authenticated/manager/projects")({
  component: ProjectsDashboard,
});
