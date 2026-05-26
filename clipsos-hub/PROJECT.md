# Project: Schedule Dashboard Live Upgrades

## Architecture
- **Data Flow**:
  - `calendly_events` stores synced Calendly bookings. Each event is linked to a sales representative profile via `sales_user_id` (pointing to `auth.users.id` / `profiles.id`).
  - `closer_regions` stores settings and `calendly_api_key` for each Closer, Owner, Manager, or Content Creator.
  - The calendar dashboard (`ScheduleDashboard.tsx`) queries events using `useCalendlyEvents()` and lists team members using `useTeam()`.
  - To show connected status, the dashboard queries all `closer_regions` records.
- **Interfaces**:
  - `ScheduleDashboardProps` will be modified or extended to support rendering other team members' events by selecting them.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | DB Setup & RLS Policies | Add SELECT permissions on `calendly_events` and SELECT/ALL on `closer_regions` for `owner`, `manager`, and `content_creator`. | none | DONE |
| 2 | Live Mode & Representative Mapping | Switch SalesHub to live mode; resolve representative name from profile (using `sales_user_id` in `calendly_events`) instead of `invitee_name`. | M1 | DONE |
| 3 | Team Sidebar & Status Indicators | List team members with search, avatar, role, and connected status dot in a left sidebar. | M2 | DONE |
| 4 | Security Boundaries & Placeholders | Restrict settings/sync access to logged-in user; show warning placeholder for unconnected profiles. | M3 | DONE |
| 5 | Responsive Layout & Visual Polish | Sticky left sidebar on desktop, collapsible drawer/toggle on mobile, and premium dark mode styling. | M4 | DONE |
| 6 | Verification & Forensic Audit | Run E2E test suites, browser testing, and Forensic Auditor verification. | M5 | DONE |

## Interface Contracts
### `ScheduleDashboard` ↔ `useTeam` & `useCalendlyEvents`
- **Profiles resolution**: Join `sales_user_id` from `calendly_events` with the team list from `useTeam()` to display the representative's actual name.
- **Filtering**: When a user selects a team member, filter `activeEvents` by matching `sales_user_id === selectedTeamMember.id`.

## Code Layout
- Component: `src/components/dashboards/owner/ScheduleDashboard.tsx`
- Parent Hub: `src/components/dashboards/owner/SalesHub.tsx`
- Dialog: `src/components/dashboards/closer/CalendlySettingsDialog.tsx`
- Hooks: `src/hooks/use-leads.ts`, `src/hooks/use-closer-region.ts`, `src/hooks/use-team.ts`
- Migrations: `supabase/migrations/`

## Milestone Logs

### Milestone 1: DB Setup & RLS Policies (2026-05-26)
- Created migration: `supabase/migrations/20260526000000_schedule_dashboard_permissions.sql`.
- Applied new RLS policies to `public.calendly_events` and `public.closer_regions`:
  - `calendly_events` SELECT policy `"Users can view calendly events"` allows `owner`, `manager`, `content_creator`, and `closer` within their tenant.
  - `closer_regions` SELECT policy `"Team leads can view all closer regions"` allows `owner` and `manager` to view all regions.
  - `closer_regions` SELECT policy `"Closers and creators can view own region"` allows `closer` and `content_creator` to view their own region.
  - `closer_regions` INSERT/UPDATE policies allow users to insert/update their own region row.

### Milestones 2-5: Frontend Upgrades (2026-05-26)
- Switched SalesHub schedule dashboard to `mode="live"`.
- Resolved representative names dynamically using profile information mapped from `useTeam()` profiles.
- Integrated a team sidebar for desktop and sliding Sheet drawer for mobile to navigate representatives.
- Implemented Calendly connection status indicators (dots) for all team members.
- Restricted Settings / Sync capability to only allow modifying/initiating syncs for the logged-in user's own calendar.
- Created warning/onboarding screens for unconnected calendars, tailored depending on whether the calendar belongs to the logged-in user or another team member.

### Milestone 6: Verification & Forensic Audit (2026-05-26)
- Repaired migration history registry via Supabase CLI to mark `20260526000000` as applied.
- Ran verification checks confirming active RLS policies in the remote database.
- Executed `npm run build` to verify frontend compilation success.
- Received CLEAN forensic audit verdict from `teamwork_preview_auditor`.
