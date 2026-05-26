<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

# AGENTS.md — Master Directive for ClipsOS V2

> **Every AI agent working on this project MUST read this file before writing any code.**

## 0. Skills System (Superpowers)

This project uses the **Superpowers** methodology. Before starting any task:

1. **Check `skills/` folder** for applicable skills
2. **Invoke the skill** before writing code — even if there's only a 1% chance it applies
3. **Follow the workflow:** Brainstorm → Plan → Execute → Review → Ship

### Available Skills

| Skill                            | When to Use                                               |
| -------------------------------- | --------------------------------------------------------- |
| `brainstorming`                  | Before building anything new                              |
| `writing-plans`                  | After brainstorm is approved — create implementation plan |
| `executing-plans`                | Working through plan tasks in batches                     |
| `subagent-driven-development`    | Dispatching subagents per task with 2-stage review        |
| `test-driven-development`        | During implementation — RED-GREEN-REFACTOR                |
| `systematic-debugging`           | When fixing bugs — 4-phase root cause                     |
| `requesting-code-review`         | Between tasks — review against plan                       |
| `receiving-code-review`          | Responding to review feedback                             |
| `using-git-worktrees`            | Creating isolated branches                                |
| `finishing-a-development-branch` | When tasks are complete — merge/PR decision               |
| `verification-before-completion` | Ensure it's actually fixed                                |
| `dispatching-parallel-agents`    | Concurrent subagent workflows                             |

### Multi-Agent Sync

This file is the **single source of truth**. After editing, run:

```bash
bash scripts/sync-agent-rules.sh
```

This regenerates configs for: GitHub Copilot, Cline, Continue, Amazon Q, and others.

**Pointer files** (don't edit directly):

- `CLAUDE.md` → imports this file (Claude Code)
- `GEMINI.md` → imports this file (Gemini CLI)
- `.cursor/rules/project.mdc` → Cursor
- `.windsurfrules` → Windsurf
- `.aider.conf.yml` → Aider

## 1. Read the Memory Bank First

Before doing anything, read these files in order:

1. `memory-bank/projectbrief.md` — What this project is
2. `memory-bank/systemPatterns.md` — How we build things
3. `memory-bank/activeContext.md` — What we're working on now
4. `memory-bank/progress.md` — What's done and what's left

## 2. Architecture Rules (Non-Negotiable)

### Database

- **Every table MUST have `tenant_id`** referencing `tenants.id` (except `tenants` itself and `profiles`)
- **RLS MUST be enabled** on every public table
- **Use security-definer helpers** — never parse JWTs directly: `has_role()`, `is_owner_or_manager()`, `tenant_id_for_user()`
- **`set_updated_at` trigger** on every table with an `updated_at` column
- **No hard-coded enums for business logic** — use lookup tables (`statuses`, `deal_stages`, `video_types`)
- **Indexes on all FK columns** — pattern: `idx_{table}_{column}`

### Frontend

- **Component consolidation** — use `<DataTable>`, `<EntityCard>`, `<PageShell>`, `<StatusBadge>` primitives
- **No inline SQL** — all queries go through typed Supabase client hooks
- **Role-aware routing** — `/{role}/path` pattern
- **Tenant context** — always pass tenant_id from auth context, never assume

### Security

- **Finance data is Owner-only** — no exceptions
- **Managers see everything except finance** — enforce at RLS level
- **Editors only see assigned workspaces** — via `client_team_assignments` or `video_editors`
- **Clients only see their own workspace** — via `client_access` or `profiles.tenant_id`

## 3. Naming Map (MEMORIZE)

| Old Name           | V2 Name                | Context      |
| ------------------ | ---------------------- | ------------ |
| `admin`            | `manager`              | Role         |
| `editor_admin`     | `senior_editor`        | Role         |
| `content_admin`    | `content_creator`      | Role         |
| `sales`            | `closer`               | Role         |
| `content_items`    | `videos`               | Table        |
| `content_versions` | `video_versions`       | Table        |
| `interviews`       | `cycles`               | Table        |
| `content_status`   | `statuses` (lookup)    | Enum → Table |
| `content_type`     | `video_types` (lookup) | Enum → Table |

## 4. Code Quality Standards

- **No copy-paste from legacy** — legacy is reference only
- **TypeScript strict mode** — no `any` types
- **Descriptive RLS policy names** — `"Team members can view videos"` not `"policy_1"`
- **Comment complex SQL** — especially in triggers and functions
- **Test RLS** — every new table should have policies verified before moving on

## 5. Supabase Connection

- **Project ID:** `toyekrhhzqmltstrycdv`
- **Region:** `ap-southeast-1`
- **Database:** PostgreSQL 17

## 6. When in Doubt

1. Check the PRD: `docs/ClipsApp-PRD.md`
2. Check the Permissions Matrix: `docs/PERMISSIONS-MATRIX.md`
3. Check the legacy schema for reference: `docs/DATABASE-SCHEMA.md`
4. Ask the user — don't guess on business logic
