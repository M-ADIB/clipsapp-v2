/**
 * FloatingCommentCard — Frame.io-style floating comment composer.
 *
 * Appears overlaid on the video, positioned horizontally at the playhead
 * position on the timeline. Shows current timecode, Timecoded/General tabs,
 * a MentionTextarea with @mention support, and action icons.
 *
 * The card's horizontal position tracks the playhead % so it sits above
 * the current position on the timeline, just like Frame.io.
 */
import { useCallback, useRef, useState } from "react";
import { EyeOff, Globe, Paperclip, Smile, AtSign, Mic, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDuration } from "../lib/format";

import { MentionTextarea } from "@/components/mentions";
import type { MentionTextareaRef } from "@/components/mentions";
import { useMentionUsers } from "@/hooks/use-mention";

interface FloatingCommentCardProps {
  currentTime: number;
  duration: number;
  onClose: () => void;
  onSubmit: (input: {
    body: string;
    timestampSeconds: number | null;
    timestampEndSeconds: number | null;
    mentionedUserIds: string[];
    isInternal: boolean;
  }) => void;
  /** Whether user can toggle internal/public visibility. Team members only. */
  canMarkInternal?: boolean;
}

type CommentMode = "timecoded" | "general";

const CARD_WIDTH = 360; // px

export function FloatingCommentCard({
  currentTime,
  duration,
  onClose,
  onSubmit,
  canMarkInternal = false,
}: FloatingCommentCardProps) {
  const [mode, setMode] = useState<CommentMode>("timecoded");
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<MentionTextareaRef>(null);

  // Global mention users
  const mentionUsers = useMentionUsers();

  const handleSubmit = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onSubmit({
      body: trimmed,
      timestampSeconds: mode === "timecoded" ? currentTime : null,
      timestampEndSeconds: null,
      mentionedUserIds,
      isInternal,
    });
    setBody("");
    setMentionedUserIds([]);
    setIsInternal(false);
    onClose();
  }, [body, currentTime, mode, mentionedUserIds, isInternal, onClose, onSubmit]);

  // Compute horizontal position: percentage of playhead along the timeline.
  const playheadPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const cardStyle: React.CSSProperties = {
    left: `clamp(8px, calc(${playheadPct}% - ${CARD_WIDTH / 2}px), calc(100% - ${CARD_WIDTH}px - 8px))`,
    width: `${CARD_WIDTH}px`,
  };

  const arrowStyle: React.CSSProperties = {
    left: `clamp(16px, calc(${playheadPct}% - clamp(8px, calc(${playheadPct}% - ${CARD_WIDTH / 2}px), calc(100% - ${CARD_WIDTH}px - 8px))), calc(${CARD_WIDTH}px - 16px))`,
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-16 z-40 rounded-xl border border-white/10 bg-[#1e1e22]/95 shadow-2xl backdrop-blur-xl"
      style={cardStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: "Comment" + timestamp badge + close */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <span className="text-sm font-medium text-white">Comment</span>
        {mode === "timecoded" && (
          <span className="rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {formatDuration(currentTime)}
          </span>
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Close comment"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Timecoded / General tabs */}
      <div className="flex border-b border-white/10 px-4">
        <button
          type="button"
          className={cn(
            "pb-2 pt-1 text-xs font-medium transition-colors",
            mode === "timecoded"
              ? "border-b-2 border-primary text-white"
              : "text-white/50 hover:text-white/80",
          )}
          onClick={() => setMode("timecoded")}
        >
          Timecoded
        </button>
        <button
          type="button"
          className={cn(
            "ml-4 pb-2 pt-1 text-xs font-medium transition-colors",
            mode === "general"
              ? "border-b-2 border-primary text-white"
              : "text-white/50 hover:text-white/80",
          )}
          onClick={() => setMode("general")}
        >
          General
        </button>
      </div>

      {/* MentionTextarea — replaces plain textarea */}
      <div className="p-3" onKeyDown={(e) => e.stopPropagation()}>
        <MentionTextarea
          ref={mentionRef}
          value={body}
          onChange={setBody}
          onMentionsChange={setMentionedUserIds}
          onEnterSubmit={handleSubmit}
          users={mentionUsers}
          placeholder="Add a comment..."
          rows={3}
          className="min-h-[60px] border-primary/40 bg-transparent text-white placeholder-white/40 focus:border-primary/70"
          pickerPosition="below"
        />
      </div>

      {/* Bottom action row */}
      <div className="flex items-center gap-1 border-t border-white/10 px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Insert emoji"
        >
          <Smile className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/50 hover:bg-white/10 hover:text-white"
          onClick={() => mentionRef.current?.insertAtCursor("@")}
          aria-label="Mention someone"
        >
          <AtSign className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Record voice note"
        >
          <Mic className="h-4 w-4" />
        </Button>

        {/* Internal/Public toggle */}
        {canMarkInternal && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1 px-2 text-xs",
              isInternal
                ? "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                : "text-white/50 hover:bg-white/10 hover:text-white",
            )}
            onClick={() => setIsInternal((v) => !v)}
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
          </Button>
        )}

        <div className="flex-1" />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!body.trim()}
          className="h-7 w-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          aria-label="Submit comment"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Pointer arrow pointing down to timeline — positioned at playhead */}
      <div
        className="absolute -bottom-2 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1e1e22]"
        style={arrowStyle}
      />
    </div>
  );
}
