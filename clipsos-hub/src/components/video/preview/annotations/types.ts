/**
 * Annotation primitives.
 *
 * Stored in `video_annotations.annotation_data` as JSON. Coordinates are
 * normalized to [0,1] on each axis so they re-project across any aspect
 * ratio / display size.
 */

export type AnnotationTool = "pen" | "arrow" | "rect" | "ellipse";

export interface AnnotationStroke {
  id: string;
  tool: AnnotationTool;
  color: string;
  /** Stroke width in normalized units (1 == full canvas height). */
  width: number;
  /** For pen: the polyline. For shapes: [start, end]. */
  points: Array<{ x: number; y: number }>;
}

export interface AnnotationPayload {
  /** Schema version for future migrations. */
  version: 1;
  strokes: AnnotationStroke[];
}

export interface VideoAnnotation {
  id: string;
  tenant_id: string;
  video_id: string;
  version_id: string | null;
  comment_id: string | null;
  annotation_data: AnnotationPayload;
  frame_timestamp: number;
  frame_thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export const ANNOTATION_COLORS: Array<{ id: string; value: string; label: string }> = [
  { id: "red", value: "#ef4444", label: "Red" },
  { id: "yellow", value: "#facc15", label: "Yellow" },
  { id: "green", value: "#22c55e", label: "Green" },
  { id: "blue", value: "#3b82f6", label: "Blue" },
  { id: "white", value: "#ffffff", label: "White" },
];

export const DEFAULT_STROKE_WIDTH = 0.006; // ~ 4px on a 720px-tall canvas
