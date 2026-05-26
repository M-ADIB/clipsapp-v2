/**
 * Supabase database types — ClipsOS V2.
 *
 * This file re-exports the auto-generated types from `types.ts` and adds
 * hand-written convenience aliases, constants, and helpers that the rest
 * of the codebase imports.
 *
 * When the schema changes, regenerate `types.ts` with:
 *   supabase gen types typescript --project-id toyekrhhzqmltstrycdv
 *
 * Source of truth for permissions and naming: docs/PERMISSIONS-MATRIX.md
 */

// Re-export everything from the auto-generated types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  Json,
} from "./types";

export { Constants } from "./types";

import type { Database, Tables, Enums } from "./types";

// ─── Enum aliases ───────────────────────────────────────────────────────────

/**
 * Application roles — matches the `app_role` enum in the database.
 * Hierarchy levels:
 *   owner (5) > manager (4) > senior_editor (3) / content_creator (3)
 *           > editor (2) / moderator (2) / closer (2) > client (1)
 */
export type AppRole = Enums<"app_role">;
export type AccountStatus = Enums<"account_status">;
export type ContentPriority = Enums<"content_priority">;
export type NotificationPriority = Enums<"notification_priority">;
export type NotificationType = Enums<"notification_type">;
export type ProjectCadence = Enums<"project_cadence">;
export type ProjectStatus = Enums<"project_status">;
export type UploadStatus = Enums<"upload_status">;
export type WorkspaceType = Enums<"workspace_type">;

// ─── Role constants ─────────────────────────────────────────────────────────

export const ALL_ROLES: AppRole[] = [
  "owner",
  "manager",
  "senior_editor",
  "content_creator",
  "editor",
  "moderator",
  "closer",
  "client",
];

/**
 * Numeric hierarchy levels — mirror of the SQL `role_hierarchy_level()` function.
 * Used for client-side UX hints only (e.g. "this user is more senior than you").
 * NEVER use this for permission decisions — RLS is the source of truth.
 */
export const ROLE_HIERARCHY: Record<AppRole, number> = {
  owner: 5,
  manager: 4,
  senior_editor: 3,
  content_creator: 3,
  editor: 2,
  moderator: 2,
  closer: 2,
  client: 1,
};

/** Maps URL-style role slug (`/senior-editor/...`) to DB enum (`senior_editor`). */
export function roleFromSlug(slug: string): AppRole | null {
  const normalized = slug.replace(/-/g, "_");
  return (ALL_ROLES as string[]).includes(normalized) ? (normalized as AppRole) : null;
}

/** Inverse of `roleFromSlug`. */
export function roleToSlug(role: AppRole): string {
  return role.replace(/_/g, "-");
}

/** Friendly display label for a role (used in UI badges, menus). */
export const ROLE_LABEL: Record<AppRole, string> = {
  owner: "Owner",
  manager: "Manager",
  senior_editor: "Senior Editor",
  content_creator: "Content Creator",
  editor: "Editor",
  moderator: "Moderator",
  closer: "Closer",
  client: "Client",
};

// ─── Row type aliases ───────────────────────────────────────────────────────
// These provide clean imports: `import type { Client } from "@/integrations/supabase/db-types"`

export type Profile = Tables<"profiles">;
export type UserRoleRow = Tables<"user_roles">;
export type Tenant = Tables<"tenants">;
export type Client = Tables<"clients">;
export type ClientMember = Tables<"client_members">;
export type ClientAccess = Tables<"client_access">;
export type ClientTeamAssignment = Tables<"client_team_assignments">;
export type ClientFoundation = Tables<"client_foundation">;
export type ClientInvitation = Tables<"client_invitations">;
export type ClientJourneyStep = Tables<"client_journey_steps">;

/**
 * Manual type — `client_notes` was created after the last `supabase gen types`.
 * Will be replaced by `Tables<"client_notes">` on next type regeneration.
 */
export interface ClientNote {
  id: string;
  tenant_id: string;
  client_id: string;
  author_id: string | null;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}
export type ClientOnboarding = Tables<"client_onboarding">;
export type ProjectTypeTemplate = Tables<"project_type_templates">;
export type Project = Tables<"projects">;
export type Cycle = Tables<"cycles">;
export type Video = Tables<"videos">;
export type VideoVersion = Tables<"video_versions">;
export type VideoEditor = Tables<"video_editors">;
export type TrialReel = Tables<"trial_reels">;
export type ThumbnailVersion = Tables<"thumbnail_versions">;
export type VideoComment = Tables<"video_comments">;
export type CommentAttachment = Tables<"comment_attachments">;
export type VideoAnnotation = Tables<"video_annotations">;
export type VideoStatusHistory = Tables<"video_status_history">;
export type ChatRoom = Tables<"chat_rooms">;
export type ChatThread = Tables<"chat_threads">;
export type ChatMessage = Tables<"chat_messages">;
export type ChatMention = Tables<"chat_mentions">;
export type ChatMute = Tables<"chat_mutes">;
export type ChatReaction = Tables<"chat_reactions">;
export type ChatReadReceipt = Tables<"chat_read_receipts">;
export type ChatAttachment = Tables<"chat_attachments">;
export type TeamChatRoom = Tables<"team_chat_rooms">;
export type TeamChatMember = Tables<"team_chat_members">;
export type GuestReviewLink = Tables<"guest_review_links">;
export type Notification = Tables<"notifications">;
export type NotificationPreference = Tables<"notification_preferences">;
export type PushSubscription = Tables<"push_subscriptions">;
export type CrmCompany = Tables<"crm_companies">;
export type CrmPerson = Tables<"crm_people">;
export type CrmDeal = Tables<"crm_deals">;
export type CrmDealOption = Tables<"crm_deal_options">;
export type CrmEditor = Tables<"crm_editors">;
export type Lead = Tables<"leads">;
export type PartnershipApplication = Tables<"partnership_applications">;
export type FollowUp = Tables<"follow_ups">;
export type CalendlyEvent = Tables<"calendly_events">;
export type CloserRegion = Tables<"closer_regions">;
export type Status = Tables<"statuses">;
export type StatusRolePermission = Tables<"status_role_permissions">;
export type DealStage = Tables<"deal_stages">;
export type VideoType = Tables<"video_types">;
export type SavedFilterView = Tables<"saved_filter_views">;
export type CustomColumn = Tables<"custom_columns">;
export type CustomColumnValue = Tables<"custom_column_values">;
export type ActivityLogEntry = Tables<"activity_log">;
export type StripeCharge = Tables<"stripe_charges">;
export type StripeSubscription = Tables<"stripe_subscriptions">;
export type StripeEventLog = Tables<"stripe_events_log">;
export type FinanceTransaction = Tables<"finance_transactions">;
export type StudioScript = Tables<"studio_scripts">;
export type StudioHook = Tables<"studio_hooks">;
export type ContentVaultEntry = Tables<"content_vault">;
export type AiPrompt = Tables<"ai_prompts">;
export type EmailTemplate = Tables<"email_templates">;
export type EmailQueueEntry = Tables<"email_queue">;
export type Credential = Tables<"credentials">;
export type Task = Tables<"tasks">;
export type Form = Tables<"forms">;
export type FormField = Tables<"form_fields">;
export type FormSubmission = Tables<"form_submissions">;
export type OperatingCost = Tables<"operating_costs">;
