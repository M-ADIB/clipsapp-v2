import { createFileRoute } from "@tanstack/react-router";
import { ClientWorkspacePage } from "@/components/dashboards/owner/ClientWorkspacePage";

export const Route = createFileRoute("/_authenticated/content-creator/clients/$clientSlug")({
  component: ClientWorkspacePage,
});
