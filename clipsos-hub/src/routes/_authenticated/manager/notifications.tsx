import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/dashboards/shared/NotificationsPage";

export const Route = createFileRoute("/_authenticated/manager/notifications")({
  component: NotificationsPage,
});
