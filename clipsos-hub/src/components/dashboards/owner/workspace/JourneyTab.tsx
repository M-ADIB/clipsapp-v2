/**
 * JourneyTab — Vertical timeline for client journey steps.
 *
 * Wired to:
 *   useClientJourney(clientId)
 *   useUpdateJourneyStep()
 *   useCreateJourneyStep()
 *   useDeleteJourneyStep()
 *   useSeedJourneyFromTemplate()
 *
 * Shows: Initial Onboarding and Recurring Production Cycle.
 * Features:
 *   - Pulse glow and radar beacon indicating the active step
 *   - Audio feedback chime (beep on load/focus, success chime on complete)
 *   - Administrative Configure Mode to add, edit, delete, and reorder steps
 *   - Template seeding panel when no journey is configured
 */
import { useMemo, useState, useEffect } from "react";
import {
  normalizeStatus,
  statusBadgeText,
  playChime,
  ensureJourneyAnimations,
  type StepStatus,
} from "./journey-lib";
import {
  useClientJourney,
  useUpdateJourneyStep,
  useCreateJourneyStep,
  useDeleteJourneyStep,
  useSeedJourneyFromTemplate,
} from "@/hooks/data";
import {
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  Settings2,
  Map,
  Sparkles,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface JourneyTabProps {
  clientId: string;
  readOnly?: boolean;
}

export function JourneyTab({ clientId, readOnly = false }: JourneyTabProps) {
  const { data: steps, isLoading, error } = useClientJourney(clientId);

  const updateStep = useUpdateJourneyStep();
  const createStep = useCreateJourneyStep();
  const deleteStep = useDeleteJourneyStep();
  const seedJourney = useSeedJourneyFromTemplate();

  const [configureMode, setConfigureMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"onboarding" | "recurring">("onboarding");

  // Edit / Add step dialog states
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any | null>(null); // null = adding new step
  const [stepLabel, setStepLabel] = useState("");
  const [stepDesc, setStepDesc] = useState("");
  const [stepPhase, setStepPhase] = useState<"onboarding" | "recurring">("onboarding");
  const [stepVisibility, setStepVisibility] = useState<"client" | "admin">("client");

  useEffect(() => {
    ensureJourneyAnimations();
  }, []);

  // Compute phases, progress, and the active current step
  const { onboarding, recurring, progress, currentStep } = useMemo(() => {
    if (!steps || steps.length === 0)
      return { onboarding: [], recurring: [], progress: 0, currentStep: null };

    const onb: typeof steps = [];
    const rec: typeof steps = [];

    for (const s of steps) {
      const phase = (s.metadata as Record<string, string> | null)?.phase;
      if (phase === "recurring") {
        rec.push(s);
      } else {
        onb.push(s);
      }
    }

    const total = steps.length;
    const completed = steps.filter((s) => s.status === "completed").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Current step definition: first step that is in_progress, or first that is upcoming
    const inProgress = steps.find((s) => s.status === "in_progress");
    const active = inProgress || steps.find((s) => s.status === "upcoming") || null;

    return { onboarding: onb, recurring: rec, progress: pct, currentStep: active };
  }, [steps]);

  // Audio trigger on load/mount of current step
  useEffect(() => {
    if (currentStep) {
      playChime("beep");
    }
  }, [currentStep?.id]);

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-[color:var(--status-danger)]/20">
        <span className="text-sm text-[color:var(--status-danger)]">
          Failed to load journey: {error.message}
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleStatusChange = async (stepId: string, newStatus: string) => {
    try {
      await updateStep.mutateAsync({
        id: stepId,
        client_id: clientId,
        status: newStatus,
      });
      if (newStatus === "completed") {
        playChime("success");
        toast.success("Step marked complete!");
      } else {
        toast.success("Step status updated");
      }
    } catch (err: any) {
      toast.error(`Failed to update step: ${err.message}`);
    }
  };

  const handleOpenStepDialog = (step: any | null = null) => {
    if (step) {
      setEditingStep(step);
      setStepLabel(step.step_label);
      setStepDesc((step.metadata as Record<string, string> | null)?.description ?? "");
      setStepPhase(
        ((step.metadata as Record<string, string> | null)?.phase as "onboarding" | "recurring") ??
          "onboarding",
      );
      setStepVisibility(
        ((step.metadata as Record<string, string> | null)?.visibility as "client" | "admin") ??
          "client",
      );
    } else {
      setEditingStep(null);
      setStepLabel("");
      setStepDesc("");
      setStepPhase(onboarding.length > 0 ? "recurring" : "onboarding");
      setStepVisibility("client");
    }
    setStepDialogOpen(true);
  };

  const handleSaveStep = async () => {
    if (!stepLabel.trim()) return;

    try {
      if (editingStep) {
        // Edit step
        const metadata = {
          ...((editingStep.metadata as Record<string, any>) || {}),
          description: stepDesc.trim(),
          phase: stepPhase,
          visibility: stepVisibility,
        };
        await updateStep.mutateAsync({
          id: editingStep.id,
          client_id: clientId,
          step_label: stepLabel.trim(),
          metadata,
        });
        toast.success("Step updated successfully!");
      } else {
        // Add step
        const metadata = {
          description: stepDesc.trim(),
          phase: stepPhase,
          visibility: stepVisibility,
        };
        await createStep.mutateAsync({
          client_id: clientId,
          step_key: `custom_${Date.now()}`,
          step_label: stepLabel.trim(),
          status: "upcoming",
          order_index: (steps?.length ?? 0) + 1,
          metadata,
        });
        toast.success("Journey step added!");
      }
      setStepDialogOpen(false);
    } catch (err: any) {
      toast.error(`Failed to save step: ${err.message}`);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm("Are you sure you want to delete this journey step?")) return;

    try {
      await deleteStep.mutateAsync({ id: stepId, client_id: clientId });
      toast.success("Journey step deleted");
    } catch (err: any) {
      toast.error(`Failed to delete step: ${err.message}`);
    }
  };

  const handleMoveStep = async (step: any, direction: "up" | "down") => {
    if (!steps) return;
    const currentIndex = steps.findIndex((s) => s.id === step.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const otherStep = steps[targetIndex];

    try {
      // Swap order indices
      await Promise.all([
        updateStep.mutateAsync({
          id: step.id,
          client_id: clientId,
          order_index: otherStep.order_index,
        }),
        updateStep.mutateAsync({
          id: otherStep.id,
          client_id: clientId,
          order_index: step.order_index,
        }),
      ]);
      toast.success("Step reordered");
    } catch (err: any) {
      toast.error(`Failed to reorder: ${err.message}`);
    }
  };

  const handleSeedTemplate = async () => {
    try {
      await seedJourney.mutateAsync({ clientId });
      toast.success("Successfully seeded journey from template!");
    } catch (err: any) {
      toast.error(`Failed to seed templates: ${err.message}`);
    }
  };

  // ── Empty state (Seeding Panel) ──
  if (!steps || steps.length === 0) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center gap-5 pt-8 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card border border-border-strong shadow-lg">
          <Map className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-foreground-strong flex items-center justify-center gap-1.5">
            Set Up Client Journey
          </p>
          <p className="text-xs text-foreground-disabled max-w-sm">
            This workspace does not have a content roadmap configured yet. Initialize from templates
            or configure from scratch.
          </p>
        </div>

        {!readOnly ? (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleSeedTemplate}
              disabled={seedJourney.isPending}
              className="gap-1.5"
            >
              {seedJourney.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Seed From Standard Template
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfigureMode(true);
                handleOpenStepDialog(null);
              }}
              className="border-border-strong hover:bg-foreground/[0.02]"
            >
              Configure Custom Timeline
            </Button>
          </div>
        ) : (
          <p className="text-xs text-foreground-disabled mt-2">
            Contact your strategist to configure your project onboarding steps.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 pt-6 md:grid-cols-[1fr_360px] md:gap-8 items-start">
      {/* ── Timeline Panel ────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "onboarding" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("onboarding")}
              className="text-xs"
            >
              Onboarding
            </Button>
            <Button
              variant={activeTab === "recurring" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("recurring")}
              className="text-xs"
            >
              Production Cycles
            </Button>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2.5">
              <Button
                variant={configureMode ? "default" : "outline"}
                size="sm"
                onClick={() => setConfigureMode(!configureMode)}
                className="gap-1.5 border-border-strong h-8 text-xs font-semibold"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {configureMode ? "Done Customizing" : "Configure Steps"}
              </Button>
              {configureMode && (
                <Button
                  size="sm"
                  onClick={() => handleOpenStepDialog(null)}
                  className="gap-1 h-8 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Step
                </Button>
              )}
            </div>
          )}
        </div>

        {activeTab === "onboarding" && (
          <div className="flex flex-col gap-3">
            {onboarding.length === 0 ? (
              <div className="text-center text-xs text-foreground-disabled py-10 border border-dashed border-border-strong rounded-xl bg-surface-card/20">
                No onboarding steps configured.
              </div>
            ) : (
              <div className="relative ml-[20px] border-l border-border-strong">
                {onboarding.map((step, idx) => {
                  const status = normalizeStatus(step.status);
                  const isCurrent = currentStep?.id === step.id;
                  const isMutating = updateStep.isPending && updateStep.variables?.id === step.id;

                  return (
                    <StepNode
                      key={step.id}
                      step={step}
                      title={step.step_label}
                      description={
                        (step.metadata as Record<string, string> | null)?.description ?? ""
                      }
                      status={status}
                      isCurrent={isCurrent}
                      isMutating={isMutating}
                      configureMode={configureMode}
                      readOnly={readOnly}
                      badge={statusBadgeText(step.status)}
                      onStatusChange={(newStatus) => handleStatusChange(step.id, newStatus)}
                      onEdit={() => handleOpenStepDialog(step)}
                      onDelete={() => handleDeleteStep(step.id)}
                      onMoveUp={idx > 0 ? () => handleMoveStep(step, "up") : undefined}
                      onMoveDown={
                        idx < onboarding.length - 1 ? () => handleMoveStep(step, "down") : undefined
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "recurring" && (
          <div className="flex flex-col gap-3">
            {recurring.length === 0 ? (
              <div className="text-center text-xs text-foreground-disabled py-10 border border-dashed border-border-strong rounded-xl bg-surface-card/20">
                No recurring production steps configured.
              </div>
            ) : (
              <div className="relative ml-[20px] border-l border-border-strong">
                {recurring.map((step, idx) => {
                  const status = normalizeStatus(step.status);
                  const isCurrent = currentStep?.id === step.id;
                  const isMutating = updateStep.isPending && updateStep.variables?.id === step.id;

                  return (
                    <StepNode
                      key={step.id}
                      step={step}
                      title={step.step_label}
                      description={
                        (step.metadata as Record<string, string> | null)?.description ?? ""
                      }
                      status={status}
                      isCurrent={isCurrent}
                      isMutating={isMutating}
                      configureMode={configureMode}
                      readOnly={readOnly}
                      badge={statusBadgeText(step.status)}
                      onStatusChange={(newStatus) => handleStatusChange(step.id, newStatus)}
                      onEdit={() => handleOpenStepDialog(step)}
                      onDelete={() => handleDeleteStep(step.id)}
                      onMoveUp={idx > 0 ? () => handleMoveStep(step, "up") : undefined}
                      onMoveDown={
                        idx < recurring.length - 1 ? () => handleMoveStep(step, "down") : undefined
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Progress Sidebar ─────────────────────────────── */}
      <div className="flex flex-col gap-6 rounded-xl border border-border-strong bg-surface-card p-6 shadow-md">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Journey Tracker
          </h4>
          <p className="text-[10px] text-foreground-disabled mt-0.5">
            Overall client roadmap progress
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-4xl font-extrabold tracking-tight text-foreground">
            {progress}%
          </span>
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-background border border-border-strong">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-foreground-muted leading-relaxed">
          {progress === 100
            ? "All journey steps have been completed! Great job! 🎉"
            : progress > 50
              ? "Over halfway through the roadmap. Keep it up!"
              : "Roadmap set up. Continue working on the current active step."}
        </p>

        {/* Step progress list */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-border-strong">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-disabled">
            Roadmap Status
          </span>
          <div className="space-y-2">
            {steps?.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-xs truncate max-w-[200px]",
                    s.status === "completed"
                      ? "text-foreground-disabled line-through"
                      : s.id === currentStep?.id
                        ? "text-primary font-semibold"
                        : "text-foreground-muted",
                  )}
                >
                  {s.step_label}
                </span>
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      s.status === "completed"
                        ? "var(--primary)"
                        : s.status === "in_progress"
                          ? "#ECD7FF"
                          : "var(--border)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Add / Edit Step Dialog ──────────────────────── */}
      <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
        <DialogContent className="bg-surface-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground-strong flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" />
              {editingStep ? "Edit Journey Step" : "Add Journey Step"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="step-label">Step Name</Label>
              <Input
                id="step-label"
                value={stepLabel}
                onChange={(e) => setStepLabel(e.target.value)}
                placeholder="e.g. Schedule Strategy Call"
                className="bg-surface-input border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="step-desc">Description</Label>
              <Input
                id="step-desc"
                value={stepDesc}
                onChange={(e) => setStepDesc(e.target.value)}
                placeholder="e.g. Fill out forms and choose your kickoff date"
                className="bg-surface-input border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="step-phase">Phase</Label>
                <Select value={stepPhase} onValueChange={(v) => setStepPhase(v as any)}>
                  <SelectTrigger id="step-phase" className="bg-surface-input border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="recurring">Recurring Cycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="step-visibility">Visibility</Label>
                <Select value={stepVisibility} onValueChange={(v) => setStepVisibility(v as any)}>
                  <SelectTrigger
                    id="step-visibility"
                    className="bg-surface-input border-border text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client & Admin</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setStepDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStep} disabled={!stepLabel.trim()}>
              Save Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Step Node Sub-component ──────────────────────────────────

function StepNode({
  step,
  title,
  description,
  status,
  isCurrent,
  isMutating,
  configureMode,
  readOnly,
  badge,
  onStatusChange,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  step: any;
  title: string;
  description: string;
  status: StepStatus;
  isCurrent: boolean;
  isMutating: boolean;
  configureMode: boolean;
  readOnly: boolean;
  badge: string;
  onStatusChange: (newStatus: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  return (
    <div className="relative pb-10 pl-12">
      {/* Circle Icon Indicator */}
      <div
        className={cn(
          "absolute left-[-21px] top-0 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 z-10",
          status === "completed"
            ? "bg-primary border-[4px] border-background"
            : status === "in_progress"
              ? "bg-surface-card border-[4px] border-background border-solid"
              : "bg-surface-card/60 border-[4px] border-background border-dashed",
        )}
        style={{
          boxShadow: isCurrent
            ? "0 0 0 1px var(--primary), 0 0 8px 2px color-mix(in_oklab,var(--primary)_40%,transparent)"
            : undefined,
        }}
      >
        {/* Radar ping dot for active current step */}
        {isCurrent && status !== "completed" && (
          <div className="absolute inset-0 rounded-xl bg-primary/20 pointer-events-none">
            <div className="absolute inset-0 rounded-xl bg-primary/40 animate-[ping-radar_2s_infinite_linear]" />
          </div>
        )}

        {status === "completed" && (
          <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
            <path
              d="M1 3.5L3.5 6L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {status === "in_progress" && (
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
        )}

        {status === "upcoming" && <div className="h-2 w-2 rounded bg-foreground-disabled" />}
      </div>

      {/* Main Step Card Container */}
      <div
        className={cn(
          "rounded-xl p-4 transition-all duration-300 bg-surface-card border relative",
          isCurrent && status !== "completed"
            ? "current-step-glowing border-primary/40"
            : status === "completed"
              ? "border-border-strong opacity-80"
              : "border-border-strong opacity-65 hover:opacity-100",
        )}
      >
        {/* Configure Mode Overlay / Controls */}
        {configureMode && !readOnly && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-background/90 border border-border-strong rounded-lg p-1 shadow-md z-20">
            {onMoveUp && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={onMoveUp}
                title="Move Up"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={onMoveDown}
                title="Move Down"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-foreground-muted hover:text-foreground"
              onClick={onEdit}
              title="Edit Step"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={onDelete}
              title="Delete Step"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="space-y-1 pr-14">
            <h3
              className={cn(
                "text-base font-bold text-foreground-strong tracking-tight",
                status === "completed" && "line-through text-foreground-disabled",
              )}
            >
              {title}
            </h3>
            {status === "in_progress" && (
              <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                Action Required
              </span>
            )}
          </div>

          <Badge
            className={cn(
              "text-[9px] uppercase font-bold tracking-wide border-none select-none px-2 py-0.5",
              status === "completed"
                ? "bg-emerald-500/10 text-emerald-400"
                : status === "in_progress"
                  ? "bg-primary/15 text-primary"
                  : "bg-foreground/[0.08] text-foreground-disabled",
            )}
          >
            {badge}
          </Badge>
        </div>

        {description && (
          <p className="mt-3 text-xs leading-relaxed text-foreground-muted">{description}</p>
        )}

        {/* Action button: mark complete or reopen */}
        {!readOnly && (
          <div className="mt-4 flex items-center gap-3">
            {status === "in_progress" && (
              <Button
                size="sm"
                onClick={() => onStatusChange("completed")}
                disabled={isMutating}
                className="gap-1.5 h-8 text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transition-all duration-300"
              >
                {isMutating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                    <path
                      d="M1 3.5L3.5 6L9 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                Mark Complete
              </Button>
            )}
            {status === "completed" && (
              <button
                disabled={isMutating}
                onClick={() => onStatusChange("in_progress")}
                className="text-[10px] font-semibold uppercase tracking-wide text-foreground-disabled hover:text-foreground transition-colors"
              >
                {isMutating ? "Updating..." : "Reopen Step"}
              </button>
            )}
            {status === "upcoming" && (
              <Button
                variant="outline"
                size="sm"
                disabled={isMutating}
                onClick={() => onStatusChange("in_progress")}
                className="gap-1.5 h-8 text-[10px] font-bold uppercase tracking-wide border-border-strong hover:bg-foreground/[0.01]"
              >
                {isMutating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="w-2.5 h-2.5" />
                )}
                Start Step
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
