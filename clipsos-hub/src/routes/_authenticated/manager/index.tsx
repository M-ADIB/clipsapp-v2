import { createFileRoute } from "@tanstack/react-router";
import { ManagerDashboard } from "@/components/dashboards/manager/ManagerDashboard";

export const Route = createFileRoute("/_authenticated/manager/")({
  component: ManagerDashboard,
});
