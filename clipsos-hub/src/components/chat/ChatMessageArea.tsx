/**
 * ChatMessageArea — right panel: header + scrollable messages + input.
 *
 * Supports both team channel and client chat modes with
 * appropriate header styling, mute controls, reply support,
 * and room settings access.
 */
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Megaphone,
  Search,
  VolumeX,
  Volume2,
  MoreVertical,
  Clock,
  BellOff,
  Settings,
  X,
  Reply,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import {
  useChatMessages,
  useChatThread,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useReactToMessage,
  useMarkAsRead,
  useMuteRoom,
  useUploadChatAttachment,
  usePinnedMessages,
  usePinMessage,
  useUnpinMessage,
  useForwardMessage,
} from "@/hooks/use-chat";
import type { MuteDuration } from "@/hooks/use-chat";
import {
  useChatRealtimeMessages,
  useChatRealtimeReactions,
  useChatTyping,
} from "@/hooks/use-chat-realtime";
import { ChatMessage } from "./ChatMessage";
import type { ReplyToData } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { ChatRoomSettingsSheet } from "./ChatRoomSettingsSheet";
import { PinnedMessagesBar } from "./PinnedMessagesBar";
import { ForwardMessageDialog } from "./ForwardMessageDialog";
import { cn } from "@/lib/utils";
import type { ChatRoomWithPreview } from "@/hooks/use-chat";
import type { ChatMode } from "./ChatLayout";

interface ChatMessageAreaProps {
  room: ChatRoomWithPreview;
  chatMode?: ChatMode;
  /** Called when user leaves/deletes the room — parent should deselect the room */
  onRoomLeft?: () => void;
}

/** State for the reply preview banner above the input */
interface ReplyState {
  messageId: string;
  senderName: string | null;
  content: string | null;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.toDateString() === db.toDateString();
}

