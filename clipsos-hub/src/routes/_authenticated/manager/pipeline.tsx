import { createFileRoute } from "@tanstack/react-router";
import { PipelineDashboard } from "@/components/dashboards/owner/PipelineDashboard";

export const Route = createFileRoute("/_authenticated/manager/pipeline")({
  component: PipelineDashboard,
});
