import { createFileRoute } from "@tanstack/react-router";
import { ClientChatPage } from "@/components/dashboards/client/ClientChatPage";

export const Route = createFileRoute("/_authenticated/client/chat")({
  component: ClientChatPage,
});
