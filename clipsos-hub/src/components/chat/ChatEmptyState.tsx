/**
 * ChatEmptyState — shown when no room is selected.
 * Includes prompt to create a new conversation (role-gated).
 */
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatMode } from "./ChatLayout";

/** Only these roles can create new channels / group chats */
const CREATOR_ROLES = ["owner", "manager", "senior_editor"] as const;

interface ChatEmptyStateProps {
  chatMode?: ChatMode;
  onCreateClick?: () => void;
}

export function ChatEmptyState({ chatMode = "client", onCreateClick }: ChatEmptyStateProps) {
  const { role } = useAuth();
  const canCreate = CREATOR_ROLES.includes(role as (typeof CREATOR_ROLES)[number]);
  const isTeam = chatMode === "team";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-foreground-muted">
      <div className="rounded-2xl bg-surface-card p-6">
        <MessageSquare className="h-12 w-12 text-primary/40" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-foreground-strong">
          {isTeam ? "Select a channel" : "Select a conversation"}
        </p>
        <p className="mt-1 text-sm">
          {isTeam
            ? "Choose a team channel from the list or create a new one"
            : "Choose a client workspace from the list or start a new chat"}
        </p>
      </div>
      {canCreate && onCreateClick && (
        <Button
          variant="outline"
          className="mt-2 gap-2 border-primary/30 text-primary hover:bg-primary/10"
          onClick={onCreateClick}
        >
          <Plus className="h-4 w-4" />
          {isTeam ? "New Channel" : "New Conversation"}
        </Button>
      )}
    </div>
  );
}
