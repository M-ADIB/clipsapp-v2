/**
 * PublicFormPage — Premium landing page for published forms.
 * Route: /f/:slug (outside _authenticated layout)
 *
 * Supports: single-page, multi-step, VSL funnel forms.
 * Reads form settings from forms.settings JSONB.
 */
import { useState, useMemo, useCallback } from "react";
import { useParams } from "@tanstack/react-router";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { usePublicForm, useSubmitPublicForm } from "@/hooks/data";
import { FieldRenderer } from "./PublicFieldRenderers";
import { isFieldVisible, checkFieldAction, evaluateRule } from "./logic-engine";
import type { FormStep, FormEnding, ConditionalRule } from "../form-builder-types";
import type { Json } from "@/integrations/supabase/db-types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSettings(settings: Json): Record<string, unknown> {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return settings as Record<string, unknown>;
  }
  return {};
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (url.includes("embed") || url.includes("player")) return url;
  return null;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── Main Component ───────────────────────────────────────────────────────────

export function PublicFormPage() {
  const { slug } = useParams({ from: "/f/$slug" });
  const { data, isLoading, error } = usePublicForm(slug);
  const submitMutation = useSubmitPublicForm();

  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeEnding, setActiveEnding] = useState<FormEnding | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading form…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-10">
          <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-zinc-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">Form not found</h1>
          <p className="text-sm text-zinc-400">This form may have been closed or doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { form, fields } = data;
  const settings = getSettings(form.settings);
  const accentColor = (settings.accent_color as string) || "#7C3AED";
  const coverImageUrl = settings.cover_image_url as string | undefined;
  const formType = form.form_type || "custom";

  // Parse steps & endings from settings
  const steps: FormStep[] = Array.isArray(settings.steps) ? (settings.steps as FormStep[]) : [];
  const endings: FormEnding[] = Array.isArray(settings.endings)
    ? (settings.endings as FormEnding[])
    : [];
  const isMultiStep = (formType === "multi_step" || formType === "vsl_funnel") && steps.length > 0;

  // Legacy single-page VSL
  const vslEnabled = !isMultiStep && (settings.vsl_enabled as boolean);
  const vslUrl = settings.vsl_url as string | undefined;
  const vslHeadline = settings.vsl_headline as string | undefined;

  // Default ending fallback
  const defaultEnding: FormEnding = endings.find((e) => e.is_default) ?? {
    id: "default",
    title: (settings.thank_you_title as string) || "Thank you!",
    message: (settings.thank_you_message as string) || "Your response has been recorded.",
    redirect_url: (settings.redirect_url as string) || undefined,
    is_default: true,
  };

  // ── Field filtering ──
  const getStepFields = (stepIndex: number) => {
    return fields
      .filter((f) => (typeof f.step === "number" ? f.step : 0) === stepIndex)
      .filter((f) => {
        const logic = f.conditional_logic as ConditionalRule | null;
        return isFieldVisible(logic, responses);
      });
  };

  const totalSteps = isMultiStep ? steps.length : 1;
  const visibleFields = isMultiStep
    ? getStepFields(currentStep)
    : fields.filter((f) => {
        const logic = f.conditional_logic as ConditionalRule | null;
        return isFieldVisible(logic, responses);
      });

  // ── Step progress for multi-step ──
  const stepProgress = isMultiStep
    ? Math.round(((currentStep + 1) / totalSteps) * 100)
    : (() => {
        const required = visibleFields.filter((f) => f.is_required);
        const answered = required.filter(
          (f) =>
            responses[f.id] != null &&
            responses[f.id] !== "" &&
            !(Array.isArray(responses[f.id]) && (responses[f.id] as unknown[]).length === 0),
        );
        return required.length > 0 ? Math.round((answered.length / required.length) * 100) : 0;
      })();

  // ── Validation (per-step or all) ──
  function validateFields(fieldsToValidate: typeof fields): boolean {
    const errors: Record<string, string> = {};
    for (const field of fieldsToValidate) {
      const logic = field.conditional_logic as ConditionalRule | null;
      if (!isFieldVisible(logic, responses)) continue;
      if (
        field.field_type === "hidden" ||
        field.field_type === "heading" ||
        field.field_type === "paragraph"
      )
        continue;

      if (field.is_required) {
        const val = responses[field.id];
        if (
          val == null ||
          val === "" ||
          val === false ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[field.id] = "This field is required";
        }
      }
      if (field.field_type === "email" && responses[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(responses[field.id]))) {
          errors[field.id] = "Please enter a valid email";
        }
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Check for disqualification/routing after field changes ──
  function checkRouting(): { action: string; target?: string } | null {
    for (const field of visibleFields) {
      const logic = field.conditional_logic as ConditionalRule | null;
      const result = checkFieldAction(logic, responses);
      if (result) return result;
    }
    return null;
  }

  // ── Navigate steps ──
  function handleNext() {
    if (!validateFields(visibleFields)) return;

    // Check routing actions
    const routing = checkRouting();
    if (routing) {
      if (routing.action === "disqualify" || routing.action === "end") {
        const targetEnding = endings.find((e) => e.id === routing.target) ?? defaultEnding;
        setActiveEnding(targetEnding);
        setSubmitted(true);
        return;
      }
      if (routing.action === "skip_to_step" && routing.target) {
        const targetIdx = steps.findIndex((s) => s.id === routing.target);
        if (targetIdx >= 0) {
          setCurrentStep(targetIdx);
          return;
        }
      }
    }

    if (isMultiStep && currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      setValidationErrors({});
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setValidationErrors({});
    }
  }

  function setValue(fieldId: string, value: unknown) {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
    setValidationErrors((prev) => {
      const n = { ...prev };
      delete n[fieldId];
      return n;
    });
  }

  // ── Submit ──
  async function handleSubmit() {
    const allVisible = fields.filter((f) => {
      const logic = f.conditional_logic as ConditionalRule | null;
      return isFieldVisible(logic, responses);
    });
    if (!validateFields(allVisible)) return;

    const emailField = fields.find((f) => f.field_type === "email");
    const nameField = fields.find((f) => f.field_type === "short_text" && /name/i.test(f.label));

    try {
      await submitMutation.mutateAsync({
        formId: form.id,
        data: responses,
        tenantId: form.tenant_id,
        submitterEmail: emailField ? (responses[emailField.id] as string) : undefined,
        submitterName: nameField ? (responses[nameField.id] as string) : undefined,
      });
      setActiveEnding(defaultEnding);
      setSubmitted(true);
    } catch {
      setValidationErrors({ _form: "Something went wrong. Please try again." });
    }
  }

  // ── Thank You Screen ──
  if (submitted && activeEnding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="max-w-md w-full text-center space-y-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-10">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-500"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <CheckCircle2
              className="h-8 w-8 animate-in fade-in duration-700 delay-200"
              style={{ color: accentColor }}
            />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-300">
            {activeEnding.title}
          </h1>
          <p className="text-sm text-zinc-400 animate-in fade-in-0 duration-500 delay-500">
            {activeEnding.message}
          </p>
          {activeEnding.redirect_url && (
            <Button
              asChild
              className="mt-3 animate-in fade-in-0 duration-500 delay-700"
              style={{ backgroundColor: accentColor, color: "#fff" }}
            >
              <a href={activeEnding.redirect_url}>
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Current step definition ──
  const activeStepDef = isMultiStep ? steps[currentStep] : undefined;
  const isVideoStep = activeStepDef?.type === "video";
  const embedUrl = useMemo(() => {
    if (isVideoStep && activeStepDef?.video_url) return getEmbedUrl(activeStepDef.video_url);
    if (vslEnabled && vslUrl) return getEmbedUrl(vslUrl);
    return null;
  }, [isVideoStep, activeStepDef, vslEnabled, vslUrl]);

  const isLastStep = isMultiStep ? currentStep === totalSteps - 1 : true;

  // ── Render ──
  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={
        {
          "--form-accent": accentColor,
          "--form-accent-light": lighten(accentColor, 60),
        } as React.CSSProperties
      }
    >
      {/* Hero Header */}
      <div className="relative">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ background: `radial-gradient(ellipse at top, ${accentColor}, transparent 70%)` }}
        />
        {coverImageUrl && (
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img src={coverImageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
          </div>
        )}
        <div className={`relative max-w-2xl mx-auto px-5 ${coverImageUrl ? "-mt-12" : "pt-12"}`}>
          <div className="space-y-3 pb-6">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-base text-zinc-400 leading-relaxed max-w-lg">{form.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-16">
        {/* Step indicator (multi-step) */}
        {isMultiStep && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Step {currentStep + 1} of {totalSteps}
                {activeStepDef?.title && (
                  <span className="ml-2 text-zinc-400">— {activeStepDef.title}</span>
                )}
              </span>
              <span
                className="font-medium tabular-nums"
                style={{ color: stepProgress === 100 ? "#4ade80" : accentColor }}
              >
                {stepProgress}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${stepProgress}%`,
                  background:
                    stepProgress === 100
                      ? "linear-gradient(90deg, #4ade80, #22c55e)"
                      : `linear-gradient(90deg, ${accentColor}, ${lighten(accentColor, 40)})`,
                }}
              />
            </div>
            {/* Step dots */}
            <div className="flex justify-center gap-2 pt-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-6" : "w-1.5"
                  }`}
                  style={{ backgroundColor: i <= currentStep ? accentColor : "rgb(63 63 70)" }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Single-page progress (non multi-step) */}
        {!isMultiStep &&
          (() => {
            const required = visibleFields.filter((f) => f.is_required);
            if (required.length === 0) return null;
            return (
              <div className="mb-8 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Progress</span>
                  <span
                    className="font-medium tabular-nums"
                    style={{ color: stepProgress === 100 ? "#4ade80" : accentColor }}
                  >
                    {stepProgress}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${stepProgress}%`,
                      background:
                        stepProgress === 100
                          ? "linear-gradient(90deg, #4ade80, #22c55e)"
                          : `linear-gradient(90deg, ${accentColor}, ${lighten(accentColor, 40)})`,
                    }}
                  />
                </div>
              </div>
            );
          })()}

        {/* VSL Video (single-page or video step) */}
        {embedUrl && (
          <div className="mb-10 space-y-3">
            {(vslHeadline || activeStepDef?.headline) && (
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 flex-shrink-0" style={{ color: accentColor }} />
                <p className="text-sm font-medium text-zinc-300">
                  {activeStepDef?.headline || vslHeadline}
                </p>
              </div>
            )}
            <div className="relative rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-900/30">
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  title="Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Fields (skip for pure video steps) */}
        {!isVideoStep && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="space-y-7"
          >
            {visibleFields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={responses[field.id]}
                error={validationErrors[field.id]}
                onChange={(val) => setValue(field.id, val)}
                accentColor={accentColor}
              />
            ))}

            {validationErrors._form && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{validationErrors._form}</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {isMultiStep && currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 rounded-xl border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className={`h-12 text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-lg ${
                  isMultiStep && currentStep > 0 ? "flex-1" : "w-full"
                }`}
                disabled={submitMutation.isPending}
                style={{
                  backgroundColor: accentColor,
                  color: "#fff",
                  boxShadow: `0 4px 14px ${accentColor}30`,
                }}
              >
                {submitMutation.isPending && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                {isLastStep ? "Submit" : "Next"}
                {!submitMutation.isPending && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </form>
        )}

        {/* Video step — just a continue button */}
        {isVideoStep && (
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              className={`h-12 text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-lg ${currentStep > 0 ? "flex-1" : "w-full"}`}
              onClick={handleNext}
              style={{
                backgroundColor: accentColor,
                color: "#fff",
                boxShadow: `0 4px 14px ${accentColor}30`,
              }}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        <p className="text-center text-[10px] text-zinc-600 pt-8">Powered by ClipsOS</p>
      </div>
    </div>
  );
}
