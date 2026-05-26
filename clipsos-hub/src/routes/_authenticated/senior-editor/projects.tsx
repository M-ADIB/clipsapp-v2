import { createFileRoute } from "@tanstack/react-router";
import { SeniorEditorProjectsPage } from "@/components/dashboards/senior-editor/SeniorEditorProjectsPage";

export const Route = createFileRoute("/_authenticated/senior-editor/projects")({
  component: SeniorEditorProjectsPage,
});
