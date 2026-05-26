import { createFileRoute } from "@tanstack/react-router";
import { TemplateBuilderPage } from "@/components/templates/TemplateBuilderPage";

export const Route = createFileRoute("/_authenticated/owner/templates/new")({
  component: () => <TemplateBuilderPage />,
});
