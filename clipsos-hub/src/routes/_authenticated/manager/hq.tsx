import { createFileRoute } from "@tanstack/react-router";
import { HQDashboard } from "@/components/dashboards/shared/HQDashboard";

export const Route = createFileRoute("/_authenticated/manager/hq")({
  component: HQDashboard,
});
