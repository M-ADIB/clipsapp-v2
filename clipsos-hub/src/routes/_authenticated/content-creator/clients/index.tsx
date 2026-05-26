import { createFileRoute } from "@tanstack/react-router";
import { OwnerClientsPage } from "@/components/dashboards/owner/OwnerClientsPage";

export const Route = createFileRoute("/_authenticated/content-creator/clients/")({
  component: OwnerClientsPage,
});
