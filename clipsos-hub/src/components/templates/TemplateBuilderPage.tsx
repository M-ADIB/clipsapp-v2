/**
 * TemplateBuilderPage — Full-page offer/template configuration.
 *
 * Route: /owner/templates/new (create) or /owner/templates/:id (edit)
 *
 * Sections (matching design screenshots):
 *   1. Identity — internal name + client-facing tagline
 *   2. Commercial Model — billing type + pricing
 *   3. Scope — deliverable model + computed stats
 *   4. Service Depth — who does the work
 *   5. Modules — included/available add-ons
 *   6. Workflow — journey template steps
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Plus, Save, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useCreateTemplate, useUpdateTemplate, useTemplateBySlug } from "@/hooks/use-template-builder";
import {
  type TemplateConfig,
  type BillingType,
  type ScopeModel,
  type ServiceDepth,
  type ModuleStatus,
  type TemplateModule,
  type JourneyStep,
  EMPTY_CONFIG,
  BILLING_OPTIONS,
  SCOPE_OPTIONS,
  DEPTH_OPTIONS,
  DEFAULT_JOURNEY_STEPS,
  slugifyStepKey,
  computeScopeStats,
} from "@/lib/templateBuilder";

// ─── Props ──────────────────────────────────────────────────────────────────

interface TemplateBuilderPageProps {
  templateSlug?: string; // undefined = create mode
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TemplateBuilderPage({ templateSlug }: TemplateBuilderPageProps) {
  const navigate = useNavigate();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const isEditMode = !!templateSlug;

  const { data: existing, isLoading } = useTemplateBySlug(templateSlug);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [config, setConfig] = useState<TemplateConfig>(EMPTY_CONFIG);

  // Populate on edit
  useEffect(() => {
    if (existing) {
      setDisplayName(existing.display_name);
      const saved = existing.config as unknown as TemplateConfig | null;
      if (saved) {
        setConfig({ ...EMPTY_CONFIG, ...saved });
      }
    }
  }, [existing]);

  // Header
  useEffect(() => {
    setHeaderConfig({ title: isEditMode ? "Edit Template" : "New Template" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, isEditMode]);

  // ── Config updater ──────────────────────────────────────────────────────

  const updateConfig = useCallback(
    <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ── Module helpers ──────────────────────────────────────────────────────

  const addModule = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          id: crypto.randomUUID(),
          name: "",
          description: "",
          status: "off" as ModuleStatus,
        },
      ],
    }));
  }, []);

  const updateModule = useCallback((id: string, patch: Partial<TemplateModule>) => {
    setConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const removeModule = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== id),
    }));
  }, []);

  // ── Step helpers ────────────────────────────────────────────────────────

  const addStep = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setConfig((prev) => ({
      ...prev,
      journey_steps: [
        ...prev.journey_steps,
        {
          key: slugifyStepKey(trimmed) || `step_${Date.now()}`,
          label: trimmed,
          order: prev.journey_steps.length + 1,
        },
      ],
    }));
  }, []);

  const removeStep = useCallback((key: string) => {
    setConfig((prev) => ({
      ...prev,
      journey_steps: prev.journey_steps
        .filter((s) => s.key !== key)
        .map((s, i) => ({ ...s, order: i + 1 })),
    }));
  }, []);

  const loadDefaultSteps = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      journey_steps: [...DEFAULT_JOURNEY_STEPS],
    }));
  }, []);

  // ── Scope stats ─────────────────────────────────────────────────────────

  const stats = useMemo(() => computeScopeStats(config), [config]);

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const name = displayName.trim() || config.internal_name.trim();
    if (!name) {
      toast.error("Template name is required");
      return;
    }

    try {
      if (isEditMode && existing?.id) {
        await updateTemplate.mutateAsync({
          id: existing.id,
          display_name: name,
          config,
        });
        toast.success("Template updated");
      } else {
        await createTemplate.mutateAsync({
          display_name: name,
          slug: slugifyStepKey(name) || `template_${Date.now()}`,
          config,
        });
        toast.success("Template created");
      }
      navigate({ to: "/owner/templates" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Failed to save template", { description: message });
    }
  }, [displayName, config, isEditMode, existing?.id, createTemplate, updateTemplate, navigate]);

  // ── Loading state ───────────────────────────────────────────────────────

  if (isEditMode && isLoading) {
    return (
      <FullBleed>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
        </div>
      </FullBleed>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <FullBleed>
      {/* ── Top Bar ──────────────────────────────────── */}
      <div className="flex h-[52px] items-center gap-3 border-b border-white/[0.08] px-4 md:px-6">
        <button
          onClick={() => navigate({ to: "/owner/templates" })}
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0" />
        <Button size="sm" disabled={isSaving} onClick={handleSave} className="gap-1.5">
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isEditMode ? "Update" : "Save Template"}
        </Button>
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 md:px-6 md:py-10">
          {/* ── Section 1: Identity ────────────────────── */}
          <SectionCard label="IDENTITY" title="Offer name & positioning">
            <div className="space-y-4">
              <FieldRow label="Internal name">
                <Input
                  placeholder="e.g. ClipsOS Q2 build"
                  value={config.internal_name}
                  onChange={(e) => updateConfig("internal_name", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="Client-facing tagline">
                <Input
                  placeholder="e.g. Build & own your content system"
                  value={config.tagline}
                  onChange={(e) => updateConfig("tagline", e.target.value)}
                />
              </FieldRow>
            </div>
          </SectionCard>

          {/* ── Section 2: Commercial Model ────────────── */}
          <SectionCard label="COMMERCIAL MODEL" title="How is this billed?">
            <div className="space-y-4">
              <TogglePills
                options={BILLING_OPTIONS}
                value={config.billing_type}
                onChange={(v) => updateConfig("billing_type", v)}
              />
              <div className="grid grid-cols-3 gap-3">
                {(config.billing_type === "one_time" || config.billing_type === "hybrid") && (
                  <FieldRow label="Setup fee">
                    <CurrencyInput
                      value={config.setup_fee}
                      currency={config.currency}
                      onChange={(v) => updateConfig("setup_fee", v)}
                    />
                  </FieldRow>
                )}
                {(config.billing_type === "recurring" || config.billing_type === "hybrid") && (
                  <FieldRow label="Recurring">
                    <CurrencyInput
                      value={config.recurring_fee}
                      currency={config.currency}
                      suffix="/ month"
                      onChange={(v) => updateConfig("recurring_fee", v)}
                    />
                  </FieldRow>
                )}
                <FieldRow label="Duration">
                  <Input
                    placeholder="e.g. 6 months"
                    value={config.duration}
                    onChange={(e) => updateConfig("duration", e.target.value)}
                  />
                </FieldRow>
              </div>
              <FieldRow label="Currency">
                <Input
                  placeholder="AED"
                  value={config.currency}
                  onChange={(e) => updateConfig("currency", e.target.value.toUpperCase())}
                  className="max-w-[100px]"
                />
              </FieldRow>
            </div>
          </SectionCard>

          {/* ── Section 3: Scope ───────────────────────── */}
          <SectionCard label="SCOPE" title="What gets produced">
            <div className="space-y-4">
              <TogglePills
                options={SCOPE_OPTIONS}
                value={config.scope_model}
                onChange={(v) => updateConfig("scope_model", v)}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FieldRow label="Deliverable type">
                  <Input
                    placeholder="Short-form video"
                    value={config.deliverable_type}
                    onChange={(e) => updateConfig("deliverable_type", e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Cycles">
                  <Input
                    type="number"
                    min={1}
                    value={config.cycles ?? ""}
                    onChange={(e) =>
                      updateConfig("cycles", e.target.value ? parseInt(e.target.value) : null)
                    }
                  />
                </FieldRow>
                <FieldRow label="Per cycle">
                  <Input
                    type="number"
                    min={1}
                    value={config.per_cycle ?? ""}
                    onChange={(e) =>
                      updateConfig("per_cycle", e.target.value ? parseInt(e.target.value) : null)
                    }
                  />
                </FieldRow>
                <FieldRow label="Contributors">
                  <Input
                    type="number"
                    min={1}
                    value={config.contributors ?? ""}
                    onChange={(e) =>
                      updateConfig("contributors", e.target.value ? parseInt(e.target.value) : null)
                    }
                  />
                </FieldRow>
              </div>
              {/* Computed stat pills */}
              {config.scope_model === "per_cycle" && config.cycles && config.per_cycle && (
                <div className="grid grid-cols-4 gap-2">
                  <StatPill label="Total" value={stats.total} />
                  <StatPill label="Per cycle" value={stats.perCycle} />
                  <StatPill label="Per shoot" value={stats.perShoot} />
                  <StatPill label="Per week" value={stats.perWeek} />
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Section 4: Service Depth ───────────────── */}
          <SectionCard label="SERVICE DEPTH" title="Who does the work?">
            <TogglePills
              options={DEPTH_OPTIONS}
              value={config.service_depth}
              onChange={(v) => updateConfig("service_depth", v)}
            />
          </SectionCard>

          {/* ── Section 5: Modules ─────────────────────── */}
          <SectionCard label="MODULES" title="What's included or available">
            <div className="space-y-3">
              {config.modules.length === 0 && (
                <p className="text-xs text-foreground-muted py-2">
                  No modules added yet. Click below to add one.
                </p>
              )}
              {config.modules.map((mod) => (
                <ModuleRow
                  key={mod.id}
                  module={mod}
                  onUpdate={(patch) => updateModule(mod.id, patch)}
                  onRemove={() => removeModule(mod.id)}
                />
              ))}
              <button
                onClick={addModule}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add module
              </button>
            </div>
          </SectionCard>

          {/* ── Section 6: Workflow ────────────────────── */}
          <SectionCard label="WORKFLOW" title="Journey template">
            <div className="space-y-3">
              {config.journey_steps.length === 0 && (
                <p className="text-xs text-foreground-muted py-2">
                  No steps defined.{" "}
                  <button onClick={loadDefaultSteps} className="text-primary hover:underline">
                    Load default template
                  </button>
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {config.journey_steps.map((step) => (
                  <div
                    key={step.key}
                    className="group flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-3 text-sm"
                  >
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-foreground-disabled" />
                    <span className="text-foreground-muted font-medium">{step.order} ·</span>
                    <span className="flex-1 truncate">{step.label}</span>
                    <button
                      onClick={() => removeStep(step.key)}
                      className="opacity-0 group-hover:opacity-100 text-foreground-muted hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <AddStepInline onAdd={addStep} />
            </div>
          </SectionCard>
        </div>
      </div>
    </FullBleed>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70 mb-1">
        {label}
      </p>
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground-muted">{label}</Label>
      {children}
    </div>
  );
}

function TogglePills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            value === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-white/[0.08] text-foreground-muted hover:border-white/20 hover:bg-surface-raised"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CurrencyInput({
  value,
  currency,
  suffix,
  onChange,
}: {
  value: number | null;
  currency: string;
  suffix?: string;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-foreground-muted shrink-0">{currency}</span>
      <Input
        type="number"
        min={0}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
        className="h-9"
      />
      {suffix && (
        <span className="text-xs text-foreground-muted shrink-0 whitespace-nowrap">{suffix}</span>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-primary/[0.06] border border-primary/10 px-3 py-2.5">
      <span className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

function ModuleRow({
  module: mod,
  onUpdate,
  onRemove,
}: {
  module: TemplateModule;
  onUpdate: (patch: Partial<TemplateModule>) => void;
  onRemove: () => void;
}) {
  const MODULE_STATUSES: { value: ModuleStatus; label: string }[] = [
    { value: "off", label: "Off" },
    { value: "addon", label: "Add-on" },
    { value: "bundled", label: "Bundled" },
  ];

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
      <div className="flex-1 min-w-0 space-y-1">
        <Input
          placeholder="Module name"
          value={mod.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-8 border-0 px-0 text-sm font-medium shadow-none focus-visible:ring-0"
        />
        <Input
          placeholder="Short description"
          value={mod.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="h-6 border-0 px-0 text-xs text-foreground-muted shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {MODULE_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => onUpdate({ status: s.value })}
            className={`rounded-md border px-3 py-1 text-[11px] font-medium transition-all ${
              mod.status === s.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/[0.08] text-foreground-muted hover:border-white/20"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button
        onClick={onRemove}
        className="text-foreground-muted hover:text-destructive transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AddStepInline({ onAdd }: { onAdd: (label: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    if (value.trim()) {
      onAdd(value);
      setValue("");
      setAdding(false);
    }
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add step
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Step name..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="h-8 text-sm"
        autoFocus
      />
      <Button size="sm" onClick={submit} className="h-8 text-xs">
        Add
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setValue("");
          setAdding(false);
        }}
        className="h-8 text-xs"
      >
        Cancel
      </Button>
    </div>
  );
}
