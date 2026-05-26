import { createFileRoute } from "@tanstack/react-router";
import { PersonProfilePage } from "@/components/crm/profile/PersonProfilePage";

export const Route = createFileRoute("/_authenticated/manager/people/$personSlug")({
  component: () => {
    const { personSlug } = Route.useParams();
    return <PersonProfilePage personSlug={personSlug} />;
  },
});
