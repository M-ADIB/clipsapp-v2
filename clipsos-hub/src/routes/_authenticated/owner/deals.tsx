import { createFileRoute } from "@tanstack/react-router";
import { DealsDashboard } from "@/components/dashboards/owner/DealsDashboard";

export const Route = createFileRoute("/_authenticated/owner/deals")({
  component: DealsDashboard,
});
