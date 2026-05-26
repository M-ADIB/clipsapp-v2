/**
 * TeamChatPage — internal team chat page (split-pane).
 *
 * Used by: owner, manager, senior-editor, content-creator, closer.
 * Sets header config and renders the ChatLayout in team mode.
 */
import { useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { ChatLayout } from "@/components/chat/ChatLayout";

export function TeamChatPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Team Chat" });
    return () => clearHeaderConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FullBleed>
      <ChatLayout chatMode="team" />
    </FullBleed>
  );
}
