# ClipsOS V2 — Active Context

> Last updated: 2026-05-18 (Full memory refresh — clean working tree on `de65c83`)

## Platform: Supabase (`toyekrhhzqmltstrycdv`)

### Deployment
- **Repo:** `M-ADIB/clipsos-hub` — **single branch: `main`**
- **Supabase Project:** `toyekrhhzqmltstrycdv` (ClipsApp) — agents have MCP/SQL access
- **Region:** ap-southeast-1
- **Key rule:** Agents can execute SQL, create migrations, deploy edge functions, and manage storage via the Supabase MCP.

### Agent Scope
- ✅ Frontend code (React, Tailwind 4, components)
- ✅ Hook/query code (TanStack Query, Supabase JS client calls)
- ✅ UI/UX design and implementation
- ✅ TypeScript types and interfaces
- ✅ Direct SQL execution via Supabase MCP
- ✅ Edge Function deployment via Supabase MCP
- ✅ Database migrations via Supabase MCP
- ✅ Storage bucket management via Supabase MCP

## Current Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 4 (`@theme inline`) + shadcn/ui (Radix) |
| Routing | TanStack Router v1 (file-based) |
| State | TanStack Query + React Context |
| Auth | `@/contexts/AuthContext.tsx` → `useAuth()` |
| Nav | `WorkspaceContext` → `setHeaderConfig()` |
| Rich Text | TipTap 3 (ProseMirror) — StarterKit + Color + Highlight + FontFamily + Underline + Link + FontSize + **Details** (official `@tiptap/extension-details` for collapsible toggle blocks) |
| Charts | Recharts (^2.15.4) — interactive BarChart with tooltips, hover cursors, animated entry |
| Toasts | Sonner |
| Email | Resend (via `email-sender` + `send-auth-email` Edge Functions) |
| Payments | Stripe (via `stripe-webhook` + `stripe-actions` Edge Functions) |

## Repository State (Checkpoint 2026-05-18)

- **Branch:** `main` only
- **Latest committed:** `3372898` — feat: comprehensive Client Workspace Settings
- **Uncommitted changes:** 0 (clean working tree)
- **Total source files:** 538 (.ts + .tsx)
- **Total route files:** 125 (under `_authenticated/`)
- **TypeScript errors:** 0 ✅

### Database State (Live)
| Table | Row Count |
|-------|-----------|
| `videos` | 854 |
| `video_versions` | 946 |
| `crm_people` | 12,373 |
| `crm_deals` | 154 |
| `profiles` | 60 |
| `user_roles` | 60 |
| `clients` | 33 |
| `projects` | 34 |
| `chat_rooms` | 37 |
| `chat_threads` | 36 |
| `stripe_charges` | 224 |
| `stripe_subscriptions` | 138 |
| `notifications` | 12,203 |
| `ai_conversations` | 135 |
| `statuses` | 11 |
| `video_types` | 9 |
| **Total public tables** | **88** |

### Deployed Edge Functions (14 total)
| Function | JWT | Purpose |
|----------|-----|---------|
| `stripe-webhook` | ❌ | Stripe payment event processing |
| `stripe-actions` | ✅ | Payment links, subscriptions |
| `email-sender` | ✅ | Campaign/transactional email via Resend |
| `send-auth-email` | ❌ | Auth Hook — branded signup/reset/magic-link emails via Resend |
| `sync-calendly-events` | ✅ | Calendly V2 API → `calendly_events` table (closer + CC) |
| `initialize-upload` | ❌ | Dual-track upload init (Stream + R2) |
| `presign-r2-part` | ❌ | R2 multipart upload presigning |
| `complete-upload` | ❌ | Finalize multipart upload + DB update |
| `cleanup-stale-uploads` | ✅ | Cron cleanup for abandoned uploads |
| `debug-upload-config` | ❌ | Debug helper for upload env vars |
| `create-dev-user` | ❌ | Dev-only user seeding |
| `bulk-create-accounts` | ✅ | Batch user account creation |
| `bulk-sql-import` | ✅ | Batch SQL data import |
| `run-migration` | ✅ | Remote migration runner |
| `invite-user` | (local only) | User invitation |
| `clips-chat` | (local only) | AI chat proxy |
| `download-media` | (local only) | Media download proxy |

