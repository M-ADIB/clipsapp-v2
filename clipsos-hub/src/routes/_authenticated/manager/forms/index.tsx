import { createFileRoute } from "@tanstack/react-router";
import { FormListPage } from "@/components/forms/FormListPage";

export const Route = createFileRoute("/_authenticated/manager/forms/")({
  component: FormListPage,
});
