/**
 * /owner/team — Team Management page.
 *
 * Standalone page — no longer redirects to settings.
 * Child route /owner/team/$userId is still supported via Outlet.
 */
import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { OwnerTeamPage } from "@/components/dashboards/owner/OwnerTeamPage";

function TeamRouteComponent() {
  const matchRoute = useMatchRoute();
  const isChild = !!matchRoute({ to: "/owner/team/$userId" });

  if (isChild) return <Outlet />;
  return <OwnerTeamPage />;
}

export const Route = createFileRoute("/_authenticated/owner/team")({
  component: TeamRouteComponent,
});
