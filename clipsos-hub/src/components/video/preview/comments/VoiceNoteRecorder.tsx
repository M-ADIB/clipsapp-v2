/**
 * VoiceNoteRecorder — floating UI for recording voice note comments.
 *
 * Appears at the playhead position (same as FloatingCommentCard) and
 * provides start/stop/cancel controls with a live duration timer.
 * On completion, uploads the audio and posts it as a comment with
 * `comment_type: 'voice'`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2, X, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDuration } from "../lib/format";
import { useVoiceRecorder } from "../hooks/use-voice-recorder";

interface VoiceNoteRecorderProps {
  videoId: string | null;
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

const CARD_WIDTH = 320;
const MAX_DURATION = 120; // Must match MAX_DURATION_SECONDS in use-voice-recorder

export function VoiceNoteRecorder({
  videoId,
  currentTime,
  duration: videoDuration,
  onClose,
  onSubmit,
}: VoiceNoteRecorderProps) {
  const recorder = useVoiceRecorder(videoId);
  const startedRef = useRef(false);
  const [isPosting, setIsPosting] = useState(false);

  // Auto-start recording ONCE when mounted
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      recorder.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStop = useCallback(async () => {
    const audioUrl = await recorder.stop();
    if (audioUrl) {
      setIsPosting(true);
      try {
        await onSubmit({
          body: `🎤 Voice note: ${audioUrl}`,
          timestampSeconds: currentTime,
          timestampEndSeconds: null,
          mentionedUserIds: [],
          isInternal: false,
        });
      } finally {
        setIsPosting(false);
      }
    }
    onClose();
  }, [recorder, currentTime, onSubmit, onClose]);

  const handleCancel = useCallback(() => {
    recorder.cancel();
    onClose();
  }, [recorder, onClose]);

  const isBusy = recorder.isUploading || isPosting;

  // Horizontal position matching FloatingCommentCard
  const playheadPct =
    videoDuration > 0 ? Math.min(100, Math.max(0, (currentTime / videoDuration) * 100)) : 0;

  const cardStyle: React.CSSProperties = {
    left: `clamp(8px, calc(${playheadPct}% - ${CARD_WIDTH / 2}px), calc(100% - ${CARD_WIDTH}px - 8px))`,
    width: `${CARD_WIDTH}px`,
  };

  const arrowStyle: React.CSSProperties = {
    left: `clamp(16px, calc(${playheadPct}% - clamp(8px, calc(${playheadPct}% - ${CARD_WIDTH / 2}px), calc(100% - ${CARD_WIDTH}px - 8px))), calc(${CARD_WIDTH}px - 16px))`,
  };

  const formatRecordTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="absolute bottom-16 z-40 rounded-xl border border-white/10 bg-[#1e1e22]/95 shadow-2xl backdrop-blur-xl"
      style={cardStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <span className="text-sm font-medium text-white">Voice Note</span>
        <span className="rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          {formatDuration(currentTime)}
        </span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-6 w-6 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Cancel recording"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Recording visualization */}
      <div className="flex flex-col items-center gap-3 px-4 py-4">
        {isBusy ? (
          <div className="flex flex-col items-center gap-2 text-white/70">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">
              {isPosting ? "Posting voice note…" : "Uploading audio…"}
            </span>
          </div>
        ) : recorder.isRecording ? (
          <>
            {/* Pulsing mic icon */}
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
              <div className="absolute inset-1 animate-pulse rounded-full bg-red-500/30" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
                <Mic className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Timer + remaining */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="font-mono text-lg font-semibold text-white">
                {formatRecordTime(recorder.duration)}
              </div>
              <div
                className={cn(
                  "text-[10px] font-medium",
                  recorder.duration >= MAX_DURATION - 10
                    ? "text-red-400 animate-pulse"
                    : "text-white/40",
                )}
              >
                {formatRecordTime(MAX_DURATION - recorder.duration)} remaining
              </div>
            </div>

            {/* Duration progress bar */}
            <div className="w-full px-2">
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    recorder.duration >= MAX_DURATION - 10 ? "bg-red-500" : "bg-red-400",
                  )}
                  style={{ width: `${Math.min(100, (recorder.duration / MAX_DURATION) * 100)}%` }}
                />
              </div>
            </div>

            {/* Level indicator — animated bars */}
            <div className="flex h-4 items-end gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-red-400/80"
                  style={{
                    height: `${4 + Math.random() * 12}px`,
                    animationDelay: `${i * 50}ms`,
                    transition: "height 150ms ease",
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-white/50">
            <MicOff className="h-5 w-5" />
            <span className="text-sm">Not recording</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isBusy}
          className="h-8 gap-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleStop}
          disabled={!recorder.isRecording || isBusy}
          className="h-8 gap-1.5 rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" /> Stop & Send
            </>
          )}
        </Button>
      </div>

      {/* Arrow pointer */}
      <div
        className="absolute -bottom-2 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1e1e22]"
        style={arrowStyle}
      />
    </div>
  );
}
