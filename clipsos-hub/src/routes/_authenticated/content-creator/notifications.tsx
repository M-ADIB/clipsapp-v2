import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/dashboards/shared/NotificationsPage";

export const Route = createFileRoute("/_authenticated/content-creator/notifications")({
  component: NotificationsPage,
});
