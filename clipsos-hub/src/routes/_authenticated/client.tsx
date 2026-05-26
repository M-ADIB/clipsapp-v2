import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/client")({
  component: ClientLayout,
});

/**
 * Client layout — renders the child route if one matches,
 * otherwise renders the Client Dashboard as the index.
 */
function ClientLayout() {
  return <Outlet />;
}
