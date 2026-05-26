import { createFileRoute } from "@tanstack/react-router";
import { HQDashboard } from "@/components/dashboards/owner/HQDashboard";

export const Route = createFileRoute("/_authenticated/manager/hq")({
  component: HQDashboard,
});
