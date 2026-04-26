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

## Frontend Patterns (To Be Established)

### Component Architecture
- `<DataTable>` — generic, sortable, filterable table primitive
- `<EntityCard>` — generic card with slots for any entity
- `<PageShell>` — layout wrapper with breadcrumbs, actions, filters
- `<StatusBadge>` — renders from `statuses` lookup table (color, label)

### State Management
- Supabase client via React context
- TanStack Query for server state
- Zustand for UI-only state (sidebar collapsed, active filters)

### Routing Convention
```
/{role}/                    → role dashboard
/{role}/workspaces          → workspace list
/{role}/workspaces/:id      → workspace detail
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
2. **Phase 1** 🔄 — Core Domain (clients/workspaces, projects, cycles, videos, versions, assignments)
3. **Phase 2** — Communication (chat, comments, annotations, notifications)
4. **Phase 3** — CRM (people, companies, deals, calls, follow-ups)
5. **Phase 4** — Studio & Content (scripts, hooks, content vault, templates)
6. **Phase 5** — Finance (Stripe integration, expenses, payroll, P&L)
7. **Phase 6** — Analytics, Integrations, Polish
