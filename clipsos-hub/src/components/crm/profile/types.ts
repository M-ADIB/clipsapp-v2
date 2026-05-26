/**
 * CRM Profile — Shared types for the person profile page tabs.
 */

export type ProfileTab =
  | "overview"
  | "activity"
  | "deals"
  | "calls"
  | "emails"
  | "company"
  | "notes"
  | "tasks"
  | "files";

export interface TabDef {
  key: ProfileTab;
  label: string;
  count?: number;
}