## Frontend Architecture

### Layout Architecture — FullBleed System
- **`FullBleed`** (`@/components/app-shell/FullBleed.tsx`) — standardized responsive container wrapper
- **Every authenticated route-level page** is wrapped in `<FullBleed>` for edge-to-edge layout consistency
- **Standard internal padding:** `px-3 py-5 md:px-5 md:py-6`
- **Total coverage:** 60+ components with FullBleed — 100% UI parity across all 9 roles

### Navigation
- **TopNav:** Universal header bar — title + optional tabs via `WorkspaceContext`
- **Sidebar:** `AppSidebar.tsx` — role-aware nav from `nav-config.ts`, collapsible categories with persist, search
- **Mobile Nav:** `MobileBottomNav.tsx` — bottom navigation for small viewports with `MobileMoreDrawer.tsx` for overflow items and `MobileSubTabs.tsx` for section tabs
- **No duplicate page headings** — TopNav shows the page name; no inline `<h1>` headers
- **⛔ Header Ownership Rule:** Only the TOP-LEVEL route component may call `setHeaderConfig()`. See `systemPatterns.md`.

### Dashboard Pages Built (9 Roles + Platform Admin)
| Role | Route | Routes | Status |
|------|-------|--------|--------|
| Client | `/client/*` | 6 | ✅ Mobile-responsive |
| Owner | `/owner/*` | 30 | ✅ Full suite (Finance, CRM, Studio, Sales, HQ, Email, Forms) |
| Manager | `/manager/*` | 24 | ✅ Parity with owner minus finance/billing/branding |
| Senior Editor | `/senior-editor/*` | 10 | ✅ Dynamic 11-status Kanban, scoped clients/projects |
| Content Creator | `/content-creator/*` | 11 | ✅ Calendly widget, schedule route, Kanban Production Board |
| Editor | `/editor/*` | 5 | ✅ Real data, status mutation, team chat |
| Closer | `/closer/*` | 6 | ✅ Calendly sync via Edge Function, pipeline |
| Moderator | `/moderator/*` | 4 | ✅ Posting Queue, team chat |
| Platform Admin | `/platform/*` | 5 | ✅ Tenant management, KPIs |

### Completed Modules (Comprehensive)
| Module | Score | Key Files |
|--------|-------|-----------|
| **Studio** | ✅ | TipTap editor, Foundation, Pillars, Audience, Cycles, Scripts, CycleEditor |
| **Template Builder** | 100/100 | JSONB config, dual-mode wizard |
| **Project Builder** | 100/100 | 4-step wizard, embedded 3-step, templates |
| **Video Preview Modal** | ✅ | Frame.io-style, annotations, voice notes, mentions |
| **Thumbnail Preview** | ✅ | Image review + comments + versions |
| **Share Dialog** | ✅ | Role-gated, short URLs, email capture |
| **Global @Mention** | 100/100 | 5 surfaces, DB triggers, CSS tokens |
| **Email Hub** | ✅ | 7 tabs: Templates, Editor, Design, Compose, History, Scheduled, Outbox |
| **Master Email Template** | ✅ | `email_master_template` table + `DesignTab.tsx` + `use-master-template.ts` |
| **Auth Email Branding** | ✅ | `send-auth-email` Edge Function + Auth Hook configured |
| **Forms / Form Builder** | ✅ | Drag-drop builder, multi-step funnels, public forms |
| **Chat System** | 90/100 | Rooms, threads, voice notes, mentions, reactions, DMs |
| **Notifications** | ✅ | Bell popover, full page, 12k+ historical |
| **CRM** | ✅ | People, Companies, Deals, pipeline management |
| **CRM Profile** | ✅ | Attio-inspired 9-tab layout + sidebar |
| **Videos Grid** | ✅ | AG Grid-based, inline editing, status management |
| **Senior Editor Board** | ✅ | Dynamic 11-status Kanban, saved views |
| **Content Creator Board** | ✅ | Dynamic 11-status Kanban, customized for CC captions/hooks/freebies |
| **Finance Module** | ✅ | Revenue, breakdown, subscriptions, costs (AED primary) |
| **Pipeline Deals** | ✅ | New/Edit deal dialogs |
| **Dashboard Charts** | ✅ | Interactive Recharts, editor performance |
| **HQ Analytics** | ✅ | Overview + Editors tabs, reusable charts |
| **Team Member Profiles** | ✅ | Role-specific content per profile |
| **Personal Settings** | ✅ | User profile management |
| **Platform Admin** | ✅ | Tenant management, KPIs |
| **FullBleed UI** | ✅ | 60+ components standardized |
| **Mobile Navigation** | ✅ | Bottom nav, more drawer, sub-tabs |
| **Upload Engine** | 92/100 | Dual-track Stream+R2, idempotency guard, adaptive chunking (5-100MB), 403 re-presign, speed display (MB/s), server-side MIME/size validation, stale recovery, user-friendly errors |
| **Calendly Integration** | ✅ | Closer + CC, Edge Function sync |

