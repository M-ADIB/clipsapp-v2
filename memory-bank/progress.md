# ClipsOS V2 — Progress Tracker

> Last refreshed: 2026-05-25 — Production Overview feature implemented and verified on Owner and Manager dashboards

## Platform: Supabase (`toyekrhhzqmltstrycdv`) ✅
- [x] Active repo: `M-ADIB/clipsos-hub`
- [x] Supabase backend managed via MCP — agents have full SQL/migration/edge-function access
- [x] Project ID: `toyekrhhzqmltstrycdv`, Region: `ap-southeast-1`

## Database ✅

### Schema Reference (89 public tables)
- CRM tables: `crm_people` (12,373 rows), `crm_deals` (154), `crm_companies`, `crm_editors`, `crm_deal_options`
- Core tables: `tenants` (1), `profiles` (60), `user_roles` (60), `clients` (33), `projects` (34), `cycles` (5), `videos` (854)
- Version tables: `video_versions` (946), `thumbnail_versions` (3)
- Lookup tables: `statuses` (11), `deal_stages`, `video_types` (9)
- Finance tables: `stripe_charges` (224), `stripe_subscriptions` (138), `finance_transactions`, `operating_costs`, `stripe_events_log` (36)
- Template tables: `project_type_templates` (JSONB `config` column), `custom_journey_steps` (16)
- Studio tables: `client_foundation` (+ `foundation_ready` bool), `client_audience_avatars` (1), `studio_scripts` (5), `studio_hooks`, `content_vault`
  - `cycles.body_json` (JSONB) — stores freeform TipTap content for inline script toggles
- Forms tables: `forms` (1), `form_fields` (6), `form_submissions` (1)
- Chat tables: `chat_rooms` (37), `chat_threads` (36), `chat_messages` (10), `chat_mentions`, `chat_reactions`, `chat_read_receipts` (7), `chat_attachments` (1), `chat_mutes`, `chat_room_access_overrides` (3)
- Team chat: `team_chat_rooms`, `team_chat_members`
- Email tables: `email_templates` (3), `email_campaigns`, `email_campaign_recipients`, `email_queue`, `email_master_template` (1), `email_send_log`, `email_send_state`, `email_unsubscribe_tokens`, `suppressed_emails`
- Review tables: `video_comments` (12), `video_annotations` (2), `comment_attachments`
- Notification tables: `notifications` (12,203), `notification_preferences`, `push_subscriptions`
- Upload tables: `upload_sessions` (9)
- AI tables: `ai_conversations` (135), `ai_messages`, `ai_prompts`, `ai_tool_calls`, `ai_user_memory`
- Access tables: `client_access` (29), `client_team_assignments`, `client_invitations`, `client_members`, `client_onboarding`, `client_journey_steps`, `client_notes` (2)
- Share tables: `guest_review_links` (5)
- Leads tables: `leads`, `leads_custom_columns`, `leads_saved_views`, `follow_ups`
- Other: `credentials`, `closer_regions`, `calendly_events`, `partnership_applications`, `platform_admins` (3), `platform_plans` (4), `saved_filter_views`, `custom_columns`, `custom_column_values`, `activity_log`, `video_status_history`, `status_role_permissions`, `trial_reels`, `video_editors`, `tasks` (2), `analytics_events` (new)

### Security Functions (Deployed & Optimized)
- `tenant_id_for_user()`, `has_role()`, `has_any_role()`, `get_user_role()`, `is_platform_admin()` (all optimized with user-isolated transaction-local caching via PostgreSQL GUCs to solve the RLS performance multiplier)
- `is_owner_or_manager()`, `role_hierarchy_level()`, `can_manage_role()`
- `seed_tenant_defaults()`, `submit_public_form()`, `delete_chat_room()`

### Edge Functions (15 deployed to Supabase)
| Slug | JWT | Purpose |
|------|-----|---------|
| `stripe-webhook` | ❌ | Stripe payment events (v9 — invoice.payment_succeeded) |
| `stripe-actions` | ✅ | Payment links, subscriptions |
| `email-sender` | ✅ | Campaign/transactional email (Resend) |
| `send-auth-email` | ❌ | Auth Hook — branded auth emails (Resend + master template) |
| `sync-calendly-events` | ✅ | Calendly V2 → DB sync |
| `initialize-upload` | ❌ | Dual-track upload init |
| `presign-r2-part` | ❌ | R2 multipart presigning |
| `complete-upload` | ❌ | Finalize upload + DB |
| `cleanup-stale-uploads` | ✅ | Cron cleanup |
| `track-analytics` | ❌ | Landing page analytics event ingestion (WIP) |
| `debug-upload-config` | ❌ | Upload env debug |
| `create-dev-user` | ❌ | Dev seeding |
| `bulk-create-accounts` | ✅ | Batch account creation |
| `bulk-sql-import` | ✅ | Batch data import |
| `run-migration` | ✅ | Remote migration runner |

