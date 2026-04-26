# ClipsOS V2 — Active Context

> Last updated: 2026-04-26

## Current Phase: Management & Branding Infrastructure 🔄

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

### Frontend: Dashboard Pages IN PROGRESS 🔄

**Navigation Architecture (STANDARDIZED):**
- **Universal TopNav** — one bar, every page, never hides
  - Left: title + optional tabs (via `WorkspaceContext`)
  - Right: Ask Clips ✨ + ☀/🌙 theme toggle (functional via BrandingContext) + 🔔 bell
  - No role badges in the header
- **Sidebar** — collapse/expand toggle inside sidebar (next to logo)
  - `SidebarTrigger` lives in `AppSidebar`, NOT in `AppShell` header
  - Logo and app name are dynamic via `useBranding()` (supports image or text fallback)
  - Search bar uses semantic tokens (no hardcoded hex)
- **No duplicate page headings** — the header bar shows the page name, no in-page h1 repeats it
- **WorkspaceContext** — pages call `setHeaderConfig()` to configure the header's left side (title + tabs)
- **Management section** — added to owner sidebar nav, above profile card

**Client Workspace Tabs (built):**
| Tab | Status | Content |
|-----|--------|---------|
| Overview | ✅ | Pipeline cards, projects, growth chart, notes |
| Production | ✅ | Sub-nav (All Plans, Cycles), DataTable |
| Content | 🚧 | Placeholder |
| Journey | ✅ | Vertical timeline, step states, progress card |
| Sales | ✅ | 3 stat cards, subscriptions, payment history, activity feed |
| Analytics | 🚧 | Placeholder |
| Activity | 🚧 | Placeholder |
| Settings | 🚧 | Placeholder |

**CRM Page (built):**
- People table with sort/filter/import/export toolbar
- Two-line header: list selector + toolbar controls

### What to Build Next
1. Polish App Branding page (file upload for logos instead of URL input)
2. Build Integrations Management sub-page
3. Connect static data to Supabase/TanStack Query for remaining pages
4. Build CRM Pipeline/Deals views

### Key Architecture Decisions Made
- All CRM tables have `tenant_id` (legacy didn't)
- `sales_territories` → `closer_regions`
- `content_comments` → unified `video_comments`
- `activity_log` added for audit trail (new in V2)
- **Universal header bar** — one TopNav component, context-driven content
- **No duplicate headings** — nav bar is the single source of truth for page identity
- **Dual theme support** — `:root` = light mode, `.dark` = dark mode in CSS; BrandingContext controls switching
- **BrandingContext** — wraps the entire app (inside AuthProvider); loads tenant-specific branding on auth
- **All hardcoded colors converted to semantic tokens** — TopNav, Sidebar, Search bar all use `var(--*)` tokens
- **Font: Arial** for all body text (per user directive), display font for headings
