# ClipsApp — Permissions Matrix & RLS Implementation Reference
**Companion to PRD v1.0**
*Generated: 2026-04-26*

> This document is the canonical RLS implementation reference for the rebuild. Every row in the matrix maps to one or more Supabase RLS policies. When this document conflicts with the PRD, **this document wins for permissions**; the PRD wins for everything else.

---

## Conventions

| Symbol | Meaning |
|--------|---------|
| ✅ | Full access |
| ❌ | No access (denied at the RLS layer) |
| ⚠️ | Conditional / scoped access — see the inline qualifier |
| 🔒 | Owner-only override available even when symbol shows ❌ |
| `[MODULAR]` | Default permission shown; tenant owners can change it via Manage Roles |

**Scoping qualifiers used:**
- `assigned only` — only rows where the user is on `client_team_assignments`, `video_editors`, or equivalent
- `region only` — closer scoped to their `sales_territories.region`
- `own only` — user can only see/edit their own row
- `own workspace only` — client scoped to their `client_id` via `client_access`
- `assigned client only` — moderator scoped to clients on `moderator_assignments`
- `internal only` — visible only to internal team, hidden from clients/guests

---

## 1. Roles Overview

| Role | Slug | Hierarchy | How users get assigned |
|------|------|-----------|------------------------|
| **Owner** | `owner` | 5 | First user of a tenant; bootstrap during tenant provisioning. Can be promoted by another owner. Cannot self-promote. |
| **Manager** | `manager` *(was admin)* | 4 | Invited by Owner from `/owner/user-management`. Email invite → magic link → set password. |
| **Senior Editor** | `senior_editor` *(was editor_admin)* | 3 | Invited by Owner or Manager. Same flow as Manager. |
| **Content Creator** | `content_creator` *(was content_admin)* | 3 | Invited by Owner, Manager, or Senior Editor. |
| **Editor** | `editor` | 2 | Invited by Owner, Manager, or Senior Editor. |
| **Moderator** *(NEW)* | `moderator` | 2 | Invited by Owner, Manager, or Senior Editor. Assigned to specific clients via `moderator_assignments`. |
| **Closer** | `closer` *(was sales)* | 2 | Invited by Owner or Manager. Region/territory assigned at invite time. |
| **Client** | `client` | 1 | Three creation paths: (a) **Auto** — Closer drags deal to "Send Payment" stage, Stripe payment confirmed → workspace + client account auto-created → magic-link email sent. (b) **Manual** — Owner/Manager creates client from `/owner/clients`. (c) **Self** — Google OAuth sign-up *(disabled by default; tenant owner can enable in Manage Auth, but new Google users land on a "What kind of account?" page; no auto-`client` assignment)*. |
| **Company workspace** | n/a (workspace_type) | n/a | NOT a role. A `client_id` row with `workspace_type = 'company'`. Sub-members are `client` users linked via `client_members`. |

### Role assignment rules

- A user has **exactly one role** at a time (`user_roles` is `unique(user_id)`).
- Roles are assigned via the `change-user-role` edge function which validates the caller's role against `ROLE_MANAGEMENT_HIERARCHY`.
- Role changes are logged to `activity_logs`.
- **Roles are `[MODULAR]`** — tenant owners can rename roles, edit per-role permissions, and (in future) add new roles via Manage Roles. The matrix below represents the **default seeded permissions** for a new tenant.
- Universal Preview Mode (Owner + Manager only) lets you simulate a different role; writes are blocked during preview.

---

## 2. Permissions Matrix

### 2.1 Workspaces / Clients

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View all workspaces (list) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned client only | ❌ (sees CRM people, not workspaces) | ❌ |
| View own workspace | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ |
| Create workspace (manual) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ (uses deal flow) | ❌ |
| Create workspace (auto via Send Payment) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Edit workspace metadata (name, plan, contacts) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ⚠️ own profile fields only |
| Archive workspace | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Unarchive workspace | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Hard-delete workspace + all data | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Transfer workspace ownership | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Toggle workspace visibility flags (studio_published, etc.) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Company sub-members | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ⚠️ workspace owner only |
| View company aggregate dashboard | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ assigned client only | ❌ | ⚠️ workspace owner only |

### 2.2 Projects

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View projects (cross-workspace list) | ✅ | ✅ | ⚠️ assigned workspaces | ⚠️ assigned workspaces | ⚠️ assigned only | ⚠️ assigned client only | ❌ | ❌ |
| View own workspace projects | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ |
| Create project | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit project (name, type, target, posting schedule) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ posting schedule only | ❌ | ❌ |
| Delete project | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Set project type (apply template) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage project posting schedule (Mon-Sun) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ assigned only | ❌ | ❌ |
| Star/unstar project ("Your Attention") | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Share project across workspaces | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Generate project magic link (30-day public) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ⚠️ own workspace only |
| Toggle download permission on magic link | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ⚠️ own only |
| Revoke project magic link | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ⚠️ own only |
| Trigger project cycle reset (renewal) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add/edit project notes | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| View project progress / analytics | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ own only |

