# ClipsOS V2 — System Patterns

## Codebase Location

- **Local path:** `/Users/madibbaroudi/Desktop/Dashboards/New Clips App`
- **Repo:** `M-ADIB/clipsos-hub`
- **Supabase:** Lovable Cloud (no agent MCP access)

> ⚠️ Old Supabase `toyekrhhzqmltstrycdv` is deprecated. Backend is now Lovable Cloud.

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

## Frontend Patterns

### Tech Stack
- **React 19** + **Vite** + **TypeScript** (strict)
- **Tailwind CSS 4** (`@theme inline`) + `tailwindcss-animate`
- **shadcn/ui** (Radix UI primitives) — components in `src/components/ui/`
- **TanStack Router v1** (file-based routing)
- **TanStack Query** for server state
- **Framer Motion** + **GSAP** for animations
- **date-fns** for date formatting
- **Recharts** for charts
- **Sonner** for toast notifications

### Navigation Architecture

**TopNav Bar:**
- Universal header bar — title + optional tabs
- Pages configure the header via `WorkspaceContext` → `setHeaderConfig()`
- Right side: Ask Clips ✨ + theme toggle + notifications

**How pages configure the header:**
```tsx
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";

export default function MyPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Page Title",
      tabs: [{ key: "tab1", label: "Tab 1" }],
      activeTab: "tab1",
    });
    return () => clearHeaderConfig();
  }, []);
}
```

**Sidebar:**
- `src/components/app-shell/AppSidebar.tsx` — main sidebar component
- Role-aware nav sections from `nav-config.ts`
- Collapse/expand support
- User profile at bottom

### Auth System
- **Location:** `src/contexts/AuthContext.tsx` — `AuthProvider` + `useAuth()` hook
- **Role field:** from `user_roles` table
- **Roles:** `owner`, `admin`, `editor_admin`, `content_admin`, `editor`, `sales`, `client`
- **Role-based routing:** `/{role}/` pattern
- **Sign-in flow:** email+password → fetch role → redirect to role dashboard

### Key File Paths
| File | Purpose |
|------|---------|
| `src/routes/__root.tsx` | TanStack Router root layout |
| `src/contexts/AuthContext.tsx` | Auth provider + useAuth hook |
| `src/contexts/WorkspaceContext.tsx` | Header config context |
| `src/components/app-shell/AppShell.tsx` | Layout wrapper |
| `src/components/app-shell/TopNav.tsx` | Universal top nav bar |
| `src/components/app-shell/AppSidebar.tsx` | Main sidebar |
| `src/components/app-shell/nav-config.ts` | Nav sections per role |
| `src/components/dashboard/` | Dashboard widget components |
| `src/components/ui/` | shadcn/ui primitives |
| `src/styles.css` | OKLCH tokens + Tailwind 4 @theme |

### State Management
- **Supabase client** via `@/integrations/supabase/client`
- **TanStack Query** for all server state (queries + mutations)
- **React Context** for auth (`AuthProvider`), workspace, branding
- **`AuthContext`** manages `realRole` + `activeRole` (DevTools override)
- **`WorkspaceContext`** manages header bar configuration

### Styling Approach
- **Tailwind CSS 4** with `@theme inline` for design tokens
- **OKLCH color system** — all tokens in `src/styles.css`
- **shadcn/ui** components (Button, Dialog, Sheet, Tabs, etc.)
- **Dark mode** via `.dark` class (`:root` = light, `.dark` = dark)
- **CSS custom properties** — zero hardcoded hex in components
- **class-variance-authority (CVA)** for component variants
- **tailwind-merge** for class deduplication

### Backend Integrations (Edge Functions)
- Edge Functions managed by Lovable Cloud
- Located in `supabase/functions/`
- Used for privileged actions requiring `SERVICE_ROLE_KEY`
- Handle webhooks (Stripe) and outbound integrations (Resend emails)

### Routing Convention
```
/{role}/                    → role dashboard
/{role}/clients             → client list
/{role}/clients/:id         → client workspace (tabs via context)
/{role}/projects/:id        → project detail
/{role}/videos/:id          → video review player
```
