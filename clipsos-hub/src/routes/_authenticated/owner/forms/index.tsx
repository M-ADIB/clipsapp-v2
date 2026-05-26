import { createFileRoute } from "@tanstack/react-router";
import { FormListPage } from "@/components/forms/FormListPage";

export const Route = createFileRoute("/_authenticated/owner/forms/")({
  component: FormListPage,
});
