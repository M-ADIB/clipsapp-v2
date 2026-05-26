/**
 * AnnotationToolbar — floating tool picker for the drawing canvas.
 *
 * Tools: pen, arrow, rect, ellipse. Plus color swatches, undo, clear, save,
 * cancel. Renders nothing if not in editing mode.
 */
import { ArrowUpRight, Circle, Eraser, Pencil, Save, Square, Undo2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ANNOTATION_COLORS, type AnnotationTool } from "./types";

interface AnnotationToolbarProps {
  tool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  canUndo: boolean;
  canSave: boolean;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}

const TOOLS: Array<{ id: AnnotationTool; icon: typeof Pencil; label: string }> = [
  { id: "pen", icon: Pencil, label: "Pen" },
  { id: "arrow", icon: ArrowUpRight, label: "Arrow" },
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "ellipse", icon: Circle, label: "Ellipse" },
];

export function AnnotationToolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  canUndo,
  canSave,
  onUndo,
  onClear,
  onSave,
  onCancel,
  saving,
}: AnnotationToolbarProps) {
  return (
    <div className="absolute left-1/2 top-3 z-40 -translate-x-1/2 flex items-center gap-1 rounded-full bg-background/95 backdrop-blur px-2 py-1.5 shadow-2xl border border-border/60">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        const active = tool === t.id;
        return (
          <Button
            key={t.id}
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-full",
              active && "bg-primary text-primary-foreground hover:bg-primary",
            )}
            onClick={() => onToolChange(t.id)}
            aria-label={t.label}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        );
      })}

      <div className="mx-1 h-5 w-px bg-border" />

      {ANNOTATION_COLORS.map((c) => (
        <Button
          key={c.id}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onColorChange(c.value)}
          aria-label={`Color: ${c.label}`}
          aria-pressed={color === c.value}
          className={cn(
            "h-5 w-5 min-w-0 rounded-full border-2 p-0 transition-transform hover:bg-transparent",
            color === c.value ? "scale-110 border-foreground" : "border-white/40 hover:scale-105",
          )}
          style={{ backgroundColor: c.value }}
        />
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last stroke"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onClear}
        disabled={!canUndo}
        aria-label="Clear all annotations"
      >
        <Eraser className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" />

      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onCancel}>
        <X className="mr-1 h-3 w-3" /> Cancel
      </Button>
      <Button size="sm" className="h-7 px-2 text-xs" onClick={onSave} disabled={!canSave || saving}>
        <Save className="mr-1 h-3 w-3" />
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
