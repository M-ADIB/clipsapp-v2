/**
 * /owner/finance — Full accounting & finance page.
 */
import { createFileRoute } from "@tanstack/react-router";
import { FinancePage } from "@/components/dashboards/owner/FinancePage";

export const Route = createFileRoute("/_authenticated/owner/finance")({
  component: FinancePage,
});
