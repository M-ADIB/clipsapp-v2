# AGENTS.md — Master Directive for ClipsOS V2

> **Every AI agent working on this project MUST read this file before writing any code.**

## 1. Read the Memory Bank First

Before doing anything, read these files in order:
1. `memory-bank/projectbrief.md` — What this project is
2. `memory-bank/systemPatterns.md` — How we build things
3. `memory-bank/activeContext.md` — What we're working on now
4. `memory-bank/progress.md` — What's done and what's left

## 2. Codebase Location

- **Repo:** `M-ADIB/clipsos-hub`
- **Local path:** `/Users/madibbaroudi/Desktop/Dashboards/New Clips App`
- **Supabase:** Lovable Cloud — **NO agent MCP/SQL access**
- **Frontend stack:** React 19 + Vite + Tailwind CSS 4 + shadcn/ui + TanStack Router

> ⚠️ **DEPRECATED:** Old Supabase project `toyekrhhzqmltstrycdv` is no longer in use. Backend is now Lovable Cloud.

## 3. Agent Scope

### ✅ What Agents CAN Do
- Write frontend code (React components, hooks, pages)
- Create/modify Tailwind + shadcn/ui styled components
- Write TanStack Query hooks for Supabase client calls
- Push code to GitHub via MCP
- Review and optimize existing frontend code

### ❌ What Agents CANNOT Do
- Execute SQL against the database (no MCP access to Lovable Supabase)
- Deploy Edge Functions (user handles via Lovable)
- Run database migrations (user handles via Lovable)
- Modify RLS policies directly

If you need a database change, **describe the SQL needed** and the user will execute it manually in Lovable.

## 4. Architecture Rules (Non-Negotiable)

### Database (for reference — user executes)
- **Every table MUST have `tenant_id`** referencing `tenants.id` (except `tenants` itself and `profiles`)
- **RLS MUST be enabled** on every public table
- **Use security-definer helpers** — never parse JWTs directly: `has_role()`, `is_owner_or_manager()`, `tenant_id_for_user()`
- **`set_updated_at` trigger** on every table with an `updated_at` column
- **No hard-coded enums for business logic** — use lookup tables (`statuses`, `deal_stages`, `video_types`)
- **Indexes on all FK columns** — pattern: `idx_{table}_{column}`

### Frontend
- **Tailwind CSS 4** (`@theme inline`) + **shadcn/ui** — no vanilla CSS, no custom design system
- **TanStack Router** (file-based routing)
- **TanStack Query** for all server state
- **`useAuth()`** from `@/contexts/AuthContext.tsx` for auth context
- **`WorkspaceContext`** → `setHeaderConfig()` for page header configuration
- **Component consolidation** — use shadcn primitives (Button, Dialog, Sheet, Tabs, etc.)
- **No inline SQL** — all queries go through Supabase client hooks
- **Role-aware routing** — `/{role}/path` pattern

### Security
- **Finance data is Owner-only** — no exceptions
- **Managers see everything except finance** — enforce at RLS level
- **Editors only see assigned workspaces** — via `client_team_assignments` or `video_editors`
- **Clients only see their own workspace** — via `client_access` or `profiles.tenant_id`

## 5. Naming Map (MEMORIZE)

| Old Name | V2 Name | Context |
|----------|---------|---------|
| `admin` | `manager` | Role |
| `editor_admin` | `senior_editor` | Role |
| `content_admin` | `content_creator` | Role |
| `sales` | `closer` | Role |
| `content_items` | `videos` | Table |
| `content_versions` | `video_versions` | Table |
| `interviews` | `cycles` | Table |
| `content_status` | `statuses` (lookup) | Enum → Table |
| `content_type` | `video_types` (lookup) | Enum → Table |

## 6. Code Quality Standards

- **No copy-paste from legacy** — legacy is reference only
- **TypeScript strict mode** — no `any` types
- **Descriptive RLS policy names** — `"Team members can view videos"` not `"policy_1"`
- **Comment complex SQL** — especially in triggers and functions
- **Test RLS** — every new table should have policies verified before moving on

## 7. When in Doubt

1. Check the PRD: `New Clips App/ClipsApp-PRD.md`
2. Check the Permissions Matrix: `New Clips App/PERMISSIONS-MATRIX.md`
3. Check the legacy schema for reference: `New Clips App/DATABASE-SCHEMA.md`
4. Ask the user — don't guess on business logic
