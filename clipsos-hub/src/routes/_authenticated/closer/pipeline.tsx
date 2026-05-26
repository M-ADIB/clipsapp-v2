import { createFileRoute } from "@tanstack/react-router";
import { CloserPipelinePage } from "@/components/dashboards/closer/CloserPipelinePage";

export const Route = createFileRoute("/_authenticated/closer/pipeline")({
  component: CloserPipelinePage,
});
