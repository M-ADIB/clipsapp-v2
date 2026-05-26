import { createFileRoute } from "@tanstack/react-router";
import { FormSubmissionsPage } from "@/components/forms/FormSubmissionsPage";

export const Route = createFileRoute("/_authenticated/manager/forms/$slug/submissions")({
  component: FormSubmissionsPage,
});
