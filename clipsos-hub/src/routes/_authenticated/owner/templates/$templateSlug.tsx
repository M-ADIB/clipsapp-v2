import { createFileRoute } from "@tanstack/react-router";
import { TemplateBuilderPage } from "@/components/templates/TemplateBuilderPage";

export const Route = createFileRoute("/_authenticated/owner/templates/$templateSlug")({
  component: function EditTemplate() {
    const { templateSlug } = Route.useParams();
    return <TemplateBuilderPage templateSlug={templateSlug} />;
  },
});
