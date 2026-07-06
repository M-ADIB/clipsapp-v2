import { createFileRoute } from "@tanstack/react-router";
import { PeopleDashboard } from "@/components/dashboards/shared/PeopleDashboard";

export const Route = createFileRoute("/_authenticated/owner/people/")({
  component: PeopleDashboard,
});