### 2.3 Cycles *(renamed from Sessions/Interviews)*

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View cycles within a project | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ own workspace only |
| Create cycle | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Rename cycle | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete cycle | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reorder cycles | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Mark cycle as backlog | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.4 Videos / Content Items

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View all videos (cross-workspace) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only + Inspiration tab read-only | ⚠️ assigned client only | ❌ | ❌ |
| View own workspace videos | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ (filtered by status visibility threshold) |
| View Inspiration library (read-only catalog) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create video (upload-first model) | ✅ | ✅ | ✅ | ❌ | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Edit video metadata (title, type, captions, hashtags) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ caption + post copy only | ❌ | ❌ |
| Edit video type (1 of 7 modular whitelist) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Reorder videos in cycle | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ |
| Soft-delete video (archive) | ✅ | ✅ | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Hard-delete video | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bulk delete videos (>5 requires typed confirm) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Set video posting date (manual override) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ❌ |
| Set status: New | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Set status: In Progress | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Set status: Rough Cut *(requires video + thumbnail)* | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Set status: Internal Review | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ project editors only | ❌ | ❌ | ❌ |
| Set status: Final Review (sends to client) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ |
| Set status: Approved | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ✅ via Approve action |
| Set status: Scheduled | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ❌ |
| Set status: Posted | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ❌ |
| Set status: Revisions Requested | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ✅ via Revise action |
| Set status: Cancelled (with reason) | ✅ | ✅ | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ❌ | ⚠️ rough_cut Decline only |
| Set status: Archived | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |

> **Note:** All status transitions go through the `[MODULAR]` `status_role_permissions` matrix. The defaults above seed `status_role_permissions` on tenant creation.

### 2.5 Trial Reels

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View trial reels group | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ own workspace only |
| Add trial variant (converts video → trial group) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Promote winner trial → main | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ⚠️ own workspace, advisory vote only |
| Manually delete loser trial | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| View trial-loser data for analytics | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ |

