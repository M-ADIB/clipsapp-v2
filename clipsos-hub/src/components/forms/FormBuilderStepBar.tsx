/**
 * FormBuilderStepBar — Horizontal tab bar for managing form steps.
 *
 * Shows a tab for each step with field counts, video indicators,
 * and controls for adding/removing/renaming steps.
 */
import { useState } from "react";
import {
  Plus,
  X,
  Video,
  FileText,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { FormStep, BuilderField, StepType } from "./form-builder-types";
import { createDefaultStep } from "./form-builder-types";

interface Props {
  steps: FormStep[];
  fields: BuilderField[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  onAddStep: (type: StepType) => void;
  onRemoveStep: (index: number) => void;
  onUpdateStep: (index: number, patch: Partial<FormStep>) => void;
  onReorderStep: (from: number, to: number) => void;
}

export function FormBuilderStepBar({
  steps,
  fields,
  activeStepIndex,
  onSelectStep,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
  onReorderStep,
}: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditTitle(steps[index].title);
  }

  function finishEdit() {
    if (editingIndex !== null && editTitle.trim()) {
      onUpdateStep(editingIndex, { title: editTitle.trim() });
    }
    setEditingIndex(null);
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface-card/20 overflow-x-auto">
      {steps.map((step, i) => {
        const isActive = i === activeStepIndex;
        const fieldCount = fields.filter((f) => f.step === i).length;
        const isEditing = editingIndex === i;

        return (
          <div
            key={step.id}
            className={cn(
              "group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs cursor-pointer transition-all",
              isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/5 border border-transparent",
            )}
            onClick={() => onSelectStep(i)}
          >
            {step.type === "video" ? (
              <Film className="h-3 w-3 shrink-0" />
            ) : (
              <FileText className="h-3 w-3 shrink-0" />
            )}

            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={finishEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") finishEdit();
                  if (e.key === "Escape") setEditingIndex(null);
                }}
                className="h-5 text-xs w-24 px-1 py-0 border-none bg-transparent focus-visible:ring-1"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate max-w-[120px] font-medium">{step.title}</span>
            )}

            {step.type === "fields" && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-0.5">
                {fieldCount}
              </Badge>
            )}

            {/* Step context menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-accent/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(i);
                  }}
                >
                  <Pencil className="h-3 w-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                {step.type === "fields" ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStep(i, { type: "video", video_url: "", headline: "" });
                    }}
                  >
                    <Video className="h-3 w-3 mr-2" />
                    Convert to Video
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStep(i, {
                        type: "fields",
                        video_url: undefined,
                        headline: undefined,
                      });
                    }}
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Convert to Fields
                  </DropdownMenuItem>
                )}
                {i > 0 && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderStep(i, i - 1);
                    }}
                  >
                    Move Left
                  </DropdownMenuItem>
                )}
                {i < steps.length - 1 && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderStep(i, i + 1);
                    }}
                  >
                    Move Right
                  </DropdownMenuItem>
                )}
                {steps.length > 1 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStep(i);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete Step
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}

      {/* Add Step dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 ml-1">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onAddStep("fields")}>
            <FileText className="h-3.5 w-3.5 mr-2" />
            Fields Step
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddStep("video")}>
            <Video className="h-3.5 w-3.5 mr-2" />
            Video Step
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
