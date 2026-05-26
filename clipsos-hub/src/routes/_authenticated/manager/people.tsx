import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/manager/people")({
  component: () => <Outlet />,
});
