# ClipsOS V2 — System Patterns

## Database Conventions

### Table Structure
Every business table follows this template:
```sql
CREATE TABLE public.table_name (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id),
  -- domain columns --
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.table_name
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### RLS Policy Pattern
All RLS policies use security-definer helper functions, never raw JWT parsing:

```sql
-- Standard tenant-isolated SELECT for team members
CREATE POLICY "Team members can view {table}" ON public.{table}
  FOR SELECT USING (
    tenant_id = public.tenant_id_for_user(auth.uid())
    AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::app_role[])
  );

-- Owner/Manager write access
CREATE POLICY "Managers can manage {table}" ON public.{table}
  FOR ALL USING (
    tenant_id = public.tenant_id_for_user(auth.uid())
    AND public.is_owner_or_manager(auth.uid())
  ) WITH CHECK (
    tenant_id = public.tenant_id_for_user(auth.uid())
    AND public.is_owner_or_manager(auth.uid())
  );
```

### Security-Definer Functions (Already Deployed)
| Function | Purpose |
|----------|---------|
| `tenant_id_for_user(uuid)` | Returns the tenant_id for a given user |
| `has_role(uuid, app_role)` | Checks if user has a specific role |
| `has_any_role(uuid, app_role[])` | Checks if user has any of the listed roles |
| `get_user_role(uuid)` | Returns the user's role |
| `is_owner_or_manager(uuid)` | Shorthand for owner/manager check |
| `role_hierarchy_level(app_role)` | Returns numeric level (1–5) |
| `can_manage_role(uuid, app_role)` | Checks if user can assign/remove a role |
| `seed_tenant_defaults(uuid)` | Seeds default statuses, deal stages, video types for a new tenant |

### Index Conventions
- Every FK column gets a btree index: `idx_{table}_{column}`
- Composite lookups: `idx_{table}_{col1}_{col2}`
- Enum/status columns: filtered partial indexes where applicable
- GIN indexes for array and JSONB columns

### Naming Conventions
- Tables: `snake_case`, plural (`videos`, `projects`, `deal_stages`)
- Columns: `snake_case`
- Indexes: `idx_{table}_{column(s)}`
- Policies: Human-readable English (`"Team members can view videos"`)
- Triggers: `set_{column}` or descriptive (`log_video_status_change`)
- Functions: `snake_case`, verb-first (`get_user_role`, `seed_tenant_defaults`)

## Frontend Patterns (Established)

### Navigation Architecture (CRITICAL — read before building any page)

**Universal Header Bar (TopNav):**
- ONE bar, always visible, never hides or swaps
- Structure: `[Title + optional Tabs] .............. [Ask Clips | ☀️ | 🔔]`
- Left side: driven by `WorkspaceContext` — pages call `setHeaderConfig()` to set title + tabs
- Right side: always the same three actions (Ask Clips, theme toggle, notifications)
- No role badges in the header

**How pages configure the header:**
```tsx
// Any page can configure the universal header via context:
const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

useEffect(() => {
  setHeaderConfig({
    title: "Ajmal Perfumes",
    tabs: TABS.map((t) => ({ key: t, label: t })),
    activeTab: "Overview",
  });
  return () => clearHeaderConfig();
}, []);
```

**Default behavior (no context set):**
- Title auto-generated from URL path segments

**Sidebar:**
- Collapse/expand toggle is INSIDE the sidebar (next to `//ClipsApp` logo)
- Role-aware sections from `nav-config.ts`
- User profile card at bottom

**No duplicate headings rule:**
- The header bar shows the current page name → pages do NOT render their own `<h1>` title
- Section headings within page content (e.g. "Recent Activity", "Payment History") are fine

### Design System
- **CSS tokens:** OKLCH-based, defined in `src/styles.css` via `@theme inline` (Tailwind 4.0)
- **Zero hardcoded hex:** All components use CSS variables (`--background`, `--primary`, etc.)
- **Dark mode only** for V1 — no light mode toggle
- **Fonts:** Arial for body text, Neue Haas Grotesk Display Pro for headings only

