# ClipsApp Rebuild — Feature Roadmap & Build Order

> **Companion to:** `PRD.md`, `PRD-clarifications.md`, `PERMISSIONS-MATRIX.md`, `DATABASE-SCHEMA.md`, `UI-INVENTORY.md`, `SUPABASE-CONFIG.md`.
>
> **Reference, not a copy-paste spec.** Use this to decide *what* to build and *in what order*. The implementation details belong in per-feature plans written at build time.

---

## How to read this doc

### Tier definitions
- **Tier 1 — MUST HAVE.** The app does not function without these. Cut any one of them and there is no product.
- **Tier 2 — SHOULD HAVE.** Required for the app to be genuinely useful to clients and editors. Without these, MVP is a demo, not a workspace.
- **Tier 3 — NICE TO HAVE.** Differentiators and polish. Drop or delay if scope slips.
- **Tier 4 — FUTURE.** Documented intent, not for initial launch.

### Complexity scale
| Level | Effort estimate | What it implies |
|---|---|---|
| Simple | ≤ 2 days | One developer, small surface area, no architectural decisions |
| Medium | 3–7 days | Multiple files, some design choices, RLS work |
| Complex | 1–3 weeks | Cross-cutting, edge functions, external services, dedicated plan |
| Epic | 1+ month | Needs its own design doc and milestone breakdown |

### Dependency notation
`(deps: T1.3, T1.7)` means the feature requires Tier 1 items #3 and #7 to exist first.

### "Rebuild, don't port" — non-negotiable
The current `FullyCustomizableTable` and `VideoReviewModal` are the two largest sources of bugs in v1. They were prototyped, not designed. **Do not port them.** See the appendix at the bottom for the architectural reset required for each.

---

## Tier 1 — MUST HAVE (MVP skeleton)

The app cannot function at all without these. Build them in the order listed.

| # | Feature | Why essential | Complexity | Notes |
|---|---|---|---|---|
| T1.1 | **Multi-tenant foundation** — `tenants` table, `tenant_id` on every business table, tenant resolution from auth context | v2 is white-label / multi-agency. Adding `tenant_id` later means migrating the entire schema. Must be first. | Complex | New in v2; v1 had none. RLS helpers must read `tenant_id` from JWT or `user_tenants` join. |
| T1.2 | **Auth — email/password + Google OAuth** | No login, no app. | Simple | Standard Supabase auth. Magic link + reset deferred to T2. |
| T1.3 | **Roles & RLS framework** — `app_role` enum, `user_roles` table, `has_role()` SECURITY DEFINER fn | Every other table's RLS depends on this. Storing roles on `profiles` is a known privilege-escalation vector — do NOT do it. | Medium | See `PERMISSIONS-MATRIX.md`. Default new users to `client`. |
| T1.4 | **Profiles + `handle_new_user` trigger** | Need a place to store display name, avatar, preferences keyed to `auth.users.id`. | Simple | Trigger creates profile + assigns default role atomically. |
| T1.5 | **App shell** — one `InternalLayout` (staff), one `ClientLayout` (client), unified sidebar, TopNavBar, theme tokens | Without a shell there are no pages. The 5 legacy layouts (Owner/EditorAdmin/Editor/Sales/Client) collapse into 2 parameterized ones. | Medium | All design tokens defined here, no `text-white`/`bg-black` ever. |
| T1.6 | **Clients / Workspaces CRUD** | Everything in the product hangs off a client. | Medium | Includes member management table (`client_members`). |
| T1.7 | **Projects CRUD** (under a client) | Videos belong to projects. | Medium | Project type modular (lookup table, not enum). |
| T1.8 | **Sessions / Cycles** (folder inside a project) | Videos must belong to a session per the v1 architecture. Without this you can't model the hierarchy. | Simple | Rename "Interview" → "Session" per `PRD-clarifications` 6.4. |
| T1.9 | **Video upload pipeline** — Cloudflare Stream + R2 originals, multipart for all sizes, settle delay, auth refresh on resume | Core verb of the product. | Complex | Reuse v1 R2 strategy (per `mem://video/original-quality-r2-storage`); rewrite the client-side queue manager from scratch. |
| T1.10 | **`content_items` table + minimal status workflow** (draft → ready → posted, 3 states only at MVP) | A video row must exist to be reviewed/listed. Full 11-status workflow comes in T2. | Medium | Status values driven by lookup table (modular per PRD 3.2.2). |
| T1.11 | **Data table primitive** — typed, virtualized, column-config-driven `<DataTable>` | Every list view (videos, clients, projects, leads, deals, people) renders through this. **Build it once, build it right.** | Complex | TanStack Table + virtualization. No business logic inside the table. See appendix. |
| T1.12 | **Video review surface** — new player + comment/annotation host, single portal, single z-layer, state machine for play/comment/annotate | Clients need to *watch and respond*. This is the second cornerstone component. **Rebuild from scratch.** | Complex | See appendix. |