## Frontend: clipsos-hub ✅

### Infrastructure ✅
- [x] React 19 + Vite 7 + TypeScript (strict)
- [x] Tailwind CSS 4 (`@theme inline`) + shadcn/ui (Radix)
- [x] TanStack Router v1 (file-based routing) — 125 authenticated route files
- [x] TanStack Query for server state
- [x] Auth system (`src/contexts/AuthContext.tsx`) with role-based routing
- [x] Supabase client configured
- [x] Dark mode via `.dark` class toggle
- [x] OKLCH color system with CSS custom properties

### Navigation ✅
- [x] `AppSidebar.tsx` — role-aware collapsible sidebar with persistent category collapse
- [x] `WorkspaceContext` → `setHeaderConfig()` for page title + tabs
- [x] `nav-config.ts` — sidebar items per role
- [x] Search bar in sidebar
- [x] Dashboard active-state bug fixed

### Client Dashboard Pages ✅ (Mobile-Responsive ✅)
- [x] `/client` — Client Home Dashboard
  - [x] 3 StatCards (Videos This Month, Pending Review, Scheduled)
  - [x] Recent Videos list with StatusBadge
  - [x] Posting Queue preview via DashboardPanel
  - [x] What's Next TaskCards (3-column grid)
  - [x] Welcome message with dynamic client name
  - [x] **Mobile: Pipeline cards → horizontal scroll with snap. What's Next/Alerts → vertical stack. Plans → single column**
- [x] `/client/videos` — My Videos (Table | Reels | Grid views)
- [x] `/client/queue` — Posting Queue (Calendar + List views)
- [x] `/client/files` — Client Files

### Owner Dashboard Pages ✅
- [x] Owner Dashboard — 3 tabs (Agency Command, Sales Overview, Production Overview) with interactive Recharts, active cycle tracking, and inline spreadsheet editor
- [x] Owner Finance — 4 tabs (Overview, Revenue Breakdown, Subscriptions, Costs) — AED currency
- [x] All owner routes functional (30 route files)

### Manager Dashboard ✅
- [x] Manager Dashboard — 2 tabs (Production Command, Production Overview) with live tracking, active cycle tracking, and inline spreadsheet editor
- [x] 24 manager route files — full production/sales/communication parity with owner minus finance
- [x] Manager Settings — Team-only view (no App Branding, Billing, Integrations)
- [x] Role-aware navigation with dynamic `basePath`

### Editor Dashboard ✅
- [x] Real Supabase data via `useEditorVideos()` (video_editors join)
- [x] 4 StatCards (Assigned, In Progress, Completed This Week, Overdue)
- [x] Route layout: `editor.tsx` → `<Outlet />`, 5 child routes
- [x] Team Chat added

### Senior Editor ✅
- [x] Dynamic 11-status Kanban from `statuses` table
- [x] Configurable column visibility, saved views (localStorage)
- [x] Rich video cards, per-column pagination, search/filter

### Content Creator ✅
- [x] Calendly widget on dashboard + dedicated `/content-creator/schedule` route
- [x] Reuses Closer's Calendly infrastructure
- [x] Kanban Production Board (1:1 architectural mirror of Senior Editor board, customized for CC captions/hooks/freebies)
- [x] ContentVideoCard showcasing captions with approval, hooks, freebies, and lead magnets with copy-to-clipboard functionality
- [x] Deep filtering popover (by Caption availability, Caption approval, Client, Editor, and Video Type)

### Closer ✅
- [x] Calendly sync via `sync-calendly-events` Edge Function
- [x] Pipeline view, leads table, calls page

### Moderator ✅
- [x] Posting Queue (3 StatCards, filter pills, DataTable)
- [x] Status transitions: approved → scheduled → posted
- [x] Team Chat route

### Platform Admin ✅
- [x] Tenant management, KPI cards, user/video/revenue stats

### Finance Module ✅
- [x] 4-tab layout: Overview, Revenue Breakdown, Subscriptions, Costs
- [x] AED currency with USD hints
- [x] Operating costs CRUD, payment recording, payment links
- [x] Helpers: `USD_TO_AED = 3.6725`, `fmtCents()`, `fmtAmount()`, `usdHint()`

### Dashboard Interactive Upgrade ✅
- [x] Revenue sparklines → Recharts BarChart with tooltips
- [x] Production velocity → Recharts with current-month highlight
- [x] Editor Performance — top 3 medals, ranked by completedThisMonth

### Studio ✅ (Editor Phase 1 Complete)
- [x] Two-state dashboard (table landing → client detail)
- [x] Client Switcher Dropdown
- [x] Foundation (17 Qs + Dump Context), Pillars, Audience views
- [x] CycleEditor with Save as Script (official `@tiptap/extension-details`)
- [x] RichTextEditor — pinned toolbar, bubble menu, context menu, focus-safe
- [x] FontSizeExtension, EditorToolbar

