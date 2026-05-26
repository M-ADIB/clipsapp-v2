import { createFileRoute } from "@tanstack/react-router";
import { TemplatesListPage } from "@/components/templates/TemplatesListPage";

export const Route = createFileRoute("/_authenticated/owner/templates/")({
  component: TemplatesListPage,
});