function formatDateSeparator(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function ChatMessageArea({ room, chatMode = "client", onRoomLeft }: ChatMessageAreaProps) {
  const { user, role } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyState | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [forwardState, setForwardState] = useState<{
    messageId: string;
    content: string;
    messageType: string;
  } | null>(null);

  // Escape key dismisses reply-to preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && replyTo) {
        e.preventDefault();
        setReplyTo(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [replyTo]);

  const isTeam = chatMode === "team";
  const isAnnouncement = room.room_name?.toLowerCase() === "announcements";

  // Get the thread for this room
  const { data: thread } = useChatThread(room.id);
  const threadId = room.thread_id ?? thread?.id ?? null;

  // Messages
  const {
    data: messagesData,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useChatMessages(threadId);

  // Realtime
  useChatRealtimeMessages(threadId);
  useChatRealtimeReactions(threadId);
  const { setTyping } = useChatTyping(room.id);

  // Mutations
  const sendMessage = useSendMessage();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const reactToMessage = useReactToMessage();
  const markAsRead = useMarkAsRead();
  const muteRoom = useMuteRoom();
  const uploadAttachment = useUploadChatAttachment();

  // Pinning
  const { data: pinnedMessages = [] } = usePinnedMessages(room.id);
  const pinMessage = usePinMessage();
  const unpinMessage = useUnpinMessage();
  const pinnedMessageIds = useMemo(
    () => new Set(pinnedMessages.map((p) => p.message_id)),
    [pinnedMessages],
  );
  const canPin = ["owner", "manager", "senior_editor"].includes(role ?? "");

  // Flatten pages (messages come newest-first, reverse for display)
  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    const flat = messagesData.pages.flatMap((p) => p);
    const reversed = [...flat].reverse();
    // Apply search filter if active
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return reversed.filter((msg) => msg.content?.toLowerCase().includes(q));
    }
    return reversed;
  }, [messagesData, searchQuery]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Mark as read when opening
  useEffect(() => {
    if (threadId) {
      markAsRead.mutate(threadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const handleSend = useCallback(
    async (content: string, attachment?: File, mentionedUserIds?: string[]) => {
      if (!threadId) return;

      let attachmentUrl: string | undefined;
      let attachmentType: string | undefined;

      if (attachment) {
        const result = await uploadAttachment.mutateAsync(attachment);
        attachmentUrl = result.url;
        attachmentType = result.type;
      }

      sendMessage.mutate({
        thread_id: threadId,
        content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachment?.name,
        reply_to_message_id: replyTo?.messageId,
        mentioned_user_ids: mentionedUserIds,
      });

      // Clear reply state after send
      setReplyTo(null);
    },
    [threadId, sendMessage, uploadAttachment, replyTo],
  );

  const handleReact = useCallback(
    (messageId: string, emoji: string) => {
      reactToMessage.mutate({ messageId, emoji });
    },
    [reactToMessage],
  );

  const handleDelete = useCallback(
    (messageId: string) => {
      deleteMessage.mutate(messageId);
    },
    [deleteMessage],
  );

  const handleTyping = useCallback(() => {
    setTyping(true);
  }, [setTyping]);

  const handleSendVoiceNote = useCallback(
    (url: string, type: string, name: string) => {
      if (!threadId) return;
      sendMessage.mutate({
        thread_id: threadId,
        content: "🎤 Voice note",
        message_type: "voice",
        attachment_url: url,
        attachment_type: type,
        attachment_name: name,
      });
    },
    [threadId, sendMessage],
  );

  const handleMute = useCallback(
    (duration: MuteDuration) => {
      muteRoom.mutate({ roomId: room.id, duration });
    },
    [muteRoom, room.id],
  );

  const handleReply = useCallback(
    (messageId: string, senderName: string | null, content: string | null) => {
      setReplyTo({ messageId, senderName, content });
    },
    [],
  );

  const handleCopyMessage = useCallback((content: string | null) => {
    if (content) navigator.clipboard.writeText(content);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-3">
          {room.room_type === "dm" ? (
            /* DM: show avatar with online indicator */
            <div className="relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                {(room.client_name ?? "?")
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-status-success border-2 border-background" />
            </div>
          ) : isAnnouncement ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10">
              <Megaphone className="h-4 w-4 text-amber-500" />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {(room.client_name ?? "?")
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-foreground-strong">
              {room.client_name ?? (room.room_type === "dm" ? "Direct Message" : "Channel")}
            </h2>
            {room.room_type !== "dm" && (
              <p className="text-[11px] text-foreground-subtle">
                {isAnnouncement
                  ? "Important updates & announcements"
                  : isTeam
                    ? "Team channel"
                    : "Client workspace channel"}
              </p>
            )}
            {room.room_type === "dm" && (
              <p className="text-[11px] text-foreground-subtle">Direct message</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground-muted hover:text-foreground"
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery("");
            }}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Header dropdown — mute, settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground-muted hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {/* Room settings */}
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Room settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Mute options */}
              {room.is_muted ? (
                <DropdownMenuItem onClick={() => handleMute("unmute")}>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Unmute notifications
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
              {room.is_muted && (
                <div className="px-2 py-1">
                  <p className="text-[11px] text-foreground-subtle flex items-center gap-1">
                    <VolumeX className="h-3 w-3" /> Currently muted
                  </p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Inline search bar */}
      {showSearch && (
        <div className="shrink-0 border-b border-border-subtle px-4 py-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            className="h-8 text-sm bg-surface-input border-border-subtle"
            autoFocus
          />
        </div>
      )}

      {/* Pinned messages bar */}
      <PinnedMessagesBar
        pinnedMessages={pinnedMessages}
        onUnpin={(messageId) => unpinMessage.mutate({ messageId, roomId: room.id })}
        isUnpinning={unpinMessage.isPending}
      />

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col py-4">
          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-xs text-foreground-muted"
              >
                {isFetchingNextPage ? "Loading…" : "Load older messages"}
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4 px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-48 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-foreground-muted">
              {searchQuery ? (
                <>
                  <p className="text-sm">No messages matching &quot;{searchQuery}&quot;</p>
                  <p className="mt-1 text-xs text-foreground-subtle">Try a different search term</p>
                </>
              ) : (
                <>
                  <p className="text-sm">No messages yet</p>
                  <p className="mt-1 text-xs text-foreground-subtle">
                    {room.room_type === "dm"
                      ? `Say hello to ${room.client_name ?? "this person"} 👋`
                      : isTeam
                        ? `Send the first message in ${room.client_name ?? "this channel"}`
                        : "Send the first message to start the conversation"}
                  </p>
                </>
              )}
            </div>
          ) : (
            messages.map((msg, idx) => {
              const prev = idx > 0 ? messages[idx - 1] : null;
              const senderId = (msg.sender as unknown as { id: string } | null)?.id;
              const prevSenderId = prev
                ? (prev.sender as unknown as { id: string } | null)?.id
                : null;
              const showSender =
                !prev || senderId !== prevSenderId || !isSameDay(prev.created_at, msg.created_at);

              // Date separator
              const showDateSep = !prev || !isSameDay(prev.created_at, msg.created_at);

              const senderData = msg.sender as unknown as {
                id: string;
                full_name: string | null;
                avatar_url: string | null;
              } | null;

              const reactionData =
                (msg.reactions as unknown as
                  | {
                      id: string;
                      emoji: string;
                      user_id: string;
                    }[]
                  | null) ?? [];

              // Parse reply_to data from the joined relation
              const rawReply = (msg as Record<string, unknown>).reply_to as
                | { id: string; content: string | null; sender_id: string | null }
                | null
                | undefined;

              // Resolve sender name for the replied-to message
              let resolvedReplyTo: ReplyToData | undefined;
              if (rawReply) {
                // Try to find the sender name from our loaded messages
                const replySender = messages.find(
                  (m) => (m.sender as unknown as { id: string } | null)?.id === rawReply.sender_id,
                );
                const replySenderName =
                  (replySender?.sender as unknown as { full_name: string | null } | null)
                    ?.full_name ?? null;
                resolvedReplyTo = {
                  id: rawReply.id,
                  content: rawReply.content,
                  sender: { full_name: replySenderName },
                };
              }

              return (
                <div key={msg.id}>
                  {showDateSep && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="h-px flex-1 bg-border-subtle" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-foreground-subtle">
                        {formatDateSeparator(msg.created_at)}
                      </span>
                      <div className="h-px flex-1 bg-border-subtle" />
                    </div>
                  )}
                  <ChatMessage
                    id={msg.id}
                    content={msg.content}
                    created_at={msg.created_at}
                    is_edited={msg.is_edited}
                    is_deleted={msg.is_deleted}
                    message_type={msg.message_type}
                    attachments={msg.attachments}
                    sender={senderData}
                    reactions={reactionData}
                    isOwn={senderId === user?.id}
                    currentUserId={user?.id ?? ""}
                    showSender={showSender}
                    chatMode={chatMode}
                    replyTo={resolvedReplyTo}
                    onEdit={(messageId) => {
                      const newContent = window.prompt("Edit message:", msg.content ?? "");
                      if (newContent !== null && newContent.trim()) {
                        editMessage.mutate({ messageId, content: newContent.trim() });
                      }
                    }}
                    onDelete={handleDelete}
                    onReact={handleReact}
                    onCopy={handleCopyMessage}
                    onReply={handleReply}
                    onForward={(messageId, content, messageType) =>
                      setForwardState({
                        messageId,
                        content: content ?? "",
                        messageType: messageType ?? "text",
                      })
                    }
                    onPin={(messageId) => pinMessage.mutate({ messageId, roomId: room.id })}
                    onUnpin={(messageId) => unpinMessage.mutate({ messageId, roomId: room.id })}
                    isPinned={pinnedMessageIds.has(msg.id)}
                    is_forwarded={msg.is_forwarded}
                    canPin={canPin}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Typing indicator */}
        <ChatTypingIndicator names={[]} />
      </ScrollArea>

      {/* Reply preview banner */}
      {replyTo && (
        <div className="flex items-center gap-3 border-t border-border-subtle bg-surface-card/60 px-4 py-2">
          <Reply className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-primary">
              Replying to {replyTo.senderName ?? "Unknown"}
            </span>
            <p className="truncate text-xs text-foreground-subtle">
              {replyTo.content || "Attachment"}
            </p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="rounded-md p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-input transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onSendVoiceNote={handleSendVoiceNote}
        onTyping={handleTyping}
        disabled={!threadId}
      />

      {/* Room Settings Sheet */}
      <ChatRoomSettingsSheet
        room={room}
        chatMode={chatMode}
        open={showSettings}
        onOpenChange={setShowSettings}
        onRoomLeft={onRoomLeft}
      />

      {/* Forward dialog */}
      {forwardState && (
        <ForwardMessageDialog
          open={!!forwardState}
          onOpenChange={(open) => {
            if (!open) setForwardState(null);
          }}
          messageId={forwardState.messageId}
          messageContent={forwardState.content}
          messageType={forwardState.messageType}
        />
      )}
    </div>
  );
}
