import { createFileRoute } from "@tanstack/react-router";
import { PersonalSettingsPage } from "@/components/dashboards/shared/PersonalSettingsPage";

export const Route = createFileRoute("/_authenticated/closer/settings")({
  component: PersonalSettingsPage,
});
