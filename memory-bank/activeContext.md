# ClipsOS V2 — Active Context

> Last updated: 2026-04-26

## Current Phase: Phase 1 — Core Domain

### What's Deployed (Phase 0 ✅)

| Migration | Tables/Objects Created |
|-----------|----------------------|
| `create_tenants_table` | `tenants` |
| `create_app_role_enum_and_user_roles` | `app_role` enum, `user_roles` |
| `create_profiles_table` | `profiles` |
| `create_rls_helper_functions` | `has_role`, `has_any_role`, `get_user_role`, `is_owner_or_manager`, `can_manage_role`, `role_hierarchy_level`, `tenant_id_for_user` |
| `create_handle_new_user_trigger` | `handle_new_user()` trigger function |
| `create_universal_updated_at_trigger` | `set_updated_at()` trigger function |
| `create_foundation_rls_policies` | RLS on tenants, profiles, user_roles |
| `create_modular_lookup_tables` | `statuses`, `status_role_permissions`, `deal_stages`, `video_types` |
| `create_seed_tenant_defaults_function` | `seed_tenant_defaults()` |
| `fix_function_search_path_security` | SET search_path on all functions |

### What's Next (Phase 1)

1. **`clients` table** — Workspaces (individual/company)
2. **`client_members` table** — Company workspace sub-members
3. **`client_team_assignments` table** — Team member ↔ workspace assignments
4. **`projects` table** — Work containers inside workspaces
5. **`project_type_templates` table** — Modular project type definitions
6. **`cycles` table** — Delivery periods inside projects (renamed from `interviews`)
7. **`videos` table** — Core deliverables (renamed from `content_items`)
8. **`video_versions` table** — Version history (renamed from `content_versions`)
9. **`video_editors` table** — Editor ↔ video assignment cascade
10. **`trial_reels` table** — A/B hook variant groups

### Decisions Made
- Legacy `content_items` → renamed to `videos` in V2
- Legacy `interviews` → renamed to `cycles` in V2
- Legacy `content_versions` → renamed to `video_versions` in V2
- `client_type` column → `workspace_type` enum (`individual` | `company`)
- All video metadata (cloudflare IDs, dimensions, upload state) stays on `videos` table
- Trial reels link to both video and version

### Blockers
- None

### Open Questions
- Guest review link table structure (defer to Phase 2)
- Social account connection model (defer to Phase 4)
