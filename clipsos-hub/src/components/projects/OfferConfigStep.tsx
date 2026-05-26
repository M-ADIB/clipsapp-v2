/**
 * OfferConfigStep — Step 2 of the Project Builder.
 *
 * Identity, commercial model, scope, contributor structure,
 * service depth, modules, and journey workflow configuration.
 */

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, GripVertical, Plus, Trash2, Users } from "lucide-react";
import {
  type TemplateConfig,
  type TemplateModule,
  type ModuleStatus,
  BILLING_OPTIONS,
  SCOPE_OPTIONS,
  DEPTH_OPTIONS,
  CONTRIBUTOR_MODE_OPTIONS,
  ALLOCATION_OPTIONS,
  computeScopeStats,
} from "@/lib/templateBuilder";
import { SectionCard, FieldRow, TogglePills, CurrencyInput, StatPill } from "./builder-primitives";
import type { BuilderFormData } from "./builder-types";

export interface OfferConfigStepProps {
  form: BuilderFormData;
  onUpdateConfig: <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => void;
  onAddModule: () => void;
  onUpdateModule: (id: string, patch: Partial<TemplateModule>) => void;
  onRemoveModule: (id: string) => void;
  onAddStep: (label: string) => void;
  onRemoveStep: (key: string) => void;
  onLoadDefaultSteps: () => void;
}

