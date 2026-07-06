/**
 * settings-constants — option lists + enum type aliases extracted from
 * SettingsTab so the component file carries less inline constant data.
 */
import type { Database } from "@/integrations/supabase/types";

export type AccountStatus = Database["public"]["Enums"]["account_status"];
export type WorkspaceType = Database["public"]["Enums"]["workspace_type"];

export const STATUS_OPTIONS: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "churned", label: "Churned" },
  { value: "onboarding", label: "Onboarding" },
  { value: "trial", label: "Trial" },
];

export const WORKSPACE_TYPE_OPTIONS: { value: WorkspaceType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "team", label: "Team" },
  { value: "agency", label: "Agency" },
  { value: "enterprise", label: "Enterprise" },
];

export const ASPECT_RATIO_OPTIONS = [
  { value: "9:16", label: "9:16 (Vertical)" },
  { value: "16:9", label: "16:9 (Horizontal)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:5", label: "4:5 (Portrait)" },
];

export const INCOME_OPTIONS = [
  { value: "Not set", label: "Not set" },
  { value: "$0 - $10,000", label: "$0 - $10,000" },
  { value: "$10,000 - $30,000", label: "$10,000 - $30,000" },
  { value: "$30,000 - $50,000", label: "$30,000 - $50,000" },
  { value: "$50,000+", label: "$50,000+" },
];
