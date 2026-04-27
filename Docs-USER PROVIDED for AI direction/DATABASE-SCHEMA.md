# ClipsApp — Database Schema Reference (Live Export)
**Companion to PRD v1.0 + Permissions Matrix**
*Generated: 2026-04-26*

> **Direction, not copy-paste.** This document is a faithful export of the *current* schema (`129` tables, `14` enums, `9` storage buckets, ~120 edge functions). Use it to design the rebuild — many tables will be renamed, merged, or dropped per the PRD. Rebuild guidance is called out inline with 🔄 / 🗑️ / ➕ markers.

---

## 1. Executive Overview

- **Tables:** 129
- **Enums:** 14
- **FK relationships:** 186
- **Custom indexes:** 245
- **RLS policies:** 408
- **Storage buckets:** 9
- **DB triggers:** 100

### Rebuild markers used

- 🔄 **CHANGE** — rename, merge, or rework
- 🗑️ **DROP** — remove from rebuild
- ➕ **NEW** — add in rebuild (listed in §8)
- ✅ **KEEP** — carry over as-is
- 🔒 RLS enabled  /  ⚠️ RLS disabled

---

## 2. Tables (grouped by domain)


## Domain: Auth & Identity

### `profiles`
🔒 **RLS:** ENABLED
**Purpose:** User profile metadata. One row per `auth.users` row.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | — | Primary key |
| `email` | text | NO | — | Email address |
| `full_name` | text | YES | — | Display name |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `requires_password_change` | boolean | YES | false |  |
| `first_login` | boolean | YES | true |  |
| `password_changed_at` | timestamp with time zone | YES | — | Timestamp |
| `avatar_url` | text | YES | — | URL string |
| `phone_number` | text | YES | — |  |
| `job_title` | text | YES | — |  |
| `bio` | text | YES | — |  |
| `time_zone` | text | YES | 'America/New_York'::text |  |
| `last_sign_in_at` | timestamp with time zone | YES | — | Timestamp |
| `dashboard_preferences` | jsonb | YES | '{}'::jsonb |  |

**Relationships (FKs):**
- `id` → `auth.users.id`

**Indexes:**
- `idx_profiles_requires_password_change` — `CREATE INDEX idx_profiles_requires_password_change ON public.profiles USING btree (requires_password_change) WHERE (requires_password_change = true)`

