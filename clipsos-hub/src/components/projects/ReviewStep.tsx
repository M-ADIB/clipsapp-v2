/**
 * ReviewStep — Step 3 (final) of the Project Builder.
 *
 * Summary view of all configuration before submission.
 */

import { Film, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReviewRow } from "./builder-primitives";
import { CADENCE_OPTIONS, type BuilderFormData } from "./builder-types";

export interface ReviewStepProps {
  form: BuilderFormData;
  templateName?: string | null;
}

export function ReviewStep({ form, templateName }: ReviewStepProps) {
  const cfg = form.config;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-6">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {form.clientId ? "Ready to Create" : "Ready to Save Template"}
          </span>
        </div>
        <div className="space-y-3.5">
          {form.clientName && <ReviewRow label="Client" value={form.clientName} />}
          {!form.clientId && (
            <ReviewRow
              label="Mode"
              value={
                <Badge variant="secondary" className="text-[10px]">
                  Template Only
                </Badge>
              }
            />
          )}
          <ReviewRow label="Project Name" value={form.projectName || cfg.internal_name || "—"} />
          {templateName && <ReviewRow label="Template" value={templateName} />}
          <ReviewRow
            label="Cadence"
            value={CADENCE_OPTIONS.find((c) => c.value === form.cadence)?.label ?? form.cadence}
          />
          <ReviewRow label="Videos / Cycle" value={String(form.videoCount)} />
          {cfg.billing_type !== "one_time" && (
            <ReviewRow label="Billing" value={cfg.billing_type.replace("_", " ")} />
          )}
          {cfg.contributor_mode === "multi" && (
            <ReviewRow
              label="Contributors"
              value={`${cfg.default_contributors_per_project} speakers`}
            />
          )}
          {cfg.service_depth !== "for_you" && (
            <ReviewRow label="Depth" value={cfg.service_depth.replace(/_/g, " ")} />
          )}
          {cfg.modules.length > 0 && (
            <ReviewRow
              label="Modules"
              value={`${cfg.modules.filter((m) => m.status !== "off").length} active`}
            />
          )}
          {cfg.payment_plans.length > 0 && (
            <ReviewRow label="Payment Plans" value={`${cfg.payment_plans.length} plan(s)`} />
          )}
          {cfg.journey_steps.length > 0 && (
            <ReviewRow label="Workflow" value={`${cfg.journey_steps.length} steps`} />
          )}
          {form.notes && <ReviewRow label="Notes" value={form.notes} />}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-surface-raised p-4">
        <Film className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" />
        <p className="text-xs leading-relaxed text-foreground-muted">
          {form.clientId ? (
            <>
              This will create the project and automatically set up{" "}
              <strong className="text-foreground">Cycle 1</strong> with{" "}
              <strong className="text-foreground">{form.videoCount} video slots</strong>. You can
              start assigning editors and uploading content right away.
            </>
          ) : (
            <>
              This will save the configuration as a{" "}
              <strong className="text-foreground">reusable template</strong>. You can assign it to a
              client later when creating a new project.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
