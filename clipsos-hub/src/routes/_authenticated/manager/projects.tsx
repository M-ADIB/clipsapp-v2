import { createFileRoute } from "@tanstack/react-router";
import { ProjectsDashboard } from "@/components/dashboards/shared/ProjectsDashboard";

export const Route = createFileRoute("/_authenticated/manager/projects")({
  component: ProjectsDashboard,
});
