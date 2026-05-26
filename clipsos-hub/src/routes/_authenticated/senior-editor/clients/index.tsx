import { createFileRoute } from "@tanstack/react-router";
import { OwnerClientsPage } from "@/components/dashboards/owner/OwnerClientsPage";

export const Route = createFileRoute("/_authenticated/senior-editor/clients/")({
  component: OwnerClientsPage,
});