### Template & Project Builder ✅ (100/100)
- [x] Dual-mode wizard (4-step standalone, 3-step embedded)
- [x] JSONB config pattern, template CRUD, smart save
- [x] Payment plans, contributor structure, workflow reset

### Video Review System ✅
- [x] VideoPreviewModal — Frame.io-inspired, annotations, voice notes
- [x] ThumbnailPreviewDialog — image review + comments + versions
- [x] ShareDialog — role-gated, short URLs, email capture

### Global @Mention System ✅ (100/100)
- [x] Universal MentionTextarea + MentionPicker + MentionRenderer
- [x] 5 surface integrations, DB triggers for notifications
- [x] CSS tokens, ARIA, regex fix, reply mention support

### Email Hub ✅
- [x] 7 tabs: Templates, Editor, **Design** (master template), Compose, History, Scheduled, **Outbox**
- [x] `email_master_template` table — stores master shell HTML
- [x] `DesignTab.tsx` — visual master template editor
- [x] `OutboxTab.tsx` — sent email monitoring
- [x] `use-master-template.ts` — TanStack Query hook for master template CRUD
- [x] `use-email-templates.ts`, `use-email-campaigns.ts` — existing hooks

### Auth Email Branding ✅
- [x] `send-auth-email` Edge Function deployed (Supabase Auth Hook)
- [x] Renders auth emails (signup confirmation, password reset, magic link) through master template
- [x] Branded with ClipsOS logo, colors, and footer
- [x] Resend integration for delivery
- [x] `email-sender` Edge Function updated to inject master template shell

### Forms Module ✅
- [x] FormBuilder with drag-drop, field types, multi-step funnels
- [x] PublicFormPage with step navigation and conditional logic
- [x] `submit_public_form()` RPC for unauthenticated submissions

### Chat System ✅ (98/100)
- [x] Real-time messaging, rooms, threads, voice notes, mentions, reactions
- [x] DM name parsing fix, atomic room deletion, unread badges
- [x] ARIA labels, keyboard shortcuts, timestamp tooltips
- [x] **Message forwarding** — `ForwardMessageDialog` + `useForwardMessage()` + "↪ Forwarded" badge
- [x] **Message pinning** — `chat_pinned_messages` table + `PinnedMessagesBar` + 📌 indicator + RLS
- [x] **Rate limiting** — 500ms client-side throttle in `ChatInput.tsx` with toast feedback
- [x] **Query key cleanup** — `pinnedMessages` + `roomMembers` added to factory
- [ ] E2E tests (deferred to testing sprint)

### CRM Profile ✅
- [x] Attio-inspired layout: 9 tabs + sidebar
- [x] Overview, Activity, Deals, Calls, Emails, Company, Notes, Tasks, Files tabs

