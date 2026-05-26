/**
 * CommentComposer — input for adding a new top-level comment.
 *
 * Redesigned layout (Frame.io-style):
 *  • Top:     Timestamp badge (toggleable) | textarea
 *  • Bottom:  LEFT: Annotate | Emoji | Section  |  RIGHT: Voice note | Send
 *  • @mentions typeahead (via global MentionTextarea)
 *  • Internal-only toggle (moderators)
 */
import { useCallback, useRef, useState } from "react";
import {
  Clock,
  EyeOff,
  Globe,
  Mic,
  Pencil,
  Send,
  Smile,
  SplitSquareHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { MentionTextarea } from "@/components/mentions";
import type { MentionTextareaRef } from "@/components/mentions";
import { useMentionUsers, resolveActiveMentions } from "@/hooks/use-mention";

import { formatTimecode } from "../lib/format";
import type { ToolAction } from "../PlayerControls";

interface CommentComposerProps {
  currentTime: number;
  onSubmit: (input: {
    body: string;
    timestampSeconds: number | null;
    timestampEndSeconds: number | null;
    mentionedUserIds: string[];
    isInternal: boolean;
  }) => Promise<void> | void;
  disabled?: boolean;
  compact?: boolean;
  placeholder?: string;
  /** Show internal-only toggle (moderators). */
  canMarkInternal?: boolean;
  /** Allow @mentions (signed-in team members only). */
  canMention?: boolean;
  /** Callback for tool actions (annotate, voice, section). */
  onToolAction?: (tool: ToolAction) => void;
  /** Which tool is currently active. */
  activeToolAction?: ToolAction | null;
}

// Quick-access emoji grid for the picker
const QUICK_EMOJIS = [
  "👍",
  "👎",
  "❤️",
  "🔥",
  "✅",
  "❌",
  "🎉",
  "👀",
  "🤔",
  "💯",
  "⚡",
  "🙌",
  "😍",
  "😂",
  "🚀",
  "💪",
  "🙏",
  "👏",
  "💡",
  "⭐",
];

export function CommentComposer({
  currentTime,
  onSubmit,
  disabled,
  compact,
  placeholder = "Leave your comment...",
  canMarkInternal = false,
  canMention = false,
  onToolAction,
  activeToolAction,
}: CommentComposerProps) {
  const [body, setBody] = useState("");
  const [pinTime, setPinTime] = useState(true);
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [isInternal, setIsInternal] = useState(false);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const mentionTextareaRef = useRef<MentionTextareaRef>(null);

  // Get mentionable users from the global hook
  const mentionUsers = useMentionUsers();
  const activeMentionUsers = canMention ? mentionUsers : [];

  const insertEmoji = useCallback((emoji: string) => {
    mentionTextareaRef.current?.insertAtCursor(emoji);
  }, []);

  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
  };

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || disabled) return;
    setSubmitting(true);
    try {
      const ts = rangeStart != null ? rangeStart : pinTime ? currentTime : null;
      const tsEnd = rangeStart != null && rangeEnd != null ? rangeEnd : null;
      await onSubmit({
        body: trimmed,
        timestampSeconds: ts,
        timestampEndSeconds: tsEnd,
        mentionedUserIds,
        isInternal,
      });
      setBody("");
      setMentionedUserIds([]);
      clearRange();
      setIsInternal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-border/60 bg-surface-card/95 backdrop-blur p-3 relative",
        compact && "p-2",
      )}
    >
      {/* ── Timestamp badge ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPinTime((v) => !v)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            pinTime
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-surface-raised text-foreground-muted border border-border/60 hover:bg-surface-raised/80",
          )}
          aria-label={
            pinTime ? `Timestamp pinned at ${formatTimecode(currentTime)}` : "Add timestamp"
          }
          aria-pressed={pinTime}
        >
          <Clock className="h-3 w-3" />
          {pinTime ? (
            <span className="font-mono text-[11px]">{formatTimecode(currentTime)}</span>
          ) : (
            <span>Add timestamp</span>
          )}
        </button>

        {/* Internal toggle (inline with timestamp) */}
        {canMarkInternal && (
          <button
            type="button"
            onClick={() => setIsInternal((v) => !v)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors",
              isInternal
                ? "bg-status-warning/15 text-status-warning border border-status-warning/30"
                : "bg-surface-raised text-foreground-muted border border-border/60 hover:bg-surface-raised/80",
            )}
            aria-label={isInternal ? "Internal — hidden from clients" : "Visible to client"}
            aria-pressed={isInternal}
          >
            {isInternal ? (
              <>
                <EyeOff className="h-3 w-3" /> Internal
              </>
            ) : (
              <>
                <Globe className="h-3 w-3" /> Public
              </>
            )}
          </button>
        )}
      </div>

      {/* ── MentionTextarea (replaces raw Textarea + inline mention logic) ── */}
      <MentionTextarea
        ref={mentionTextareaRef}
        value={body}
        onChange={setBody}
        onMentionsChange={setMentionedUserIds}
        onSubmit={handleSubmit}
        users={activeMentionUsers}
        placeholder={placeholder}
        rows={compact ? 1 : 2}
        disabled={disabled}
        className={compact ? "min-h-[40px]" : "min-h-[60px]"}
        pickerPosition="above"
      />

      {/* ── Bottom toolbar: LEFT actions | RIGHT send ────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          {/* Annotate / Draw */}
          {onToolAction && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7",
                activeToolAction === "annotate"
                  ? "text-primary bg-primary/10"
                  : "text-foreground-muted hover:text-foreground",
              )}
              onClick={() => onToolAction("annotate")}
              disabled={disabled}
              aria-label="Draw annotation"
              aria-pressed={activeToolAction === "annotate"}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-foreground-muted hover:text-foreground"
                disabled={disabled}
                aria-label="Insert emoji"
              >
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="z-50 w-auto p-2">
              <div className="grid grid-cols-5 gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-accent"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Section marker */}
          {onToolAction && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7",
                activeToolAction === "section"
                  ? "text-primary bg-primary/10"
                  : "text-foreground-muted hover:text-foreground",
              )}
              onClick={() => onToolAction("section")}
              disabled={disabled}
              aria-label="Add section marker"
              aria-pressed={activeToolAction === "section"}
            >
              <SplitSquareHorizontal className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Right side: Voice note + Send */}
        <div className="flex items-center gap-1">
          {/* Voice note */}
          {onToolAction && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7",
                activeToolAction === "voice"
                  ? "text-red-500 bg-red-500/10"
                  : "text-foreground-muted hover:text-foreground",
              )}
              onClick={() => onToolAction("voice")}
              disabled={disabled}
              aria-label="Record voice note"
              aria-pressed={activeToolAction === "voice"}
            >
              <Mic className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Send */}
          <Button
            type="button"
            size="sm"
            className="h-7 gap-1 px-3"
            onClick={handleSubmit}
            disabled={disabled || submitting || !body.trim()}
            aria-label={submitting ? "Posting comment" : "Post comment"}
          >
            <Send className="h-3 w-3" />
            {submitting ? "Posting..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
