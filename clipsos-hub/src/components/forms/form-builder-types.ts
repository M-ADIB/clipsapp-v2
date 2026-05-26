/**
 * Shared types for the Form Builder components — V2.
 *
 * BuilderField is the **client-side** shape used in the drag-and-drop canvas.
 * DB mapping:
 *   BuilderField.description     → form_fields.help_text
 *   BuilderField.validation_rules → form_fields.validation (jsonb)
 *   BuilderField.position        → form_fields.sort_order
 *   BuilderField.step            → form_fields.step
 *   BuilderField.conditional_logic → form_fields.conditional_logic (jsonb)
 */

// ── Field Types ─────────────────────────────────────────────────────────────

export const FIELD_TYPES = [
  // Input fields
  { type: "short_text", label: "Short Text", icon: "Type", category: "input" },
  { type: "long_text", label: "Long Text", icon: "AlignLeft", category: "input" },
  { type: "email", label: "Email", icon: "Mail", category: "input" },
  { type: "phone", label: "Phone", icon: "Phone", category: "input" },
  { type: "number", label: "Number", icon: "Hash", category: "input" },
  { type: "url", label: "URL", icon: "Link", category: "input" },
  // Choice fields
  { type: "single_select", label: "Single Select", icon: "CircleDot", category: "choice" },
  { type: "multi_select", label: "Multi Select", icon: "CheckSquare", category: "choice" },
  { type: "dropdown", label: "Dropdown", icon: "ChevronDown", category: "choice" },
  { type: "yes_no", label: "Yes / No", icon: "ToggleLeft", category: "choice" },
  { type: "country", label: "Country", icon: "Globe", category: "choice" },
  // Advanced fields
  { type: "date", label: "Date", icon: "Calendar", category: "advanced" },
  { type: "file_upload", label: "File Upload", icon: "Upload", category: "advanced" },
  { type: "rating", label: "Rating", icon: "Star", category: "advanced" },
  { type: "scale", label: "Linear Scale", icon: "SlidersHorizontal", category: "advanced" },
  { type: "consent", label: "Consent", icon: "ShieldCheck", category: "advanced" },
  { type: "hidden", label: "Hidden Field", icon: "EyeOff", category: "advanced" },
  // Layout
  { type: "heading", label: "Heading", icon: "Heading", category: "layout" },
  { type: "paragraph", label: "Paragraph", icon: "Text", category: "layout" },
] as const;

export type FieldType = (typeof FIELD_TYPES)[number]["type"];
export type FieldCategory = (typeof FIELD_TYPES)[number]["category"];

// ── Form Type ───────────────────────────────────────────────────────────────

export type FormType = "custom" | "multi_step" | "vsl_funnel";

export const FORM_TYPES: { value: FormType; label: string; description: string }[] = [
  { value: "custom", label: "Single Page", description: "All questions on one page" },
  { value: "multi_step", label: "Multi-Step", description: "Questions split into pages" },
  { value: "vsl_funnel", label: "VSL Funnel", description: "Video first, then questions" },
];

// ── Step Definitions ────────────────────────────────────────────────────────

export type StepType = "fields" | "video";

export interface FormStep {
  id: string;
  type: StepType;
  title: string;
  /** Only for video steps */
  video_url?: string;
  /** Headline shown above the video player */
  headline?: string;
}

// ── Endings (Outcome Routing) ───────────────────────────────────────────────

export interface FormEnding {
  id: string;
  title: string;
  message: string;
  redirect_url?: string;
  /** If true, this is the default ending when no routing rules match */
  is_default?: boolean;
}

// ── Conditional Logic ───────────────────────────────────────────────────────

export type LogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";

export type LogicAction =
  | "show" // Show this field only when conditions are met
  | "hide" // Hide this field when conditions are met
  | "skip_to_step" // Jump to a specific step
  | "disqualify" // Mark submission as disqualified → show an ending
  | "end"; // Route to a specific ending

export interface LogicCondition {
  field_id: string;
  operator: LogicOperator;
  value: string | number | boolean;
}

export interface ConditionalRule {
  action: LogicAction;
  conditions: LogicCondition[];
  /** "all" = AND, "any" = OR */
  logic_gate: "all" | "any";
  /** Target step ID or ending ID (for skip_to_step / disqualify / end) */
  target?: string;
}

// ── Builder Field ───────────────────────────────────────────────────────────

export interface BuilderField {
  id: string;
  type: FieldType;
  label: string;
  /** Maps to form_fields.help_text in DB */
  description: string;
  placeholder: string;
  is_required: boolean;
  options: string[];
  /** Maps to form_fields.validation (jsonb) in DB */
  validation_rules: Record<string, unknown>;
  /** Maps to form_fields.sort_order in DB */
  position: number;
  /** Which step/page this field belongs to (0-indexed) */
  step: number;
  /** Conditional visibility / qualifying rules */
  conditional_logic: ConditionalRule | null;

  // ── Field-specific config (stored inside validation_rules) ──

  /** Scale fields: min label */
  scale_min_label?: string;
  /** Scale fields: max label */
  scale_max_label?: string;
  /** Scale fields: number of points (default 10) */
  scale_points?: number;
  /** Consent fields: agreement text with optional link */
  consent_text?: string;
  /** Consent fields: link URL for "terms" */
  consent_link_url?: string;
  /** Hidden fields: preset value */
  hidden_value?: string;
  /** Dropdown: enable search */
  dropdown_searchable?: boolean;
}

export function createEmptyField(type: FieldType, position: number, step = 0): BuilderField {
  const base: BuilderField = {
    id: crypto.randomUUID(),
    type,
    label: FIELD_TYPES.find((f) => f.type === type)?.label ?? "Field",
    description: "",
    placeholder: "",
    is_required: false,
    options:
      type === "single_select" || type === "multi_select" || type === "dropdown"
        ? ["Option 1", "Option 2"]
        : [],
    validation_rules: {},
    position,
    step,
    conditional_logic: null,
  };

  // Field-specific defaults
  if (type === "scale") {
    base.scale_min_label = "Not at all";
    base.scale_max_label = "Very much";
    base.scale_points = 10;
  }
  if (type === "consent") {
    base.consent_text = "I agree to the terms and conditions";
    base.is_required = true;
  }
  if (type === "hidden") {
    base.hidden_value = "";
    base.is_required = false;
  }

  return base;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Fields that support option-based conditional logic (i.e., have discrete answers) */
export const LOGIC_ELIGIBLE_TYPES: FieldType[] = [
  "single_select",
  "multi_select",
  "dropdown",
  "yes_no",
  "rating",
  "scale",
  "country",
  "number",
];

/** Fields that show an options list editor */
export const OPTION_BASED_TYPES: FieldType[] = ["single_select", "multi_select", "dropdown"];

/** Layout-only fields (no input, no validation) */
export const LAYOUT_TYPES: FieldType[] = ["heading", "paragraph"];

/** Check if a field type is a layout type */
export function isLayoutField(type: FieldType): boolean {
  return LAYOUT_TYPES.includes(type);
}

/** Create a default step */
export function createDefaultStep(index: number, type: StepType = "fields"): FormStep {
  return {
    id: crypto.randomUUID(),
    type,
    title: type === "video" ? "Watch This" : `Step ${index + 1}`,
  };
}

/** Create a default ending */
export function createDefaultEnding(isDefault = false): FormEnding {
  return {
    id: crypto.randomUUID(),
    title: isDefault ? "Thank you!" : "Thanks for your interest",
    message: isDefault ? "Your response has been recorded." : "We'll review your submission.",
    is_default: isDefault,
  };
}
