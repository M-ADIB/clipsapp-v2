/**
 * FormBuilderCanvas — Center panel showing the ordered list of fields.
 *
 * In multi-step mode, only shows fields for the active step.
 * Shows visual badges for conditional logic and qualifying rules.
 */
import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Zap,
  ShieldAlert,
  Eye,
  EyeOff,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FIELD_TYPES, type BuilderField, type FormStep } from "./form-builder-types";

interface Props {
  fields: BuilderField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  /** If multi-step, only show fields for this step index */
  activeStep?: number;
  /** Current step definition (for video step rendering) */
  activeStepDef?: FormStep;
  /** Callback when video step settings change */
  onUpdateStepDef?: (patch: Partial<FormStep>) => void;
}

export function FormBuilderCanvas({
  fields,
  selectedId,
  onSelect,
  onReorder,
  onRemove,
  activeStep,
  activeStepDef,
  onUpdateStepDef,
}: Props) {
  // Filter fields by active step if multi-step mode
  const visibleFields =
    activeStep !== undefined ? fields.filter((f) => f.step === activeStep) : fields;

  // Video step editor
  if (activeStepDef?.type === "video") {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2 py-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Video Step</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This step shows a video to the respondent before they proceed. No form fields are
              shown on this page.
            </p>
          </div>

          <div className="space-y-4 bg-surface-card/30 border border-border rounded-xl p-6">
            <div className="space-y-1.5">
              <Label className="text-xs">Video URL</Label>
              <Input
                value={activeStepDef.video_url ?? ""}
                onChange={(e) => onUpdateStepDef?.({ video_url: e.target.value })}
                className="h-9 text-sm"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
              <p className="text-[10px] text-muted-foreground">Supports YouTube and Vimeo links</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Headline</Label>
              <Input
                value={activeStepDef.headline ?? ""}
                onChange={(e) => onUpdateStepDef?.({ headline: e.target.value })}
                className="h-9 text-sm"
                placeholder="Watch this before continuing"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (visibleFields.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {activeStep !== undefined
              ? "Add fields from the sidebar to this step"
              : "Add fields from the sidebar to get started"}
          </p>
          <p className="text-xs text-muted-foreground/60">
            Click a field type on the left to add it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-2">
        {visibleFields.map((field, localIndex) => {
          // Compute global index for reorder operations
          const globalIndex = fields.findIndex((f) => f.id === field.id);
          const typeMeta = FIELD_TYPES.find((ft) => ft.type === field.type);
          const isSelected = field.id === selectedId;
          const hasLogic = !!field.conditional_logic;
          const isDisqualifier =
            field.conditional_logic?.action === "disqualify" ||
            field.conditional_logic?.action === "end";

          return (
            <Card
              key={field.id}
              className={cn(
                "group flex items-center gap-3 p-3 cursor-pointer transition-all",
                isSelected
                  ? "ring-2 ring-primary border-primary bg-primary/5"
                  : "hover:bg-accent/5",
              )}
              onClick={() => onSelect(field.id)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {field.label}
                  </span>
                  {field.is_required && <span className="text-destructive text-xs">*</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                    {typeMeta?.label ?? field.type}
                  </Badge>
                  {field.description && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                      {field.description}
                    </span>
                  )}
                  {hasLogic && !isDisqualifier && (
                    <Badge className="text-[9px] h-4 px-1.5 gap-0.5 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15">
                      <Zap className="h-2.5 w-2.5" />
                      Logic
                    </Badge>
                  )}
                  {isDisqualifier && (
                    <Badge className="text-[9px] h-4 px-1.5 gap-0.5 bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15">
                      <ShieldAlert className="h-2.5 w-2.5" />
                      Qualifier
                    </Badge>
                  )}
                  {field.type === "hidden" && (
                    <Badge className="text-[9px] h-4 px-1.5 gap-0.5 bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
                      <EyeOff className="h-2.5 w-2.5" />
                      Hidden
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={localIndex === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Find the prev field in the same step
                    const prevInStep = visibleFields[localIndex - 1];
                    if (prevInStep) {
                      const fromGlobal = fields.findIndex((f) => f.id === field.id);
                      const toGlobal = fields.findIndex((f) => f.id === prevInStep.id);
                      onReorder(fromGlobal, toGlobal);
                    }
                  }}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={localIndex === visibleFields.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextInStep = visibleFields[localIndex + 1];
                    if (nextInStep) {
                      const fromGlobal = fields.findIndex((f) => f.id === field.id);
                      const toGlobal = fields.findIndex((f) => f.id === nextInStep.id);
                      onReorder(fromGlobal, toGlobal);
                    }
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(field.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
