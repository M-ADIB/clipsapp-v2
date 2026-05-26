import { createFileRoute } from "@tanstack/react-router";
import { FormBuilderPage } from "@/components/forms/FormBuilderPage";

export const Route = createFileRoute("/_authenticated/manager/forms/new")({
  component: FormBuilderPage,
});
