import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/content-creator/clients")({
  component: () => <Outlet />,
});
