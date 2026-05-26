import { createFileRoute } from "@tanstack/react-router";
import { TeamChatPage } from "@/components/dashboards/shared/TeamChatPage";

export const Route = createFileRoute("/_authenticated/senior-editor/team-chat")({
  component: TeamChatPage,
});
