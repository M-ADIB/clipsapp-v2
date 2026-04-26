# ClipsOS V2 — Active Context

> Last updated: 2026-04-26

## Current Phase: Frontend Handoff → Lovable 🔜

### Database Status: COMPLETE ✅
All 28 migrations deployed. 60+ tables, 100+ RLS policies, 1 intentional lint (stripe_events_log locked).

| Phase | Tables | Status |
|-------|--------|--------|
| Phase 0: Foundation | tenants, profiles, user_roles, statuses, deal_stages, video_types, status_role_permissions | ✅ |
| Phase 1: Core Domain | clients, client_members, client_access, client_team_assignments, project_type_templates, projects, cycles, videos, video_versions, video_editors, trial_reels, thumbnail_versions | ✅ |
| Phase 2: Communication | chat_rooms, chat_threads, chat_messages, chat_mentions, chat_mutes, video_comments, comment_attachments, video_annotations, guest_review_links, client_invitations, notifications, notification_preferences, push_subscriptions | ✅ |
| Phase 3: CRM | crm_companies, crm_people, crm_deals, crm_deal_options, crm_editors, leads, partnership_applications, follow_ups, calendly_events, closer_regions | ✅ |
| Phase 4: Utility | saved_filter_views, custom_columns, custom_column_values, activity_log, leads_custom_columns, leads_saved_views | ✅ |
| Phase 5: Finance | stripe_charges, stripe_subscriptions, stripe_events_log, finance_transactions | ✅ |
| Phase 6: Studio/AI/Email/Tasks | client_foundation, studio_scripts, studio_hooks, content_vault, ai_prompts, email_templates, email_queue, video_status_history, client_onboarding, client_journey_steps, credentials, tasks | ✅ |

### Frontend Handoff Documentation: READY ✅
- `memory-bank/style-theme.md` — Colors, typography, spacing, component patterns
- `memory-bank/wireframes.md` — Page layouts for all 8 role dashboards
- Lovable Handoff Prompt — Full context artifact for Level Bill

### What Lovable Should Build First (Sprint 1)
1. Initialize Supabase client with typed hooks
2. Build auth flow (login, signup, Google OAuth, role-based redirect)
3. Create layout shell (sidebar + topnav + PageShell)
4. Build component primitives (DataTable, StatusBadge, EntityCard)

### Key Architecture Decisions Made
- All CRM tables have `tenant_id` (legacy didn't)
- `sales_territories` → `closer_regions`
- `content_comments` → unified `video_comments`
- `activity_log` added for audit trail (new in V2)
- `ai_prompts` per-tenant editable system prompts (new in V2)
- `email_queue` for unified email sending (new in V2)
- `client_journey_steps` for 16-step delivery timeline (new in V2)
- Finance tables are Owner-only at RLS level (not just UI hiding)
- `stripe_events_log` intentionally has no RLS policies (service_role only)
