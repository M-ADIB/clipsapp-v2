/**
 * CommentTimelineMarkers — overlays avatar pins (and range bands) on the
 * player scrub timeline. Click a pin/band to seek.
 *
 * Single-point comments show the commenter's avatar (or initials fallback)
 * instead of plain colored dots — matching Frame.io's timeline behavior.
 */
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import type { CommentThread } from "./hooks/use-video-comments";
import { formatDuration } from "./lib/format";

interface CommentTimelineMarkersProps {
  threads: CommentThread[];
  duration: number;
  onSeek: (seconds: number) => void;
}

/** Extract initials from a name (max 2 chars). */
function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function CommentTimelineMarkers({ threads, duration, onSeek }: CommentTimelineMarkersProps) {
  if (!duration || duration <= 0) return null;
  const pinned = threads.filter((t) => t.timestamp_seconds != null && t.timestamp_seconds >= 0);
  if (pinned.length === 0) return null;

  return (
    <TooltipProvider delayDuration={150}>
      {/* Container positioned over the slider track, allow avatar pins to
          overflow vertically (they extend below the track). */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2">
        {pinned.map((t) => {
          const start = t.timestamp_seconds ?? 0;
          const end = t.timestamp_end_seconds;
          const startPct = Math.min(100, Math.max(0, (start / duration) * 100));
          const previewBody = t.comment.length > 80 ? t.comment.slice(0, 80) + "…" : t.comment;
          const isInternal = t.is_internal === true;

          const authorName = t.author?.display_name ?? t.author?.full_name ?? t.guest_name;
          const avatarUrl = t.author?.avatar_url;
          const initials = getInitials(authorName);

          // Range band
          if (end != null && end > start) {
            const widthPct = Math.min(100 - startPct, ((end - start) / duration) * 100);
            return (
              <Tooltip key={t.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(start);
                    }}
                    className={cn(
                      "pointer-events-auto absolute h-2 top-1/2 -translate-y-1/2 rounded-full border border-white/70 shadow",
                      "hover:h-3 transition-all",
                      isInternal ? "bg-status-warning/80" : "bg-primary/80",
                    )}
                    style={{
                      left: `${startPct}%`,
                      width: `${widthPct}%`,
                      minWidth: "4px",
                    }}
                    aria-label={`Comment from ${formatDuration(start)} to ${formatDuration(end)}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px]">
                  <div className="text-[10px] font-mono text-primary mb-0.5">
                    {formatDuration(start)} → {formatDuration(end)}
                    {isInternal && <span className="ml-1 text-status-warning">internal</span>}
                  </div>
                  <div className="text-xs">{previewBody}</div>
                </TooltipContent>
              </Tooltip>
            );
          }

          // Single point pin — avatar / initials
          return (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(start);
                  }}
                  className={cn(
                    "pointer-events-auto absolute -translate-x-1/2 flex items-center justify-center",
                    "h-5 w-5 rounded-full border-[1.5px] shadow-md",
                    "hover:scale-110 transition-transform",
                    "top-full mt-0.5", // sit just below the timeline track
                    isInternal ? "border-status-warning" : "border-primary",
                  )}
                  style={{ left: `${startPct}%` }}
                  aria-label={`Comment by ${authorName ?? "unknown"} at ${formatDuration(start)}`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex h-full w-full items-center justify-center rounded-full text-[7px] font-bold text-[#1a1a1a]",
                        isInternal ? "bg-status-warning" : "bg-primary",
                      )}
                    >
                      {initials}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[240px]">
                <div className="text-[10px] font-mono text-primary mb-0.5">
                  {authorName && (
                    <span className="mr-1 font-sans font-medium text-white">{authorName}</span>
                  )}
                  @ {formatDuration(start)}
                  {isInternal && <span className="ml-1 text-status-warning">internal</span>}
                </div>
                <div className="text-xs">{previewBody}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
