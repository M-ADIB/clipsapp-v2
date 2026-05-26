/**
 * Template Builder — types & constants
 *
 * Shared config shape stored in `project_type_templates.config` JSONB column.
 */

// ─── Template Config (JSONB shape) ──────────────────────────────────────────

export type BillingType = "one_time" | "recurring" | "hybrid";
export type ScopeModel = "fixed_total" | "per_cycle" | "rate_based" | "unlimited";
export type ServiceDepth = "self" | "with_you" | "for_you";
export type ModuleStatus = "off" | "addon" | "bundled";
export type ContributorMode = "single" | "multi";
export type DeliverableAllocation = "split_evenly" | "split_by_ratio" | "assigned_manually";

export interface TemplateModule {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
}

export interface JourneyStep {
  key: string;
  label: string;
  order: number;
}

export interface PaymentPlan {
  id: string;
  label: string;
  installments: number;
  amount_per_installment: number | null;
  enabled: boolean;
  save_amount: number | null;
}

export interface TemplateConfig {
  // Identity
  internal_name: string;
  tagline: string;
  // Commercial Model
  billing_type: BillingType;
  setup_fee: number | null;
  recurring_fee: number | null;
  total_price: number | null;
  duration: string;
  currency: string;
  payment_plans: PaymentPlan[];
  // Scope
  scope_model: ScopeModel;
  deliverable_type: string;
  cycles: number | null;
  per_cycle: number | null;
  contributors: number | null;
  // Contributor Structure
  contributor_mode: ContributorMode;
  default_contributors_per_project: number;
  deliverable_allocation: DeliverableAllocation;
  // Service Depth
  service_depth: ServiceDepth;
  // Modules
  modules: TemplateModule[];
  // Workflow
  journey_steps: JourneyStep[];
}

export const EMPTY_CONFIG: TemplateConfig = {
  internal_name: "",
  tagline: "",
  billing_type: "one_time",
  setup_fee: null,
  recurring_fee: null,
  total_price: null,
  duration: "",
  currency: "AED",
  payment_plans: [],
  scope_model: "fixed_total",
  deliverable_type: "Short-form video",
  cycles: null,
  per_cycle: null,
  contributors: 1,
  contributor_mode: "single",
  default_contributors_per_project: 1,
  deliverable_allocation: "split_evenly",
  service_depth: "with_you",
  modules: [],
  journey_steps: [],
};

// ─── Default journey steps library ──────────────────────────────────────────

export const DEFAULT_JOURNEY_STEPS: JourneyStep[] = [
  { key: "onboarding_doc", label: "Fill in onboarding document", order: 1 },
  { key: "kickoff_call", label: "Book Kickoff call", order: 2 },
  { key: "practice_1", label: "Book Practice session", order: 3 },
  { key: "practice_2", label: "Book Practice session 2", order: 4 },
  { key: "book_shoot", label: "Book Shoot", order: 5 },
  { key: "shoot_done", label: "Shoot done", order: 6 },
  { key: "footage_received", label: "Footage Received", order: 7 },
  { key: "brief", label: "Nahla's brief on shoot", order: 8 },
  { key: "editor_assigned", label: "Editor assigned", order: 9 },
  { key: "rough_cuts", label: "Rough cuts", order: 10 },
  { key: "team_reviews", label: "Content team reviews", order: 11 },
  { key: "send_rc", label: "Send RC to client", order: 12 },
  { key: "branding", label: "Branding", order: 13 },
  { key: "sample", label: "Sample", order: 14 },
  { key: "first_batch", label: "First Batch", order: 15 },
  { key: "weekly_batches", label: "Weekly Batches", order: 16 },
];

// ─── Billing type options ───────────────────────────────────────────────────

export const BILLING_OPTIONS: { value: BillingType; label: string }[] = [
  { value: "one_time", label: "One-time" },
  { value: "recurring", label: "Recurring" },
  { value: "hybrid", label: "Hybrid" },
];

// ─── Scope model options ────────────────────────────────────────────────────

export const SCOPE_OPTIONS: { value: ScopeModel; label: string }[] = [
  { value: "fixed_total", label: "Fixed total" },
  { value: "per_cycle", label: "Per cycle" },
  { value: "rate_based", label: "Rate-based" },
  { value: "unlimited", label: "Unlimited" },
];

// ─── Service depth options ──────────────────────────────────────────────────

export const DEPTH_OPTIONS: { value: ServiceDepth; label: string }[] = [
  { value: "self", label: "Run it yourself" },
  { value: "with_you", label: "Done with you" },
  { value: "for_you", label: "Done for you" },
];

// ─── Contributor mode options ───────────────────────────────────────────────

export const CONTRIBUTOR_MODE_OPTIONS: { value: ContributorMode; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "multi", label: "Multi" },
];

// ─── Deliverable allocation options ─────────────────────────────────────────

export const ALLOCATION_OPTIONS: {
  value: DeliverableAllocation;
  label: string;
  description: string;
}[] = [
  {
    value: "split_evenly",
    label: "Split evenly",
    description: "Total per cycle divided across contributors",
  },
  {
    value: "split_by_ratio",
    label: "Split by ratio",
    description: "Custom percentage per contributor (e.g. 70 / 30)",
  },
  {
    value: "assigned_manually",
    label: "Assigned manually",
    description: "Decide per cycle which contributor produces which videos",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function slugifyStepKey(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50);
}

/** Compute scope breakdown stats */
export function computeScopeStats(cfg: TemplateConfig) {
  const cycles = cfg.cycles ?? 0;
  const perCycle = cfg.per_cycle ?? 0;
  const total = cfg.scope_model === "per_cycle" ? cycles * perCycle : perCycle;
  const perShoot = perCycle; // 1 shoot per cycle
  const perWeek = cycles > 0 ? total / (cycles * 4) : 0; // rough weekly rate

  return {
    total,
    perCycle,
    perShoot,
    perWeek: Math.round(perWeek * 10) / 10,
  };
}
