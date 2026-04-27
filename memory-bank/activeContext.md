# ClipsOS V2 — Active Context

> Last updated: 2026-04-27

## Platform: Lovable Cloud

### Deployment
- **Repo:** `clipsos-frontend` (local) / Lovable Cloud
- **Supabase:** Backend managed via Lovable — AI agents do NOT have MCP/SQL access
- **Key rule:** All database work (migrations, RLS, edge functions) is handled by the user through Lovable's interface. Agents focus on frontend code only.

### Agent Scope
- ✅ Frontend code (React, Tailwind 4, components)
- ✅ Hook/query code (TanStack Query, Supabase JS client calls)
- ✅ UI/UX design and implementation
- ✅ TypeScript types and interfaces
- ❌ Direct SQL execution — user handles via Lovable
- ❌ Edge Function deployment — user handles via Lovable
- ❌ Database migrations — user handles via Lovable

## Current Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 4 (`@theme inline`) + shadcn/ui (Radix) |
| Routing | TanStack Router v1 (file-based) |
| State | TanStack Query + React Context |
| Auth | `@/contexts/AuthContext.tsx` → `useAuth()` |
| Nav | `WorkspaceContext` → `setHeaderConfig()` |
| Charts | Recharts |
| Toasts | Sonner |
| Build | Lovable dev Vite config |

## Frontend Architecture

### Navigation
- **TopNav:** Universal header bar — title + optional tabs via `WorkspaceContext`
- **Sidebar:** `AppSidebar.tsx` — role-aware nav from `nav-config.ts`
- **No duplicate page headings** — TopNav shows the page name

### Dashboard Pages Built
| Page | Route | Status |
|------|-------|--------|
| Client Home | `/client` | ✅ 3 stat cards, recent videos, queue preview, what's next |
| Client My Videos | `/client/videos` | ✅ Table/Reels/Grid views, search, cycle filter |
| Client Posting Queue | `/client/queue` | ✅ Calendar + List views, month nav, status dots |
| Owner (all tabs) | `/owner/*` | ✅ Sales, Production, Finance overviews |
| Editor Workspace | `/editor` | ✅ |
| Closer Dashboard | `/closer` | ✅ |
| Content Creator | `/content-creator` | ✅ |

### Component Library (`src/components/dashboard/`)
| Component | Behavior |
|-----------|----------|
| `StatCard` | Progress bar is **opt-in** — only renders when `percent` is explicitly > 0 and < 100 |
| `PipelineStepCard` | Wrapper around StatCard — suppresses bar for "Total" cards |
| `TaskCard` | Unified accent left border (`--primary-glow`). Light mode: transparent bg + subtle border. Dark mode: surface-card bg |
| `StatusBadge` | 5 variants: in_review, approved, posted, pending, draft |
| `DataTable` | Generic sortable/selectable table with overflow fade |
| `DashboardPanel` | Scrollable panel with mesh blur effect |

## What to Build Next
1. Connect client pages to live Supabase data hooks
2. Manager role dashboard
3. Mobile responsiveness improvements
4. Email Hub module

## Key Architecture Decisions
- `tenant_id` on every business table (RLS enforced at DB level)
- Auth fetches highest-priority role on sign-in
- Dark mode via `.dark` class (`:root` = light, `.dark` = dark)
- All colors use CSS custom properties — zero hardcoded hex in components
- Font: Arial for body text, Neue Haas Grotesk Display Pro for headings
