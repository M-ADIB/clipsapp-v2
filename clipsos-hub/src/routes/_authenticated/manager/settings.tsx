import { createFileRoute } from "@tanstack/react-router";
import { ManagerSettingsPage } from "@/components/dashboards/manager/ManagerSettingsPage";

export const Route = createFileRoute("/_authenticated/manager/settings")({
  component: ManagerSettingsPage,
});
