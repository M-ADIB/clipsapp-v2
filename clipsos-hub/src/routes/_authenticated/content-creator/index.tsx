import { createFileRoute } from "@tanstack/react-router";
import { ContentCreatorDashboard } from "@/components/dashboards/content-creator/ContentCreatorDashboard";

export const Route = createFileRoute("/_authenticated/content-creator/")({
  component: ContentCreatorDashboard,
});
