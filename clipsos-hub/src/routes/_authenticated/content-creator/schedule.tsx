import { createFileRoute } from "@tanstack/react-router";
import { ContentCreatorSchedulePage } from "@/components/dashboards/content-creator/ContentCreatorSchedulePage";

export const Route = createFileRoute("/_authenticated/content-creator/schedule")({
  component: ContentCreatorSchedulePage,
});
