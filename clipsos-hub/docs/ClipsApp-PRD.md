# ClipsApp — Product Requirements Document

**Rebuild Spec v1.0**
_Generated: 2026-04-26_
_Source of truth: 117 user-answered clarifications + live codebase audit (~70 routes, 121 edge functions, 132 database tables)_

---

## 0. Document Conventions & How to Read This

This PRD is the **single source of truth** for rebuilding the ClipsApp platform from scratch. The reading agent is assumed to have **zero prior context**.

### Tags used throughout

| Tag                   | Meaning                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `[NEW]`               | Did not exist in the prior version. Build from scratch.                                            |
| `[CHANGED]`           | Existed but the rebuild changes the behavior, name, or scope.                                      |
| `[KEEP]`              | Carry over the existing implementation pattern as-is.                                              |
| `[DROPPED]`           | Existed in the prior version but **MUST NOT** be rebuilt.                                          |
| `[TBD]`               | Decision deferred. Build the data model and a minimal stub; final UX to be specified later.        |
| `[MODULAR]`           | This behavior MUST be configurable per-tenant via an admin UI. Nothing about it may be hard-coded. |
| `MUST / SHOULD / MAY` | RFC 2119 keywords. `MUST` = required, `SHOULD` = strongly recommended, `MAY` = optional.           |

### Core terminology (memorize before reading)

| Term                     | Definition                                                                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tenant / Agency**      | A single white-labeled instance of ClipsApp operated by one content agency. The platform MUST support multiple isolated tenants.                                                                          |
| **Workspace**            | A single client account inside a tenant. Either an **Individual workspace** (one client) or a **Company workspace** (multi-member, e.g., a clinic with several doctors).                                  |
| **Client**               | The end customer (the workspace owner). The agency's customer.                                                                                                                                            |
| **Project**              | A unit of work inside a workspace. A workspace MAY contain multiple projects (e.g., "Personal Brand", "Podcast Cuts").                                                                                    |
| **Cycle**                | `[CHANGED — was "session"]` A delivery period inside a project (e.g., "Cycle 1 — January batch"). Recurring projects auto-create a new Cycle on renewal.                                                  |
| **Video / Content Item** | A single deliverable inside a Cycle.                                                                                                                                                                      |
| **Trial Reels**          | A group of 2+ candidate variants of the same video concept; one wins and becomes the "main" video, the rest become versions. **If only one trial exists, it is just a normal video — not a trial group.** |
| **Version**              | A revision of a video (V1, V2, V3...). Versions are isolated for comments/annotations by default.                                                                                                         |
| **Status**               | A pipeline state for a video (e.g., "Rough Cut", "Posted"). `[MODULAR]`                                                                                                                                   |
| **Stage**                | A step in the deal pipeline (CRM). `[MODULAR]`                                                                                                                                                            |
| **Closer**               | `[CHANGED — was "sales"]` A sales agent who closes deals.                                                                                                                                                 |
| **Manager**              | `[CHANGED — was "admin"]` Agency operations lead.                                                                                                                                                         |
| **Senior Editor**        | `[CHANGED — was "editor_admin"]` Editor team leader.                                                                                                                                                      |
| **Content Creator**      | `[CHANGED — was "content_admin"]` Content production QA role.                                                                                                                                             |
| **Moderator**            | `[NEW]` Virtual assistant role for posting/scheduling on behalf of assigned clients.                                                                                                                      |
| **Owner**                | Agency super-admin with finance access.                                                                                                                                                                   |

### Reading order

1. Read Section 1 (Overview) and Section 2 (Roles) **before** anything else.
2. Section 3 (Features) and Section 4 (Pages) cross-reference each other — read together.
3. Section 7 (Schema Appendix) is the canonical data model. When Sections 1–6 conflict with Section 7, Section 7 wins.

---

## 1. App Overview

### 1.1 What is this app?

ClipsApp is a **white-label, multi-tenant operating system for short-form content agencies**. It is the entire production, review, communication, sales, and finance backbone that an agency uses to run its business and serve its clients.

A single deployment of ClipsApp can be cloned and rebranded for any content agency in the world. Each agency (a "tenant") gets an isolated environment where they manage their own clients, team, pipeline rules, statuses, deal stages, video types, posting cadences, system prompts, and email templates. **Nothing about the agency's specific workflow is hard-coded.** A tenant administrator MUST be able to reshape the entire platform (rename roles, add statuses, change deal stages, build new project types, customize email copy, modify AI prompts) without a developer.

The platform replaces the typical agency stack of **Notion + Google Drive + Frame.io + Slack + Trello + HubSpot + Google Forms + Gmail + Airtable + Zapier** with one cohesive product where every artifact (a video, a deal, a comment, a call recording, an invoice) is linked to every other artifact through a unified data model.

### 1.2 Who is it for?

**Primary user (buyer):** Owners of short-form content agencies (5–100 person teams) producing daily clips for personal-brand clients (founders, creators, executives, doctors, lawyers, real-estate agents).

**Secondary user (operator):** The agency's internal team — managers, senior editors, editors, content creators, moderators (VAs), and closers (sales).

**End user (customer):** The agency's clients — solo operators or company workspaces (a clinic, a law firm, a multi-creator brand) — who log in to review deliverables, approve content, and chat with the team.

