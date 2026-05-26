/**
 * ChatRoomList — scrollable sidebar of chat rooms with search + filter tabs.
 *
 * Team mode: shows channel-style list with # prefix icons.
 * Client mode: shows avatar-based client list with filter tabs (All/Unread/Unanswered).
 * Both modes: DMs are shown in a separate "Direct Messages" section.
 * Includes "New" button for creating channels and starting DMs.
 */
import { useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatRoomCard } from "./ChatRoomCard";
import { ChatSearchFilter } from "./ChatSearchFilter";
import { CreateChatRoomDialog } from "./CreateChatRoomDialog";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatRoomWithPreview } from "@/hooks/use-chat";
import type { ChatMode } from "./ChatLayout";

/** Only these roles can create new channels / group chats */
const CREATOR_ROLES = ["owner", "manager", "senior_editor"] as const;

type FilterTab = "all" | "unread" | "unanswered";

interface ChatRoomListProps {
  rooms: ChatRoomWithPreview[];
  isLoading: boolean;
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  chatMode: ChatMode;
}

export function ChatRoomList({
  rooms,
  isLoading,
  activeRoomId,
  onSelectRoom,
  chatMode,
}: ChatRoomListProps) {
  const { role } = useAuth();
  const canCreate = CREATOR_ROLES.includes(role as (typeof CREATOR_ROLES)[number]);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  // Split rooms into channels and DMs
  const { channelRooms, dmRooms } = useMemo(() => {
    const channels: ChatRoomWithPreview[] = [];
    const dms: ChatRoomWithPreview[] = [];
    for (const room of rooms) {
      if (room.room_type === "dm") {
        dms.push(room);
      } else {
        channels.push(room);
      }
    }
    return { channelRooms: channels, dmRooms: dms };
  }, [rooms]);

  // Apply search filter
  const searchFilteredChannels = useMemo(() => {
    if (!search) return channelRooms;
    const q = search.toLowerCase();
    return channelRooms.filter((r) => r.client_name?.toLowerCase().includes(q));
  }, [channelRooms, search]);

  const searchFilteredDMs = useMemo(() => {
    if (!search) return dmRooms;
    const q = search.toLowerCase();
    return dmRooms.filter((r) => r.client_name?.toLowerCase().includes(q));
  }, [dmRooms, search]);

  // Apply tab filter (client mode only)
  const filteredChannels = useMemo(() => {
    if (chatMode === "team" || filterTab === "all") return searchFilteredChannels;
    if (filterTab === "unread") return searchFilteredChannels.filter((r) => r.unread_count > 0);
    if (filterTab === "unanswered") {
      return searchFilteredChannels.filter((r) => r.unread_count > 0);
    }
    return searchFilteredChannels;
  }, [searchFilteredChannels, filterTab, chatMode]);

  const filteredDMs = useMemo(() => {
    if (filterTab === "all") return searchFilteredDMs;
    if (filterTab === "unread") return searchFilteredDMs.filter((r) => r.unread_count > 0);
    return searchFilteredDMs;
  }, [searchFilteredDMs, filterTab]);

  // Count badges for tabs
  const unreadCount = useMemo(() => rooms.filter((r) => r.unread_count > 0).length, [rooms]);

  const handleRoomCreated = useCallback(
    (roomId: string) => {
      onSelectRoom(roomId);
    },
    [onSelectRoom],
  );

  const allFilteredRooms = [...filteredChannels, ...filteredDMs];
  const hasResults = allFilteredRooms.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header with search and create button */}
      <div className="shrink-0 border-b border-border-subtle p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <ChatSearchFilter
              onSearch={handleSearch}
              placeholder={chatMode === "team" ? "Search channels…" : "Search conversations…"}
            />
          </div>
          {canCreate && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 border-border-subtle hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
              onClick={() => setCreateDialogOpen(true)}
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter tabs — client mode only */}
        {chatMode === "client" && (
          <div className="flex items-center gap-1">
            {[
              { key: "all" as const, label: `All (${rooms.length})` },
              { key: "unread" as const, label: "Unread" },
              { key: "unanswered" as const, label: `Unanswered (${unreadCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  filterTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-card",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : !hasResults ? (
            <div className="px-4 py-8 text-center text-sm text-foreground-muted">
              {search
                ? "No matching conversations"
                : chatMode === "team"
                  ? "No channels yet"
                  : "No conversations yet"}
            </div>
          ) : (
            <>
              {/* Channels Section */}
              {filteredChannels.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                      {chatMode === "team" ? "Channels" : "Workspaces"}
                    </span>
                  </div>
                  {filteredChannels.map((room) => (
                    <ChatRoomCard
                      key={room.id}
                      room={room}
                      isActive={room.id === activeRoomId}
                      onClick={() => onSelectRoom(room.id)}
                      chatMode={chatMode}
                    />
                  ))}
                </>
              )}

              {/* DMs Section */}
              {filteredDMs.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                      Direct Messages
                    </span>
                  </div>
                  {filteredDMs.map((room) => (
                    <ChatRoomCard
                      key={room.id}
                      room={room}
                      isActive={room.id === activeRoomId}
                      onClick={() => onSelectRoom(room.id)}
                      chatMode={chatMode}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Create Dialog */}
      <CreateChatRoomDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        chatMode={chatMode}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}
