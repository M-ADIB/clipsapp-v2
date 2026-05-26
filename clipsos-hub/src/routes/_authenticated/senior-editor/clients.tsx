import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/senior-editor/clients")({
  component: () => <Outlet />,
});
