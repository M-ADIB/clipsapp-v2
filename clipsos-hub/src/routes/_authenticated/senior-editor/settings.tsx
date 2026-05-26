import { createFileRoute } from "@tanstack/react-router";
import { SeniorEditorSettingsPage } from "@/components/dashboards/senior-editor/SeniorEditorSettingsPage";

export const Route = createFileRoute("/_authenticated/senior-editor/settings")({
  component: SeniorEditorSettingsPage,
});
