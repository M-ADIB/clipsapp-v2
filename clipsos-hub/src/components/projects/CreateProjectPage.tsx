/**
 * CreateProjectPage — Full-page multi-step project builder (orchestrator).
 *
 * Route: /owner/projects/new  (standalone — 4 steps incl. client selection)
 * Embedded: Project Builder tab (3 steps — client step skipped entirely)
 *
 * Standalone steps:
 *   0. Select a client (or skip for template-only)
 *   1. Project basics (template, name, cadence, video count, dates, posting days, notes)
 *   2. Offer configuration (identity, commercial model, scope, depth, modules, workflow)
 *   3. Review & submit
 *
 * Builder tab steps (embedded=true):
 *   0. Project basics
 *   1. Offer configuration
 *   2. Review & submit
 *
 * Sub-components live in sibling files:
 *   - builder-types.ts       — shared types & constants
 *   - builder-primitives.tsx  — reusable UI atoms
 *   - ClientStep.tsx          — Step 0 (standalone only)
 *   - BasicsStep.tsx          — Step 1 / 0
 *   - OfferConfigStep.tsx     — Step 2 / 1
 *   - ReviewStep.tsx          — Step 3 / 2
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2, Save, Sparkles } from "lucide-react";
import { useClients } from "@/hooks/data";
import { useProjectTypeTemplates } from "@/hooks/data";
import { useCreateProject, useCreateCycle } from "@/hooks/data";
import { useCreateTemplate, useUpdateTemplate } from "@/hooks/use-template-builder";
import type { ProjectCadence } from "@/integrations/supabase/db-types";
import { toast } from "sonner";
import {
  type TemplateConfig,
  type ModuleStatus,
  type TemplateModule,
  EMPTY_CONFIG,
  DEFAULT_JOURNEY_STEPS,
  slugifyStepKey,
} from "@/lib/templateBuilder";

import {
  type BuilderFormData,
  INITIAL_FORM,
  STEP_LABELS_FULL,
  STEP_LABELS_BUILDER,
} from "./builder-types";
import { ClientStep } from "./ClientStep";
import { BasicsStep } from "./BasicsStep";
import { OfferConfigStep } from "./OfferConfigStep";
import { ReviewStep } from "./ReviewStep";

// ─── Orchestrator ───────────────────────────────────────────────────────────

export function CreateProjectPage({ embedded }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const { role, tenantId } = useAuth();
  const basePath = role === "manager" ? "/manager" : "/owner";
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  // When embedded (Project Builder tab), skip client step entirely
  const stepLabels = embedded ? STEP_LABELS_BUILDER : STEP_LABELS_FULL;
  // Offset maps the current step index to the "content step" index.
  // Standalone: step 0 = client, step 1 = basics, step 2 = offer, step 3 = review
  // Embedded:   step 0 = basics,  step 1 = offer,  step 2 = review
  const stepOffset = embedded ? 1 : 0;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BuilderFormData>(INITIAL_FORM);
  const [clientSearch, setClientSearch] = useState("");

  // Header config — only when NOT embedded inside a tabbed parent
  useEffect(() => {
    if (embedded) return;
    setHeaderConfig({ title: "New Project" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, embedded]);

  // Data hooks
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: templates, isLoading: loadingTemplates } = useProjectTypeTemplates();
  const createProject = useCreateProject();
  const createCycle = useCreateCycle();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const isSubmitting =
    createProject.isPending ||
    createCycle.isPending ||
    createTemplate.isPending ||
    updateTemplate.isPending;

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, clientSearch]);

  const selectedTemplate = useMemo(
    () => templates?.find((t) => t.id === form.templateId),
    [templates, form.templateId],
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const updateForm = useCallback(
    <K extends keyof BuilderFormData>(key: K, value: BuilderFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateConfig = useCallback(
    <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
      setForm((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }));
    },
    [],
  );

  const selectClient = useCallback((id: string, name: string) => {
    setForm((prev) => ({ ...prev, clientId: id, clientName: name }));
    setStep(1);
  }, []);

  const selectTemplate = useCallback(
    (templateId: string) => {
      const tmpl = templates?.find((t) => t.id === templateId);
      if (!tmpl) return;
      const savedConfig = tmpl.config as unknown as TemplateConfig | null;
      setForm((prev) => ({
        ...prev,
        templateId,
        projectName: prev.projectName || `${prev.clientName} — ${tmpl.display_name}`,
        cadence: (tmpl.default_cadence as ProjectCadence) || prev.cadence,
        videoCount: tmpl.default_video_count || prev.videoCount,
        postingDays: tmpl.default_posting_days || prev.postingDays,
        config: savedConfig ? { ...EMPTY_CONFIG, ...savedConfig } : prev.config,
      }));
    },
    [templates],
  );

  const togglePostingDay = useCallback((day: string) => {
    setForm((prev) => ({
      ...prev,
      postingDays: prev.postingDays.includes(day)
        ? prev.postingDays.filter((d) => d !== day)
        : [...prev.postingDays, day],
    }));
  }, []);

  // ── Module helpers ──────────────────────────────────────────────────────

  const addModule = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        modules: [
          ...prev.config.modules,
          { id: crypto.randomUUID(), name: "", description: "", status: "off" as ModuleStatus },
        ],
      },
    }));
  }, []);

  const updateModule = useCallback((id: string, patch: Partial<TemplateModule>) => {
    setForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        modules: prev.config.modules.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    }));
  }, []);

  const removeModule = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      config: { ...prev.config, modules: prev.config.modules.filter((m) => m.id !== id) },
    }));
  }, []);

  // ── Step helpers ────────────────────────────────────────────────────────

  const addStep = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        journey_steps: [
          ...prev.config.journey_steps,
          {
            key: slugifyStepKey(trimmed) || `step_${Date.now()}`,
            label: trimmed,
            order: prev.config.journey_steps.length + 1,
          },
        ],
      },
    }));
  }, []);

  const removeStep = useCallback((key: string) => {
    setForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        journey_steps: prev.config.journey_steps
          .filter((s) => s.key !== key)
          .map((s, i) => ({ ...s, order: i + 1 })),
      },
    }));
  }, []);

  const loadDefaultSteps = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      config: { ...prev.config, journey_steps: [...DEFAULT_JOURNEY_STEPS] },
    }));
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    try {
      // Validate template name
      const tName = form.config.internal_name || form.projectName || "";
      if ((form.saveAsTemplate || !form.clientId) && !tName.trim()) {
        toast.error("Template name required", {
          description: "Enter a project name or internal name before saving.",
        });
        return;
      }

      // Save as template (if toggled OR if no client selected)
      if (form.saveAsTemplate || !form.clientId) {
        // Smart update-vs-create: if loaded from an existing template, update it
        if (form.templateId) {
          await updateTemplate.mutateAsync({
            id: form.templateId,
            display_name: tName,
            config: form.config,
            default_cadence: form.cadence,
            default_video_count: form.videoCount,
            default_posting_days: form.postingDays.length > 0 ? form.postingDays : undefined,
          });
        } else {
          await createTemplate.mutateAsync({
            display_name: tName,
            slug: slugifyStepKey(tName) || `template_${Date.now()}`,
            config: form.config,
            default_cadence: form.cadence,
            default_video_count: form.videoCount,
            default_posting_days: form.postingDays.length > 0 ? form.postingDays : undefined,
          });
        }
      }

      // If no client — we're done (template-only flow)
      if (!form.clientId) {
        toast.success(form.templateId ? "Template updated" : "Template saved", {
          description: `"${tName}" ${form.templateId ? "updated" : "saved as a reusable template"}.`,
        });
        navigate({ to: `${basePath}/projects` as "/owner/projects" });
        return;
      }

      // Full project creation
      const project = await createProject.mutateAsync({
        client_id: form.clientId,
        project_name: form.projectName,
        project_type_template_id: form.templateId || null,
        cadence: form.cadence,
        video_count: form.videoCount,
        start_date: form.startDate,
        posting_days: form.postingDays.length > 0 ? form.postingDays : null,
        notes: form.notes || null,
        status: "not_started",
      });

      await createCycle.mutateAsync({
        project_id: project.id,
        client_id: form.clientId,
        cycle_number: 1,
        name: "Cycle 1",
        start_date: form.startDate,
      });

      // Seed client journey steps if they are configured
      const stepsToInsert =
        form.config.journey_steps && form.config.journey_steps.length > 0
          ? form.config.journey_steps
          : DEFAULT_JOURNEY_STEPS;

      if (stepsToInsert.length > 0) {
        const journeyStepsToInsert = stepsToInsert.map((s, index) => ({
          tenant_id: tenantId!,
          client_id: form.clientId,
          step_key: s.key,
          step_label: s.label,
          status: index === 0 ? "in_progress" : "pending",
          order_index: s.order || index + 1,
          metadata: {
            phase: s.key.includes("weekly") || s.key.includes("batch") ? "recurring" : "onboarding",
            description: s.label,
          },
        }));

        await supabase.from("client_journey_steps").insert(journeyStepsToInsert);
      }

      toast.success("Project created", {
        description: `"${form.projectName}" is ready with Cycle 1.${form.saveAsTemplate ? " Template saved." : ""}`,
      });

      navigate({ to: `${basePath}/projects` as "/owner/projects" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Failed to create project", { description: message });
    }
  }, [
    form,
    createProject,
    createCycle,
    createTemplate,
    updateTemplate,
    navigate,
    basePath,
    tenantId,
  ]);

  // Content step = which content panel is showing (0=client, 1=basics, 2=offer, 3=review)
  const contentStep = step + stepOffset;

  const canProceed =
    contentStep === 0
      ? true // Client is optional — can skip
      : contentStep === 1
        ? !!form.projectName && form.videoCount > 0
        : contentStep === 2
          ? true
          : true;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <FullBleed>
      {/* ── Top Bar ──────────────────────────────────── */}
      <div className="flex h-[52px] items-center gap-3 border-b border-white/[0.08] px-4 md:px-6">
        {/* Back arrow — hidden in embedded mode at first step (nowhere to go) */}
        {!(embedded && step === 0) && (
          <button
            onClick={() =>
              step > 0
                ? setStep((s) => s - 1)
                : navigate({ to: `${basePath}/projects` as "/owner/projects" })
            }
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">
            {embedded ? "Project Builder" : "New Project"}
          </h1>
        </div>

        {/* Step indicator — pill style */}
        <div className="hidden items-center gap-1 sm:flex">
          {stepLabels.map((label, i) => (
            <button
              key={label}
              onClick={() => {
                if (i < step) setStep(i);
              }}
              disabled={i > step}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "bg-surface-raised text-foreground-disabled"
              }`}
            >
              {i < step ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[10px]">
                  {i + 1}
                </span>
              )}
              {label}
            </button>
          ))}
        </div>

        {/* Mobile step dots */}
        <div className="flex items-center gap-1 sm:hidden">
          {stepLabels.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary/60" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 md:py-10">
          {/* Step title */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {stepLabels[step]}
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              {contentStep === 0
                ? embedded
                  ? "Set up the project details and schedule."
                  : "Choose the client this project belongs to."
                : contentStep === 1
                  ? "Set up the project details and schedule."
                  : contentStep === 2
                    ? "Define the offer, pricing, scope, and workflow."
                    : "Everything looks good? Let's launch it."}
            </p>
          </div>

          {/* Step content — contentStep maps to actual panels regardless of mode */}
          {contentStep === 0 && (
            <ClientStep
              clients={filteredClients}
              loading={loadingClients}
              selectedId={form.clientId}
              search={clientSearch}
              onSearchChange={setClientSearch}
              onSelect={selectClient}
            />
          )}

          {contentStep === 1 && (
            <BasicsStep
              form={form}
              templates={templates ?? []}
              loadingTemplates={loadingTemplates}
              onUpdateForm={updateForm}
              onSelectTemplate={selectTemplate}
              onToggleDay={togglePostingDay}
            />
          )}

          {contentStep === 2 && (
            <OfferConfigStep
              form={form}
              onUpdateConfig={updateConfig}
              onAddModule={addModule}
              onUpdateModule={updateModule}
              onRemoveModule={removeModule}
              onAddStep={addStep}
              onRemoveStep={removeStep}
              onLoadDefaultSteps={loadDefaultSteps}
            />
          )}

          {contentStep === 3 && (
            <ReviewStep form={form} templateName={selectedTemplate?.display_name} />
          )}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 md:px-6 md:py-4">
        <p className="text-[11px] text-foreground-muted">
          Step {step + 1} of {stepLabels.length}
        </p>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {/* Save as Template — always visible (in builder, shown from step 0+; standalone from step 1+) */}
          {contentStep >= 1 && (
            <Button
              variant={form.saveAsTemplate ? "secondary" : "outline"}
              size="sm"
              onClick={() => updateForm("saveAsTemplate", !form.saveAsTemplate)}
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {form.saveAsTemplate ? "Template ✓" : "Save as Template"}
            </Button>
          )}
          {step < stepLabels.length - 1 ? (
            <Button
              size="sm"
              disabled={!canProceed}
              onClick={() => setStep((s) => s + 1)}
              className="gap-1.5"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" disabled={isSubmitting} onClick={handleSubmit} className="gap-1.5">
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {form.clientId ? "Create Project" : "Save Template"}
            </Button>
          )}
        </div>
      </div>
    </FullBleed>
  );
}
