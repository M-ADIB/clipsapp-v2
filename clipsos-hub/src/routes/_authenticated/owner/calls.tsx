import { createFileRoute } from "@tanstack/react-router";
import { OwnerPlaceholderPage } from "@/components/dashboards/owner/OwnerPlaceholderPage";

export const Route = createFileRoute("/_authenticated/owner/calls")({
  component: () => (
    <OwnerPlaceholderPage
      title="Calls"
      description="Call scheduling and tracking — discovery calls, follow-ups, and meetings."
    />
  ),
});
