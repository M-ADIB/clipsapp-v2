/**
 * AnnotationOverlay — read-only rendering of saved annotations whose frame
 * is "near" the current playback time. Used to surface saved drawings as the
 * viewer scrubs through the video.
 */
import { useMemo } from "react";

import { AnnotationCanvas } from "./AnnotationCanvas";
import type { AnnotationStroke, VideoAnnotation } from "./types";

interface AnnotationOverlayProps {
  annotations: VideoAnnotation[];
  currentTime: number;
  /** How close (seconds) an annotation must be to currentTime to render. */
  toleranceSeconds?: number;
  aspectRatio?: number;
}

export function AnnotationOverlay({
  annotations,
  currentTime,
  toleranceSeconds = 0.6,
  aspectRatio,
}: AnnotationOverlayProps) {
  const strokes = useMemo<AnnotationStroke[]>(() => {
    const visible = annotations.filter(
      (a) => Math.abs(a.frame_timestamp - currentTime) <= toleranceSeconds,
    );
    return visible.flatMap((a) => a.annotation_data?.strokes ?? []);
  }, [annotations, currentTime, toleranceSeconds]);

  if (strokes.length === 0) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <AnnotationCanvas
        baseStrokes={strokes}
        draftStrokes={[]}
        onDraftChange={() => {}}
        tool="pen"
        color="#fff"
        enabled={false}
        aspectRatio={aspectRatio}
      />
    </div>
  );
}
