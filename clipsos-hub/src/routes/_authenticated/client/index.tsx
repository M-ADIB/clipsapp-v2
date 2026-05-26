import { createFileRoute } from "@tanstack/react-router";
import { ClientDashboard } from "@/components/dashboards/client/ClientDashboard";

export const Route = createFileRoute("/_authenticated/client/")({
  component: ClientDashboard,
});
