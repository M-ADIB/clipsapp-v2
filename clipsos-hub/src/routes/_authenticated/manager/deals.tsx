import { createFileRoute } from "@tanstack/react-router";
import { DealsDashboard } from "@/components/dashboards/owner/DealsDashboard";

export const Route = createFileRoute("/_authenticated/manager/deals")({
  component: DealsDashboard,
});
