import { createFileRoute } from "@tanstack/react-router";
import { CloserCallsPage } from "@/components/dashboards/closer/CloserCallsPage";

export const Route = createFileRoute("/_authenticated/closer/calls")({
  component: CloserCallsPage,
});