export function OfferConfigStep({
  form,
  onUpdateConfig,
  onAddModule,
  onUpdateModule,
  onRemoveModule,
  onAddStep,
  onRemoveStep,
  onLoadDefaultSteps,
}: OfferConfigStepProps) {
  const [newStepLabel, setNewStepLabel] = useState("");
  const [addingStep, setAddingStep] = useState(false);
  const cfg = form.config;
  const stats = useMemo(() => computeScopeStats(cfg), [cfg]);

  const MODULE_STATUSES: { value: ModuleStatus; label: string }[] = [
    { value: "off", label: "Off" },
    { value: "addon", label: "Add-on" },
    { value: "bundled", label: "Bundled" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Section: Identity ─────────────────────────── */}
      <SectionCard label="IDENTITY" title="Offer name & positioning">
        <div className="space-y-4">
          <FieldRow label="Internal name">
            <Input
              placeholder="e.g. ClipsOS Q2 build"
              value={cfg.internal_name}
              onChange={(e) => onUpdateConfig("internal_name", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Client-facing tagline">
            <Input
              placeholder="e.g. Build & own your content system"
              value={cfg.tagline}
              onChange={(e) => onUpdateConfig("tagline", e.target.value)}
            />
          </FieldRow>
        </div>
      </SectionCard>

      {/* ── Section: Commercial Model ─────────────────── */}
      <SectionCard label="COMMERCIAL MODEL" title="How is this billed?">
        <div className="space-y-4">
          <TogglePills
            options={BILLING_OPTIONS}
            value={cfg.billing_type}
            onChange={(v) => onUpdateConfig("billing_type", v)}
          />
          <div className="grid grid-cols-3 gap-3">
            {(cfg.billing_type === "one_time" || cfg.billing_type === "hybrid") && (
              <FieldRow label="Setup fee">
                <CurrencyInput
                  value={cfg.setup_fee}
                  currency={cfg.currency}
                  onChange={(v) => onUpdateConfig("setup_fee", v)}
                />
              </FieldRow>
            )}
            {(cfg.billing_type === "recurring" || cfg.billing_type === "hybrid") && (
              <FieldRow label="Recurring">
                <CurrencyInput
                  value={cfg.recurring_fee}
                  currency={cfg.currency}
                  suffix="/ month"
                  onChange={(v) => onUpdateConfig("recurring_fee", v)}
                />
              </FieldRow>
            )}
            <FieldRow label="Duration">
              <Input
                placeholder="e.g. 6 months"
                value={cfg.duration}
                onChange={(e) => onUpdateConfig("duration", e.target.value)}
              />
            </FieldRow>
          </div>
          <FieldRow label="Currency">
            <Input
              placeholder="AED"
              value={cfg.currency}
              onChange={(e) => onUpdateConfig("currency", e.target.value.toUpperCase())}
              className="max-w-[100px]"
            />
          </FieldRow>
          {cfg.billing_type === "one_time" && (
            <FieldRow label="Total price">
              <CurrencyInput
                value={cfg.total_price}
                currency={cfg.currency}
                onChange={(v) => onUpdateConfig("total_price", v)}
              />
            </FieldRow>
          )}

          {/* Payment Plans */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-foreground-muted" />
                <span className="text-xs font-medium text-foreground-muted">Payment Plans</span>
              </div>
              <button
                onClick={() => {
                  const plans = [
                    ...cfg.payment_plans,
                    {
                      id: crypto.randomUUID(),
                      label: `Plan ${cfg.payment_plans.length + 1}`,
                      installments: 2,
                      amount_per_installment: null,
                      enabled: true,
                      save_amount: null,
                    },
                  ];
                  onUpdateConfig("payment_plans", plans);
                }}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add plan
              </button>
            </div>
            {cfg.payment_plans.length === 0 && (
              <p className="text-[11px] text-foreground-muted">
                No payment plans. Clients pay the full amount upfront.
              </p>
            )}
            {cfg.payment_plans.map((plan, idx) => (
              <div
                key={plan.id}
                className="grid grid-cols-[1fr_80px_80px_80px_auto] items-center gap-2 rounded-xl border border-border px-3 py-2.5"
              >
                <Input
                  placeholder="Plan label"
                  value={plan.label}
                  onChange={(e) => {
                    const plans = [...cfg.payment_plans];
                    plans[idx] = { ...plans[idx], label: e.target.value };
                    onUpdateConfig("payment_plans", plans);
                  }}
                  className="h-7 text-xs border-0 px-0 shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={2}
                    max={24}
                    value={plan.installments}
                    onChange={(e) => {
                      const plans = [...cfg.payment_plans];
                      plans[idx] = { ...plans[idx], installments: parseInt(e.target.value) || 2 };
                      onUpdateConfig("payment_plans", plans);
                    }}
                    className="h-7 w-12 text-xs text-center"
                  />
                  <span className="text-[10px] text-foreground-muted">×</span>
                </div>
                <CurrencyInput
                  value={plan.amount_per_installment}
                  currency={cfg.currency}
                  onChange={(v) => {
                    const plans = [...cfg.payment_plans];
                    plans[idx] = { ...plans[idx], amount_per_installment: v };
                    onUpdateConfig("payment_plans", plans);
                  }}
                />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-foreground-muted whitespace-nowrap">Save</span>
                  <Input
                    type="number"
                    min={0}
                    value={plan.save_amount ?? ""}
                    onChange={(e) => {
                      const plans = [...cfg.payment_plans];
                      plans[idx] = {
                        ...plans[idx],
                        save_amount: e.target.value ? parseFloat(e.target.value) : null,
                      };
                      onUpdateConfig("payment_plans", plans);
                    }}
                    className="h-7 w-16 text-xs"
                  />
                </div>
                <button
                  onClick={() => {
                    const plans = cfg.payment_plans.filter((_, i) => i !== idx);
                    onUpdateConfig("payment_plans", plans);
                  }}
                  className="text-foreground-muted hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Section: Scope ────────────────────────────── */}
      <SectionCard label="SCOPE" title="What gets produced">
        <div className="space-y-4">
          <TogglePills
            options={SCOPE_OPTIONS}
            value={cfg.scope_model}
            onChange={(v) => onUpdateConfig("scope_model", v)}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FieldRow label="Deliverable type">
              <Input
                placeholder="Short-form video"
                value={cfg.deliverable_type}
                onChange={(e) => onUpdateConfig("deliverable_type", e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Cycles">
              <Input
                type="number"
                min={1}
                value={cfg.cycles ?? ""}
                onChange={(e) =>
                  onUpdateConfig("cycles", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </FieldRow>
            <FieldRow label="Per cycle">
              <Input
                type="number"
                min={1}
                value={cfg.per_cycle ?? ""}
                onChange={(e) =>
                  onUpdateConfig("per_cycle", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </FieldRow>
            <FieldRow label="Contributors">
              <Input
                type="number"
                min={1}
                value={cfg.contributors ?? ""}
                onChange={(e) =>
                  onUpdateConfig("contributors", e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </FieldRow>
          </div>
          {cfg.scope_model === "per_cycle" && cfg.cycles && cfg.per_cycle && (
            <div className="grid grid-cols-4 gap-2">
              <StatPill label="Total" value={stats.total} />
              <StatPill label="Per cycle" value={stats.perCycle} />
              <StatPill label="Per shoot" value={stats.perShoot} />
              <StatPill label="Per week" value={stats.perWeek} />
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Section: Contributor Structure ──────────────── */}
      <SectionCard label="CONTRIBUTORS" title="How many speakers?">
        <div className="space-y-4">
          <TogglePills
            options={CONTRIBUTOR_MODE_OPTIONS}
            value={cfg.contributor_mode}
            onChange={(v) => onUpdateConfig("contributor_mode", v)}
          />
          {cfg.contributor_mode === "multi" && (
            <>
              <FieldRow label="Default contributors per project">
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={cfg.default_contributors_per_project}
                  onChange={(e) =>
                    onUpdateConfig(
                      "default_contributors_per_project",
                      parseInt(e.target.value) || 2,
                    )
                  }
                  className="max-w-[100px]"
                />
              </FieldRow>
              <div className="space-y-2">
                <span className="text-xs text-foreground-muted">Deliverable allocation</span>
                <div className="grid gap-2">
                  {ALLOCATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdateConfig("deliverable_allocation", opt.value)}
                      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        cfg.deliverable_allocation === opt.value
                          ? "border-primary bg-primary/[0.06] ring-1 ring-primary/20"
                          : "border-border hover:border-border-strong hover:bg-surface-raised"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          cfg.deliverable_allocation === opt.value
                            ? "border-primary bg-primary"
                            : "border-border-strong"
                        }`}
                      >
                        {cfg.deliverable_allocation === opt.value && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-[11px] text-foreground-muted">{opt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-surface-raised/50 p-3">
                <p className="text-[11px] text-foreground-muted leading-relaxed">
                  <Users className="mr-1 inline h-3 w-3 text-primary" />
                  Multi-contributor projects get{" "}
                  <strong className="text-foreground">separate journey flows</strong>, separate
                  calls, and separate onboarding documents per speaker.
                </p>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* ── Section: Service Depth ────────────────────── */}
      <SectionCard label="SERVICE DEPTH" title="Who does the work?">
        <TogglePills
          options={DEPTH_OPTIONS}
          value={cfg.service_depth}
          onChange={(v) => onUpdateConfig("service_depth", v)}
        />
      </SectionCard>

      {/* ── Section: Modules ──────────────────────────── */}
      <SectionCard label="MODULES" title="What's included or available">
        <div className="space-y-3">
          {cfg.modules.length === 0 && (
            <p className="text-xs text-foreground-muted py-2">No modules added yet.</p>
          )}
          {cfg.modules.map((mod) => (
            <div
              key={mod.id}
              className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <Input
                  placeholder="Module name"
                  value={mod.name}
                  onChange={(e) => onUpdateModule(mod.id, { name: e.target.value })}
                  className="h-8 border-0 px-0 text-sm font-medium shadow-none focus-visible:ring-0"
                />
                <Input
                  placeholder="Short description"
                  value={mod.description}
                  onChange={(e) => onUpdateModule(mod.id, { description: e.target.value })}
                  className="h-6 border-0 px-0 text-xs text-foreground-muted shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {MODULE_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => onUpdateModule(mod.id, { status: s.value })}
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
                onClick={() => onRemoveModule(mod.id)}
                className="text-foreground-muted hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={onAddModule}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add module
          </button>
        </div>
      </SectionCard>

      {/* ── Section: Workflow ──────────────────────────── */}
      <SectionCard label="WORKFLOW" title="Journey template">
        <div className="space-y-3">
          {cfg.journey_steps.length === 0 ? (
            <p className="text-xs text-foreground-muted py-2">
              No steps defined.{" "}
              <button onClick={onLoadDefaultSteps} className="text-primary hover:underline">
                Load default template
              </button>
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-foreground-muted">
                {cfg.journey_steps.length} steps defined
              </span>
              <button
                onClick={onLoadDefaultSteps}
                className="text-[11px] text-foreground-muted hover:text-primary transition-colors"
              >
                Reset to defaults
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {cfg.journey_steps.map((s) => (
              <div
                key={s.key}
                className="group flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-3 text-sm"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-foreground-disabled" />
                <span className="text-foreground-muted font-medium">{s.order} ·</span>
                <span className="flex-1 truncate">{s.label}</span>
                <button
                  onClick={() => onRemoveStep(s.key)}
                  className="opacity-0 group-hover:opacity-100 text-foreground-muted hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          {addingStep ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Step name..."
                value={newStepLabel}
                onChange={(e) => setNewStepLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newStepLabel.trim()) {
                    onAddStep(newStepLabel);
                    setNewStepLabel("");
                    setAddingStep(false);
                  }
                }}
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  if (newStepLabel.trim()) {
                    onAddStep(newStepLabel);
                    setNewStepLabel("");
                    setAddingStep(false);
                  }
                }}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={() => {
                  setNewStepLabel("");
                  setAddingStep(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setAddingStep(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add step
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
