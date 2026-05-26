/**
 * SectionMarkerInput — floating input for adding section markers on the timeline.
 *
 * Appears at the playhead position (same layout as FloatingCommentCard).
 * Creates a comment with `comment_type: 'section'` and the section label
 * as the body text.
 */
import { useCallback, useRef, useState } from "react";
import { Bookmark, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDuration } from "./lib/format";

interface SectionMarkerInputProps {
  currentTime: number;
  duration: number;
  onClose: () => void;
  onSubmit: (input: {
    body: string;
    timestampSeconds: number | null;
    timestampEndSeconds: number | null;
    mentionedUserIds: string[];
    isInternal: boolean;
  }) => Promise<void> | void;
}

const CARD_WIDTH = 300;

export function SectionMarkerInput({
  currentTime,
  duration,
  onClose,
  onSubmit,
}: SectionMarkerInputProps) {
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = label.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        body: `📌 ${trimmed}`,
        timestampSeconds: currentTime,
        timestampEndSeconds: null,
        mentionedUserIds: [],
        isInternal: true, // Section markers are internal by default
      });
      setLabel("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [label, currentTime, onSubmit, onClose, submitting]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent global shortcuts
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

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
      className="absolute bottom-16 z-40 rounded-xl border border-white/10 bg-[#1e1e22]/95 shadow-2xl backdrop-blur-xl"
      style={cardStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <Bookmark className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-white">Add Section</span>
        <span className="rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          {formatDuration(currentTime)}
        </span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Cancel section"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Input */}
      <div className="px-4 py-3">
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Section name (e.g. Intro, Hook, CTA)"
          autoFocus
          className="w-full rounded-lg border border-primary/40 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-primary/70"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2">
        <span className="text-[10px] text-white/40">Internal marker</span>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!label.trim() || submitting}
          className="h-7 gap-1.5 rounded-full text-xs"
        >
          <Bookmark className="h-3 w-3" />
          {submitting ? "Saving…" : "Add Section"}
        </Button>
      </div>

      {/* Arrow */}
      <div
        className="absolute -bottom-2 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1e1e22]"
        style={arrowStyle}
      />
    </div>
  );
}
