/**
 * CommentsBottomSheet — mobile bottom panel that shares vertical space with
 * the video player in a flex column layout.
 *
 * The tool tabs and comment composer are ALWAYS visible (even in peek state).
 * Expanding the sheet reveals the comment thread list above the composer.
 *
 * Layout in peek state:
 *   [Tool tabs: Section | Comment | Draw | Voice]
 *   [Slide up handle]
 *
 * Layout when "Comment" tool is active:
 *   [Tool tabs]
 *   [CommentComposer]
 *   [Slide up handle]
 *
 * Layout in expanded (half/full) state:
 *   [Slide down handle]
 *   [Filter tabs: All | Open | Resolved]
 *   [Comment thread list — scrollable]
 *   [CommentComposer — sticky bottom]
 */
import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mic,
  Pencil,
  SplitSquareHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { CommentThread } from "../hooks/use-video-comments";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";

type Snap = "peek" | "half" | "full";

interface CommentsBottomSheetProps {
  threads: CommentThread[];
  isLoading: boolean;
  currentUserId: string | null;
  canComment: boolean;
  canModerate: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onAdd: (input: {
    body: string;
    timestampSeconds: number | null;
    timestampEndSeconds: number | null;
    mentionedUserIds: string[];
    isInternal: boolean;
  }) => Promise<void> | void;
  onReply: (parentId: string, body: string, mentionedUserIds?: string[]) => Promise<void> | void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}

type MobileTool = "section" | "comment" | "draw" | "voice" | null;

const TOOLS: Array<{ id: MobileTool; label: string; icon: React.ElementType }> = [
  { id: "section", label: "Section", icon: SplitSquareHorizontal },
  { id: "comment", label: "Comment", icon: MessageSquare },
  { id: "draw", label: "Draw", icon: Pencil },
  { id: "voice", label: "Voice", icon: Mic },
];

export function CommentsBottomSheet(props: CommentsBottomSheetProps) {
  const [snap, setSnap] = useState<Snap>("peek");
  const [activeTool, setActiveTool] = useState<MobileTool>(null);
  const startY = useRef<number | null>(null);
  const startSnap = useRef<Snap>("peek");

  const isExpanded = snap !== "peek";

  const toggle = () => setSnap(isExpanded ? "peek" : "half");

  /* ─── Pointer drag on handle ──────────────────────────────────────── */
  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    startSnap.current = snap;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (startY.current == null) return;
    const dy = e.clientY - startY.current;
    startY.current = null;
    const order: Snap[] = ["peek", "half", "full"];
    const idx = order.indexOf(startSnap.current);
    if (dy < -40) {
      // Swiped up — expand.
      setSnap(order[Math.min(order.length - 1, idx + 1)]);
    } else if (dy > 40) {
      // Swiped down — collapse.
      setSnap(order[Math.max(0, idx - 1)]);
    } else {
      // Simple tap (< 40px movement) — toggle between peek/half.
      toggle();
    }
  };

  const handleToolTap = (tool: MobileTool) => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
    }
  };

  const showComposer = activeTool === "comment" || isExpanded;

  return (
    <div
      role="region"
      aria-label="Comments panel"
      className={cn(
        "flex flex-col border-t border-border/60 bg-background",
        "flex-shrink-0",
        // Only animate when expanding/collapsing the thread list.
        isExpanded && "transition-[height] duration-300 ease-out",
      )}
      style={{
        height: isExpanded ? (snap === "half" ? "55dvh" : "75dvh") : "auto",
      }}
    >
      {/* ─── Expanded: comment thread list ───────────────────────────── */}
      {isExpanded && (
        <>
          {/* Collapse handle */}
          <Button
            type="button"
            variant="ghost"
            className="flex h-auto w-full items-center justify-center gap-2 rounded-none px-4 py-2 touch-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onClick={toggle}
            aria-label="Collapse comments"
            aria-expanded={true}
          >
            <div className="h-1 w-10 rounded-full bg-border" aria-hidden="true" />
          </Button>

          <div className="flex items-center gap-1 border-b border-border/40 px-3 pb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {props.threads.length} comment{props.threads.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Scrollable thread list */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {props.threads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <MessageSquare className="h-6 w-6 mb-2 opacity-40" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs mt-1">Be the first to leave feedback.</p>
                  </div>
                ) : (
                  props.threads.map((t) => (
                    <CommentItem
                      key={t.id}
                      thread={t}
                      currentUserId={props.currentUserId}
                      canModerate={props.canModerate}
                      onSeek={props.onSeek}
                      onReply={props.onReply}
                      onResolve={props.onResolve}
                      onDelete={props.onDelete}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* ─── Comment composer (visible when Comment tool active or expanded) ── */}
      {showComposer && props.canComment && (
        <CommentComposer
          currentTime={props.currentTime}
          onSubmit={props.onAdd}
          canMarkInternal={props.canModerate}
          canMention={props.canModerate}
          compact
        />
      )}

      {/* ─── Tool tabs — ALWAYS visible ──────────────────────────────── */}
      {!isExpanded && (
        <div className="flex items-center justify-around border-t border-border/30 px-1 py-1.5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <Button
                key={tool.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 text-[11px]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => handleToolTap(tool.id)}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{tool.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* ─── Slide up handle — peek state only ───────────────────────── */}
      {!isExpanded && (
        <Button
          type="button"
          variant="ghost"
          className="flex h-auto w-full items-center justify-center gap-2 rounded-none px-4 py-2.5 pb-3 text-muted-foreground touch-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onClick={toggle}
          aria-label="Expand comments"
          aria-expanded={false}
        >
          <ChevronUp className="h-3.5 w-3.5" />
          <span className="text-xs">Slide up to view all comments</span>
        </Button>
      )}
    </div>
  );
}