**Guest user:** External reviewers (a client's manager, an investor, a brand partner) who receive a magic link to review specific videos or projects without an account.

### 1.3 What problem does it solve?

Content agencies suffer from **tool sprawl**. A typical workflow uses 10+ disconnected SaaS products. Hand-offs break, comments get lost, version control fails, clients sign in to four different portals to give feedback, deals never sync to delivery, and the owner has no real-time visibility into production health, sales pipeline, or finance.

ClipsApp solves this by being **one product where everything is linked**:

- A signed deal in the CRM auto-creates a workspace, sends the magic-link onboarding email, generates the first project, and books the kickoff call — without manual intervention.
- A comment on a video version is isolated to that version, mirrors to Slack with a controllable @mention, and triggers a throttled notification to the assigned editor.
- A status change on a video can fire client-facing emails, push notifications, in-app notifications, Slack pings, and pipeline analytics updates simultaneously — all governed by `[MODULAR]` rules the agency owns.
- A finance dashboard pulls live Stripe revenue, expense ledger entries, payroll, and software costs into one P&L the owner sees. The manager never sees finance. Period.

### 1.4 Core value propositions

1. **One source of truth.** Every video, deal, person, call, file, and message is linked to exactly one workspace and queryable from one global search.
2. **White-label first.** Statuses, stages, roles, video types, posting schedules, AI prompts, email templates, and pipeline steps are all `[MODULAR]`. Two agencies running the same codebase look and behave completely differently.
3. **Frame-accurate review.** Cloudflare Stream playback with timestamped comments, drawn annotations, version isolation, and 30-day public guest links.
4. **Sales → delivery automation.** Moving a deal to the "Send Payment" stage triggers an automated payment + onboarding flow. No human in the loop unless the agency wants one.
5. **Owner finance isolation.** Stripe revenue, expenses, payroll, and accounting are visible only to the Owner. Managers see operations. Closers see their pipeline. Clients see their videos.
6. **Built for client experience.** Clients get a beautiful workspace-named portal (e.g., `acme.theclips.app`), a guided onboarding journey, weekly delivery feeds, analytics on top/bottom performing reels, and a real-time chat that feels like Slack/WhatsApp.

### 1.5 White-label / multi-tenant positioning

The codebase is **one application**. Each tenant is identified by a `tenant_id` on every row of every business table. RLS policies MUST enforce tenant isolation at the database level — there is no scenario where any user from Tenant A can read or write a row belonging to Tenant B.

A new tenant onboarding (the agency-owner sign-up flow) `[NEW]`:

1. Creates a `tenants` row with the agency's name, subdomain, brand colors, and logo.
2. Seeds the tenant with the **default** statuses, roles, deal stages, video types, project types, and email templates — all of which the new owner can immediately edit.
3. Creates the first `owner` user.

> The platform's marketing site, public landing pages, and signup-to-tenant funnel are **out of scope for this PRD** (the user explicitly skipped marketing pages). Assume tenants are provisioned manually until that flow is specified.

---

## 2. User Roles & Workspace Model

### 2.1 Workspace types

A workspace is the container for **one client relationship**. There are exactly **two** workspace types:

| Type                 | Description                                                                                                 | Members                                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Individual**       | One person is the client.                                                                                   | 1 client login.                                                                                                                                             |
| **Company** `[KEEP]` | Multiple people inside one client organization (e.g., a clinic with 5 doctors, a law firm with 3 partners). | 1 primary login + N "company sub-members". Each sub-member has their own profile and content stream but shares the workspace's projects, billing, and chat. |

Both types are stored in the **same** `clients` table with a `workspace_type` enum (`individual` | `company`). Sub-members live in `client_members`.

**Data isolation inside a Company workspace:**

- Sub-members **MUST NOT** see each other's content streams unless explicitly shared via a project assignment.
- The primary login (workspace owner) sees everything inside the workspace.
- The agency team sees everything regardless.

### 2.2 Role hierarchy and rename map

The platform has exactly **9** identities. **8 are roles** (stored in `user_roles`). **1 is a workspace type** (Company, stored on `clients`).

| Final name                             | Old name        | Tag         | Hierarchy level |
| -------------------------------------- | --------------- | ----------- | --------------- |
| `owner`                                | `owner`         | `[KEEP]`    | 5 (highest)     |
| `manager`                              | `admin`         | `[CHANGED]` | 4               |
| `senior_editor`                        | `editor_admin`  | `[CHANGED]` | 3               |
| `content_creator`                      | `content_admin` | `[CHANGED]` | 3               |
| `editor`                               | `editor`        | `[KEEP]`    | 2               |
| `moderator`                            | —               | `[NEW]`     | 2               |
| `closer`                               | `sales`         | `[CHANGED]` | 2               |
| `client`                               | `client`        | `[KEEP]`    | 1 (lowest)      |
| `company` (workspace type, NOT a role) | —               | `[NEW]`     | n/a             |

**Migration mapping for existing rows** (Section 7 covers the SQL):

```
admin          → manager
editor_admin   → senior_editor
content_admin  → content_creator
sales          → closer
```

### 2.3 Per-role specifications

Every role spec uses the same structure:

- **Description** — who this person is.
- **Can see** — pages and data they have access to.
- **Can do** — actions they can perform.
- **Cannot do** — explicit denials.
- **Default navigation** — sidebar/top-nav structure.

> All per-role permissions below are **defaults**. Tenant owners MUST be able to override every permission via the Manage Roles admin surface (Section 3.17).

#### 2.3.1 Owner

- **Description:** The agency super-admin. Usually the founder. The only role with finance visibility.
- **Can see:**
  - All workspaces, projects, videos, deals, calls, people, files, chats, analytics.
  - Finance: Stripe revenue, MRR, expenses ledger, payroll, P&L, software costs.
  - Security: error logs, login history, audit trail, RLS linter results.
  - All admin/modularity surfaces (statuses, roles, stages, video types, project types, email templates, AI prompts, system settings).
- **Can do:**
  - Create/edit/delete any user including other owners.
  - Promote anyone to any role.
  - Create new tenants if running a multi-agency operation (out of scope for v1.0 unless explicitly requested).
  - Override any permission.
  - Enter Universal Preview Mode as any role (Section 2.4).
- **Cannot do:** Nothing is restricted from owner.
- **Default navigation:** `/owner/*` — Dashboard, Workspaces, Projects, Videos, Pipeline, CRM (People/Companies/Deals/Calls/Editors), Leads, Partnerships, Email Hub, Studio, Talent Network, Tasks, Workboard, Notifications, Media Library, Analytics, Editor Productivity, Agency Growth, Finance, Credentials, Management, User Management, Forms, Settings, Security, Error Logs.

#### 2.3.2 Manager `[CHANGED — was admin]`

- **Description:** Agency operations lead. Runs day-to-day. Manages team, pipeline, clients, sales support — **but never sees finance**.
- **Can see:**
  - Everything Owner sees **EXCEPT**: Finance dashboards, Stripe revenue/expense data, payroll, P&L, finance settings.
  - Sees all workspaces, projects, videos, deals, calls, chats.
  - Sees production analytics (output, throughput, editor productivity) but NOT revenue analytics.
- **Can do:**
  - Create/edit/delete all roles below `owner` (cannot create or delete owners).
  - Edit modular configuration (statuses, video types, deal stages) — but tenant owner MAY restrict this.
  - Enter Universal Preview Mode for roles below them.
- **Cannot do:** See finance, create owners, change another owner's role.
- **Default navigation:** Same as Owner minus Finance, Agency Growth (revenue tabs), and the Tenant-level settings.

#### 2.3.3 Senior Editor `[CHANGED — was editor_admin]`

- **Description:** Editor team leader. Manages assigned clients and the editors under them. Can create clients and editors.
- **Can see:**
  - All workspaces, projects, and videos they are assigned to (via `client_team_assignments` or `video_editors`).
  - All editors and content creators they manage.
  - Studio for assigned clients.
  - Workboard, Tasks, Notifications, Inspiration (read-only library of all platform videos for reference).
- **Can do:**
  - Create new clients (workspaces) and editors.
  - Assign editors to projects/videos.
  - Move videos through statuses they have permission for (defined in `status_role_permissions`).
  - Manage chat with assigned clients.
- **Cannot do:** See finance, create managers/owners, edit tenant-level settings, see workspaces they aren't assigned to.
- **Default navigation:** `/senior-editor/*` (rebuild of `/editor-admin/*`) — Dashboard, Clients, Projects, Videos, Workboard, Tasks, Studio, Client Chats, Email Hub (assigned clients), Notifications, Media Library, Editor Productivity, My Performance, Credentials, Management, User Management (limited), Settings.

#### 2.3.4 Content Creator `[CHANGED — was content_admin]`

- **Description:** Production QA role. Reviews scripts, hooks, drafts, and final cuts before client review. Does not edit but enforces brand consistency.
- **Can see:**
  - Assigned workspaces and their content pipelines.
  - Studio (scripts, hooks, content vault, briefs).
  - All videos awaiting "internal review" or "QA" status.
- **Can do:**
  - Approve/reject videos at the internal review status.
  - Comment internally on any video.
  - Edit scripts/hooks in Studio.
  - Manage Studio templates.
- **Cannot do:** Upload videos, change editor assignments, see finance, manage users, see workspaces they aren't assigned to.
- **Default navigation:** `/content-creator/*` (rebuild of `/content-admin/*`) — Dashboard, Clients (assigned), Projects, Videos, Workboard, Studio, Client Chats, Notifications, Credentials, Settings.

#### 2.3.5 Editor

- **Description:** Content producer. Edits the videos. Assigned to specific projects/videos.
- **Can see:**
  - Only workspaces, projects, and videos they are explicitly assigned to (cascade rules in Section 2.5).
  - Inspiration tab — read-only library of all platform videos (across tenant) for reference.
  - Their own performance metrics and goals.
- **Can do:**
  - Upload new videos to projects they are assigned to.
  - Upload new versions to videos they own.
  - Move videos through statuses defined for the editor role.
  - Comment internally.
  - Chat with assigned clients (if enabled per-tenant).
- **Cannot do:** See unassigned workspaces, change assignments, see finance, see other editors' performance, manage users, edit modular config.
- **Default navigation:** `/editor/*` — Dashboard, Projects, Videos, Workboard, Tasks, My Performance, Inspiration, Client Chats (assigned), Notifications, Help, Credentials, Settings.

#### 2.3.6 Moderator `[NEW]`

- **Description:** Virtual assistant. Handles posting, scheduling, captioning, and platform uploads on behalf of assigned clients. Think: a hybrid editor + social media manager assistant.
- **Can see:**
  - Only workspaces they are assigned to.
  - The posting queue and posting schedule for those workspaces.
  - Connected social platforms (Meta, TikTok, LinkedIn, YouTube, X) for assigned workspaces.
  - Chat with assigned clients.
  - The video library for assigned workspaces.
- **Can do:**
  - Schedule and publish approved videos to client-connected social accounts (when direct cross-platform publishing is built — Section 3.16).
  - Edit captions, hashtags, post copy.
  - Move videos from "Approved" to "Posted" status.
  - Mark posting failures and re-queue.
  - Chat with assigned clients.
- **Cannot do:** Edit videos, change pipeline configuration, see finance, see unassigned workspaces, approve videos on the client's behalf.
- **Default navigation:** `/moderator/*` — Dashboard, Assigned Workspaces, Posting Queue, Schedule, Connected Accounts, Tasks, Client Chats, Notifications, Credentials, Settings.

#### 2.3.7 Closer `[CHANGED — was sales]`

- **Description:** Sales agent. Owns leads, deals, and discovery calls within an assigned **region** (territory).
- **Can see:**
  - Leads, deals, calls, and people assigned to them OR matching their region's territory rule (`sales_territories`).
  - The CRM Kanban for their region.
  - Their own follow-ups and schedule.
  - Calendly and Fireflies data for their calls.
- **Can do:**
  - Create/edit/delete leads, deals, follow-ups within their region.
  - Move deals through pipeline stages.
  - Trigger the **Send Payment automation** when moving a deal to the "Send Payment" stage (Section 6.2). This is the moment that converts a deal into a workspace.
  - Schedule and conduct discovery calls.
  - Score calls using AI templates.
- **Cannot do:** See deals in other regions (unless owner-granted), see production pipeline, see finance, see other closers' performance, edit modular config.
- **Default navigation:** `/closer/*` (rebuild of `/sales/*`) — Dashboard, Leads, Schedule, Follow-Ups, Pipeline (Deals), Calls, People, Companies, Notifications, Settings.

#### 2.3.8 Client

- **Description:** The agency's customer. Logs in to a workspace-named portal to review videos, approve work, see analytics, and chat with the team.
- **Can see:**
  - Their own workspace only — projects, videos (regardless of status, but with status-role visibility rules applied), files, analytics, chat.
  - The videos in **all statuses they are permitted to see** (configured per-tenant; default = videos become client-visible at "Final Review" and remain visible thereafter).
  - Their workspace journey (the 16-step `[MODULAR]` onboarding/delivery timeline).
  - Their billing and subscription status.
  - Their connected social accounts and the analytics on top/bottom performing reels.
- **Can do:**
  - Approve / Request Revision on videos at "Final Review" status.
  - Approve / Request Revision / Decline on videos at "Rough Cut" status (Decline triggers production cancellation tracking).
  - Comment and annotate on their videos.
  - Generate guest review links (30-day expiry, with toggleable download permission) for sharing with their team/partners.
  - Chat with the agency team.
  - Update their profile, brand assets, and onboarding answers.
  - Connect/disconnect their Meta, TikTok, LinkedIn, YouTube, X accounts.
- **Cannot do:** See other workspaces, see internal team chat, see internal-only video versions, see internal comments (a comment flagged "internal"), see finance, manage roles, see modular config.
- **Default navigation:** `/client/*` — Dashboard (Home), Videos, Posting Queue, Analytics, Files, My Team, Chat, Talent Network (browse hires), Settings.

#### 2.3.9 Company workspace (NOT a role)

- **Description:** A workspace type, not a user identity. Container for multiple sub-members under one client relationship.
- **Owner of the workspace:** A `client` user marked as `is_workspace_owner = true`.
- **Sub-members:** Additional `client` users in the same workspace (`client_members` table). Each sub-member has their own profile, their own content visibility (only their own creator stream by default), but shares the workspace billing.
- **Aggregate view:** The workspace owner sees an "overview" page that aggregates content across all sub-members (modeled like a multi-creator agency dashboard).
- **Per-creator stream:** Each sub-member sees only their own stream by default; the workspace owner can grant cross-stream visibility per-sub-member.

### 2.4 Universal Preview Mode

`[KEEP]` — already implemented; rebuild as-is with rule clarifications.

- **Available to:** `owner` and `manager` only.
- **Purpose:** Simulate the experience of any other role (or any specific user) without logging out.
- **Implementation:**
  - A "Preview as…" dropdown in the user menu lists all roles below the previewer's level + a user search ("Preview as user X").
  - When active, a banner pins to the top: "Previewing as [role/name]. Exit Preview." Clicking exits.
  - All RLS reads are filtered as if the previewer were that user. Writes are **blocked** during preview to prevent accidental data corruption.
  - `RoleProtectedRoute` already supports this via `ROLE_MANAGEMENT_HIERARCHY`.

### 2.5 Editor assignment hierarchy (cascade rules) `[KEEP]`

There are three levels of granularity for assigning team members to client work. All three MUST be supported simultaneously.

| Level               | Table                                                                   | Behavior                                                                                          |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Workspace level** | `client_team_assignments`                                               | Editor X is assigned to Workspace A. Sees all projects in A by default.                           |
| **Project level**   | `projects.editor_id` (or `project_editors` join table for multi-editor) | Editor X is assigned to Project P. Cascades to all videos in P unless overridden.                 |
| **Video level**     | `video_editors`                                                         | Editor X owns Video V. Strict one-editor ownership per video. Overrides project-level assignment. |

**Cascade direction:** Workspace assignment → grants visibility to all projects → grants visibility to all videos. Project assignment → grants visibility to all videos in that project. Video assignment → strict ownership of that single video.

**Multi-editor support on a single video:** Not supported. One video = one editor. Project-level supports multiple editors.

### 2.6 Closer territory / region permissions `[KEEP — renamed]`

`[CHANGED]` — "Territory" is the technical column name; "Region" is the user-facing label.

- A `closer` is assigned a `region` (e.g., "UAE", "AUS", "CA").
- Leads/deals are tagged with a region.
- Closers see only their region's leads/deals/calls/notifications.
- Owner can override and assign cross-region.

---

## 3. Feature List

### 3.1 Authentication & Onboarding

#### 3.1.1 Sign-up flow

- **Channels:** Email + password, Google OAuth, Magic Links.
- **No anonymous sign-ups.** Ever. Every user must verify a real email.
- **Email verification:** Required for password-based signup. Auto-confirm OFF unless tenant owner explicitly enables it.
- **Google OAuth:** When a brand-new Google user signs in, they MUST land on a "What kind of account is this?" page (do NOT auto-assign `client` — this was a security risk in v0). Until they pick or are assigned by an admin, their role is `pending` and they have access to nothing.

#### 3.1.2 Sign-in flow

- Email + password.
- Google OAuth.
- Magic Link (passwordless). The user enters their email; the platform sends a single-use link valid for 30 days. Link routes to `/auth/magic-link` and exchanges for a session.

#### 3.1.3 Password reset

`[KEEP]` — 14-character temporary password system.

- User requests reset → platform generates a 14-char temporary password → emails it to the user.
- On first login with the temp password, user MUST set a new permanent password before reaching any app surface.

#### 3.1.4 Workspace-named URLs `[KEEP]`

- Each tenant has a subdomain: `agencyname.theclips.app`.
- Each workspace MAY have a vanity slug: `agencyname.theclips.app/w/acme-clinic`.
- The portal automatically themes/brands per tenant.

#### 3.1.5 Client onboarding gating logic `[KEEP, see 6.1]`

- New `client` users land on a 16-question onboarding form on first login.
- They MAY skip and continue to the dashboard, but the **Kickoff Call** and **Practice Session** journey steps remain locked until the form is complete.
- A persistent "Complete onboarding (X of 16)" banner displays on every client page until done.
- Onboarding answers feed into Studio (auto-fill foundation, brand bio, audience avatars, content pillars).

---

### 3.2 Video Pipeline & Cycles

#### 3.2.1 Hierarchy

```
Tenant
└─ Workspace (Individual or Company)
   └─ Project
      └─ Cycle  [CHANGED — was "session"]
         └─ Video (content_item)
            └─ Version (content_item_version)
```

For Company workspaces, an extra layer exists:

```
Workspace (Company)
├─ Sub-member 1
│  └─ Project
│     └─ Cycle
│        └─ Video
├─ Sub-member 2
│  └─ Project
│     └─ Cycle
│        └─ Video
└─ ...
```

#### 3.2.2 Statuses `[MODULAR]`

**Default 11 statuses (seed for new tenants):**

| Order | Default name        | Internal slug         | Default visible to client?   |
| ----- | ------------------- | --------------------- | ---------------------------- |
| 1     | New                 | `new`                 | No                           |
| 2     | In Progress         | `in_progress`         | No                           |
| 3     | Rough Cut           | `rough_cut`           | Yes (review actions enabled) |
| 4     | Internal Review     | `internal_review`     | No                           |
| 5     | Final Review        | `final_review`        | Yes (review actions enabled) |
| 6     | Approved            | `approved`            | Yes                          |
| 7     | Scheduled           | `scheduled`           | Yes                          |
| 8     | Posted              | `posted`              | Yes                          |
| 9     | Revisions Requested | `revisions_requested` | Yes                          |
| 10    | Cancelled           | `cancelled`           | Yes (with reason)            |
| 11    | Archived            | `archived`            | No                           |

**Modular admin surface ("Manage Statuses"):** Owner and Manager (if permitted) can:

- Add new statuses.
- Rename existing statuses.
- Reorder statuses.
- Delete statuses (with mandatory migration of existing rows to a chosen replacement).
- Set per-status visibility rules: which roles can see, which roles can move TO, which roles can move FROM, what notifications fire, what color/icon represents it.
- Define a "client-visible-from" status — videos at this status or later become visible in client portals.

**Status → Role permission matrix (`status_role_permissions`):** Which roles can see, edit, comment, transition each status. Stored in DB, edited via UI, no hard-coding.

#### 3.2.3 Video types `[MODULAR]`

**Default 7 types:** `Talking Head`, `Engaging Series`, `Ad`, `Voice Over`, `Jump Cut`, `Podcast Clip`, `Custom`.

**Manage Video Types** admin surface allows add/rename/delete with row migration.

#### 3.2.4 Project types `[MODULAR — KEEP from v0]`

The existing `project_type_templates` system stays. Default seeded types: GhostHost™, Highlights™, Makeover™, Takeover™. Each is a template of the 16-step journey. New types can be built via the existing builder.

#### 3.2.5 Posting schedule `[KEEP]`

- Per-project Mon–Sun multi-select stored in `projects.posting_schedule`.
- Manual override at the video level (a video can be force-scheduled for a specific date regardless of the schedule).
- Auto-distributes approved videos across the next available posting days.

#### 3.2.6 Trial Reels `[CHANGED]` per the latest user clarification

- A video MAY have **trials** attached to it (different candidate variants of the same concept).
- **If 0 trials are added:** the video is just one normal video. No "trial reels" concept appears in the UI.
- **If 1+ trials are added:** the entire video group becomes a "Trial Reels" group. The original main video and all trials are siblings.
- The client (or content creator) reviews trials and **promotes one** as the winner. The winner becomes the main video. The losers are **kept as data** (do not auto-delete) but archived as "trial-loser" versions for reference and analytics.
- A user MAY manually delete losers later via Bulk Delete (Section 3.2.10).

#### 3.2.7 Storage and playback `[KEEP]`

- **Cloudflare R2** stores the original-quality file (multipart upload for ALL sizes, no fallback to single-PUT to avoid silent failures).
- **Cloudflare Stream** stores the HLS-transcoded streaming version for in-app playback.
- **All downloads MUST serve from R2** (original quality), never from Stream.
- The `download-media` edge function streams R2 through a presigned proxy to bypass browser CORS issues.

#### 3.2.8 Stage-specific deadlines `[KEEP]`

- Each video MAY have a `due_date` per stage (rough_cut_due, branding_due, final_review_due, etc.).
- Drives the Workboard, Editor Productivity, and "Your Attention" feed.

#### 3.2.9 Backlog `[KEEP]`

- A project has a "Backlog" cycle (special pseudo-cycle with no upload requirement) for pre-upload planning. A row in `content_items` can exist without a media file (`upload-first` is preferred but not required for backlog).

#### 3.2.10 Bulk delete `[KEEP, with safeguard]`

- Manual safety: deleting >5 videos requires typing "DELETE [project name]" to confirm.
- All deletes are soft (`archived` status) by default; hard delete requires owner role.

---

### 3.3 Review System

#### 3.3.1 Internal review

- Gated by status. Default: `internal_review` and `rough_cut` statuses are visible to internal team for QA.
- Content Creators are the default reviewers at `internal_review`.
- Comments at this stage are flagged `internal=true` and never shown to the client.

#### 3.3.2 Client review actions `[KEEP]`

| Status         | Approve | Request Revision | Decline                                                                 |
| -------------- | ------- | ---------------- | ----------------------------------------------------------------------- |
| `rough_cut`    | ✓       | ✓                | ✓ (triggers production cancellation tracking)                           |
| `final_review` | ✓       | ✓                | ✗ (Decline button HIDDEN — final cut cancellations should never happen) |

If a final cut is decllined in practice, the agency must use the "Cancel" workflow (manager-initiated) which logs the reason for analytics.

#### 3.3.3 Annotations and comments `[KEEP]`

- Timestamped comments on a specific frame.
- Drawn annotations on the video canvas (rectangle, arrow, freehand).
- **Version isolation by default:** comments on V1 do not appear on V2.
- A "Show all versions" toggle MAY display every comment across all versions for context.
- Real-time updates via Supabase Realtime channels (`useRealtimeComments`, `useRealtimeVersions`).

#### 3.3.4 Guest review links

- **Per-video link:** `/review/:videoId?token=…` — single video.
- **Per-project link:** `/project-review/:projectId?token=…` — all videos in a project.
- **Short links:** `/v/:shortCode` — vanity short URLs that resolve via `resolve-short-link`.
- **Validity:** 30 days by default, configurable per link.
- **Permissions toggle:** A link can be marked "view only" or "view + download". Download permission MUST be respected by the `download-media` function.
- Guest reviewers can comment and annotate without an account; their comments are tagged with their guest name/email captured at link entry.

---

### 3.4 Content Studio `[TBD — high-level only]`

Per Q49/Q52, the detailed Content Studio UX is deferred. For the rebuild:

- Build the data model (scripts, hooks, content vault, ideas, sessions, templates) per Section 7.
- Build a minimal stub UI mirroring the v0 Content Studio (Picker page → per-client workspace with tabs for Foundation, Strategy, Scripts, Hooks, Vault, Sessions).
- Defer: rich-text editor (TipTap) UX choices (slash commands vs selection toolbar), AI prompt presets, template library design.

The data is preserved so that the future Studio UX can plug into it without migration.

---

### 3.5 Chat System `[KEEP, with clarifications]`

- **Default:** 1:1 client ↔ agency chat per workspace, auto-created when a workspace is created.
- **Modular group chats / threads:** Tenant MAY enable Slack-like group rooms and threaded replies. Default OFF.
- **Free-flowing access:** Anyone in the agency team can read/write any client chat (no per-client gating by default — intentional, per Slack/WhatsApp model).
- **Real-time** via Supabase Realtime.
- **Features:** voice notes, file/image attachments, @mentions (with Slack mirror, see 3.9), reactions, mute, read receipts.
- **@mention behavior:** A mention triggers a notification to the mentioned user (in-app + email + push + Slack DM, subject to throttle and opt-out).

---

### 3.6 CRM (Single source of truth)

#### 3.6.1 Unified `crm_people` model `[KEEP]`

- `crm_people` is the canonical record for **every person** the agency interacts with: leads, clients, editors, partners, contacts.
- A `crm_people` row MAY have a `linked_user_id` if the person also has a platform login.
- A person's profile aggregates: deals they're attached to, calls they've been on, emails sent, projects they own, billing history.

#### 3.6.2 Companies and Editors

- `crm_companies` for organizations.
- `crm_editors` for editor talent the agency hires from outside.
- All three (people, companies, editors) reachable from `/crm/contacts` unified inbox.

#### 3.6.3 Deals Kanban `[KEEP, modular stages]`

- **Default stages:** `New Lead`, `Qualified`, `Discovery Call Booked`, `Discovery Call Done`, `Proposal Sent`, `Negotiation`, `Send Payment`, `Won`, `Lost`.
- **`[MODULAR]`** via `deal_stages` table — owner can rename/add/reorder/delete stages.
- 9-row uniform card structure per existing memory: name, plan, total_videos, payment_method, deal_owner, plus key business fields.
- Multi-column sort, filtering, saved views, drag-and-drop reordering.

#### 3.6.4 Send Payment automation `[NEW behavior]`

This is the headline automation that converts a deal into a workspace. See Section 6.2 for the full flow.

#### 3.6.5 Calls

- Booked via Calendly (`calendly-webhook`, `sync-calendly-events`).
- Transcripts pulled from Fireflies (`fireflies-proxy`, GraphQL).
- **AI scoring** of a call uses a `[MODULAR]` system prompt template editable by the owner (e.g., "Score this discovery call on rapport, qualification, objection handling…").
- Call detail page shows: recording, transcript, AI summary, AI score, action items, linked deal/person.

#### 3.6.6 Closer territory rules

See 2.6.

---

### 3.7 Forms `[NEW]`

A Typeform-style form builder that **replaces** the existing hard-coded application flows.

- **Builder:** Drag-and-drop fields (short text, long text, multiple choice, checkbox, dropdown, date, file upload, URL, email, number, rating, signature, conditional logic).
- **Form types replaced:**
  - 16-question client onboarding questionnaire.
  - Talent Network application (editor / videographer / studio / VA).
  - Career application.
  - Partnership application.
  - Lead capture.
- **Submissions** land in `form_submissions` and create/update `crm_people` rows automatically.
- Forms are **per-tenant**; default forms are seeded but every tenant can customize.
- Public hosted form URLs: `agencyname.theclips.app/f/:formSlug`.

---

### 3.8 Email Hub `[KEEP, infra changed]`

`[CHANGED]` — Replace Resend with **Lovable Native Email** (built into Lovable Cloud). All email sending routes through the platform's own queue (`email_queue`, `process-email-queue`).

- Bulk + transactional via the same queue.
- Templates stored in `email_templates`, editable by owner/manager.
- Sequences and segmentation `[KEEP]`.
- Per-tenant verified sending domain.
- Suppression list and unsubscribe tokens managed automatically.

---

### 3.9 Notifications

- **Channels:** in-app, push (Web Push), email (Lovable Native), Slack (DM + channel).
- **Slack routing `[KEEP]`:**
  - `#video-updates` — status transitions, approvals, revisions.
  - `#client-activity` — chat messages, mentions.
  - `#clips-app` — system events.
  - **Mention opt-out** per user (controlled `MENTION_OPT_OUT` list, see existing memory).
- **Throttling:** Max 1 notification per video per hour per user (prevents spam from rapid status changes).
- **Per-role preference toggles** (`notification_preferences` table): each user can enable/disable each channel per event type.

---

### 3.10 Tasks `[KEEP, role-cascading]`

- Personal tasks + assigned tasks.
- **Role visibility cascade:**
  - Owner sees all tasks.
  - Manager sees tasks of all roles below.
  - Senior Editor sees their own + tasks of editors/content creators they manage.
  - Editor / Moderator / Closer / Client see only their own.
- Tasks can be linked to a video, project, deal, or call.

---

### 3.11 Media Library `[KEEP]`

- Google Drive replacement.
- Per-workspace folders, files, right-click share menus, link permissions.
- Storage backed by R2.
- Linked into Studio (brand assets, brief documents) and CRM (proposal PDFs, contracts).

---

### 3.12 Global Search `[KEEP]`

- Single search bar in the top nav.
- Results grouped by entity type: Videos, Projects, Workspaces, People, Deals, Calls, Files, Comments.
- Deep-linking strategy `[KEEP]` — every result deep-links to the correct role-prefixed route (uses `notificationLinkResolver`-style logic).
- Indexed via Postgres full-text search on a denormalized `search_index` materialized view (refresh on cron).

---

### 3.13 Star Project / "Your Attention" feed `[KEEP]`

- Admins (owner, manager, senior editor) can ⭐ projects.
- The "Your Attention" dashboard widget surfaces starred projects + projects with overdue deadlines + projects awaiting their action.

---

### 3.14 Analytics

#### 3.14.1 Client Analytics `[KEEP]`

- **Reel Insights** — Top/Bottom performing reels per platform (Instagram, TikTok).
- Pulled from Meta OAuth + TikTok OAuth (when the client connects their accounts).
- Per-video performance: views, likes, comments, shares, saves, watch time.

#### 3.14.2 Production Analytics

- Pipeline throughput (videos per status per week).
- Editor productivity (videos completed, avg time per stage).
- Workspace health (% on-time delivery, revision rate).
- Visible to: Owner, Manager, Senior Editor (filtered to their team).

#### 3.14.3 Sales Analytics

- Deal velocity, win rate, deal size, region performance, closer leaderboard.
- Visible to: Owner, Manager, Closer (filtered to their region).

#### 3.14.4 Finance Analytics — OWNER ONLY

- Live Stripe revenue, MRR, churn, LTV.
- Expense ledger (`finance_transactions` `[KEEP]`).
- Software costs, payroll.
- AED currency support `[KEEP]`.
- Backfill jobs and event logs via `stripe-sync`, `stripe_events_log`.
- **Not visible to anyone but owner.**

---

### 3.15 Billing & Finance

#### 3.15.1 Stripe integration `[KEEP]`

- Use the existing **bring-your-own-key Stripe** setup (each tenant connects their own Stripe account). The `[NEW]` Lovable seamless Stripe integration MAY be offered to small tenants who don't have their own Stripe yet.
- Webhook: `stripe-webhook` handles `customer.created`, `invoice.paid`, `subscription.updated`, etc.
- Charges, subscriptions, events all logged to `stripe_charges`, `stripe_subscriptions`, `stripe_events_log`.

#### 3.15.2 Accounting module `[NEW — basic]`

- Manual ledger entries for non-Stripe income/expenses (cash, IBAN transfers, salaries).
- Categories: Revenue, Software, Payroll, Marketing, Operations, Other.
- Monthly P&L view.
- Export to CSV.

---

### 3.16 Direct Cross-Platform Publishing `[PLANNED]`

Not in v1.0 launch but the data model and OAuth scaffolding MUST be built so it can be enabled later.

- Platforms: Instagram, TikTok, LinkedIn, YouTube, Facebook, X.
- Per-client OAuth tokens stored in `platform_oauth_tokens`.
- Posting queue (`client_posting_queue`) drives the schedule.
- Moderator role is the primary user of this feature.
- When enabled, moving a video to "Scheduled" status auto-publishes at the scheduled time to all selected platforms.

**Meta OAuth `[KEEP]` is used today for read-only analytics** and will be extended for write/post when this feature ships.

---

### 3.17 Modularity / Admin Surfaces `[NEW collection]`

Every modular config has a dedicated admin page. All editable by Owner; Manager-editable subject to a tenant-level toggle.

| Surface                   | Edits                                                                                            | Default access |
| ------------------------- | ------------------------------------------------------------------------------------------------ | -------------- |
| Manage Statuses           | Add/rename/reorder/delete statuses + per-status role permissions + client-visibility threshold   | Owner          |
| Manage Roles              | Edit role name + per-role permission matrix (which pages, which actions)                         | Owner          |
| Manage Video Types        | Add/rename/delete video types                                                                    | Owner, Manager |
| Manage Deal Stages        | Add/rename/reorder/delete deal stages                                                            | Owner, Manager |
| Manage Project Types      | Existing builder `[KEEP]`                                                                        | Owner, Manager |
| Manage Forms              | Form builder (Section 3.7)                                                                       | Owner, Manager |
| Manage Email Templates    | Edit HTML/MJML templates + variables                                                             | Owner, Manager |
| Manage AI System Prompts  | Edit prompts for: Jarvis chat, sales call scoring, content auto-generation, caption regeneration | Owner          |
| Manage Notification Rules | Per-event channel routing, throttle window                                                       | Owner          |
| Manage Tenant Branding    | Logo, colors, subdomain, sender name                                                             | Owner          |
| Manage Default Settings   | The `default_settings` row that seeds new workspaces (see Section 6)                             | Owner          |

---

## 4. Page-by-Page Breakdown

For each route: URL, purpose, components, data shown, primary actions, role access.

> Section 4 lists the **rebuild target**. Routes in `/admin`, `/editor-admin`, `/content-admin`, `/sales` from v0 are rebuilt under their new prefixes. Legacy redirects MUST exist so old URLs don't 404.

### 4.1 Public routes (no auth)

| Route                               | Purpose                                        | Notes |
| ----------------------------------- | ---------------------------------------------- | ----- |
| `/`                                 | Redirects to `/login`.                         |       |
| `/login`                            | Login form (email/pass + Google + Magic Link). |       |
| `/welcome`                          | First-time user landing.                       |       |
| `/auth/callback`                    | OAuth callback handler.                        |       |
| `/auth/magic-link`                  | Magic-link exchange.                           |       |
| `/reset-password`                   | Reset password using temp 14-char password.    |       |
| `/review/:videoId?token=`           | Guest video review.                            |       |
| `/project-review/:projectId?token=` | Guest project review.                          |       |
| `/v/:code`                          | Short-link resolver.                           |       |
| `/oauth/callback`                   | Generic OAuth callback (Meta, etc.).           |       |
| `/workspace/public/:token`          | Public workspace access via magic link.        |       |
| `/f/:formSlug` `[NEW]`              | Public form (Forms feature).                   |       |
| `/unauthorized`                     | 403 page.                                      |       |
| `*`                                 | NotFound → role-aware redirect.                |       |

### 4.2 `/owner/*`

(Owner has the largest navigation. Manager mirrors except finance.)

| Route                                    | Page                         | Purpose                                             |
| ---------------------------------------- | ---------------------------- | --------------------------------------------------- |
| `/owner/dashboard`                       | Owner Dashboard              | 3-tab: Production / Sales / Finance                 |
| `/owner/clients`                         | Workspaces list              | All workspaces (filterable)                         |
| `/owner/clients/:id`                     | Workspace detail             | Profile, projects, members, journey, info, settings |
| `/owner/clients/:id/projects/:projectId` | Project detail               | Cycles, videos, schedule, notes, tasks              |
| `/owner/projects`                        | All projects                 | Cross-workspace project list                        |
| `/owner/videos`                          | All videos                   | Cross-workspace video table                         |
| `/owner/pipeline` `[NEW unified]`        | Pipeline Kanban              | All videos by status                                |
| `/owner/leads`                           | Leads                        | Pre-qualified inbound                               |
| `/owner/crm/people`                      | CRM People                   |                                                     |
| `/owner/crm/people/:id`                  | Person profile (Attio-style) |                                                     |
| `/owner/crm/companies`                   | CRM Companies                |                                                     |
| `/owner/crm/deals`                       | Deals Kanban                 |                                                     |
| `/owner/crm/calls`                       | Calls list                   |                                                     |
| `/owner/crm/calls/:id`                   | Call detail                  |                                                     |
| `/owner/crm/editors`                     | External editor talent       |                                                     |
| `/owner/crm/contacts`                    | Unified contacts inbox       |                                                     |
| `/owner/partnerships`                    | Partnership applications     |                                                     |
| `/owner/email-hub`                       | Email Hub                    | Templates, campaigns, sequences                     |
| `/owner/forms` `[NEW]`                   | Forms manager                | List + builder                                      |
| `/owner/studio`                          | Studio picker                | Pick a client to enter their Studio                 |
| `/owner/studio/:clientId`                | Studio workspace             | Full Studio UI                                      |
| `/owner/talent-network`                  | Talent Network admin         |                                                     |
| `/owner/talent-network/:id`              | Talent profile               |                                                     |
| `/owner/tasks`                           | My Tasks                     |                                                     |
| `/owner/workboard`                       | Workboard                    | Cross-team kanban                                   |
| `/owner/notifications`                   | Notifications                |                                                     |
| `/owner/media-library`                   | Media library                |                                                     |
| `/owner/analytics`                       | Agency analytics             |                                                     |
| `/owner/agency-growth`                   | Agency growth                |                                                     |
| `/owner/agency-growth-manage`            | Growth admin                 |                                                     |
| `/owner/finance` `[NEW unified]`         | Finance dashboard            | Stripe + ledger + P&L (OWNER ONLY)                  |
| `/owner/editor-productivity`             | Editor productivity          |                                                     |
| `/owner/editor-productivity/:id`         | Editor detail                |                                                     |
| `/owner/credentials`                     | Credentials vault            |                                                     |
| `/owner/management`                      | Management dashboard         |                                                     |
| `/owner/user-management`                 | User management              |                                                     |
| `/owner/manage/statuses` `[NEW]`         | Modular status admin         |                                                     |
| `/owner/manage/roles` `[NEW]`            | Modular role admin           |                                                     |
| `/owner/manage/video-types` `[NEW]`      | Modular video types          |                                                     |
| `/owner/manage/deal-stages` `[NEW]`      | Modular deal stages          |                                                     |
| `/owner/manage/email-templates`          | Email templates              |                                                     |
| `/owner/manage/ai-prompts` `[NEW]`       | AI system prompts            |                                                     |
| `/owner/manage/notifications` `[NEW]`    | Notification rules           |                                                     |
| `/owner/manage/branding` `[NEW]`         | Tenant branding              |                                                     |
| `/owner/clips-ai`                        | Jarvis AI chat               |                                                     |
| `/owner/client-chats`                    | All client chats             |                                                     |
| `/owner/client-chats/:roomId`            | Chat detail                  |                                                     |
| `/owner/security`                        | Security dashboard           |                                                     |
| `/owner/error-logs`                      | Error logs                   |                                                     |
| `/owner/test-email`                      | Email testing                |                                                     |
| `/owner/settings`                        | Owner settings               |                                                     |

### 4.3 `/manager/*` (was `/admin/*`)

Same as `/owner/*` **MINUS**: `/finance`, `/agency-growth-manage` (revenue tabs only), `/manage/branding` (unless permitted), `/security`, finance settings, owner-only AI prompts.

### 4.4 `/senior-editor/*` (was `/editor-admin/*`)

| Route                                                                          | Notes                  |
| ------------------------------------------------------------------------------ | ---------------------- |
| `/senior-editor/dashboard`                                                     | Workboard-style        |
| `/senior-editor/clients`                                                       | Assigned clients only  |
| `/senior-editor/clients/:id`, `/senior-editor/clients/:id/projects/:projectId` |                        |
| `/senior-editor/projects`                                                      | Assigned only          |
| `/senior-editor/videos`                                                        | Assigned only          |
| `/senior-editor/workboard`                                                     |                        |
| `/senior-editor/tasks`                                                         | Self + managed editors |
| `/senior-editor/editor-productivity`, `/:id`                                   | Their team             |
| `/senior-editor/my-performance`                                                |                        |
| `/senior-editor/studio`, `/studio/:clientId`                                   |                        |
| `/senior-editor/email-hub`                                                     | Assigned clients       |
| `/senior-editor/notifications`                                                 |                        |
| `/senior-editor/media-library`                                                 |                        |
| `/senior-editor/management` (limited)                                          |                        |
| `/senior-editor/user-management` (limited)                                     |                        |
| `/senior-editor/credentials`                                                   |                        |
| `/senior-editor/client-chats`, `/:roomId`                                      |                        |
| `/senior-editor/clips-ai`                                                      |                        |
| `/senior-editor/settings`                                                      |                        |

### 4.5 `/content-creator/*` (was `/content-admin/*`)

| Route                                          |
| ---------------------------------------------- |
| `/content-creator/dashboard`                   |
| `/content-creator/clients` (assigned)          |
| `/content-creator/projects`                    |
| `/content-creator/videos`                      |
| `/content-creator/workboard`                   |
| `/content-creator/studio`, `/studio/:clientId` |
| `/content-creator/client-chats`, `/:roomId`    |
| `/content-creator/notifications`               |
| `/content-creator/credentials`                 |
| `/content-creator/settings`                    |

### 4.6 `/editor/*`

| Route                                         |
| --------------------------------------------- |
| `/editor/dashboard`                           |
| `/editor/projects`                            |
| `/editor/videos`                              |
| `/editor/workboard`                           |
| `/editor/tasks`                               |
| `/editor/my-performance`                      |
| `/editor/inspiration` (read-only library)     |
| `/editor/client-chats`, `/:roomId` (assigned) |
| `/editor/notifications`                       |
| `/editor/help`                                |
| `/editor/clips-ai`                            |
| `/editor/credentials`                         |
| `/editor/settings`                            |

### 4.7 `/moderator/*` `[NEW]`

| Route                                 | Purpose                             |
| ------------------------------------- | ----------------------------------- |
| `/moderator/dashboard`                | Posting overview, queue health      |
| `/moderator/workspaces`               | Assigned workspaces                 |
| `/moderator/workspaces/:id`           | Workspace posting view              |
| `/moderator/queue`                    | Cross-workspace posting queue       |
| `/moderator/schedule`                 | Calendar view of upcoming posts     |
| `/moderator/connected-accounts`       | Per-workspace social account status |
| `/moderator/tasks`                    |                                     |
| `/moderator/client-chats`, `/:roomId` | Assigned only                       |
| `/moderator/notifications`            |                                     |
| `/moderator/credentials`              |                                     |
| `/moderator/settings`                 |                                     |

### 4.8 `/closer/*` (was `/sales/*`)

| Route                                 |
| ------------------------------------- |
| `/closer/dashboard`                   |
| `/closer/leads`                       |
| `/closer/schedule`                    |
| `/closer/follow-ups`                  |
| `/closer/crm/deals` (region-filtered) |
| `/closer/crm/calls`, `/:id`           |
| `/closer/crm/contacts`                |
| `/closer/crm/people`, `/:id`          |
| `/closer/crm/companies`               |
| `/closer/notifications`               |
| `/closer/settings`                    |

### 4.9 `/client/*`

| Route                                              | Purpose                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| `/client/dashboard`                                | Home — hero card, "Your Attention" prompts, weekly delivery feed        |
| `/client/videos`                                   | All videos with three-tier tab system: My Videos / All Videos / Backlog |
| `/client/videos/:cycleId`                          | Cycle-specific video list                                               |
| `/client/queue`                                    | Posting queue                                                           |
| `/client/monetization`                             | Reel Insights analytics                                                 |
| `/client/files`                                    | Files (workspace-scoped media library)                                  |
| `/client/media-library`                            | Same                                                                    |
| `/client/my-team`                                  | Agency team assigned to this workspace                                  |
| `/client/talent-network`, `/:talentId`             | Browse hires                                                            |
| `/client/chat`                                     | Chat with agency                                                        |
| `/client/notifications`                            |                                                                         |
| `/client/archived`                                 | Archived videos                                                         |
| `/client/profile` → `/client/settings?tab=profile` |                                                                         |
| `/client/settings`                                 | Profile, brand, onboarding, connected accounts, billing                 |
| `/client/clips-ai`                                 | Jarvis (if enabled)                                                     |

### 4.10 `/company/*` `[NEW]`

For Company workspace owners. Aggregate views across sub-members.

| Route                  | Purpose                               |
| ---------------------- | ------------------------------------- |
| `/company/dashboard`   | Aggregate overview of all sub-members |
| `/company/members`     | Manage sub-members                    |
| `/company/members/:id` | Per sub-member view                   |
| `/company/projects`    | All projects across sub-members       |
| `/company/billing`     | Workspace billing                     |
| `/company/settings`    | Workspace settings                    |

### 4.11 Shared / utility

| Route                                                               |
| ------------------------------------------------------------------- |
| `/profile/:userId` (any authenticated user can view a user profile) |
| `/search` (global search)                                           |
| `/onboarding` (the 16-question form for new clients)                |

---

## 5. Integrations & External Services

| Service                                                        | Used for                                                                           | Features that depend on it                                      | Status                                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Stream**                                          | HLS video playback                                                                 | All in-app video review                                         | `[KEEP]`                                                                                                          |
| **Cloudflare R2**                                              | Original-quality storage                                                           | All uploads, all downloads                                      | `[KEEP]` (multipart-only)                                                                                         |
| **Stripe**                                                     | Payments, subscriptions, finance dashboard                                         | Billing, Send Payment automation, finance analytics             | `[KEEP]` (BYOK)                                                                                                   |
| **Lovable Native Email**                                       | All email sending                                                                  | Notifications, magic links, campaigns, transactional            | `[CHANGED — replaces Resend]`                                                                                     |
| **Calendly**                                                   | Sales call booking, kickoff/practice/recording sessions                            | CRM Calls, client journey steps                                 | `[KEEP]`                                                                                                          |
| **Fireflies.ai**                                               | Call recording + transcription (GraphQL)                                           | Call detail page, AI scoring                                    | `[KEEP]`                                                                                                          |
| **Slack**                                                      | Notification routing, mention mirrors                                              | `#video-updates`, `#client-activity`, `#clips-app`, DM mentions | `[KEEP]`                                                                                                          |
| **Google OAuth**                                               | Sign-in                                                                            | Auth                                                            | `[KEEP]`                                                                                                          |
| **Meta OAuth (Facebook/Instagram)**                            | Read analytics today; future direct posting                                        | Reel Insights, future cross-platform publishing                 | `[KEEP] + extend`                                                                                                 |
| **TikTok OAuth**                                               | Future direct posting                                                              | Cross-platform publishing                                       | `[NEW — scaffolding only]`                                                                                        |
| **LinkedIn OAuth**                                             | Future direct posting                                                              | Cross-platform publishing                                       | `[NEW — scaffolding only]`                                                                                        |
| **YouTube OAuth**                                              | Future direct posting                                                              | Cross-platform publishing                                       | `[NEW — scaffolding only]`                                                                                        |
| **X (Twitter) OAuth**                                          | Future direct posting                                                              | Cross-platform publishing                                       | `[NEW — scaffolding only]`                                                                                        |
| **Web Push**                                                   | Browser push notifications                                                         | All notifications                                               | `[KEEP]`                                                                                                          |
| **Lovable AI Gateway → GPT-5 Mini**                            | AI features (Jarvis, call scoring, caption gen, foundation auto-fill, content gen) | Content Studio AI, sales call scoring, Jarvis                   | `[CHANGED — was Gemini/Lovable AI mix; consolidate on `openai/gpt-5-mini` as default; allow per-tenant override]` |
| **`[DROPPED]` ElevenLabs**                                     | (was voice gen)                                                                    | Removed                                                         | `[DROPPED]`                                                                                                       |
| **`[DROPPED]` Resend**                                         | Email                                                                              | Replaced by Lovable Native Email                                | `[DROPPED]`                                                                                                       |
| **`[DROPPED]` Talent Network marketplace transactional flows** | Hire/pay editors through platform                                                  | Removed (browse-only stays for clients)                         | Partial drop per Q answers                                                                                        |

---

## 6. Business Rules & Edge Cases

### 6.1 Onboarding gating

- **Trigger:** A new `client` user logs in for the first time.
- **Behavior:** Onboarding dialog opens with 16 questions. User MAY complete now or skip.
- **Locks:** `kickoff_call_booked` and `practice_session_booked` journey steps remain disabled until form is complete.
- **Persistence:** A "Complete onboarding (X/16)" banner shows on every page until done.
- **Auto-fill:** On completion, answers populate `client_foundation`, `client_bios`, `client_audience_avatars`, `client_pillars` via `auto-fill-foundation` edge function.
- **Error handling:** If the dialog crashes, user can resume from `/onboarding`. Block accidental closes (`OnboardingDialog` already has this).

### 6.2 "Send Payment" deal stage automation `[FLAGSHIP NEW]`

**Trigger:** A closer drags a deal to the "Send Payment" stage.

**Confirmation modal opens:**

- Heading: "Send payment request to {{client.name}}?"
- Two options: **Auto** | **Manual** (radio).
- **Auto path:**
  1. Generate a Stripe Payment Link (BYOK Stripe) for the deal's plan amount in the deal's currency (USD/AED).
  2. Send a "Payment requested" email via Lovable Native Email using a `[MODULAR]` template.
  3. Watch for `invoice.paid` webhook (`stripe-webhook`).
  4. **On payment success:**
     - Create the workspace (`clients` row) with `workspace_type` from deal.
     - Create the first project from the deal's plan.
     - Generate a magic link.
     - Send the "Welcome to {{tenant_name}}" onboarding email with the magic link.
     - Auto-create a `crm_people.linked_user_id` link.
     - Move deal to `Won` stage.
     - Notify the closer + manager + owner.
  5. **On payment failure / timeout:** notify the closer, deal stays in "Send Payment" with a retry button.
- **Manual path:**
  - Closer enters payment confirmation manually (e.g., for IBAN/bank transfer).
  - Closer types: payment date, amount received, payment method, reference.
  - Same workspace-creation flow fires.

**What MUST NOT happen:**

- A deal MUST NOT advance to "Won" without a confirmed payment (auto or manual).
- A workspace MUST NOT be created if the closer abandons the modal.
- The magic link email MUST NOT send before the workspace exists.
- If two webhooks fire (race), only one workspace MUST be created — use idempotency on `stripe_events_log.event_id`.

**Error handling:**

- Stripe API down → fallback to manual mode with banner.
- Email send failure → log to `email_logs`, retry via `process-email-queue`, surface in error logs.
- Workspace creation failure → roll back (delete partial rows), notify owner, log to `client_error_logs`.

### 6.3 Trial Reels lifecycle `[corrected per latest user message]`

- **Add 0 trials:** video stays as a single video. No trial UI shown.
- **Add 1+ trials:** the entire group becomes "Trial Reels". UI shows the group as a card with all variants side-by-side.
- **Promote winner:** user selects one trial → it becomes the main video, statuses propagate from the winner. Losers are NOT auto-deleted; they become archived versions tagged `trial_loser=true` for analytics.
- **Manual cleanup:** users MAY bulk-delete losers later. Bulk delete >5 requires typed confirmation.

### 6.4 Status → Role permission enforcement

- Every status transition MUST check `status_role_permissions` BEFORE writing.
- Server-side check via RLS or security-definer function `can_transition(user_id, video_id, from_status, to_status)`.
- Client UI MUST hide buttons for transitions the user can't perform — but the server is the source of truth.

### 6.5 Editor assignment cascade

- When an editor is assigned at workspace level, all current and future projects/videos in that workspace inherit visibility.
- When assigned at project level, all current and future videos in that project inherit.
- When assigned at video level, that video has strict ownership; other editors lose write access.
- Removing a workspace assignment MUST NOT remove explicit project- or video-level assignments.

### 6.6 Posting schedule override

- A video MAY be force-scheduled for a specific date. This override persists even if the project schedule changes.
- If a project's schedule is updated, only **non-overridden** scheduled videos re-distribute.

### 6.7 Bulk delete safety

- Deleting 1–5 videos: single confirmation dialog.
- Deleting 6+: typed confirmation ("DELETE [project name]") required.
- All deletes are soft (`status = 'archived'`) by default.
- Hard delete is owner-only and requires a second confirmation + 30-day soft-delete grace period before R2/Stream files purge (cleanup cron).

### 6.8 R2 original quality on download

- Every download endpoint MUST hit R2, never Stream.
- `download-media` proxies via signed URL to bypass CORS.
- If R2 has the file but Stream doesn't, downloads still work; if Stream has it but R2 doesn't (legacy data), trigger `backfill-videos-to-r2` on demand.

### 6.9 Guest links

- Default 30-day expiry (`review_tokens.expires_at`, `project_review_tokens.expires_at`).
- Per-link `download_enabled` boolean — `download-media` checks this.
- Guest comments tagged with the guest's name/email.
- Guest cannot see internal-only comments.
- Guest cannot see internal-only versions (versions flagged `internal_only=true`).

### 6.10 Client review action visibility

- `rough_cut`: Approve / Revise / **Decline** all visible.
- `final_review`: Approve / Revise visible. **Decline hidden.** If a final cut is being cancelled, the manager initiates via the Cancel workflow which logs the cancellation reason for analytics — Decline is hidden from the client to discourage final-stage cancellations.

### 6.11 Comment version isolation + show-all toggle

- Default: comments belong to one version.
- "Show all versions" toggle in the review modal aggregates comments across versions for context.
- The toggle is a **read-only display setting**; new comments still attach to the active version.

### 6.12 Notification throttle and mention opt-out

- Max 1 notification per user per video per hour (rolling window).
- A user MAY opt out of mention notifications globally (`MENTION_OPT_OUT` table). Opt-out blocks Slack DM and email but in-app mention indicator MAY still show.

### 6.13 Workspace data isolation

- Company sub-members MUST NOT see each other's content streams unless explicitly cross-shared.
- All RLS policies on content tables MUST filter by `client_id` or `workspace_id`.

### 6.14 Closer territory filtering

- Leads/deals/calls/notifications filter by closer's `region`.
- `sales_territories` table maps closer → region(s).
- Owner override available.

### 6.15 Magic links

- 30-day validity (configurable per tenant).
- Single-use by default; option to enable multi-use for shared workspace links.
- Generated via `send-magic-link-email` or `send-client-magic-link`.

### 6.16 PWA + native app

- `[KEEP]` Existing PWA prompt-based update workflow (`registerType: "prompt"`) — never auto-update.
- Native app `[TBD — Q19 deferred]`. Build the PWA to be wrappable in Capacitor when the native decision is made.

### 6.17 White-label tenant isolation

- Every business table MUST have `tenant_id`.
- Every RLS policy MUST filter by `tenant_id` derived from the authenticated user's profile.
- Cross-tenant queries are impossible by design.

### 6.18 Modular status add/edit/delete migration rules

- **Add:** Inserts into `statuses` table with a unique slug. No data migration.
- **Rename:** Updates display name. Slug stays the same. No data migration.
- **Reorder:** Updates `sort_order` column.
- **Delete:** Requires choosing a "merge target" status. All `content_items.status_id = X` are updated to the target before delete. If no rows reference X, delete is allowed without merge.
- **Permission edits:** Update `status_role_permissions` rows. Effective immediately.

### 6.19 Cleanup automation `[KEEP]`

- `pg_cron` schedules:
  - `cleanup-old-thumbnails` weekly
  - `cleanup-old-video-versions` monthly (after archive grace period)
  - `cleanup-failed-upload` daily
  - `run-storage-cleanup` weekly (R2 orphans)
  - `audit-cloudflare-videos` weekly (Stream consistency)
  - `process-email-queue` every minute
  - `schedule-call-reminders` every 15 minutes
  - `sync-calendly-events` hourly
  - `stripe-sync` every 6 hours
  - Search index refresh nightly

### 6.20 Rate limiting `[KEEP]`

- Industry-standard SaaS rate limits via `rate_limit_entries`.
- 100 req/min per user for API.
- 10 req/min for AI endpoints.
- 5 req/min for email send.
- Brute-force lockout: 5 failed login attempts in 15 min → 15-min lockout.

---

## 7. Database Schema Appendix

### 7.1 Schema philosophy

- **RLS-first.** Every public-schema table MUST have RLS enabled. No exceptions. The only tables that MAY skip RLS are admin-only logging tables explicitly marked.
- **Multi-tenant by `tenant_id`.** Every business table includes `tenant_id UUID NOT NULL REFERENCES tenants(id)`.
- **Roles via `user_roles` only.** Never on `profiles`. Use the `has_role(_user_id, _role)` security-definer function.
- **Soft deletes preferred.** `archived_at TIMESTAMPTZ` over hard delete on user-facing tables.
- **Triggers for `updated_at`.** Universal `update_updated_at_column()` trigger on every table with `updated_at`.
- **Modular config tables** (`statuses`, `deal_stages`, `video_types`, etc.) are per-tenant — every row has `tenant_id`.

### 7.2 Tables — full list with tags

> The full DDL is too long to fully expand for every table here. The categories and tags below are the **rebuild specification**. The implementing agent MUST generate migrations that produce a database equivalent to the v0 live schema (132 tables enumerated below) **plus** the `[NEW]` tables, **with** the `[CHANGED]` migrations, **without** the `[DROPPED]` tables.

#### 7.2.1 Identity & tenancy

| Table                              | Tag                                                                                                                                                                | Purpose                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `tenants` `[NEW]`                  | New                                                                                                                                                                | One row per agency. Branding, subdomain, plan. |
| `profiles` `[KEEP]`                | Profile per auth user. Add `tenant_id`.                                                                                                                            |
| `user_roles` `[CHANGED]`           | Role enum updated to: `owner`, `manager`, `senior_editor`, `content_creator`, `editor`, `moderator`, `closer`, `client`. Migration script renames old enum values. |
| `app_role` (enum) `[CHANGED]`      | Same migration.                                                                                                                                                    |
| `preview_sessions` `[KEEP]`        | Universal Preview Mode tracking.                                                                                                                                   |
| `active_sessions` `[KEEP]`         | Active session log.                                                                                                                                                |
| `login_history` `[KEEP]`           |                                                                                                                                                                    |
| `password_reset_tokens` `[KEEP]`   |                                                                                                                                                                    |
| `client_invitations` `[KEEP]`      |                                                                                                                                                                    |
| `client_members` `[KEEP]`          | Company workspace sub-members.                                                                                                                                     |
| `client_access` `[KEEP]`           | Access grants.                                                                                                                                                     |
| `client_team_assignments` `[KEEP]` | Workspace ↔ team member.                                                                                                                                           |

#### 7.2.2 Workspaces, projects, cycles, videos

| Table                                                                                                                                     | Tag                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `clients` `[CHANGED]`                                                                                                                     | Add `workspace_type` enum (`individual` \| `company`), `tenant_id`.                                   |
| `projects` `[CHANGED]`                                                                                                                    | Add `tenant_id`, `project_type_template_id` `[KEEP]`, `posting_schedule`, `current_cycle`, `cadence`. |
| `content_sessions` `[CHANGED — RENAME to `cycles`in code/UX, keep table name as-is to avoid mass migration OR rename to`project_cycles`]` | The user clarified "Cycle" is the new term; table SHOULD be renamed to `project_cycles` for clarity.  |
| `project_cycle_resets` `[KEEP]`                                                                                                           | Renewal log.                                                                                          |
| `content_items` `[CHANGED]`                                                                                                               | Add `tenant_id`, link to modular `statuses.id` instead of enum.                                       |
| `content_item_versions` (rename of `content_versions`) `[KEEP]`                                                                           | Add `internal_only BOOLEAN`, `trial_loser BOOLEAN`.                                                   |
| `trial_reels` `[KEEP]`                                                                                                                    | Group of trial variants.                                                                              |
| `video_status_history` `[KEEP]`                                                                                                           | Audit trail.                                                                                          |
| `video_editors` `[KEEP]`                                                                                                                  | Per-video assignment.                                                                                 |
| `thumbnail_versions` `[KEEP]`                                                                                                             |                                                                                                       |
| `video_annotations` `[KEEP]`                                                                                                              |                                                                                                       |
| `video_comments` `[CHANGED]`                                                                                                              | Add `internal_only BOOLEAN`.                                                                          |
| `comment_attachments` `[KEEP]`                                                                                                            |                                                                                                       |
| `content_comments` `[KEEP]`                                                                                                               | Comments on content scripts/ideas.                                                                    |
| `download_logs` `[KEEP]`                                                                                                                  |                                                                                                       |
| `upload_logs` `[KEEP]`                                                                                                                    |                                                                                                       |
| `video_usage_tracking` `[KEEP]`                                                                                                           |                                                                                                       |

#### 7.2.3 Modular configuration `[NEW table family]`

| Table                             | Purpose                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `statuses` `[NEW]`                | Per-tenant pipeline statuses. Replaces hard-coded enum.                         |
| `status_role_permissions` `[NEW]` | Per-status × per-role permissions (view, edit, transition_from, transition_to). |
| `video_types` `[NEW]`             | Per-tenant video types. Replaces hard-coded list.                               |
| `deal_stages` `[NEW]`             | Per-tenant deal stages. Replaces enum.                                          |
| `solution_types` `[KEEP]`         | Existing project types.                                                         |
| `project_type_templates` `[KEEP]` | Existing template builder.                                                      |
| `project_type_options` `[KEEP]`   |                                                                                 |
| `project_status_options` `[KEEP]` |                                                                                 |
| `crm_deal_options` `[KEEP]`       |                                                                                 |
| `notification_rules` `[NEW]`      | Per-event channel routing config.                                               |
| `ai_prompts` `[NEW]`              | Per-tenant editable system prompts.                                             |
| `default_settings` `[KEEP]`       | The "seed" settings for new workspaces.                                         |
| `settings` `[KEEP]`               | Per-tenant runtime settings.                                                    |

#### 7.2.4 Studio & content production

| Table                                 | Tag                                    |
| ------------------------------------- | -------------------------------------- |
| `client_foundation` `[KEEP]`          | Brand foundation.                      |
| `client_bios` `[KEEP]`                |                                        |
| `client_audience_avatars` `[KEEP]`    |                                        |
| `client_pillars` `[KEEP]`             |                                        |
| `client_brain_materials` `[KEEP]`     |                                        |
| `client_studio_preferences` `[KEEP]`  |                                        |
| `content_ideas` `[KEEP]`              |                                        |
| `content_scripts` `[KEEP]`            |                                        |
| `content_script_versions` `[KEEP]`    |                                        |
| `content_vault` `[KEEP]`              |                                        |
| `script_templates` `[KEEP]`           |                                        |
| `hooks_library` `[KEEP]`              |                                        |
| `sop_templates` `[KEEP]`              |                                        |
| `sops` `[KEEP]`                       |                                        |
| `branding_deck_comments` `[KEEP]`     |                                        |
| `onboarding_documents` `[KEEP]`       |                                        |
| `client_onboarding_progress` `[KEEP]` |                                        |
| `client_journey_steps` `[KEEP]`       |                                        |
| `custom_journey_steps` `[KEEP]`       |                                        |
| `interviews` `[KEEP]`                 | Renamed conceptually; keep table name. |

#### 7.2.5 CRM, sales, billing

| Table                                                                      | Tag                                                    |
| -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `crm_people` `[KEEP]`                                                      | Unified person record. Add `linked_user_id`.           |
| `crm_companies` `[KEEP]`                                                   |                                                        |
| `crm_deals` `[CHANGED]`                                                    | Replace stage enum with `stage_id` → `deal_stages.id`. |
| `crm_editors` `[KEEP]`                                                     |                                                        |
| `leads` `[KEEP]`                                                           |                                                        |
| `leads_custom_columns`, `leads_saved_views`, `saved_filter_views` `[KEEP]` |                                                        |
| `custom_columns`, `custom_field_values` `[KEEP]`                           |                                                        |
| `partnership_applications` `[KEEP]`                                        |                                                        |
| `calendly_events` `[KEEP]`                                                 |                                                        |
| `follow_ups` `[KEEP]`                                                      |                                                        |
| `sales_territories` `[KEEP]`                                               | Renamed UI label "Region".                             |
| `client_hires` `[KEEP]`                                                    |                                                        |
| `stripe_charges`, `stripe_subscriptions`, `stripe_events_log` `[KEEP]`     |                                                        |
| `finance_transactions` `[KEEP]`                                            |                                                        |
| `accounting_entries` `[NEW]`                                               | Manual ledger entries.                                 |

#### 7.2.6 Forms `[NEW table family]`

| Table                         | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `forms` `[NEW]`               | Form definitions.                              |
| `form_fields` `[NEW]`         | Field schema per form.                         |
| `form_submissions` `[NEW]`    | Submitted data.                                |
| `talent_form_fields` `[KEEP]` | Existing — migrate into generic `form_fields`. |

#### 7.2.7 Communication

| Table                                                   | Tag |
| ------------------------------------------------------- | --- |
| `chat_rooms` `[KEEP]`                                   |     |
| `chat_messages` `[KEEP]`                                |     |
| `chat_attachments` `[KEEP]`                             |     |
| `chat_mentions` `[KEEP]`                                |     |
| `chat_mutes` `[KEEP]`                                   |     |
| `chat_reactions` `[KEEP]`                               |     |
| `chat_read_receipts` `[KEEP]`                           |     |
| `chat_threads` `[KEEP]`                                 |     |
| `team_chat_rooms`, `team_chat_members` `[KEEP]`         |     |
| `notifications` `[KEEP]`                                |     |
| `notification_preferences` `[KEEP]`                     |     |
| `push_subscriptions` `[KEEP]`                           |     |
| `email_templates` `[KEEP]`                              |     |
| `email_campaigns`, `email_campaign_recipients` `[KEEP]` |     |
| `email_queue`, `email_logs` `[KEEP]`                    |     |

#### 7.2.8 Tasks, files, misc

| Table                                                                                                                                    | Tag                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `project_tasks` `[KEEP]`                                                                                                                 |                                      |
| `project_notes` `[KEEP]`                                                                                                                 |                                      |
| `starred_projects` `[KEEP]`                                                                                                              |                                      |
| `shared_projects` `[KEEP]`                                                                                                               | Cross-workspace sharing.             |
| `client_top_reels` `[KEEP]`                                                                                                              |                                      |
| `client_organic_metrics`, `client_ads_metrics`, `client_automation_metrics` `[KEEP]`                                                     |                                      |
| `agency_instagram_metrics`, `agency_facebook_ads_metrics`, `academy_instagram_metrics` `[KEEP]`                                          |                                      |
| `media_library_items` (existing under `get-media-library`) `[KEEP]`                                                                      |                                      |
| `internal_credentials`, `client_credentials`, `credential_assignments`, `client_credential_assignments`, `credential_audit_log` `[KEEP]` |                                      |
| `client_api_tokens` `[KEEP]`                                                                                                             |                                      |
| `talent_network`, `talent_portfolio_videos`, `studios` `[KEEP browse]`                                                                   | Hire/transactional flows `[DROPPED]` |
| `review_tokens`, `project_review_tokens` `[KEEP]`                                                                                        |                                      |
| `short_links` `[KEEP]`                                                                                                                   |                                      |
| `activity_logs` `[KEEP]`                                                                                                                 |                                      |
| `client_error_logs`, `error_logs` `[KEEP]`                                                                                               |                                      |
| `rate_limit_entries` `[KEEP]`                                                                                                            |                                      |
| `editor_goals` `[KEEP]`                                                                                                                  |                                      |
| `user_kanban_boards` `[KEEP]`                                                                                                            |                                      |
| `user_column_preferences`, `project_column_labels`, `project_column_order`, `project_client_visible_columns` `[KEEP]`                    |                                      |
| `user_ai_settings`, `user_ai_context_files` `[KEEP]`                                                                                     |                                      |
| `ai_conversations`, `ai_messages` `[KEEP]`                                                                                               | Jarvis chat.                         |

#### 7.2.9 Cross-platform publishing scaffolding `[NEW]`

| Table                           | Purpose                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `platform_oauth_tokens` `[NEW]` | Per-client per-platform OAuth credentials (Meta, TikTok, LinkedIn, YouTube, X). |
| `client_posting_queue` `[NEW]`  | Scheduled posts with platform targets.                                          |
| `posting_attempts` `[NEW]`      | Per-attempt log for debugging publish failures.                                 |

### 7.3 Enum migration map

```sql
-- app_role enum migration
ALTER TYPE public.app_role RENAME VALUE 'admin' TO 'manager';
ALTER TYPE public.app_role RENAME VALUE 'editor_admin' TO 'senior_editor';
ALTER TYPE public.app_role RENAME VALUE 'content_admin' TO 'content_creator';
ALTER TYPE public.app_role RENAME VALUE 'sales' TO 'closer';
ALTER TYPE public.app_role ADD VALUE 'moderator';
-- 'owner', 'editor', 'client' unchanged

-- video status enum: DROP and replace with FK to statuses table per-tenant
-- Migration script:
--   1. Insert default 11 statuses for each existing tenant
--   2. UPDATE content_items SET status_id = (SELECT id FROM statuses WHERE tenant_id = ... AND slug = OLD_status)
--   3. ALTER TABLE content_items DROP COLUMN status, ADD CONSTRAINT FK status_id

-- deal stage enum: same pattern with deal_stages table
```

### 7.4 Triggers, functions, security definers `[KEEP all from v0, plus new]`

Existing critical functions to preserve:

- `has_role(_user_id, _role)` — security definer for RLS.
- `update_updated_at_column()` — universal trigger.
- `handle_new_user()` — trigger on `auth.users` insert that creates `profiles` row.
- All `notify-*` edge function triggers.

`[NEW]` functions:

- `can_transition(_user_id, _video_id, _from_status, _to_status)` — security definer enforcing modular status permissions.
- `tenant_id_for_user(_user_id)` — used by every RLS policy.
- `is_workspace_member(_user_id, _workspace_id)` — security definer for client visibility.

### 7.5 pg_cron schedules

(See 6.19.) All schedules MUST be re-created in the rebuild.

---

## 8. Modularity & Customization Summary

The single most important design property of this rebuild: **every behavior an agency might want to change is configurable through a UI, not a code change.**

The following are NEVER hard-coded:

- Statuses (names, order, colors, transitions, role permissions, client visibility threshold)
- Roles (display names, permissions per page, permissions per action)
- Video types
- Deal stages
- Project types (already modular)
- Posting day rules (per project)
- AI system prompts (Jarvis, sales scoring, content gen, caption gen)
- Email template content
- Notification routing rules and throttle windows
- Tenant branding (logo, colors, subdomain, sender name)
- Default settings for new workspaces
- Forms (replace all hard-coded application flows)

The hard-coded foundation layer is intentionally minimal: the auth flow, the data model relationships, the storage strategy, the realtime channels, the security boundaries (RLS), and the integrations themselves.

---

## 9. Open Questions / TBD for Future Iteration

These items are intentionally deferred. Build the data model and minimal stubs; postpone the polished UX.

1. **Content Studio detailed UX** (Q49, Q52). Build the data tables and a basic page; defer rich editor decisions.
2. **Slash command vs selection toolbar in Studio editor** (Q51). Implement a minimal TipTap with both options behind a feature flag.
3. **Native mobile app** (Q19). PWA today; Capacitor wrap when decided.
4. **Direct cross-platform publishing flow detail** (Section 3.16). Build OAuth scaffolding and queue tables; defer the publish UX.
5. **Multi-tenant agency provisioning UX** (Section 1.5). Manual provisioning until specified.
6. **Talent Network transactional flows** — confirmed dropped per Q answers but the browse UI stays.
7. **Custom client gating for "special treatment"** (Q114). Implement as a per-client override flag on the modular status visibility rule, but the polished UI for managing exceptions is deferred.

---

## 10. Acceptance Criteria for the Rebuild

The rebuild MUST satisfy the following before being considered complete:

1. ✅ All 9 identities implemented with correct role names and per-role permission matrices.
2. ✅ Modular admin surfaces functional for: statuses, roles, video types, deal stages, AI prompts, notification rules, email templates, branding.
3. ✅ Workspace-named URLs and per-tenant branding working end-to-end.
4. ✅ Onboarding gating (16 questions → unlock kickoff/practice).
5. ✅ Send Payment automation: deal → Stripe link → payment → workspace creation → magic-link onboarding email — fully automated with manual fallback.
6. ✅ Trial Reels lifecycle works per Section 6.3.
7. ✅ All videos play via Cloudflare Stream and download from R2 (multipart-only uploads).
8. ✅ Guest review links work for both single videos (`/review/:videoId`) and projects (`/project-review/:projectId`), with 30-day expiry and download toggle.
9. ✅ Chat is real-time, supports voice notes, attachments, mentions, reactions; Slack mirror works with mention opt-out.
10. ✅ CRM unifies People/Companies/Editors with deal Kanban, calls (Calendly + Fireflies), AI scoring.
11. ✅ Forms feature replaces all hard-coded application flows; submissions flow into CRM.
12. ✅ Email Hub uses Lovable Native Email; queue + suppression list operational.
13. ✅ Notifications flow through in-app, push, email, Slack with throttling.
14. ✅ Owner sees finance; manager does not. Verified by RLS tests.
15. ✅ All RLS policies enforce tenant isolation and workspace data isolation.
16. ✅ All 121 edge function equivalents are deployed (or consolidated where appropriate).
17. ✅ pg_cron schedules running for cleanup, email queue, Calendly sync, Stripe sync, search index refresh.
18. ✅ Universal Preview Mode functional for owner/manager.
19. ✅ Dark theme + light theme support with HSL design tokens; never raw color classes.
20. ✅ PWA with prompt-based update workflow.
21. ✅ Universal Preview Mode banner pins on top during preview, exits cleanly.
22. ✅ Rate limiting active.
23. ✅ Cross-platform publishing OAuth scaffolding deployed for Meta/TikTok/LinkedIn/YouTube/X (active publishing flow MAY ship later).

---

_End of PRD. Total scope: 9 identities, ~70 routes, 132 tables, 121 edge functions, 11 modular admin surfaces, 14 integrations, 23 acceptance criteria._
