import { createFileRoute } from "@tanstack/react-router";
import { HQDashboard } from "@/components/dashboards/shared/HQDashboard";

export const Route = createFileRoute("/_authenticated/owner/hq")({
  component: HQDashboard,
});
