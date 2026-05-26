/**
 * ChatMessage — individual message bubble with reactions, actions, voice/file support.
 *
 * Features:
 *  - AGENCY badge for team members in client chats
 *  - Message context menu (Copy, Edit, Delete, Reply)
 *  - Emoji reactions with picker
 *  - Voice note player with waveform
 *  - File/image attachment display
 *  - Reply-to quote preview
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  Play,
  Pause,
  Mic,
  FileIcon,
  Download,
  Copy,
  Reply,
  Forward,
  Pin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatReactionPills, ChatReactionPicker } from "./ChatReactionBar";
import { MentionRenderer } from "@/components/mentions";
import type { ChatMode } from "./ChatLayout";

interface MessageSender {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface Attachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
}

/** The replied-to message data joined from the DB. */
export interface ReplyToData {
  id: string;
  content: string | null;
  sender: { full_name: string | null } | null;
}

interface ChatMessageProps {
  id: string;
  content: string | null;
  created_at: string;
  is_edited: boolean | null;
  is_deleted: boolean | null;
  message_type: string | null;
  attachments?: unknown;
  sender: MessageSender | null;
  reactions: Reaction[];
  isOwn: boolean;
  currentUserId: string;
  showSender: boolean;
  chatMode?: ChatMode;
  /** Replied-to message data (joined from DB) */
  replyTo?: ReplyToData | null;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onCopy?: (content: string | null) => void;
  onReply?: (messageId: string, senderName: string | null, content: string | null) => void;
  onForward?: (messageId: string, content: string | null, messageType: string | null) => void;
  onPin?: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
  isPinned?: boolean;
  is_forwarded?: boolean | null;
  canPin?: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Voice Note Player ─────────────────────────────────────────────────────
function VoiceNotePlayer({ url, isOwn }: { url: string; isOwn: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [url]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
          isOwn
            ? "bg-chat-bubble-foreground/20 hover:bg-chat-bubble-foreground/30 text-chat-bubble-foreground"
            : "bg-primary/10 hover:bg-primary/20 text-primary",
        )}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>

      {/* Waveform / progress */}
      <div className="flex-1 space-y-1">
        <div className="relative h-2 rounded-full overflow-hidden bg-black/10">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all",
              isOwn ? "bg-chat-bubble-foreground/60" : "bg-primary/60",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span
            className={cn(
              "text-[10px] tabular-nums",
              isOwn ? "text-chat-bubble-foreground/70" : "text-foreground-subtle",
            )}
          >
            {formatDuration(currentTime)}
          </span>
          <span
            className={cn(
              "text-[10px] tabular-nums",
              isOwn ? "text-chat-bubble-foreground/70" : "text-foreground-subtle",
            )}
          >
            {duration > 0 ? formatDuration(duration) : "—"}
          </span>
        </div>
      </div>

      {/* Mic icon */}
      <Mic
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          isOwn ? "text-chat-bubble-foreground/50" : "text-foreground-subtle/50",
        )}
      />
    </div>
  );
}

// ── File Attachment Display ─────────────────────────────────────────────────
function FileAttachmentChip({ attachment, isOwn }: { attachment: Attachment; isOwn: boolean }) {
  const isImage = attachment.file_type?.startsWith("image/");

  if (isImage) {
    return (
      <a
        href={attachment.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-1 max-w-[280px] overflow-hidden rounded-lg"
      >
        <img
          src={attachment.file_url}
          alt={attachment.file_name}
          className="w-full h-auto rounded-lg"
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 mt-1.5 rounded-lg px-3 py-2 transition-colors text-xs",
        isOwn
          ? "bg-chat-bubble-foreground/10 hover:bg-chat-bubble-foreground/20 text-chat-bubble-foreground"
          : "bg-surface-input hover:bg-surface-input/80 text-foreground",
      )}
    >
      <FileIcon className="h-4 w-4 shrink-0" />
      <span className="truncate flex-1">{attachment.file_name}</span>
      {attachment.file_size && (
        <span className="shrink-0 opacity-60">{formatFileSize(attachment.file_size)}</span>
      )}
      <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </a>
  );
}

