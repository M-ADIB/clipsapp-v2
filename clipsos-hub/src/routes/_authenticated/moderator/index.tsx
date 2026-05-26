import { createFileRoute } from "@tanstack/react-router";
import { ModeratorDashboard } from "@/components/dashboards/moderator/ModeratorDashboard";

export const Route = createFileRoute("/_authenticated/moderator/")({
  component: ModeratorDashboard,
});
