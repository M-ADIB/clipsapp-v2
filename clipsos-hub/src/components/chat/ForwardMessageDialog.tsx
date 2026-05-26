/**
 * ForwardMessageDialog — room picker dialog for forwarding a message.
 *
 * Shows all rooms the user has access to (channels + DMs), grouped by type.
 * On confirm, forwards the message content to the selected room's thread.
 */
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Forward, Search, Loader2, Megaphone, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useChatRooms,
  useChatThread,
  useForwardMessage,
  type ChatRoomWithPreview,
} from "@/hooks/use-chat";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  messageContent: string;
  messageType?: string;
}

export function ForwardMessageDialog({
  open,
  onOpenChange,
  messageId,
  messageContent,
  messageType,
}: ForwardMessageDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const forwardMessage = useForwardMessage();

  // Fetch all rooms (no filter — show both team + client rooms)
  const { data: rooms = [] } = useChatRooms();

  // Get the thread for the selected room
  const { data: thread } = useChatThread(selectedRoomId);

  // Filter rooms by search
  const filteredRooms = useMemo(() => {
    if (!search.trim()) return rooms;
    const q = search.toLowerCase();
    return rooms.filter(
      (r) => r.client_name?.toLowerCase().includes(q) || r.room_name?.toLowerCase().includes(q),
    );
  }, [rooms, search]);

  // Group by type
  const channels = filteredRooms.filter((r) => r.room_type !== "dm");
  const dms = filteredRooms.filter((r) => r.room_type === "dm");

  const handleForward = async () => {
    if (!selectedRoomId || !thread?.id) {
      toast.error("Select a room to forward to");
      return;
    }
    try {
      await forwardMessage.mutateAsync({
        messageId,
        targetThreadId: thread.id,
        originalContent: messageContent,
        originalMessageType: messageType,
      });
      toast.success("Message forwarded");
      onOpenChange(false);
      setSelectedRoomId(null);
      setSearch("");
    } catch {
      toast.error("Failed to forward message");
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="h-5 w-5 text-primary" />
            Forward Message
          </DialogTitle>
          <DialogDescription>Choose a channel or DM to forward this message to.</DialogDescription>
        </DialogHeader>

        {/* Message preview */}
        <div className="rounded-lg border border-border-subtle bg-surface-card/50 p-3">
          <p className="text-xs text-foreground-subtle mb-1">Message:</p>
          <p className="text-sm text-foreground line-clamp-3">{messageContent || "Attachment"}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="pl-9"
          />
        </div>

        {/* Room list */}
        <ScrollArea className="h-64">
          <div className="space-y-1">
            {channels.length > 0 && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle px-2 pt-2">
                  Channels
                </p>
                {channels.map((room) => (
                  <RoomRow
                    key={room.id}
                    room={room}
                    isSelected={selectedRoomId === room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                  />
                ))}
              </>
            )}
            {dms.length > 0 && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle px-2 pt-3">
                  Direct Messages
                </p>
                {dms.map((room) => (
                  <RoomRow
                    key={room.id}
                    room={room}
                    isSelected={selectedRoomId === room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                  />
                ))}
              </>
            )}
            {filteredRooms.length === 0 && (
              <p className="text-center text-sm text-foreground-subtle py-8">No rooms found</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleForward}
            disabled={!selectedRoomId || !thread?.id || forwardMessage.isPending}
          >
            {forwardMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Forward className="h-4 w-4 mr-2" />
            )}
            Forward{selectedRoom ? ` to ${selectedRoom.client_name ?? selectedRoom.room_name}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Room row sub-component ──────────────────────────────────────────────────

function RoomRow({
  room,
  isSelected,
  onClick,
}: {
  room: ChatRoomWithPreview;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isAnnouncement = room.room_name?.toLowerCase() === "announcements";
  const displayName = room.client_name ?? room.room_name ?? "Untitled";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
        isSelected
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-surface-card/80 border border-transparent",
      )}
    >
      {isAnnouncement ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          <Megaphone className="h-4 w-4 text-amber-500" />
        </div>
      ) : (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={room.client_avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {displayName}
      </span>
      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </button>
  );
}