// ── Reply Quote Preview ─────────────────────────────────────────────────────
function ReplyQuote({ replyTo, isOwn }: { replyTo: ReplyToData; isOwn: boolean }) {
  const senderName = replyTo.sender?.full_name ?? "Unknown";
  const previewText = replyTo.content
    ? replyTo.content.length > 80
      ? replyTo.content.slice(0, 80) + "…"
      : replyTo.content
    : "Attachment";

  return (
    <div
      className={cn(
        "flex items-start gap-2 mb-1.5 rounded-lg px-3 py-1.5 text-[11px] border-l-2",
        isOwn
          ? "bg-chat-bubble-foreground/10 border-chat-bubble-foreground/40 text-chat-bubble-foreground/80"
          : "bg-surface-input/60 border-primary/40 text-foreground-subtle",
      )}
    >
      <Reply className="h-3 w-3 shrink-0 mt-0.5 rotate-180" />
      <div className="min-w-0">
        <span className="font-semibold block">{senderName}</span>
        <span className="truncate block">{previewText}</span>
      </div>
    </div>
  );
}

export function ChatMessage({
  id,
  content,
  created_at,
  is_edited,
  is_deleted,
  message_type,
  attachments: rawAttachments,
  sender,
  reactions,
  isOwn,
  currentUserId,
  showSender,
  chatMode = "client",
  replyTo,
  onEdit,
  onDelete,
  onReact,
  onCopy,
  onReply,
  onForward,
  onPin,
  onUnpin,
  isPinned,
  is_forwarded,
  canPin,
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);

  // Parse attachments safely
  const attachments = (Array.isArray(rawAttachments) ? rawAttachments : []) as Attachment[];
  const isVoice = message_type === "voice";
  const voiceAttachment = isVoice ? attachments[0] : null;

  // In client chats, non-own senders are agency team members → show AGENCY badge
  const showAgencyBadge = chatMode === "client" && !isOwn;

  if (is_deleted) {
    return (
      <div className={cn("flex gap-3 px-4 py-1", isOwn && "flex-row-reverse")}>
        <div className="w-8" />
        <div className="rounded-xl bg-surface-card/50 px-4 py-2 text-xs italic text-foreground-subtle">
          This message was deleted
        </div>
      </div>
    );
  }

  const initials =
    sender?.full_name
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "?";

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-1 transition-colors hover:bg-surface-card/30",
        isOwn && "flex-row-reverse",
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showSender ? (
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarImage src={sender?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      {/* Bubble */}
      <div className={cn("max-w-[70%] min-w-0", isOwn && "items-end")}>
        {/* Sender name + badges + time */}
        {showSender && (
          <div className={cn("flex items-center gap-2 mb-0.5", isOwn && "flex-row-reverse")}>
            <span className="text-xs font-medium text-foreground-strong">
              {sender?.full_name ?? "Unknown"}
            </span>

            {/* AGENCY badge for team members in client chats */}
            {showAgencyBadge && (
              <span className="inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                Agency
              </span>
            )}

            <span
              className="text-[10px] text-foreground-subtle"
              title={new Date(created_at).toLocaleString()}
            >
              {formatTime(created_at)}
            </span>
          </div>
        )}

        <div className="relative">
          <div
            className={cn(
              "rounded-2xl px-4 py-2 text-sm leading-relaxed",
              isOwn
                ? "bg-chat-bubble text-chat-bubble-foreground rounded-tr-md"
                : "bg-surface-card text-foreground rounded-tl-md",
            )}
          >
            {/* Reply-to quote */}
            {replyTo && <ReplyQuote replyTo={replyTo} isOwn={isOwn} />}

            {/* Forwarded indicator */}
            {is_forwarded && (
              <span
                className={cn(
                  "flex items-center gap-1 text-[10px] mb-1",
                  isOwn ? "text-chat-bubble-foreground/60" : "text-foreground-subtle",
                )}
              >
                <Forward className="h-3 w-3" />
                Forwarded
              </span>
            )}

            {/* Voice note player */}
            {isVoice && voiceAttachment ? (
              <VoiceNotePlayer url={voiceAttachment.file_url} isOwn={isOwn} />
            ) : (
              <>
                {content && (
                  <p className="whitespace-pre-wrap break-words">
                    <MentionRenderer text={content} isOwn={isOwn} />
                  </p>
                )}
                {/* File attachments */}
                {attachments.length > 0 && (
                  <div className="space-y-1">
                    {attachments.map((att) => (
                      <FileAttachmentChip key={att.id} attachment={att} isOwn={isOwn} />
                    ))}
                  </div>
                )}
              </>
            )}
            {is_edited && (
              <span
                className={cn(
                  "text-[10px] mt-0.5 block",
                  isOwn ? "text-chat-bubble-foreground/60" : "text-foreground-subtle",
                )}
              >
                (edited)
              </span>
            )}
            {isPinned && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[10px] mt-0.5",
                  isOwn ? "text-amber-300/80" : "text-amber-500/80",
                )}
              >
                <Pin className="h-2.5 w-2.5" />
                Pinned
              </span>
            )}
          </div>

          {/* Timestamp for non-header messages */}
          {!showSender && (
            <span
              className={cn(
                "text-[10px] text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2",
                isOwn ? "-left-14" : "-right-14",
              )}
              title={new Date(created_at).toLocaleString()}
            >
              {formatTime(created_at)}
            </span>
          )}

          {/* Action bar (hover) */}
          {showActions && (
            <div
              className={cn(
                "absolute -top-3 flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-card px-1 py-0.5 shadow-lg",
                "animate-in fade-in zoom-in-90 duration-100",
                isOwn ? "left-0" : "right-0",
              )}
            >
              {onReact && <ChatReactionPicker onReact={(emoji) => onReact(id, emoji)} />}

              {/* Reply — available on ALL messages */}
              {onReply && (
                <button
                  onClick={() => onReply(id, sender?.full_name ?? null, content)}
                  className="rounded-md p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-input transition-colors"
                  title="Reply"
                  aria-label="Reply to message"
                >
                  <Reply className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Copy */}
              {onCopy && content && (
                <button
                  onClick={() => onCopy(content)}
                  className="rounded-md p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-input transition-colors"
                  title="Copy text"
                  aria-label="Copy message text"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}

              {isOwn && onEdit && !isVoice && (
                <button
                  onClick={() => onEdit(id)}
                  className="rounded-md p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-input transition-colors"
                  title="Edit"
                  aria-label="Edit message"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}

              {/* 3-dot dropdown — always visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-md p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-input transition-colors"
                    aria-label="More message options"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? "start" : "end"}>
                  {onReply && (
                    <DropdownMenuItem
                      onClick={() => onReply(id, sender?.full_name ?? null, content)}
                    >
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  {onCopy && content && (
                    <DropdownMenuItem onClick={() => onCopy(content)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy text
                    </DropdownMenuItem>
                  )}
                  {onForward && (
                    <DropdownMenuItem onClick={() => onForward(id, content, message_type)}>
                      <Forward className="mr-2 h-4 w-4" />
                      Forward
                    </DropdownMenuItem>
                  )}
                  {canPin && onPin && !isPinned && (
                    <DropdownMenuItem onClick={() => onPin(id)}>
                      <Pin className="mr-2 h-4 w-4" />
                      Pin message
                    </DropdownMenuItem>
                  )}
                  {canPin && onUnpin && isPinned && (
                    <DropdownMenuItem onClick={() => onUnpin(id)}>
                      <Pin className="mr-2 h-4 w-4" />
                      Unpin message
                    </DropdownMenuItem>
                  )}
                  {isOwn && onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete message
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Reaction pills */}
        {onReact && (
          <ChatReactionPills
            reactions={reactions}
            currentUserId={currentUserId}
            onReact={(emoji) => onReact(id, emoji)}
          />
        )}
      </div>
    </div>
  );
}
