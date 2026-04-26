# ClipsOS V2 — Project Brief

> **Single source of truth.** Any AI agent working on this project MUST read this file before writing any code.

## What Is This?

ClipsOS is a **white-label, multi-tenant operating system for short-form content agencies**. It replaces the typical agency stack of Notion + Drive + Frame.io + Slack + Trello + HubSpot + Gmail + Airtable + Zapier with a unified platform where every artifact (video, deal, comment, call, invoice) is linked through a single data model.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite (via Lovable) |
| Backend | Supabase (PostgreSQL 17, Edge Functions, Auth, Storage) |
| Video Playback | Cloudflare Stream (HLS) |
| Video Storage | Cloudflare R2 (original quality) |
| Payments | Stripe |
| Email | Lovable Native Email |
| Hosting | Lovable (auto-deploy) |

## Supabase Project

- **Project ID:** `toyekrhhzqmltstrycdv`
- **Region:** `ap-southeast-1`
- **Database:** PostgreSQL 17

## GitHub Repository

- **Repo:** `M-ADIB/clipsapp-v2`
- **Default Branch:** `main`

## Core Architecture Principles

### 1. Multi-Tenancy — Every Row Has a `tenant_id`
Every business table MUST have a `tenant_id` column referencing `tenants.id`. RLS policies MUST enforce tenant isolation — no user from Tenant A can ever read/write a row belonging to Tenant B.

### 2. Role-Based Access Control (9 Roles)
```
owner (5) → manager (4) → senior_editor (3) / content_creator (3) → editor (2) / moderator (2) / closer (2) → client (1)
```
Roles are stored in `user_roles` with an `app_role` enum. Security-definer helper functions (`has_role`, `get_user_role`, `is_owner_or_manager`, `can_manage_role`, `role_hierarchy_level`) power all RLS policies.

### 3. Modular Configuration — Nothing Hard-Coded
Statuses, deal stages, video types, project types, email templates, AI prompts — all stored in per-tenant lookup tables. A tenant admin MUST be able to reshape the entire platform without code changes.

### 4. Data-Driven Permissions
The `status_role_permissions` table controls who can view/set/transition each pipeline status. No permission logic in the frontend.

## Domain Model (Core Entities)

```
Tenant (Agency)
  └── Workspace (Client)
        ├── Project
        │     └── Cycle (was "interview/session")
        │           └── Video (was "content_item")
        │                 ├── Version (V1, V2, V3…)
        │                 ├── Trial Reel (A/B hook variants)
        │                 ├── Comment (timestamped)
        │                 └── Annotation (drawn on frame)
        ├── Chat Room
        ├── Files
        └── Onboarding Journey
  └── CRM
        ├── People
        ├── Companies
        ├── Deals → Stages (modular pipeline)
        ├── Calls
        └── Follow-Ups
  └── Studio
        ├── Scripts / Hooks
        └── Content Vault
  └── Finance (Owner-only)
        ├── Revenue (Stripe)
        ├── Expenses
        └── Payroll
```

## Workspace Types

| Type | Description |
|------|-------------|
| `individual` | Single client login |
| `company` | Primary login + N sub-members; each sees only their own content stream |

## Naming Conventions

| Legacy Name | V2 Name |
|------------|---------|
| `admin` | `manager` |
| `editor_admin` | `senior_editor` |
| `content_admin` | `content_creator` |
| `sales` | `closer` |
| `interview` / `session` | `cycle` |
| `content_item` | `video` |

## Key Rules for All Agents

1. **No copy-paste from legacy.** Legacy code is a logic reference only.
2. **tenant_id on everything.** Every INSERT must include tenant_id.
3. **RLS on every table.** No table without RLS enabled.
4. **Security-definer functions.** Use `has_role()`, `is_owner_or_manager()`, `tenant_id_for_user()` — never raw JWT claims.
5. **Modular > hard-coded.** If it could vary per agency, make it a lookup table row.
6. **Updated_at triggers.** Every table with `updated_at` MUST have the `set_updated_at` trigger.