**Triggers:**
- `ensure_capitalized_names` → `capitalize_full_name()`
- `update_profiles_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Chat room peers can view profiles` | SELECT | `shares_chat_room(auth.uid(), id)` | `—` |
| `Owners and admins can delete profiles` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |
| `Owners, admins, and editor admins can view all profiles` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Users can update their own profile` | UPDATE | `(auth.uid() = id)` | `—` |
| `Users can view own profile` | SELECT | `(auth.uid() = id)` | `—` |
| `Users can view related profiles` | SELECT | `((auth.uid() = id) OR has_role(auth.uid(), 'admin'::text) OR has_role(auth.ui...` | `—` |

### `user_roles`
🔒 **RLS:** ENABLED

> 🔄 **EXTEND** enum: rename `admin`→`manager`, `editor_admin`→`senior_editor`, `content_admin`→`content_creator`, `sales`→`closer`. Add `moderator` role.

**Purpose:** Single source of truth for role assignment. Never store roles on `profiles`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `role` | USER-DEFINED | NO | — | Role enum |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `user_roles_user_id_role_key` — `CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins and owners can delete team member roles` | DELETE | `((has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::ap...` | `—` |
| `Admins and owners can insert team member roles` | INSERT | `—` | `((has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::ap...` |
| `Owners can assign roles to team members` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::app_role) AND (role = ANY (ARRAY['admin'::app_...` |
| `Owners can remove team member roles` | DELETE | `(has_role(auth.uid(), 'owner'::app_role) AND (role <> 'client'::app_role) AND...` | `—` |
| `Users can view their own roles` | SELECT | `(auth.uid() = user_id)` | `—` |
| `Users with elevated roles can view all roles` | SELECT | `((auth.uid() = user_id) OR has_role(auth.uid(), 'owner'::app_role) OR has_rol...` | `—` |

### `client_access`
🔒 **RLS:** ENABLED
**Purpose:** Grants users access to a workspace.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `client_id` | uuid | NO | — | FK reference |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `user_id` → `profiles.id`

**Indexes:**
- `client_access_user_id_client_id_key` — `CREATE UNIQUE INDEX client_access_user_id_client_id_key ON public.client_access USING btree (user_id, client_id)`
- `idx_client_access_user` — `CREATE INDEX idx_client_access_user ON public.client_access USING btree (user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage client access` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Clients can view their own access` | SELECT | `(auth.uid() = user_id)` | `—` |

### `client_members`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_members`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `name` | text | NO | — | Display name |
| `email` | text | YES | — | Email address |
| `role_title` | text | YES | — |  |
| `project_id` | uuid | YES | — | FK reference |
| `onboarding_doc_url` | text | YES | — | URL string |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `project_id` → `projects.id`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins and owners can do everything on client_members` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Client users can read their own client members` | SELECT | `(EXISTS ( SELECT 1    FROM client_access ca   WHERE ((ca.client_id = client_m...` | `—` |
| `Editors can read client_members for their assigned clients` | SELECT | `(EXISTS ( SELECT 1    FROM video_editors ve   WHERE ((ve.client_id = client_m...` | `—` |

### `client_invitations`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_invitations`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `email` | text | NO | — | Email address |
| `sent_at` | timestamp with time zone | YES | now() | Timestamp |
| `opened_at` | timestamp with time zone | YES | — | Timestamp |
| `last_accessed_at` | timestamp with time zone | YES | — | Timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage invitations` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |

### `active_sessions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `active_sessions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `session_token` | text | NO | — |  |
| `ip_address` | text | YES | — |  |
| `country` | text | YES | — |  |
| `device_type` | text | YES | — |  |
| `user_agent` | text | YES | — |  |
| `last_active` | timestamp with time zone | NO | now() |  |
| `revoked` | boolean | NO | false |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Indexes:**
- `idx_active_sessions_revoked` — `CREATE INDEX idx_active_sessions_revoked ON public.active_sessions USING btree (revoked) WHERE (revoked = false)`
- `idx_active_sessions_user_id` — `CREATE INDEX idx_active_sessions_user_id ON public.active_sessions USING btree (user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners and admins can update sessions` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |
| `Owners and admins can view active sessions` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |
| `Users can view own sessions` | SELECT | `(auth.uid() = user_id)` | `—` |

### `login_history`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `login_history`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | YES | — | References auth.users |
| `email` | text | NO | — | Email address |
| `ip_address` | text | YES | — |  |
| `country` | text | YES | — |  |
| `city` | text | YES | — |  |
| `user_agent` | text | YES | — |  |
| `device_type` | text | YES | — |  |
| `login_method` | text | YES | — |  |
| `success` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Indexes:**
- `idx_login_history_created_at` — `CREATE INDEX idx_login_history_created_at ON public.login_history USING btree (created_at DESC)`
- `idx_login_history_email` — `CREATE INDEX idx_login_history_email ON public.login_history USING btree (email)`
- `idx_login_history_user_id` — `CREATE INDEX idx_login_history_user_id ON public.login_history USING btree (user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners and admins can view login history` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |

### `password_reset_tokens`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `password_reset_tokens`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `token` | text | NO | — |  |
| `expires_at` | timestamp with time zone | NO | — | Timestamp |
| `used` | boolean | YES | false |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_password_reset_tokens_token` — `CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens USING btree (token)`
- `idx_password_reset_tokens_user_id` — `CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id)`
- `password_reset_tokens_token_key` — `CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Service role only` | ALL | `false` | `—` |

### `preview_sessions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `preview_sessions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `admin_user_id` | uuid | NO | — | FK reference |
| `target_type` | text | NO | — |  |
| `target_id` | uuid | NO | — | FK reference |
| `target_name` | text | YES | — |  |
| `target_role` | text | YES | — |  |
| `started_at` | timestamp with time zone | NO | now() | Timestamp |
| `ended_at` | timestamp with time zone | YES | — | Timestamp |
| `user_agent` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Indexes:**
- `idx_preview_sessions_admin` — `CREATE INDEX idx_preview_sessions_admin ON public.preview_sessions USING btree (admin_user_id, started_at DESC)`
- `idx_preview_sessions_target` — `CREATE INDEX idx_preview_sessions_target ON public.preview_sessions USING btree (target_type, target_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authorized users can log preview sessions` | INSERT | `—` | `((auth.uid() = admin_user_id) AND (has_role(auth.uid(), 'owner'::text) OR has...` |
| `Owners and admins can view all preview sessions` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |
| `Users can close their own preview sessions` | UPDATE | `(auth.uid() = admin_user_id)` | `—` |
| `Users can view their own preview sessions` | SELECT | `(auth.uid() = admin_user_id)` | `—` |

### `client_team_assignments`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_team_assignments`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | YES | — | FK reference |
| `team_id` | uuid | YES | — | FK reference |
| `assigned_at` | timestamp with time zone | YES | now() | Timestamp |
| `assigned_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `assigned_by` → `profiles.id`
- `client_id` → `clients.id`

**Indexes:**
- `client_team_assignments_client_id_team_id_key` — `CREATE UNIQUE INDEX client_team_assignments_client_id_team_id_key ON public.client_team_assignments USING btree (client_id, team_id)`
- `idx_client_team_assignments_client` — `CREATE INDEX idx_client_team_assignments_client ON public.client_team_assignments USING btree (client_id)`
- `idx_client_team_assignments_team` — `CREATE INDEX idx_client_team_assignments_team ON public.client_team_assignments USING btree (team_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Manage client team assignments` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `View client team assignments` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |


## Domain: Workspaces & Clients

### `clients`
🔒 **RLS:** ENABLED
**Purpose:** Workspace records. Each row = one client/agency relationship.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `name` | text | NO | — | Display name |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `logo_url` | text | YES | — | URL string |
| `email` | text | YES | — | Email address |
| `solution_type` | USER-DEFINED | YES | 'custom_deal'::solution_type |  |
| `custom_solution_type` | text | YES | — |  |
| `videos_per_month` | integer | YES | — |  |
| `account_status` | USER-DEFINED | YES | 'active'::account_status |  |
| `workspace_token` | text | YES | (gen_random_uuid())::text |  |
| `notes` | text | YES | — |  |
| `start_date` | date | YES | CURRENT_DATE |  |
| `default_aspect_ratio` | text | YES | '9:16'::text |  |
| `token_expires_at` | timestamp with time zone | YES | — | Timestamp |
| `token_created_at` | timestamp with time zone | YES | now() | Timestamp |
| `google_drive_url` | text | YES | — | URL string |
| `google_drive_folder_id` | text | YES | — | FK reference |
| `industry` | text | YES | — |  |
| `category` | text | YES | 'tca_client'::text |  |
| `payment_method` | text | YES | — |  |
| `deal_owner_id` | uuid | YES | — | FK reference |
| `calendly_url` | text | YES | — | URL string |
| `instagram` | text | YES | — |  |
| `phone` | text | YES | — |  |
| `invalid_phone` | text | YES | — |  |
| `facebook` | text | YES | — |  |
| `linkedin` | text | YES | — |  |
| `twitter` | text | YES | — |  |
| `social_link` | text | YES | — |  |
| `angellist` | text | YES | — |  |
| `job_title` | text | YES | — |  |
| `company` | text | YES | — |  |
| `income_range` | text | YES | — |  |
| `goal` | text | YES | — |  |
| `obstacle` | text | YES | — |  |
| `interested_in` | text | YES | — |  |
| `fit` | text | YES | — |  |
| `location` | text | YES | — |  |
| `primary_location` | text | YES | — |  |
| `description` | text | YES | — |  |
| `associated_deals` | text | YES | — |  |
| `associated_users` | text | YES | — |  |
| `status` | text | YES | 'active'::text | Current status |
| `onboarding_document_url` | text | YES | — | URL string |
| `slack_channel_url` | text | YES | — | URL string |
| `token_last_accessed_at` | timestamp with time zone | YES | — | Timestamp |
| `plan_type` | text | YES | — |  |
| `onboarding_completed` | boolean | YES | false |  |
| `onboarding_completed_at` | timestamp with time zone | YES | — | Timestamp |
| `kickoff_call_booked` | boolean | YES | false |  |
| `practice_session_booked` | boolean | YES | false |  |
| `instagram_account_id` | text | YES | — | FK reference |
| `tiktok_account_id` | text | YES | — | FK reference |
| `facebook_ads_account_id` | text | YES | — | FK reference |
| `manychat_account_id` | text | YES | — | FK reference |
| `analytics_enabled` | boolean | YES | false |  |
| `branding_deck_url` | text | YES | — | URL string |
| `branding_deck_file_path` | text | YES | — | Storage path |
| `branding_deck_approved` | boolean | YES | — |  |
| `branding_deck_uploaded_at` | timestamp with time zone | YES | — | Timestamp |
| `color_palette` | ARRAY | YES | '{}'::text[] |  |
| `story_mapping_booked` | boolean | YES | false |  |
| `script_recording_booked` | boolean | YES | false |  |
| `tiktok` | text | YES | — |  |
| `youtube` | text | YES | — |  |
| `client_type` | text | NO | 'individual'::text |  |
| `person_id` | uuid | YES | — | FK reference |
| `stripe_customer_id` | text | YES | — | FK reference |
| `studio_published` | boolean | NO | false |  |
| `studio_published_at` | timestamp with time zone | YES | — | Timestamp |
| `studio_published_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `deal_owner_id` → `profiles.id`
- `person_id` → `crm_people.id`

**Indexes:**
- `clients_workspace_token_key` — `CREATE UNIQUE INDEX clients_workspace_token_key ON public.clients USING btree (workspace_token)`
- `idx_clients_deal_owner` — `CREATE INDEX idx_clients_deal_owner ON public.clients USING btree (deal_owner_id)`
- `idx_clients_person_id` — `CREATE INDEX idx_clients_person_id ON public.clients USING btree (person_id)`
- `idx_clients_workspace_token` — `CREATE INDEX idx_clients_workspace_token ON public.clients USING btree (workspace_token)`

**Triggers:**
- `create_chat_room_on_client_insert` → `auto_create_chat_room()`
- `trg_auto_link_client_to_crm_person` → `auto_link_client_to_crm_person()`
- `update_clients_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can delete clients` | DELETE | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |
| `Admins, owners, and editor admins can insert clients` | INSERT | `—` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Admins, owners, and editor admins can update clients` | UPDATE | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |
| `Admins, owners, and editor admins can view all clients` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Clients can view their assigned clients` | SELECT | `(EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id = ...` | `—` |
| `Editors can view assigned clients` | SELECT | `editor_can_access_client(auth.uid(), id)` | `—` |

### `shared_projects`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `shared_projects`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `shared_with_client_id` | uuid | NO | — | FK reference |
| `shared_by` | uuid | NO | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `project_id` → `projects.id`
- `shared_by` → `auth.users.id`
- `shared_with_client_id` → `clients.id`

**Indexes:**
- `shared_projects_project_id_shared_with_client_id_key` — `CREATE UNIQUE INDEX shared_projects_project_id_shared_with_client_id_key ON public.shared_projects USING btree (project_id, shared_with_client_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can view their shared projects` | SELECT | `(EXISTS ( SELECT 1    FROM client_access ca   WHERE ((ca.user_id = auth.uid()...` | `—` |
| `Editor admins can view shared projects` | SELECT | `(has_role(auth.uid(), 'editor_admin'::text) OR has_role(auth.uid(), 'content_...` | `—` |
| `Owners and admins can manage shared projects` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |

### `client_studio_preferences`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_studio_preferences`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `studio_id` | uuid | NO | — | FK reference |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `studio_id` → `studios.id`

**Indexes:**
- `client_studio_preferences_client_id_key` — `CREATE UNIQUE INDEX client_studio_preferences_client_id_key ON public.client_studio_preferences USING btree (client_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can view all preferences` | SELECT | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |
| `Clients can manage their own preferences` | ALL | `(EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id = ...` | `—` |
| `Clients can view their own preferences` | SELECT | `(EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id = ...` | `—` |

### `client_credentials`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_credentials`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `platform` | text | NO | — |  |
| `email_or_username` | text | NO | — |  |
| `password` | text | NO | — |  |
| `notes` | text | YES | — |  |
| `status` | text | YES | 'active'::text | Current status |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `idx_client_credentials_client_id` — `CREATE INDEX idx_client_credentials_client_id ON public.client_credentials USING btree (client_id)`

**Triggers:**
- `update_client_credentials_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can delete client credentials` | DELETE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `Admins can insert client credentials` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |
| `Admins can update client credentials` | UPDATE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `Admins can view all client credentials` | SELECT | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `Assigned users can view their client credentials` | SELECT | `(EXISTS ( SELECT 1    FROM client_credential_assignments   WHERE ((client_cre...` | `—` |
| `Clients can insert their own credentials` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id = ...` |

### `client_credential_assignments`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_credential_assignments`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `user_id` | uuid | NO | — | References auth.users |
| `assigned_by` | uuid | YES | — |  |
| `assigned_at` | timestamp with time zone | YES | now() | Timestamp |

**Relationships (FKs):**
- `assigned_by` → `profiles.id`
- `client_id` → `clients.id`
- `user_id` → `profiles.id`

**Indexes:**
- `client_credential_assignments_client_id_user_id_key` — `CREATE UNIQUE INDEX client_credential_assignments_client_id_user_id_key ON public.client_credential_assignments USING btree (client_id, user_id)`
- `idx_client_credential_assignments_client_id` — `CREATE INDEX idx_client_credential_assignments_client_id ON public.client_credential_assignments USING btree (client_id)`
- `idx_client_credential_assignments_user_id` — `CREATE INDEX idx_client_credential_assignments_user_id ON public.client_credential_assignments USING btree (user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can delete client credential assignments` | DELETE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `Admins can insert client credential assignments` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |
| `Admins can view all client credential assignments` | SELECT | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `Users can view their own client credential assignments` | SELECT | `(user_id = auth.uid())` | `—` |

### `credential_assignments`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `credential_assignments`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `credential_id` | uuid | NO | — | FK reference |
| `user_id` | uuid | NO | — | References auth.users |
| `assigned_by` | uuid | YES | — |  |
| `assigned_at` | timestamp with time zone | YES | now() | Timestamp |

**Relationships (FKs):**
- `assigned_by` → `profiles.id`
- `credential_id` → `internal_credentials.id`
- `user_id` → `profiles.id`

**Indexes:**
- `credential_assignments_credential_id_user_id_key` — `CREATE UNIQUE INDEX credential_assignments_credential_id_user_id_key ON public.credential_assignments USING btree (credential_id, user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners can delete assignments` | DELETE | `has_role(auth.uid(), 'owner'::text)` | `—` |
| `Owners can insert assignments` | INSERT | `—` | `has_role(auth.uid(), 'owner'::text)` |
| `Users can view assigned credentials` | SELECT | `((user_id = auth.uid()) OR has_role(auth.uid(), 'owner'::text))` | `—` |

### `credential_audit_log`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `credential_audit_log`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `credential_id` | uuid | YES | — | FK reference |
| `action` | text | NO | — |  |
| `performed_by` | uuid | YES | — |  |
| `performed_at` | timestamp with time zone | YES | now() | Timestamp |
| `details` | jsonb | YES | — |  |

**Relationships (FKs):**
- `credential_id` → `internal_credentials.id`
- `performed_by` → `profiles.id`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners can view audit logs` | SELECT | `has_role(auth.uid(), 'owner'::text)` | `—` |
| `Users can insert audit logs` | INSERT | `—` | `(auth.uid() = performed_by)` |

### `internal_credentials`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `internal_credentials`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `account_owner` | text | NO | — |  |
| `platform` | text | NO | — |  |
| `username` | text | NO | — |  |
| `password` | text | NO | — |  |
| `status` | text | YES | 'active'::text | Current status |
| `notes` | text | YES | — |  |
| `category` | text | YES | — |  |
| `created_by` | uuid | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `created_by` → `profiles.id`

**Triggers:**
- `update_internal_credentials_updated_at` → `update_internal_credentials_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners can delete credentials` | DELETE | `has_role(auth.uid(), 'owner'::text)` | `—` |
| `Owners can insert credentials` | INSERT | `—` | `has_role(auth.uid(), 'owner'::text)` |
| `Owners can update credentials` | UPDATE | `has_role(auth.uid(), 'owner'::text)` | `—` |
| `Owners can view all credentials` | SELECT | `has_role(auth.uid(), 'owner'::text)` | `—` |
| `Users can view assigned credentials` | SELECT | `(EXISTS ( SELECT 1    FROM credential_assignments   WHERE ((credential_assign...` | `—` |

### `client_api_tokens`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_api_tokens`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `platform` | text | NO | — |  |
| `access_token` | text | NO | — |  |
| `refresh_token` | text | YES | — |  |
| `token_expires_at` | timestamp with time zone | YES | — | Timestamp |
| `platform_user_id` | text | YES | — | FK reference |
| `platform_username` | text | YES | — |  |
| `scopes` | ARRAY | YES | — |  |
| `is_valid` | boolean | YES | true |  |
| `last_sync_at` | timestamp with time zone | YES | — | Timestamp |
| `last_sync_error` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `connected_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `connected_by` → `profiles.id`

**Indexes:**
- `client_api_tokens_client_id_platform_key` — `CREATE UNIQUE INDEX client_api_tokens_client_id_platform_key ON public.client_api_tokens USING btree (client_id, platform)`
- `idx_client_api_tokens_client_platform` — `CREATE INDEX idx_client_api_tokens_client_platform ON public.client_api_tokens USING btree (client_id, platform)`
- `idx_client_api_tokens_valid` — `CREATE INDEX idx_client_api_tokens_valid ON public.client_api_tokens USING btree (is_valid) WHERE (is_valid = true)`

**Triggers:**
- `update_client_api_tokens_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage client API tokens` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |


## Domain: Projects, Cycles & Templates

### `projects`
🔒 **RLS:** ENABLED
**Purpose:** Top-level work container inside a workspace.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `project_type` | USER-DEFINED | NO | — |  |
| `project_name` | text | NO | — |  |
| `status` | USER-DEFINED | NO | 'not_started'::project_status | Current status |
| `video_count` | integer | NO | — |  |
| `videos_completed` | integer | NO | 0 |  |
| `progress` | numeric | YES | 0 |  |
| `start_date` | date | NO | CURRENT_DATE |  |
| `end_date` | date | YES | — |  |
| `custom_video_count` | integer | YES | — |  |
| `notes` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `project_editors` | ARRAY | YES | '{}'::uuid[] |  |
| `rough_cut_drive_link` | text | YES | — |  |
| `sort_preference` | text | YES | 'post_date_asc'::text |  |
| `raw_footage_notes` | text | YES | — |  |
| `posting_days` | ARRAY | YES | — |  |
| `project_type_template_id` | uuid | YES | — | FK reference |
| `cadence` | text | NO | 'one_time'::text |  |
| `current_cycle` | integer | NO | 1 |  |
| `cycle_completed_at` | timestamp with time zone | YES | — | Timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `project_type_template_id` → `project_type_templates.id`

**Indexes:**
- `idx_projects_client_id` — `CREATE INDEX idx_projects_client_id ON public.projects USING btree (client_id)`
- `idx_projects_project_editors` — `CREATE INDEX idx_projects_project_editors ON public.projects USING gin (project_editors)`
- `idx_projects_project_type_template_id` — `CREATE INDEX idx_projects_project_type_template_id ON public.projects USING btree (project_type_template_id)`
- `idx_projects_status` — `CREATE INDEX idx_projects_status ON public.projects USING btree (status)`

**Triggers:**
- `update_projects_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can delete projects` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Admins, owners, and editor admins can update projects` | UPDATE | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |
| `Admins, owners, and editor admins can view all projects` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Editor admins can create projects` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Editors can view assigned projects` | SELECT | `editor_can_access_project(auth.uid(), id)` | `—` |
| `Shared project clients can view projects` | SELECT | `user_has_shared_project_access(auth.uid(), id)` | `—` |

### `interviews`
🔒 **RLS:** ENABLED

> 🔄 **RENAME** to `cycles` per PRD terminology. `is_backlog` flag stays.

**Purpose:** Cycle/session container inside a project (LEGACY name).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `name` | text | NO | — | Display name |
| `order_index` | integer | NO | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `project_id` | uuid | YES | — | FK reference |
| `is_backlog` | boolean | YES | false |  |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `project_id` → `projects.id`

**Indexes:**
- `idx_interviews_client` — `CREATE INDEX idx_interviews_client ON public.interviews USING btree (client_id)`
- `interviews_project_id_name_key` — `CREATE UNIQUE INDEX interviews_project_id_name_key ON public.interviews USING btree (project_id, name)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can delete interviews` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Admins, owners, and editor admins can insert interviews` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Admins, owners, and editor admins can update interviews` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Admins, owners, and editor admins can view interviews` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Clients can view project interviews` | SELECT | `(EXISTS ( SELECT 1    FROM (projects p      JOIN client_access ca ON ((ca.cli...` | `—` |
| `Editors can create interviews for assigned projects` | INSERT | `—` | `((EXISTS ( SELECT 1    FROM video_editors   WHERE ((video_editors.editor_id =...` |
| `Editors can delete interviews for assigned projects` | DELETE | `((EXISTS ( SELECT 1    FROM video_editors   WHERE ((video_editors.editor_id =...` | `—` |
| `Editors can update interviews for assigned projects` | UPDATE | `((EXISTS ( SELECT 1    FROM video_editors   WHERE ((video_editors.editor_id =...` | `—` |
| `Editors can view interviews for assigned projects` | SELECT | `((EXISTS ( SELECT 1    FROM video_editors   WHERE ((video_editors.editor_id =...` | `—` |
| `Users can view interviews for accessible clients` | SELECT | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |

### `project_cycle_resets`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_cycle_resets`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `from_cycle` | integer | NO | — |  |
| `to_cycle` | integer | NO | — |  |
| `reset_by` | uuid | YES | — |  |
| `reset_at` | timestamp with time zone | NO | now() | Timestamp |
| `notes` | text | YES | — |  |

**Relationships (FKs):**
- `project_id` → `projects.id`
- `reset_by` → `auth.users.id`

**Indexes:**
- `idx_project_cycle_resets_project` — `CREATE INDEX idx_project_cycle_resets_project ON public.project_cycle_resets USING btree (project_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners and admins can view cycle resets` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |

### `project_tasks`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_tasks`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `title` | text | NO | — |  |
| `description` | text | YES | — |  |
| `status` | text | NO | 'todo'::text | Current status |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `assigned_editor_id` | uuid | YES | — | FK reference |
| `content_id` | uuid | YES | — | FK reference |
| `due_date` | date | YES | — |  |
| `completed_at` | timestamp with time zone | YES | — | Timestamp |
| `blocked_reason` | text | YES | — |  |
| `is_blocked` | boolean | YES | false |  |
| `priority` | text | YES | 'medium'::text |  |
| `kanban_order` | integer | YES | 0 |  |
| `source` | text | NO | 'auto'::text |  |

**Relationships (FKs):**
- `assigned_editor_id` → `auth.users.id`
- `content_id` → `content_items.id`
- `project_id` → `projects.id`

**Indexes:**
- `idx_project_tasks_assigned_editor` — `CREATE INDEX idx_project_tasks_assigned_editor ON public.project_tasks USING btree (assigned_editor_id)`
- `idx_project_tasks_content_id` — `CREATE INDEX idx_project_tasks_content_id ON public.project_tasks USING btree (content_id)`
- `idx_project_tasks_project_id` — `CREATE INDEX idx_project_tasks_project_id ON public.project_tasks USING btree (project_id)`
- `idx_project_tasks_status_order` — `CREATE INDEX idx_project_tasks_status_order ON public.project_tasks USING btree (status, kanban_order)`

**Triggers:**
- `trigger_notify_on_task_assignment` → `notify_on_task_assignment()`
- `update_project_tasks_updated_at` → `update_project_tasks_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage tasks` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Editors can create tasks on accessible projects` | INSERT | `—` | `((auth.uid() = assigned_editor_id) AND (EXISTS ( SELECT 1    FROM video_edito...` |
| `Editors can delete their assigned tasks` | DELETE | `(assigned_editor_id = auth.uid())` | `—` |
| `Editors can update their assigned tasks` | UPDATE | `(assigned_editor_id = auth.uid())` | `(assigned_editor_id = auth.uid())` |
| `Users can view tasks for accessible projects` | SELECT | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |

### `project_notes`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_notes`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `title` | text | NO | 'Untitled'::text |  |
| `content` | text | NO | ''::text |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `assigned_editor_id` | uuid | YES | — | FK reference |
| `content_id` | uuid | YES | — | FK reference |
| `created_by` | uuid | YES | — |  |
| `is_pinned` | boolean | NO | false |  |

**Relationships (FKs):**
- `assigned_editor_id` → `auth.users.id`
- `content_id` → `content_items.id`
- `created_by` → `auth.users.id`
- `created_by` → `profiles.id`
- `project_id` → `projects.id`

**Indexes:**
- `idx_project_notes_assigned_editor` — `CREATE INDEX idx_project_notes_assigned_editor ON public.project_notes USING btree (assigned_editor_id)`
- `idx_project_notes_content_id` — `CREATE INDEX idx_project_notes_content_id ON public.project_notes USING btree (content_id)`
- `idx_project_notes_project_id` — `CREATE INDEX idx_project_notes_project_id ON public.project_notes USING btree (project_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can create notes on accessible projects` | INSERT | `—` | `((created_by = auth.uid()) AND (has_role(auth.uid(), 'admin'::text) OR has_ro...` |
| `Users can delete own notes or admins manage all` | DELETE | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::text) OR has_role...` | `—` |
| `Users can update own notes or admins manage all` | UPDATE | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::text) OR has_role...` | `—` |
| `Users can view notes for accessible projects` | SELECT | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |

### `project_status_options`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_status_options`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `value` | text | NO | — |  |
| `label` | text | NO | — |  |
| `color` | text | NO | 'bg-gray-500'::text |  |
| `order_index` | integer | NO | 0 |  |
| `is_active` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `project_id` → `projects.id`

**Indexes:**
- `idx_project_status_options_project_id` — `CREATE INDEX idx_project_status_options_project_id ON public.project_status_options USING btree (project_id)`
- `project_status_options_project_id_value_key` — `CREATE UNIQUE INDEX project_status_options_project_id_value_key ON public.project_status_options USING btree (project_id, value)`

**Triggers:**
- `update_project_status_options_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage status options` | ALL | `(EXISTS ( SELECT 1    FROM user_roles ur   WHERE ((ur.user_id = auth.uid()) A...` | `(EXISTS ( SELECT 1    FROM user_roles ur   WHERE ((ur.user_id = auth.uid()) A...` |
| `Users can view status options for accessible projects` | SELECT | `(EXISTS ( SELECT 1    FROM (projects p      JOIN clients c ON ((p.client_id =...` | `—` |

### `project_type_options`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_type_options`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `value` | text | NO | — |  |
| `label` | text | NO | — |  |
| `order_index` | integer | NO | 0 |  |
| `is_active` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `project_id` → `projects.id`

**Indexes:**
- `idx_project_type_options_project_id` — `CREATE INDEX idx_project_type_options_project_id ON public.project_type_options USING btree (project_id)`
- `project_type_options_project_id_value_key` — `CREATE UNIQUE INDEX project_type_options_project_id_value_key ON public.project_type_options USING btree (project_id, value)`

**Triggers:**
- `update_project_type_options_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage type options` | ALL | `(EXISTS ( SELECT 1    FROM user_roles ur   WHERE ((ur.user_id = auth.uid()) A...` | `(EXISTS ( SELECT 1    FROM user_roles ur   WHERE ((ur.user_id = auth.uid()) A...` |
| `Users can view type options for accessible projects` | SELECT | `(EXISTS ( SELECT 1    FROM (projects p      JOIN clients c ON ((p.client_id =...` | `—` |

### `project_templates`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_templates`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_type` | USER-DEFINED | NO | — |  |
| `template_name` | text | NO | — |  |
| `default_video_count` | integer | NO | — |  |
| `default_interviews` | jsonb | NO | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |

**Indexes:**
- `project_templates_project_type_key` — `CREATE UNIQUE INDEX project_templates_project_type_key ON public.project_templates USING btree (project_type)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins and owners can manage templates` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text))` | `—` |
| `Authenticated users can view project templates` | SELECT | `(auth.uid() IS NOT NULL)` | `—` |

### `project_type_templates`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_type_templates`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `name` | text | NO | — | Display name |
| `description` | text | YES | — |  |
| `cadence` | text | NO | 'one_time'::text |  |
| `is_built_in` | boolean | NO | false |  |
| `legacy_key` | text | YES | — |  |
| `icon_type` | text | YES | — |  |
| `created_by` | uuid | YES | — |  |
| `steps` | jsonb | NO | '[]'::jsonb |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `created_by` → `profiles.id`

**Indexes:**
- `idx_project_type_templates_is_built_in` — `CREATE INDEX idx_project_type_templates_is_built_in ON public.project_type_templates USING btree (is_built_in)`
- `idx_project_type_templates_legacy_key` — `CREATE INDEX idx_project_type_templates_legacy_key ON public.project_type_templates USING btree (legacy_key)`

**Triggers:**
- `update_project_type_templates_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Anyone authenticated can view project type templates` | SELECT | `true` | `—` |
| `Owner and Admin can create project type templates` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` |
| `Owner and Admin can delete non-built-in project type templates` | DELETE | `((is_built_in = false) AND (has_role(auth.uid(), 'owner'::app_role) OR has_ro...` | `—` |
| `Owner and Admin can update project type templates` | UPDATE | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` | `—` |

### `project_review_tokens`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_review_tokens`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `token` | text | NO | — |  |
| `expires_at` | timestamp with time zone | NO | — | Timestamp |
| `created_by` | uuid | YES | — |  |
| `revoked` | boolean | YES | false |  |
| `access_count` | integer | YES | 0 |  |
| `last_accessed_at` | timestamp with time zone | YES | — | Timestamp |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `interview_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `created_by` → `auth.users.id`
- `interview_id` → `interviews.id`
- `project_id` → `projects.id`

**Indexes:**
- `idx_project_review_tokens_interview_id` — `CREATE INDEX idx_project_review_tokens_interview_id ON public.project_review_tokens USING btree (interview_id) WHERE (interview_id IS NOT NULL)`
- `project_review_tokens_token_key` — `CREATE UNIQUE INDEX project_review_tokens_token_key ON public.project_review_tokens USING btree (token)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Public can validate project review tokens` | SELECT | `((expires_at > now()) AND (revoked = false))` | `—` |
| `Team can manage project review tokens` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |

### `starred_projects`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `starred_projects`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `project_id` | uuid | NO | — | FK reference |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `project_id` → `projects.id`
- `user_id` → `auth.users.id`

**Indexes:**
- `starred_projects_user_id_project_id_key` — `CREATE UNIQUE INDEX starred_projects_user_id_project_id_key ON public.starred_projects USING btree (user_id, project_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can star projects` | INSERT | `—` | `((user_id = auth.uid()) AND (( SELECT count(*) AS count    FROM starred_proje...` |
| `Users can unstar projects` | DELETE | `(user_id = auth.uid())` | `—` |
| `Users can view own starred projects` | SELECT | `(user_id = auth.uid())` | `—` |

### `project_client_visible_columns`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_client_visible_columns`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `column_id` | text | NO | — | FK reference |
| `is_visible` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `project_id` → `projects.id`

**Indexes:**
- `idx_project_client_visible_columns_project_id` — `CREATE INDEX idx_project_client_visible_columns_project_id ON public.project_client_visible_columns USING btree (project_id)`
- `project_client_visible_columns_project_id_column_id_key` — `CREATE UNIQUE INDEX project_client_visible_columns_project_id_column_id_key ON public.project_client_visible_columns USING btree (project_id, column_id)`

**Triggers:**
- `update_project_client_visible_columns_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can view client column visibility` | SELECT | `true` | `—` |
| `Privileged roles can delete client column visibility` | DELETE | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` | `—` |
| `Privileged roles can insert client column visibility` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` |
| `Privileged roles can update client column visibility` | UPDATE | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` | `—` |

### `project_column_labels`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_column_labels`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `column_id` | text | NO | — | FK reference |
| `custom_label` | text | NO | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `project_id` → `projects.id`

**Indexes:**
- `project_column_labels_project_id_column_id_key` — `CREATE UNIQUE INDEX project_column_labels_project_id_column_id_key ON public.project_column_labels USING btree (project_id, column_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage column labels` | ALL | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |
| `Authenticated users can view column labels` | SELECT | `(auth.uid() IS NOT NULL)` | `—` |

### `project_column_order`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `project_column_order`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | NO | — | FK reference |
| `column_order` | jsonb | NO | '[]'::jsonb |  |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `updated_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `project_id` → `projects.id`
- `updated_by` → `auth.users.id`

**Indexes:**
- `idx_project_column_order_project` — `CREATE UNIQUE INDEX idx_project_column_order_project ON public.project_column_order USING btree (project_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can delete column order` | DELETE | `(auth.uid() IS NOT NULL)` | `—` |
| `Authenticated users can insert column order` | INSERT | `—` | `(auth.uid() IS NOT NULL)` |
| `Authenticated users can update column order` | UPDATE | `(auth.uid() IS NOT NULL)` | `—` |
| `Authenticated users can view column order` | SELECT | `(auth.uid() IS NOT NULL)` | `—` |

### `custom_journey_steps`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `custom_journey_steps`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `step_key` | text | NO | — |  |
| `name` | text | NO | — | Display name |
| `client_description` | text | YES | — |  |
| `default_visibility` | text | NO | 'client'::text |  |
| `default_roles` | ARRAY | YES | '{}'::text[] |  |
| `has_call` | boolean | NO | false |  |
| `calendly_type` | text | YES | — |  |
| `has_approval` | boolean | NO | false |  |
| `component_key` | text | YES | — |  |
| `created_by` | uuid | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `created_by` → `profiles.id`

**Indexes:**
- `custom_journey_steps_step_key_key` — `CREATE UNIQUE INDEX custom_journey_steps_step_key_key ON public.custom_journey_steps USING btree (step_key)`

**Triggers:**
- `update_custom_journey_steps_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Anyone authenticated can view custom journey steps` | SELECT | `true` | `—` |
| `Owner and Admin can create custom journey steps` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` |
| `Owner and Admin can delete custom journey steps` | DELETE | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` | `—` |
| `Owner and Admin can update custom journey steps` | UPDATE | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` | `—` |

### `client_journey_steps`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_journey_steps`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `step_key` | text | NO | — |  |
| `completed` | boolean | NO | false |  |
| `completed_at` | timestamp with time zone | YES | — | Timestamp |
| `completed_by` | uuid | YES | — |  |
| `notes` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `completed_by` → `profiles.id`

**Indexes:**
- `client_journey_steps_client_id_step_key_key` — `CREATE UNIQUE INDEX client_journey_steps_client_id_step_key_key ON public.client_journey_steps USING btree (client_id, step_key)`

**Triggers:**
- `update_client_journey_steps_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can view their own journey steps` | SELECT | `user_has_client_access(auth.uid(), client_id)` | `—` |
| `Editor admins can view journey steps` | SELECT | `(has_role(auth.uid(), 'editor_admin'::text) OR has_role(auth.uid(), 'content_...` | `—` |
| `Owners and admins can manage journey steps` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |

### `solution_types`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `solution_types`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `name` | text | NO | — | Display name |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `created_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `created_by` → `auth.users.id`

**Indexes:**
- `solution_types_name_key` — `CREATE UNIQUE INDEX solution_types_name_key ON public.solution_types USING btree (name)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage solution types` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Authenticated users can view solution types` | SELECT | `(auth.uid() IS NOT NULL)` | `—` |


## Domain: Videos / Content Items

### `content_items`
🔒 **RLS:** ENABLED
**Purpose:** A single video deliverable. The core pipeline row.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `interview_id` | uuid | YES | — | FK reference |
| `post_date` | date | YES | — |  |
| `priority` | USER-DEFINED | NO | 'medium'::content_priority |  |
| `video_title` | text | NO | — |  |
| `statuses` | ARRAY | YES | ARRAY[]::content_status[] |  |
| `rough_cut_link` | text | YES | — |  |
| `ready_video_link` | text | YES | — |  |
| `types` | ARRAY | YES | ARRAY[]::content_type[] |  |
| `caption` | text | YES | — |  |
| `thumbnail_link` | text | YES | — |  |
| `notes` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `created_by` | uuid | YES | — |  |
| `aspect_ratio` | text | YES | '9:16'::text |  |
| `custom_width` | integer | YES | — |  |
| `custom_height` | integer | YES | — |  |
| `project_id` | uuid | YES | — | FK reference |
| `interview_section` | text | YES | 'all'::text |  |
| `order_index` | integer | YES | 0 |  |
| `transcript` | text | YES | — |  |
| `status` | USER-DEFINED | NO | 'not_started'::unified_status | Current status |
| `editors` | ARRAY | YES | ARRAY[]::uuid[] |  |
| `caption_approved` | boolean | YES | false |  |
| `thumbnail_approved` | boolean | YES | false |  |
| `thumbnail_revision_notes` | text | YES | — |  |
| `caption_context` | text | YES | — |  |
| `video_cloudflare_id` | text | YES | — | FK reference |
| `video_playback_url` | text | YES | — | URL string |
| `video_thumbnail_url` | text | YES | — | URL string |
| `video_file_name` | text | YES | — |  |
| `video_file_size` | bigint | YES | — |  |
| `video_duration` | integer | YES | — |  |
| `video_width` | integer | YES | — |  |
| `video_height` | integer | YES | — |  |
| `video_upload_status` | text | YES | 'pending'::text |  |
| `video_upload_progress` | integer | YES | 0 |  |
| `video_error_message` | text | YES | — |  |
| `video_uploaded_at` | timestamp with time zone | YES | — | Timestamp |
| `video_uploaded_by` | uuid | YES | — |  |
| `video_cloudflare_folder` | text | YES | — |  |
| `video_organized_name` | text | YES | — |  |
| `video_upload_session_url` | text | YES | — | URL string |
| `video_chunks_uploaded` | integer | YES | 0 |  |
| `video_total_chunks` | integer | YES | — |  |
| `video_bytes_uploaded` | bigint | YES | 0 |  |
| `video_upload_started_at` | timestamp with time zone | YES | — | Timestamp |
| `video_upload_completed_at` | timestamp with time zone | YES | — | Timestamp |
| `video_current_upload_phase` | text | YES | — |  |
| `video_original_url` | text | YES | — | URL string |
| `video_original_storage_path` | text | YES | — | Storage path |
| `thumbnail_storage_path` | text | YES | — | Storage path |
| `transcription_status` | text | YES | 'pending'::text |  |
| `transcription_error` | text | YES | — |  |
| `transcription_started_at` | timestamp with time zone | YES | — | Timestamp |
| `transcription_completed_at` | timestamp with time zone | YES | — | Timestamp |
| `transcription_retry_count` | integer | YES | 0 |  |
| `caption_status` | text | YES | 'pending'::text |  |
| `detected_language` | text | YES | — |  |
| `detected_dialect` | text | YES | — |  |
| `freebie_word` | text | YES | — |  |
| `freebie_content` | text | YES | — |  |
| `text_hook` | text | YES | — |  |
| `thumbnail_text` | text | YES | — |  |
| `r2_upload_source` | text | YES | — |  |
| `trial_date` | text | YES | — |  |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `created_by` → `profiles.id`
- `interview_id` → `interviews.id`
- `project_id` → `projects.id`
- `video_uploaded_by` → `profiles.id`

**Indexes:**
- `idx_content_items_aspect_ratio` — `CREATE INDEX idx_content_items_aspect_ratio ON public.content_items USING btree (aspect_ratio)`
- `idx_content_items_client` — `CREATE INDEX idx_content_items_client ON public.content_items USING btree (client_id)`
- `idx_content_items_cloudflare_folder` — `CREATE INDEX idx_content_items_cloudflare_folder ON public.content_items USING btree (video_cloudflare_folder)`
- `idx_content_items_cloudflare_id` — `CREATE INDEX idx_content_items_cloudflare_id ON public.content_items USING btree (video_cloudflare_id)`
- `idx_content_items_editors` — `CREATE INDEX idx_content_items_editors ON public.content_items USING gin (editors)`
- `idx_content_items_interview` — `CREATE INDEX idx_content_items_interview ON public.content_items USING btree (interview_id)`
- `idx_content_items_interview_section` — `CREATE INDEX idx_content_items_interview_section ON public.content_items USING btree (interview_section)`
- `idx_content_items_order` — `CREATE INDEX idx_content_items_order ON public.content_items USING btree (project_id, order_index)`
- `idx_content_items_post_date` — `CREATE INDEX idx_content_items_post_date ON public.content_items USING btree (post_date)`
- `idx_content_items_project_interview` — `CREATE INDEX idx_content_items_project_interview ON public.content_items USING btree (project_id, interview_section)`
- `idx_content_items_upload_status` — `CREATE INDEX idx_content_items_upload_status ON public.content_items USING btree (video_upload_status) WHERE (video_upload_status = ANY (ARRAY['pending'::text, 'uploading'::text, 'processing'::text]))`
- `idx_content_items_video_status` — `CREATE INDEX idx_content_items_video_status ON public.content_items USING btree (video_upload_status)`

**Triggers:**
- `enforce_editor_status_restrictions_trigger` → `enforce_editor_status_restrictions()`
- `on_content_status_change` → `update_project_progress_on_content_change()`
- `sync_editors_to_video_editors` → `sync_editors_array_to_video_editors()`
- `track_video_creation` → `update_video_usage()`
- `track_video_usage` → `update_video_usage()`
- `trg_auto_assign_interview_id` → `auto_assign_interview_id()`
- `trg_log_video_status_change` → `log_video_status_change()`
- `trigger_auto_move_backlog_on_upload` → `auto_move_backlog_on_upload()`
- `trigger_notify_on_video_status_change` → `notify_on_video_status_change()`
- `trigger_update_project_progress` → `update_project_progress()`
- `update_content_items_updated_at` → `update_updated_at()`
- `validate_video_types_trigger` → `validate_video_types()`
- `video_status_notification_trigger` → `handle_video_status_notification()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can delete content` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Admins, owners, and editor admins can insert content` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Admins, owners, and editor admins can update content` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Clients can update content fields with restrictions` | UPDATE | `(EXISTS ( SELECT 1    FROM client_access ca   WHERE ((ca.user_id = auth.uid()...` | `(status = ANY (ARRAY['not_started'::unified_status, 'rough_cut'::unified_stat...` |
| `Clients can view visible videos` | SELECT | `((EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id =...` | `—` |
| `Editors can delete their assigned content` | DELETE | `((auth.uid() = ANY (editors)) OR (id IN ( SELECT video_editors.content_id    ...` | `—` |
| `Editors can insert content for assigned clients` | INSERT | `—` | `(has_role(auth.uid(), 'editor'::text) AND (EXISTS ( SELECT 1    FROM video_ed...` |
| `Editors can update their assigned content` | UPDATE | `((auth.uid() = ANY (editors)) OR (id IN ( SELECT video_editors.content_id    ...` | `((auth.uid() = ANY (editors)) OR (id IN ( SELECT video_editors.content_id    ...` |
| `Editors can view all content for inspiration` | SELECT | `has_role(auth.uid(), 'editor'::text)` | `—` |
| `Editors can view their assigned videos` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Shared project clients can view videos` | SELECT | `user_has_shared_project_access(auth.uid(), project_id)` | `—` |
| `Token holders can view shared videos` | SELECT | `((auth.uid() IS NOT NULL) OR has_valid_review_token(id))` | `—` |

### `content_versions`
🔒 **RLS:** ENABLED
**Purpose:** Per-video version history (V1, V2, …).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_id` | uuid | NO | — | FK reference |
| `version_number` | integer | NO | 1 |  |
| `video_cloudflare_id` | text | YES | — | FK reference |
| `video_playback_url` | text | YES | — | URL string |
| `video_thumbnail_url` | text | YES | — | URL string |
| `video_file_name` | text | YES | — |  |
| `video_file_size` | bigint | YES | — |  |
| `video_duration` | integer | YES | — |  |
| `video_width` | integer | YES | — |  |
| `video_height` | integer | YES | — |  |
| `video_original_url` | text | YES | — | URL string |
| `video_original_storage_path` | text | YES | — | Storage path |
| `uploaded_at` | timestamp with time zone | YES | now() | Timestamp |
| `uploaded_by` | uuid | YES | — |  |
| `version_notes` | text | YES | — |  |
| `is_current` | boolean | YES | true |  |
| `transcript` | text | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `video_upload_session_url` | text | YES | — | URL string |
| `video_upload_status` | text | YES | 'pending'::text |  |
| `video_upload_progress` | integer | YES | 0 |  |
| `video_total_chunks` | integer | YES | — |  |
| `video_bytes_uploaded` | bigint | YES | 0 |  |
| `video_chunks_uploaded` | integer | YES | 0 |  |
| `version_type` | text | NO | 'intermediate'::text |  |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `custom_version_label` | text | YES | — |  |
| `r2_upload_source` | text | YES | — |  |

**Relationships (FKs):**
- `content_id` → `content_items.id`
- `uploaded_by` → `auth.users.id`

**Indexes:**
- `content_versions_content_id_version_number_key` — `CREATE UNIQUE INDEX content_versions_content_id_version_number_key ON public.content_versions USING btree (content_id, version_number)`
- `idx_content_versions_cleanup` — `CREATE INDEX idx_content_versions_cleanup ON public.content_versions USING btree (version_type, is_current, created_at) WHERE ((version_type = 'intermediate'::text) AND (is_current = false))`
- `idx_content_versions_content_id` — `CREATE INDEX idx_content_versions_content_id ON public.content_versions USING btree (content_id)`
- `idx_content_versions_current` — `CREATE INDEX idx_content_versions_current ON public.content_versions USING btree (content_id) WHERE (is_current = true)`
- `idx_content_versions_uploaded_at` — `CREATE INDEX idx_content_versions_uploaded_at ON public.content_versions USING btree (uploaded_at DESC)`

**Triggers:**
- `ensure_single_current_version_trigger` → `ensure_single_current_version()`
- `set_content_versions_updated_at` → `update_content_versions_updated_at()`
- `sync_r2_on_version_current` → `sync_content_item_r2_from_version()`
- `trigger_notify_on_new_version` → `notify_on_new_version()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage versions` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Clients can view versions for their videos` | SELECT | `(EXISTS ( SELECT 1    FROM (content_items ci      JOIN client_access ca ON ((...` | `—` |
| `Editors can manage versions for assigned videos` | ALL | `(EXISTS ( SELECT 1    FROM content_items ci   WHERE ((ci.id = content_version...` | `—` |
| `Token holders can view shared versions` | SELECT | `((auth.uid() IS NOT NULL) OR has_valid_review_token(content_id))` | `—` |

### `thumbnail_versions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `thumbnail_versions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_id` | uuid | NO | — | FK reference |
| `version_number` | integer | NO | 1 |  |
| `thumbnail_url` | text | NO | — | URL string |
| `thumbnail_storage_path` | text | NO | — | Storage path |
| `is_current` | boolean | YES | false |  |
| `uploaded_at` | timestamp with time zone | YES | now() | Timestamp |
| `uploaded_by` | uuid | YES | — |  |
| `version_notes` | text | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |

**Relationships (FKs):**
- `content_id` → `content_items.id`
- `uploaded_by` → `auth.users.id`

**Indexes:**
- `idx_thumbnail_versions_content_id` — `CREATE INDEX idx_thumbnail_versions_content_id ON public.thumbnail_versions USING btree (content_id)`
- `idx_thumbnail_versions_created_at` — `CREATE INDEX idx_thumbnail_versions_created_at ON public.thumbnail_versions USING btree (created_at)`
- `idx_thumbnail_versions_is_current` — `CREATE INDEX idx_thumbnail_versions_is_current ON public.thumbnail_versions USING btree (is_current)`

**Triggers:**
- `ensure_single_current_thumbnail` → `ensure_single_current_thumbnail_version()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage thumbnail versions` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Clients can view thumbnail versions for their videos` | SELECT | `(EXISTS ( SELECT 1    FROM (content_items ci      JOIN client_access ca ON ((...` | `—` |
| `Editors can manage thumbnail versions for assigned videos` | ALL | `(EXISTS ( SELECT 1    FROM (video_editors ve      JOIN content_items ci ON ((...` | `—` |

### `trial_reels`
🔒 **RLS:** ENABLED

> 🔄 **REWORK** per corrected logic: 0 trials = single video; 1+ = group; winners promote, losers archive as `trial_loser=true` versions.

**Purpose:** Trial reel variants for A/B winner-promotion flow.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_id` | uuid | NO | — | FK reference |
| `version_id` | uuid | YES | — | FK reference |
| `hook_cloudflare_id` | text | YES | — | FK reference |
| `hook_playback_url` | text | YES | — | URL string |
| `hook_thumbnail_url` | text | YES | — | URL string |
| `hook_duration` | integer | YES | — |  |
| `hook_file_name` | text | YES | — |  |
| `hook_file_size` | bigint | YES | — |  |
| `hook_upload_status` | text | YES | 'pending'::text |  |
| `trial_number` | integer | NO | 1 |  |
| `hook_description` | text | YES | — |  |
| `is_active` | boolean | YES | true |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `created_by` | uuid | YES | — |  |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `trial_date` | date | YES | — |  |

**Relationships (FKs):**
- `content_id` → `content_items.id`
- `created_by` → `auth.users.id`
- `version_id` → `content_versions.id`

**Indexes:**
- `idx_trial_reels_content_id` — `CREATE INDEX idx_trial_reels_content_id ON public.trial_reels USING btree (content_id)`
- `idx_trial_reels_version_id` — `CREATE INDEX idx_trial_reels_version_id ON public.trial_reels USING btree (version_id)`
- `trial_reels_content_id_trial_number_key` — `CREATE UNIQUE INDEX trial_reels_content_id_trial_number_key ON public.trial_reels USING btree (content_id, trial_number)`

**Triggers:**
- `update_trial_reels_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage trial reels` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Clients can view trial reels` | SELECT | `(EXISTS ( SELECT 1    FROM (content_items ci      JOIN client_access ca ON ((...` | `—` |
| `Editors can manage assigned trial reels` | ALL | `(EXISTS ( SELECT 1    FROM (video_editors ve      JOIN content_items ci ON ((...` | `—` |

### `video_editors`
🔒 **RLS:** ENABLED
**Purpose:** Editor↔video assignment cascade (workspace/project/video levels).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_id` | uuid | YES | — | FK reference |
| `editor_id` | uuid | YES | — | FK reference |
| `assigned_at` | timestamp with time zone | YES | now() | Timestamp |
| `assigned_by` | uuid | YES | — |  |
| `role` | text | YES | 'secondary'::text | Role enum |
| `client_id` | uuid | YES | — | FK reference |
| `project_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `assigned_by` → `profiles.id`
- `client_id` → `clients.id`
- `content_id` → `content_items.id`
- `editor_id` → `profiles.id`
- `project_id` → `projects.id`

**Indexes:**
- `idx_video_editors_client` — `CREATE INDEX idx_video_editors_client ON public.video_editors USING btree (client_id) WHERE (client_id IS NOT NULL)`
- `idx_video_editors_content` — `CREATE INDEX idx_video_editors_content ON public.video_editors USING btree (content_id)`
- `idx_video_editors_content_scope` — `CREATE INDEX idx_video_editors_content_scope ON public.video_editors USING btree (content_id) WHERE (content_id IS NOT NULL)`
- `idx_video_editors_editor` — `CREATE INDEX idx_video_editors_editor ON public.video_editors USING btree (editor_id)`
- `idx_video_editors_project` — `CREATE INDEX idx_video_editors_project ON public.video_editors USING btree (project_id) WHERE (project_id IS NOT NULL)`
- `video_editors_content_editor_unique` — `CREATE UNIQUE INDEX video_editors_content_editor_unique ON public.video_editors USING btree (content_id, editor_id)`
- `video_editors_content_id_editor_id_key` — `CREATE UNIQUE INDEX video_editors_content_id_editor_id_key ON public.video_editors USING btree (content_id, editor_id)`

**Triggers:**
- `delete_video_task_trigger` → `auto_delete_video_task()`
- `trigger_auto_delete_video_task` → `auto_delete_video_task()`
- `trigger_notify_on_editor_assignment` → `notify_on_editor_assignment()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins and editor_admins can assign editors` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Admins and editor_admins can remove assignments` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `View editor assignments` | SELECT | `((editor_id = auth.uid()) OR has_role(auth.uid(), 'owner'::text) OR has_role(...` | `—` |

### `video_status_history`
🔒 **RLS:** ENABLED

> ✅ **KEEP** — needed for new modular status audit trail.

**Purpose:** See codebase usage for `video_status_history`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_id` | uuid | NO | — | FK reference |
| `old_status` | text | YES | — |  |
| `new_status` | text | NO | — |  |
| `changed_by` | uuid | YES | — |  |
| `changed_at` | timestamp with time zone | NO | now() | Timestamp |

**Relationships (FKs):**
- `content_id` → `content_items.id`

**Indexes:**
- `idx_video_status_history_changed_at` — `CREATE INDEX idx_video_status_history_changed_at ON public.video_status_history USING btree (changed_at DESC)`
- `idx_video_status_history_content_id` — `CREATE INDEX idx_video_status_history_content_id ON public.video_status_history USING btree (content_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can read status history for their videos` | SELECT | `(EXISTS ( SELECT 1    FROM (content_items ci      JOIN client_access ca ON ((...` | `—` |
| `Editor admins can read all status history` | SELECT | `(has_role(auth.uid(), 'editor_admin'::text) OR has_role(auth.uid(), 'content_...` | `—` |
| `Editors can read status history for assigned videos` | SELECT | `(has_role(auth.uid(), 'editor'::text) AND (EXISTS ( SELECT 1    FROM video_ed...` | `—` |
| `Owners and admins can read all status history` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |

### `video_comments`
🔒 **RLS:** ENABLED
**Purpose:** Timestamped review comments on a video.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_id` | uuid | NO | — | FK reference |
| `user_id` | uuid | YES | — | References auth.users |
| `parent_comment_id` | uuid | YES | — | FK reference |
| `comment` | text | NO | — |  |
| `timestamp_seconds` | numeric | NO | — |  |
| `status` | text | NO | 'active'::text | Current status |
| `resolved_at` | timestamp with time zone | YES | — | Timestamp |
| `resolved_by` | uuid | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | — | Last-updated timestamp |
| `comment_type` | text | YES | — |  |
| `guest_name` | text | YES | — |  |
| `version_id` | uuid | YES | — | FK reference |
| `timestamp_end_seconds` | numeric | YES | — |  |
| `is_internal` | boolean | YES | false |  |
| `guest_email` | text | YES | — |  |

**Relationships (FKs):**
- `content_id` → `content_items.id`
- `parent_comment_id` → `video_comments.id`
- `version_id` → `content_versions.id`

**Indexes:**
- `idx_video_comments_content` — `CREATE INDEX idx_video_comments_content ON public.video_comments USING btree (content_id)`
- `idx_video_comments_content_version_status` — `CREATE INDEX idx_video_comments_content_version_status ON public.video_comments USING btree (content_id, version_id, status)`
- `idx_video_comments_is_internal` — `CREATE INDEX idx_video_comments_is_internal ON public.video_comments USING btree (is_internal)`
- `idx_video_comments_status` — `CREATE INDEX idx_video_comments_status ON public.video_comments USING btree (status)`
- `idx_video_comments_timestamp` — `CREATE INDEX idx_video_comments_timestamp ON public.video_comments USING btree (content_id, timestamp_seconds)`
- `idx_video_comments_user` — `CREATE INDEX idx_video_comments_user ON public.video_comments USING btree (user_id)`
- `idx_video_comments_version` — `CREATE INDEX idx_video_comments_version ON public.video_comments USING btree (version_id)`

**Triggers:**
- `trigger_notify_on_comment_reply` → `notify_on_comment_reply()`
- `trigger_notify_on_mention` → `notify_on_mention()`
- `trigger_notify_on_new_comment` → `notify_editors_on_new_comment()`
- `video_comments_updated_at` → `update_video_comments_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authorized users can create comments` | INSERT | `—` | `((user_id = auth.uid()) AND (EXISTS ( SELECT 1    FROM content_items ci   WHE...` |
| `Public can view comments on shared videos` | SELECT | `(has_valid_review_token(content_id) OR has_valid_project_review_token_for_con...` | `—` |
| `Users can delete their own comments` | DELETE | `((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::text) OR has_role(au...` | `—` |
| `Users can update their own comments` | UPDATE | `((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::text) OR has_role(au...` | `—` |
| `Users can view comments on accessible videos` | SELECT | `(EXISTS ( SELECT 1    FROM content_items ci   WHERE ((ci.id = video_comments....` | `—` |

### `video_annotations`
🔒 **RLS:** ENABLED
**Purpose:** Drawn annotation shapes on a video frame.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `comment_id` | uuid | YES | — | FK reference |
| `content_id` | uuid | NO | — | FK reference |
| `version_id` | uuid | YES | — | FK reference |
| `annotation_data` | jsonb | NO | — |  |
| `frame_timestamp` | numeric | NO | — |  |
| `frame_thumbnail` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `comment_id` → `video_comments.id`
- `content_id` → `content_items.id`
- `version_id` → `content_versions.id`

**Indexes:**
- `idx_video_annotations_comment_id` — `CREATE INDEX idx_video_annotations_comment_id ON public.video_annotations USING btree (comment_id)`
- `idx_video_annotations_content_id` — `CREATE INDEX idx_video_annotations_content_id ON public.video_annotations USING btree (content_id)`

**Triggers:**
- `update_video_annotations_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Public can view annotations on shared videos` | SELECT | `(EXISTS ( SELECT 1    FROM video_comments vc   WHERE ((vc.id = video_annotati...` | `—` |
| `Users can create annotations on accessible videos` | INSERT | `—` | `((EXISTS ( SELECT 1    FROM (content_items ci      LEFT JOIN client_access ca...` |
| `Users can delete own annotations` | DELETE | `(((comment_id IS NOT NULL) AND (EXISTS ( SELECT 1    FROM video_comments vc  ...` | `—` |
| `Users can update own annotations` | UPDATE | `(((comment_id IS NOT NULL) AND (EXISTS ( SELECT 1    FROM video_comments vc  ...` | `—` |
| `Users can view annotations on accessible videos` | SELECT | `(EXISTS ( SELECT 1    FROM content_items ci   WHERE ((ci.id = video_annotatio...` | `—` |

### `comment_attachments`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `comment_attachments`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `comment_id` | uuid | NO | — | FK reference |
| `storage_path` | text | NO | — | Storage path |
| `file_name` | text | NO | — |  |
| `file_size` | bigint | YES | — |  |
| `content_type` | text | NO | — |  |
| `uploaded_by` | uuid | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `expires_at` | timestamp with time zone | NO | (now() + '14 days'::interval) | Timestamp |

**Relationships (FKs):**
- `comment_id` → `video_comments.id`
- `uploaded_by` → `auth.users.id`

**Indexes:**
- `idx_comment_attachments_comment_id` — `CREATE INDEX idx_comment_attachments_comment_id ON public.comment_attachments USING btree (comment_id)`
- `idx_comment_attachments_expires_at` — `CREATE INDEX idx_comment_attachments_expires_at ON public.comment_attachments USING btree (expires_at)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Anyone can view comment attachments` | SELECT | `true` | `—` |
| `Authenticated users can insert attachments` | INSERT | `—` | `(auth.uid() = uploaded_by)` |
| `Users can delete own attachments` | DELETE | `(auth.uid() = uploaded_by)` | `—` |

### `content_comments`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `content_comments`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_id` | uuid | NO | — | FK reference |
| `user_id` | uuid | NO | — | References auth.users |
| `comment` | text | NO | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `context` | text | YES | 'video'::text |  |
| `status` | text | NO | 'active'::text | Current status |
| `resolved_at` | timestamp with time zone | YES | — | Timestamp |
| `resolved_by` | uuid | YES | — |  |
| `version_id` | uuid | YES | — | FK reference |
| `parent_comment_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `content_id` → `content_items.id`
- `parent_comment_id` → `content_comments.id`
- `user_id` → `auth.users.id`
- `version_id` → `thumbnail_versions.id`

**Indexes:**
- `idx_content_comments_context` — `CREATE INDEX idx_content_comments_context ON public.content_comments USING btree (content_id, context)`
- `idx_content_comments_parent_id` — `CREATE INDEX idx_content_comments_parent_id ON public.content_comments USING btree (parent_comment_id)`
- `idx_content_comments_status` — `CREATE INDEX idx_content_comments_status ON public.content_comments USING btree (status)`
- `idx_content_comments_version_id` — `CREATE INDEX idx_content_comments_version_id ON public.content_comments USING btree (version_id)`

**Triggers:**
- `update_content_comments_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can add comments` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can delete their own comments` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users can update their own comments` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view comments on accessible content` | SELECT | `(EXISTS ( SELECT 1    FROM content_items ci   WHERE ((ci.id = content_comment...` | `—` |

### `video_usage_tracking`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `video_usage_tracking`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `month` | date | NO | — |  |
| `videos_created` | integer | YES | 0 |  |
| `videos_limit` | integer | NO | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `video_usage_tracking_client_id_month_key` — `CREATE UNIQUE INDEX video_usage_tracking_client_id_month_key ON public.video_usage_tracking USING btree (client_id, month)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage video usage` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Users can view usage for accessible clients` | SELECT | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |

### `download_logs`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `download_logs`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | YES | — | References auth.users |
| `content_item_id` | uuid | YES | — | FK reference |
| `version_id` | uuid | YES | — | FK reference |
| `client_id` | uuid | YES | — | FK reference |
| `filename` | text | YES | — |  |
| `source` | text | NO | — |  |
| `cloudflare_video_id` | text | YES | — | FK reference |
| `ip_address` | text | YES | — |  |
| `user_agent` | text | YES | — |  |
| `metadata` | jsonb | YES | '{}'::jsonb | JSON metadata blob |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `content_item_id` → `content_items.id`
- `user_id` → `auth.users.id`
- `version_id` → `content_versions.id`

**Indexes:**
- `idx_download_logs_client_id` — `CREATE INDEX idx_download_logs_client_id ON public.download_logs USING btree (client_id)`
- `idx_download_logs_content_item_id` — `CREATE INDEX idx_download_logs_content_item_id ON public.download_logs USING btree (content_item_id)`
- `idx_download_logs_created_at` — `CREATE INDEX idx_download_logs_created_at ON public.download_logs USING btree (created_at DESC)`
- `idx_download_logs_user_id` — `CREATE INDEX idx_download_logs_user_id ON public.download_logs USING btree (user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can view all download logs` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Users can view their own downloads` | SELECT | `(user_id = auth.uid())` | `—` |

### `upload_logs`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `upload_logs`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_item_id` | uuid | YES | — | FK reference |
| `version_id` | uuid | YES | — | FK reference |
| `trial_id` | uuid | YES | — | FK reference |
| `cloudflare_video_id` | text | YES | — | FK reference |
| `event` | text | NO | — |  |
| `details` | jsonb | YES | '{}'::jsonb |  |
| `user_id` | uuid | YES | — | References auth.users |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `content_item_id` → `content_items.id`
- `version_id` → `content_versions.id`

**Indexes:**
- `idx_upload_logs_cloudflare_video_id` — `CREATE INDEX idx_upload_logs_cloudflare_video_id ON public.upload_logs USING btree (cloudflare_video_id)`
- `idx_upload_logs_content_item_id` — `CREATE INDEX idx_upload_logs_content_item_id ON public.upload_logs USING btree (content_item_id)`
- `idx_upload_logs_created_at` — `CREATE INDEX idx_upload_logs_created_at ON public.upload_logs USING btree (created_at DESC)`
- `idx_upload_logs_event` — `CREATE INDEX idx_upload_logs_event ON public.upload_logs USING btree (event)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Team members can view upload logs` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |


## Domain: Content Studio

### `client_foundation`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_foundation`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `client_type_tag` | text | YES | — |  |
| `full_name` | text | YES | — | Display name |
| `profession_title` | text | YES | — |  |
| `professional_bio` | text | YES | — |  |
| `personal_bio` | text | YES | — |  |
| `three_words` | text | YES | — |  |
| `preferred_language` | text | YES | — |  |
| `noteworthy_achievements` | text | YES | — |  |
| `social_media_links` | text | YES | — |  |
| `controversial_topic` | text | YES | — |  |
| `industry_challenges` | text | YES | — |  |
| `target_audience` | text | YES | — |  |
| `common_questions` | text | YES | — |  |
| `content_inspirations` | text | YES | — |  |
| `brand_guidelines` | text | YES | — |  |
| `self_perception` | text | YES | — |  |
| `others_perception` | text | YES | — |  |
| `desired_perception` | text | YES | — |  |
| `studio_setups` | ARRAY | YES | '{}'::text[] |  |
| `expertise_topics` | ARRAY | YES | '{}'::text[] |  |
| `unique_perspectives` | jsonb | YES | '[]'::jsonb |  |
| `common_misconceptions` | jsonb | YES | '[]'::jsonb |  |
| `stats_numbers` | ARRAY | YES | '{}'::text[] |  |
| `testimonials` | ARRAY | YES | '{}'::text[] |  |
| `media_features` | ARRAY | YES | '{}'::text[] |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `client_type_custom` | text | YES | — |  |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `client_foundation_client_id_key` — `CREATE UNIQUE INDEX client_foundation_client_id_key ON public.client_foundation USING btree (client_id)`

**Triggers:**
- `update_client_foundation_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can insert their foundation when published` | INSERT | `—` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can update their foundation when published` | UPDATE | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can view their foundation when published` | SELECT | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `—` |
| `Owners and admins can manage client_foundation` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |

### `client_bios`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_bios`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `tone` | text | YES | 'professional'::text |  |
| `instagram_bio` | text | YES | — |  |
| `tiktok_bio` | text | YES | — |  |
| `youtube_bio` | text | YES | — |  |
| `linkedin_bio` | text | YES | — |  |
| `twitter_bio` | text | YES | — |  |
| `cta_text` | text | YES | — |  |
| `cta_link` | text | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `client_bios_client_id_key` — `CREATE UNIQUE INDEX client_bios_client_id_key ON public.client_bios USING btree (client_id)`

**Triggers:**
- `update_client_bios_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can insert their bio when published` | INSERT | `—` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can update their bio when published` | UPDATE | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can view their bio when published` | SELECT | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `—` |
| `Owners and admins can manage bios` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |

### `client_audience_avatars`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_audience_avatars`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `name` | text | NO | 'New Avatar'::text | Display name |
| `emoji` | text | YES | '🎯'::text |  |
| `age_range` | text | YES | — |  |
| `location` | text | YES | — |  |
| `income` | text | YES | — |  |
| `occupation` | text | YES | — |  |
| `fears_pains` | ARRAY | YES | '{}'::text[] |  |
| `desires_goals` | ARRAY | YES | '{}'::text[] |  |
| `blockers` | ARRAY | YES | '{}'::text[] |  |
| `phrases` | ARRAY | YES | '{}'::text[] |  |
| `order_index` | integer | YES | 0 |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Triggers:**
- `update_client_audience_avatars_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can insert their audience when published` | INSERT | `—` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can update their audience when published` | UPDATE | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can view their audience when published` | SELECT | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `—` |
| `Owners and admins can manage audience avatars` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |

### `client_pillars`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_pillars`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `content` | jsonb | YES | '{}'::jsonb |  |
| `pillar_distribution` | jsonb | YES | '[]'::jsonb |  |
| `language` | text | YES | 'en'::text |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `pillar_contents` | jsonb | YES | '{}'::jsonb |  |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `client_pillars_client_id_key` — `CREATE UNIQUE INDEX client_pillars_client_id_key ON public.client_pillars USING btree (client_id)`

**Triggers:**
- `update_client_pillars_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can insert their pillars when published` | INSERT | `—` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can update their pillars when published` | UPDATE | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can view their pillars when published` | SELECT | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `—` |
| `Owners and admins can manage pillars` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |

### `client_brain_materials`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_brain_materials`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `material_type` | text | NO | 'sales_call'::text |  |
| `title` | text | NO | — |  |
| `file_url` | text | YES | — | URL string |
| `file_size` | bigint | YES | — |  |
| `transcript` | text | YES | — |  |
| `extracted_insights` | jsonb | YES | '[]'::jsonb |  |
| `voice_traits` | ARRAY | YES | '{}'::text[] |  |
| `status` | text | YES | 'processing'::text | Current status |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Triggers:**
- `update_client_brain_materials_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners and admins can manage client_brain_materials` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |

### `content_ideas`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `content_ideas`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `title` | text | NO | 'New Idea'::text |  |
| `description` | text | YES | ''::text |  |
| `pillar` | text | NO | 'reach'::text |  |
| `status` | text | NO | 'idea'::text | Current status |
| `source` | text | NO | 'agency'::text |  |
| `upvotes` | integer | NO | 0 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Triggers:**
- `update_content_ideas_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners/admins can manage content_ideas` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |

### `content_scripts`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `content_scripts`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `session_id` | uuid | NO | — | FK reference |
| `client_id` | uuid | NO | — | FK reference |
| `title` | text | NO | 'Untitled Script'::text |  |
| `hook` | text | YES | ''::text |  |
| `body` | text | YES | ''::text |  |
| `cta` | text | YES | ''::text |  |
| `pillar` | text | NO | 'reach'::text |  |
| `status` | text | NO | 'draft'::text | Current status |
| `avatar_id` | uuid | YES | — | FK reference |
| `order_index` | integer | NO | 0 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `filmed` | boolean | NO | false |  |
| `client_decision` | text | YES | — |  |
| `client_decision_note` | text | YES | — |  |
| `client_decision_at` | timestamp with time zone | YES | — | Timestamp |

**Relationships (FKs):**
- `avatar_id` → `client_audience_avatars.id`
- `client_id` → `clients.id`
- `session_id` → `content_sessions.id`

**Triggers:**
- `trg_notify_slack_client_decision` → `notify_slack_on_client_decision()`
- `trg_notify_team_on_client_decision` → `notify_team_on_client_decision()`
- `trg_snapshot_content_script_version` → `snapshot_content_script_version()`
- `update_content_scripts_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can update their content_scripts when published` | UPDATE | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can view their content_scripts when published` | SELECT | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `—` |
| `Owners/admins can manage content_scripts` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |

### `content_script_versions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `content_script_versions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `script_id` | uuid | NO | — | FK reference |
| `client_id` | uuid | NO | — | FK reference |
| `version_number` | integer | NO | — |  |
| `title` | text | YES | — |  |
| `hook` | text | YES | — |  |
| `body` | text | YES | — |  |
| `cta` | text | YES | — |  |
| `pillar` | text | YES | — |  |
| `status` | text | YES | — | Current status |
| `avatar_id` | uuid | YES | — | FK reference |
| `saved_by` | uuid | YES | — |  |
| `saved_by_role` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `saved_by` → `profiles.id`
- `script_id` → `content_scripts.id`

**Indexes:**
- `idx_content_script_versions_script` — `CREATE INDEX idx_content_script_versions_script ON public.content_script_versions USING btree (script_id, version_number DESC)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Agency can view script versions` | SELECT | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app...` | `—` |
| `Authors can insert script versions` | INSERT | `—` | `(auth.uid() IS NOT NULL)` |
| `Clients can view their script versions` | SELECT | `(is_studio_published(client_id) AND (EXISTS ( SELECT 1    FROM client_access ...` | `—` |

### `content_vault`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `content_vault`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `creator_handle` | text | NO | — |  |
| `url` | text | YES | — |  |
| `platform` | text | NO | 'ig_reels'::text |  |
| `niche` | text | YES | — |  |
| `views` | text | YES | — |  |
| `likes` | text | YES | — |  |
| `pillar` | text | NO | 'reach'::text |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Triggers:**
- `update_content_vault_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can view vault` | SELECT | `true` | `—` |
| `Owners and admins can manage vault` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |

### `content_sessions`
🔒 **RLS:** ENABLED

> 🔄 **MERGE** into `cycles` (currently a Studio-side concept overlapping with `interviews`).

**Purpose:** See codebase usage for `content_sessions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `name` | text | NO | 'New Session'::text | Display name |
| `order_index` | integer | NO | 0 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Triggers:**
- `update_content_sessions_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can view their content_sessions when published` | SELECT | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `—` |
| `Owners/admins can manage content_sessions` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |

### `script_templates`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `script_templates`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `name` | text | NO | 'Untitled Template'::text | Display name |
| `description` | text | YES | — |  |
| `duration` | text | YES | — |  |
| `pillar` | text | NO | 'reach'::text |  |
| `fields` | jsonb | YES | '[]'::jsonb |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `client_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `script_templates_client_id_idx` — `CREATE INDEX script_templates_client_id_idx ON public.script_templates USING btree (client_id)`

**Triggers:**
- `update_script_templates_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can view templates` | SELECT | `true` | `—` |
| `Clients can manage their templates when published` | ALL | `((client_id IS NOT NULL) AND is_studio_published(client_id) AND user_has_clie...` | `((client_id IS NOT NULL) AND is_studio_published(client_id) AND user_has_clie...` |
| `Owners and admins can manage templates` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |

### `hooks_library`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `hooks_library`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `text` | text | NO | — |  |
| `pillar` | text | NO | 'reach'::text |  |
| `hook_type` | text | NO | 'value'::text |  |
| `niche` | text | YES | — |  |
| `strength` | integer | YES | 5 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Triggers:**
- `update_hooks_library_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can view hooks` | SELECT | `true` | `—` |
| `Clients can manage their hooks when published` | ALL | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Owners and admins can manage hooks` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |

### `sop_templates`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `sop_templates`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `template_type` | text | NO | — |  |
| `name` | text | NO | — | Display name |
| `content` | text | NO | — |  |
| `variables` | jsonb | YES | — |  |
| `category` | text | YES | — |  |
| `display_order` | integer | NO | 0 |  |
| `is_active` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `created_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `created_by` → `auth.users.id`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners, admins, and editor admins can create templates` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Owners, admins, and editor admins can delete templates` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Owners, admins, and editor admins can update templates` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Owners, admins, and editor admins can view templates` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |

### `sops`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `sops`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `sop_number` | integer | NO | — |  |
| `title` | text | NO | — |  |
| `category` | text | NO | — |  |
| `owner_role` | text | NO | — |  |
| `goal` | text | NO | — |  |
| `content` | text | NO | — |  |
| `kpis` | jsonb | YES | — |  |
| `templates` | jsonb | YES | — |  |
| `display_order` | integer | NO | 0 |  |
| `is_active` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `created_by` | uuid | YES | — |  |
| `updated_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `created_by` → `auth.users.id`
- `updated_by` → `auth.users.id`

**Indexes:**
- `idx_sops_category` — `CREATE INDEX idx_sops_category ON public.sops USING btree (category)`
- `idx_sops_number` — `CREATE INDEX idx_sops_number ON public.sops USING btree (sop_number)`
- `idx_sops_search` — `CREATE INDEX idx_sops_search ON public.sops USING gin (to_tsvector('english'::regconfig, ((title \|\| ' '::text) \|\| content)))`
- `sops_sop_number_key` — `CREATE UNIQUE INDEX sops_sop_number_key ON public.sops USING btree (sop_number)`

**Triggers:**
- `update_sops_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners, admins, and editor admins can create SOPs` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Owners, admins, and editor admins can delete SOPs` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Owners, admins, and editor admins can update SOPs` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Owners, admins, and editor admins can view all SOPs` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |

### `branding_deck_comments`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `branding_deck_comments`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `user_id` | uuid | YES | — | References auth.users |
| `comment` | text | NO | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `status` | text | YES | 'active'::text | Current status |
| `resolved_at` | timestamp with time zone | YES | — | Timestamp |
| `resolved_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `resolved_by` → `profiles.id`
- `user_id` → `profiles.id`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage branding deck comments` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Clients can insert branding deck comments for their client` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM client_access ca   WHERE ((ca.client_id = branding...` |
| `Clients can view branding deck comments for their client` | SELECT | `(EXISTS ( SELECT 1    FROM client_access ca   WHERE ((ca.client_id = branding...` | `—` |


## Domain: Onboarding & Forms

### `onboarding_documents`
🔒 **RLS:** ENABLED

> 🔄 **REWORK** as a generic `client_documents` table tied to journey steps.

**Purpose:** See codebase usage for `onboarding_documents`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `brand_name` | text | NO | — |  |
| `industry` | text | YES | — |  |
| `website_url` | text | YES | — | URL string |
| `instagram_handle` | text | YES | — |  |
| `tiktok_handle` | text | YES | — |  |
| `youtube_handle` | text | YES | — |  |
| `target_audience` | text | NO | — |  |
| `audience_problems` | text | YES | — |  |
| `content_pillars` | jsonb | YES | '[]'::jsonb |  |
| `content_goals` | jsonb | YES | '[]'::jsonb |  |
| `example_videos` | jsonb | YES | '[]'::jsonb |  |
| `story_narratives` | text | YES | — |  |
| `highlight_types` | jsonb | YES | '[]'::jsonb |  |
| `preferred_style` | text | YES | — |  |
| `posting_method` | text | YES | 'client'::text |  |
| `social_credentials` | jsonb | YES | — |  |
| `additional_notes` | text | YES | — |  |
| `completed` | boolean | YES | false |  |
| `completed_at` | timestamp with time zone | YES | — | Timestamp |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `full_name` | text | YES | — | Display name |
| `profession_title` | text | YES | — |  |
| `professional_bio` | text | YES | — |  |
| `personal_bio` | text | YES | — |  |
| `three_words` | text | YES | — |  |
| `preferred_language` | text | YES | — |  |
| `achievements` | text | YES | — |  |
| `social_media_links` | text | YES | — |  |
| `key_topics` | text | YES | — |  |
| `unique_perspectives` | text | YES | — |  |
| `recent_developments` | text | YES | — |  |
| `controversial_topics` | text | YES | — |  |
| `challenges_solutions` | text | YES | — |  |
| `audience_faqs` | text | YES | — |  |
| `inspirational_content` | text | YES | — |  |
| `brand_guideline_reference` | text | YES | — |  |
| `self_perception` | text | YES | — |  |
| `others_perception` | text | YES | — |  |
| `desired_perception` | text | YES | — |  |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `idx_onboarding_client` — `CREATE INDEX idx_onboarding_client ON public.onboarding_documents USING btree (client_id)`
- `idx_onboarding_completed` — `CREATE INDEX idx_onboarding_completed ON public.onboarding_documents USING btree (completed)`
- `onboarding_documents_client_id_key` — `CREATE UNIQUE INDEX onboarding_documents_client_id_key ON public.onboarding_documents USING btree (client_id)`

**Triggers:**
- `update_onboarding_documents_updated_at_trigger` → `update_onboarding_documents_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can insert their onboarding document` | INSERT | `—` | `((EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id =...` |
| `Clients can update their onboarding document` | UPDATE | `((EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id =...` | `((EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id =...` |
| `Clients can view their onboarding document` | SELECT | `((EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id =...` | `—` |

### `client_onboarding_progress`
🔒 **RLS:** ENABLED

> 🔄 **MERGE** into modular `forms` + `form_submissions`.

**Purpose:** See codebase usage for `client_onboarding_progress`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `video_watched` | boolean | YES | false |  |
| `video_watched_at` | timestamp with time zone | YES | — | Timestamp |
| `document_completed` | boolean | YES | false |  |
| `kickoff_call_booked` | boolean | YES | false |  |
| `practice_session_booked` | boolean | YES | false |  |
| `studio_selected` | boolean | YES | false |  |
| `strategy_call_booked` | boolean | YES | false |  |
| `post_shoot_reviewed` | boolean | YES | false |  |
| `tour_completed` | boolean | YES | false |  |
| `tour_skipped` | boolean | YES | false |  |
| `tour_started_at` | timestamp with time zone | YES | — | Timestamp |
| `tour_completed_at` | timestamp with time zone | YES | — | Timestamp |
| `onboarding_completed` | boolean | YES | false |  |
| `onboarding_completed_at` | timestamp with time zone | YES | — | Timestamp |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `document_completed_at` | timestamp with time zone | YES | — | Timestamp |
| `lifestyle_dates_selected` | jsonb | YES | — |  |
| `lifestyle_location` | text | YES | — |  |
| `lifestyle_preferences_notes` | text | YES | — |  |
| `story_mapping_booked` | boolean | YES | false |  |
| `script_recording_booked` | boolean | YES | false |  |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `client_onboarding_progress_user_id_key` — `CREATE UNIQUE INDEX client_onboarding_progress_user_id_key ON public.client_onboarding_progress USING btree (user_id)`

**Triggers:**
- `trigger_set_document_completed_at` → `set_document_completed_timestamp()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can insert their own onboarding progress` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can update their own onboarding progress` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view their own onboarding progress` | SELECT | `(auth.uid() = user_id)` | `—` |

### `talent_form_fields`
🔒 **RLS:** ENABLED

> 🔄 **MERGE** into new generic `forms`/`form_fields` system.

**Purpose:** See codebase usage for `talent_form_fields`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `field_key` | text | NO | — |  |
| `label` | text | NO | — |  |
| `field_type` | text | NO | 'text'::text |  |
| `options` | jsonb | YES | '[]'::jsonb |  |
| `is_required` | boolean | NO | false |  |
| `is_enabled` | boolean | NO | true |  |
| `sort_order` | integer | NO | 0 |  |
| `section` | text | NO | 'professional'::text |  |
| `placeholder` | text | YES | — |  |
| `is_core` | boolean | NO | false |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Indexes:**
- `talent_form_fields_field_key_key` — `CREATE UNIQUE INDEX talent_form_fields_field_key_key ON public.talent_form_fields USING btree (field_key)`

**Triggers:**
- `update_talent_form_fields_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage form fields` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |
| `Anyone can read form fields` | SELECT | `true` | `—` |


## Domain: CRM — People, Companies, Deals, Calls

### `crm_people`
🔒 **RLS:** ENABLED
**Purpose:** Unified person record across leads/clients/editors/partners.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `attio_record_id` | text | YES | — | FK reference |
| `full_name` | text | NO | — | Display name |
| `email` | text | YES | — | Email address |
| `job_title` | text | YES | — |  |
| `phone` | text | YES | — |  |
| `invalid_phone_note` | text | YES | — |  |
| `social_link` | text | YES | — |  |
| `company_id` | uuid | YES | — | FK reference |
| `income_range` | text | YES | — |  |
| `goal` | text | YES | — |  |
| `obstacle` | text | YES | — |  |
| `description` | text | YES | — |  |
| `deal_stage` | text | YES | — |  |
| `client_status` | text | YES | — |  |
| `payment_link` | text | YES | — |  |
| `active` | boolean | YES | true |  |
| `first_calendar_at` | timestamp with time zone | YES | — | Timestamp |
| `last_calendar_at` | timestamp with time zone | YES | — | Timestamp |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `instagram` | text | YES | — |  |
| `facebook` | text | YES | — |  |
| `location` | text | YES | — |  |
| `country` | text | YES | — |  |
| `city` | text | YES | — |  |
| `fit` | text | YES | — |  |
| `interested_in` | text | YES | — |  |
| `source` | text | YES | 'attio'::text |  |
| `company_name` | text | YES | — |  |
| `notes` | text | YES | — |  |
| `assigned_to` | uuid | YES | — |  |

**Relationships (FKs):**
- `company_id` → `crm_companies.id`

**Indexes:**
- `crm_people_attio_record_id_key` — `CREATE UNIQUE INDEX crm_people_attio_record_id_key ON public.crm_people USING btree (attio_record_id)`
- `idx_crm_people_active` — `CREATE INDEX idx_crm_people_active ON public.crm_people USING btree (active)`
- `idx_crm_people_company_id` — `CREATE INDEX idx_crm_people_company_id ON public.crm_people USING btree (company_id)`
- `idx_crm_people_created_at` — `CREATE INDEX idx_crm_people_created_at ON public.crm_people USING btree (created_at DESC)`
- `idx_crm_people_deal_stage` — `CREATE INDEX idx_crm_people_deal_stage ON public.crm_people USING btree (deal_stage)`
- `idx_crm_people_email` — `CREATE INDEX idx_crm_people_email ON public.crm_people USING btree (email)`
- `idx_crm_people_full_name` — `CREATE INDEX idx_crm_people_full_name ON public.crm_people USING btree (full_name)`

**Triggers:**
- `set_crm_people_updated_at` → `set_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `crm_people_owner_admin_all` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |
| `crm_people_sales_insert` | INSERT | `—` | `has_role(auth.uid(), 'sales'::text)` |
| `crm_people_sales_select` | SELECT | `has_role(auth.uid(), 'sales'::text)` | `—` |
| `crm_people_sales_update` | UPDATE | `has_role(auth.uid(), 'sales'::text)` | `—` |

### `crm_companies`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `crm_companies`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `attio_record_id` | text | YES | — | FK reference |
| `name` | text | NO | — | Display name |
| `categories` | ARRAY | YES | — |  |
| `last_interaction_at` | timestamp with time zone | YES | — | Timestamp |
| `linkedin_url` | text | YES | — | URL string |
| `instagram_url` | text | YES | — | URL string |
| `domain` | text | YES | — |  |
| `description` | text | YES | — |  |
| `team_phone` | text | YES | — |  |
| `team_country` | text | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Indexes:**
- `crm_companies_attio_record_id_key` — `CREATE UNIQUE INDEX crm_companies_attio_record_id_key ON public.crm_companies USING btree (attio_record_id)`
- `idx_crm_companies_domain` — `CREATE INDEX idx_crm_companies_domain ON public.crm_companies USING btree (domain)`
- `idx_crm_companies_name` — `CREATE INDEX idx_crm_companies_name ON public.crm_companies USING btree (name)`

**Triggers:**
- `set_crm_companies_updated_at` → `set_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `crm_companies_owner_admin_all` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |
| `crm_companies_sales_insert` | INSERT | `—` | `has_role(auth.uid(), 'sales'::text)` |
| `crm_companies_sales_select` | SELECT | `has_role(auth.uid(), 'sales'::text)` | `—` |
| `crm_companies_sales_update` | UPDATE | `has_role(auth.uid(), 'sales'::text)` | `—` |

### `crm_deals`
🔒 **RLS:** ENABLED
**Purpose:** Sales pipeline deals (Kanban).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `attio_record_id` | text | YES | — | FK reference |
| `name` | text | NO | — | Display name |
| `stage` | text | NO | 'no_stage'::text |  |
| `plan` | text | YES | — |  |
| `total_videos` | numeric | YES | — |  |
| `payment_method` | text | YES | — |  |
| `deal_owner` | text | YES | — |  |
| `person_id` | uuid | YES | — | FK reference |
| `next_due_date` | timestamp with time zone | YES | — |  |
| `stage_order` | integer | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `region` | text | YES | 'UAE & Gulf'::text |  |

**Relationships (FKs):**
- `person_id` → `crm_people.id`

**Indexes:**
- `crm_deals_attio_record_id_key` — `CREATE UNIQUE INDEX crm_deals_attio_record_id_key ON public.crm_deals USING btree (attio_record_id)`
- `idx_crm_deals_created_at` — `CREATE INDEX idx_crm_deals_created_at ON public.crm_deals USING btree (created_at DESC)`
- `idx_crm_deals_person_id` — `CREATE INDEX idx_crm_deals_person_id ON public.crm_deals USING btree (person_id)`
- `idx_crm_deals_stage` — `CREATE INDEX idx_crm_deals_stage ON public.crm_deals USING btree (stage)`

**Triggers:**
- `set_crm_deals_updated_at` → `set_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `crm_deals_owner_admin_all` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |
| `crm_deals_sales_insert` | INSERT | `—` | `has_role(auth.uid(), 'sales'::text)` |
| `crm_deals_sales_select` | SELECT | `has_role(auth.uid(), 'sales'::text)` | `—` |
| `crm_deals_sales_update` | UPDATE | `has_role(auth.uid(), 'sales'::text)` | `—` |

### `crm_deal_options`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `crm_deal_options`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `category` | text | NO | — |  |
| `value` | text | NO | — |  |
| `label` | text | NO | — |  |
| `color` | text | YES | — |  |
| `order_index` | integer | NO | 0 |  |
| `is_active` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Indexes:**
- `idx_crm_deal_options_category_value` — `CREATE UNIQUE INDEX idx_crm_deal_options_category_value ON public.crm_deal_options USING btree (category, value)`

**Triggers:**
- `set_crm_deal_options_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can view deal options` | SELECT | `true` | `—` |
| `Owners and admins can manage deal options` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |

### `crm_editors`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `crm_editors`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `attio_record_id` | text | YES | — | FK reference |
| `full_name` | text | NO | — | Display name |
| `email` | text | YES | — | Email address |
| `phone` | text | YES | — |  |
| `location` | text | YES | — |  |
| `portfolio_url` | text | YES | — | URL string |
| `sample_link_url` | text | YES | — | URL string |
| `notes` | text | YES | — |  |
| `submission_date` | timestamp with time zone | YES | — |  |
| `languages` | ARRAY | YES | — |  |
| `software_fluency` | ARRAY | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `person_id` | uuid | YES | — | FK reference |
| `role_applied` | text | YES | — |  |
| `video_intro_url` | text | YES | — | URL string |
| `resume_url` | text | YES | — | URL string |
| `metadata` | jsonb | YES | '{}'::jsonb | JSON metadata blob |

**Relationships (FKs):**
- `person_id` → `crm_people.id`

**Indexes:**
- `crm_editors_attio_record_id_key` — `CREATE UNIQUE INDEX crm_editors_attio_record_id_key ON public.crm_editors USING btree (attio_record_id)`
- `idx_crm_editors_email` — `CREATE INDEX idx_crm_editors_email ON public.crm_editors USING btree (email)`
- `idx_crm_editors_full_name` — `CREATE INDEX idx_crm_editors_full_name ON public.crm_editors USING btree (full_name)`
- `idx_crm_editors_person_id` — `CREATE INDEX idx_crm_editors_person_id ON public.crm_editors USING btree (person_id)`
- `idx_crm_editors_submission_date` — `CREATE INDEX idx_crm_editors_submission_date ON public.crm_editors USING btree (submission_date DESC)`

**Triggers:**
- `set_crm_editors_updated_at` → `set_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `crm_editors_owner_admin_all` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |
| `crm_editors_sales_insert` | INSERT | `—` | `has_role(auth.uid(), 'sales'::text)` |
| `crm_editors_sales_select` | SELECT | `has_role(auth.uid(), 'sales'::text)` | `—` |
| `crm_editors_sales_update` | UPDATE | `has_role(auth.uid(), 'sales'::text)` | `—` |

### `leads`
🔒 **RLS:** ENABLED
**Purpose:** Inbound lead capture (with auto-disqualify <$5k/mo).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `first_name` | text | NO | — |  |
| `last_name` | text | NO | — |  |
| `email` | text | NO | — | Email address |
| `phone` | text | YES | — |  |
| `social_username` | text | YES | — |  |
| `business_type` | text | YES | — |  |
| `monthly_income_range` | text | YES | — |  |
| `goals_objectives` | text | YES | — |  |
| `obstacles` | text | YES | — |  |
| `call_attendance_confirmation` | boolean | NO | false |  |
| `status` | text | NO | 'new'::text | Current status |
| `assigned_to` | uuid | YES | — |  |
| `notes` | text | YES | — |  |
| `raw_payload` | jsonb | NO | '{}'::jsonb |  |
| `follow_up_at` | timestamp with time zone | YES | — | Timestamp |
| `country` | text | YES | — |  |
| `content_language` | text | YES | — |  |
| `is_qualified` | boolean | NO | true |  |
| `person_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `assigned_to` → `auth.users.id`
- `person_id` → `crm_people.id`

**Indexes:**
- `idx_leads_person_id` — `CREATE INDEX idx_leads_person_id ON public.leads USING btree (person_id)`

**Triggers:**
- `leads_set_updated_at` → `set_leads_updated_at()`
- `trg_auto_disqualify_low_revenue_lead` → `auto_disqualify_low_revenue_lead()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Sales can delete leads` | DELETE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `leads_owner_admin_all` | ALL | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |
| `leads_sales_insert` | INSERT | `—` | `has_role(auth.uid(), 'sales'::text)` |
| `leads_sales_select` | SELECT | `has_role(auth.uid(), 'sales'::text)` | `—` |
| `leads_sales_update` | UPDATE | `has_role(auth.uid(), 'sales'::text)` | `has_role(auth.uid(), 'sales'::text)` |
| `owners and admins can delete leads` | DELETE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `owners and admins can insert leads` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |
| `owners and admins can select leads` | SELECT | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `owners and admins can update leads` | UPDATE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `service role bypass for leads` | ALL | `(auth.role() = 'service_role'::text)` | `—` |

### `leads_custom_columns`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `leads_custom_columns`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `created_by` | uuid | NO | — |  |
| `column_name` | text | NO | — |  |
| `column_type` | text | NO | 'text'::text |  |
| `order_index` | integer | NO | 0 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can view all custom columns` | SELECT | `true` | `—` |
| `Users can create their own custom columns` | INSERT | `—` | `(auth.uid() = created_by)` |
| `Users can delete their own custom columns` | DELETE | `(auth.uid() = created_by)` | `—` |
| `Users can update their own custom columns` | UPDATE | `(auth.uid() = created_by)` | `—` |

### `leads_saved_views`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `leads_saved_views`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `view_name` | text | NO | — |  |
| `column_config` | jsonb | NO | '[]'::jsonb |  |
| `is_default` | boolean | NO | false |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Triggers:**
- `update_leads_saved_views_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can create their own saved views` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can delete their own saved views` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users can update their own saved views` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view their own saved views` | SELECT | `(auth.uid() = user_id)` | `—` |

### `follow_ups`
🔒 **RLS:** ENABLED
**Purpose:** Closer task list, region-scoped.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `title` | text | NO | — |  |
| `notes` | text | YES | — |  |
| `due_at` | timestamp with time zone | NO | — | Timestamp |
| `status` | text | YES | 'pending'::text | Current status |
| `priority` | text | YES | 'medium'::text |  |
| `lead_id` | uuid | YES | — | FK reference |
| `calendly_event_id` | text | YES | — | FK reference |
| `assigned_to` | uuid | YES | — |  |
| `completed_at` | timestamp with time zone | YES | — | Timestamp |
| `person_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `assigned_to` → `profiles.id`
- `lead_id` → `leads.id`
- `person_id` → `crm_people.id`

**Indexes:**
- `idx_follow_ups_person_id` — `CREATE INDEX idx_follow_ups_person_id ON public.follow_ups USING btree (person_id)`

**Triggers:**
- `follow_ups_updated_at` → `set_leads_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `follow_ups_owner_admin_all` | ALL | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |
| `follow_ups_sales_all` | ALL | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |

### `calendly_events`
🔒 **RLS:** ENABLED
**Purpose:** Synced Calendly bookings (kickoff, practice, sales calls).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `calendly_event_uri` | text | NO | — |  |
| `event_type_name` | text | YES | — |  |
| `start_time` | timestamp with time zone | NO | — |  |
| `end_time` | timestamp with time zone | NO | — |  |
| `status` | text | NO | 'active'::text | Current status |
| `invitee_name` | text | YES | — |  |
| `invitee_email` | text | YES | — |  |
| `invitee_phone` | text | YES | — |  |
| `lead_id` | uuid | YES | — | FK reference |
| `questions_and_answers` | jsonb | YES | '[]'::jsonb |  |
| `location_info` | jsonb | YES | — |  |
| `cancellation` | jsonb | YES | — |  |
| `raw_payload` | jsonb | YES | '{}'::jsonb |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `sales_user_id` | uuid | YES | — | FK reference |
| `reschedule_url` | text | YES | — | URL string |
| `person_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `lead_id` → `leads.id`
- `person_id` → `crm_people.id`
- `sales_user_id` → `auth.users.id`

**Indexes:**
- `calendly_events_calendly_event_uri_key` — `CREATE UNIQUE INDEX calendly_events_calendly_event_uri_key ON public.calendly_events USING btree (calendly_event_uri)`
- `idx_calendly_events_person_id` — `CREATE INDEX idx_calendly_events_person_id ON public.calendly_events USING btree (person_id)`

**Triggers:**
- `calendly_events_set_updated_at` → `set_leads_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `calendly_events_owner_admin_all` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |
| `calendly_events_sales_select` | SELECT | `has_role(auth.uid(), 'sales'::text)` | `—` |

### `partnership_applications`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `partnership_applications`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `person_id` | uuid | YES | — | FK reference |
| `name` | text | NO | — | Display name |
| `email` | text | NO | — | Email address |
| `phone` | text | YES | — |  |
| `location` | text | YES | — |  |
| `languages` | text | YES | — |  |
| `role` | text | YES | — | Role enum |
| `target_audience` | text | YES | — |  |
| `experience_years` | text | YES | — |  |
| `portfolio_link` | text | YES | — |  |
| `best_pieces` | text | YES | — |  |
| `client_accounts` | text | YES | — |  |
| `has_paying_clients` | boolean | YES | false |  |
| `has_sold_service` | boolean | YES | false |  |
| `sold_service_explanation` | text | YES | — |  |
| `status` | text | NO | 'new'::text | Current status |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `person_id` → `crm_people.id`

**Indexes:**
- `idx_partnership_applications_email` — `CREATE INDEX idx_partnership_applications_email ON public.partnership_applications USING btree (lower(email))`
- `idx_partnership_applications_status` — `CREATE INDEX idx_partnership_applications_status ON public.partnership_applications USING btree (status)`

**Triggers:**
- `update_partnership_applications_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners, admins, sales can delete partnership applications` | DELETE | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` | `—` |
| `Owners, admins, sales can update partnership applications` | UPDATE | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` |
| `Owners, admins, sales can view partnership applications` | SELECT | `(has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app...` | `—` |

### `sales_territories`
🔒 **RLS:** ENABLED

> 🔄 **RENAME** to `closer_regions` (UI label is 'Region').

**Purpose:** See codebase usage for `sales_territories`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `region_name` | text | NO | — |  |
| `countries` | ARRAY | NO | '{}'::text[] |  |
| `calendly_api_key` | text | YES | — |  |
| `calendar_event_filter` | text | YES | '30 Mins Discovery Call'::text |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `calendly_webhook_uri` | text | YES | — |  |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `sales_territories_user_id_key` — `CREATE UNIQUE INDEX sales_territories_user_id_key ON public.sales_territories USING btree (user_id)`

**Triggers:**
- `set_sales_territories_updated_at` → `set_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners and admins can manage all territories` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |
| `Sales users can update own territory` | UPDATE | `(user_id = auth.uid())` | `(user_id = auth.uid())` |
| `Sales users can view own territory` | SELECT | `(user_id = auth.uid())` | `—` |

### `saved_filter_views`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `saved_filter_views`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `name` | text | NO | — | Display name |
| `page` | text | NO | — |  |
| `filters` | jsonb | NO | '{}'::jsonb |  |
| `is_default` | boolean | NO | false |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_saved_filter_views_user_page` — `CREATE INDEX idx_saved_filter_views_user_page ON public.saved_filter_views USING btree (user_id, page)`

**Triggers:**
- `update_saved_filter_views_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can create their own saved views` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can delete their own saved views` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users can update their own saved views` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view their own saved views` | SELECT | `(auth.uid() = user_id)` | `—` |

### `custom_columns`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `custom_columns`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `project_id` | uuid | YES | — | FK reference |
| `column_name` | text | NO | — |  |
| `column_type` | text | NO | — |  |
| `options` | jsonb | YES | — |  |
| `default_value` | text | YES | — |  |
| `is_required` | boolean | YES | false |  |
| `show_in_new_form` | boolean | YES | true |  |
| `show_in_edit_form` | boolean | YES | true |  |
| `allow_inline_edit` | boolean | YES | true |  |
| `show_in_table` | boolean | YES | true |  |
| `description` | text | YES | — |  |
| `width_px` | integer | YES | 150 |  |
| `order_index` | integer | YES | 0 |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `project_id` → `projects.id`

**Indexes:**
- `idx_custom_columns_project` — `CREATE INDEX idx_custom_columns_project ON public.custom_columns USING btree (project_id)`

**Triggers:**
- `update_custom_columns_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage custom columns` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Users can view custom columns for accessible projects` | SELECT | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |

### `custom_field_values`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `custom_field_values`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_id` | uuid | YES | — | FK reference |
| `column_id` | uuid | YES | — | FK reference |
| `value` | text | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `column_id` → `custom_columns.id`
- `content_id` → `content_items.id`

**Indexes:**
- `custom_field_values_content_id_column_id_key` — `CREATE UNIQUE INDEX custom_field_values_content_id_column_id_key ON public.custom_field_values USING btree (content_id, column_id)`
- `idx_custom_field_values_column` — `CREATE INDEX idx_custom_field_values_column ON public.custom_field_values USING btree (column_id)`
- `idx_custom_field_values_content` — `CREATE INDEX idx_custom_field_values_content ON public.custom_field_values USING btree (content_id)`

**Triggers:**
- `update_custom_field_values_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage custom field value` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Users can view custom field values for accessible content` | SELECT | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `—` |


## Domain: Communication — Chat & Email

### `chat_rooms`
🔒 **RLS:** ENABLED
**Purpose:** Per-client chat rooms (default 1:1).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `talent_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `client_id` → `clients.id`
- `talent_id` → `talent_network.id`

**Triggers:**
- `update_chat_rooms_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can view accessible chat rooms` | SELECT | `user_can_access_chat_room(auth.uid(), id)` | `—` |

### `chat_threads`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `chat_threads`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `room_id` | uuid | YES | — | FK reference |
| `title` | text | NO | — |  |
| `created_by` | uuid | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `team_room_id` | uuid | YES | — | FK reference |

**Relationships (FKs):**
- `created_by` → `auth.users.id`
- `room_id` → `chat_rooms.id`
- `team_room_id` → `team_chat_rooms.id`

**Indexes:**
- `idx_chat_threads_team_room` — `CREATE INDEX idx_chat_threads_team_room ON public.chat_threads USING btree (team_room_id)`

**Triggers:**
- `update_chat_threads_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Team room members can insert threads` | INSERT | `—` | `((team_room_id IS NOT NULL) AND user_in_team_room(auth.uid(), team_room_id))` |
| `Team room members can view threads` | SELECT | `((team_room_id IS NOT NULL) AND user_in_team_room(auth.uid(), team_room_id))` | `—` |
| `Users can create threads in accessible rooms` | INSERT | `—` | `user_can_access_chat_room(auth.uid(), room_id)` |
| `Users can view threads in accessible rooms` | SELECT | `user_can_access_chat_room(auth.uid(), room_id)` | `—` |

### `chat_messages`
🔒 **RLS:** ENABLED
**Purpose:** Real-time chat messages (Supabase Realtime).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `thread_id` | uuid | NO | — | FK reference |
| `sender_id` | uuid | NO | — | FK reference |
| `content` | text | YES | — |  |
| `message_type` | text | NO | 'text'::text |  |
| `is_edited` | boolean | NO | false |  |
| `is_deleted` | boolean | NO | false |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `attachments` | jsonb | NO | '[]'::jsonb |  |

**Relationships (FKs):**
- `sender_id` → `auth.users.id`
- `thread_id` → `chat_threads.id`

**Triggers:**
- `bump_chat_room_on_new_message` → `bump_chat_room_updated_at()`
- `notify_on_new_chat_message_trg` → `notify_on_new_chat_message()`
- `update_chat_messages_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Team room members can send messages` | INSERT | `—` | `((sender_id = auth.uid()) AND (EXISTS ( SELECT 1    FROM chat_threads t   WHE...` |
| `Team room members can view messages` | SELECT | `(EXISTS ( SELECT 1    FROM chat_threads t   WHERE ((t.id = chat_messages.thre...` | `—` |
| `Users can delete own messages` | DELETE | `(sender_id = auth.uid())` | `—` |
| `Users can edit own messages` | UPDATE | `(sender_id = auth.uid())` | `(sender_id = auth.uid())` |
| `Users can send messages in accessible rooms` | INSERT | `—` | `((sender_id = auth.uid()) AND (EXISTS ( SELECT 1    FROM chat_threads ct   WH...` |
| `Users can view messages in accessible rooms` | SELECT | `(EXISTS ( SELECT 1    FROM chat_threads ct   WHERE ((ct.id = chat_messages.th...` | `—` |

### `chat_attachments`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `chat_attachments`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `message_id` | uuid | NO | — | FK reference |
| `file_url` | text | NO | — | URL string |
| `file_name` | text | NO | — |  |
| `file_type` | text | YES | — |  |
| `file_size` | bigint | YES | — |  |
| `storage_path` | text | YES | — | Storage path |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `message_id` → `chat_messages.id`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can add attachments to own messages` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM (chat_messages cm      JOIN chat_threads ct ON ((c...` |
| `Users can view attachments in accessible rooms` | SELECT | `(EXISTS ( SELECT 1    FROM (chat_messages cm      JOIN chat_threads ct ON ((c...` | `—` |

### `chat_mentions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `chat_mentions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `message_id` | uuid | NO | — | FK reference |
| `mentioned_user_id` | uuid | NO | — | FK reference |
| `is_read` | boolean | YES | false |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |

**Relationships (FKs):**
- `mentioned_user_id` → `auth.users.id`
- `message_id` → `chat_messages.id`

**Triggers:**
- `on_chat_mention_insert` → `notify_on_chat_mention()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated users can insert mentions` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM (chat_messages cm      JOIN chat_threads ct ON ((c...` |
| `Users can update own mentions` | UPDATE | `(mentioned_user_id = auth.uid())` | `(mentioned_user_id = auth.uid())` |
| `Users can view mentions in accessible rooms` | SELECT | `(EXISTS ( SELECT 1    FROM (chat_messages cm      JOIN chat_threads ct ON ((c...` | `—` |

### `chat_mutes`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `chat_mutes`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `user_id` | uuid | NO | — | References auth.users |
| `room_id` | uuid | NO | — | FK reference |
| `muted_until` | timestamp with time zone | YES | — |  |
| `notify_on_mention` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `room_id` → `chat_rooms.id`
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_chat_mutes_room` — `CREATE INDEX idx_chat_mutes_room ON public.chat_mutes USING btree (room_id)`
- `idx_chat_mutes_user` — `CREATE INDEX idx_chat_mutes_user ON public.chat_mutes USING btree (user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users delete own mutes` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users insert own mutes` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users update own mutes` | UPDATE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| `Users view own mutes` | SELECT | `(auth.uid() = user_id)` | `—` |

### `chat_reactions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `chat_reactions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `message_id` | uuid | NO | — | FK reference |
| `user_id` | uuid | NO | — | References auth.users |
| `emoji` | text | NO | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `message_id` → `chat_messages.id`
- `user_id` → `auth.users.id`

**Indexes:**
- `chat_reactions_message_id_user_id_emoji_key` — `CREATE UNIQUE INDEX chat_reactions_message_id_user_id_emoji_key ON public.chat_reactions USING btree (message_id, user_id, emoji)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can add reactions` | INSERT | `—` | `((user_id = auth.uid()) AND (EXISTS ( SELECT 1    FROM (chat_messages cm     ...` |
| `Users can remove own reactions` | DELETE | `(user_id = auth.uid())` | `—` |
| `Users can view reactions in accessible rooms` | SELECT | `(EXISTS ( SELECT 1    FROM (chat_messages cm      JOIN chat_threads ct ON ((c...` | `—` |

### `chat_read_receipts`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `chat_read_receipts`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `thread_id` | uuid | NO | — | FK reference |
| `last_read_at` | timestamp with time zone | NO | now() | Timestamp |

**Relationships (FKs):**
- `thread_id` → `chat_threads.id`
- `user_id` → `auth.users.id`

**Indexes:**
- `chat_read_receipts_user_id_thread_id_key` — `CREATE UNIQUE INDEX chat_read_receipts_user_id_thread_id_key ON public.chat_read_receipts USING btree (user_id, thread_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can update own read receipts` | UPDATE | `(user_id = auth.uid())` | `(user_id = auth.uid())` |
| `Users can upsert own read receipts` | INSERT | `—` | `(user_id = auth.uid())` |
| `Users can view own read receipts` | SELECT | `(user_id = auth.uid())` | `—` |

### `team_chat_rooms`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `team_chat_rooms`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `kind` | text | NO | — |  |
| `name` | text | YES | — | Display name |
| `created_by` | uuid | NO | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Indexes:**
- `idx_team_chat_rooms_created_by` — `CREATE INDEX idx_team_chat_rooms_created_by ON public.team_chat_rooms USING btree (created_by)`

**Triggers:**
- `trg_add_creator_to_team_room` → `add_creator_to_team_room()`
- `trg_create_default_team_thread` → `create_default_team_thread()`
- `update_team_chat_rooms_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Allowed users can create team chat rooms` | INSERT | `—` | `((auth.uid() = created_by) AND user_can_use_team_chat(auth.uid()) AND ((kind ...` |
| `Creators or admins can delete team rooms` | DELETE | `((created_by = auth.uid()) OR (EXISTS ( SELECT 1    FROM user_roles ur   WHER...` | `—` |
| `Members or creators can update their team rooms` | UPDATE | `(user_in_team_room(auth.uid(), id) OR (created_by = auth.uid()))` | `(user_in_team_room(auth.uid(), id) OR (created_by = auth.uid()))` |
| `Members or creators can view their team rooms` | SELECT | `(user_in_team_room(auth.uid(), id) OR (created_by = auth.uid()))` | `—` |

### `team_chat_members`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `team_chat_members`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `room_id` | uuid | NO | — | FK reference |
| `user_id` | uuid | NO | — | References auth.users |
| `joined_at` | timestamp with time zone | NO | now() | Timestamp |

**Relationships (FKs):**
- `room_id` → `team_chat_rooms.id`

**Indexes:**
- `idx_team_chat_members_room` — `CREATE INDEX idx_team_chat_members_room ON public.team_chat_members USING btree (room_id)`
- `idx_team_chat_members_user` — `CREATE INDEX idx_team_chat_members_user ON public.team_chat_members USING btree (user_id)`
- `team_chat_members_room_id_user_id_key` — `CREATE UNIQUE INDEX team_chat_members_room_id_user_id_key ON public.team_chat_members USING btree (room_id, user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Allowed users can add team chat members` | INSERT | `—` | `(user_can_use_team_chat(auth.uid()) AND user_can_use_team_chat(user_id))` |
| `Members can leave (delete their own row)` | DELETE | `(user_id = auth.uid())` | `—` |
| `Members can view rosters of their rooms` | SELECT | `user_in_team_room(auth.uid(), room_id)` | `—` |
| `Users can add members to rooms they belong to or that they crea` | INSERT | `—` | `(user_in_team_room(auth.uid(), room_id) OR (EXISTS ( SELECT 1    FROM team_ch...` |
| `Users can leave rooms or be removed by creators/admins` | DELETE | `((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM team_chat_rooms r   WHE...` | `—` |

### `email_templates`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `email_templates`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `name` | text | NO | — | Display name |
| `subject` | text | NO | — |  |
| `headline` | text | YES | — |  |
| `body` | text | NO | — |  |
| `cta_text` | text | YES | — |  |
| `cta_url` | text | YES | — | URL string |
| `created_by` | uuid | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `created_by` → `auth.users.id`

**Triggers:**
- `update_email_templates_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authorized roles can create email templates` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Authorized roles can delete email templates` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Authorized roles can update email templates` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Authorized roles can view email templates` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |

### `email_campaigns`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `email_campaigns`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `subject` | text | NO | — |  |
| `headline` | text | YES | — |  |
| `body` | text | NO | — |  |
| `cta_text` | text | YES | — |  |
| `cta_url` | text | YES | — | URL string |
| `audience` | text | NO | — |  |
| `recipient_count` | integer | NO | 0 |  |
| `sent_at` | timestamp with time zone | YES | — | Timestamp |
| `scheduled_for` | timestamp with time zone | YES | — |  |
| `status` | text | NO | 'sent'::text | Current status |
| `rendered_html` | text | YES | — |  |
| `created_by` | uuid | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `created_by` → `auth.users.id`

**Indexes:**
- `idx_email_campaigns_created_at` — `CREATE INDEX idx_email_campaigns_created_at ON public.email_campaigns USING btree (created_at DESC)`
- `idx_email_campaigns_status` — `CREATE INDEX idx_email_campaigns_status ON public.email_campaigns USING btree (status)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authorized roles can create email campaigns` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Authorized roles can update email campaigns` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Authorized roles can view email campaigns` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |

### `email_campaign_recipients`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `email_campaign_recipients`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `campaign_id` | uuid | NO | — | FK reference |
| `email` | text | NO | — | Email address |
| `name` | text | YES | — | Display name |
| `status` | text | NO | 'queued'::text | Current status |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `campaign_id` → `email_campaigns.id`

**Indexes:**
- `idx_email_campaign_recipients_campaign_id` — `CREATE INDEX idx_email_campaign_recipients_campaign_id ON public.email_campaign_recipients USING btree (campaign_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authorized roles can create campaign recipients` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Authorized roles can view campaign recipients` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |

### `email_queue`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `email_queue`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `recipient_email` | text | NO | — |  |
| `recipient_name` | text | YES | — |  |
| `subject` | text | NO | — |  |
| `html_body` | text | NO | — |  |
| `from_address` | text | NO | 'The Clips Platform <mail@app.theclip... |  |
| `reply_to` | text | YES | 'mail@app.theclips.agency'::text |  |
| `status` | text | NO | 'pending'::text | Current status |
| `priority` | integer | NO | 3 |  |
| `attempts` | integer | NO | 0 |  |
| `max_attempts` | integer | NO | 3 |  |
| `last_error` | text | YES | — |  |
| `scheduled_at` | timestamp with time zone | NO | now() | Timestamp |
| `sent_at` | timestamp with time zone | YES | — | Timestamp |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `metadata` | jsonb | YES | '{}'::jsonb | JSON metadata blob |

**Indexes:**
- `idx_email_queue_created_at` — `CREATE INDEX idx_email_queue_created_at ON public.email_queue USING btree (created_at DESC)`
- `idx_email_queue_pending` — `CREATE INDEX idx_email_queue_pending ON public.email_queue USING btree (status) WHERE (status = 'pending'::text)`
- `idx_email_queue_status_attempts` — `CREATE INDEX idx_email_queue_status_attempts ON public.email_queue USING btree (status, attempts) WHERE (status = 'failed'::text)`
- `idx_email_queue_status_scheduled` — `CREATE INDEX idx_email_queue_status_scheduled ON public.email_queue USING btree (status, scheduled_at) WHERE (status = 'pending'::text)`

**Triggers:**
- `update_email_queue_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Only service role can manage email queue` | ALL | `(((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text)...` | `—` |

### `email_logs`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `email_logs`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `recipient_email` | text | NO | — |  |
| `recipient_user_id` | uuid | YES | — | FK reference |
| `email_type` | text | NO | — |  |
| `subject` | text | NO | — |  |
| `status` | text | NO | 'pending'::text | Current status |
| `error_message` | text | YES | — |  |
| `metadata` | jsonb | YES | '{}'::jsonb | JSON metadata blob |
| `sent_at` | timestamp with time zone | YES | — | Timestamp |
| `retry_count` | integer | YES | 0 |  |
| `last_retry_at` | timestamp with time zone | YES | — | Timestamp |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Indexes:**
- `idx_email_logs_recipient` — `CREATE INDEX idx_email_logs_recipient ON public.email_logs USING btree (recipient_email)`
- `idx_email_logs_status` — `CREATE INDEX idx_email_logs_status ON public.email_logs USING btree (status)`
- `idx_email_logs_type` — `CREATE INDEX idx_email_logs_type ON public.email_logs USING btree (email_type)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can view email logs` | SELECT | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text))` | `—` |


## Domain: Notifications

### `notifications`
🔒 **RLS:** ENABLED
**Purpose:** In-app notifications (per-user).

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `title` | text | NO | — |  |
| `message` | text | NO | — |  |
| `type` | USER-DEFINED | NO | 'info'::notification_type |  |
| `read` | boolean | NO | false |  |
| `link` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `priority` | USER-DEFINED | NO | 'normal'::notification_priority |  |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_notifications_created_at` — `CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC)`
- `idx_notifications_read` — `CREATE INDEX idx_notifications_read ON public.notifications USING btree (read)`
- `idx_notifications_user_id` — `CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id)`
- `idx_notifications_user_unread` — `CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, created_at DESC) WHERE (read = false)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can create notifications` | INSERT | `—` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Users can update their own notifications` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view their own notifications` | SELECT | `(auth.uid() = user_id)` | `—` |

### `notification_preferences`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `notification_preferences`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `notification_type` | text | NO | — |  |
| `email_enabled` | boolean | NO | true |  |
| `push_enabled` | boolean | NO | true |  |
| `in_app_enabled` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_notification_preferences_type` — `CREATE INDEX idx_notification_preferences_type ON public.notification_preferences USING btree (notification_type)`
- `idx_notification_preferences_user_id` — `CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences USING btree (user_id)`
- `notification_preferences_user_id_notification_type_key` — `CREATE UNIQUE INDEX notification_preferences_user_id_notification_type_key ON public.notification_preferences USING btree (user_id, notification_type)`

**Triggers:**
- `update_notification_preferences_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can delete their own notification preferences` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users can insert their own notification preferences` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can update their own notification preferences` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view their own notification preferences` | SELECT | `(auth.uid() = user_id)` | `—` |

### `push_subscriptions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `push_subscriptions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `subscription` | jsonb | NO | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `endpoint` | text | NO | — |  |
| `device_label` | text | YES | — |  |
| `last_seen_at` | timestamp with time zone | YES | now() | Timestamp |
| `last_push_at` | timestamp with time zone | YES | — | Timestamp |
| `last_push_status` | text | YES | — |  |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `push_subscriptions_user_endpoint_uniq` — `CREATE UNIQUE INDEX push_subscriptions_user_endpoint_uniq ON public.push_subscriptions USING btree (user_id, endpoint)`
- `push_subscriptions_user_subscription_idx` — `CREATE UNIQUE INDEX push_subscriptions_user_subscription_idx ON public.push_subscriptions USING btree (user_id, ((subscription ->> 'endpoint'::text)))`

**Triggers:**
- `update_push_subscriptions_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can delete own subscriptions` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users can insert own subscriptions` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can view own subscriptions` | SELECT | `(auth.uid() = user_id)` | `—` |


## Domain: Billing, Stripe & Finance

### `stripe_charges`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `stripe_charges`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `stripe_charge_id` | text | NO | — | FK reference |
| `client_id` | uuid | YES | — | FK reference |
| `customer_email` | text | YES | — |  |
| `amount` | integer | NO | 0 |  |
| `currency` | text | NO | 'usd'::text |  |
| `status` | text | NO | 'pending'::text | Current status |
| `fee` | integer | NO | 0 |  |
| `net` | integer | NO | 0 |  |
| `description` | text | YES | — |  |
| `stripe_created_at` | timestamp with time zone | YES | — | Timestamp |
| `synced_at` | timestamp with time zone | NO | now() | Timestamp |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `stripe_customer_id` | text | YES | — | FK reference |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `idx_stripe_charges_client_id` — `CREATE INDEX idx_stripe_charges_client_id ON public.stripe_charges USING btree (client_id)`
- `idx_stripe_charges_customer_id` — `CREATE INDEX idx_stripe_charges_customer_id ON public.stripe_charges USING btree (stripe_customer_id)`
- `idx_stripe_charges_status` — `CREATE INDEX idx_stripe_charges_status ON public.stripe_charges USING btree (status)`
- `idx_stripe_charges_stripe_created_at` — `CREATE INDEX idx_stripe_charges_stripe_created_at ON public.stripe_charges USING btree (stripe_created_at)`
- `stripe_charges_stripe_charge_id_key` — `CREATE UNIQUE INDEX stripe_charges_stripe_charge_id_key ON public.stripe_charges USING btree (stripe_charge_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can view their own stripe charges` | SELECT | `((client_id IS NOT NULL) AND (client_id IN ( SELECT client_access.client_id  ...` | `—` |
| `Owners and admins can view stripe charges` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |

### `stripe_subscriptions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `stripe_subscriptions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `stripe_subscription_id` | text | NO | — | FK reference |
| `stripe_customer_id` | text | YES | — | FK reference |
| `client_id` | uuid | YES | — | FK reference |
| `customer_email` | text | YES | — |  |
| `status` | text | NO | 'active'::text | Current status |
| `plan_name` | text | YES | — |  |
| `amount` | integer | NO | 0 |  |
| `currency` | text | NO | 'usd'::text |  |
| `interval` | text | NO | 'month'::text |  |
| `current_period_start` | timestamp with time zone | YES | — |  |
| `current_period_end` | timestamp with time zone | YES | — |  |
| `canceled_at` | timestamp with time zone | YES | — | Timestamp |
| `stripe_created_at` | timestamp with time zone | YES | — | Timestamp |
| `synced_at` | timestamp with time zone | NO | now() | Timestamp |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `idx_stripe_subscriptions_client_id` — `CREATE INDEX idx_stripe_subscriptions_client_id ON public.stripe_subscriptions USING btree (client_id)`
- `idx_stripe_subscriptions_status` — `CREATE INDEX idx_stripe_subscriptions_status ON public.stripe_subscriptions USING btree (status)`
- `stripe_subscriptions_stripe_subscription_id_key` — `CREATE UNIQUE INDEX stripe_subscriptions_stripe_subscription_id_key ON public.stripe_subscriptions USING btree (stripe_subscription_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can view their own stripe subscriptions` | SELECT | `((client_id IS NOT NULL) AND (client_id IN ( SELECT client_access.client_id  ...` | `—` |
| `Owners and admins can view stripe subscriptions` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |

### `stripe_events_log`
🔒 **RLS:** ENABLED

> ✅ **KEEP** — critical idempotency table for Send-Payment automation.

**Purpose:** See codebase usage for `stripe_events_log`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `stripe_event_id` | text | NO | — | FK reference |
| `event_type` | text | NO | — |  |
| `processed_at` | timestamp with time zone | NO | now() | Timestamp |

**Indexes:**
- `idx_stripe_events_log_event_id` — `CREATE INDEX idx_stripe_events_log_event_id ON public.stripe_events_log USING btree (stripe_event_id)`
- `stripe_events_log_stripe_event_id_key` — `CREATE UNIQUE INDEX stripe_events_log_stripe_event_id_key ON public.stripe_events_log USING btree (stripe_event_id)`

**RLS Policies:** ⚠️ RLS enabled but **no policies** — table is locked down.

### `finance_transactions`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `finance_transactions`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `amount` | numeric | NO | — |  |
| `transaction_type` | text | NO | — |  |
| `payment_status` | text | NO | 'pending'::text |  |
| `payment_date` | date | YES | — |  |
| `payment_method` | text | YES | — |  |
| `stripe_payment_id` | text | YES | — | FK reference |
| `notes` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `idx_finance_transactions_client` — `CREATE INDEX idx_finance_transactions_client ON public.finance_transactions USING btree (client_id)`
- `idx_finance_transactions_date` — `CREATE INDEX idx_finance_transactions_date ON public.finance_transactions USING btree (payment_date)`

**Triggers:**
- `update_finance_transactions_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Only owners can manage finance transactions` | ALL | `has_role(auth.uid(), 'owner'::text)` | `—` |
| `Only owners can view finance transactions` | SELECT | `has_role(auth.uid(), 'owner'::text)` | `—` |


## Domain: Talent Network (DROP in rebuild)

### `talent_network`
🔒 **RLS:** ENABLED

> 🗑️ **DROP** — Talent Network marketplace is being removed in rebuild.

**Purpose:** See codebase usage for `talent_network`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `full_name` | text | NO | — | Display name |
| `email` | text | YES | — | Email address |
| `phone` | text | YES | — |  |
| `location` | text | YES | — |  |
| `position_type` | ARRAY | YES | '{}'::text[] |  |
| `languages` | ARRAY | YES | '{}'::text[] |  |
| `salary` | text | YES | — |  |
| `workload` | text | YES | — |  |
| `bio` | text | YES | — |  |
| `portfolio_link` | text | YES | — |  |
| `exercise_link` | text | YES | — |  |
| `niche_experience` | ARRAY | YES | '{}'::text[] |  |
| `content_types` | ARRAY | YES | '{}'::text[] |  |
| `availability` | text | YES | 'Available Now'::text |  |
| `is_active` | boolean | YES | true |  |
| `submitted_at` | timestamp with time zone | YES | now() | Timestamp |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |
| `user_id` | uuid | YES | — | References auth.users |
| `status` | text | NO | 'pending'::text | Current status |
| `submitted_via` | text | YES | — |  |
| `custom_fields` | jsonb | YES | '{}'::jsonb |  |
| `talent_type` | text | NO | 'editor'::text |  |
| `rate_per_shoot` | text | YES | — |  |
| `hours_per_shoot` | text | YES | — |  |
| `address` | text | YES | — |  |
| `rate_per_hour` | text | YES | — |  |
| `backgrounds` | ARRAY | YES | '{}'::text[] |  |
| `amenities` | ARRAY | YES | '{}'::text[] |  |
| `va_specialty` | text | YES | — |  |
| `timezone` | text | YES | — |  |
| `skills` | ARRAY | YES | '{}'::text[] |  |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Triggers:**
- `update_talent_network_updated_at` → `update_updated_at_column()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can do everything with talent` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Clients can view approved active talent` | SELECT | `(((is_active = true) AND (status = 'approved'::text) AND has_role(auth.uid(),...` | `—` |
| `Public can submit talent applications` | INSERT | `—` | `true` |

### `talent_portfolio_videos`
🔒 **RLS:** ENABLED

> 🗑️ **DROP** — Talent Network removal.

**Purpose:** See codebase usage for `talent_portfolio_videos`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `talent_id` | uuid | NO | — | FK reference |
| `video_url` | text | NO | — | URL string |
| `thumbnail_url` | text | YES | — | URL string |
| `title` | text | YES | — |  |
| `sort_order` | integer | NO | 0 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `talent_id` → `talent_network.id`

**Indexes:**
- `idx_talent_portfolio_videos_talent_id` — `CREATE INDEX idx_talent_portfolio_videos_talent_id ON public.talent_portfolio_videos USING btree (talent_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage portfolio videos` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Authenticated users can view portfolio videos` | SELECT | `true` | `—` |
| `Public can insert portfolio videos` | INSERT | `—` | `true` |
| `Public can view portfolio videos` | SELECT | `true` | `—` |

### `studios`
🔒 **RLS:** ENABLED

> 🗑️ **DROP** — Talent Network removal.

**Purpose:** See codebase usage for `studios`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `studio_number` | integer | NO | — |  |
| `image_url` | text | NO | — | URL string |
| `name` | text | YES | — | Display name |
| `description` | text | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Indexes:**
- `studios_studio_number_key` — `CREATE UNIQUE INDEX studios_studio_number_key ON public.studios USING btree (studio_number)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins, owners, and editor admins can manage studios` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text) O...` |
| `Everyone can view studios` | SELECT | `true` | `—` |

### `client_hires`
🔒 **RLS:** ENABLED

> 🗑️ **DROP** — Talent Network transactional flow removed.

**Purpose:** See codebase usage for `client_hires`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `talent_id` | uuid | NO | — | FK reference |
| `talent_type` | text | NO | 'editor'::text |  |
| `hired_at` | timestamp with time zone | NO | now() | Timestamp |
| `status` | text | NO | 'active'::text | Current status |
| `chat_room_id` | uuid | YES | — | FK reference |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `chat_room_id` → `chat_rooms.id`
- `client_id` → `clients.id`
- `talent_id` → `talent_network.id`

**Indexes:**
- `client_hires_client_id_talent_id_key` — `CREATE UNIQUE INDEX client_hires_client_id_talent_id_key ON public.client_hires USING btree (client_id, talent_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Authenticated can insert hires` | INSERT | `—` | `((EXISTS ( SELECT 1    FROM client_access ca   WHERE ((ca.client_id = client_...` |
| `Clients can view own hires` | SELECT | `((EXISTS ( SELECT 1    FROM client_access ca   WHERE ((ca.client_id = client_...` | `—` |


## Domain: Analytics & Metrics

### `academy_instagram_metrics`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `academy_instagram_metrics`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `date` | date | YES | — |  |
| `week_start_date` | date | YES | — |  |
| `week_end_date` | date | YES | — |  |
| `accounts_reached` | integer | NO | 0 |  |
| `accounts_engaged` | integer | NO | 0 |  |
| `likes` | integer | NO | 0 |  |
| `comments` | integer | NO | 0 |  |
| `saves` | integer | NO | 0 |  |
| `shares` | integer | NO | 0 |  |
| `website_clicks` | integer | NO | 0 |  |
| `total_interactions` | integer | NO | 0 |  |
| `total_followers` | integer | NO | 0 |  |
| `followers_change` | integer | NO | 0 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Indexes:**
- `idx_academy_instagram_metrics_date` — `CREATE INDEX idx_academy_instagram_metrics_date ON public.academy_instagram_metrics USING btree (date DESC)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Everyone authenticated can view Academy Instagram metrics` | SELECT | `(auth.uid() IS NOT NULL)` | `—` |
| `Owners, admins, and editor admins can manage Academy Instagram ` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |

### `agency_facebook_ads_metrics`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `agency_facebook_ads_metrics`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `campaign_name` | text | NO | 'TCA - UAE'::text |  |
| `spent` | numeric | NO | 0 |  |
| `spent_change_percent` | integer | NO | 0 |  |
| `impressions` | integer | NO | 0 |  |
| `impressions_change_percent` | integer | NO | 0 |  |
| `reach` | integer | NO | 0 |  |
| `reach_change_percent` | integer | NO | 0 |  |
| `link_clicks` | integer | NO | 0 |  |
| `link_clicks_change_percent` | integer | NO | 0 |  |
| `second_calls` | integer | NO | 0 |  |
| `leads` | integer | NO | 0 |  |
| `leads_change` | integer | NO | 0 |  |
| `cpl` | numeric | NO | 0 |  |
| `cpl_change` | numeric | NO | 0 |  |
| `performance_status` | text | NO | 'average'::text |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `date` | date | NO | CURRENT_DATE |  |

**Indexes:**
- `unique_facebook_ads_date` — `CREATE UNIQUE INDEX unique_facebook_ads_date ON public.agency_facebook_ads_metrics USING btree (date, campaign_name)`
- `uq_fb_ads_date_campaign` — `CREATE UNIQUE INDEX uq_fb_ads_date_campaign ON public.agency_facebook_ads_metrics USING btree (date, campaign_name)`

**Triggers:**
- `update_agency_facebook_ads_metrics_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Everyone authenticated can view Facebook Ads metrics` | SELECT | `(auth.uid() IS NOT NULL)` | `—` |
| `Owners, admins, and editor admins can manage Facebook Ads metri` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |

### `agency_instagram_metrics`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `agency_instagram_metrics`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `week_start_date` | date | YES | — |  |
| `week_end_date` | date | YES | — |  |
| `accounts_reached` | integer | NO | 0 |  |
| `accounts_engaged` | integer | NO | 0 |  |
| `likes` | integer | NO | 0 |  |
| `comments` | integer | NO | 0 |  |
| `saves` | integer | NO | 0 |  |
| `shares` | integer | NO | 0 |  |
| `website_clicks` | integer | NO | 0 |  |
| `total_interactions` | integer | NO | 0 |  |
| `total_followers` | integer | NO | 0 |  |
| `followers_change` | integer | NO | 0 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `date` | date | YES | — |  |

**Indexes:**
- `idx_instagram_metrics_week_end` — `CREATE INDEX idx_instagram_metrics_week_end ON public.agency_instagram_metrics USING btree (week_end_date DESC)`
- `uq_ig_metrics_date` — `CREATE UNIQUE INDEX uq_ig_metrics_date ON public.agency_instagram_metrics USING btree (date)`

**Triggers:**
- `update_agency_instagram_metrics_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Everyone authenticated can view Instagram metrics` | SELECT | `(auth.uid() IS NOT NULL)` | `—` |
| `Owners, admins, and editor admins can manage Instagram metrics` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |

### `client_ads_metrics`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_ads_metrics`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `date` | date | NO | — |  |
| `campaign_name` | text | YES | 'Main Campaign'::text |  |
| `spent` | numeric | YES | 0 |  |
| `spent_change_percent` | numeric | YES | 0 |  |
| `impressions` | integer | YES | 0 |  |
| `impressions_change_percent` | numeric | YES | 0 |  |
| `reach` | integer | YES | 0 |  |
| `reach_change_percent` | numeric | YES | 0 |  |
| `link_clicks` | integer | YES | 0 |  |
| `link_clicks_change_percent` | numeric | YES | 0 |  |
| `leads` | integer | YES | 0 |  |
| `leads_change` | numeric | YES | 0 |  |
| `cpl` | numeric | YES | 0 |  |
| `cpl_change` | numeric | YES | 0 |  |
| `second_calls` | integer | YES | 0 |  |
| `performance_status` | text | YES | 'average'::text |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `client_ads_metrics_client_id_date_campaign_name_key` — `CREATE UNIQUE INDEX client_ads_metrics_client_id_date_campaign_name_key ON public.client_ads_metrics USING btree (client_id, date, campaign_name)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage ads metrics` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Clients can view their own ads metrics` | SELECT | `((EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id =...` | `—` |

### `client_automation_metrics`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_automation_metrics`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `date` | date | NO | — |  |
| `chats_started` | integer | YES | 0 |  |
| `leads_generated` | integer | YES | 0 |  |
| `qualified_leads` | integer | YES | 0 |  |
| `conversion_rate` | numeric | YES | 0 |  |
| `estimated_revenue` | numeric | YES | 0 |  |
| `avg_response_time_seconds` | integer | YES | 0 |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `client_automation_metrics_client_id_date_key` — `CREATE UNIQUE INDEX client_automation_metrics_client_id_date_key ON public.client_automation_metrics USING btree (client_id, date)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage automation metrics` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Clients can view their own automation metrics` | SELECT | `((EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id =...` | `—` |

### `client_organic_metrics`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_organic_metrics`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `platform` | text | NO | — |  |
| `date` | date | NO | — |  |
| `week_start_date` | date | YES | — |  |
| `week_end_date` | date | YES | — |  |
| `accounts_reached` | integer | YES | 0 |  |
| `accounts_engaged` | integer | YES | 0 |  |
| `likes` | integer | YES | 0 |  |
| `comments` | integer | YES | 0 |  |
| `saves` | integer | YES | 0 |  |
| `shares` | integer | YES | 0 |  |
| `website_clicks` | integer | YES | 0 |  |
| `total_interactions` | integer | YES | 0 |  |
| `total_followers` | integer | YES | 0 |  |
| `followers_change` | integer | YES | 0 |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Indexes:**
- `client_organic_metrics_client_id_platform_date_key` — `CREATE UNIQUE INDEX client_organic_metrics_client_id_platform_date_key ON public.client_organic_metrics USING btree (client_id, platform, date)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage organic metrics` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Clients can view their own organic metrics` | SELECT | `((EXISTS ( SELECT 1    FROM client_access   WHERE ((client_access.client_id =...` | `—` |

### `client_top_reels`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_top_reels`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `platform` | text | NO | 'instagram'::text |  |
| `reel_url` | text | NO | — | URL string |
| `thumbnail_url` | text | YES | — | URL string |
| `caption` | text | YES | — |  |
| `views` | bigint | NO | 0 |  |
| `likes` | integer | NO | 0 |  |
| `comments` | integer | NO | 0 |  |
| `shares` | integer | NO | 0 |  |
| `saves` | integer | NO | 0 |  |
| `posted_at` | timestamp with time zone | YES | — | Timestamp |
| `period` | text | YES | '30d'::text |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can manage all reels` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |
| `Clients can view their own reels` | SELECT | `(user_has_client_access(auth.uid(), client_id) OR has_role(auth.uid(), 'owner...` | `—` |

### `client_audience_avatars`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_audience_avatars`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | — | FK reference |
| `name` | text | NO | 'New Avatar'::text | Display name |
| `emoji` | text | YES | '🎯'::text |  |
| `age_range` | text | YES | — |  |
| `location` | text | YES | — |  |
| `income` | text | YES | — |  |
| `occupation` | text | YES | — |  |
| `fears_pains` | ARRAY | YES | '{}'::text[] |  |
| `desires_goals` | ARRAY | YES | '{}'::text[] |  |
| `blockers` | ARRAY | YES | '{}'::text[] |  |
| `phrases` | ARRAY | YES | '{}'::text[] |  |
| `order_index` | integer | YES | 0 |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `client_id` → `clients.id`

**Triggers:**
- `update_client_audience_avatars_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can insert their audience when published` | INSERT | `—` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can update their audience when published` | UPDATE | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` |
| `Clients can view their audience when published` | SELECT | `(is_studio_published(client_id) AND user_has_client_access(auth.uid(), client...` | `—` |
| `Owners and admins can manage audience avatars` | ALL | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |

### `editor_goals`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `editor_goals`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `editor_id` | uuid | YES | — | FK reference |
| `monthly_goal` | integer | NO | 40 |  |
| `updated_by` | uuid | YES | — |  |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `editor_id` → `profiles.id`
- `updated_by` → `profiles.id`

**Indexes:**
- `unique_editor_goal` — `CREATE UNIQUE INDEX unique_editor_goal ON public.editor_goals USING btree (editor_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins can delete goals` | DELETE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |
| `Admins can insert goals` | INSERT | `—` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` |
| `Admins can update goals` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |
| `Authenticated users can read goals` | SELECT | `true` | `—` |


## Domain: AI / Jarvis

### `ai_conversations`
🔒 **RLS:** ENABLED

> 🔄 **KEEP** but consolidate AI provider on GPT-5 Mini per PRD.

**Purpose:** See codebase usage for `ai_conversations`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `title` | text | NO | 'New Conversation'::text |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |
| `is_pinned` | boolean | NO | false |  |
| `is_archived` | boolean | NO | false |  |
| `mode` | text | NO | 'default'::text |  |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_ai_conversations_pinned` — `CREATE INDEX idx_ai_conversations_pinned ON public.ai_conversations USING btree (user_id, is_pinned) WHERE (is_pinned = true)`
- `idx_ai_conversations_user` — `CREATE INDEX idx_ai_conversations_user ON public.ai_conversations USING btree (user_id, created_at DESC)`
- `idx_ai_conversations_user_created` — `CREATE INDEX idx_ai_conversations_user_created ON public.ai_conversations USING btree (user_id, created_at DESC)`
- `idx_ai_conversations_user_mode` — `CREATE INDEX idx_ai_conversations_user_mode ON public.ai_conversations USING btree (user_id, mode, created_at DESC)`

**Triggers:**
- `update_ai_conversations_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can create their own conversations` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can delete their own conversations` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users can update their own conversations` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view their own conversations` | SELECT | `(auth.uid() = user_id)` | `—` |

### `ai_messages`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `ai_messages`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `conversation_id` | uuid | NO | — | FK reference |
| `role` | text | NO | — | Role enum |
| `content` | text | NO | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `metadata` | jsonb | YES | — | JSON metadata blob |
| `feedback` | text | YES | — |  |

**Relationships (FKs):**
- `conversation_id` → `ai_conversations.id`

**Indexes:**
- `idx_ai_messages_conversation` — `CREATE INDEX idx_ai_messages_conversation ON public.ai_messages USING btree (conversation_id, created_at)`
- `idx_ai_messages_conversation_created` — `CREATE INDEX idx_ai_messages_conversation_created ON public.ai_messages USING btree (conversation_id, created_at)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can create messages in their conversations` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM ai_conversations   WHERE ((ai_conversations.id = a...` |
| `Users can delete their conversation messages` | DELETE | `(EXISTS ( SELECT 1    FROM ai_conversations   WHERE ((ai_conversations.id = a...` | `—` |
| `Users can view their conversation messages` | SELECT | `(EXISTS ( SELECT 1    FROM ai_conversations   WHERE ((ai_conversations.id = a...` | `—` |

### `user_ai_settings`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `user_ai_settings`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `model` | text | NO | 'google/gemini-2.5-flash'::text |  |
| `system_prompt` | text | YES | — |  |
| `temperature` | numeric | NO | 0.3 |  |
| `top_p` | numeric | NO | 1 |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_user_ai_settings_user_id` — `CREATE INDEX idx_user_ai_settings_user_id ON public.user_ai_settings USING btree (user_id)`
- `user_ai_settings_user_id_key` — `CREATE UNIQUE INDEX user_ai_settings_user_id_key ON public.user_ai_settings USING btree (user_id)`

**Triggers:**
- `update_user_ai_settings_updated_at` → `update_user_ai_settings_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can insert own AI settings` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can update own AI settings` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view own AI settings` | SELECT | `(auth.uid() = user_id)` | `—` |

### `user_ai_context_files`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `user_ai_context_files`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `file_name` | text | NO | — |  |
| `file_path` | text | NO | — | Storage path |
| `file_type` | text | NO | — |  |
| `file_size_bytes` | bigint | NO | — |  |
| `extracted_text` | text | YES | — |  |
| `is_active` | boolean | NO | true |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | now() | Last-updated timestamp |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_user_ai_context_files_active` — `CREATE INDEX idx_user_ai_context_files_active ON public.user_ai_context_files USING btree (user_id, is_active)`
- `idx_user_ai_context_files_user_id` — `CREATE INDEX idx_user_ai_context_files_user_id ON public.user_ai_context_files USING btree (user_id)`

**Triggers:**
- `update_user_ai_context_files_updated_at` → `update_user_ai_settings_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can delete own context files` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users can insert own context files` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can update own context files` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view own context files` | SELECT | `(auth.uid() = user_id)` | `—` |


## Domain: Sharing & Public Links

### `review_tokens`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `review_tokens`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `content_item_id` | uuid | NO | — | FK reference |
| `token` | text | NO | — |  |
| `expires_at` | timestamp with time zone | NO | (now() + '30 days'::interval) | Timestamp |
| `created_by` | uuid | YES | — |  |
| `revoked` | boolean | YES | false |  |
| `access_count` | integer | YES | 0 |  |
| `last_accessed_at` | timestamp with time zone | YES | — | Timestamp |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |

**Relationships (FKs):**
- `content_item_id` → `content_items.id`
- `created_by` → `auth.users.id`

**Indexes:**
- `idx_review_tokens_content_item` — `CREATE INDEX idx_review_tokens_content_item ON public.review_tokens USING btree (content_item_id)`
- `idx_review_tokens_token` — `CREATE INDEX idx_review_tokens_token ON public.review_tokens USING btree (token)`
- `review_tokens_token_key` — `CREATE UNIQUE INDEX review_tokens_token_key ON public.review_tokens USING btree (token)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Clients can create tokens for accessible videos` | INSERT | `—` | `(has_role(auth.uid(), 'client'::text) AND ((EXISTS ( SELECT 1    FROM (client...` |
| `Public can validate review tokens` | SELECT | `((expires_at > now()) AND (revoked = false))` | `—` |
| `Team members can create tokens` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |
| `Team members can delete tokens` | DELETE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `Team members can update tokens` | UPDATE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `Team members can view tokens` | SELECT | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |

### `short_links`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `short_links`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `code` | text | NO | — |  |
| `target_url` | text | NO | — | URL string |
| `content_item_id` | uuid | YES | — | FK reference |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `access_count` | integer | YES | 0 |  |

**Relationships (FKs):**
- `content_item_id` → `content_items.id`

**Indexes:**
- `idx_short_links_code` — `CREATE INDEX idx_short_links_code ON public.short_links USING btree (code)`
- `short_links_code_key` — `CREATE UNIQUE INDEX short_links_code_key ON public.short_links USING btree (code)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Team and clients can create short links` | INSERT | `—` | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` |
| `Team and clients can update short links` | UPDATE | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid...` | `—` |
| `Team members can read short links` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |


## Domain: System / Settings / Misc

*Tables not present in current DB (skipped): `metric_card_preferences`*

### `settings`
🔒 **RLS:** ENABLED

> ➕ **ADD** `tenant_id` column for multi-tenant white-label support.

**Purpose:** See codebase usage for `settings`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `key` | text | NO | — |  |
| `value` | text | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Indexes:**
- `settings_key_key` — `CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins and owners can manage settings` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text))` | `—` |
| `Authenticated users can view settings` | SELECT | `(auth.uid() IS NOT NULL)` | `—` |
| `Only owners can modify AI settings` | ALL | `((key ~~ 'clips_ai_%'::text) AND (EXISTS ( SELECT 1    FROM user_roles   WHER...` | `((key ~~ 'clips_ai_%'::text) AND (EXISTS ( SELECT 1    FROM user_roles   WHER...` |

### `default_settings`
🔒 **RLS:** ENABLED

> 🔄 **REPURPOSE** as the seed-defaults source for new tenants.

**Purpose:** See codebase usage for `default_settings`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `setting_key` | text | NO | — |  |
| `setting_value` | jsonb | NO | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Indexes:**
- `default_settings_setting_key_key` — `CREATE UNIQUE INDEX default_settings_setting_key_key ON public.default_settings USING btree (setting_key)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Admins and owners can manage default settings` | ALL | `(has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'owner'::text))` | `—` |

### `user_kanban_boards`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `user_kanban_boards`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | — | References auth.users |
| `columns` | jsonb | NO | '[{"id": "todo", "color": "#94a3b8", ... |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Indexes:**
- `user_kanban_boards_user_id_key` — `CREATE UNIQUE INDEX user_kanban_boards_user_id_key ON public.user_kanban_boards USING btree (user_id)`

**Triggers:**
- `update_user_kanban_boards_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can delete their own board settings` | DELETE | `(auth.uid() = user_id)` | `—` |
| `Users can insert their own board settings` | INSERT | `—` | `(auth.uid() = user_id)` |
| `Users can update their own board settings` | UPDATE | `(auth.uid() = user_id)` | `—` |
| `Users can view their own board settings` | SELECT | `(auth.uid() = user_id)` | `—` |

### `user_column_preferences`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `user_column_preferences`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | YES | — | References auth.users |
| `project_id` | uuid | YES | — | FK reference |
| `column_settings` | jsonb | YES | — |  |
| `created_at` | timestamp with time zone | YES | now() | Creation timestamp |
| `updated_at` | timestamp with time zone | YES | now() | Last-updated timestamp |

**Relationships (FKs):**
- `project_id` → `projects.id`
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_user_column_preferences_user_project` — `CREATE INDEX idx_user_column_preferences_user_project ON public.user_column_preferences USING btree (user_id, project_id)`
- `user_column_preferences_user_id_project_id_key` — `CREATE UNIQUE INDEX user_column_preferences_user_id_project_id_key ON public.user_column_preferences USING btree (user_id, project_id)`

**Triggers:**
- `update_user_column_preferences_updated_at` → `update_updated_at()`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Users can manage their own column preferences` | ALL | `(auth.uid() = user_id)` | `—` |


## Domain: Activity, Audit & Maintenance

### `activity_logs`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `activity_logs`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | YES | — | References auth.users |
| `action` | text | NO | — |  |
| `category` | text | NO | — |  |
| `entity_type` | text | YES | — |  |
| `entity_id` | uuid | YES | — | FK reference |
| `metadata` | jsonb | YES | '{}'::jsonb | JSON metadata blob |
| `ip_address` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Relationships (FKs):**
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_activity_logs_action` — `CREATE INDEX idx_activity_logs_action ON public.activity_logs USING btree (action)`
- `idx_activity_logs_category` — `CREATE INDEX idx_activity_logs_category ON public.activity_logs USING btree (category)`
- `idx_activity_logs_created_at` — `CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at DESC)`
- `idx_activity_logs_entity` — `CREATE INDEX idx_activity_logs_entity ON public.activity_logs USING btree (entity_type, entity_id)`
- `idx_activity_logs_user_id` — `CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Owners and admins can view activity logs` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text) O...` | `—` |

### `client_error_logs`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `client_error_logs`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | YES | — | References auth.users |
| `error_type` | text | NO | — |  |
| `message` | text | NO | — |  |
| `stack_trace` | text | YES | — |  |
| `metadata` | jsonb | YES | '{}'::jsonb | JSON metadata blob |
| `page_url` | text | YES | — | URL string |
| `user_agent` | text | YES | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |
| `resolved` | boolean | NO | false |  |
| `resolved_at` | timestamp with time zone | YES | — | Timestamp |
| `resolved_by` | uuid | YES | — |  |

**Relationships (FKs):**
- `resolved_by` → `auth.users.id`
- `user_id` → `auth.users.id`

**Indexes:**
- `idx_client_error_logs_created_at` — `CREATE INDEX idx_client_error_logs_created_at ON public.client_error_logs USING btree (created_at DESC)`
- `idx_client_error_logs_error_type` — `CREATE INDEX idx_client_error_logs_error_type ON public.client_error_logs USING btree (error_type)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `Anyone can insert error logs` | INSERT | `—` | `true` |
| `Owners and admins can read error logs` | SELECT | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `—` |
| `Owners and admins can update error log resolution` | UPDATE | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` | `(has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid(), 'admin'::text))` |

### `rate_limit_entries`
🔒 **RLS:** ENABLED
**Purpose:** See codebase usage for `rate_limit_entries`.

**Columns:**

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `key` | text | NO | — |  |
| `ip_address` | text | YES | — |  |
| `user_id` | uuid | YES | — | References auth.users |
| `endpoint` | text | NO | — |  |
| `created_at` | timestamp with time zone | NO | now() | Creation timestamp |

**Indexes:**
- `idx_rate_limit_created_at` — `CREATE INDEX idx_rate_limit_created_at ON public.rate_limit_entries USING btree (created_at)`
- `idx_rate_limit_key_time` — `CREATE INDEX idx_rate_limit_key_time ON public.rate_limit_entries USING btree (key, created_at DESC)`

**RLS Policies:**
| Name | Cmd | USING | WITH CHECK |
|---|---|---|---|
| `rate_limit_entries_deny_all` | ALL | `false` | `—` |


---

## 3. Enums / Status Values

### `account_status`
`active` | `paused` | `churned` | `archived`

### `app_role`
`owner` | `editor_admin` | `editor` | `client` | `admin` | `content_admin` | `sales`

> 🔄 **REBUILD:** rename `admin`→`manager`, `editor_admin`→`senior_editor`, `content_admin`→`content_creator`, `sales`→`closer`. Add `moderator`.

### `content_language`
`en` | `ar`

### `content_priority`
`high` | `medium` | `low`

### `content_status`
`rough_cut` | `in_progress` | `internal_review` | `revision` | `ready` | `cancelled` | `client_approved` | `scheduled` | `posted` | `declined`

### `content_type`
`reel` | `hl_vo` | `hl_no_vo` | `youtube_video` | `podcast` | `podcast_trailer` | `vsl`

### `editor_name`
`sachin` | `iyas` | `faheem`

### `notification_priority`
`urgent` | `normal` | `low`

### `notification_type`
`approval` | `comment` | `status_change` | `warning` | `assignment` | `info` | `mention`

### `project_status`
`not_started` | `in_progress` | `paused` | `completed` | `cancelled`

### `project_type`
`ghosthost_executive` | `ghosthost_creator` | `ghosthost_previous` | `highlights` | `makeover`

### `solution_type`
`ghosthost_executive` | `ghosthost_creator` | `ghosthost_previous` | `highlights` | `makeover` | `custom_deal` | `ghosthost` | `takeover`

### `unified_status`
`not_started` | `rough_cut` | `ready_edit` | `client_approved` | `client_revision` | `internal_revision` | `scheduled` | `posted` | `declined` | `in_progress` | `cancelled`

> 🔄 **REBUILD:** drop the enum entirely; replace with FK to per-tenant `statuses` table for full modularity.

### `user_role`
`admin` | `client`


---

## 4. Storage Buckets

| Name | Public | Size limit | Allowed MIME |
|---|---|---|---|
| `ai-context-files` | 🔒 PRIVATE | — | any |
| `avatars` | 🌐 PUBLIC | 5 MB | {image/jpeg,image/png,image/gif} |
| `branding-decks` | 🌐 PUBLIC | — | any |
| `chat-attachments` | 🌐 PUBLIC | 100 MB | any |
| `comment-attachments` | 🌐 PUBLIC | — | any |
| `onboarding-videos` | 🌐 PUBLIC | — | any |
| `studio-photos` | 🌐 PUBLIC | — | any |
| `talent-portfolio` | 🌐 PUBLIC | — | any |
| `thumbnails` | 🌐 PUBLIC | — | any |

### Storage object policies (`storage.objects`)

| Policy | Cmd | USING |
|---|---|---|
| `Admins and owners can delete onboarding videos` | DELETE | `((bucket_id = 'onboarding-videos'::text) AND (has_role(auth.uid(), 'admin'::text) OR has_role(aut...` |
| `Admins and owners can delete studio photos` | DELETE | `((bucket_id = 'studio-photos'::text) AND (has_role(auth.uid(), 'admin'::text) OR has_role(auth.ui...` |
| `Admins and owners can update onboarding videos` | UPDATE | `((bucket_id = 'onboarding-videos'::text) AND (has_role(auth.uid(), 'admin'::text) OR has_role(aut...` |
| `Admins and owners can update studio photos` | UPDATE | `((bucket_id = 'studio-photos'::text) AND (has_role(auth.uid(), 'admin'::text) OR has_role(auth.ui...` |
| `Admins and owners can upload onboarding videos` | INSERT | `—` |
| `Admins and owners can upload studio photos` | INSERT | `—` |
| `Admins can delete branding decks` | DELETE | `((bucket_id = 'branding-decks'::text) AND (has_role(auth.uid(), 'admin'::text) OR has_role(auth.u...` |
| `Admins can delete talent portfolio files` | DELETE | `((bucket_id = 'talent-portfolio'::text) AND (has_role(auth.uid(), 'owner'::text) OR has_role(auth...` |
| `Admins can update branding decks` | UPDATE | `((bucket_id = 'branding-decks'::text) AND (has_role(auth.uid(), 'admin'::text) OR has_role(auth.u...` |
| `Admins can upload branding decks` | INSERT | `—` |
| `Admins can upload talent portfolio files` | INSERT | `—` |
| `Anyone can view chat attachments` | SELECT | `(bucket_id = 'chat-attachments'::text)` |
| `Anyone can view comment attachment files` | SELECT | `(bucket_id = 'comment-attachments'::text)` |
| `Anyone can view onboarding videos` | SELECT | `(bucket_id = 'onboarding-videos'::text)` |
| `Anyone can view studio photos` | SELECT | `(bucket_id = 'studio-photos'::text)` |
| `Anyone can view talent portfolio files` | SELECT | `(bucket_id = 'talent-portfolio'::text)` |
| `Anyone can view thumbnails` | SELECT | `(bucket_id = 'thumbnails'::text)` |
| `Authenticated users can upload comment attachments` | INSERT | `—` |
| `Authenticated users can view branding decks` | SELECT | `((bucket_id = 'branding-decks'::text) AND (auth.role() = 'authenticated'::text))` |
| `Avatar images are publicly accessible` | SELECT | `(bucket_id = 'avatars'::text)` |
| `Chat participants can upload attachments` | INSERT | `—` |
| `Public can upload talent portfolio videos` | INSERT | `—` |
| `Team members can delete thumbnails` | DELETE | `((bucket_id = 'thumbnails'::text) AND (has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid()...` |
| `Team members can update thumbnails` | UPDATE | `((bucket_id = 'thumbnails'::text) AND (has_role(auth.uid(), 'owner'::text) OR has_role(auth.uid()...` |
| `Team members can upload thumbnails` | INSERT | `—` |
| `Users can delete own context files` | DELETE | `((bucket_id = 'ai-context-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))` |
| `Users can delete their own avatar` | DELETE | `((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |
| `Users can delete their own comment attachment files` | DELETE | `((bucket_id = 'comment-attachments'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |
| `Users can update their own avatar` | UPDATE | `((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |
| `Users can upload own context files` | INSERT | `—` |
| `Users can upload their own avatar` | INSERT | `—` |
| `Users can view own context files` | SELECT | `((bucket_id = 'ai-context-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))` |
| `chat_attachments_delete` | DELETE | `((bucket_id = 'chat-attachments'::text) AND (auth.uid() = owner))` |
| `chat_attachments_insert` | INSERT | `—` |
| `chat_attachments_select` | SELECT | `(bucket_id = 'chat-attachments'::text)` |
| `chat_attachments_update` | UPDATE | `((bucket_id = 'chat-attachments'::text) AND (auth.uid() = owner))` |

---

## 5. Edge Functions (121 total)

Grouped by purpose. Each entry: name, JWT verification, trigger, rebuild verdict.


### Upload Pipeline (R2 multipart + Cloudflare Stream)

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `get-r2-upload-url` | no | HTTP | ✅ KEEP |
| `r2-multipart-create` | yes | HTTP | ✅ KEEP — multipart-only per PRD |
| `r2-multipart-upload-part` | yes | HTTP | ✅ KEEP |
| `r2-multipart-complete` | yes | HTTP | ✅ KEEP |
| `initialize-video-upload` | yes | HTTP | ✅ KEEP |
| `upload-video-chunk` | yes | HTTP | ✅ KEEP |
| `check-video-status` | yes | HTTP | ✅ KEEP |
| `upload-new-version` | no | HTTP | ✅ KEEP |
| `copy-video-to-r2` | no | HTTP/cron | ✅ KEEP — Cloudflare→R2 sync |
| `backfill-videos-to-r2` | no | Manual | ✅ KEEP — legacy backfill |
| `audit-cloudflare-videos` | no | Cron weekly | ✅ KEEP |
| `delete-cloudflare-video` | no | HTTP | ✅ KEEP |
| `delete-version` | no | HTTP | ✅ KEEP |
| `download-media` | no | HTTP | ✅ KEEP — R2 streaming proxy |
| `create-zip-download` | yes | HTTP | ✅ KEEP |
| `upload-health-check` | no | HTTP | ✅ KEEP |
| `cleanup-failed-upload` | no | Cron daily | ✅ KEEP |
| `cleanup-old-thumbnails` | no | Cron weekly | ✅ KEEP |
| `cleanup-old-video-versions` | no | Cron monthly | ✅ KEEP |
| `run-storage-cleanup` | no | Cron weekly | ✅ KEEP |
| `get-video-versions` | no | HTTP | ✅ KEEP |
| `update-version-type` | yes | HTTP | ✅ KEEP |

### Trial Reels

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `create-trial-reel` | yes | HTTP | 🔄 REWORK per corrected trial logic |
| `get-trial-reels` | no | HTTP | 🔄 REWORK |
| `delete-trial-reel` | yes | HTTP | 🔄 REWORK |

### Notifications — In-App / Email

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `notify-internal-review` | no | DB trigger | ✅ KEEP |
| `notify-video-approval` | no | DB trigger | ✅ KEEP |
| `notify-video-feedback` | no | DB trigger | ✅ KEEP |
| `notify-editor-feedback` | no | DB trigger | ✅ KEEP |
| `notify-rough-cut` | no | DB trigger | ✅ KEEP |
| `notify-branding-deck-ready` | no | DB trigger | ✅ KEEP |
| `notify-onboarding-complete` | no | DB trigger | 🔄 MERGE into forms-submission notify |
| `notify-project-editor-assignment` | yes | HTTP | ✅ KEEP |
| `notify-mention` | no | DB trigger | ✅ KEEP — mention opt-out via MENTION_OPT_OUT |
| `notify-thumbnail-decision` | no | DB trigger | ✅ KEEP |
| `notify-trial-request` | no | DB trigger | 🔄 REWORK |
| `notify-upload-failed` | no | DB trigger | ✅ KEEP |
| `notify-studio-booking` | no | DB trigger | ✅ KEEP |
| `notify-talent-interest` | no | DB trigger | 🗑️ DROP — Talent Network removal |
| `send-video-ready-notification` | no | DB trigger | ✅ KEEP — push |
| `send-video-ready-email` | no | DB trigger | ✅ KEEP — switch to Lovable Native Email |
| `send-test-email` | no | HTTP | ✅ KEEP |
| `send-announcement` | no | HTTP | ✅ KEEP |
| `send-archive-notification` | no | DB trigger | ✅ KEEP |
| `send-unarchive-notification` | no | DB trigger | ✅ KEEP |
| `send-pause-notification` | no | DB trigger | ✅ KEEP |
| `send-reactivation-email` | no | DB trigger | ✅ KEEP |
| `send-custom-client-notification` | yes | HTTP | ✅ KEEP |
| `send-admin-client-notification` | no | HTTP | ✅ KEEP |
| `save-push-subscription` | no | HTTP | ✅ KEEP |
| `get-vapid-public-key` | no | HTTP | ✅ KEEP |
| `process-email-queue` | no | Cron 1min | 🔄 REWORK on Lovable Native Email |

### Magic Links & Auth

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `magic-link-login` | no | HTTP | ✅ KEEP |
| `send-client-magic-link` | no | HTTP | ✅ KEEP |
| `send-password-reset` | no | HTTP | ✅ KEEP — 14-char temp password |
| `reset-user-password` | no | HTTP | ✅ KEEP |
| `reset-passwords` | no | HTTP | ✅ KEEP — bulk variant |

### Client / User Management

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `create-client` | yes | HTTP | ✅ KEEP |
| `create-client-webhook` | no | Webhook | 🔄 REWORK as Send-Payment automation hook |
| `create-team-member` | no | HTTP | ✅ KEEP |
| `delete-client-complete` | no | HTTP | ✅ KEEP |
| `delete-team-member` | yes | HTTP | ✅ KEEP |
| `delete-user-complete` | no | HTTP | ✅ KEEP |
| `manage-user-access` | no | HTTP | ✅ KEEP |
| `send-client-credentials` | no | HTTP | ✅ KEEP |
| `send-client-invitation` | no | HTTP | ✅ KEEP |
| `send-deletion-confirmation` | no | HTTP | ✅ KEEP |
| `change-user-role` | yes | HTTP | ✅ KEEP — central role change |

### CRM / Sales

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `receive-lead-webhook` | no | Webhook | ✅ KEEP |
| `receive-partnership-webhook` | no | Webhook | ✅ KEEP |
| `receive-editor-application` | no | Webhook | 🔄 MERGE into forms |
| `receive-agency-metrics` | no | Webhook | ✅ KEEP |
| `sync-calendly-events` | no | Cron hourly | ✅ KEEP |
| `calendly-webhook` | no | Webhook | ✅ KEEP |
| `setup-calendly-webhook` | no | HTTP | ✅ KEEP |
| `create-calendly-link` | no | HTTP | ✅ KEEP |
| `cancel-calendly-event` | no | HTTP | ✅ KEEP |
| `schedule-call-reminders` | no | Cron 15min | ✅ KEEP |
| `fireflies-proxy` | no | HTTP | ✅ KEEP — GraphQL proxy |
| `attio-calls` | no | HTTP | 🗑️ DROP — Attio integration sunset |

### Stripe / Billing

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `stripe-webhook` | no | Webhook | ✅ KEEP — Send-Payment automation core |
| `stripe-sync` | no | Cron 6h | ✅ KEEP |
| `stripe-dashboard-stats` | no | HTTP | ✅ KEEP |
| `stripe-finance-stats` | no | HTTP | ✅ KEEP — Owner-only |
| `apply-stripe-matches` | no | HTTP | ✅ KEEP |
| `preview-stripe-matches` | no | HTTP | ✅ KEEP |

### Public Sharing

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `generate-review-token` | no | HTTP | ✅ KEEP — single video |
| `validate-review-token` | no | HTTP | ✅ KEEP |
| `generate-project-review-token` | no | HTTP | ✅ KEEP — per project |
| `validate-project-review-token` | no | HTTP | ✅ KEEP |
| `resolve-short-link` | no | HTTP | ✅ KEEP |
| `og-metadata` | no | HTTP | ✅ KEEP |

### Slack Integration

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `slack-invite-channel` | no | HTTP | ✅ KEEP |
| `slack-join-channels` | no | HTTP | ✅ KEEP |
| `slack-test-dm` | no | HTTP | ✅ KEEP |

### AI / Studio

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `clips-ai-chat` | no | HTTP | 🔄 REWORK on GPT-5 Mini |
| `auto-fill-foundation` | no | HTTP | 🔄 REWORK on GPT-5 Mini |
| `generate-bio` | no | HTTP | 🔄 REWORK on GPT-5 Mini |
| `optimize-script-section` | no | HTTP | 🔄 REWORK on GPT-5 Mini |
| `regenerate-ai-columns` | yes | HTTP | 🔄 REWORK on GPT-5 Mini |
| `regenerate-caption` | no | HTTP | 🔄 REWORK on GPT-5 Mini |
| `generate-transcript` | yes | HTTP | ✅ KEEP |
| `retry-transcription` | yes | HTTP | ✅ KEEP |
| `process-ai-context-file` | yes | HTTP | ✅ KEEP |
| `scrape-content-vault` | no | HTTP | ✅ KEEP |

### Content & Media

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `get-media-library` | yes | HTTP | ✅ KEEP |
| `delete-media-items` | yes | HTTP | ✅ KEEP |
| `delete-content-data` | yes | HTTP | ✅ KEEP |
| `create-project` | yes | HTTP | ✅ KEEP |

### Talent Network (DROP all)

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `talent-apply` | no | HTTP | 🗑️ DROP |
| `talent-approve` | no | HTTP | 🗑️ DROP |
| `talent-hire` | no | HTTP | 🗑️ DROP |

### OAuth (Meta + future cross-platform)

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `oauth-meta-init` | yes | HTTP | ✅ KEEP + extend for posting |
| `oauth-meta-callback` | no | HTTP | ✅ KEEP |

### Logging / Audit

| Function | JWT | Trigger | Rebuild verdict |
|---|---|---|---|
| `log-activity` | no | HTTP | ✅ KEEP |
| `log-client-error` | no | HTTP | ✅ KEEP |
| `log-login` | no | HTTP | ✅ KEEP |
| `log-upload-event` | no | HTTP | ✅ KEEP |

---

## 6. Database Functions & Triggers (Critical)

The full live database has ~80 functions. The ones below are the **canonical RLS helpers and notification dispatchers** that the rebuild MUST preserve (or replace with an equivalent).

| Function | Purpose | Security Definer | Keep in rebuild |
|---|---|---|---|
| `has_role(uuid, app_role)` | Core RLS role check. Used in every policy. | YES | ✅ KEEP — generalize for modular roles |
| `user_has_client_access(uuid, uuid)` | Client workspace access check. | YES | ✅ KEEP |
| `user_has_shared_project_access(uuid, uuid)` | Cross-workspace shared-project access. | YES | ✅ KEEP |
| `can_access_project(uuid, uuid)` | Project-level access composite. | YES | ✅ KEEP |
| `user_can_access_chat_room(uuid, uuid)` | Chat room access. | YES | ✅ KEEP |
| `user_in_team_room(uuid, uuid)` | Team chat room membership. | YES | ✅ KEEP |
| `user_can_use_team_chat(uuid)` | Eligibility for internal team chat. | YES | ✅ KEEP |
| `editor_has_project_content_assignment(uuid, uuid)` | Editor assignment cascade. | YES | ✅ KEEP — consolidate to single function |
| `get_editors_for_scope(uuid, uuid, uuid)` | Editor list per scope. | YES | ✅ KEEP |
| `get_client_editors(uuid)` | All editors for a client. | YES | ✅ KEEP |
| `handle_new_user()` | Trigger on auth.users insert → profile + default role. | YES | 🔄 REWORK — no auto-role assignment per OAuth security fix |
| `update_updated_at_column()` | Universal updated_at trigger. | — | ✅ KEEP |
| `notify_on_video_status_change()` | DB-trigger notification dispatcher with throttling. | YES | 🔄 REWORK to read from modular notification_rules |
| `notify_on_new_version()` | Notifies clients on new version upload. | YES | ✅ KEEP |
| `notify_on_editor_assignment()` | Notifies editor on assignment. | YES | ✅ KEEP |
| `notify_on_new_chat_message()` | Calls notify-chat-message edge function. | YES | ✅ KEEP |
| `notify_team_on_client_decision()` | Script approval/changes notification. | YES | ✅ KEEP |
| `notify_slack_on_client_decision()` | Slack mirror for script decisions. | YES | ✅ KEEP |
| `enforce_editor_status_restrictions()` | Editor allowed-status trigger. | YES | 🔄 REPLACE with modular status_role_permissions check |
| `validate_video_types()` | Whitelist video types. | YES | 🔄 REPLACE with modular video_types table |
| `auto_assign_interview_id()` | Auto-assign cycle on insert. | YES | 🔄 RENAME interview→cycle |
| `auto_link_client_to_crm_person()` | Backlink client→crm_people on insert. | YES | ✅ KEEP |
| `auto_disqualify_low_revenue_lead()` | Auto-mark <$5k/mo leads disqualified. | YES | ✅ KEEP |
| `snapshot_content_script_version()` | Auto-snapshot script versions. | YES | ✅ KEEP |
| `ensure_single_current_version()` | Single is_current=true per video. | YES | ✅ KEEP |
| `ensure_single_current_thumbnail_version()` | Single current thumbnail. | YES | ✅ KEEP |
| `update_project_progress()` | Recalc % progress on video status change. | YES | ✅ KEEP |
| `update_video_usage()` | Per-month video usage tracking. | YES | ✅ KEEP |
| `complete_client_onboarding(uuid)` | RPC: mark onboarding complete. | YES | 🔄 MERGE into forms |
| `mark_practice_session_booked(uuid)` | RPC: mark practice booked. | YES | ✅ KEEP |
| `mark_script_recording_booked(uuid)` | RPC: mark recording booked. | YES | ✅ KEEP |
| `reset_project_cycle(uuid, text)` | Increment cycle counter (renewal). | YES | ✅ KEEP |
| `get_unread_chat_counts(uuid)` | Per-user unread map for badges. | YES | ✅ KEEP |
| `cleanup_rate_limit_entries()` | Cron purge. | YES | ✅ KEEP |
| `cleanup_old_error_logs()` | Cron purge (30 days). | YES | ✅ KEEP |
| `cleanup_old_activity_logs()` | Cron purge (90 days). | YES | ✅ KEEP |
| `cleanup_expired_comment_attachments()` | Cron purge expired uploads. | YES | ✅ KEEP |
| `generate_short_code()` | Random short-link code. | YES | ✅ KEEP |
| `has_valid_project_review_token(uuid)` | Public token check (project). | YES | ✅ KEEP |
| `has_valid_project_review_token_for_content(uuid)` | Public token check (video via project). | YES | ✅ KEEP |
| `is_studio_published(uuid)` | Studio publish gate. | YES | ✅ KEEP |
| `get_chat_room_participants(uuid)` | Chat room member list. | YES | ✅ KEEP |
| `get_team_room_participants(uuid)` | Team room member list. | YES | ✅ KEEP |
| `get_chat_room_mentionables(uuid)` | Mention search list (chat). | YES | ✅ KEEP |
| `get_team_room_mentionables(uuid)` | Mention search list (team). | YES | ✅ KEEP |
| `get_content_mention_participants(uuid)` | Mention search list (video comments). | YES | ✅ KEEP |
| `add_video_comment(uuid, text, numeric, ...)` | RPC: insert comment. | YES | ✅ KEEP |
| `sync_content_item_r2_from_version()` | Sync R2 URL from current version. | YES | ✅ KEEP |
| `set_document_completed_timestamp()` | Auto-stamp document completion. | YES | ✅ KEEP |
| `update_last_sign_in()` | Track last sign-in on profiles. | YES | ✅ KEEP |
| `set_leads_updated_at()` | Universal updated_at for leads. | YES | ✅ KEEP |
| `create_default_team_thread()` | Auto-create General thread on room create. | YES | ✅ KEEP |
| `add_creator_to_team_room()` | Auto-add creator as member. | YES | ✅ KEEP |
| `bump_chat_room_updated_at()` | Bump room timestamp on new message. | YES | ✅ KEEP |
| `is_chat_room_muted(uuid, uuid)` | Mute check. | YES | ✅ KEEP |
| `get_active_chat_mute(uuid, uuid)` | Active mute row. | YES | ✅ KEEP |
| `user_can_upload_chat_attachment(uuid, uuid)` | Attachment upload gate. | YES | ✅ KEEP |
| `create_onboarding_progress()` | Trigger: seed progress row on user create. | YES | 🔄 MERGE into forms |
| `auto_delete_video_task()` | Trigger: clean tasks on assignment removal. | YES | ✅ KEEP |
| `log_video_status_change()` | Append-only audit on status change. | YES | ✅ KEEP |
| `handle_video_status_notification()` | Compound notification dispatcher. | YES | 🔄 REWORK on modular rules |

---

## 7. Raw SQL Output (information_schema.columns)

Below is the verbatim output of the query you requested. Useful for diff/import/automated processing.

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

```
table_name                               column_name                         data_type                    null  default
----------------------------------------------------------------------------------------------------------------------------------
academy_instagram_metrics                id                                  uuid                         NO    gen_random_uuid()
academy_instagram_metrics                date                                date                         YES   
academy_instagram_metrics                week_start_date                     date                         YES   
academy_instagram_metrics                week_end_date                       date                         YES   
academy_instagram_metrics                accounts_reached                    integer                      NO    0
academy_instagram_metrics                accounts_engaged                    integer                      NO    0
academy_instagram_metrics                likes                               integer                      NO    0
academy_instagram_metrics                comments                            integer                      NO    0
academy_instagram_metrics                saves                               integer                      NO    0
academy_instagram_metrics                shares                              integer                      NO    0
academy_instagram_metrics                website_clicks                      integer                      NO    0
academy_instagram_metrics                total_interactions                  integer                      NO    0
academy_instagram_metrics                total_followers                     integer                      NO    0
academy_instagram_metrics                followers_change                    integer                      NO    0
academy_instagram_metrics                created_at                          timestamp with time zone     NO    now()
academy_instagram_metrics                updated_at                          timestamp with time zone     NO    now()
active_sessions                          id                                  uuid                         NO    gen_random_uuid()
active_sessions                          user_id                             uuid                         NO    
active_sessions                          session_token                       text                         NO    
active_sessions                          ip_address                          text                         YES   
active_sessions                          country                             text                         YES   
active_sessions                          device_type                         text                         YES   
active_sessions                          user_agent                          text                         YES   
active_sessions                          last_active                         timestamp with time zone     NO    now()
active_sessions                          revoked                             boolean                      NO    false
active_sessions                          created_at                          timestamp with time zone     NO    now()
activity_logs                            id                                  uuid                         NO    gen_random_uuid()
activity_logs                            user_id                             uuid                         YES   
activity_logs                            action                              text                         NO    
activity_logs                            category                            text                         NO    
activity_logs                            entity_type                         text                         YES   
activity_logs                            entity_id                           uuid                         YES   
activity_logs                            metadata                            jsonb                        YES   '{}'::jsonb
activity_logs                            ip_address                          text                         YES   
activity_logs                            created_at                          timestamp with time zone     NO    now()
agency_facebook_ads_metrics              id                                  uuid                         NO    gen_random_uuid()
agency_facebook_ads_metrics              campaign_name                       text                         NO    'TCA - UAE'::text
agency_facebook_ads_metrics              spent                               numeric                      NO    0
agency_facebook_ads_metrics              spent_change_percent                integer                      NO    0
agency_facebook_ads_metrics              impressions                         integer                      NO    0
agency_facebook_ads_metrics              impressions_change_percent          integer                      NO    0
agency_facebook_ads_metrics              reach                               integer                      NO    0
agency_facebook_ads_metrics              reach_change_percent                integer                      NO    0
agency_facebook_ads_metrics              link_clicks                         integer                      NO    0
agency_facebook_ads_metrics              link_clicks_change_percent          integer                      NO    0
agency_facebook_ads_metrics              second_calls                        integer                      NO    0
agency_facebook_ads_metrics              leads                               integer                      NO    0
agency_facebook_ads_metrics              leads_change                        integer                      NO    0
agency_facebook_ads_metrics              cpl                                 numeric                      NO    0
agency_facebook_ads_metrics              cpl_change                          numeric                      NO    0
agency_facebook_ads_metrics              performance_status                  text                         NO    'average'::text
agency_facebook_ads_metrics              created_at                          timestamp with time zone     NO    now()
agency_facebook_ads_metrics              updated_at                          timestamp with time zone     NO    now()
agency_facebook_ads_metrics              date                                date                         NO    CURRENT_DATE
agency_instagram_metrics                 id                                  uuid                         NO    gen_random_uuid()
agency_instagram_metrics                 week_start_date                     date                         YES   
agency_instagram_metrics                 week_end_date                       date                         YES   
agency_instagram_metrics                 accounts_reached                    integer                      NO    0
agency_instagram_metrics                 accounts_engaged                    integer                      NO    0
agency_instagram_metrics                 likes                               integer                      NO    0
agency_instagram_metrics                 comments                            integer                      NO    0
agency_instagram_metrics                 saves                               integer                      NO    0
agency_instagram_metrics                 shares                              integer                      NO    0
agency_instagram_metrics                 website_clicks                      integer                      NO    0
agency_instagram_metrics                 total_interactions                  integer                      NO    0
agency_instagram_metrics                 total_followers                     integer                      NO    0
agency_instagram_metrics                 followers_change                    integer                      NO    0
agency_instagram_metrics                 created_at                          timestamp with time zone     NO    now()
agency_instagram_metrics                 updated_at                          timestamp with time zone     NO    now()
agency_instagram_metrics                 date                                date                         YES   
ai_conversations                         id                                  uuid                         NO    gen_random_uuid()
ai_conversations                         user_id                             uuid                         NO    
ai_conversations                         title                               text                         NO    'New Conversation'::text
ai_conversations                         created_at                          timestamp with time zone     NO    now()
ai_conversations                         updated_at                          timestamp with time zone     NO    now()
ai_conversations                         is_pinned                           boolean                      NO    false
ai_conversations                         is_archived                         boolean                      NO    false
ai_conversations                         mode                                text                         NO    'default'::text
ai_messages                              id                                  uuid                         NO    gen_random_uuid()
ai_messages                              conversation_id                     uuid                         NO    
ai_messages                              role                                text                         NO    
ai_messages                              content                             text                         NO    
ai_messages                              created_at                          timestamp with time zone     NO    now()
ai_messages                              metadata                            jsonb                        YES   
ai_messages                              feedback                            text                         YES   
branding_deck_comments                   id                                  uuid                         NO    gen_random_uuid()
branding_deck_comments                   client_id                           uuid                         NO    
branding_deck_comments                   user_id                             uuid                         YES   
branding_deck_comments                   comment                             text                         NO    
branding_deck_comments                   created_at                          timestamp with time zone     YES   now()
branding_deck_comments                   status                              text                         YES   'active'::text
branding_deck_comments                   resolved_at                         timestamp with time zone     YES   
branding_deck_comments                   resolved_by                         uuid                         YES   
calendly_events                          id                                  uuid                         NO    gen_random_uuid()
calendly_events                          calendly_event_uri                  text                         NO    
calendly_events                          event_type_name                     text                         YES   
calendly_events                          start_time                          timestamp with time zone     NO    
calendly_events                          end_time                            timestamp with time zone     NO    
calendly_events                          status                              text                         NO    'active'::text
calendly_events                          invitee_name                        text                         YES   
calendly_events                          invitee_email                       text                         YES   
calendly_events                          invitee_phone                       text                         YES   
calendly_events                          lead_id                             uuid                         YES   
calendly_events                          questions_and_answers               jsonb                        YES   '[]'::jsonb
calendly_events                          location_info                       jsonb                        YES   
calendly_events                          cancellation                        jsonb                        YES   
calendly_events                          raw_payload                         jsonb                        YES   '{}'::jsonb
calendly_events                          created_at                          timestamp with time zone     YES   now()
calendly_events                          updated_at                          timestamp with time zone     YES   now()
calendly_events                          sales_user_id                       uuid                         YES   
calendly_events                          reschedule_url                      text                         YES   
calendly_events                          person_id                           uuid                         YES   
chat_attachments                         id                                  uuid                         NO    gen_random_uuid()
chat_attachments                         message_id                          uuid                         NO    
chat_attachments                         file_url                            text                         NO    
chat_attachments                         file_name                           text                         NO    
chat_attachments                         file_type                           text                         YES   
chat_attachments                         file_size                           bigint                       YES   
chat_attachments                         storage_path                        text                         YES   
chat_attachments                         created_at                          timestamp with time zone     NO    now()
chat_mentions                            id                                  uuid                         NO    gen_random_uuid()
chat_mentions                            message_id                          uuid                         NO    
chat_mentions                            mentioned_user_id                   uuid                         NO    
chat_mentions                            is_read                             boolean                      YES   false
chat_mentions                            created_at                          timestamp with time zone     YES   now()
chat_messages                            id                                  uuid                         NO    gen_random_uuid()
chat_messages                            thread_id                           uuid                         NO    
chat_messages                            sender_id                           uuid                         NO    
chat_messages                            content                             text                         YES   
chat_messages                            message_type                        text                         NO    'text'::text
chat_messages                            is_edited                           boolean                      NO    false
chat_messages                            is_deleted                          boolean                      NO    false
chat_messages                            created_at                          timestamp with time zone     NO    now()
chat_messages                            updated_at                          timestamp with time zone     NO    now()
chat_messages                            attachments                         jsonb                        NO    '[]'::jsonb
chat_mutes                               user_id                             uuid                         NO    
chat_mutes                               room_id                             uuid                         NO    
chat_mutes                               muted_until                         timestamp with time zone     YES   
chat_mutes                               notify_on_mention                   boolean                      NO    true
chat_mutes                               created_at                          timestamp with time zone     NO    now()
chat_reactions                           id                                  uuid                         NO    gen_random_uuid()
chat_reactions                           message_id                          uuid                         NO    
chat_reactions                           user_id                             uuid                         NO    
chat_reactions                           emoji                               text                         NO    
chat_reactions                           created_at                          timestamp with time zone     NO    now()
chat_read_receipts                       id                                  uuid                         NO    gen_random_uuid()
chat_read_receipts                       user_id                             uuid                         NO    
chat_read_receipts                       thread_id                           uuid                         NO    
chat_read_receipts                       last_read_at                        timestamp with time zone     NO    now()
chat_rooms                               id                                  uuid                         NO    gen_random_uuid()
chat_rooms                               client_id                           uuid                         NO    
chat_rooms                               created_at                          timestamp with time zone     NO    now()
chat_rooms                               updated_at                          timestamp with time zone     NO    now()
chat_rooms                               talent_id                           uuid                         YES   
chat_threads                             id                                  uuid                         NO    gen_random_uuid()
chat_threads                             room_id                             uuid                         YES   
chat_threads                             title                               text                         NO    
chat_threads                             created_by                          uuid                         YES   
chat_threads                             created_at                          timestamp with time zone     NO    now()
chat_threads                             updated_at                          timestamp with time zone     NO    now()
chat_threads                             team_room_id                        uuid                         YES   
client_access                            id                                  uuid                         NO    gen_random_uuid()
client_access                            user_id                             uuid                         NO    
client_access                            client_id                           uuid                         NO    
client_access                            created_at                          timestamp with time zone     NO    now()
client_ads_metrics                       id                                  uuid                         NO    gen_random_uuid()
client_ads_metrics                       client_id                           uuid                         NO    
client_ads_metrics                       date                                date                         NO    
client_ads_metrics                       campaign_name                       text                         YES   'Main Campaign'::text
client_ads_metrics                       spent                               numeric                      YES   0
client_ads_metrics                       spent_change_percent                numeric                      YES   0
client_ads_metrics                       impressions                         integer                      YES   0
client_ads_metrics                       impressions_change_percent          numeric                      YES   0
client_ads_metrics                       reach                               integer                      YES   0
client_ads_metrics                       reach_change_percent                numeric                      YES   0
client_ads_metrics                       link_clicks                         integer                      YES   0
client_ads_metrics                       link_clicks_change_percent          numeric                      YES   0
client_ads_metrics                       leads                               integer                      YES   0
client_ads_metrics                       leads_change                        numeric                      YES   0
client_ads_metrics                       cpl                                 numeric                      YES   0
client_ads_metrics                       cpl_change                          numeric                      YES   0
client_ads_metrics                       second_calls                        integer                      YES   0
client_ads_metrics                       performance_status                  text                         YES   'average'::text
client_ads_metrics                       created_at                          timestamp with time zone     YES   now()
client_ads_metrics                       updated_at                          timestamp with time zone     YES   now()
client_api_tokens                        id                                  uuid                         NO    gen_random_uuid()
client_api_tokens                        client_id                           uuid                         NO    
client_api_tokens                        platform                            text                         NO    
client_api_tokens                        access_token                        text                         NO    
client_api_tokens                        refresh_token                       text                         YES   
client_api_tokens                        token_expires_at                    timestamp with time zone     YES   
client_api_tokens                        platform_user_id                    text                         YES   
client_api_tokens                        platform_username                   text                         YES   
client_api_tokens                        scopes                              ARRAY                        YES   
client_api_tokens                        is_valid                            boolean                      YES   true
client_api_tokens                        last_sync_at                        timestamp with time zone     YES   
client_api_tokens                        last_sync_error                     text                         YES   
client_api_tokens                        created_at                          timestamp with time zone     NO    now()
client_api_tokens                        updated_at                          timestamp with time zone     NO    now()
client_api_tokens                        connected_by                        uuid                         YES   
client_audience_avatars                  id                                  uuid                         NO    gen_random_uuid()
client_audience_avatars                  client_id                           uuid                         NO    
client_audience_avatars                  name                                text                         NO    'New Avatar'::text
client_audience_avatars                  emoji                               text                         YES   '🎯'::text
client_audience_avatars                  age_range                           text                         YES   
client_audience_avatars                  location                            text                         YES   
client_audience_avatars                  income                              text                         YES   
client_audience_avatars                  occupation                          text                         YES   
client_audience_avatars                  fears_pains                         ARRAY                        YES   '{}'::text[]
client_audience_avatars                  desires_goals                       ARRAY                        YES   '{}'::text[]
client_audience_avatars                  blockers                            ARRAY                        YES   '{}'::text[]
client_audience_avatars                  phrases                             ARRAY                        YES   '{}'::text[]
client_audience_avatars                  order_index                         integer                      YES   0
client_audience_avatars                  created_at                          timestamp with time zone     YES   now()
client_audience_avatars                  updated_at                          timestamp with time zone     YES   now()
client_automation_metrics                id                                  uuid                         NO    gen_random_uuid()
client_automation_metrics                client_id                           uuid                         NO    
client_automation_metrics                date                                date                         NO    
client_automation_metrics                chats_started                       integer                      YES   0
client_automation_metrics                leads_generated                     integer                      YES   0
client_automation_metrics                qualified_leads                     integer                      YES   0
client_automation_metrics                conversion_rate                     numeric                      YES   0
client_automation_metrics                estimated_revenue                   numeric                      YES   0
client_automation_metrics                avg_response_time_seconds           integer                      YES   0
client_automation_metrics                created_at                          timestamp with time zone     YES   now()
client_automation_metrics                updated_at                          timestamp with time zone     YES   now()
client_bios                              id                                  uuid                         NO    gen_random_uuid()
client_bios                              client_id                           uuid                         NO    
client_bios                              tone                                text                         YES   'professional'::text
client_bios                              instagram_bio                       text                         YES   
client_bios                              tiktok_bio                          text                         YES   
client_bios                              youtube_bio                         text                         YES   
client_bios                              linkedin_bio                        text                         YES   
client_bios                              twitter_bio                         text                         YES   
client_bios                              cta_text                            text                         YES   
client_bios                              cta_link                            text                         YES   
client_bios                              created_at                          timestamp with time zone     YES   now()
client_bios                              updated_at                          timestamp with time zone     YES   now()
client_brain_materials                   id                                  uuid                         NO    gen_random_uuid()
client_brain_materials                   client_id                           uuid                         NO    
client_brain_materials                   material_type                       text                         NO    'sales_call'::text
client_brain_materials                   title                               text                         NO    
client_brain_materials                   file_url                            text                         YES   
client_brain_materials                   file_size                           bigint                       YES   
client_brain_materials                   transcript                          text                         YES   
client_brain_materials                   extracted_insights                  jsonb                        YES   '[]'::jsonb
client_brain_materials                   voice_traits                        ARRAY                        YES   '{}'::text[]
client_brain_materials                   status                              text                         YES   'processing'::text
client_brain_materials                   created_at                          timestamp with time zone     YES   now()
client_brain_materials                   updated_at                          timestamp with time zone     YES   now()
client_credential_assignments            id                                  uuid                         NO    gen_random_uuid()
client_credential_assignments            client_id                           uuid                         NO    
client_credential_assignments            user_id                             uuid                         NO    
client_credential_assignments            assigned_by                         uuid                         YES   
client_credential_assignments            assigned_at                         timestamp with time zone     YES   now()
client_credentials                       id                                  uuid                         NO    gen_random_uuid()
client_credentials                       client_id                           uuid                         NO    
client_credentials                       platform                            text                         NO    
client_credentials                       email_or_username                   text                         NO    
client_credentials                       password                            text                         NO    
client_credentials                       notes                               text                         YES   
client_credentials                       status                              text                         YES   'active'::text
client_credentials                       created_at                          timestamp with time zone     YES   now()
client_credentials                       updated_at                          timestamp with time zone     YES   now()
client_error_logs                        id                                  uuid                         NO    gen_random_uuid()
client_error_logs                        user_id                             uuid                         YES   
client_error_logs                        error_type                          text                         NO    
client_error_logs                        message                             text                         NO    
client_error_logs                        stack_trace                         text                         YES   
client_error_logs                        metadata                            jsonb                        YES   '{}'::jsonb
client_error_logs                        page_url                            text                         YES   
client_error_logs                        user_agent                          text                         YES   
client_error_logs                        created_at                          timestamp with time zone     NO    now()
client_error_logs                        resolved                            boolean                      NO    false
client_error_logs                        resolved_at                         timestamp with time zone     YES   
client_error_logs                        resolved_by                         uuid                         YES   
client_foundation                        id                                  uuid                         NO    gen_random_uuid()
client_foundation                        client_id                           uuid                         NO    
client_foundation                        client_type_tag                     text                         YES   
client_foundation                        full_name                           text                         YES   
client_foundation                        profession_title                    text                         YES   
client_foundation                        professional_bio                    text                         YES   
client_foundation                        personal_bio                        text                         YES   
client_foundation                        three_words                         text                         YES   
client_foundation                        preferred_language                  text                         YES   
client_foundation                        noteworthy_achievements             text                         YES   
client_foundation                        social_media_links                  text                         YES   
client_foundation                        controversial_topic                 text                         YES   
client_foundation                        industry_challenges                 text                         YES   
client_foundation                        target_audience                     text                         YES   
client_foundation                        common_questions                    text                         YES   
client_foundation                        content_inspirations                text                         YES   
client_foundation                        brand_guidelines                    text                         YES   
client_foundation                        self_perception                     text                         YES   
client_foundation                        others_perception                   text                         YES   
client_foundation                        desired_perception                  text                         YES   
client_foundation                        studio_setups                       ARRAY                        YES   '{}'::text[]
client_foundation                        expertise_topics                    ARRAY                        YES   '{}'::text[]
client_foundation                        unique_perspectives                 jsonb                        YES   '[]'::jsonb
client_foundation                        common_misconceptions               jsonb                        YES   '[]'::jsonb
client_foundation                        stats_numbers                       ARRAY                        YES   '{}'::text[]
client_foundation                        testimonials                        ARRAY                        YES   '{}'::text[]
client_foundation                        media_features                      ARRAY                        YES   '{}'::text[]
client_foundation                        created_at                          timestamp with time zone     YES   now()
client_foundation                        updated_at                          timestamp with time zone     YES   now()
client_foundation                        client_type_custom                  text                         YES   
client_hires                             id                                  uuid                         NO    gen_random_uuid()
client_hires                             client_id                           uuid                         NO    
client_hires                             talent_id                           uuid                         NO    
client_hires                             talent_type                         text                         NO    'editor'::text
client_hires                             hired_at                            timestamp with time zone     NO    now()
client_hires                             status                              text                         NO    'active'::text
client_hires                             chat_room_id                        uuid                         YES   
client_hires                             created_at                          timestamp with time zone     NO    now()
client_invitations                       id                                  uuid                         NO    gen_random_uuid()
client_invitations                       client_id                           uuid                         NO    
client_invitations                       email                               text                         NO    
client_invitations                       sent_at                             timestamp with time zone     YES   now()
client_invitations                       opened_at                           timestamp with time zone     YES   
client_invitations                       last_accessed_at                    timestamp with time zone     YES   
client_journey_steps                     id                                  uuid                         NO    gen_random_uuid()
client_journey_steps                     client_id                           uuid                         NO    
client_journey_steps                     step_key                            text                         NO    
client_journey_steps                     completed                           boolean                      NO    false
client_journey_steps                     completed_at                        timestamp with time zone     YES   
client_journey_steps                     completed_by                        uuid                         YES   
client_journey_steps                     notes                               text                         YES   
client_journey_steps                     created_at                          timestamp with time zone     NO    now()
client_journey_steps                     updated_at                          timestamp with time zone     NO    now()
client_members                           id                                  uuid                         NO    gen_random_uuid()
client_members                           client_id                           uuid                         NO    
client_members                           name                                text                         NO    
client_members                           email                               text                         YES   
client_members                           role_title                          text                         YES   
client_members                           project_id                          uuid                         YES   
client_members                           onboarding_doc_url                  text                         YES   
client_members                           created_at                          timestamp with time zone     NO    now()
client_onboarding_progress               id                                  uuid                         NO    gen_random_uuid()
client_onboarding_progress               user_id                             uuid                         NO    
client_onboarding_progress               video_watched                       boolean                      YES   false
client_onboarding_progress               video_watched_at                    timestamp with time zone     YES   
client_onboarding_progress               document_completed                  boolean                      YES   false
client_onboarding_progress               kickoff_call_booked                 boolean                      YES   false
client_onboarding_progress               practice_session_booked             boolean                      YES   false
client_onboarding_progress               studio_selected                     boolean                      YES   false
client_onboarding_progress               strategy_call_booked                boolean                      YES   false
client_onboarding_progress               post_shoot_reviewed                 boolean                      YES   false
client_onboarding_progress               tour_completed                      boolean                      YES   false
client_onboarding_progress               tour_skipped                        boolean                      YES   false
client_onboarding_progress               tour_started_at                     timestamp with time zone     YES   
client_onboarding_progress               tour_completed_at                   timestamp with time zone     YES   
client_onboarding_progress               onboarding_completed                boolean                      YES   false
client_onboarding_progress               onboarding_completed_at             timestamp with time zone     YES   
client_onboarding_progress               created_at                          timestamp with time zone     YES   now()
client_onboarding_progress               updated_at                          timestamp with time zone     YES   now()
client_onboarding_progress               document_completed_at               timestamp with time zone     YES   
client_onboarding_progress               lifestyle_dates_selected            jsonb                        YES   
client_onboarding_progress               lifestyle_location                  text                         YES   
client_onboarding_progress               lifestyle_preferences_notes         text                         YES   
client_onboarding_progress               story_mapping_booked                boolean                      YES   false
client_onboarding_progress               script_recording_booked             boolean                      YES   false
client_organic_metrics                   id                                  uuid                         NO    gen_random_uuid()
client_organic_metrics                   client_id                           uuid                         NO    
client_organic_metrics                   platform                            text                         NO    
client_organic_metrics                   date                                date                         NO    
client_organic_metrics                   week_start_date                     date                         YES   
client_organic_metrics                   week_end_date                       date                         YES   
client_organic_metrics                   accounts_reached                    integer                      YES   0
client_organic_metrics                   accounts_engaged                    integer                      YES   0
client_organic_metrics                   likes                               integer                      YES   0
client_organic_metrics                   comments                            integer                      YES   0
client_organic_metrics                   saves                               integer                      YES   0
client_organic_metrics                   shares                              integer                      YES   0
client_organic_metrics                   website_clicks                      integer                      YES   0
client_organic_metrics                   total_interactions                  integer                      YES   0
client_organic_metrics                   total_followers                     integer                      YES   0
client_organic_metrics                   followers_change                    integer                      YES   0
client_organic_metrics                   created_at                          timestamp with time zone     YES   now()
client_organic_metrics                   updated_at                          timestamp with time zone     YES   now()
client_pillars                           id                                  uuid                         NO    gen_random_uuid()
client_pillars                           client_id                           uuid                         NO    
client_pillars                           content                             jsonb                        YES   '{}'::jsonb
client_pillars                           pillar_distribution                 jsonb                        YES   '[]'::jsonb
client_pillars                           language                            text                         YES   'en'::text
client_pillars                           created_at                          timestamp with time zone     YES   now()
client_pillars                           updated_at                          timestamp with time zone     YES   now()
client_pillars                           pillar_contents                     jsonb                        YES   '{}'::jsonb
client_studio_preferences                id                                  uuid                         NO    gen_random_uuid()
client_studio_preferences                client_id                           uuid                         NO    
client_studio_preferences                studio_id                           uuid                         NO    
client_studio_preferences                created_at                          timestamp with time zone     YES   now()
client_studio_preferences                updated_at                          timestamp with time zone     YES   now()
client_team_assignments                  id                                  uuid                         NO    gen_random_uuid()
client_team_assignments                  client_id                           uuid                         YES   
client_team_assignments                  team_id                             uuid                         YES   
client_team_assignments                  assigned_at                         timestamp with time zone     YES   now()
client_team_assignments                  assigned_by                         uuid                         YES   
client_top_reels                         id                                  uuid                         NO    gen_random_uuid()
client_top_reels                         client_id                           uuid                         NO    
client_top_reels                         platform                            text                         NO    'instagram'::text
client_top_reels                         reel_url                            text                         NO    
client_top_reels                         thumbnail_url                       text                         YES   
client_top_reels                         caption                             text                         YES   
client_top_reels                         views                               bigint                       NO    0
client_top_reels                         likes                               integer                      NO    0
client_top_reels                         comments                            integer                      NO    0
client_top_reels                         shares                              integer                      NO    0
client_top_reels                         saves                               integer                      NO    0
client_top_reels                         posted_at                           timestamp with time zone     YES   
client_top_reels                         period                              text                         YES   '30d'::text
client_top_reels                         created_at                          timestamp with time zone     NO    now()
clients                                  id                                  uuid                         NO    gen_random_uuid()
clients                                  name                                text                         NO    
clients                                  created_at                          timestamp with time zone     NO    now()
clients                                  updated_at                          timestamp with time zone     NO    now()
clients                                  logo_url                            text                         YES   
clients                                  email                               text                         YES   
clients                                  solution_type                       USER-DEFINED                 YES   'custom_deal'::solution_type
clients                                  custom_solution_type                text                         YES   
clients                                  videos_per_month                    integer                      YES   
clients                                  account_status                      USER-DEFINED                 YES   'active'::account_status
clients                                  workspace_token                     text                         YES   (gen_random_uuid())::text
clients                                  notes                               text                         YES   
clients                                  start_date                          date                         YES   CURRENT_DATE
clients                                  default_aspect_ratio                text                         YES   '9:16'::text
clients                                  token_expires_at                    timestamp with time zone     YES   
clients                                  token_created_at                    timestamp with time zone     YES   now()
clients                                  google_drive_url                    text                         YES   
clients                                  google_drive_folder_id              text                         YES   
clients                                  industry                            text                         YES   
clients                                  category                            text                         YES   'tca_client'::text
clients                                  payment_method                      text                         YES   
clients                                  deal_owner_id                       uuid                         YES   
clients                                  calendly_url                        text                         YES   
clients                                  instagram                           text                         YES   
clients                                  phone                               text                         YES   
clients                                  invalid_phone                       text                         YES   
clients                                  facebook                            text                         YES   
clients                                  linkedin                            text                         YES   
clients                                  twitter                             text                         YES   
clients                                  social_link                         text                         YES   
clients                                  angellist                           text                         YES   
clients                                  job_title                           text                         YES   
clients                                  company                             text                         YES   
clients                                  income_range                        text                         YES   
clients                                  goal                                text                         YES   
clients                                  obstacle                            text                         YES   
clients                                  interested_in                       text                         YES   
clients                                  fit                                 text                         YES   
clients                                  location                            text                         YES   
clients                                  primary_location                    text                         YES   
clients                                  description                         text                         YES   
clients                                  associated_deals                    text                         YES   
clients                                  associated_users                    text                         YES   
clients                                  status                              text                         YES   'active'::text
clients                                  onboarding_document_url             text                         YES   
clients                                  slack_channel_url                   text                         YES   
clients                                  token_last_accessed_at              timestamp with time zone     YES   
clients                                  plan_type                           text                         YES   
clients                                  onboarding_completed                boolean                      YES   false
clients                                  onboarding_completed_at             timestamp with time zone     YES   
clients                                  kickoff_call_booked                 boolean                      YES   false
clients                                  practice_session_booked             boolean                      YES   false
clients                                  instagram_account_id                text                         YES   
clients                                  tiktok_account_id                   text                         YES   
clients                                  facebook_ads_account_id             text                         YES   
clients                                  manychat_account_id                 text                         YES   
clients                                  analytics_enabled                   boolean                      YES   false
clients                                  branding_deck_url                   text                         YES   
clients                                  branding_deck_file_path             text                         YES   
clients                                  branding_deck_approved              boolean                      YES   
clients                                  branding_deck_uploaded_at           timestamp with time zone     YES   
clients                                  color_palette                       ARRAY                        YES   '{}'::text[]
clients                                  story_mapping_booked                boolean                      YES   false
clients                                  script_recording_booked             boolean                      YES   false
clients                                  tiktok                              text                         YES   
clients                                  youtube                             text                         YES   
clients                                  client_type                         text                         NO    'individual'::text
clients                                  person_id                           uuid                         YES   
clients                                  stripe_customer_id                  text                         YES   
clients                                  studio_published                    boolean                      NO    false
clients                                  studio_published_at                 timestamp with time zone     YES   
clients                                  studio_published_by                 uuid                         YES   
comment_attachments                      id                                  uuid                         NO    gen_random_uuid()
comment_attachments                      comment_id                          uuid                         NO    
comment_attachments                      storage_path                        text                         NO    
comment_attachments                      file_name                           text                         NO    
comment_attachments                      file_size                           bigint                       YES   
comment_attachments                      content_type                        text                         NO    
comment_attachments                      uploaded_by                         uuid                         YES   
comment_attachments                      created_at                          timestamp with time zone     NO    now()
comment_attachments                      expires_at                          timestamp with time zone     NO    (now() + '14 days'::interval)
content_comments                         id                                  uuid                         NO    gen_random_uuid()
content_comments                         content_id                          uuid                         NO    
content_comments                         user_id                             uuid                         NO    
content_comments                         comment                             text                         NO    
content_comments                         created_at                          timestamp with time zone     NO    now()
content_comments                         updated_at                          timestamp with time zone     NO    now()
content_comments                         context                             text                         YES   'video'::text
content_comments                         status                              text                         NO    'active'::text
content_comments                         resolved_at                         timestamp with time zone     YES   
content_comments                         resolved_by                         uuid                         YES   
content_comments                         version_id                          uuid                         YES   
content_comments                         parent_comment_id                   uuid                         YES   
content_ideas                            id                                  uuid                         NO    gen_random_uuid()
content_ideas                            client_id                           uuid                         NO    
content_ideas                            title                               text                         NO    'New Idea'::text
content_ideas                            description                         text                         YES   ''::text
content_ideas                            pillar                              text                         NO    'reach'::text
content_ideas                            status                              text                         NO    'idea'::text
content_ideas                            source                              text                         NO    'agency'::text
content_ideas                            upvotes                             integer                      NO    0
content_ideas                            created_at                          timestamp with time zone     NO    now()
content_ideas                            updated_at                          timestamp with time zone     NO    now()
content_items                            id                                  uuid                         NO    gen_random_uuid()
content_items                            client_id                           uuid                         NO    
content_items                            interview_id                        uuid                         YES   
content_items                            post_date                           date                         YES   
content_items                            priority                            USER-DEFINED                 NO    'medium'::content_priority
content_items                            video_title                         text                         NO    
content_items                            statuses                            ARRAY                        YES   ARRAY[]::content_status[]
content_items                            rough_cut_link                      text                         YES   
content_items                            ready_video_link                    text                         YES   
content_items                            types                               ARRAY                        YES   ARRAY[]::content_type[]
content_items                            caption                             text                         YES   
content_items                            thumbnail_link                      text                         YES   
content_items                            notes                               text                         YES   
content_items                            created_at                          timestamp with time zone     NO    now()
content_items                            updated_at                          timestamp with time zone     NO    now()
content_items                            created_by                          uuid                         YES   
content_items                            aspect_ratio                        text                         YES   '9:16'::text
content_items                            custom_width                        integer                      YES   
content_items                            custom_height                       integer                      YES   
content_items                            project_id                          uuid                         YES   
content_items                            interview_section                   text                         YES   'all'::text
content_items                            order_index                         integer                      YES   0
content_items                            transcript                          text                         YES   
content_items                            status                              USER-DEFINED                 NO    'not_started'::unified_status
content_items                            editors                             ARRAY                        YES   ARRAY[]::uuid[]
content_items                            caption_approved                    boolean                      YES   false
content_items                            thumbnail_approved                  boolean                      YES   false
content_items                            thumbnail_revision_notes            text                         YES   
content_items                            caption_context                     text                         YES   
content_items                            video_cloudflare_id                 text                         YES   
content_items                            video_playback_url                  text                         YES   
content_items                            video_thumbnail_url                 text                         YES   
content_items                            video_file_name                     text                         YES   
content_items                            video_file_size                     bigint                       YES   
content_items                            video_duration                      integer                      YES   
content_items                            video_width                         integer                      YES   
content_items                            video_height                        integer                      YES   
content_items                            video_upload_status                 text                         YES   'pending'::text
content_items                            video_upload_progress               integer                      YES   0
content_items                            video_error_message                 text                         YES   
content_items                            video_uploaded_at                   timestamp with time zone     YES   
content_items                            video_uploaded_by                   uuid                         YES   
content_items                            video_cloudflare_folder             text                         YES   
content_items                            video_organized_name                text                         YES   
content_items                            video_upload_session_url            text                         YES   
content_items                            video_chunks_uploaded               integer                      YES   0
content_items                            video_total_chunks                  integer                      YES   
content_items                            video_bytes_uploaded                bigint                       YES   0
content_items                            video_upload_started_at             timestamp with time zone     YES   
content_items                            video_upload_completed_at           timestamp with time zone     YES   
content_items                            video_current_upload_phase          text                         YES   
content_items                            video_original_url                  text                         YES   
content_items                            video_original_storage_path         text                         YES   
content_items                            thumbnail_storage_path              text                         YES   
content_items                            transcription_status                text                         YES   'pending'::text
content_items                            transcription_error                 text                         YES   
content_items                            transcription_started_at            timestamp with time zone     YES   
content_items                            transcription_completed_at          timestamp with time zone     YES   
content_items                            transcription_retry_count           integer                      YES   0
content_items                            caption_status                      text                         YES   'pending'::text
content_items                            detected_language                   text                         YES   
content_items                            detected_dialect                    text                         YES   
content_items                            freebie_word                        text                         YES   
content_items                            freebie_content                     text                         YES   
content_items                            text_hook                           text                         YES   
content_items                            thumbnail_text                      text                         YES   
content_items                            r2_upload_source                    text                         YES   
content_items                            trial_date                          text                         YES   
content_script_versions                  id                                  uuid                         NO    gen_random_uuid()
content_script_versions                  script_id                           uuid                         NO    
content_script_versions                  client_id                           uuid                         NO    
content_script_versions                  version_number                      integer                      NO    
content_script_versions                  title                               text                         YES   
content_script_versions                  hook                                text                         YES   
content_script_versions                  body                                text                         YES   
content_script_versions                  cta                                 text                         YES   
content_script_versions                  pillar                              text                         YES   
content_script_versions                  status                              text                         YES   
content_script_versions                  avatar_id                           uuid                         YES   
content_script_versions                  saved_by                            uuid                         YES   
content_script_versions                  saved_by_role                       text                         YES   
content_script_versions                  created_at                          timestamp with time zone     NO    now()
content_scripts                          id                                  uuid                         NO    gen_random_uuid()
content_scripts                          session_id                          uuid                         NO    
content_scripts                          client_id                           uuid                         NO    
content_scripts                          title                               text                         NO    'Untitled Script'::text
content_scripts                          hook                                text                         YES   ''::text
content_scripts                          body                                text                         YES   ''::text
content_scripts                          cta                                 text                         YES   ''::text
content_scripts                          pillar                              text                         NO    'reach'::text
content_scripts                          status                              text                         NO    'draft'::text
content_scripts                          avatar_id                           uuid                         YES   
content_scripts                          order_index                         integer                      NO    0
content_scripts                          created_at                          timestamp with time zone     NO    now()
content_scripts                          updated_at                          timestamp with time zone     NO    now()
content_scripts                          filmed                              boolean                      NO    false
content_scripts                          client_decision                     text                         YES   
content_scripts                          client_decision_note                text                         YES   
content_scripts                          client_decision_at                  timestamp with time zone     YES   
content_sessions                         id                                  uuid                         NO    gen_random_uuid()
content_sessions                         client_id                           uuid                         NO    
content_sessions                         name                                text                         NO    'New Session'::text
content_sessions                         order_index                         integer                      NO    0
content_sessions                         created_at                          timestamp with time zone     NO    now()
content_sessions                         updated_at                          timestamp with time zone     NO    now()
content_vault                            id                                  uuid                         NO    gen_random_uuid()
content_vault                            client_id                           uuid                         NO    
content_vault                            creator_handle                      text                         NO    
content_vault                            url                                 text                         YES   
content_vault                            platform                            text                         NO    'ig_reels'::text
content_vault                            niche                               text                         YES   
content_vault                            views                               text                         YES   
content_vault                            likes                               text                         YES   
content_vault                            pillar                              text                         NO    'reach'::text
content_vault                            created_at                          timestamp with time zone     NO    now()
content_vault                            updated_at                          timestamp with time zone     NO    now()
content_versions                         id                                  uuid                         NO    gen_random_uuid()
content_versions                         content_id                          uuid                         NO    
content_versions                         version_number                      integer                      NO    1
content_versions                         video_cloudflare_id                 text                         YES   
content_versions                         video_playback_url                  text                         YES   
content_versions                         video_thumbnail_url                 text                         YES   
content_versions                         video_file_name                     text                         YES   
content_versions                         video_file_size                     bigint                       YES   
content_versions                         video_duration                      integer                      YES   
content_versions                         video_width                         integer                      YES   
content_versions                         video_height                        integer                      YES   
content_versions                         video_original_url                  text                         YES   
content_versions                         video_original_storage_path         text                         YES   
content_versions                         uploaded_at                         timestamp with time zone     YES   now()
content_versions                         uploaded_by                         uuid                         YES   
content_versions                         version_notes                       text                         YES   
content_versions                         is_current                          boolean                      YES   true
content_versions                         transcript                          text                         YES   
content_versions                         created_at                          timestamp with time zone     YES   now()
content_versions                         video_upload_session_url            text                         YES   
content_versions                         video_upload_status                 text                         YES   'pending'::text
content_versions                         video_upload_progress               integer                      YES   0
content_versions                         video_total_chunks                  integer                      YES   
content_versions                         video_bytes_uploaded                bigint                       YES   0
content_versions                         video_chunks_uploaded               integer                      YES   0
content_versions                         version_type                        text                         NO    'intermediate'::text
content_versions                         updated_at                          timestamp with time zone     YES   now()
content_versions                         custom_version_label                text                         YES   
content_versions                         r2_upload_source                    text                         YES   
credential_assignments                   id                                  uuid                         NO    gen_random_uuid()
credential_assignments                   credential_id                       uuid                         NO    
credential_assignments                   user_id                             uuid                         NO    
credential_assignments                   assigned_by                         uuid                         YES   
credential_assignments                   assigned_at                         timestamp with time zone     YES   now()
credential_audit_log                     id                                  uuid                         NO    gen_random_uuid()
credential_audit_log                     credential_id                       uuid                         YES   
credential_audit_log                     action                              text                         NO    
credential_audit_log                     performed_by                        uuid                         YES   
credential_audit_log                     performed_at                        timestamp with time zone     YES   now()
credential_audit_log                     details                             jsonb                        YES   
crm_companies                            id                                  uuid                         NO    gen_random_uuid()
crm_companies                            attio_record_id                     text                         YES   
crm_companies                            name                                text                         NO    
crm_companies                            categories                          ARRAY                        YES   
crm_companies                            last_interaction_at                 timestamp with time zone     YES   
crm_companies                            linkedin_url                        text                         YES   
crm_companies                            instagram_url                       text                         YES   
crm_companies                            domain                              text                         YES   
crm_companies                            description                         text                         YES   
crm_companies                            team_phone                          text                         YES   
crm_companies                            team_country                        text                         YES   
crm_companies                            created_at                          timestamp with time zone     YES   now()
crm_companies                            updated_at                          timestamp with time zone     YES   now()
crm_deal_options                         id                                  uuid                         NO    gen_random_uuid()
crm_deal_options                         category                            text                         NO    
crm_deal_options                         value                               text                         NO    
crm_deal_options                         label                               text                         NO    
crm_deal_options                         color                               text                         YES   
crm_deal_options                         order_index                         integer                      NO    0
crm_deal_options                         is_active                           boolean                      NO    true
crm_deal_options                         created_at                          timestamp with time zone     NO    now()
crm_deal_options                         updated_at                          timestamp with time zone     NO    now()
crm_deals                                id                                  uuid                         NO    gen_random_uuid()
crm_deals                                attio_record_id                     text                         YES   
crm_deals                                name                                text                         NO    
crm_deals                                stage                               text                         NO    'no_stage'::text
crm_deals                                plan                                text                         YES   
crm_deals                                total_videos                        numeric                      YES   
crm_deals                                payment_method                      text                         YES   
crm_deals                                deal_owner                          text                         YES   
crm_deals                                person_id                           uuid                         YES   
crm_deals                                next_due_date                       timestamp with time zone     YES   
crm_deals                                stage_order                         integer                      YES   
crm_deals                                created_at                          timestamp with time zone     YES   now()
crm_deals                                updated_at                          timestamp with time zone     YES   now()
crm_deals                                region                              text                         YES   'UAE & Gulf'::text
crm_editors                              id                                  uuid                         NO    gen_random_uuid()
crm_editors                              attio_record_id                     text                         YES   
crm_editors                              full_name                           text                         NO    
crm_editors                              email                               text                         YES   
crm_editors                              phone                               text                         YES   
crm_editors                              location                            text                         YES   
crm_editors                              portfolio_url                       text                         YES   
crm_editors                              sample_link_url                     text                         YES   
crm_editors                              notes                               text                         YES   
crm_editors                              submission_date                     timestamp with time zone     YES   
crm_editors                              languages                           ARRAY                        YES   
crm_editors                              software_fluency                    ARRAY                        YES   
crm_editors                              created_at                          timestamp with time zone     YES   now()
crm_editors                              updated_at                          timestamp with time zone     YES   now()
crm_editors                              person_id                           uuid                         YES   
crm_editors                              role_applied                        text                         YES   
crm_editors                              video_intro_url                     text                         YES   
crm_editors                              resume_url                          text                         YES   
crm_editors                              metadata                            jsonb                        YES   '{}'::jsonb
crm_people                               id                                  uuid                         NO    gen_random_uuid()
crm_people                               attio_record_id                     text                         YES   
crm_people                               full_name                           text                         NO    
crm_people                               email                               text                         YES   
crm_people                               job_title                           text                         YES   
crm_people                               phone                               text                         YES   
crm_people                               invalid_phone_note                  text                         YES   
crm_people                               social_link                         text                         YES   
crm_people                               company_id                          uuid                         YES   
crm_people                               income_range                        text                         YES   
crm_people                               goal                                text                         YES   
crm_people                               obstacle                            text                         YES   
crm_people                               description                         text                         YES   
crm_people                               deal_stage                          text                         YES   
crm_people                               client_status                       text                         YES   
crm_people                               payment_link                        text                         YES   
crm_people                               active                              boolean                      YES   true
crm_people                               first_calendar_at                   timestamp with time zone     YES   
crm_people                               last_calendar_at                    timestamp with time zone     YES   
crm_people                               created_at                          timestamp with time zone     YES   now()
crm_people                               updated_at                          timestamp with time zone     YES   now()
crm_people                               instagram                           text                         YES   
crm_people                               facebook                            text                         YES   
crm_people                               location                            text                         YES   
crm_people                               country                             text                         YES   
crm_people                               city                                text                         YES   
crm_people                               fit                                 text                         YES   
crm_people                               interested_in                       text                         YES   
crm_people                               source                              text                         YES   'attio'::text
crm_people                               company_name                        text                         YES   
crm_people                               notes                               text                         YES   
crm_people                               assigned_to                         uuid                         YES   
custom_columns                           id                                  uuid                         NO    gen_random_uuid()
custom_columns                           project_id                          uuid                         YES   
custom_columns                           column_name                         text                         NO    
custom_columns                           column_type                         text                         NO    
custom_columns                           options                             jsonb                        YES   
custom_columns                           default_value                       text                         YES   
custom_columns                           is_required                         boolean                      YES   false
custom_columns                           show_in_new_form                    boolean                      YES   true
custom_columns                           show_in_edit_form                   boolean                      YES   true
custom_columns                           allow_inline_edit                   boolean                      YES   true
custom_columns                           show_in_table                       boolean                      YES   true
custom_columns                           description                         text                         YES   
custom_columns                           width_px                            integer                      YES   150
custom_columns                           order_index                         integer                      YES   0
custom_columns                           created_at                          timestamp with time zone     YES   now()
custom_columns                           updated_at                          timestamp with time zone     YES   now()
custom_field_values                      id                                  uuid                         NO    gen_random_uuid()
custom_field_values                      content_id                          uuid                         YES   
custom_field_values                      column_id                           uuid                         YES   
custom_field_values                      value                               text                         YES   
custom_field_values                      created_at                          timestamp with time zone     YES   now()
custom_field_values                      updated_at                          timestamp with time zone     YES   now()
custom_journey_steps                     id                                  uuid                         NO    gen_random_uuid()
custom_journey_steps                     step_key                            text                         NO    
custom_journey_steps                     name                                text                         NO    
custom_journey_steps                     client_description                  text                         YES   
custom_journey_steps                     default_visibility                  text                         NO    'client'::text
custom_journey_steps                     default_roles                       ARRAY                        YES   '{}'::text[]
custom_journey_steps                     has_call                            boolean                      NO    false
custom_journey_steps                     calendly_type                       text                         YES   
custom_journey_steps                     has_approval                        boolean                      NO    false
custom_journey_steps                     component_key                       text                         YES   
custom_journey_steps                     created_by                          uuid                         YES   
custom_journey_steps                     created_at                          timestamp with time zone     NO    now()
custom_journey_steps                     updated_at                          timestamp with time zone     NO    now()
default_settings                         id                                  uuid                         NO    gen_random_uuid()
default_settings                         setting_key                         text                         NO    
default_settings                         setting_value                       jsonb                        NO    
default_settings                         created_at                          timestamp with time zone     YES   now()
default_settings                         updated_at                          timestamp with time zone     YES   now()
download_logs                            id                                  uuid                         NO    gen_random_uuid()
download_logs                            user_id                             uuid                         YES   
download_logs                            content_item_id                     uuid                         YES   
download_logs                            version_id                          uuid                         YES   
download_logs                            client_id                           uuid                         YES   
download_logs                            filename                            text                         YES   
download_logs                            source                              text                         NO    
download_logs                            cloudflare_video_id                 text                         YES   
download_logs                            ip_address                          text                         YES   
download_logs                            user_agent                          text                         YES   
download_logs                            metadata                            jsonb                        YES   '{}'::jsonb
download_logs                            created_at                          timestamp with time zone     NO    now()
editor_goals                             id                                  uuid                         NO    gen_random_uuid()
editor_goals                             editor_id                           uuid                         YES   
editor_goals                             monthly_goal                        integer                      NO    40
editor_goals                             updated_by                          uuid                         YES   
editor_goals                             updated_at                          timestamp with time zone     NO    now()
email_campaign_recipients                id                                  uuid                         NO    gen_random_uuid()
email_campaign_recipients                campaign_id                         uuid                         NO    
email_campaign_recipients                email                               text                         NO    
email_campaign_recipients                name                                text                         YES   
email_campaign_recipients                status                              text                         NO    'queued'::text
email_campaign_recipients                created_at                          timestamp with time zone     NO    now()
email_campaigns                          id                                  uuid                         NO    gen_random_uuid()
email_campaigns                          subject                             text                         NO    
email_campaigns                          headline                            text                         YES   
email_campaigns                          body                                text                         NO    
email_campaigns                          cta_text                            text                         YES   
email_campaigns                          cta_url                             text                         YES   
email_campaigns                          audience                            text                         NO    
email_campaigns                          recipient_count                     integer                      NO    0
email_campaigns                          sent_at                             timestamp with time zone     YES   
email_campaigns                          scheduled_for                       timestamp with time zone     YES   
email_campaigns                          status                              text                         NO    'sent'::text
email_campaigns                          rendered_html                       text                         YES   
email_campaigns                          created_by                          uuid                         YES   
email_campaigns                          created_at                          timestamp with time zone     NO    now()
email_logs                               id                                  uuid                         NO    gen_random_uuid()
email_logs                               recipient_email                     text                         NO    
email_logs                               recipient_user_id                   uuid                         YES   
email_logs                               email_type                          text                         NO    
email_logs                               subject                             text                         NO    
email_logs                               status                              text                         NO    'pending'::text
email_logs                               error_message                       text                         YES   
email_logs                               metadata                            jsonb                        YES   '{}'::jsonb
email_logs                               sent_at                             timestamp with time zone     YES   
email_logs                               retry_count                         integer                      YES   0
email_logs                               last_retry_at                       timestamp with time zone     YES   
email_logs                               created_at                          timestamp with time zone     YES   now()
email_logs                               updated_at                          timestamp with time zone     YES   now()
email_queue                              id                                  uuid                         NO    gen_random_uuid()
email_queue                              recipient_email                     text                         NO    
email_queue                              recipient_name                      text                         YES   
email_queue                              subject                             text                         NO    
email_queue                              html_body                           text                         NO    
email_queue                              from_address                        text                         NO    'The Clips Platform <mail@app.theclip...
email_queue                              reply_to                            text                         YES   'mail@app.theclips.agency'::text
email_queue                              status                              text                         NO    'pending'::text
email_queue                              priority                            integer                      NO    3
email_queue                              attempts                            integer                      NO    0
email_queue                              max_attempts                        integer                      NO    3
email_queue                              last_error                          text                         YES   
email_queue                              scheduled_at                        timestamp with time zone     NO    now()
email_queue                              sent_at                             timestamp with time zone     YES   
email_queue                              created_at                          timestamp with time zone     NO    now()
email_queue                              updated_at                          timestamp with time zone     NO    now()
email_queue                              metadata                            jsonb                        YES   '{}'::jsonb
email_templates                          id                                  uuid                         NO    gen_random_uuid()
email_templates                          name                                text                         NO    
email_templates                          subject                             text                         NO    
email_templates                          headline                            text                         YES   
email_templates                          body                                text                         NO    
email_templates                          cta_text                            text                         YES   
email_templates                          cta_url                             text                         YES   
email_templates                          created_by                          uuid                         YES   
email_templates                          created_at                          timestamp with time zone     NO    now()
email_templates                          updated_at                          timestamp with time zone     NO    now()
finance_transactions                     id                                  uuid                         NO    gen_random_uuid()
finance_transactions                     client_id                           uuid                         NO    
finance_transactions                     amount                              numeric                      NO    
finance_transactions                     transaction_type                    text                         NO    
finance_transactions                     payment_status                      text                         NO    'pending'::text
finance_transactions                     payment_date                        date                         YES   
finance_transactions                     payment_method                      text                         YES   
finance_transactions                     stripe_payment_id                   text                         YES   
finance_transactions                     notes                               text                         YES   
finance_transactions                     created_at                          timestamp with time zone     NO    now()
finance_transactions                     updated_at                          timestamp with time zone     NO    now()
follow_ups                               id                                  uuid                         NO    gen_random_uuid()
follow_ups                               created_at                          timestamp with time zone     NO    now()
follow_ups                               updated_at                          timestamp with time zone     NO    now()
follow_ups                               title                               text                         NO    
follow_ups                               notes                               text                         YES   
follow_ups                               due_at                              timestamp with time zone     NO    
follow_ups                               status                              text                         YES   'pending'::text
follow_ups                               priority                            text                         YES   'medium'::text
follow_ups                               lead_id                             uuid                         YES   
follow_ups                               calendly_event_id                   text                         YES   
follow_ups                               assigned_to                         uuid                         YES   
follow_ups                               completed_at                        timestamp with time zone     YES   
follow_ups                               person_id                           uuid                         YES   
hooks_library                            id                                  uuid                         NO    gen_random_uuid()
hooks_library                            client_id                           uuid                         NO    
hooks_library                            text                                text                         NO    
hooks_library                            pillar                              text                         NO    'reach'::text
hooks_library                            hook_type                           text                         NO    'value'::text
hooks_library                            niche                               text                         YES   
hooks_library                            strength                            integer                      YES   5
hooks_library                            created_at                          timestamp with time zone     NO    now()
hooks_library                            updated_at                          timestamp with time zone     NO    now()
internal_credentials                     id                                  uuid                         NO    gen_random_uuid()
internal_credentials                     account_owner                       text                         NO    
internal_credentials                     platform                            text                         NO    
internal_credentials                     username                            text                         NO    
internal_credentials                     password                            text                         NO    
internal_credentials                     status                              text                         YES   'active'::text
internal_credentials                     notes                               text                         YES   
internal_credentials                     category                            text                         YES   
internal_credentials                     created_by                          uuid                         YES   
internal_credentials                     created_at                          timestamp with time zone     YES   now()
internal_credentials                     updated_at                          timestamp with time zone     YES   now()
interviews                               id                                  uuid                         NO    gen_random_uuid()
interviews                               client_id                           uuid                         NO    
interviews                               name                                text                         NO    
interviews                               order_index                         integer                      NO    
interviews                               created_at                          timestamp with time zone     NO    now()
interviews                               project_id                          uuid                         YES   
interviews                               is_backlog                          boolean                      YES   false
leads                                    id                                  uuid                         NO    gen_random_uuid()
leads                                    created_at                          timestamp with time zone     NO    now()
leads                                    updated_at                          timestamp with time zone     NO    now()
leads                                    first_name                          text                         NO    
leads                                    last_name                           text                         NO    
leads                                    email                               text                         NO    
leads                                    phone                               text                         YES   
leads                                    social_username                     text                         YES   
leads                                    business_type                       text                         YES   
leads                                    monthly_income_range                text                         YES   
leads                                    goals_objectives                    text                         YES   
leads                                    obstacles                           text                         YES   
leads                                    call_attendance_confirmation        boolean                      NO    false
leads                                    status                              text                         NO    'new'::text
leads                                    assigned_to                         uuid                         YES   
leads                                    notes                               text                         YES   
leads                                    raw_payload                         jsonb                        NO    '{}'::jsonb
leads                                    follow_up_at                        timestamp with time zone     YES   
leads                                    country                             text                         YES   
leads                                    content_language                    text                         YES   
leads                                    is_qualified                        boolean                      NO    true
leads                                    person_id                           uuid                         YES   
leads_custom_columns                     id                                  uuid                         NO    gen_random_uuid()
leads_custom_columns                     created_by                          uuid                         NO    
leads_custom_columns                     column_name                         text                         NO    
leads_custom_columns                     column_type                         text                         NO    'text'::text
leads_custom_columns                     order_index                         integer                      NO    0
leads_custom_columns                     created_at                          timestamp with time zone     NO    now()
leads_saved_views                        id                                  uuid                         NO    gen_random_uuid()
leads_saved_views                        user_id                             uuid                         NO    
leads_saved_views                        view_name                           text                         NO    
leads_saved_views                        column_config                       jsonb                        NO    '[]'::jsonb
leads_saved_views                        is_default                          boolean                      NO    false
leads_saved_views                        created_at                          timestamp with time zone     NO    now()
leads_saved_views                        updated_at                          timestamp with time zone     NO    now()
login_history                            id                                  uuid                         NO    gen_random_uuid()
login_history                            user_id                             uuid                         YES   
login_history                            email                               text                         NO    
login_history                            ip_address                          text                         YES   
login_history                            country                             text                         YES   
login_history                            city                                text                         YES   
login_history                            user_agent                          text                         YES   
login_history                            device_type                         text                         YES   
login_history                            login_method                        text                         YES   
login_history                            success                             boolean                      NO    true
login_history                            created_at                          timestamp with time zone     NO    now()
notification_preferences                 id                                  uuid                         NO    gen_random_uuid()
notification_preferences                 user_id                             uuid                         NO    
notification_preferences                 notification_type                   text                         NO    
notification_preferences                 email_enabled                       boolean                      NO    true
notification_preferences                 push_enabled                        boolean                      NO    true
notification_preferences                 in_app_enabled                      boolean                      NO    true
notification_preferences                 created_at                          timestamp with time zone     NO    now()
notification_preferences                 updated_at                          timestamp with time zone     NO    now()
notifications                            id                                  uuid                         NO    gen_random_uuid()
notifications                            user_id                             uuid                         NO    
notifications                            title                               text                         NO    
notifications                            message                             text                         NO    
notifications                            type                                USER-DEFINED                 NO    'info'::notification_type
notifications                            read                                boolean                      NO    false
notifications                            link                                text                         YES   
notifications                            created_at                          timestamp with time zone     NO    now()
notifications                            priority                            USER-DEFINED                 NO    'normal'::notification_priority
onboarding_documents                     id                                  uuid                         NO    gen_random_uuid()
onboarding_documents                     client_id                           uuid                         NO    
onboarding_documents                     brand_name                          text                         NO    
onboarding_documents                     industry                            text                         YES   
onboarding_documents                     website_url                         text                         YES   
onboarding_documents                     instagram_handle                    text                         YES   
onboarding_documents                     tiktok_handle                       text                         YES   
onboarding_documents                     youtube_handle                      text                         YES   
onboarding_documents                     target_audience                     text                         NO    
onboarding_documents                     audience_problems                   text                         YES   
onboarding_documents                     content_pillars                     jsonb                        YES   '[]'::jsonb
onboarding_documents                     content_goals                       jsonb                        YES   '[]'::jsonb
onboarding_documents                     example_videos                      jsonb                        YES   '[]'::jsonb
onboarding_documents                     story_narratives                    text                         YES   
onboarding_documents                     highlight_types                     jsonb                        YES   '[]'::jsonb
onboarding_documents                     preferred_style                     text                         YES   
onboarding_documents                     posting_method                      text                         YES   'client'::text
onboarding_documents                     social_credentials                  jsonb                        YES   
onboarding_documents                     additional_notes                    text                         YES   
onboarding_documents                     completed                           boolean                      YES   false
onboarding_documents                     completed_at                        timestamp with time zone     YES   
onboarding_documents                     created_at                          timestamp with time zone     YES   now()
onboarding_documents                     updated_at                          timestamp with time zone     YES   now()
onboarding_documents                     full_name                           text                         YES   
onboarding_documents                     profession_title                    text                         YES   
onboarding_documents                     professional_bio                    text                         YES   
onboarding_documents                     personal_bio                        text                         YES   
onboarding_documents                     three_words                         text                         YES   
onboarding_documents                     preferred_language                  text                         YES   
onboarding_documents                     achievements                        text                         YES   
onboarding_documents                     social_media_links                  text                         YES   
onboarding_documents                     key_topics                          text                         YES   
onboarding_documents                     unique_perspectives                 text                         YES   
onboarding_documents                     recent_developments                 text                         YES   
onboarding_documents                     controversial_topics                text                         YES   
onboarding_documents                     challenges_solutions                text                         YES   
onboarding_documents                     audience_faqs                       text                         YES   
onboarding_documents                     inspirational_content               text                         YES   
onboarding_documents                     brand_guideline_reference           text                         YES   
onboarding_documents                     self_perception                     text                         YES   
onboarding_documents                     others_perception                   text                         YES   
onboarding_documents                     desired_perception                  text                         YES   
partnership_applications                 id                                  uuid                         NO    gen_random_uuid()
partnership_applications                 person_id                           uuid                         YES   
partnership_applications                 name                                text                         NO    
partnership_applications                 email                               text                         NO    
partnership_applications                 phone                               text                         YES   
partnership_applications                 location                            text                         YES   
partnership_applications                 languages                           text                         YES   
partnership_applications                 role                                text                         YES   
partnership_applications                 target_audience                     text                         YES   
partnership_applications                 experience_years                    text                         YES   
partnership_applications                 portfolio_link                      text                         YES   
partnership_applications                 best_pieces                         text                         YES   
partnership_applications                 client_accounts                     text                         YES   
partnership_applications                 has_paying_clients                  boolean                      YES   false
partnership_applications                 has_sold_service                    boolean                      YES   false
partnership_applications                 sold_service_explanation            text                         YES   
partnership_applications                 status                              text                         NO    'new'::text
partnership_applications                 created_at                          timestamp with time zone     NO    now()
partnership_applications                 updated_at                          timestamp with time zone     NO    now()
password_reset_tokens                    id                                  uuid                         NO    gen_random_uuid()
password_reset_tokens                    user_id                             uuid                         NO    
password_reset_tokens                    token                               text                         NO    
password_reset_tokens                    expires_at                          timestamp with time zone     NO    
password_reset_tokens                    used                                boolean                      YES   false
password_reset_tokens                    created_at                          timestamp with time zone     YES   now()
preview_sessions                         id                                  uuid                         NO    gen_random_uuid()
preview_sessions                         admin_user_id                       uuid                         NO    
preview_sessions                         target_type                         text                         NO    
preview_sessions                         target_id                           uuid                         NO    
preview_sessions                         target_name                         text                         YES   
preview_sessions                         target_role                         text                         YES   
preview_sessions                         started_at                          timestamp with time zone     NO    now()
preview_sessions                         ended_at                            timestamp with time zone     YES   
preview_sessions                         user_agent                          text                         YES   
preview_sessions                         created_at                          timestamp with time zone     NO    now()
profiles                                 id                                  uuid                         NO    
profiles                                 email                               text                         NO    
profiles                                 full_name                           text                         YES   
profiles                                 created_at                          timestamp with time zone     NO    now()
profiles                                 updated_at                          timestamp with time zone     NO    now()
profiles                                 requires_password_change            boolean                      YES   false
profiles                                 first_login                         boolean                      YES   true
profiles                                 password_changed_at                 timestamp with time zone     YES   
profiles                                 avatar_url                          text                         YES   
profiles                                 phone_number                        text                         YES   
profiles                                 job_title                           text                         YES   
profiles                                 bio                                 text                         YES   
profiles                                 time_zone                           text                         YES   'America/New_York'::text
profiles                                 last_sign_in_at                     timestamp with time zone     YES   
profiles                                 dashboard_preferences               jsonb                        YES   '{}'::jsonb
project_client_visible_columns           id                                  uuid                         NO    gen_random_uuid()
project_client_visible_columns           project_id                          uuid                         NO    
project_client_visible_columns           column_id                           text                         NO    
project_client_visible_columns           is_visible                          boolean                      NO    true
project_client_visible_columns           created_at                          timestamp with time zone     NO    now()
project_client_visible_columns           updated_at                          timestamp with time zone     NO    now()
project_column_labels                    id                                  uuid                         NO    gen_random_uuid()
project_column_labels                    project_id                          uuid                         NO    
project_column_labels                    column_id                           text                         NO    
project_column_labels                    custom_label                        text                         NO    
project_column_labels                    created_at                          timestamp with time zone     YES   now()
project_column_labels                    updated_at                          timestamp with time zone     YES   now()
project_column_order                     id                                  uuid                         NO    gen_random_uuid()
project_column_order                     project_id                          uuid                         NO    
project_column_order                     column_order                        jsonb                        NO    '[]'::jsonb
project_column_order                     updated_at                          timestamp with time zone     NO    now()
project_column_order                     updated_by                          uuid                         YES   
project_cycle_resets                     id                                  uuid                         NO    gen_random_uuid()
project_cycle_resets                     project_id                          uuid                         NO    
project_cycle_resets                     from_cycle                          integer                      NO    
project_cycle_resets                     to_cycle                            integer                      NO    
project_cycle_resets                     reset_by                            uuid                         YES   
project_cycle_resets                     reset_at                            timestamp with time zone     NO    now()
project_cycle_resets                     notes                               text                         YES   
project_notes                            id                                  uuid                         NO    gen_random_uuid()
project_notes                            project_id                          uuid                         NO    
project_notes                            title                               text                         NO    'Untitled'::text
project_notes                            content                             text                         NO    ''::text
project_notes                            created_at                          timestamp with time zone     NO    now()
project_notes                            updated_at                          timestamp with time zone     NO    now()
project_notes                            assigned_editor_id                  uuid                         YES   
project_notes                            content_id                          uuid                         YES   
project_notes                            created_by                          uuid                         YES   
project_notes                            is_pinned                           boolean                      NO    false
project_review_tokens                    id                                  uuid                         NO    gen_random_uuid()
project_review_tokens                    project_id                          uuid                         NO    
project_review_tokens                    token                               text                         NO    
project_review_tokens                    expires_at                          timestamp with time zone     NO    
project_review_tokens                    created_by                          uuid                         YES   
project_review_tokens                    revoked                             boolean                      YES   false
project_review_tokens                    access_count                        integer                      YES   0
project_review_tokens                    last_accessed_at                    timestamp with time zone     YES   
project_review_tokens                    created_at                          timestamp with time zone     YES   now()
project_review_tokens                    interview_id                        uuid                         YES   
project_status_options                   id                                  uuid                         NO    gen_random_uuid()
project_status_options                   project_id                          uuid                         NO    
project_status_options                   value                               text                         NO    
project_status_options                   label                               text                         NO    
project_status_options                   color                               text                         NO    'bg-gray-500'::text
project_status_options                   order_index                         integer                      NO    0
project_status_options                   is_active                           boolean                      NO    true
project_status_options                   created_at                          timestamp with time zone     NO    now()
project_status_options                   updated_at                          timestamp with time zone     NO    now()
project_tasks                            id                                  uuid                         NO    gen_random_uuid()
project_tasks                            project_id                          uuid                         NO    
project_tasks                            title                               text                         NO    
project_tasks                            description                         text                         YES   
project_tasks                            status                              text                         NO    'todo'::text
project_tasks                            created_at                          timestamp with time zone     NO    now()
project_tasks                            updated_at                          timestamp with time zone     NO    now()
project_tasks                            assigned_editor_id                  uuid                         YES   
project_tasks                            content_id                          uuid                         YES   
project_tasks                            due_date                            date                         YES   
project_tasks                            completed_at                        timestamp with time zone     YES   
project_tasks                            blocked_reason                      text                         YES   
project_tasks                            is_blocked                          boolean                      YES   false
project_tasks                            priority                            text                         YES   'medium'::text
project_tasks                            kanban_order                        integer                      YES   0
project_tasks                            source                              text                         NO    'auto'::text
project_templates                        id                                  uuid                         NO    gen_random_uuid()
project_templates                        project_type                        USER-DEFINED                 NO    
project_templates                        template_name                       text                         NO    
project_templates                        default_video_count                 integer                      NO    
project_templates                        default_interviews                  jsonb                        NO    
project_templates                        created_at                          timestamp with time zone     YES   now()
project_type_options                     id                                  uuid                         NO    gen_random_uuid()
project_type_options                     project_id                          uuid                         NO    
project_type_options                     value                               text                         NO    
project_type_options                     label                               text                         NO    
project_type_options                     order_index                         integer                      NO    0
project_type_options                     is_active                           boolean                      NO    true
project_type_options                     created_at                          timestamp with time zone     NO    now()
project_type_options                     updated_at                          timestamp with time zone     NO    now()
project_type_templates                   id                                  uuid                         NO    gen_random_uuid()
project_type_templates                   name                                text                         NO    
project_type_templates                   description                         text                         YES   
project_type_templates                   cadence                             text                         NO    'one_time'::text
project_type_templates                   is_built_in                         boolean                      NO    false
project_type_templates                   legacy_key                          text                         YES   
project_type_templates                   icon_type                           text                         YES   
project_type_templates                   created_by                          uuid                         YES   
project_type_templates                   steps                               jsonb                        NO    '[]'::jsonb
project_type_templates                   created_at                          timestamp with time zone     NO    now()
project_type_templates                   updated_at                          timestamp with time zone     NO    now()
projects                                 id                                  uuid                         NO    gen_random_uuid()
projects                                 client_id                           uuid                         NO    
projects                                 project_type                        USER-DEFINED                 NO    
projects                                 project_name                        text                         NO    
projects                                 status                              USER-DEFINED                 NO    'not_started'::project_status
projects                                 video_count                         integer                      NO    
projects                                 videos_completed                    integer                      NO    0
projects                                 progress                            numeric                      YES   0
projects                                 start_date                          date                         NO    CURRENT_DATE
projects                                 end_date                            date                         YES   
projects                                 custom_video_count                  integer                      YES   
projects                                 notes                               text                         YES   
projects                                 created_at                          timestamp with time zone     NO    now()
projects                                 updated_at                          timestamp with time zone     NO    now()
projects                                 project_editors                     ARRAY                        YES   '{}'::uuid[]
projects                                 rough_cut_drive_link                text                         YES   
projects                                 sort_preference                     text                         YES   'post_date_asc'::text
projects                                 raw_footage_notes                   text                         YES   
projects                                 posting_days                        ARRAY                        YES   
projects                                 project_type_template_id            uuid                         YES   
projects                                 cadence                             text                         NO    'one_time'::text
projects                                 current_cycle                       integer                      NO    1
projects                                 cycle_completed_at                  timestamp with time zone     YES   
push_subscriptions                       id                                  uuid                         NO    gen_random_uuid()
push_subscriptions                       user_id                             uuid                         NO    
push_subscriptions                       subscription                        jsonb                        NO    
push_subscriptions                       created_at                          timestamp with time zone     YES   now()
push_subscriptions                       updated_at                          timestamp with time zone     YES   now()
push_subscriptions                       endpoint                            text                         NO    
push_subscriptions                       device_label                        text                         YES   
push_subscriptions                       last_seen_at                        timestamp with time zone     YES   now()
push_subscriptions                       last_push_at                        timestamp with time zone     YES   
push_subscriptions                       last_push_status                    text                         YES   
rate_limit_entries                       id                                  uuid                         NO    gen_random_uuid()
rate_limit_entries                       key                                 text                         NO    
rate_limit_entries                       ip_address                          text                         YES   
rate_limit_entries                       user_id                             uuid                         YES   
rate_limit_entries                       endpoint                            text                         NO    
rate_limit_entries                       created_at                          timestamp with time zone     NO    now()
review_tokens                            id                                  uuid                         NO    gen_random_uuid()
review_tokens                            content_item_id                     uuid                         NO    
review_tokens                            token                               text                         NO    
review_tokens                            expires_at                          timestamp with time zone     NO    (now() + '30 days'::interval)
review_tokens                            created_by                          uuid                         YES   
review_tokens                            revoked                             boolean                      YES   false
review_tokens                            access_count                        integer                      YES   0
review_tokens                            last_accessed_at                    timestamp with time zone     YES   
review_tokens                            created_at                          timestamp with time zone     YES   now()
sales_territories                        id                                  uuid                         NO    gen_random_uuid()
sales_territories                        user_id                             uuid                         NO    
sales_territories                        region_name                         text                         NO    
sales_territories                        countries                           ARRAY                        NO    '{}'::text[]
sales_territories                        calendly_api_key                    text                         YES   
sales_territories                        calendar_event_filter               text                         YES   '30 Mins Discovery Call'::text
sales_territories                        created_at                          timestamp with time zone     NO    now()
sales_territories                        updated_at                          timestamp with time zone     NO    now()
sales_territories                        calendly_webhook_uri                text                         YES   
saved_filter_views                       id                                  uuid                         NO    gen_random_uuid()
saved_filter_views                       user_id                             uuid                         NO    
saved_filter_views                       name                                text                         NO    
saved_filter_views                       page                                text                         NO    
saved_filter_views                       filters                             jsonb                        NO    '{}'::jsonb
saved_filter_views                       is_default                          boolean                      NO    false
saved_filter_views                       created_at                          timestamp with time zone     NO    now()
saved_filter_views                       updated_at                          timestamp with time zone     NO    now()
script_templates                         id                                  uuid                         NO    gen_random_uuid()
script_templates                         name                                text                         NO    'Untitled Template'::text
script_templates                         description                         text                         YES   
script_templates                         duration                            text                         YES   
script_templates                         pillar                              text                         NO    'reach'::text
script_templates                         fields                              jsonb                        YES   '[]'::jsonb
script_templates                         created_at                          timestamp with time zone     NO    now()
script_templates                         updated_at                          timestamp with time zone     NO    now()
script_templates                         client_id                           uuid                         YES   
settings                                 id                                  uuid                         NO    gen_random_uuid()
settings                                 key                                 text                         NO    
settings                                 value                               text                         YES   
settings                                 created_at                          timestamp with time zone     YES   now()
settings                                 updated_at                          timestamp with time zone     YES   now()
shared_projects                          id                                  uuid                         NO    gen_random_uuid()
shared_projects                          project_id                          uuid                         NO    
shared_projects                          shared_with_client_id               uuid                         NO    
shared_projects                          shared_by                           uuid                         NO    
shared_projects                          created_at                          timestamp with time zone     NO    now()
short_links                              id                                  uuid                         NO    gen_random_uuid()
short_links                              code                                text                         NO    
short_links                              target_url                          text                         NO    
short_links                              content_item_id                     uuid                         YES   
short_links                              created_at                          timestamp with time zone     YES   now()
short_links                              access_count                        integer                      YES   0
solution_types                           id                                  uuid                         NO    gen_random_uuid()
solution_types                           name                                text                         NO    
solution_types                           created_at                          timestamp with time zone     YES   now()
solution_types                           created_by                          uuid                         YES   
sop_templates                            id                                  uuid                         NO    gen_random_uuid()
sop_templates                            template_type                       text                         NO    
sop_templates                            name                                text                         NO    
sop_templates                            content                             text                         NO    
sop_templates                            variables                           jsonb                        YES   
sop_templates                            category                            text                         YES   
sop_templates                            display_order                       integer                      NO    0
sop_templates                            is_active                           boolean                      NO    true
sop_templates                            created_at                          timestamp with time zone     NO    now()
sop_templates                            updated_at                          timestamp with time zone     NO    now()
sop_templates                            created_by                          uuid                         YES   
sops                                     id                                  uuid                         NO    gen_random_uuid()
sops                                     sop_number                          integer                      NO    
sops                                     title                               text                         NO    
sops                                     category                            text                         NO    
sops                                     owner_role                          text                         NO    
sops                                     goal                                text                         NO    
sops                                     content                             text                         NO    
sops                                     kpis                                jsonb                        YES   
sops                                     templates                           jsonb                        YES   
sops                                     display_order                       integer                      NO    0
sops                                     is_active                           boolean                      NO    true
sops                                     created_at                          timestamp with time zone     NO    now()
sops                                     updated_at                          timestamp with time zone     NO    now()
sops                                     created_by                          uuid                         YES   
sops                                     updated_by                          uuid                         YES   
starred_projects                         id                                  uuid                         NO    gen_random_uuid()
starred_projects                         user_id                             uuid                         NO    
starred_projects                         project_id                          uuid                         NO    
starred_projects                         created_at                          timestamp with time zone     NO    now()
stripe_charges                           id                                  uuid                         NO    gen_random_uuid()
stripe_charges                           stripe_charge_id                    text                         NO    
stripe_charges                           client_id                           uuid                         YES   
stripe_charges                           customer_email                      text                         YES   
stripe_charges                           amount                              integer                      NO    0
stripe_charges                           currency                            text                         NO    'usd'::text
stripe_charges                           status                              text                         NO    'pending'::text
stripe_charges                           fee                                 integer                      NO    0
stripe_charges                           net                                 integer                      NO    0
stripe_charges                           description                         text                         YES   
stripe_charges                           stripe_created_at                   timestamp with time zone     YES   
stripe_charges                           synced_at                           timestamp with time zone     NO    now()
stripe_charges                           created_at                          timestamp with time zone     NO    now()
stripe_charges                           stripe_customer_id                  text                         YES   
stripe_events_log                        id                                  uuid                         NO    gen_random_uuid()
stripe_events_log                        stripe_event_id                     text                         NO    
stripe_events_log                        event_type                          text                         NO    
stripe_events_log                        processed_at                        timestamp with time zone     NO    now()
stripe_subscriptions                     id                                  uuid                         NO    gen_random_uuid()
stripe_subscriptions                     stripe_subscription_id              text                         NO    
stripe_subscriptions                     stripe_customer_id                  text                         YES   
stripe_subscriptions                     client_id                           uuid                         YES   
stripe_subscriptions                     customer_email                      text                         YES   
stripe_subscriptions                     status                              text                         NO    'active'::text
stripe_subscriptions                     plan_name                           text                         YES   
stripe_subscriptions                     amount                              integer                      NO    0
stripe_subscriptions                     currency                            text                         NO    'usd'::text
stripe_subscriptions                     interval                            text                         NO    'month'::text
stripe_subscriptions                     current_period_start                timestamp with time zone     YES   
stripe_subscriptions                     current_period_end                  timestamp with time zone     YES   
stripe_subscriptions                     canceled_at                         timestamp with time zone     YES   
stripe_subscriptions                     stripe_created_at                   timestamp with time zone     YES   
stripe_subscriptions                     synced_at                           timestamp with time zone     NO    now()
stripe_subscriptions                     created_at                          timestamp with time zone     NO    now()
studios                                  id                                  uuid                         NO    gen_random_uuid()
studios                                  studio_number                       integer                      NO    
studios                                  image_url                           text                         NO    
studios                                  name                                text                         YES   
studios                                  description                         text                         YES   
studios                                  created_at                          timestamp with time zone     YES   now()
studios                                  updated_at                          timestamp with time zone     YES   now()
talent_form_fields                       id                                  uuid                         NO    gen_random_uuid()
talent_form_fields                       field_key                           text                         NO    
talent_form_fields                       label                               text                         NO    
talent_form_fields                       field_type                          text                         NO    'text'::text
talent_form_fields                       options                             jsonb                        YES   '[]'::jsonb
talent_form_fields                       is_required                         boolean                      NO    false
talent_form_fields                       is_enabled                          boolean                      NO    true
talent_form_fields                       sort_order                          integer                      NO    0
talent_form_fields                       section                             text                         NO    'professional'::text
talent_form_fields                       placeholder                         text                         YES   
talent_form_fields                       is_core                             boolean                      NO    false
talent_form_fields                       created_at                          timestamp with time zone     NO    now()
talent_form_fields                       updated_at                          timestamp with time zone     NO    now()
talent_network                           id                                  uuid                         NO    gen_random_uuid()
talent_network                           full_name                           text                         NO    
talent_network                           email                               text                         YES   
talent_network                           phone                               text                         YES   
talent_network                           location                            text                         YES   
talent_network                           position_type                       ARRAY                        YES   '{}'::text[]
talent_network                           languages                           ARRAY                        YES   '{}'::text[]
talent_network                           salary                              text                         YES   
talent_network                           workload                            text                         YES   
talent_network                           bio                                 text                         YES   
talent_network                           portfolio_link                      text                         YES   
talent_network                           exercise_link                       text                         YES   
talent_network                           niche_experience                    ARRAY                        YES   '{}'::text[]
talent_network                           content_types                       ARRAY                        YES   '{}'::text[]
talent_network                           availability                        text                         YES   'Available Now'::text
talent_network                           is_active                           boolean                      YES   true
talent_network                           submitted_at                        timestamp with time zone     YES   now()
talent_network                           created_at                          timestamp with time zone     YES   now()
talent_network                           updated_at                          timestamp with time zone     YES   now()
talent_network                           user_id                             uuid                         YES   
talent_network                           status                              text                         NO    'pending'::text
talent_network                           submitted_via                       text                         YES   
talent_network                           custom_fields                       jsonb                        YES   '{}'::jsonb
talent_network                           talent_type                         text                         NO    'editor'::text
talent_network                           rate_per_shoot                      text                         YES   
talent_network                           hours_per_shoot                     text                         YES   
talent_network                           address                             text                         YES   
talent_network                           rate_per_hour                       text                         YES   
talent_network                           backgrounds                         ARRAY                        YES   '{}'::text[]
talent_network                           amenities                           ARRAY                        YES   '{}'::text[]
talent_network                           va_specialty                        text                         YES   
talent_network                           timezone                            text                         YES   
talent_network                           skills                              ARRAY                        YES   '{}'::text[]
talent_portfolio_videos                  id                                  uuid                         NO    gen_random_uuid()
talent_portfolio_videos                  talent_id                           uuid                         NO    
talent_portfolio_videos                  video_url                           text                         NO    
talent_portfolio_videos                  thumbnail_url                       text                         YES   
talent_portfolio_videos                  title                               text                         YES   
talent_portfolio_videos                  sort_order                          integer                      NO    0
talent_portfolio_videos                  created_at                          timestamp with time zone     NO    now()
team_chat_members                        id                                  uuid                         NO    gen_random_uuid()
team_chat_members                        room_id                             uuid                         NO    
team_chat_members                        user_id                             uuid                         NO    
team_chat_members                        joined_at                           timestamp with time zone     NO    now()
team_chat_rooms                          id                                  uuid                         NO    gen_random_uuid()
team_chat_rooms                          kind                                text                         NO    
team_chat_rooms                          name                                text                         YES   
team_chat_rooms                          created_by                          uuid                         NO    
team_chat_rooms                          created_at                          timestamp with time zone     NO    now()
team_chat_rooms                          updated_at                          timestamp with time zone     NO    now()
thumbnail_versions                       id                                  uuid                         NO    gen_random_uuid()
thumbnail_versions                       content_id                          uuid                         NO    
thumbnail_versions                       version_number                      integer                      NO    1
thumbnail_versions                       thumbnail_url                       text                         NO    
thumbnail_versions                       thumbnail_storage_path              text                         NO    
thumbnail_versions                       is_current                          boolean                      YES   false
thumbnail_versions                       uploaded_at                         timestamp with time zone     YES   now()
thumbnail_versions                       uploaded_by                         uuid                         YES   
thumbnail_versions                       version_notes                       text                         YES   
thumbnail_versions                       created_at                          timestamp with time zone     YES   now()
trial_reels                              id                                  uuid                         NO    gen_random_uuid()
trial_reels                              content_id                          uuid                         NO    
trial_reels                              version_id                          uuid                         YES   
trial_reels                              hook_cloudflare_id                  text                         YES   
trial_reels                              hook_playback_url                   text                         YES   
trial_reels                              hook_thumbnail_url                  text                         YES   
trial_reels                              hook_duration                       integer                      YES   
trial_reels                              hook_file_name                      text                         YES   
trial_reels                              hook_file_size                      bigint                       YES   
trial_reels                              hook_upload_status                  text                         YES   'pending'::text
trial_reels                              trial_number                        integer                      NO    1
trial_reels                              hook_description                    text                         YES   
trial_reels                              is_active                           boolean                      YES   true
trial_reels                              created_at                          timestamp with time zone     YES   now()
trial_reels                              created_by                          uuid                         YES   
trial_reels                              updated_at                          timestamp with time zone     YES   now()
trial_reels                              trial_date                          date                         YES   
upload_logs                              id                                  uuid                         NO    gen_random_uuid()
upload_logs                              content_item_id                     uuid                         YES   
upload_logs                              version_id                          uuid                         YES   
upload_logs                              trial_id                            uuid                         YES   
upload_logs                              cloudflare_video_id                 text                         YES   
upload_logs                              event                               text                         NO    
upload_logs                              details                             jsonb                        YES   '{}'::jsonb
upload_logs                              user_id                             uuid                         YES   
upload_logs                              created_at                          timestamp with time zone     NO    now()
user_ai_context_files                    id                                  uuid                         NO    gen_random_uuid()
user_ai_context_files                    user_id                             uuid                         NO    
user_ai_context_files                    file_name                           text                         NO    
user_ai_context_files                    file_path                           text                         NO    
user_ai_context_files                    file_type                           text                         NO    
user_ai_context_files                    file_size_bytes                     bigint                       NO    
user_ai_context_files                    extracted_text                      text                         YES   
user_ai_context_files                    is_active                           boolean                      NO    true
user_ai_context_files                    created_at                          timestamp with time zone     NO    now()
user_ai_context_files                    updated_at                          timestamp with time zone     NO    now()
user_ai_settings                         id                                  uuid                         NO    gen_random_uuid()
user_ai_settings                         user_id                             uuid                         NO    
user_ai_settings                         model                               text                         NO    'google/gemini-2.5-flash'::text
user_ai_settings                         system_prompt                       text                         YES   
user_ai_settings                         temperature                         numeric                      NO    0.3
user_ai_settings                         top_p                               numeric                      NO    1
user_ai_settings                         created_at                          timestamp with time zone     NO    now()
user_ai_settings                         updated_at                          timestamp with time zone     NO    now()
user_column_preferences                  id                                  uuid                         NO    gen_random_uuid()
user_column_preferences                  user_id                             uuid                         YES   
user_column_preferences                  project_id                          uuid                         YES   
user_column_preferences                  column_settings                     jsonb                        YES   
user_column_preferences                  created_at                          timestamp with time zone     YES   now()
user_column_preferences                  updated_at                          timestamp with time zone     YES   now()
user_kanban_boards                       id                                  uuid                         NO    gen_random_uuid()
user_kanban_boards                       user_id                             uuid                         NO    
user_kanban_boards                       columns                             jsonb                        NO    '[{"id": "todo", "color": "#94a3b8", ...
user_kanban_boards                       created_at                          timestamp with time zone     YES   now()
user_kanban_boards                       updated_at                          timestamp with time zone     YES   now()
user_roles                               id                                  uuid                         NO    gen_random_uuid()
user_roles                               user_id                             uuid                         NO    
user_roles                               role                                USER-DEFINED                 NO    
user_roles                               created_at                          timestamp with time zone     NO    now()
video_annotations                        id                                  uuid                         NO    gen_random_uuid()
video_annotations                        comment_id                          uuid                         YES   
video_annotations                        content_id                          uuid                         NO    
video_annotations                        version_id                          uuid                         YES   
video_annotations                        annotation_data                     jsonb                        NO    
video_annotations                        frame_timestamp                     numeric                      NO    
video_annotations                        frame_thumbnail                     text                         YES   
video_annotations                        created_at                          timestamp with time zone     NO    now()
video_annotations                        updated_at                          timestamp with time zone     YES   now()
video_comments                           id                                  uuid                         NO    gen_random_uuid()
video_comments                           content_id                          uuid                         NO    
video_comments                           user_id                             uuid                         YES   
video_comments                           parent_comment_id                   uuid                         YES   
video_comments                           comment                             text                         NO    
video_comments                           timestamp_seconds                   numeric                      NO    
video_comments                           status                              text                         NO    'active'::text
video_comments                           resolved_at                         timestamp with time zone     YES   
video_comments                           resolved_by                         uuid                         YES   
video_comments                           created_at                          timestamp with time zone     NO    now()
video_comments                           updated_at                          timestamp with time zone     YES   
video_comments                           comment_type                        text                         YES   
video_comments                           guest_name                          text                         YES   
video_comments                           version_id                          uuid                         YES   
video_comments                           timestamp_end_seconds               numeric                      YES   
video_comments                           is_internal                         boolean                      YES   false
video_comments                           guest_email                         text                         YES   
video_editors                            id                                  uuid                         NO    gen_random_uuid()
video_editors                            content_id                          uuid                         YES   
video_editors                            editor_id                           uuid                         YES   
video_editors                            assigned_at                         timestamp with time zone     YES   now()
video_editors                            assigned_by                         uuid                         YES   
video_editors                            role                                text                         YES   'secondary'::text
video_editors                            client_id                           uuid                         YES   
video_editors                            project_id                          uuid                         YES   
video_status_history                     id                                  uuid                         NO    gen_random_uuid()
video_status_history                     content_id                          uuid                         NO    
video_status_history                     old_status                          text                         YES   
video_status_history                     new_status                          text                         NO    
video_status_history                     changed_by                          uuid                         YES   
video_status_history                     changed_at                          timestamp with time zone     NO    now()
video_usage_tracking                     id                                  uuid                         NO    gen_random_uuid()
video_usage_tracking                     client_id                           uuid                         NO    
video_usage_tracking                     month                               date                         NO    
video_usage_tracking                     videos_created                      integer                      YES   0
video_usage_tracking                     videos_limit                        integer                      NO    
video_usage_tracking                     created_at                          timestamp with time zone     YES   now()
video_usage_tracking                     updated_at                          timestamp with time zone     YES   now()
```


---

## 8. Rebuild Recommendations Appendix

### 8.1 Tables to ADD ➕

| Table | Purpose |
|---|---|
| `tenants` | One row per agency (white-label tenant). All business tables get `tenant_id` FK. |
| `statuses` | Per-tenant pipeline statuses. Replaces hard-coded `unified_status` enum. |
| `status_role_permissions` | Per-status × per-role transition permissions (modular). |
| `video_types` | Per-tenant video types. Replaces hard-coded whitelist. |
| `deal_stages` | Per-tenant CRM deal stages. Replaces enum. |
| `ai_prompts` | Per-tenant editable AI system prompts (Jarvis, sales scoring, etc.). |
| `notification_rules` | Per-event notification routing (in-app, email, push, slack). |
| `forms` | Typeform-style form definitions (replaces hard-coded application flows). |
| `form_fields` | Field schema for each form. |
| `form_submissions` | Submission rows; auto-create `crm_people` on insert. |
| `accounting_entries` | Manual ledger for non-Stripe income/expenses (Owner-only). |
| `platform_oauth_tokens` | OAuth tokens for Meta/TikTok/LinkedIn/YouTube/X cross-platform publishing. |
| `client_posting_queue` | Scheduled multi-platform posts (Moderator role workflow). |
| `posting_attempts` | Per-attempt log for cross-platform publish retries/debugging. |
| `moderator_assignments` | Maps moderators to clients they can post on behalf of. |
| `tenant_role_permissions` | Per-tenant overrides of the default role × feature permission matrix. |

### 8.2 Tables to RENAME 🔄

| Current | Rebuild | Reason |
|---|---|---|
| `interviews` | `cycles` | PRD terminology lock — "Cycle" replaces session/interview |
| `sales_territories` | `closer_regions` | Role rename + UI label is "Region" |
| `content_sessions` | merged into `cycles` | Eliminate Studio-side overlap |

### 8.3 Tables to DROP 🗑️

- `talent_network`, `talent_portfolio_videos`, `studios`, `client_hires` — Talent Network marketplace removed
- `talent_form_fields` — replaced by generic forms builder
- `attio-calls` related rows (if any) — Attio integration sunset

### 8.4 Schema-level changes for white-label multi-tenancy

- Add `tenants` table (one row per agency).
- Add `tenant_id UUID NOT NULL REFERENCES tenants(id)` to **every** business table.
- Backfill `tenant_id` on existing rows from a single "default tenant" during migration.
- Add `tenant_id_for_user(uuid)` security-definer function. Call it in every RLS USING clause.
- Replace hard-coded enums with per-tenant lookup tables (`statuses`, `video_types`, `deal_stages`).
- Add `tenant_role_permissions` to support per-tenant modular role permissions overlaying the default matrix.

### 8.5 RLS health flags (from live audit)


✅ All public tables have RLS enabled.

⚠️ **Tables with RLS enabled but NO policies (1 — fully locked down):**

- `stripe_events_log`

---

*End of Database Schema Reference. Companion to PRD.md and PERMISSIONS-MATRIX.md.*