### Component Architecture (19 primitives in `src/components/dashboard/`)
| Component | Category | Usage |
|-----------|----------|-------|
| `StatCard` | Metric | Standard metric display with big number, badge, and unified percent progress bar |
| `SparklineBar` | Viz | Gradient opacity bar chart |
| `PipelineStepCard` | Metric | Wrapper around StatCard for pipeline stages |
| `TaskCard` | Action | Standard component for actionable items and follow-up queues |
| `ProjectCard` | Entity | Avatar stack + progress bar |
| `NotificationRow` | Feed | Icon box + title + actions |
| `ActivityRow` | Feed | Icon + text + amount |
| `DashboardPanel` | Layout | Scrollable panel with mesh blur |
| `FilterPills` | Control | Active/inactive pill toggles |
| `SectionLabel` | Nav | Eyebrow header + chevron |
| `JourneyEventCard` | Timeline | Date block + event details |
| `GrowthChart` | Viz | Bar chart with glow effects |
| `NoteCard` | Content | Obsidian-style note card |
| `ProgressRow` | Viz | Labeled progress bar |
| `DataTable` | Data | Sortable/filterable table |
| `StatusBadge` | Status | Dot + colored label (5 variants) |

### App Shell Architecture
```
AppShell
├── WorkspaceProvider (context for header config)
├── SidebarProvider (shadcn collapse/expand)
├── AppSidebar (nav + user card + SidebarTrigger)
└── Main container
    ├── TopNav (universal header, reads WorkspaceContext)
    └── <main> (page content via TanStack Router outlet)
```

### Key Files
| File | Purpose |
|------|---------|
| `src/components/app-shell/AppShell.tsx` | Layout wrapper, never conditional |
| `src/components/app-shell/TopNav.tsx` | Universal header bar |
| `src/components/app-shell/AppSidebar.tsx` | Sidebar with role-aware nav |
| `src/components/app-shell/nav-config.ts` | Nav sections per role |
| `src/contexts/WorkspaceContext.tsx` | Header config context |
| `src/contexts/AuthContext.tsx` | Auth + role management |

### State Management
- Supabase client via React context
- TanStack Query for server state
- Zustand for UI-only state (sidebar collapsed, active filters)
- `AuthContext` manages `realRole` + `activeRole` (DevTools override)
- `WorkspaceContext` manages header bar configuration

### Backend Integrations (Edge Functions)
- **Edge Functions** run in Deno environment (`supabase/functions/`)
- Used for privileged actions requiring `SERVICE_ROLE_KEY` (e.g., `invite-user` using `auth.admin.inviteUserByEmail`)
- Handle webhooks (e.g., Stripe) and outbound integrations (e.g., Resend emails)
- Called from frontend via typed TanStack Query mutations (`useMutation`) to ensure loading/error states are tracked in UI

### DevTools
- `DevTools.tsx` panel for role-switching (all 9 roles)
- Integrated into `__root.tsx`
- Only visible in development mode

### Routing Convention
```
/{role}/                    → role dashboard
/{role}/clients             → client list
/{role}/clients/:id         → client workspace (tabs via context)
/{role}/projects/:id        → project detail
/{role}/videos/:id          → video review player
```

## Migration Versioning
Migrations use Supabase's `apply_migration` tool with descriptive names:
```
YYYYMMDDHHMMSS_descriptive_name
```
Example: `20260426113321_create_tenants_table`

## Build Phases
1. **Phase 0** ✅ — Foundation (tenants, profiles, user_roles, RLS helpers, modular lookups)
2. **Phase 1** ✅ — Core Domain (clients/workspaces, projects, cycles, videos, versions, assignments)
3. **Phase 2** ✅ — Communication (chat, comments, annotations, notifications)
4. **Phase 3** ✅ — CRM (people, companies, deals, calls, follow-ups)
5. **Phase 4** ✅ — Utility (saved views, custom columns, activity log)
6. **Phase 5** ✅ — Finance (Stripe integration, expenses, transactions)
7. **Phase 6** ✅ — Studio/AI/Email/Tasks
8. **Frontend** 🔄 — Nav architecture done, dashboard pages in progress
