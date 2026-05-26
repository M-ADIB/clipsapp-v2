import { createFileRoute } from "@tanstack/react-router";
import { FormBuilderPage } from "@/components/forms/FormBuilderPage";

export const Route = createFileRoute("/_authenticated/owner/forms/$slug/edit")({
  component: FormBuilderPage,
});
