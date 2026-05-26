import { createFileRoute } from "@tanstack/react-router";
import { SalesHub } from "@/components/dashboards/owner/SalesHub";

export const Route = createFileRoute("/_authenticated/manager/sales")({
  component: SalesHub,
});
