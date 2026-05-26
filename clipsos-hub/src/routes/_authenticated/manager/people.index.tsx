import { createFileRoute } from "@tanstack/react-router";
import { PeopleDashboard } from "@/components/dashboards/owner/PeopleDashboard";

export const Route = createFileRoute("/_authenticated/manager/people/")({
  component: PeopleDashboard,
});
