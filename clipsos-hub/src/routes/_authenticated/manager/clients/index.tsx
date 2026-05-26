import { createFileRoute } from "@tanstack/react-router";
import { OwnerClientsPage } from "@/components/dashboards/owner/OwnerClientsPage";

export const Route = createFileRoute("/_authenticated/manager/clients/")({
  component: OwnerClientsPage,
});
