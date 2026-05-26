import { createFileRoute } from "@tanstack/react-router";
import { ClientChatsPage } from "@/components/dashboards/shared/ClientChatsPage";

export const Route = createFileRoute("/_authenticated/manager/client-chats")({
  component: ClientChatsPage,
});
