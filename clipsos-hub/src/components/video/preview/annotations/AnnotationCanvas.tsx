/**
 * AnnotationCanvas — interactive SVG canvas for drawing annotations.
 *
 * Renders provided existing strokes and lets the user draw new strokes with
 * the active tool / color. All coordinates are normalized to [0,1] so they
 * map onto any container size (and survive aspect ratio changes).
 */
import { useCallback, useMemo, useRef, useState } from "react";

import type { AnnotationStroke, AnnotationTool } from "./types";
import { DEFAULT_STROKE_WIDTH } from "./types";

interface AnnotationCanvasProps {
  /** Existing read-only strokes shown beneath the active drawing. */
  baseStrokes?: AnnotationStroke[];
  /** Strokes the user is currently authoring (locally controlled). */
  draftStrokes: AnnotationStroke[];
  onDraftChange: (strokes: AnnotationStroke[]) => void;
  tool: AnnotationTool;
  color: string;
  /** When false, the canvas is non-interactive (pointer-events: none). */
  enabled: boolean;
  /** Optional explicit aspect ratio for the SVG viewBox. Defaults to 16/9. */
  aspectRatio?: number;
}

const id = () =>
  globalThis.crypto?.randomUUID?.() ?? `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;

export function AnnotationCanvas({
  baseStrokes = [],
  draftStrokes,
  onDraftChange,
  tool,
  color,
  enabled,
  aspectRatio = 16 / 9,
}: AnnotationCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeStroke, setActiveStroke] = useState<AnnotationStroke | null>(null);

  const viewBox = useMemo(() => {
    // Use a 1000-wide normalized viewBox so stroke widths look natural.
    const w = 1000;
    const h = Math.round(w / aspectRatio);
    return { w, h, str: `0 0 ${w} ${h}` };
  }, [aspectRatio]);

  const toNormalized = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!enabled) return;
    e.preventDefault();
    (e.target as SVGSVGElement).setPointerCapture(e.pointerId);
    const p = toNormalized(e.clientX, e.clientY);
    setActiveStroke({
      id: id(),
      tool,
      color,
      width: DEFAULT_STROKE_WIDTH,
      points: tool === "pen" ? [p] : [p, p],
    });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!enabled || !activeStroke) return;
    const p = toNormalized(e.clientX, e.clientY);
    setActiveStroke((prev) => {
      if (!prev) return prev;
      if (prev.tool === "pen") {
        return { ...prev, points: [...prev.points, p] };
      }
      return { ...prev, points: [prev.points[0], p] };
    });
  };

  const onPointerUp = () => {
    if (!enabled || !activeStroke) return;
    const finished = activeStroke;
    setActiveStroke(null);
    // Discard near-zero strokes
    if (finished.tool === "pen" && finished.points.length < 2) return;
    if (finished.tool !== "pen") {
      const [a, b] = finished.points;
      if (Math.hypot(a.x - b.x, a.y - b.y) < 0.01) return;
    }
    onDraftChange([...draftStrokes, finished]);
  };

  const allStrokes = activeStroke
    ? [...baseStrokes, ...draftStrokes, activeStroke]
    : [...baseStrokes, ...draftStrokes];

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox.str}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      style={{
        pointerEvents: enabled ? "auto" : "none",
        cursor: enabled ? "crosshair" : "default",
        touchAction: enabled ? "none" : "auto",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {allStrokes.map((s) => (
        <StrokeShape key={s.id} stroke={s} viewW={viewBox.w} viewH={viewBox.h} />
      ))}
    </svg>
  );
}

function StrokeShape({
  stroke,
  viewW,
  viewH,
}: {
  stroke: AnnotationStroke;
  viewW: number;
  viewH: number;
}) {
  const sw = Math.max(1.5, stroke.width * viewH);
  const common = {
    stroke: stroke.color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  if (stroke.tool === "pen") {
    if (stroke.points.length < 2) return null;
    const d = stroke.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * viewW} ${p.y * viewH}`)
      .join(" ");
    return <path d={d} {...common} />;
  }

  const [a, b] = stroke.points;
  const ax = a.x * viewW;
  const ay = a.y * viewH;
  const bx = b.x * viewW;
  const by = b.y * viewH;

  if (stroke.tool === "rect") {
    return (
      <rect
        x={Math.min(ax, bx)}
        y={Math.min(ay, by)}
        width={Math.abs(bx - ax)}
        height={Math.abs(by - ay)}
        {...common}
      />
    );
  }

  if (stroke.tool === "ellipse") {
    return (
      <ellipse
        cx={(ax + bx) / 2}
        cy={(ay + by) / 2}
        rx={Math.abs(bx - ax) / 2}
        ry={Math.abs(by - ay) / 2}
        {...common}
      />
    );
  }

  // arrow
  const angle = Math.atan2(by - ay, bx - ax);
  const head = Math.max(12, sw * 3);
  const hx = bx - head * Math.cos(angle - Math.PI / 6);
  const hy = by - head * Math.sin(angle - Math.PI / 6);
  const hx2 = bx - head * Math.cos(angle + Math.PI / 6);
  const hy2 = by - head * Math.sin(angle + Math.PI / 6);
  return (
    <g>
      <line x1={ax} y1={ay} x2={bx} y2={by} {...common} />
      <polyline points={`${hx},${hy} ${bx},${by} ${hx2},${hy2}`} {...common} />
    </g>
  );
}
