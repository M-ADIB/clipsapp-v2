/**
 * ChatRoomCard — individual room preview in the sidebar list.
 *
 * All room types use initials-based avatars:
 * - Team channels: colored initials circle
 * - Client workspaces: colored initials circle
 * - DMs: user avatar with initials fallback
 * - Announcements: 📢 megaphone icon
 */
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VolumeX, MoreVertical, Volume2, Clock, BellOff, Megaphone } from "lucide-react";
import { useMuteRoom } from "@/hooks/use-chat";
import type { ChatRoomWithPreview, MuteDuration } from "@/hooks/use-chat";
import type { ChatMode } from "./ChatLayout";

interface ChatRoomCardProps {
  room: ChatRoomWithPreview;
  isActive: boolean;
  onClick: () => void;
  chatMode: ChatMode;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ChatRoomCard({ room, isActive, onClick, chatMode }: ChatRoomCardProps) {
  const muteRoom = useMuteRoom();
  const isDM = room.room_type === "dm";
  const isTeamChannel = room.room_type === "team";
  const isWorkspace = room.room_type === "workspace";
  const isAnnouncement = room.room_name?.toLowerCase() === "announcements";

  const handleMute = (duration: MuteDuration) => {
    muteRoom.mutate({ roomId: room.id, duration });
  };

  // Display name formatting
  const displayName = isDM
    ? (room.client_name ?? "Direct Message")
    : (room.client_name ?? "Untitled");

  return (
    <div className="group relative">
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
        className={cn(
          "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all duration-150 cursor-pointer",
          "hover:bg-surface-card/80",
          isActive && "bg-surface-card border border-primary/30 shadow-sm",
          !isActive && "border border-transparent",
        )}
      >
        {/* Icon / Avatar */}
        {isDM ? (
          /* DM: show user avatar */
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={room.client_avatar_url ?? undefined} />
            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
              {getInitials(room.client_name)}
            </AvatarFallback>
          </Avatar>
        ) : isAnnouncement ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Megaphone className="h-5 w-5 text-amber-500" />
          </div>
        ) : (
          /* Channels (team + workspace): initials avatar */
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={room.client_avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(room.client_name)}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm font-medium",
                room.unread_count > 0 ? "text-foreground-strong font-semibold" : "text-foreground",
              )}
            >
              {displayName}
            </span>

            {/* Timestamp + menu — stacked in a shrink-0 column */}
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-xs text-foreground-muted whitespace-nowrap">
                {room.last_message_at ? formatRelativeTime(room.last_message_at) : ""}
              </span>
              {/* 3-dot menu — inline, visible on hover */}
              <div className="w-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded-md p-0.5 text-foreground-subtle hover:text-foreground hover:bg-surface-card transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {room.is_muted ? (
                      <DropdownMenuItem onClick={() => handleMute("unmute")}>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Unmute
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => handleMute("1h")}>
                          <Clock className="mr-2 h-4 w-4" />
                          Mute for 1 hour
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMute("8h")}>
                          <Clock className="mr-2 h-4 w-4" />
                          Mute for 8 hours
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMute("1d")}>
                          <Clock className="mr-2 h-4 w-4" />
                          Mute for 1 day
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleMute("forever")}>
                          <BellOff className="mr-2 h-4 w-4" />
                          Mute until I turn back on
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p
              className={cn(
                "truncate text-xs",
                room.unread_count > 0
                  ? "text-foreground-muted font-medium"
                  : "text-foreground-subtle",
              )}
            >
              {room.last_message
                ? `${room.last_message_sender ? `${room.last_message_sender}: ` : ""}${room.last_message}`
                : isDM
                  ? "Start a conversation"
                  : isAnnouncement
                    ? "Important updates"
                    : isTeamChannel
                      ? "Team conversation"
                      : "No messages yet"}
            </p>

            <div className="flex shrink-0 items-center gap-1.5">
              {room.is_muted && <VolumeX className="h-3 w-3 text-foreground-subtle" />}
              {room.unread_count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-chat-bubble px-1.5 text-[10px] font-bold text-chat-bubble-foreground animate-in fade-in zoom-in-50 duration-200">
                  {room.unread_count > 99 ? "99+" : room.unread_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
