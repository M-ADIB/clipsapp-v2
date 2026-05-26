/**
 * ClientChatsPage — agency-side chat page (split-pane).
 *
 * Used by: owner, manager, senior-editor, content-creator, editor, moderator, closer.
 * Sets header config and renders the ChatLayout in client mode.
 */
import { useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { ChatLayout } from "@/components/chat/ChatLayout";

export function ClientChatsPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Client Chats" });
    return () => clearHeaderConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FullBleed>
      <ChatLayout chatMode="client" />
    </FullBleed>
  );
}
