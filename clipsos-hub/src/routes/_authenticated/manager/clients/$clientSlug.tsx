import { createFileRoute } from "@tanstack/react-router";
import { ClientWorkspacePage } from "@/components/dashboards/owner/ClientWorkspacePage";

export const Route = createFileRoute("/_authenticated/manager/clients/$clientSlug")({
  component: ClientWorkspacePage,
});
