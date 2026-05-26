/**
 * ClientChatPage — client-side single-room chat page.
 *
 * Auto-loads the client's own workspace chat room.
 * No room list — full-screen message area.
 */
import { useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChatRooms } from "@/hooks/use-chat";
import { ChatMessageArea } from "@/components/chat/ChatMessageArea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

export function ClientChatPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { user } = useAuth();
  const { data: rooms, isLoading } = useChatRooms();

  useEffect(() => {
    setHeaderConfig({ title: "Chat" });
    return () => clearHeaderConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client only has access to one room — auto-select it
  const room = rooms?.[0] ?? null;

  if (isLoading) {
    return (
      <FullBleed>
        <div className="h-[calc(100vh-4rem)] rounded-xl border border-border-subtle bg-background overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="border-b border-border-subtle p-4">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex-1 space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-10 w-48 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FullBleed>
    );
  }

  if (!room) {
    return (
      <FullBleed>
        <div className="h-[calc(100vh-4rem)] rounded-xl border border-border-subtle bg-background flex items-center justify-center">
          <div className="text-center text-foreground-muted">
            <div className="rounded-2xl bg-surface-card p-6 mx-auto w-fit mb-4">
              <MessageSquare className="h-10 w-10 text-primary/40" />
            </div>
            <p className="text-sm">Your chat room is being set up</p>
            <p className="text-xs text-foreground-subtle mt-1">
              Please contact your account manager
            </p>
          </div>
        </div>
      </FullBleed>
    );
  }

  return (
    <FullBleed>
      <div className="h-[calc(100vh-4rem)] rounded-xl border border-border-subtle bg-background overflow-hidden">
        <ChatMessageArea room={room} />
      </div>
    </FullBleed>
  );
}
