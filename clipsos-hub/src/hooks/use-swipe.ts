/**
 * useSwipe — minimal horizontal swipe detection (touch only).
 *
 * Returns handlers to spread on a touch container; fires onSwipeLeft /
 * onSwipeRight once the user releases past the threshold.
 */
import { useCallback, useRef } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Minimum px to count as a swipe. Default 60. */
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }: UseSwipeOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;
      startX.current = null;
      startY.current = null;
      // Ignore if mostly vertical.
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (dx <= -threshold) onSwipeLeft?.();
      else if (dx >= threshold) onSwipeRight?.();
    },
    [onSwipeLeft, onSwipeRight, threshold],
  );

  return { onTouchStart, onTouchEnd };
}
