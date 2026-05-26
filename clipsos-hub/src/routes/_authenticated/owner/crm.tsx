import { createFileRoute } from "@tanstack/react-router";
import { OwnerCrmPage } from "@/components/dashboards/owner/OwnerCrmPage";

export const Route = createFileRoute("/_authenticated/owner/crm")({
  component: OwnerCrmPage,
});
