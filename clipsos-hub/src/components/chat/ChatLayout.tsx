/**
 * ChatLayout — split-pane container for the chat experience.
 *
 * Accepts a `chatMode` prop:
 *   - 'team'   → only team rooms (# channels)
 *   - 'client' → only workspace/client rooms
 *
 * Both modes show DMs alongside their primary room type.
 *
 * Left panel: room list (fixed 320px width).
 * Right panel: message area or empty state.
 * Mobile: full-screen toggle between list and messages.
 */
import { useState, useCallback, useRef } from "react";
import { useChatRooms } from "@/hooks/use-chat";
import { ChatRoomList } from "./ChatRoomList";
import { ChatMessageArea } from "./ChatMessageArea";
import { ChatEmptyState } from "./ChatEmptyState";
import { CreateChatRoomDialog } from "./CreateChatRoomDialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ChatMode = "team" | "client";

interface ChatLayoutProps {
  chatMode: ChatMode;
  /** Pre-select a room via URL param */
  initialRoomId?: string;
}

export function ChatLayout({ chatMode, initialRoomId }: ChatLayoutProps) {
  const roomType = chatMode === "team" ? "team" : "workspace";
  const { data: rooms, isLoading } = useChatRooms({ roomType });
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId ?? null);
  // Mobile: show message area vs room list
  const [mobileShowMessages, setMobileShowMessages] = useState(false);
  const [emptyCreateOpen, setEmptyCreateOpen] = useState(false);

  const activeRoom = rooms?.find((r) => r.id === activeRoomId) ?? null;

  const handleSelectRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
    setMobileShowMessages(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setMobileShowMessages(false);
  }, []);

  /** Called when user leaves or deletes the active room */
  const handleRoomLeft = useCallback(() => {
    setActiveRoomId(null);
    setMobileShowMessages(false);
  }, []);

  const handleEmptyCreateClick = useCallback(() => {
    setEmptyCreateOpen(true);
  }, []);

  const handleEmptyRoomCreated = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
  }, []);

  return (
    <div className="h-[calc(100vh-65px-3rem)] rounded-xl border border-border-subtle bg-background overflow-hidden">
      {/* Desktop: fixed sidebar + flex content */}
      <div className="hidden md:flex h-full">
        {/* Room list — fixed width sidebar */}
        <div className="w-[320px] shrink-0 border-r border-border-subtle">
          <ChatRoomList
            rooms={rooms ?? []}
            isLoading={isLoading}
            activeRoomId={activeRoomId}
            onSelectRoom={handleSelectRoom}
            chatMode={chatMode}
          />
        </div>

        {/* Message area — fills remaining space */}
        <div className="flex-1 min-w-0">
          {activeRoom ? (
            <ChatMessageArea room={activeRoom} chatMode={chatMode} onRoomLeft={handleRoomLeft} />
          ) : (
            <ChatEmptyState chatMode={chatMode} onCreateClick={handleEmptyCreateClick} />
          )}
        </div>
      </div>

      {/* Mobile: toggle between list and messages */}
      <div className="md:hidden h-full">
        {mobileShowMessages && activeRoom ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToList}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-foreground-strong">
                {activeRoom.client_name ??
                  (activeRoom.room_type === "dm" ? "Direct Message" : "Channel")}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatMessageArea room={activeRoom} chatMode={chatMode} onRoomLeft={handleRoomLeft} />
            </div>
          </div>
        ) : (
          <ChatRoomList
            rooms={rooms ?? []}
            isLoading={isLoading}
            activeRoomId={activeRoomId}
            onSelectRoom={handleSelectRoom}
            chatMode={chatMode}
          />
        )}
      </div>

      {/* Create dialog triggered from empty state */}
      <CreateChatRoomDialog
        open={emptyCreateOpen}
        onOpenChange={setEmptyCreateOpen}
        chatMode={chatMode}
        onRoomCreated={handleEmptyRoomCreated}
      />
    </div>
  );
}
