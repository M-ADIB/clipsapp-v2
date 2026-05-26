import { createFileRoute } from "@tanstack/react-router";
import { TeamChatPage } from "@/components/dashboards/shared/TeamChatPage";

export const Route = createFileRoute("/_authenticated/content-creator/team-chat")({
  component: TeamChatPage,
});
