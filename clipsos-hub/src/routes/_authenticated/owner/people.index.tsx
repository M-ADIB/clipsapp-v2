import { createFileRoute } from "@tanstack/react-router";
import { PeopleDashboard } from "@/components/dashboards/owner/PeopleDashboard";

export const Route = createFileRoute("/_authenticated/owner/people/")({
  component: PeopleDashboard,
});
