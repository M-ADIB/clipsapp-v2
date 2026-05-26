/**
 * BasicsStep — Step 1 of the Project Builder.
 *
 * Template selection, project name, cadence, video count,
 * start date, posting days, and notes.
 */

import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectCadence } from "@/integrations/supabase/db-types";
import { CADENCE_OPTIONS, DAYS_OF_WEEK, type BuilderFormData } from "./builder-types";

export interface BasicsStepProps {
  form: BuilderFormData;
  templates: Array<{
    id: string;
    display_name: string;
    icon: string | null;
    config: unknown;
    default_cadence: string | null;
    default_video_count: number | null;
    default_posting_days: string[] | null;
  }>;
  loadingTemplates: boolean;
  onUpdateForm: <K extends keyof BuilderFormData>(key: K, value: BuilderFormData[K]) => void;
  onSelectTemplate: (id: string) => void;
  onToggleDay: (day: string) => void;
}

export function BasicsStep({
  form,
  templates,
  loadingTemplates,
  onUpdateForm,
  onSelectTemplate,
  onToggleDay,
}: BasicsStepProps) {
  return (
    <div className="space-y-6">
      {/* Template selector */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-foreground-muted/60">
          Load from Template
        </Label>
        {loadingTemplates ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTemplate(t.id)}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  form.templateId === t.id
                    ? "border-primary bg-primary/[0.06] shadow-sm ring-1 ring-primary/20"
                    : "border-white/[0.08] hover:border-white/20 hover:bg-surface-raised"
                }`}
              >
                <span className="text-lg">{t.icon || "📋"}</span>
                <span className="truncate font-medium">{t.display_name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-foreground-muted">
            No templates yet. You can save your config as a template in the review step.
          </p>
        )}
      </div>

      <Separator className="bg-white/[0.06]" />

      {/* Project name */}
      <div className="space-y-2">
        <Label htmlFor="project-name" className="text-xs font-medium text-foreground-muted">
          Project Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="project-name"
          placeholder="e.g. Monthly Reels Package"
          value={form.projectName}
          onChange={(e) => onUpdateForm("projectName", e.target.value)}
          autoFocus
        />
      </div>

      {/* Cadence + Video Count */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground-muted">Cadence</Label>
          <Select
            value={form.cadence}
            onValueChange={(v) => onUpdateForm("cadence", v as ProjectCadence)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CADENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="video-count" className="text-xs font-medium text-foreground-muted">
            Videos per Cycle
          </Label>
          <Input
            id="video-count"
            type="number"
            min={1}
            max={100}
            value={form.videoCount}
            onChange={(e) => onUpdateForm("videoCount", parseInt(e.target.value) || 1)}
            className="h-9"
          />
        </div>
      </div>

      {/* Start date + Posting days */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-xs font-medium text-foreground-muted">
            Start Date
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              id="start-date"
              type="date"
              value={form.startDate}
              onChange={(e) => onUpdateForm("startDate", e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground-muted">Posting Days</Label>
          <div className="flex flex-wrap gap-1.5">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                onClick={() => onToggleDay(day.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  form.postingDays.includes(day.value)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-raised text-foreground-muted hover:bg-surface-muted"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="project-notes" className="text-xs font-medium text-foreground-muted">
          Notes <span className="text-foreground-muted/50">(optional)</span>
        </Label>
        <Textarea
          id="project-notes"
          placeholder="Any context or special requirements..."
          value={form.notes}
          onChange={(e) => onUpdateForm("notes", e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      </div>
    </div>
  );
}
