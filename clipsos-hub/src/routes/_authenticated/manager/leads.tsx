import { createFileRoute } from "@tanstack/react-router";
import { LeadsPage } from "@/components/dashboards/owner/LeadsPage";

export const Route = createFileRoute("/_authenticated/manager/leads")({
  component: LeadsPage,
});
