import { createFileRoute } from "@tanstack/react-router";
import { LeadsPage } from "@/components/dashboards/shared/LeadsPage";

export const Route = createFileRoute("/_authenticated/manager/leads")({
  component: LeadsPage,
});