### Upload Engine ✅ (Hardened — 97/100 audit score)
- [x] Dual-track Stream + R2 upload pipeline
- [x] 4 Edge Functions: initialize-upload, presign-r2-part, complete-upload, cleanup-stale-uploads
- [x] Auto-versioning, crash recovery, cleanup cron
- [x] **10 GB file size limit** — client + server validation with toast errors
- [x] **Server-side MIME validation** — initialize-upload rejects non-video/non-image MIME types
- [x] **Server-side file size validation** — initialize-upload enforces 10GB limit server-side
- [x] **Idempotency guard** — initialize-upload returns existing session if (video_id, version_id, file_name) already active
- [x] **DB unique index** — `idx_upload_sessions_active_dedup` partial unique on (video_id, version_id, file_name) WHERE status IN ('uploading','initializing')
- [x] **Part number validation** — presign-r2-part validates part_number is positive integer and within r2_parts_total
- [x] **Parts count verification** — complete-upload logs warning if submitted parts count ≠ expected
- [x] **1 GB large file warning** — amber advisory for large uploads
- [x] **Network offline detection** — auto-pause on disconnect, auto-resume on reconnect
- [x] **Completion/failure toasts** — toast.success on complete, toast.error on failure
- [x] **Clear completed** — UploadQueue "Clear completed" button to remove finished jobs
- [x] **Auth header on cancelAll** — ensures cancel reaches server on publishable-key setups
- [x] **Offline banner** — WifiOff icon + inline banner in UploadQueue when offline
- [x] **Adaptive R2 chunking** — chunk size adjusts 5MB–100MB based on measured connection speed
- [x] **403 re-presign recovery** — expired presigned URLs automatically re-fetched on retry
- [x] **Upload speed display** — MB/s shown in UploadProgressBar during active uploads
- [x] **Mini progress pill** — minimized UploadQueue shows % progress with background fill
- [x] **User-friendly errors** — friendlyError() maps technical errors to actionable messages
- [x] **Stale session recovery** — recoverStaleSessions() wired on SIGNED_IN/TOKEN_REFRESHED auth events
- [x] **cleanup-stale-uploads fixed** — now uses AWS SDK S3Client with proper Signature V4 for R2 abort
- [x] Thumbnail upload support (thumbnails pass through as image/* MIME)
- [x] **Telemetry module** — `telemetry.ts` with structured event tracking, ring buffer, beacon flush, external sink hook
- [x] **Upload History** — `useUploadHistory` hook + `UploadHistory` component (paginated table with status filter, profile join)
- [x] **History Sheet** — "View History" button in UploadQueue opens Sheet with full upload session history
- [x] **Accessibility** — ARIA labels, roles, keyboard support on Dropzone/Queue/ProgressBar, role=alert on errors, sr-only live regions

### Data Migration ✅
- [x] 854 videos (was 827 → some new uploads)
- [x] 34 projects
- [x] 33 clients
- [x] 12,203 notifications (imported from legacy)
- [x] Migration scripts retained in `scripts/`

### Component Library ✅
- [x] StatCard (subtitle prop for USD hints), TaskCard, ProjectCard
- [x] StatusBadge, DataTable, DashboardPanel, VideoTypePill
- [x] TabPanel (keep-alive tabs pattern)
- [x] FullBleed (responsive container)

### Mobile Navigation ✅
- [x] MobileBottomNav (role-aware, 4-5 items)
- [x] MobileMoreDrawer (overflow items)
- [x] MobileSubTabs (section-specific horizontal tabs)
- [x] mobile-nav-config.ts (per-role configuration)

### FullBleed UI ✅
- [x] 60+ components standardized with FullBleed wrapper
- [x] 100% coverage across all 9 roles

### Dead Code Cleanup ✅
- [x] Deleted: `CreateProjectDialog.tsx` (717 lines)
- [x] Deleted: `ScriptToggleExtension.ts` (80 lines)
- [x] Moderator `PostsPage.tsx` removed, barrel cleaned

### TypeScript Health ✅
- [x] Supabase types regenerated (5,798 lines)
- [x] 35 TypeScript errors → 0
- [x] Committed & pushed: `de65c83` on `main`

### Client Workspace Settings ✅
- [x] Enhanced SettingsTab with 4 comprehensive sections
- [x] General Information: name, email, phone, company, job title, industry, location, start date, workspace type, description
- [x] Social Media: Instagram, TikTok, YouTube, LinkedIn, Twitter/X, Facebook, Website (maps to `social_links` JSONB)
- [x] Branding & Content: color palette manager, branding deck URL, default aspect ratio (maps to `color_palette`, `branding_deck_url`, `default_aspect_ratio`)
- [x] Production Settings: account status, videos per month, analytics toggle
- [x] Danger Zone: archive client
- [x] Available to Owner + Manager roles (SE/CC/Editor correctly excluded)
- [x] Zero migration needed — all fields map to existing `clients` table columns

## What's Left 🔲

### Priority 1 — Core Feature Gaps
- [x] ~~Client Workspace Settings Tab~~ → **DONE**
- [ ] **Guest Viewer Route** (`/r/:token`) — public shared video page with name+email identity gate
- [ ] **Settings sub-pages** — Team invite flow, Billing portal, Integrations connect
- [ ] **Onboarding flow** — first-time user experience

### Priority 2 — Studio Editor Phases
- [ ] **Phase 2** — Full formatting suite (table, task-list, image, LinkPopover, EmojiPicker)
- [ ] **Phase 3** — Threaded comments system (DB table + CommentMark extension + CommentSidebar)
- [ ] **Phase 4** — Polish (slash commands, drag-and-drop handles, autosave indicator, keyboard shortcuts)

### Priority 3 — Advanced Features
- [ ] **Resources Library overhaul** — Templates + Hooks Library + Content Vault (Apify scraping)
- [ ] **Chat E2E tests** — Playwright multi-session tests for realtime chat (deferred to testing sprint)
- [ ] **AI auto-extraction** — Foundation tab (call transcript → 17 Qs)
- [ ] **Save as Script → video row** — script-to-production pipeline
- [ ] **Stripe live wiring** — webhook processing for real-time payment events
- [ ] **Access Notifications** — trigger email when guest opens share link

## Repository
- **Repo:** `M-ADIB/clipsos-hub`
- **Local path:** `/Users/madibbaroudi/Desktop/Dashboards/New Clips App`
- **Branch:** `main`
- **Latest commit:** `7a7e368` (2026-05-23 - feat(scalability): add missing foreign key indexes and namespaced session-caching for RLS security helpers)
- **Codebase size:** 539 files (.ts + .tsx), 125 route files, zero TypeScript errors