### 2.6 Versions (per video)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View all versions of a video | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ excludes `internal_only=true` |
| Upload new version | ✅ | ✅ | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Set version as current | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Mark version as `internal_only` (hidden from client) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Mark version as `trial_loser` | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Delete version (any V#) | ✅ | ✅ | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Download original quality (R2) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ |
| Download original via guest link | n/a | n/a | n/a | n/a | n/a | n/a | n/a | guest: ⚠️ if `download_enabled=true` |

### 2.7 Comments & Annotations

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View comments on a video (active version) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ excludes `internal=true` |
| View comments across all versions ("Show all" toggle) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ⚠️ own workspace, excludes internal |
| Create comment (timestamped) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ on own workspace videos |
| Create internal-only comment | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ |
| Reply to comment (threaded) | same as Create | same | same | same | same | same | ❌ | same |
| Resolve comment | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ⚠️ own comments |
| Delete own comment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Delete others' comments | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create annotation (drawn shape on frame) | same as comment create | same | same | same | same | same | ❌ | same |
| Edit/delete own annotation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| @mention user in comment | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ on own workspace |
| Upload comment attachment (image/file) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ on own workspace |

### 2.8 Reviews (Client decision actions)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Approve at Rough Cut | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ |
| Request Revision at Rough Cut | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ |
| Decline at Rough Cut (cancellation) | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ |
| Approve at Final Review | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ |
| Request Revision at Final Review | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ |
| Decline at Final Review | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ❌ button hidden |
| Cancel video (any stage, with reason) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Use guest link to review | guest | guest | guest | guest | guest | guest | guest | guest |
| Use guest link to download (if enabled) | guest | guest | guest | guest | guest | guest | guest | guest |

### 2.9 CRM — People

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View all People | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |
| Create Person | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Edit Person | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |
| Delete Person | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Person profile (Attio-style full history) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |
| Add custom column | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Save custom view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Import CSV (Attio export format) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |

### 2.10 CRM — Companies

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View Companies | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |
| Create / Edit / Delete Company | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only (no delete) | ❌ |

### 2.11 CRM — Deals (Pipeline / Kanban)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View Deals Kanban | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |
| Create Deal | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Edit Deal | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ assigned only | ❌ |
| Move Deal stage (drag-drop) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ assigned only | ❌ |
| Move Deal to "Send Payment" → trigger automation | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ assigned only | ❌ |
| Confirm Auto Stripe payment flow | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ assigned only | ❌ |
| Confirm Manual payment (IBAN/cash) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ assigned only | ❌ |
| Move to Won (only after payment confirmed) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ assigned only | ❌ |
| Delete Deal | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reassign Deal to another closer | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.12 CRM — Leads

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View Leads | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |
| Receive Lead via webhook (auto-disqualify <$5k/mo) | system | system | system | system | system | system | system | system |
| Convert Lead → Person + Deal | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |
| Mark Lead qualified/disqualified | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |

### 2.13 CRM — Calls (Calendly + Fireflies)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View Calls list | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ own + region | ❌ |
| View Call detail (recording, transcript) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ own + region | ❌ |
| View AI-scored call template | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ own only | ❌ |
| Edit AI scoring prompt template | ✅ | ❌ `[MODULAR]` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cancel Calendly event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ own only | ❌ |

### 2.14 CRM — Follow-ups

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View own follow-ups | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Create / edit / complete follow-up | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ own | ❌ |
| Reassign follow-up | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.15 CRM — Partnerships & Editor Talent

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View Partnership applications | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve / reject Partnership | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Editor talent (CRM Editors) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Hire/onboard Editor | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.16 Forms (Typeform-style builder) `[NEW]`

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| List all forms | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create form | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit form fields & logic | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Publish form (public URL `/f/:slug`) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete form | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View form submissions | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ form-tagged-to-CRM submissions only | ❌ |
| Submit form (public, no auth) | public | public | public | public | public | public | public | public |
| Auto-create CRM person from submission | system | system | system | system | system | system | system | system |

### 2.17 Email Hub

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View Email Hub | ✅ | ✅ | ⚠️ assigned clients only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Compose 1:1 email to client | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Send bulk campaign | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit email template | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Build sequences | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View email send logs | ✅ | ✅ | ⚠️ own sends only | ❌ | ❌ | ❌ | ⚠️ own sends only | ❌ |
| Manage suppression list | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configure verified sending domain | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.18 Tasks (cascading by role)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View own tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (no client tasks) |
| View tasks of all roles below | ✅ | ✅ (manager → all below) | ⚠️ editors + content creators they manage | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create personal task | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Assign task to another user | ✅ | ✅ | ⚠️ team only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Mark task complete | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete own task | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Link task to video / project / deal / call | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 2.19 Workboard

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View cross-team Workboard | ✅ | ✅ | ⚠️ team's videos only | ⚠️ assigned only | ⚠️ own assignments only | ⚠️ assigned only | ❌ | ❌ |
| Move card across columns | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ |
| Customize column order | per-user (saved in `user_kanban_boards`) | same | same | same | same | same | n/a | n/a |

### 2.20 Media Library

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View media library (cross-tenant) | ✅ | ✅ | ⚠️ assigned workspaces | ⚠️ assigned workspaces | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ own workspace only |
| Upload file | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ on own workspace |
| Create folder | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ on own workspace |
| Rename / move file | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ own files |
| Delete file | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ own uploads only | ⚠️ own uploads only | ❌ | ✅ own files |
| Share via link (right-click → share) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ own workspace |
| Set link permissions (view / view+download) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ own |
| Revoke share link | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ own creates | ⚠️ own creates | ❌ | ✅ own |

### 2.21 Studio (Foundation, Strategy, Scripts, Hooks, Vault, Sessions)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Open Studio Picker | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ |
| Open Studio for client | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ⚠️ own (read-only by default) |
| Edit Foundation (bio, audience, pillars) | ✅ | ✅ | ⚠️ assigned only | ✅ assigned | ❌ | ❌ | ❌ | ⚠️ own |
| Create / edit content scripts | ✅ | ✅ | ⚠️ assigned only | ✅ assigned | ❌ | ❌ | ❌ | ❌ |
| Approve/decline script as client | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ on own |
| Manage script templates | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage hooks library | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage SOPs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Toggle "Studio Published" for client | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ |

### 2.22 Chat (Client ↔ Agency, Team)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Open client chat (any) | ✅ | ✅ | ✅ | ✅ | ⚠️ assigned only (or `@theclips.agency` email) | ⚠️ assigned only | ❌ | n/a |
| Open own client chat | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ |
| Send message | ✅ | ✅ | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ |
| Upload attachment / voice note | ✅ | ✅ | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ |
| @mention user | ✅ | ✅ | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ (mentions to assigned team) |
| React to message | ✅ | ✅ | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ |
| Mute room | ✅ | ✅ | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ |
| Open team chat (internal) | ✅ | ✅ | ✅ | ✅ | ⚠️ if `@theclips.agency` email | ⚠️ if member | ❌ | ❌ |
| Create team chat room | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create thread inside room | ✅ | ✅ | ✅ | ✅ | ⚠️ if member | ⚠️ if member | ❌ | ❌ |
| Delete own message | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Delete others' messages | ✅ | ✅ | ⚠️ on assigned | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.23 Notifications

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View own notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark as read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own preferences (in-app, email, push, slack per event) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subscribe to web push | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage tenant notification rules `[MODULAR]` | ✅ | ⚠️ if permitted | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Set throttle window (default 1/hr/video) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Opt out of mentions globally | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.24 Analytics

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Production analytics (throughput, on-time, revision rate) | ✅ | ✅ | ⚠️ team only | ⚠️ assigned only | ⚠️ own only | ❌ | ❌ | ❌ |
| Editor productivity (cross-team) | ✅ | ✅ | ⚠️ team only | ❌ | ❌ | ❌ | ❌ | ❌ |
| Sales analytics (deal velocity, win rate, leaderboard) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ region only | ❌ |
| Finance analytics (Stripe revenue, MRR, churn, LTV) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Agency Growth dashboards | ✅ | ⚠️ non-finance tabs | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reel Insights (Top/Bottom per platform) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ⚠️ own workspace |
| Per-video Meta/TikTok analytics | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ⚠️ assigned only | ❌ | ⚠️ own workspace |
| Connect Meta OAuth | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ assigned only | ❌ | ✅ own workspace |
| Disconnect Meta OAuth | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ assigned only | ❌ | ✅ own workspace |

### 2.25 Billing & Stripe

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View tenant Stripe revenue | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View MRR / churn / LTV dashboards | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View workspace billing (single client) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ✅ own |
| Issue refund | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update workspace subscription | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ own (upgrade/downgrade) |
| View Stripe events log | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Trigger Stripe sync (manual) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Connect tenant Stripe account (BYOK) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.26 Accounting

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View accounting ledger | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Add manual entry | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit / delete entry | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Export P&L CSV | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.27 Settings — Tenant (Modularity surfaces)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Manage Statuses (add/rename/delete + role permissions) | ✅ | ⚠️ if Owner permits `[MODULAR]` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Roles (rename, edit permissions) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Video Types | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Deal Stages | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Project Types (template builder) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Email Templates | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage AI System Prompts | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Notification Rules | ✅ | ⚠️ if permitted | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Tenant Branding (logo, colors, subdomain) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Default Settings (seed for new workspaces) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configure Auth (Google OAuth, magic links, HIBP) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Forms | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Cron / pg_cron schedules | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.28 Settings — Workspace

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Edit workspace profile (logo, brand colors) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ✅ own (workspace owner only) |
| Manage Company sub-members | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ⚠️ workspace owner only |
| Manage connected social accounts | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ assigned only | ❌ | ✅ own |
| Manage credentials assigned to workspace | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ assigned only | ❌ | ⚠️ assigned to me |
| View workspace journey progress | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ✅ own |
| Mark journey step complete (admin) | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ |
| Mark journey step complete (client side actions) | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✅ own |

### 2.29 Settings — User (own)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Edit own profile (name, avatar, bio) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enable 2FA `[future]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Set notification preferences | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage own AI context files / settings | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ if Jarvis enabled |
| Manage own Calendly link | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Logout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete own account | ✅ | ❌ self-cascade | ❌ self-cascade | ❌ | ❌ | ❌ | ❌ | ⚠️ via support flow |

### 2.30 Team Management / User Management

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View all users | ✅ | ✅ | ⚠️ team they manage | ❌ | ❌ | ❌ | ❌ | ❌ |
| Invite user (creates `client_invitations` row + email) | ✅ all roles | ✅ ≤ manager-creatable | ✅ ≤ senior-editor creatable | ❌ | ❌ | ❌ | ❌ | ❌ |
| Change another user's role | ✅ to any role below | ✅ to any role below manager | ✅ to any role below senior_editor | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reset another user's password (14-char temp) | ✅ all | ✅ ≤ below | ✅ ≤ below | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete user | ✅ all (except other owners w/o handoff) | ✅ ≤ below | ⚠️ ≤ below | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign editor to workspace/project/video | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign moderator to workspace | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign closer to region/territory | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View login history of another user | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.31 Universal Preview Mode

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Enter Preview as another role | ✅ any role | ✅ ≤ below | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Enter Preview as specific user | ✅ | ✅ ≤ below | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Writes during preview | ❌ blocked | ❌ blocked | n/a | n/a | n/a | n/a | n/a | n/a |
| Exit preview | ✅ | ✅ | n/a | n/a | n/a | n/a | n/a | n/a |

### 2.32 Magic Links / Public Share Links

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Generate per-video review link | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ⚠️ own workspace |
| Generate per-project review link | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ⚠️ own workspace |
| Generate workspace-public link | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ⚠️ own workspace |
| Toggle download on share link | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ⚠️ own |
| Set custom expiry (default 30 days) | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ⚠️ own |
| Revoke link | ✅ | ✅ | ⚠️ assigned only | ⚠️ assigned only | ❌ | ❌ | ❌ | ⚠️ own |
| Send magic-link email to existing user | ✅ | ✅ | ⚠️ team they manage | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.33 Talent Network (browse only — transactional flows DROPPED)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Browse Talent Network | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| View talent profile | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Approve talent application | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.34 Cleanup, Cron, Audit

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| View activity logs | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ❌ | ❌ | ❌ |
| View error logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View security dashboard / RLS linter | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Run security scan | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manually trigger cleanup cron | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View login history (any user) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit credential access log | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2.35 Cross-Platform Publishing (PLANNED — scaffolding only)

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Connect Instagram / TikTok / LinkedIn / YouTube / X | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ assigned only | ❌ | ✅ own workspace |
| Publish video to platform | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ✅ assigned (primary user) | ❌ | ❌ |
| Schedule publish | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ✅ assigned | ❌ | ❌ |
| View posting attempts log | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ assigned only | ❌ | ⚠️ own workspace |
| Re-queue failed post | ✅ | ✅ | ⚠️ assigned only | ❌ | ❌ | ⚠️ assigned only | ❌ | ❌ |

### 2.36 Jarvis AI / ClipsAI Chat

| Feature/Action | Owner | Manager | Senior_Editor | Content_Creator | Editor | Moderator | Closer | Client |
|---|---|---|---|---|---|---|---|---|
| Open Jarvis chat | ✅ | ✅ | ✅ | ⚠️ if enabled | ⚠️ if enabled | ❌ | ❌ | ⚠️ if tenant enables |
| Upload AI context file | ✅ | ✅ | ✅ | ⚠️ if enabled | ⚠️ if enabled | ❌ | ❌ | ⚠️ if enabled |
| Edit Jarvis system prompt | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Data Isolation Rules

For each entity, the canonical "WHO sees WHAT" statement. These are the rules that the RLS `USING` clauses MUST enforce.

### 3.1 Workspaces (`clients`)
- **Owner & Manager:** see all workspaces in the tenant.
- **Senior Editor, Content Creator, Editor, Moderator:** see only workspaces where they have a row in `client_team_assignments`, `video_editors`, or `moderator_assignments`.
- **Closer:** does NOT see workspaces. They see CRM People/Deals only. After payment, the workspace is created and visibility belongs to delivery roles, not the closer.
- **Client:** sees only their own workspace via `client_access`.
- **Cross-tenant:** never. RLS MUST filter by `tenant_id` in addition to all other rules.

### 3.2 Projects (`projects`)
- **Owner & Manager:** all projects in the tenant.
- **Senior Editor:** projects in their assigned workspaces, plus projects shared via `shared_projects` to those workspaces.
- **Content Creator, Editor, Moderator:** projects in their assigned workspaces (cascade down from workspace assignment).
- **Editor (project-level cascade):** also sees projects where they have any `video_editors` row at workspace, project, or video level.
- **Closer:** ❌ no project visibility.
- **Client:** their own workspace's projects + any project shared TO their workspace via `shared_projects`.

### 3.3 Cycles (`content_sessions` → renamed `project_cycles`)
- Inherits visibility from parent project (transitive).
- Backlog cycles visible to admins only by default; configurable per tenant.

### 3.4 Videos (`content_items`) and Versions (`content_versions`)
- **Internal team (Owner/Manager):** all videos in tenant.
- **Senior Editor/Content Creator:** videos in assigned workspaces.
- **Editor:** videos in assigned workspaces/projects/videos via `video_editors`. Plus all videos in the tenant via the **read-only Inspiration tab** (separate visibility flag).
- **Moderator:** videos in assigned workspaces.
- **Closer:** ❌ no video visibility.
- **Client:** videos in their own workspace AT or AFTER the tenant's "client-visible-from" status (default = `final_review`). Versions flagged `internal_only=true` are excluded.
- **Guest reviewer (no auth):** videos accessible only via valid `review_tokens.token` or `project_review_tokens.token`, not expired, not revoked. Internal-only versions excluded.
- **Trial losers:** kept in DB as `trial_loser=true`; visible to admins for analytics, hidden from client by default.

### 3.5 Comments & Annotations (`video_comments`, `video_annotations`)
- Visibility follows the parent video's visibility.
- Comments flagged `internal=true` are hidden from clients and guests.
- Version isolation by default (a comment on V1 doesn't appear on V2). The "Show all versions" toggle is a UI aggregation only and respects the `internal=true` flag.

### 3.6 Reviews / Decisions
- **Client decision actions** are stored on the video row (`client_decision`, `client_decision_at`, `client_decision_note`).
- Triggers `notify_team_on_client_decision` and `notify_slack_on_client_decision` fire to all delivery-team roles (Owner, Manager, Senior Editor, Content Creator).

### 3.7 CRM People (`crm_people`)
- **Owner, Manager:** all people in the tenant.
- **Closer:** people scoped to their region (`location` matches `sales_territories.region`) OR people they own (`assigned_to = auth.uid()`).
- **Senior Editor:** can see people only when needed for editor talent management — limited to `crm_editors` table.
- **Other roles:** ❌

### 3.8 CRM Deals (`crm_deals`)
- **Owner, Manager:** all deals.
- **Closer:** deals where `owner_id = auth.uid()` OR `region` matches assigned territory.
- **All others:** ❌

### 3.9 CRM Leads (`leads`)
- **Owner, Manager:** all leads.
- **Closer:** leads matching their region OR assigned to them. Auto-disqualified leads (<$5k/mo) still visible but tagged.
- **All others:** ❌

### 3.10 CRM Calls (`calendly_events`)
- **Owner, Manager:** all calls.
- **Closer:** their own calls + calls in their region.
- **All others:** ❌

### 3.11 Forms (`forms`, `form_submissions`)
- **Forms (definitions):** Owner & Manager only.
- **Submissions:** Owner & Manager see all. Closer sees submissions tagged to a CRM person in their region. Public form submission requires no auth.

### 3.12 Tasks (`project_tasks`)
- Cascading visibility: each role sees their own + all roles below them in `ROLE_MANAGEMENT_HIERARCHY`.
- Owner sees all. Client sees nothing (no client tasks).
- Tasks linked to a video/project inherit additional visibility from that link.

### 3.13 Notifications (`notifications`)
- Each user sees only their own (`user_id = auth.uid()`).
- Throttle: max 1 `status_change` notification per video per user per hour (enforced in trigger).
- Mention opt-out (`MENTION_OPT_OUT`) suppresses Slack DM and email but in-app indicator may still show.

### 3.14 Chat Messages (`chat_messages`)
- **Client chat rooms:** any internal team role + the workspace's client members (via `client_access`).
- **Editors:** assigned to the client OR have an `@theclips.agency` email (existing rule via `user_can_use_team_chat`).
- **Team chat rooms:** internal-only (`team_chat_members`).
- Threads inherit the room's visibility.

### 3.15 Media Library (`media_library_items`)
- Workspace-scoped. Internal team sees per their workspace assignment. Client sees own workspace files only.
- Public share links work regardless of auth, scoped by `link_token`.

### 3.16 Email Logs (`email_logs`, `email_queue`)
- Owner, Manager: all logs.
- Senior Editor & Closer: only emails they personally sent (`sender_id = auth.uid()`).
- All others: ❌

### 3.17 Activity / Audit Logs (`activity_logs`)
- Owner & Manager: all.
- Senior Editor: scoped to assigned workspaces.
- All others: ❌

### 3.18 Billing & Stripe Data
- **Tenant-level Stripe (revenue, MRR, events log):** Owner ONLY. RLS MUST be a single `has_role(auth.uid(), 'owner')` check.
- **Workspace-level subscription:** Owner, Manager, the workspace's client members.

### 3.19 Accounting (`finance_transactions`, `accounting_entries`)
- Owner ONLY. No exceptions.

### 3.20 Analytics tables (`client_organic_metrics`, `client_ads_metrics`, `agency_*_metrics`)
- **Client metrics:** the workspace itself + assigned internal team.
- **Agency-wide metrics:** Owner. Manager sees production metrics, NOT revenue metrics.

### 3.21 AI Prompts (`ai_prompts`)
- Owner ONLY can edit. Read access to all internal roles for the prompts that drive features they use.

### 3.22 Tenant Settings (`settings`, `default_settings`, modular config tables)
- Edit: Owner. Some surfaces editable by Manager if Owner permits.
- Read: all internal team (read-only to know what statuses/types/stages exist).

### 3.23 Closer Region Scoping
- Stored in `sales_territories` (`closer_id`, `region`).
- Every CRM RLS policy for closers MUST filter on this.
- Owner can override and grant cross-region access on a per-record basis.

### 3.24 Company Workspace Sub-Member Isolation
- Sub-members of the same Company workspace MUST NOT see each other's content streams unless the workspace owner explicitly cross-shares.
- The workspace owner sees the aggregate dashboard (all sub-members).
- RLS uses `client_members.is_workspace_owner` flag.

### 3.25 Magic Links / Public Share Links
- Per-video review token (`review_tokens`): single video, 30-day default expiry, optional `download_enabled`.
- Per-project review token (`project_review_tokens`): all videos in a project, 30-day expiry, optional download.
- Workspace public link (`client_invitations` with magic_link type): full workspace access, 30-day expiry.
- All token-based access uses `SECURITY DEFINER` functions to bypass RLS deadlocks (existing pattern: `has_valid_project_review_token_for_content`).
- Guest-created comments tagged with the guest's name/email captured at link entry; never visible to other guests, only to the workspace and internal team.

### 3.26 Cross-Tenant Isolation (CRITICAL)
- Every business table MUST have `tenant_id UUID NOT NULL`.
- Every RLS policy MUST include a `tenant_id = tenant_id_for_user(auth.uid())` clause.
- The `tenant_id_for_user()` security-definer function reads from `profiles.tenant_id`.
- A user from Tenant A reading a row from Tenant B is impossible by construction.

---

## 4. Auth Flow

### 4.1 Sign-up paths

| Path | Trigger | Result |
|------|---------|--------|
| **Auto (closer-driven)** | Closer drags Deal → "Send Payment" → confirms Auto → Stripe payment succeeds | Workspace created, `client` user created, magic-link onboarding email sent. No password set yet. |
| **Auto (closer-driven, manual payment)** | Closer drags Deal → "Send Payment" → selects Manual → enters payment confirmation | Same workspace creation + magic link. Used for IBAN / bank transfer / cash deals. |
| **Manual team invite** | Owner/Manager from `/owner/user-management` clicks Invite → picks role | Invite email with one-time link → user sets password → assigned the picked role. Roles offered are filtered by `ROLE_CREATION_HIERARCHY`. |
| **Manual client creation** | Owner/Manager from `/owner/clients` clicks Create | Workspace + client user created, welcome email with credentials sent. |
| **Self sign-up (Email+Password)** | User visits `/login` and signs up | DISABLED by default. Tenant owner can enable in Manage Auth. New users land on a "What kind of account?" page; admin must approve before any role is assigned. |
| **Google OAuth** | User clicks "Sign in with Google" | Same as self sign-up: lands on "What kind of account?" page. **MUST NOT auto-assign `client` role** — this was a v0 vulnerability. |
| **Magic link** | User enters email → "Send me a magic link" | One-time link emailed. On click, exchanges for session. Valid for 30 days. Single-use by default. |

### 4.2 Login

- **Email + password** — primary path for all roles.
- **Google OAuth** — available; tenant can disable per Manage Auth.
- **Magic Link** — passwordless; available to all roles.
- After login, the role-based redirect (`RoleBasedRedirect`) routes to:
  - `owner` → `/owner/dashboard`
  - `manager` → `/manager/dashboard`
  - `senior_editor` → `/senior-editor/dashboard`
  - `content_creator` → `/content-creator/dashboard`
  - `editor` → `/editor/dashboard`
  - `moderator` → `/moderator/dashboard`
  - `closer` → `/closer/dashboard`
  - `client` → `/client/dashboard`
- **Onboarding gating:** if `client.onboarding_completed = false`, the OnboardingDialog opens. User can skip ("I'll do it later") and continue, but Kickoff Call and Practice Session journey steps remain locked.
- **First-login password change:** if `profiles.requires_password_change = true`, the user is forced through `/reset-password` before reaching any app surface.

### 4.3 Invitations

- **Created by:** Owner, Manager, Senior Editor (subject to `ROLE_CREATION_HIERARCHY`).
- **Stored in:** `client_invitations` for clients, edge function `create-team-member` for internal users.
- **Email:** Lovable Native Email; template editable in Email Hub.
- **Validity:** 7 days for team invites, 30 days for client magic links.
- **Single-use:** team invites are single-use; client magic links default single-use, optionally multi-use.
- **Closer creation flow:** at invite time, the inviter MUST assign a region (`sales_territories` row).
- **Moderator creation flow:** at invite time, the inviter MUST assign at least one client (`moderator_assignments`).
- **Audit:** every invite logged to `activity_logs`.

### 4.4 Password reset

- User clicks "Forgot password?" → enters email.
- `send-password-reset` edge function generates a **14-character temporary password** (existing pattern).
- Sent via Lovable Native Email with login URL hardcoded to the tenant's subdomain.
- User logs in with temp password.
- `requires_password_change=true` forces redirect to `/reset-password`.
- User sets new permanent password → `requires_password_change=false`, `first_login=false`.
- Owner/Manager/Senior Editor can also trigger reset for any user they manage via `reset-user-password` edge function.

### 4.5 Session management

- Supabase Auth JWT, stored in `localStorage` (see `client.ts`).
- `autoRefreshToken: true`, `persistSession: true`.
- `onAuthStateChange` listener registered BEFORE `getSession()` (existing pattern in `src/lib/auth.tsx`).
- Idle timeout (`useIdleTimeout`) auto-logs-out after configurable period.
- Connection guard (`ConnectionContext`) blocks UI when offline to prevent data loss.
- `useBeforeUnloadWarning` warns on leaving with unsaved uploads.
- `active_sessions` and `login_history` tables track session activity.
- Universal Preview Mode does NOT create a new auth session; it filters reads via `preview_sessions` row.
- Logout invalidates the JWT and clears localStorage.

### 4.6 Tenant Provisioning (Auth bootstrap for white-label)

- New tenant created → first `owner` user provisioned via direct DB seed (or future tenant-signup flow).
- The new owner immediately receives a magic-link email.
- On first login, the owner sees a "Welcome — let's set up your tenant" wizard that prompts for: agency name, subdomain, brand colors, logo, default sender email, Stripe BYOK key (optional), at least one team member invite.
- After wizard completion, the tenant is "live".

---

## 5. Appendix — RLS Policy Cheat Sheet

For each major table, the recommended RLS policy template. All policies assume `tenant_id` filtering is applied via `tenant_id_for_user(auth.uid())`.

### 5.1 Pattern: Internal team sees all, client sees own, editor/moderator sees assigned

```sql
-- Example: content_items
CREATE POLICY "content_items_select" ON content_items FOR SELECT
USING (
  tenant_id = public.tenant_id_for_user(auth.uid())
  AND (
    public.has_role(auth.uid(), 'owner'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR (
      public.has_role(auth.uid(), 'senior_editor'::app_role)
      AND public.user_has_client_access_via_team(auth.uid(), client_id)
    )
    OR (
      public.has_role(auth.uid(), 'content_creator'::app_role)
      AND public.user_has_client_access_via_team(auth.uid(), client_id)
    )
    OR (
      public.has_role(auth.uid(), 'editor'::app_role)
      AND public.editor_has_assignment(auth.uid(), id, project_id, client_id)
    )
    OR (
      public.has_role(auth.uid(), 'moderator'::app_role)
      AND public.moderator_has_client(auth.uid(), client_id)
    )
    OR (
      public.has_role(auth.uid(), 'client'::app_role)
      AND public.user_has_client_access(auth.uid(), client_id)
      AND status_id >= public.tenant_client_visible_status(tenant_id)
    )
    OR public.has_valid_review_token_for_content(id)
  )
);
```

### 5.2 Pattern: Owner-only

```sql
-- Example: accounting_entries
CREATE POLICY "owner_only_select" ON accounting_entries FOR SELECT
USING (
  tenant_id = public.tenant_id_for_user(auth.uid())
  AND public.has_role(auth.uid(), 'owner'::app_role)
);
-- Same for INSERT/UPDATE/DELETE.
```

### 5.3 Pattern: Closer region-scoped

```sql
-- Example: crm_deals
CREATE POLICY "deals_select_closer" ON crm_deals FOR SELECT
USING (
  tenant_id = public.tenant_id_for_user(auth.uid())
  AND (
    public.has_role(auth.uid(), 'owner'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR (
      public.has_role(auth.uid(), 'closer'::app_role)
      AND (
        owner_id = auth.uid()
        OR region = ANY (public.closer_regions(auth.uid()))
      )
    )
  )
);
```

### 5.4 Pattern: Insert-only generation (bypass RLS deadlock)

For tables where a role needs INSERT but not SELECT (e.g., review tokens generated by clients), use a `SECURITY DEFINER` function:

```sql
CREATE FUNCTION public.generate_review_token(p_content_id uuid, p_expires_at timestamptz, p_download_enabled boolean)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  -- Verify caller can access the content
  IF NOT public.user_can_access_content(auth.uid(), p_content_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO public.review_tokens (content_id, token, expires_at, download_enabled, created_by)
  VALUES (p_content_id, v_token, p_expires_at, p_download_enabled, auth.uid());

  RETURN v_token;
END;
$$;
```

### 5.5 Pattern: Tenant isolation helper

```sql
CREATE FUNCTION public.tenant_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;
```

### 5.6 Pattern: Modular status transition check

```sql
CREATE FUNCTION public.can_transition_status(_user_id uuid, _video_id uuid, _to_status_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.status_role_permissions srp
    JOIN public.user_roles ur ON ur.user_id = _user_id
    WHERE srp.status_id = _to_status_id
      AND srp.role = ur.role
      AND srp.can_transition_to = true
  );
$$;
```

### 5.7 Helper functions to (re)build during rebuild

| Function | Purpose |
|----------|---------|
| `tenant_id_for_user(uuid)` | Returns the tenant_id of any user. Used in every RLS policy. |
| `has_role(uuid, app_role)` | Existing — keep. |
| `user_has_client_access(uuid, uuid)` | Existing — keep. |
| `user_has_client_access_via_team(uuid, uuid)` | NEW — checks `client_team_assignments` for senior_editor/content_creator. |
| `editor_has_assignment(uuid, uuid, uuid, uuid)` | NEW — single function consolidating workspace/project/video assignment cascade. |
| `moderator_has_client(uuid, uuid)` | NEW — for moderator role. |
| `closer_regions(uuid)` | NEW — returns array of regions assigned to closer. |
| `tenant_client_visible_status(uuid)` | NEW — returns the status threshold from tenant settings. |
| `has_valid_review_token_for_content(uuid)` | Existing pattern — keep. |
| `can_transition_status(uuid, uuid, uuid)` | NEW — replaces hard-coded enum check `enforce_editor_status_restrictions`. |
| `is_workspace_owner(uuid, uuid)` | NEW — for Company workspace sub-member rules. |
| `user_in_company_workspace(uuid, uuid)` | NEW — for Company workspace visibility cascade. |

---

## 6. Open Questions for the Implementer

1. **Manage Roles UI editability:** When a tenant owner edits a role's permissions, should it write to a `tenant_role_permissions` override table, or fork the entire role definition? *Recommendation:* Override table per tenant; fall back to defaults.
2. **Multi-region closers:** Can one closer cover multiple regions? *Default assumption:* yes, `sales_territories` is one row per (closer, region).
3. **Tenant-level audit logs:** Should client actions be visible in the tenant's `activity_logs`? *Default:* yes, but tagged `actor_role=client` for filtering.
4. **Owner-of-owners:** Is there a "super-owner" who manages multiple tenants? *Default:* no — tenant owners are the top of their tenant only. Cross-tenant admin is out of scope for v1.0.
5. **Client deletion flow:** Does a client have a self-serve "delete my account" path? *Recommendation:* No — must go through support to prevent accidental loss.

---

*End of Permissions Matrix. Companion to PRD v1.0.*
