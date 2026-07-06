import { createFileRoute } from "@tanstack/react-router";
import { DealsDashboard } from "@/components/dashboards/shared/DealsDashboard";

export const Route = createFileRoute("/_authenticated/owner/deals")({
  component: DealsDashboard,
});