**Tier 1 verdict:** ~8–10 weeks of focused work for a small team. Resist scope creep here — every Tier 2/3 feature depends on these foundations.

---

## Tier 2 — SHOULD HAVE (core experience)

The app is *usable* once Tier 1 ships. It becomes *useful* once Tier 2 ships.

| Feature | Why important | Complexity | Dependencies |
|---|---|---|---|
| Full 11-status video workflow + role-based transition guards | The 3-state MVP is too coarse for real production. | Medium | T1.10, T1.3 |
| Client review actions (Approve / Request Revision / Cancel) | The actual reason a client logs in. | Medium | T1.12, status workflow |
| Comments + version isolation | Default isolation per version, optional "show all" toggle (per `mem://video/comment-version-isolation-policy`). | Medium | T1.12 |
| Annotations / drawings on the video frame | Differentiator vs Frame.io knockoffs. | Complex | T1.12 |
| Video versions (V1, V2, V3...) | Standard editing workflow. Must support delete-any-version with guards. | Medium | T1.10 |
| Editor assignment hierarchy (workspace → project → video cascade) | Defines who can do what on each video. | Medium | T1.3, T1.7 |
| Notifications (in-app + email + push) + preference toggles | Without notifications, async collaboration breaks. | Complex | T1.2, T1.6 |
| Email Hub on Lovable Native Email (transactional + bulk) | Replaces Resend (per `SUPABASE-CONFIG.md` rebuild verdict). | Complex | Notifications |
| Slack integration (#video-updates, #client-activity, #clips-app) | Core internal comms channel. Keep TheClipsApp bot architecture. | Medium | Notifications |
| Client onboarding flow + journey timeline | First impression for the client; gates dashboard until complete. | Medium | T1.6 |
| Chat (DM + agency thread split-pane) | Replaces email for day-to-day ops. | Complex | T1.4, Notifications |
| Stage-specific deadlines (Rough Cut, Branding, etc.) | Deadlines on the project alone are too coarse. | Simple | T1.10 |
| Posting schedule (Mon–Sun multi-select) | Drives auto post dates. | Simple | T1.7 |
| Password reset (14-char temp) + magic links | Standard auth UX. | Medium | T1.2 |
| Universal Preview Mode | Owners/Managers must be able to see what each role sees without role-switching hacks. | Medium | T1.3, T1.5 |
| Form builder (replaces hard-coded onboarding tables) | Lets ops change onboarding questions without a deploy. | Complex | T1.6 |
| Notes + Tasks per project | Internal collaboration on a project. | Simple | T1.7 |
| Activity log (writes only, viewable by admins) | Audit trail required by `PRD-clarifications` 5.3. | Medium | T1.3 |

---

## Tier 3 — NICE TO HAVE (enhanced experience)

| Feature | Why it adds value | Complexity | Dependencies |
|---|---|---|---|
| **CRM** — People, Companies, Deals Kanban, Calls, Partnerships | Replaces Attio for the agency. Gated to Owner + Closer per `mem://features/sales-crm-access-policy`. | Epic | T1.3, T1.11 |
| Content Studio (Strategy → Pillars → Sessions → AI ideation) | Pre-production tooling, not in MVP critical path. | Epic | T1.7, AI gateway |
| Star Project / "Your Attention" feed | Convenience for owners managing many projects. | Simple | T1.7 |
| Media Library | Centralized media reuse. | Medium | T1.9 |
| Global Search (deep-link routing) | Productivity multiplier once data volume grows. | Medium | T1.11 |
| Cross-workspace project sharing | Edge case, but requested per `mem://features/cross-workspace-project-sharing`. | Medium | T1.6, T1.7 |
| Public guest review links (30-day tokens) | Lets clients share to stakeholders without seats. | Medium | T1.12 |
| Trial reels | Specific to sales process. | Medium | T1.10 |
| Backlog session | Pre-upload metadata workspace. | Simple | T1.8 |
| Mobile review drawer (3-state: minimized / half / full) | Mobile-first review experience. Built right this time. | Complex | T1.12 |
| Stripe billing + accounting basics | Owner finance dashboard. | Complex | T1.6 |
| Production / Sales / Finance analytics dashboards | Operational insight. Owner sees finance, others isolated per `mem://architecture/admin-dashboard-isolation`. | Complex | All core data tables |
| Calendly integration (per-tenant, not per-rep secret) | Sales workflow. | Medium | CRM |
| Fireflies integration (transcripts, summaries) | Sales workflow. | Medium | CRM |
| PWA + offline guards | Already proven; port the working pattern (`mem://infrastructure/pwa-update-workflow`). | Simple | T1.5 |
| Modular admin surfaces (status editor, role editor, video-type editor, AI prompt editor) | Lets ops reconfigure without a deploy. | Complex | All lookup tables |
| Project posting auto-scheduling | Calculates next post date from schedule. | Simple | Posting schedule |
| Saved filter views (per-user) | CRM/leads quality-of-life. | Simple | T1.11 |

---

## Tier 4 — FUTURE (post-launch)

- **Direct cross-platform publishing** (IG / TikTok / YT auto-post from approved videos)
- **Talent Network marketplace v2** — or **drop entirely**. Decision required before T1 starts; current verdict in `UI-INVENTORY.md` is "drop legacy UI."
- **White-label theming per tenant** (custom colors, logo, domain) at full depth
- **Advanced reporting / custom dashboards** (user-defined KPIs)
- **AI-driven editing suggestions** (auto cut points, auto thumbnails) beyond basic transcript
- **Native mobile apps** (iOS/Android beyond PWA)
- **Public API + webhooks** for tenants to integrate

---

## Suggested build order

This sequence respects every dependency above. Each phase should ship to staging before the next begins.

### Phase 0 — Foundations (nothing else can be built first)
1. Tenants table + `tenant_id` convention + tenant resolution helper *(T1.1)*
2. Auth: email/password + Google *(T1.2)*
3. Roles + `user_roles` + `has_role()` *(T1.3)*
4. Profiles + `handle_new_user` trigger *(T1.4)*
5. Universal `set_updated_at()` trigger function (one for the whole schema)

### Phase 1 — Shell & primary entities
6. App shell: `InternalLayout`, `ClientLayout`, sidebar, TopNavBar, design tokens *(T1.5)*
7. **`<DataTable>` primitive** — built before any list page exists *(T1.11)*
8. Clients / Workspaces CRUD + members *(T1.6)*
9. Projects CRUD *(T1.7)*
10. Sessions / Cycles *(T1.8)*

### Phase 2 — Video pipeline (highest risk — allocate buffer)
11. Cloudflare Stream + R2 upload edge functions *(T1.9)*
12. Client-side upload queue manager (new, not ported)
13. `content_items` table + minimal 3-state status *(T1.10)*
14. Video list page (uses `<DataTable>`)
15. **Video review surface** — new player + comment/annotation host *(T1.12)*

> Phases 0–2 = MVP. The app is technically usable at this point.

### Phase 3 — Make it useful
16. Full 11-status workflow + role-gated transitions
17. Client review actions (Approve / Revision / Cancel)
18. Video versions (V1/V2/V3) + delete-any-version guards
19. Comments + per-version isolation
20. Annotations on frame
21. Editor assignment hierarchy (workspace/project/video cascade)
22. Stage-specific deadlines + posting schedule
23. Notes + Tasks per project
24. Activity log

### Phase 4 — Communication layer
25. Notification framework (in-app + preferences)
26. Email Hub on Lovable Native Email (transactional first, then bulk)
27. Push notifications (PWA + service worker)
28. Slack integration (channel routing + @mentions)
29. Chat (DM + agency thread)
30. Password reset (14-char temp) + magic links
31. Universal Preview Mode

### Phase 5 — Onboarding & ops tooling
32. Form builder
33. Client onboarding flow + journey timeline
34. Modular admin surfaces (statuses, roles, video types, AI prompts)
35. Saved filter views

### Phase 6 — CRM & sales
36. CRM People + Companies (unified `crm_people` model)
37. Deals Kanban
38. Calls + Calendly integration
39. Fireflies integration
40. Partnerships intake
41. Closer territory / region permissions

### Phase 7 — Studio, billing, analytics
42. Content Studio (Foundation → Pillars → Sessions → AI ideation)
43. Media Library
44. Global Search
45. Cross-workspace project sharing
46. Public guest review links
47. Trial reels
48. Backlog session
49. Mobile review drawer (3-state)
50. Stripe billing + accounting
51. Analytics dashboards (Production / Sales / Finance, isolated per role)
52. PWA polish + offline guards
53. Star Project / "Your Attention"

### Phase Final — Future tier
54+. Direct cross-platform publishing, talent network v2 decision, white-label theming, public API.

---

## Appendix A — "Rebuild, don't port" hit list

These v1 systems must be rewritten from scratch. Direction is intentional, but the implementation is a known-bad reference, not a template.

| v1 system | What was wrong | v2 architectural reset |
|---|---|---|
| **`FullyCustomizableTable`** | Monolithic ~3k-line component; props for every conceivable column behavior; sort/filter/drag implemented ad-hoc per column; renders re-trigger global state; no virtualization for large lists | Build a typed `<DataTable<TRow, TCols>>` primitive on **TanStack Table** + virtualization. Column behavior lives in **per-column config objects**, not props. The table knows nothing about videos, leads, or deals — pages compose it. Sort/filter/group/reorder are TanStack features, not custom code. |
| **`VideoReviewModal`** | z-index whack-a-mole (`z-[100]`, `z-[9999]`, etc.); realtime listeners colliding with optimistic UI; mobile drawer states glued on; comments, annotations, versions, and player all in one file | One **portal**, one **z-layer**, one **state machine** (idle / playing / commenting / annotating / drawing). Realtime isolated to a single hook. Player, comment list, annotation canvas, and version selector are independent components composed by a thin host. Mobile drawer is a *layout variant*, not a separate code path. |
| **50+ per-table `updated_at` triggers** | Copy-pasted per table; drift inevitable | One `set_updated_at()` SECURITY DEFINER function, attached to every table via a single migration helper |
| **Hard-coded enums** (status, video type, project type, role display labels) | Schema migration required for every change | Per-tenant **lookup tables** behind admin UIs (Tier 3). RLS scopes by `tenant_id`. |
| **Cross edge-function invocation chains** | One failure cascades; hard to debug | Each edge function calls external APIs **directly**. Audit via a structured log table (`email_logs`-style) per integration. |
| **5 role-specific layout shells** | Code duplication; styling drift | 2 layouts: `InternalLayout` (staff) and `ClientLayout`. Role-specific nav comes from `navigation.ts` config, not from a separate layout file. |
| **Two parallel design token systems** (legacy HSL vs V2 Figma tokens) | Components mix both → inconsistent UI | One token system from day 1. All HSL. Defined in `index.css` + `tailwind.config.ts`. No raw colors in components, ever. |
| **117 edge functions** (many legacy) | Unmaintainable surface area | Audit per function on the way in. Per `SUPABASE-CONFIG.md`, target ~60 functions post-rebuild. |

---

## Appendix B — Decisions required before Phase 0

These need a yes/no from you before the first migration is written:

1. **Talent Network** — drop entirely, or keep a stripped-down v2? (Current default per `UI-INVENTORY.md`: drop.)
2. **ElevenLabs / voice features** — drop, or keep behind a feature flag? (Current default: drop.)
3. **Resend** — confirm migration to Lovable Native Email. (Current default: yes.)
4. **Multi-owner per tenant** — allow more than one Owner role per tenant? (Current default per `PRD-clarifications` 2.2: yes.)
5. **Multi-role per user** — can one user hold both Editor and Closer? (Current default per `PRD-clarifications` 2.3: yes, but with one "primary" for routing.)
6. **Region/datacenter** for the new Supabase project (not exposed via SQL — must be selected in dashboard at creation).

Resolve these and the build can start at step 1.
