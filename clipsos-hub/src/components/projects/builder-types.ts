/**
 * Builder Types & Constants
 *
 * Shared across all project builder step components.
 */

import type { ProjectCadence } from "@/integrations/supabase/db-types";
import type { TemplateConfig } from "@/lib/templateBuilder";
import { EMPTY_CONFIG } from "@/lib/templateBuilder";

// ─── Form State ──────────────────────────────────────────────────────────────

export interface BuilderFormData {
  clientId: string;
  clientName: string;
  templateId: string;
  projectName: string;
  cadence: ProjectCadence;
  videoCount: number;
  startDate: string;
  postingDays: string[];
  notes: string;
  config: TemplateConfig;
  saveAsTemplate: boolean;
}

export const INITIAL_FORM: BuilderFormData = {
  clientId: "",
  clientName: "",
  templateId: "",
  projectName: "",
  cadence: "monthly",
  videoCount: 8,
  startDate: new Date().toISOString().split("T")[0],
  postingDays: [],
  notes: "",
  config: { ...EMPTY_CONFIG },
  saveAsTemplate: false,
};

// ─── Options ─────────────────────────────────────────────────────────────────

export const CADENCE_OPTIONS: { value: ProjectCadence; label: string }[] = [
  { value: "one_time", label: "One-Time" },
  { value: "weekly", label: "Weekly" },
  { value: "bi_weekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "custom", label: "Custom" },
];

export const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

/** Full 4-step flow for standalone /projects/new (includes client selection). */
export const STEP_LABELS_FULL = ["Select Client", "Project Basics", "Offer Config", "Review"];

/** 3-step flow for the embedded Project Builder tab (no client step). */
export const STEP_LABELS_BUILDER = ["Project Basics", "Offer Config", "Review"];
