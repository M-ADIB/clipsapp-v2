import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsDashboard } from "@/components/dashboards/shared/analytics/AnalyticsDashboard";

export const Route = createFileRoute("/_authenticated/manager/analytics")({
  component: AnalyticsDashboard,
});
