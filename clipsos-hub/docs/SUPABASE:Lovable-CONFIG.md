# ClipsApp — Supabase Backend Configuration Reference

**Companion to PRD v1.0, Permissions Matrix, Database Schema, and UI Inventory**
_Generated: 2026-04-26_
_Source: live audit of Supabase project + `supabase/config.toml` + filesystem inspection_

---

## ⚠️ READ THIS FIRST — REBUILD INTENT

> **This is a reference for _intent_, not a copy-paste spec.**
> The current backend has accumulated cruft: legacy talent network tables, duplicate Stripe secret keys, ElevenLabs (unused per PRD), and a default `client` role auto-assignment trigger that's a security risk. The rebuild should:
>
> 1. Recreate only what the PRD/PERMISSIONS-MATRIX/DATABASE-SCHEMA actually call for
> 2. Add multi-tenant isolation (`tenants` table + `tenant_id` everywhere) which doesn't exist today
> 3. Drop everything marked 🗑️ in this doc

**Markers used:** ✅ KEEP · 🔄 REWORK · 🗑️ DROP · ⚠️ VERIFY IN DASHBOARD · ➕ ADD IN REBUILD

---

## Table of Contents

1. [Project Info](#1-project-info)
2. [Auth Configuration](#2-auth-configuration)
3. [Database](#3-database)
4. [Storage Buckets](#4-storage-buckets)
5. [Edge Functions](#5-edge-functions)
6. [Secrets & Environment Variables](#6-secrets--environment-variables)
7. [API Configuration](#7-api-configuration)
8. [Manual Verification Checklist](#8-manual-verification-checklist-dashboard-only)
9. [Rebuild Setup Order](#9-rebuild-setup-order)

---

## 1. Project Info

| Field                         | Value                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Project name**              | ClipsApp (TheClips Agency)                                                                                     |
| **Project ID (Supabase ref)** | `izqogaohvqdlwcxokzvv`                                                                                         |
| **Lovable project ID**        | `a5ccb935-4d6b-4ab7-b758-d7fb11dc716d`                                                                         |
| **Project URL**               | `https://izqogaohvqdlwcxokzvv.supabase.co`                                                                     |
| **Database version**          | PostgreSQL 17.6 (aarch64-linux, GCC 13.2.0)                                                                    |
| **Region**                    | ⚠️ VERIFY IN DASHBOARD (typically `us-east-1` for Lovable Cloud)                                               |
| **Anon (publishable) key**    | Stored in `.env` as `VITE_SUPABASE_PUBLISHABLE_KEY` — safe to commit (publishable)                             |
| **Service role key**          | Available to edge functions as `SUPABASE_SERVICE_ROLE_KEY` (auto-injected)                                     |
| **Site URL (config)**         | `http://127.0.0.1:3000` (dev default — production set in Auth dashboard)                                       |
| **Production app URLs**       | `https://app.theclips.agency`, `https://theclipsagency.lovable.app`, `https://app-theclips-agency.lovable.app` |

> **Rebuild:** spin up a fresh Lovable Cloud project. The new project ID will be different. Update the `_shared/cors.ts` `ALLOWED_ORIGINS` whitelist accordingly.

---

## 2. Auth Configuration

### 2.1 Settings (from `supabase/config.toml`)

| Setting                              | Current value                                         | Rebuild recommendation                                              |
| ------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| `auth.enabled`                       | `true`                                                | ✅ KEEP                                                             |
| `auth.enable_signup`                 | `true`                                                | ✅ KEEP (gated by tenant settings per PRD)                          |
| `auth.enable_anonymous_sign_ins`     | `false`                                               | ✅ KEEP — never enable                                              |
| `auth.email.enable_signup`           | `true`                                                | ✅ KEEP                                                             |
| `auth.email.enable_confirmations`    | `false`                                               | 🔄 REWORK — enable for production (PRD requires email verification) |
| `auth.email.double_confirm_changes`  | `true`                                                | ✅ KEEP                                                             |
| `auth.jwt_expiry`                    | `3600` (1 hour)                                       | ✅ KEEP                                                             |
| `auth.enable_refresh_token_rotation` | `true`                                                | ✅ KEEP                                                             |
| `auth.refresh_token_reuse_interval`  | `10` seconds                                          | ✅ KEEP                                                             |
| `auth.site_url`                      | `http://127.0.0.1:3000`                               | 🔄 Set production URL in dashboard                                  |
| `auth.additional_redirect_urls`      | `["https://izqogaohvqdlwcxokzvv.lovableproject.com"]` | 🔄 Add production + preview domains                                 |

### 2.2 Auth providers

| Provider                            | Status                                                                                            | Rebuild              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------- |
| **Email + password**                | ✅ Enabled                                                                                        | KEEP                 |
| **Google OAuth**                    | ⚠️ VERIFY in dashboard (used in `Index.tsx` login UI; client ID stored in dashboard, not in repo) | KEEP                 |
| **Magic Links**                     | ✅ Custom implementation via `magic-link-login` + `send-magic-link-email` edge functions          | KEEP                 |
| **Apple, Phone, SAML SSO**          | Not enabled                                                                                       | OPTIONAL for rebuild |
| **GitHub, Facebook, Discord, etc.** | Not natively supported in Lovable Cloud                                                           | N/A                  |

**Rebuild defaults:** Email + password + Google OAuth + Magic Links (per PRD §3.1).

### 2.3 Email templates

⚠️ Email templates live in the Supabase dashboard under Auth → Email Templates. The repo does not contain their HTML.

| Template       | Used by                                              | Rebuild                                               |
| -------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Confirm signup | Email sign-up flow                                   | 🔄 Use Lovable Native Email (replaces Resend per PRD) |
| Invite user    | Manual team invite via `create-team-member`          | 🔄                                                    |
| Magic Link     | Password-less login                                  | 🔄                                                    |
| Reset password | `send-password-reset` (custom 14-char temp password) | 🔄                                                    |
| Change email   | `double_confirm_changes` flow                        | 🔄                                                    |

⚠️ **Manual export needed before rebuild:** Copy the HTML body of each template from the dashboard.

### 2.4 Custom auth flow components

| Component                                                     | What it does                                                                                                                                                     | Rebuild verdict                                                                                                                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`handle_new_user()` trigger** on `auth.users` insert        | Creates `profiles` row + auto-assigns `client` role                                                                                                              | 🔄 **REWORK** — remove auto-`client` assignment (per PRD §3.1.1, this was a Google OAuth security risk; new users land on a "What kind of account?" page instead) |
| **14-char temporary password reset**                          | `send-password-reset` generates a 14-char temp password and emails it. User is forced to change on first login via `requires_password_change` flag on `profiles` | ✅ KEEP — distinctive and secure                                                                                                                                  |
| **`first_login` + `password_changed_at`** flags on `profiles` | Force-redirect to `/reset-password` until set                                                                                                                    | ✅ KEEP                                                                                                                                                           |
| **Magic Link via custom edge function**                       | `magic-link-login` validates a token and exchanges for session                                                                                                   | ✅ KEEP                                                                                                                                                           |
| **Idle timeout** (`useIdleTimeout` hook)                      | Auto-logout after inactivity                                                                                                                                     | ✅ KEEP                                                                                                                                                           |

---

## 3. Database

### 3.1 Counts

| Item                             | Count   |
| -------------------------------- | ------- |
| Tables (in `public`)             | **129** |
| Database functions (in `public`) | **96**  |
| Triggers (in `public`)           | **111** |
| FK relationships                 | 186     |
| RLS policies                     | 408     |
| Custom indexes                   | 245     |
| Enums (in `public`)              | 14      |

### 3.2 Extensions enabled

| Extension            | Version | Purpose                                                      | Rebuild                            |
| -------------------- | ------- | ------------------------------------------------------------ | ---------------------------------- |
| `plpgsql`            | 1.0     | PL/pgSQL (default)                                           | ✅                                 |
| `uuid-ossp`          | 1.1     | UUID generation                                              | ✅                                 |
| `pgcrypto`           | 1.3     | `gen_random_bytes`, `gen_random_uuid`                        | ✅                                 |
| `pg_cron`            | 1.6.4   | Scheduled jobs                                               | ✅                                 |
| `pg_net`             | 0.19.5  | HTTP from Postgres (used by triggers to call edge functions) | ✅                                 |
| `pg_stat_statements` | 1.11    | Query performance monitoring                                 | ✅                                 |
| `pg_graphql`         | 1.5.11  | GraphQL endpoint                                             | ⚠️ Available but unused — OPTIONAL |
| `supabase_vault`     | 0.3.1   | Encrypted secret storage                                     | ✅                                 |

### 3.3 Tables (alphabetical, all 129)

> Full schema details with columns, FKs, indexes, and RLS policies are in `DATABASE-SCHEMA.md`. This is the names-only inventory for setup checklist purposes.

```
academy_instagram_metrics              client_pillars                      finance_transactions
active_sessions                        client_studio_preferences           follow_ups
activity_logs                          client_team_assignments             hooks_library
agency_facebook_ads_metrics            client_top_reels                    internal_credentials
agency_instagram_metrics               clients                             interviews
ai_conversations                       comment_attachments                 leads
ai_messages                            content_comments                    leads_custom_columns
branding_deck_comments                 content_ideas                       leads_saved_views
calendly_events                        content_items                       login_history
chat_attachments                       content_script_versions             notification_preferences
chat_mentions                          content_scripts                     notifications
chat_messages                          content_sessions                    onboarding_documents
chat_mutes                             content_vault                       partnership_applications
chat_reactions                         content_versions                    password_reset_tokens
chat_read_receipts                     credential_assignments              preview_sessions
chat_rooms                             credential_audit_log                profiles
chat_threads                           crm_companies                       project_client_visible_columns
client_access                          crm_deal_options                    project_column_labels
client_ads_metrics                     crm_deals                           project_column_order
client_api_tokens                      crm_editors                         project_cycle_resets
client_audience_avatars                crm_people                          project_notes
client_automation_metrics              custom_columns                      project_review_tokens
client_bios                            custom_field_values                 project_status_options
client_brain_materials                 custom_journey_steps                project_tasks
client_credential_assignments          default_settings                    project_templates
client_credentials                     download_logs                       project_type_options
client_error_logs                      editor_goals                        project_type_templates
client_foundation                      email_campaign_recipients           projects
client_hires                           email_campaigns                     push_subscriptions
client_invitations                     email_logs                          rate_limit_entries
client_journey_steps                   email_queue                         review_tokens
client_members                         email_templates                     sales_territories
client_onboarding_progress             saved_filter_views                  upload_logs
client_organic_metrics                 script_templates                    user_ai_context_files
                                       settings                            user_ai_settings
shared_projects                        sops                                user_column_preferences
short_links                            starred_projects                    user_kanban_boards
solution_types                         stripe_charges                      user_roles
sop_templates                          stripe_events_log                   video_annotations
                                       stripe_subscriptions                video_comments
studios                                talent_form_fields                  video_editors
talent_network                         talent_portfolio_videos             video_status_history
team_chat_members                      team_chat_rooms                     video_usage_tracking
thumbnail_versions                     trial_reels
```

**Rebuild domain groupings + drop list:** see `DATABASE-SCHEMA.md` §2 for full categorization. High-level: drop `talent_*`, `studios`, `client_hires`; rename `interviews` → `cycles`; add `tenants` + `tenant_id` everywhere.

### 3.4 Database functions (96 total — categorized summary)

| Category                           | Count | Examples                                                                                                                                                                                                                                                                                    | Rebuild                                                 |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **RLS helpers** (security-definer) | ~15   | `has_role`, `user_has_client_access`, `user_can_access_chat_room`, `user_in_team_room`, `editor_has_project_content_assignment`, `is_studio_published`, `has_valid_project_review_token`                                                                                                    | ✅ KEEP — generalize for modular roles                  |
| **Notification triggers**          | ~12   | `notify_on_video_status_change`, `notify_on_new_version`, `notify_on_editor_assignment`, `notify_on_new_chat_message`, `notify_team_on_client_decision`, `notify_slack_on_client_decision`                                                                                                  | 🔄 REWORK to read from modular `notification_rules`     |
| **Status guards**                  | ~3    | `enforce_editor_status_restrictions`, `validate_video_types`                                                                                                                                                                                                                                | 🔄 REPLACE with modular `status_role_permissions` check |
| **Timestamp updaters**             | ~10   | `update_updated_at_column`, `update_video_comments_updated_at`, `set_leads_updated_at` (and 7 more variants)                                                                                                                                                                                | 🔄 CONSOLIDATE into one universal trigger               |
| **Auto-assignment**                | ~5    | `handle_new_user`, `auto_assign_interview_id`, `auto_link_client_to_crm_person`, `auto_disqualify_low_revenue_lead`, `auto_delete_video_task`                                                                                                                                               | ✅ KEEP (rename `interview` → `cycle`)                  |
| **Snapshot/audit**                 | ~4    | `snapshot_content_script_version`, `log_video_status_change`, `update_last_sign_in`                                                                                                                                                                                                         | ✅ KEEP                                                 |
| **Cleanup (cron-driven)**          | ~5    | `cleanup_rate_limit_entries`, `cleanup_old_error_logs` (30d), `cleanup_old_activity_logs` (90d), `cleanup_expired_comment_attachments`                                                                                                                                                      | ✅ KEEP                                                 |
| **Mention helpers**                | ~5    | `get_chat_room_mentionables`, `get_team_room_mentionables`, `get_content_mention_participants`, `get_chat_room_participants`, `get_team_room_participants`                                                                                                                                  | ✅ KEEP                                                 |
| **Onboarding RPCs**                | ~3    | `complete_client_onboarding`, `mark_practice_session_booked`, `mark_script_recording_booked`                                                                                                                                                                                                | 🔄 MERGE into Forms feature                             |
| **Other RPCs**                     | ~5    | `add_video_comment`, `reset_project_cycle`, `get_unread_chat_counts`, `get_editors_for_scope`, `get_client_editors`, `generate_short_code`                                                                                                                                                  | ✅ KEEP                                                 |
| **Triggers (small utilities)**     | ~10   | `set_document_completed_timestamp`, `ensure_single_current_version`, `ensure_single_current_thumbnail_version`, `update_project_progress`, `update_video_usage`, `bump_chat_room_updated_at`, `create_default_team_thread`, `add_creator_to_team_room`, `sync_content_item_r2_from_version` | ✅ KEEP                                                 |

### 3.5 Triggers (111 total)

Counts by purpose — full list of which trigger fires on which table is in `DATABASE-SCHEMA.md` per-table sections.

| Type                                                   | Approximate count         |
| ------------------------------------------------------ | ------------------------- |
| `updated_at` auto-update triggers                      | ~50 (one per major table) |
| Notification dispatch triggers                         | ~10                       |
| Status change audit / guard triggers                   | ~6                        |
| Single-current-flag enforcement (versions, thumbnails) | ~4                        |
| Auto-create / auto-assign triggers                     | ~8                        |
| Project progress recalc                                | ~3                        |
| Cleanup helpers                                        | ~3                        |
| Misc                                                   | rest                      |

> **Rebuild:** consolidate the 50+ `updated_at` triggers into a single generic trigger function applied to every table that has `updated_at`.

### 3.6 Scheduled jobs (`pg_cron`)

⚠️ **VERIFY IN DASHBOARD** — read access to `cron.job` is restricted from the app role.

Based on cleanup function names + edge functions deployed for cron, the schedules in use are approximately:

| Schedule         | What it runs                                                                                            | Source                          |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Every minute     | `process-email-queue`                                                                                   | Edge function cron              |
| Every 15 minutes | `schedule-call-reminders`                                                                               | Edge function cron              |
| Hourly           | `sync-calendly-events`                                                                                  | Edge function cron              |
| Every 6 hours    | `stripe-sync`                                                                                           | Edge function cron              |
| Daily            | `cleanup-failed-upload`, `cleanup_rate_limit_entries`, `cleanup_old_error_logs`                         | Mix of pg_cron + edge functions |
| Weekly           | `cleanup-old-thumbnails`, `run-storage-cleanup`, `audit-cloudflare-videos`, `cleanup_old_activity_logs` | pg_cron + edge functions        |
| Monthly          | `cleanup-old-video-versions`, `cleanup_expired_comment_attachments`                                     | pg_cron + edge functions        |

**To export from current project:** Supabase Dashboard → Database → Cron Jobs → screenshot or copy each row.

---

## 4. Storage Buckets

| Bucket                | Public     | Size limit    | MIME restriction                   | Policies | Purpose                                                                                  | Rebuild         |
| --------------------- | ---------- | ------------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------- | --------------- |
| `ai-context-files`    | 🔒 Private | — (unlimited) | none                               | 2        | Per-user AI context uploads (Jarvis)                                                     | ✅ KEEP         |
| `avatars`             | 🌐 Public  | 5 MB          | `image/jpeg, image/png, image/gif` | 3        | User profile pictures                                                                    | ✅ KEEP         |
| `branding-decks`      | 🌐 Public  | —             | none                               | 3        | Client brand decks (PDFs)                                                                | ✅ KEEP         |
| `chat-attachments`    | 🌐 Public  | 100 MB        | none                               | 4        | Chat file shares                                                                         | ✅ KEEP         |
| `comment-attachments` | 🌐 Public  | —             | none                               | 2        | Video review comment attachments (auto-expire via `cleanup_expired_comment_attachments`) | ✅ KEEP         |
| `onboarding-videos`   | 🌐 Public  | —             | none                               | 3        | Welcome / "What to expect" videos                                                        | ✅ KEEP         |
| `studio-photos`       | 🌐 Public  | —             | none                               | 3        | Studio listing photos                                                                    | ✅ KEEP         |
| `talent-portfolio`    | 🌐 Public  | —             | none                               | 2        | Talent network sample videos                                                             | 🗑️ DROP per PRD |
| `thumbnails`          | 🌐 Public  | —             | none                               | 3        | Video thumbnails                                                                         | ✅ KEEP         |

**Notes for rebuild:**

- Most buckets currently have no size limit — set sensible defaults (e.g., `branding-decks` → 50 MB PDF only, `studio-photos` → 10 MB images only).
- All "public" buckets still enforce write-access via RLS policies on `storage.objects`. Public means _read_-via-URL is allowed.
- **Originals storage is NOT a Supabase bucket** — videos go to Cloudflare R2 (handled in `r2-multipart-*` edge functions).
- **Streaming is via Cloudflare Stream** — also not in Supabase.

---

## 5. Edge Functions

**Total: 117 functions** across `supabase/functions/`. All use the centralized CORS helper at `_shared/cors.ts`.

### 5.1 By category

#### Video pipeline (R2 multipart + Cloudflare Stream)

| Function                     | What it does                                       | External services    | Rebuild                          |
| ---------------------------- | -------------------------------------------------- | -------------------- | -------------------------------- |
| `initialize-video-upload`    | Starts upload session, creates `content_items` row | Cloudflare Stream    | ✅                               |
| `r2-multipart-create`        | Begins R2 multipart upload                         | Cloudflare R2        | ✅                               |
| `r2-multipart-upload-part`   | Uploads one chunk                                  | Cloudflare R2        | ✅                               |
| `r2-multipart-complete`      | Finalizes multipart upload                         | Cloudflare R2        | ✅                               |
| `get-r2-upload-url`          | Returns presigned URL for direct browser→R2 upload | Cloudflare R2        | ✅                               |
| `upload-video-chunk`         | Legacy chunked upload                              | Cloudflare Stream    | 🔄 Consolidate with R2 multipart |
| `upload-new-version`         | Adds new version to a video                        | Cloudflare R2/Stream | ✅                               |
| `check-video-status`         | Polls Cloudflare Stream for transcode status       | Cloudflare Stream    | ✅                               |
| `copy-video-to-r2`           | Mirrors Stream → R2                                | Cloudflare           | ✅                               |
| `backfill-videos-to-r2`      | Bulk backfill for legacy videos                    | Cloudflare           | ✅                               |
| `audit-cloudflare-videos`    | Reconciles Stream vs DB                            | Cloudflare Stream    | ✅                               |
| `delete-cloudflare-video`    | Deletes from Stream + R2                           | Cloudflare           | ✅                               |
| `delete-version`             | Deletes a single version                           | Cloudflare           | ✅                               |
| `download-media`             | Streams R2 originals as proxy                      | Cloudflare R2        | ✅                               |
| `get-video-versions`         | Lists versions of a video                          | DB only              | ✅                               |
| `update-version-type`        | Changes version metadata                           | DB only              | ✅                               |
| `cleanup-failed-upload`      | Removes orphaned upload records                    | Cloudflare + DB      | ✅                               |
| `cleanup-old-thumbnails`     | Removes expired thumbnails                         | Cloudflare R2        | ✅                               |
| `cleanup-old-video-versions` | Removes old archived versions                      | Cloudflare R2        | ✅                               |
| `run-storage-cleanup`        | Master cleanup orchestrator                        | Multiple             | ✅                               |
| `upload-health-check`        | Diagnostics                                        | Multiple             | ✅                               |
| `create-zip-download`        | Bulk download as ZIP                               | Cloudflare R2        | ✅                               |

#### Trial reels

| Function            | What it does             | Rebuild                                            |
| ------------------- | ------------------------ | -------------------------------------------------- |
| `create-trial-reel` | Adds a trial variant     | 🔄 REWORK per corrected trial logic (see PRD §6.3) |
| `get-trial-reels`   | Lists trials for a video | 🔄                                                 |
| `delete-trial-reel` | Removes a trial          | 🔄                                                 |

#### Notifications & email

| Function                           | What it does                           | External services       | Rebuild                           |
| ---------------------------------- | -------------------------------------- | ----------------------- | --------------------------------- |
| `notify-internal-review`           | Slack + in-app for QA review           | Slack                   | ✅                                |
| `notify-rough-cut`                 | Notifies on rough cut ready            | Slack + Email           | ✅                                |
| `notify-video-approval`            | Notifies on client approval            | Slack + Email           | ✅                                |
| `notify-video-feedback`            | Notifies on revision request           | Slack + Email           | ✅                                |
| `notify-editor-feedback`           | Notifies editor of feedback            | Slack + Email           | ✅                                |
| `notify-mention`                   | @mention notification dispatcher       | Slack + Email           | ✅                                |
| `notify-thumbnail-decision`        | Thumbnail approval/revision            | Email                   | ✅                                |
| `notify-trial-request`             | Trial reels request                    | Email                   | ✅                                |
| `notify-upload-failed`             | Upload failure alert                   | Email                   | ✅                                |
| `notify-onboarding-complete`       | Client finished onboarding             | Slack + Email           | ✅                                |
| `notify-branding-deck-ready`       | Branding deck uploaded                 | Email                   | ✅                                |
| `notify-studio-booking`            | Studio session booked                  | Email                   | ✅                                |
| `notify-talent-interest`           | Talent network interest                | Email                   | 🗑️ DROP                           |
| `notify-project-editor-assignment` | Editor assigned to project             | Email                   | ✅                                |
| `process-email-queue`              | Drains `email_queue` table (cron 1min) | Resend → Lovable Native | 🔄 REWORK on Lovable Native Email |
| `send-magic-link-email`            | Magic link delivery                    | Resend → Lovable Native | 🔄                                |
| `send-password-reset`              | 14-char temp password email            | Resend → Lovable Native | 🔄                                |
| `send-client-credentials`          | Initial credentials email              | Resend → Lovable Native | 🔄                                |
| `send-client-invitation`           | Workspace invite email                 | Resend → Lovable Native | 🔄                                |
| `send-client-magic-link`           | Client-side magic link                 | Resend → Lovable Native | 🔄                                |
| `send-video-ready-email`           | "Your video is ready" email            | Resend → Lovable Native | 🔄                                |
| `send-video-ready-notification`    | Push + in-app for video ready          | Web Push                | ✅                                |
| `send-announcement`                | Tenant-wide announcement               | Resend → Lovable Native | 🔄                                |
| `send-test-email`                  | QA tool                                | Resend → Lovable Native | ✅                                |
| `send-archive-notification`        | Workspace archived                     | Email                   | ✅                                |
| `send-unarchive-notification`      | Workspace unarchived                   | Email                   | ✅                                |
| `send-pause-notification`          | Workspace paused                       | Email                   | ✅                                |
| `send-reactivation-email`          | Workspace reactivated                  | Email                   | ✅                                |
| `send-deletion-confirmation`       | Account deletion confirm               | Email                   | ✅                                |
| `send-admin-client-notification`   | Admin → client custom notification     | Email                   | ✅                                |
| `send-custom-client-notification`  | Same, configurable template            | Email                   | ✅                                |
| `save-push-subscription`           | Stores Web Push subscription           | DB only                 | ✅                                |
| `get-vapid-public-key`             | Returns VAPID public key               | DB only                 | ✅                                |

#### Slack integration

| Function               | What it does                  | Rebuild |
| ---------------------- | ----------------------------- | ------- |
| `slack-invite-channel` | Invites bot to channel        | ✅      |
| `slack-join-channels`  | Joins all configured channels | ✅      |
| `slack-test-dm`        | Test DM                       | ✅      |

#### CRM / Sales (Calendly + Fireflies + Stripe)

| Function                      | What it does                   | External services | Rebuild                 |
| ----------------------------- | ------------------------------ | ----------------- | ----------------------- |
| `calendly-webhook`            | Receives event webhooks        | Calendly          | ✅                      |
| `setup-calendly-webhook`      | Registers webhook              | Calendly          | ✅                      |
| `sync-calendly-events`        | Hourly cron pull               | Calendly          | ✅                      |
| `create-calendly-link`        | Generates booking link         | Calendly          | ✅                      |
| `cancel-calendly-event`       | Cancels a booking              | Calendly          | ✅                      |
| `fireflies-proxy`             | GraphQL proxy for transcripts  | Fireflies         | ✅                      |
| `schedule-call-reminders`     | 15min cron for call reminders  | DB + Email        | ✅                      |
| `receive-lead-webhook`        | Inbound lead capture           | Webhook           | ✅                      |
| `receive-partnership-webhook` | Inbound partnership form       | Webhook           | ✅                      |
| `receive-editor-application`  | Inbound editor application     | Webhook           | 🔄 MERGE into Forms     |
| `receive-agency-metrics`      | External metrics ingest        | Webhook           | ✅                      |
| `stripe-webhook`              | Stripe event receiver          | Stripe            | ✅                      |
| `stripe-sync`                 | Reconciliation cron (6h)       | Stripe            | ✅                      |
| `stripe-dashboard-stats`      | Owner dashboard data           | Stripe            | ✅                      |
| `stripe-finance-stats`        | Owner finance data             | Stripe            | ✅                      |
| `apply-stripe-matches`        | Auto-match payments to clients | Stripe + DB       | ✅                      |
| `preview-stripe-matches`      | Preview before applying        | Stripe + DB       | ✅                      |
| `oauth-meta-init`             | Meta OAuth start               | Meta              | ✅ + extend for posting |
| `oauth-meta-callback`         | Meta OAuth callback            | Meta              | ✅                      |

#### Auth / user management

| Function                 | What it does                      | Rebuild                              |
| ------------------------ | --------------------------------- | ------------------------------------ |
| `create-team-member`     | Invites internal team member      | ✅                                   |
| `create-client`          | Manually creates client workspace | ✅                                   |
| `create-client-webhook`  | Auto-create client from webhook   | 🔄 REWORK as Send-Payment automation |
| `create-project`         | Creates a project                 | ✅                                   |
| `change-user-role`       | Validates + applies role change   | ✅                                   |
| `delete-team-member`     | Removes internal user             | ✅                                   |
| `delete-client-complete` | Removes client + cascade          | ✅                                   |
| `delete-user-complete`   | Full user purge                   | ✅                                   |
| `delete-content-data`    | Removes content for a workspace   | ✅                                   |
| `delete-media-items`     | Removes media library items       | ✅                                   |
| `manage-user-access`     | Grant/revoke client access        | ✅                                   |
| `magic-link-login`       | Validates magic link token        | ✅                                   |
| `reset-user-password`    | Single-user reset                 | ✅                                   |
| `reset-passwords`        | Bulk reset (admin tool)           | ✅                                   |

#### AI / content

| Function                  | What it does                               | External   | Rebuild                                        |
| ------------------------- | ------------------------------------------ | ---------- | ---------------------------------------------- |
| `clips-ai-chat`           | Jarvis chat                                | OpenAI     | 🔄 Switch to GPT-5 Mini via Lovable AI Gateway |
| `auto-fill-foundation`    | AI-fills client foundation from onboarding | OpenAI     | 🔄 Same                                        |
| `generate-bio`            | AI bio generator                           | OpenAI     | 🔄 Same                                        |
| `optimize-script-section` | AI script polish                           | OpenAI     | 🔄 Same                                        |
| `regenerate-ai-columns`   | AI fill custom CRM columns                 | OpenAI     | 🔄 Same                                        |
| `regenerate-caption`      | AI caption generator                       | OpenAI     | 🔄 Same                                        |
| `generate-transcript`     | Video transcription                        | AssemblyAI | ✅                                             |
| `retry-transcription`     | Retry failed transcript                    | AssemblyAI | ✅                                             |
| `process-ai-context-file` | Indexes uploaded context files             | OpenAI     | 🔄                                             |
| `scrape-content-vault`    | Scrapes URLs for content vault             | Apify      | ✅                                             |

#### Public sharing

| Function                        | What it does                | Rebuild |
| ------------------------------- | --------------------------- | ------- |
| `generate-review-token`         | Per-video share link        | ✅      |
| `validate-review-token`         | Validates per-video token   | ✅      |
| `generate-project-review-token` | Per-project share link      | ✅      |
| `validate-project-review-token` | Validates per-project token | ✅      |
| `resolve-short-link`            | `/v/:code` resolver         | ✅      |
| `og-metadata`                   | Dynamic Open Graph metadata | ✅      |

#### Talent network (DROP all)

| Function         | What it does           | Rebuild |
| ---------------- | ---------------------- | ------- |
| `talent-apply`   | Application submission | 🗑️ DROP |
| `talent-approve` | Admin approves talent  | 🗑️ DROP |
| `talent-hire`    | Client hires talent    | 🗑️ DROP |

#### Logging

| Function           | What it does                     | Rebuild |
| ------------------ | -------------------------------- | ------- |
| `log-activity`     | Inserts into `activity_logs`     | ✅      |
| `log-client-error` | Inserts into `client_error_logs` | ✅      |
| `log-login`        | Inserts into `login_history`     | ✅      |
| `log-upload-event` | Inserts into `upload_logs`       | ✅      |

#### Misc

| Function            | What it does              | Rebuild |
| ------------------- | ------------------------- | ------- |
| `get-media-library` | Lists media library items | ✅      |

### 5.2 Function configuration

From `supabase/config.toml`:

- ~25 functions explicitly set `verify_jwt = true` (require auth)
- ~92 functions explicitly set `verify_jwt = false` (public/webhook/cron — auth validated in code where needed)
- All functions share CORS helper at `_shared/cors.ts` with whitelisted origins (production + Lovable preview subdomains)

> **Rebuild:** Lovable-managed edge functions deploy with `verify_jwt = false` by default. Validate JWTs in code for protected functions (Fireflies proxy is a good template).

---

## 6. Secrets & Environment Variables

**Total configured: 35 secrets.** Auto-injected env vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`) are not counted.

### 6.1 Cloudflare (video infrastructure) — KEEP ALL

| Secret name                       | Purpose                       | Rebuild                               |
| --------------------------------- | ----------------------------- | ------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`           | Account identifier            | ✅                                    |
| `CLOUDFLARE_API_TOKEN`            | Stream API auth               | ✅                                    |
| `CLOUDFLARE_CUSTOMER_SUBDOMAIN`   | Stream playback subdomain     | ✅                                    |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`     | R2 S3-compatible access key   | ✅                                    |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key                 | ✅                                    |
| `CLOUDFLARE_R2_BUCKET_NAME`       | R2 bucket for originals       | ✅                                    |
| `CLOUDFLARE_R2_ENDPOINT`          | R2 S3-compatible endpoint URL | ✅                                    |
| `CLOUDFLARE_R2_PUBLIC_URL`        | R2 public URL prefix          | ✅                                    |
| `CLOUDFLARE_R2_API`               | Legacy R2 token               | 🗑️ Likely duplicate — verify and drop |
| `CLOUDFLARE_S3_API`               | Legacy alias                  | 🗑️ Likely duplicate — verify and drop |

### 6.2 Stripe — DEDUPLICATE

| Secret name          | Purpose                       | Rebuild                                              |
| -------------------- | ----------------------------- | ---------------------------------------------------- |
| `Stripe_Secret_API`  | Stripe secret key (BYOK)      | ✅ KEEP one                                          |
| `Stripe_Secret_API2` | Duplicate secret key          | 🗑️ DROP — pick one and rename to `STRIPE_SECRET_KEY` |
| `Signing_Secret`     | Stripe webhook signing secret | ✅ KEEP, rename to `STRIPE_WEBHOOK_SECRET`           |

### 6.3 AI providers — TRIM

| Secret name          | Purpose                             | Rebuild                                                         |
| -------------------- | ----------------------------------- | --------------------------------------------------------------- |
| `OPEN_AI_API`        | OpenAI key (Jarvis, captions, etc.) | 🔄 REPLACE with `LOVABLE_API_KEY` (auto-managed) for GPT-5 Mini |
| `Assembly_AI_API`    | AssemblyAI transcription            | ✅ KEEP                                                         |
| `APIFY_API_TOKEN`    | Apify scraper for content vault     | ✅ KEEP                                                         |
| `ELEVENLABS_API_KEY` | Voice generation                    | 🗑️ DROP per PRD                                                 |
| `ElevenLabs_api`     | Duplicate                           | 🗑️ DROP                                                         |

### 6.4 Email — REPLACE

| Secret name      | Purpose             | Rebuild                                    |
| ---------------- | ------------------- | ------------------------------------------ |
| `RESEND_API_KEY` | Transactional email | 🗑️ DROP — Lovable Native Email replaces it |

### 6.5 Calendly — TENANT-SCOPE

| Secret name                                    | Purpose                       | Rebuild                                          |
| ---------------------------------------------- | ----------------------------- | ------------------------------------------------ |
| `jaafar_calendly_account_api_tca_sales_europe` | Per-rep Calendly key (Europe) | 🔄 REWORK — store per-tenant, not per-rep, in DB |
| `kamal_calendly_account_api_tca_sales_uae`     | Per-rep Calendly key (UAE)    | 🔄 Same                                          |

### 6.6 Slack — KEEP

| Secret name     | Purpose                             | Rebuild |
| --------------- | ----------------------------------- | ------- |
| `SLACK_API_KEY` | Slack bot token (connector-managed) | ✅ KEEP |

### 6.7 Meta OAuth — KEEP

| Secret name       | Purpose                                  | Rebuild |
| ----------------- | ---------------------------------------- | ------- |
| `META_APP_ID`     | Meta app ID (analytics + future posting) | ✅ KEEP |
| `META_APP_SECRET` | Meta app secret                          | ✅ KEEP |

### 6.8 Other integrations

| Secret name                   | Purpose                              | Rebuild                          |
| ----------------------------- | ------------------------------------ | -------------------------------- |
| `FIREFLIES_API_KEY`           | Fireflies GraphQL auth               | ✅ KEEP                          |
| `Attio_api_key`               | Attio CRM legacy import              | 🗑️ DROP — replaced by native CRM |
| `MAKE_STUDIO_BOOKING_WEBHOOK` | Make.com webhook for studio bookings | ⚠️ VERIFY usage; likely DROP     |

### 6.9 Webhook signing secrets — KEEP ALL

| Secret name                  | Purpose                         |
| ---------------------------- | ------------------------------- |
| `LEADS_WEBHOOK_SECRET`       | Validates inbound lead webhooks |
| `ONBOARDING_WEBHOOK_SECRET`  | Validates onboarding webhook    |
| `PARTNERSHIP_WEBHOOK_SECRET` | Validates partnership webhook   |
| `My_METRICS_SECRET`          | Validates external metrics push |

### 6.10 Web Push — KEEP

| Secret name         | Purpose                              |
| ------------------- | ------------------------------------ |
| `VAPID_PUBLIC_KEY`  | Browser push subscription public key |
| `VAPID_PRIVATE_KEY` | Server-side push signing key         |

### 6.11 Lovable-managed (do not migrate)

| Secret name       | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `LOVABLE_API_KEY` | Auto-provisioned for Lovable AI Gateway. Rotate via dedicated tool. |
| `SITE_URL`        | Production site URL (or set in `auth.site_url`)                     |

### 6.12 Secrets summary table for the rebuild

**Recommended new secret list (clean, deduplicated):**

```
# Cloudflare
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
CLOUDFLARE_CUSTOMER_SUBDOMAIN
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_ENDPOINT
CLOUDFLARE_R2_PUBLIC_URL

# Stripe (BYOK per tenant in future; for v1 single-tenant)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Transcription + scraping
ASSEMBLYAI_API_KEY
APIFY_API_TOKEN

# Calendly + Fireflies
FIREFLIES_API_KEY
# (Calendly keys → DB, not env)

# Slack (connector-managed)
SLACK_API_KEY

# Meta + future cross-platform OAuth
META_APP_ID
META_APP_SECRET
TIKTOK_CLIENT_KEY            # ➕ NEW for direct posting
TIKTOK_CLIENT_SECRET         # ➕ NEW
LINKEDIN_CLIENT_ID           # ➕ NEW
LINKEDIN_CLIENT_SECRET       # ➕ NEW
YOUTUBE_CLIENT_ID            # ➕ NEW
YOUTUBE_CLIENT_SECRET        # ➕ NEW
X_CLIENT_ID                  # ➕ NEW (optional)
X_CLIENT_SECRET              # ➕ NEW

# Webhook signing
LEADS_WEBHOOK_SECRET
ONBOARDING_WEBHOOK_SECRET
PARTNERSHIP_WEBHOOK_SECRET
METRICS_WEBHOOK_SECRET       # rename of My_METRICS_SECRET

# Web Push
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY

# Auto-managed (do NOT manually add)
# LOVABLE_API_KEY            ← rotate via tool, not secrets UI
# SUPABASE_URL                ← auto
# SUPABASE_ANON_KEY           ← auto
# SUPABASE_SERVICE_ROLE_KEY   ← auto
# SUPABASE_DB_URL             ← auto
```

**That's ~25 secrets vs 35 today** — a 30% reduction by dropping duplicates, ElevenLabs, Resend, Attio, and per-rep Calendly keys.

---

## 7. API Configuration

From `supabase/config.toml`:

| Setting                 | Current value                                                             | Rebuild                                                        |
| ----------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `api.enabled`           | `true`                                                                    | ✅                                                             |
| `api.port` (local)      | `54321`                                                                   | n/a                                                            |
| `api.schemas`           | `["public", "graphql_public"]`                                            | ✅                                                             |
| `api.extra_search_path` | `["public", "extensions"]`                                                | ✅                                                             |
| `api.max_rows`          | `1000`                                                                    | ✅                                                             |
| **REST API**            | Enabled (PostgREST, default Supabase)                                     | ✅                                                             |
| **GraphQL API**         | Enabled (`pg_graphql` extension installed)                                | ⚠️ Currently UNUSED by the app — OPTIONAL to enable in rebuild |
| **Realtime**            | Enabled (used heavily for chat + comments + version updates)              | ✅                                                             |
| **Rate limiting**       | Default Supabase per-IP / per-token rate limits — no custom configuration | ⚠️ VERIFY in dashboard for production                          |
| **CORS**                | Enforced at edge function layer via `_shared/cors.ts` whitelist           | ✅                                                             |

### Realtime channels in use

The app subscribes to Postgres Changes on these tables (via `useRealtime*` hooks):

- `chat_messages`, `chat_threads`, `chat_reactions`, `chat_mentions`
- `content_versions`, `content_items` (status changes)
- `video_comments`, `video_annotations`
- `notifications`

> **Rebuild:** ensure `ALTER PUBLICATION supabase_realtime ADD TABLE …` runs for each of these.

---

## 8. Manual Verification Checklist (Dashboard-only)

Things I cannot extract from SQL or filesystem — **screenshot or copy these from the current Supabase dashboard before tearing down or rebuilding:**

- [ ] **Region** of the current project (Settings → General)
- [ ] **Auth → Email Templates** — copy HTML body of: Confirm signup, Invite user, Magic Link, Reset password, Change email
- [ ] **Auth → URL Configuration** — production Site URL + all redirect URLs
- [ ] **Auth → Providers** — Google OAuth client ID + secret (if enabled)
- [ ] **Auth → SMTP settings** — custom SMTP config (if any)
- [ ] **Auth → Rate Limits** — current rate limit values
- [ ] **Auth → Sessions** — session timeout and refresh settings beyond what's in `config.toml`
- [ ] **Database → Cron Jobs** — exact `pg_cron` schedules
- [ ] **Database → Webhooks** — any database webhooks configured outside of triggers
- [ ] **Database → Backups** — backup schedule + retention
- [ ] **Storage → Each bucket → Policies** — copy SQL of all `storage.objects` policies (29 total across 9 buckets)
- [ ] **Edge Functions → Each function** — verify deployed version matches repo
- [ ] **Reports → Recent Errors** — check for unresolved infra issues before migrating
- [ ] **Project Settings → API** — confirm GraphQL toggle status
- [ ] **Connectors / Integrations** — Slack workspace, any others

---

## 9. Rebuild Setup Order

Follow this order in the new Lovable Cloud project:

1. **Provision project** in Lovable Cloud → confirm region matches preferred zone
2. **Configure Auth** (Auth → Providers + URL Config + Email Templates)
   - Enable: Email + Password, Google OAuth
   - Set Site URL + redirect URLs
   - Configure email templates (use Lovable Native Email)
   - Enable HIBP password check
   - Set JWT expiry = 3600s, refresh token rotation = on, anonymous = off
3. **Add secrets** in this exact order (so functions don't fail on first deploy):
   - Cloudflare (8 keys) → unblocks video pipeline
   - Stripe (2 keys) → unblocks billing
   - VAPID (2 keys) → unblocks push notifications
   - Webhook signing secrets (4 keys) → unblocks inbound webhooks
   - Other integrations (AssemblyAI, Apify, Fireflies, Meta, Slack)
4. **Enable extensions**: `uuid-ossp`, `pgcrypto`, `pg_cron`, `pg_net`, `pg_stat_statements`, `supabase_vault` (Lovable Cloud enables these by default)
5. **Run schema migrations** (in order):
   - Create `tenants` table FIRST
   - Create all enum types (with new role names: `manager`, `senior_editor`, `content_creator`, `closer`, `moderator`)
   - Create modular config tables (`statuses`, `video_types`, `deal_stages`, `ai_prompts`, `notification_rules`)
   - Create core tables (`profiles`, `user_roles`, `clients`, `projects`, `cycles` (renamed from `interviews`), `content_items`, etc.)
   - Create remaining domain tables (CRM, chat, billing, etc.)
   - Add `tenant_id` FK + RLS policy to every business table
6. **Create database functions + triggers**
   - Universal `update_updated_at_column()` first
   - Security-definer RLS helpers (`has_role`, `tenant_id_for_user`, etc.)
   - Notification triggers (now reading from `notification_rules`)
   - All other triggers
7. **Create storage buckets** with size limits and MIME restrictions
8. **Create storage RLS policies** per bucket
9. **Deploy edge functions** (the rebuilt set, not all 117 — drop talent + duplicates)
10. **Configure `pg_cron` schedules** for cleanup + sync jobs
11. **Enable Realtime** on chat, content, comments, notifications tables
12. **Seed default tenant** + first owner user
13. **Smoke test**: sign up → create workspace → upload video → review → notification → chat

---

_End of Supabase Configuration Reference. Companion to `PRD.md`, `PERMISSIONS-MATRIX.md`, `DATABASE-SCHEMA.md`, and `UI-INVENTORY.md`._
