import { createFileRoute } from "@tanstack/react-router";
import { CloserDashboard } from "@/components/dashboards/closer/CloserDashboard";

export const Route = createFileRoute("/_authenticated/closer/")({
  component: CloserDashboard,
});
