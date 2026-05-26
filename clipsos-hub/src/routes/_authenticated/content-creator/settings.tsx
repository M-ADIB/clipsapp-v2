import { createFileRoute } from "@tanstack/react-router";
import { ContentCreatorSettingsPage } from "@/components/dashboards/content-creator/ContentCreatorSettingsPage";

export const Route = createFileRoute("/_authenticated/content-creator/settings")({
  component: ContentCreatorSettingsPage,
});
