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
- **Supabase:** Project `toyekrhhzqmltstrycdv` (ClipsApp) — **agents have full MCP/SQL access**
- **Frontend stack:** React 19 + Vite + Tailwind CSS 4 + shadcn/ui + TanStack Router

## 3. Agent Scope

### ✅ What Agents CAN Do
- Write frontend code (React components, hooks, pages)
- Create/modify Tailwind + shadcn/ui styled components
- Write TanStack Query hooks for Supabase client calls
- Push code to GitHub via MCP
- Review and optimize existing frontend code
- Execute SQL against the database via Supabase MCP
- Deploy Edge Functions via Supabase MCP
- Run database migrations via Supabase MCP
- Create/modify RLS policies via Supabase MCP
- Manage storage buckets via Supabase MCP

## 4. Architecture Rules (Non-Negotiable)

### Database (agents execute via Supabase MCP)
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
- **⛔ Header Ownership Rule:** Only the TOP-LEVEL route component may call `setHeaderConfig()`. Child/embedded components must NEVER call it. If a component is used both standalone AND embedded inside a tab parent, use `{ embedded?: boolean }` prop to conditionally skip header calls. See `systemPatterns.md` for the full pattern.
- **No duplicate page headers** — No inline `<h1>` with icons inside page components. The `TopNav` bar is the ONLY source of truth for page titles.

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

## 8. ⛔ Mandatory Feature Verification Protocol (Non-Negotiable)

> **"Code compiles" ≠ "Feature works."**
> Every feature you implement MUST be browser-tested before you tell the user it's done.
> Failing to verify is the same as shipping broken code.

### The Build → Verify → Log Loop

After implementing ANY feature (or sub-feature), you MUST:

1. **Decompose** — Before you build, list every sub-feature and its acceptance criteria.
   A "Chat feature" is not one feature. It's: message sending, message receiving, 
   typing indicators, voice notes, file uploads, emoji reactions, etc.

2. **Build** — Implement the feature.

3. **Verify IN THE BROWSER** — Open the running app and test every sub-feature:
   - Navigate to the page
   - Click every button, fill every form, trigger every interaction
   - Check the browser console for errors
   - Test empty states, loading states, and error states
   - Test with realistic data (not just "test" strings)

4. **Log results** — Record what you verified in a verification table:
   ```
   | Sub-feature | Tested? | Result | Notes |
   |-------------|---------|--------|-------|
   | Send message | ✅ | PASS | Message appears in thread |
   | Voice note record | ✅ | FAIL | MediaRecorder not initialized |
   | File upload | ✅ | PASS | Uploads to Supabase storage |
   ```

5. **Fix failures** — If anything fails, fix it and re-verify. Do NOT move on.

6. **Report honestly** — In your summary, clearly separate what WORKS from what DOESN'T.
   Never say "Chat feature is complete" if voice notes don't work.

### Industry-Standard Acceptance Criteria

When implementing common features, apply these minimum standards automatically.
Don't wait for the user to spell out that "voice notes should actually record audio."

| Feature | Minimum Standards |
|---------|-------------------|
| **Forms** | All fields validate, submit saves to DB, error messages show, loading states work, success feedback shows |
| **File upload** | File picker opens, upload shows progress, file saves to storage, preview works after upload, error on oversized/wrong-type files |
| **Voice notes** | Microphone permission requested, recording starts/stops, playback works, waveform/duration displays, saves to storage |
| **Video player** | Play/pause works, seek works, volume works, loading state shows, error state for missing/broken files |
| **Chat/messaging** | Send/receive works, messages persist on refresh, timestamps show, empty state for no messages, scroll to bottom on new message |
| **Drag and drop** | Visual feedback on drag, drop zone highlights, reorder persists, works on touch devices |
| **Search/filter** | Debounced input, results update, empty state for no results, clear filter works |
| **Modals/dialogs** | Opens, closes (X button + backdrop click + Escape key), form inside submits, doesn't break scroll |
| **Tabs/navigation** | All tabs render content, active state shows, switching preserves scroll, URL updates if applicable |
| **Notifications/toasts** | Appear, auto-dismiss, are readable, action buttons work if present |
| **Tables** | Sorting works, pagination works, empty state shows, loading skeleton shows |
| **Calendar/date picker** | Dates select, range works if applicable, navigation between months works |
| **Dark mode** | All elements visible, no hardcoded colors, contrast is readable |
| **Responsive** | No overflow/cut-off on mobile, touch targets are 44px+, scrollable where needed |

### What "Verified" Means

- ❌ "I wrote the code and it compiles" — NOT verified
- ❌ "I checked the component renders" — NOT verified  
- ❌ "The hook returns data" — NOT verified
- ✅ "I opened the browser, clicked the record button, spoke into the mic, stopped recording, played it back, and heard my voice" — VERIFIED

### When to Skip Verification

Almost never. The ONLY exceptions:
- Pure refactoring that doesn't change behavior (rename, move files)
- Documentation-only changes
- Database migrations with no frontend impact (verify via SQL query instead)
