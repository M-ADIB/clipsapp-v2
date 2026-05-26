/**
 * useQueueNavigation — prev/next navigation through an ordered video queue.
 *
 * Handles:
 *  • canGoPrev / canGoNext guards
 *  • goPrev / goNext callbacks
 *  • Mobile swipe gestures (via useSwipe)
 *  • Global keyboard shortcuts (← → Space F M Esc C D V R)
 */
import { useCallback, useEffect } from "react";

import { useSwipe } from "@/hooks/use-swipe";

interface QueueConfig {
  ids: string[];
  currentIndex: number;
  onNavigate: (nextIndex: number) => void;
}

/** Tool actions triggered by keyboard shortcuts (C/D/V/R). */
export type ToolShortcut = "comment" | "annotate" | "voice" | "section";

interface UseQueueNavigationOptions {
  open: boolean;
  queue: QueueConfig | undefined;
  isMobile: boolean;
  isAnnotating: boolean;
  player: {
    togglePlay: () => void;
    skip: (delta: number) => void;
    toggleFullscreen: () => void;
    toggleMute: () => void;
  };
  onClose: () => void;
  /** Optional: called when a tool shortcut key is pressed. */
  onToolShortcut?: (tool: ToolShortcut) => void;
}

export function useQueueNavigation({
  open,
  queue,
  isMobile,
  isAnnotating,
  player,
  onClose,
  onToolShortcut,
}: UseQueueNavigationOptions) {
  const queueLength = queue?.ids.length ?? 0;
  const queueIndex = queue?.currentIndex ?? -1;
  const canGoPrev = !!queue && queueIndex > 0;
  const canGoNext = !!queue && queueIndex >= 0 && queueIndex < queueLength - 1;

  const goPrev = useCallback(() => {
    if (!queue || !canGoPrev) return;
    queue.onNavigate(queueIndex - 1);
  }, [queue, canGoPrev, queueIndex]);

  const goNext = useCallback(() => {
    if (!queue || !canGoNext) return;
    queue.onNavigate(queueIndex + 1);
  }, [queue, canGoNext, queueIndex]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  });

  /* ─── Global keyboard shortcuts ─────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
      const hasQueue = !!queue;
      switch (e.key) {
        case " ":
          e.preventDefault();
          player.togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (hasQueue && !e.shiftKey) goPrev();
          else player.skip(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (hasQueue && !e.shiftKey) goNext();
          else player.skip(5);
          break;
        case "f":
        case "F":
          e.preventDefault();
          player.toggleFullscreen();
          break;
        case "m":
        case "M":
          e.preventDefault();
          player.toggleMute();
          break;
        case "c":
        case "C":
          e.preventDefault();
          onToolShortcut?.("comment");
          break;
        case "d":
        case "D":
          e.preventDefault();
          onToolShortcut?.("annotate");
          break;
        case "v":
        case "V":
          e.preventDefault();
          onToolShortcut?.("voice");
          break;
        case "r":
        case "R":
          e.preventDefault();
          onToolShortcut?.("section");
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, player, onClose, onToolShortcut, queue, goPrev, goNext]);

  return {
    queueLength,
    queueIndex,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    /** Pass these to the player container's onTouchStart/onTouchEnd. */
    swipeProps: {
      onTouchStart: (e: React.TouchEvent) => {
        if (isMobile && !isAnnotating) swipeHandlers.onTouchStart(e);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        if (isMobile && !isAnnotating) swipeHandlers.onTouchEnd(e);
      },
    },
  };
}