### Currency Standard — AED Primary
- All monetary displays use AED (UAE Dirham) as primary currency
- USD conversion hints shown as small `≈ $X.XX` text
- Conversion rate: `USD_TO_AED = 3.6725` (fixed, in `finance-helpers.ts`)
- Stripe data stored in AED cents

### Query Keys Architecture (`src/hooks/query-keys.ts`)
| Namespace | Keys |
|-----------|------|
| `studio` | `brain`, `foundation`, `overview`, `scripts`, `cycles` |
| `mentions` | `users` |
| `chat` | `rooms`, `threads`, `messages`, `mentionSuggestions`, `unreadCounts`, `reactions` |
| `forms` | `all`, `list`, `detail`, `fields`, `submissions`, `submissionDetail`, `publicBySlug` |
| `notifications` | `list` |
| `emailTemplates` | `list`, `detail` |
| `finance` | `charges`, `subscriptions`, `transactions` |
| `operatingCosts` | `list` |
| `closerRegion` | `mine` |
| `calendlyEvents` | `list` |

## What to Build Next
1. **Client Workspace Settings Tab** — mirror old app settings (phone, social media, industry, goals, branding, etc.) — may require `ALTER TABLE clients` migration
2. **Studio Editor Phase 2** — Full formatting suite (table, task-list, image, LinkPopover, EmojiPicker)
3. **Studio Editor Phase 3** — Threaded comments system (DB table + CommentMark extension + CommentSidebar)
4. **Studio Editor Phase 4** — Polish (slash commands, drag-and-drop handles, autosave indicator, keyboard shortcuts)
5. **Guest Viewer Route** (`/r/:token`) — public page for shared video review with name/email gate
6. **Resources Library overhaul** — Templates + Hooks Library + Content Vault (Apify scraping planned)
7. **Chat remaining polish** — message forwarding UI, pinning, rate limiting, E2E tests
8. **Settings sub-pages** — Team invite flow, Billing, Integrations connect
9. **Onboarding flow** — first-time user experience
10. **AI auto-extraction** — Foundation tab (call transcript → 17 Qs)
11. **Save as Script → video row** — script-to-production pipeline
12. **Stripe live wiring** — webhook processing for real-time payment events

## Key Architecture Decisions
- `tenant_id` on every business table (RLS enforced at DB level)
- Auth fetches highest-priority role on sign-in
- Dark mode via `.dark` class (`:root` = light, `.dark` = dark)
- All colors use CSS custom properties — zero hardcoded hex in components
- Font: Arial for body text, Neue Haas Grotesk Display Pro for headings
- **Full-page builders** — no modals/sheets for major creation flows (projects, templates)
- **JSONB config** for rich offer data — future-proof for diverse agency business models
- **TipTap JSON storage** — rich text content stored as JSON in `body_json` columns
- **AED primary currency** — all financial displays in AED with small USD conversion hints
- **FullBleed responsive architecture** — all route-level pages wrapped in `<FullBleed>` with standardized `px-3 py-5 md:px-5 md:py-6` padding
- **Resend for all email** — both transactional (auth) and campaign emails routed through Resend
- **Auth Hook** — Supabase auth emails redirected to `send-auth-email` Edge Function for branded templates
- **⛔ Mandatory Verification:** Every feature must be browser-tested. See `AGENTS.md` Section 8.
