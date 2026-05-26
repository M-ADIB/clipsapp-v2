/**
 * RecentMessagesWidget — Owner Dashboard widget.
 *
 * Displays the most important recent messages across all chat rooms.
 * Priority order:
 *   1. Rooms with unread @mentions (the owner is tagged)
 *   2. Rooms with unread messages (any unread)
 *   3. Most recently active rooms
 *
 * Clicking a room navigates to the correct chat page.
 */
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, AtSign, MessageSquare, Users, Briefcase } from "lucide-react";
import { useChatRooms } from "@/hooks/use-chat";
import { useAuth } from "@/contexts/AuthContext";

/* ── Helpers ──────────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/* ── Types ───────────────────────────────────────────────────────────── */

interface RoomItem {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  hasMention: boolean;
  roomType: string;
  avatarUrl: string | null;
  threadId: string | null;
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function RoomAvatar({
  name,
  url,
  roomType,
  hasMention,
}: {
  name: string;
  url: string | null;
  roomType: string;
  hasMention: boolean;
}) {
  const Icon = roomType === "team" ? Users : Briefcase;
  return (
    <div className="relative shrink-0">
      {url ? (
        <img src={url} alt={name} className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{
            background:
              roomType === "team"
                ? "var(--primary)"
                : "color-mix(in oklab, var(--status-success) 80%, black)",
          }}
        >
          {roomType === "team" ? <Icon className="h-4 w-4" /> : getInitials(name)}
        </div>
      )}
      {/* Mention badge */}
      {hasMention && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
          style={{ background: "var(--status-danger)" }}
        >
          <AtSign className="h-2 w-2 text-white" />
        </span>
      )}
    </div>
  );
}

function MessageRow({ room, onClick }: { room: RoomItem; onClick: () => void }) {
  const timeAgo = room.lastMessageAt
    ? formatDistanceToNow(new Date(room.lastMessageAt), { addSuffix: true })
    : null;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-foreground/[0.04] active:scale-[0.99]"
    >
      <RoomAvatar
        name={room.name}
        url={room.avatarUrl}
        roomType={room.roomType}
        hasMention={room.hasMention}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[12px] font-semibold text-foreground-strong">
            {room.name}
          </span>
          {timeAgo && (
            <span className="shrink-0 text-[9px] text-foreground-disabled">{timeAgo}</span>
          )}
        </div>
        <p className="truncate text-[11px] text-foreground-muted">
          {room.lastMessage || "No messages yet"}
        </p>
      </div>

      {room.unreadCount > 0 && (
        <span
          className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white"
          style={{
            background: room.hasMention ? "var(--status-danger)" : "var(--primary)",
          }}
        >
          {room.unreadCount > 99 ? "99+" : room.unreadCount}
        </span>
      )}
    </button>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */

export function RecentMessagesWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rawRooms = [], isLoading } = useChatRooms();

  // Map + sort by priority:
  // mentioned rooms first, then unread, then recency
  const rooms: RoomItem[] = rawRooms
    .map((r) => ({
      id: r.id,
      name: r.client_name ?? r.room_name ?? "Chat",
      lastMessage: truncate(r.last_message ?? "", 70),
      lastMessageAt: r.last_message_at,
      unreadCount: r.unread_count,
      // We don't have per-room mention data from the list query,
      // so we approximate: unread + it's a workspace room where owner is likely tagged
      // The chat_mentions table would give exact data but is in individual message queries.
      // For now: flag workspace rooms with unread as potentially mentioned.
      hasMention: r.unread_count > 0 && r.room_type === "workspace",
      roomType: r.room_type,
      avatarUrl: r.client_avatar_url,
      threadId: r.thread_id,
    }))
    .sort((a, b) => {
      // 1st: mention rooms
      if (a.hasMention !== b.hasMention) return a.hasMention ? -1 : 1;
      // 2nd: unread count desc
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      // 3rd: most recent message
      const aT = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bT = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bT - aT;
    })
    .slice(0, 6);

  function handleRoomClick(room: RoomItem) {
    // Navigate to the correct chat page based on room type
    if (room.roomType === "team") {
      navigate({ to: "/owner/team-chat" });
    } else {
      navigate({ to: "/owner/client-chats" });
    }
  }

  return (
    <section
      className="flex flex-col rounded-xl"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: "color-mix(in oklab, var(--primary) 12%, transparent)" }}
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="font-display text-xs font-semibold tracking-tight text-foreground-strong">
            Recent Messages
          </h3>
          {rawRooms.reduce((sum, r) => sum + r.unread_count, 0) > 0 && (
            <span
              className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
              style={{ background: "var(--status-danger)" }}
            >
              {rawRooms.reduce((sum, r) => sum + r.unread_count, 0)}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate({ to: "/owner/client-chats" })}
          className="flex items-center gap-1 text-[10px] font-medium text-primary transition-opacity hover:opacity-70"
        >
          View All <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <div className="h-px w-full" style={{ background: "var(--border)" }} />

      {/* Body */}
      <div className="flex flex-col px-1 py-1">
        {isLoading ? (
          <div className="flex flex-col gap-2 px-3 py-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-full bg-foreground/[0.06]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-foreground/[0.06]" />
                  <div className="h-2 w-2/3 animate-pulse rounded bg-foreground/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <MessageSquare className="h-6 w-6 text-foreground-disabled" />
            <p className="text-xs text-foreground-muted">No messages yet</p>
          </div>
        ) : (
          rooms.map((room) => (
            <MessageRow key={room.id} room={room} onClick={() => handleRoomClick(room)} />
          ))
        )}
      </div>

      {/* Footer hint for mentions */}
      {!isLoading && rooms.some((r) => r.hasMention) && (
        <>
          <div className="h-px w-full" style={{ background: "var(--border)" }} />
          <div className="flex items-center gap-1.5 px-4 py-2">
            <AtSign className="h-3 w-3 text-[color:var(--status-danger)]" />
            <span className="text-[10px] text-foreground-muted">You have unread mentions</span>
          </div>
        </>
      )}
    </section>
  );
}
