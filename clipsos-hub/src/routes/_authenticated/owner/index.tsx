import { createFileRoute } from "@tanstack/react-router";
import { OwnerDashboard } from "@/components/dashboards/owner/OwnerDashboard";

export const Route = createFileRoute("/_authenticated/owner/")({
  component: OwnerDashboard,
});
