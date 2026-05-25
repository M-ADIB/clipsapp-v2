# ClipsOS V2 — System Patterns

## Codebase Location

- **Local path:** `/Users/madibbaroudi/Desktop/Dashboards/New Clips App/clipsos-hub`
- **Repo:** `M-ADIB/clipsos-hub`
- **Supabase:** Project `toyekrhhzqmltstrycdv` — agents have full MCP/SQL access

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
| `submit_public_form(...)` | Public form submission RPC (no auth required) |

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
- **Recharts** (^2.15.4) for interactive dashboard charts (BarChart with tooltips, animated entry, hover cursors)
- **Sonner** for toast notifications
- **TipTap** for rich text editing (Content Studio)
  - Extensions: StarterKit, TextAlign, Color, Highlight, TextStyle, FontFamily, Underline, Link, Placeholder

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

### ⛔ CRITICAL: Header Ownership Rules (Non-Negotiable)

> **Only the TOP-LEVEL page component for a route may call `setHeaderConfig()`.** 
> Child/embedded components must NEVER call `setHeaderConfig()` or `clearHeaderConfig()`.

**The Bug Pattern (DO NOT DO THIS):**
```
SalesHub (parent)        → setHeaderConfig({ title: "Sales", tabs: [...] })
  └── LeadsPage (child)  → setHeaderConfig({ title: "Leads", tabs: [] })  ← WRONG!
```
When the child calls `setHeaderConfig()`, it **overwrites** the parent's tabs config. 
When the child unmounts, its `clearHeaderConfig()` **wipes the entire header**, 
causing the tab navigation to disappear.

**The Fix Pattern — `embedded` Prop:**
When a component is used BOTH standalone (as a route) AND embedded inside a tab parent:
```tsx
// Component supports both modes
export function LeadsPage({ embedded }: { embedded?: boolean } = {}) {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    if (embedded) return;                    // ← Skip when embedded
    setHeaderConfig({ title: "Leads", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, embedded]);
}

// In the parent hub:
<LeadsPage embedded />     // ← Child mode, no header calls
// In the standalone route:
<LeadsPage />              // ← Route mode, owns the header
```

**Checklist before writing any component that uses `setHeaderConfig()`:**
1. Is this component the TOP-LEVEL route component? → ✅ OK to use `setHeaderConfig()`
2. Is this component rendered INSIDE another component that already owns the header? → ❌ Do NOT call `setHeaderConfig()`
3. Is this component used in BOTH contexts? → Use the `embedded` prop pattern above

**Known parent-child relationships (parents own header, children must NOT):**
| Parent (owns header) | Children (must NOT call setHeaderConfig) |
|----------------------|------------------------------------------|
| `SalesHub.tsx` | `LeadsPage`, `PipelineDashboard`, `ScheduleDashboard`, `OwnerPlaceholderPage` |
| `OwnerSettingsPage.tsx` | `AppBrandingPage`, `UserManagementPage` |
| `HQDashboard.tsx` | All HQ sub-tab content components |
| `StudioDashboard.tsx` | All studio sub-tab content components |

### No Duplicate Page Headers

**Every page must rely on `TopNav` (via `setHeaderConfig()`) for its title.**
- ❌ No inline `<h1>` headers with icons inside page components
- ❌ No ToolbarButton sub-components that render page titles
- ✅ Use only the `TopNav` bar for page-level titles
- ✅ Sub-section headings within a page body are fine

**Sidebar:**
- `src/components/app-shell/AppSidebar.tsx` — main sidebar component
- Role-aware nav sections from `nav-config.ts`
- Collapse/expand support
- User profile at bottom

### Auth System
- **Location:** `src/contexts/AuthContext.tsx` — `AuthProvider` + `useAuth()` hook
- **Role field:** from `user_roles` table
- **Roles:** `owner`, `manager`, `senior_editor`, `content_creator`, `editor`, `closer`, `client`
- **Role-based routing:** `/{role}/` pattern
- **Sign-in flow:** email+password → fetch role → redirect to role dashboard

### Role-Aware Navigation Pattern (Shared Components)

When a component is used by **both owner and manager routes**, navigation links must use dynamic paths instead of hardcoded `/owner/`:

```tsx
import { useAuth } from "@/contexts/AuthContext";

export function SharedDashboard() {
  const { role } = useAuth();
  const basePath = role === "manager" ? "/manager" : "/owner";
  const navigate = useNavigate();

  // ✅ Role-aware navigation
  navigate({ to: `${basePath}/clients/$clientId` as "/owner/clients/$clientId", params: { clientId } });

  // ❌ Hardcoded — breaks for managers
  navigate({ to: "/owner/clients/$clientId", params: { clientId } });
}
```

**Components using this pattern:**
| Component | Paths made dynamic |
|-----------|--------------------|
| `HQDashboard.tsx` | `/clients/$clientId`, `/videos` |
| `ProjectsDashboard.tsx` | `/projects/new`, `/clients/$clientId` |
| `CreateProjectPage.tsx` | `/projects` (back, save, create) |

**Components that DON'T need it** (owner-only):
- `OwnerDashboard.tsx`, `OwnerCrmPage.tsx`, `AgencyCommandTab.tsx`
- `TemplatesListPage.tsx`, `TemplateBuilderPage.tsx`

**Rule:** If a component lives in `components/dashboards/owner/` but is imported by a manager route, it MUST use `useAuth()` for navigation.

### Content Studio Architecture

The Content Studio uses a **two-state dashboard** pattern:

```
StudioDashboard.tsx
├── State A: StudioClientsTable (table of all clients with metrics)
└── State B: Client Detail (client switcher dropdown + TopNav tabs + content)
    ├── ClientSwitcher — compact dropdown (search, status dots, quick-switch, "All Clients")
    ├── ContentTab (sidebar + main area)
    │   ├── ContentSidebar (Foundation/Pillars/Audience + Cycles)
    │   ├── FoundationView — 17 onboarding Qs + Dump Context (no heading)
    │   ├── PillarsView — full-page RichTextEditor (no heading)
    │   ├── AudienceView — avatar cards + demographics + tags (no heading)
    │   └── CycleScriptsList — freeform editor + "Save as Script"
    ├── BrainTab — Client Brain knowledge base
    └── ResourcesTab — 3-section library (planned):
        ├── Templates — full video templates
        ├── Hooks Library — saved hooks from content
        └── Content Vault — competitor research (Apify scraping)
```

**RichTextEditor pattern:**
```tsx
<RichTextEditor
  content={jsonOrHtml}           // TipTap JSON or HTML string
  placeholder="Write freely…"
  onSave={(json) => mutate(json)} // Called on blur
  minHeight="calc(100vh - 440px)" // Inline style, not dynamic Tailwind class
/>
```

**Key implementation details:**
- Word count uses `onUpdate` callback (NOT `useMemo` on doc content — ProseMirror Fragment references don't change)
- Content stored as TipTap JSON in `body_json` JSONB columns
- Editor toolbar is sticky (`position: sticky; top: 0`) — Google Docs single-row style
- **Minimal bubble menu** — 3 icons only (Format, Comment, Emoji) — NOT inline formatting buttons
- **Custom right-click context menu** — Cut/Copy/Paste/Delete/Emoji/Link/Format submenu/Clear formatting/Save to Resources
- "Save to Resources" context menu item appears when text is selected → saves to hooks library
- Auto-save fires on editor blur
- All view headings removed (Foundation, Pillars, Audience) — minimal top bar with count + action button only

### Video Review Pattern
The video review system uses a **shared component architecture** across two review modes:

```
src/components/video/
├── preview/                    # Video playback review
│   ├── VideoPreviewModal.tsx   # Full-screen video player shell
│   ├── annotations/            # Shared drawing engine
│   │   ├── AnnotationCanvas.tsx    # SVG-based stroke rendering
│   │   ├── AnnotationToolbar.tsx   # Tool/color picker bar
│   │   └── types.ts                # AnnotationStroke, AnnotationTool
│   ├── comments/               # Comment thread UI
│   │   ├── CommentItem.tsx         # Reusable comment card
│   │   └── CommentComposer.tsx     # Input + controls
│   └── hooks/
│       ├── use-video-comments.ts   # Fetch + mutate comments
│       └── use-video-annotations.ts # Fetch + save annotations
├── thumbnail/                  # Static image review
│   ├── ThumbnailPreviewDialog.tsx  # Dialog shell (header, viewer, sidebar, footer)
│   ├── ThumbnailViewer.tsx         # Image + annotation canvas
│   ├── ThumbnailCommentsSidebar.tsx # Comment list + composer
│   ├── ThumbnailVersionSelector.tsx # Version dropdown
│   ├── index.ts                    # Barrel export
│   └── hooks/
│       ├── use-thumbnail-versions.ts # Fetch thumbnail_versions table
│       └── use-thumbnail-comments.ts # Fetch video_comments (comment_type='thumbnail')
```

**Key patterns:**
- `video_comments` table with `comment_type` discriminator (`'video'` vs `'thumbnail'`)
- `video_annotations` table shared — thumbnail annotations use `frame_timestamp = 0`
- `thumbnail_versions` table for version tracking; fallback to `videos.video_thumbnail_url`
- `CommentItem` component reused in both video and thumbnail sidebars
- `AnnotationCanvas` + `AnnotationToolbar` reused with configurable aspect ratio
- Realtime subscriptions on all review tables via Supabase channels

### Universal @Mention System Architecture

The @mention system uses a **universal component set** integrated across 5 surfaces:

```
src/components/mentions/
├── MentionTextarea.tsx    # Universal textarea with @typeahead (ARIA combobox)
├── MentionPicker.tsx      # Floating suggestion list (avatar + name + role badge)
├── MentionRenderer.tsx    # Inline highlight pills for display (amber/gold theme)
└── index.ts               # Barrel exports

src/hooks/
└── use-mention.ts         # useMentionUsers() — wraps useTeam() into MentionUser shape
```

**Integration pattern (any surface):**
```tsx
import { MentionTextarea, MentionRenderer } from "@/components/mentions";
import { useMentionUsers } from "@/hooks/use-mention";

// Input: capture mentions
const mentionUsers = useMentionUsers();
const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
<MentionTextarea
  value={text} onChange={setText}
  onMentionsChange={setMentionedUserIds}
  users={mentionUsers}
/>

// Display: render mentions as highlighted pills
<MentionRenderer text={comment.body} />
```

**DB trigger pattern:**
- `video_comments` table → `trg_notify_mentioned_users` (AFTER INSERT)
- `chat_messages` table → `trg_notify_chat_mentioned_users` (AFTER INSERT)
- Both triggers: skip self-mentions, generate role-agnostic links, include rich `metadata` JSONB
- Notification type: `'mention'` enum value in `notification_type`

**CSS tokens:** `--mention` and `--mention-foreground` defined in `styles.css` for both light/dark themes

**Key rules:**
- `canMention` should match `canComment` — if a user can comment, they can mention
- Reply comments support mentions via `onReply(parentId, body, mentionedUserIds?)`
- `containsMentions()` helper uses inline regex (no `/g` flag) to avoid statefulness bugs

### Forms Architecture (Database ready, UI built)
```
forms (title, slug, form_type, settings JSON, is_published)
  └── form_fields (field_type, label, validation, options, sort_order, width, crm_field_name)
  └── form_submissions (data JSON, submitter_email/name/ip, status, source)
```
- `submit_public_form()` RPC — security-definer function for unauthenticated submissions
- Query keys: `forms.all`, `forms.list`, `forms.detail`, `forms.fields`, `forms.submissions`, `forms.publicBySlug`

### Finance Module Architecture
```
FinancePage.tsx (← route: /owner/finance)
├── Tab 1: FinanceOverviewTab — KPI cards + Payment History table
│     ├── RecordPaymentDialog — manual payment recording
│     └── SendPaymentLinkDialog — Stripe payment link sender
├── Tab 2: RevenueBreakdownTab — Gross/Net/Fees/P&L + Monthly chart
├── Tab 3: SubscriptionsTab — Stripe subscription management
└── Tab 4: CostsTab — Operating costs CRUD
```

**Currency standard:**
- All monetary values display in AED (primary) with optional USD conversion hints
- `finance-helpers.ts`: `fmtCents()`, `fmtAmount()`, `usdHint()`, `usdHintCents()`
- `USD_TO_AED = 3.6725` (fixed rate constant)
- Stripe data stored in AED cents; operating costs stored as AED plain values

**Key hooks:**
- `use-operating-costs.ts` — CRUD for `operating_costs` table
- `use-stripe-actions.ts` — payment links, subscriptions, record payment

**Key patterns:**
- `FinancePage.tsx` owns the header (tabs via `setHeaderConfig()`)
- ⛔ **Tab components MUST use `<TabPanel>` NOT conditional rendering** (see Tab Performance Pattern below)
- KPI cards in Overview use premium gradient-top design (not StatCard)
- CSV export includes both AED and USD columns

### Senior Editor Production Board Architecture
```
ProductionBoard.tsx (← route: /senior-editor — calls setHeaderConfig)
├── Toolbar
│   ├── Search input (full-text across title, client, project, editor)
│   ├── Filters popover (multi-select: Client, Editor, Video Type)
│   ├── Columns popover (toggle visibility per status, 9/11 default)
│   ├── Views popover (save/load/delete named views)
│   └── Total/Visible counts
├── Summary Bar (horizontal scroll, per-column color dots + counts)
├── Kanban Board (horizontal scroll)
│   └── Column × N (one per visible status, ordered by sort_order)
│       ├── Column Header (color dot, status name, video count)
│       └── VideoCard × M (paginated, 20 per page)
│           ├── Status badge + days in status (color-coded urgency)
│           ├── Video title
│           ├── Client logo + name · Project name
│           ├── Editor avatars/initials (from video_editors join)
│           ├── Video type badge + post date
│           └── Click → VideoPreviewModal
└── VideoPreviewModal (existing component, reused)
```

**Helper file: `board-helpers.ts`**
- Shared types: `BoardVideo`, `BoardEditorMap`, `BoardFilters`, `SavedBoardView`
- Display helpers: `getDaysInStatus()`, `getDaysColor()`, `getInitials()`
- Persistence: `loadVisibleIds()`, `saveVisibleIds()`, `loadSavedViews()`, `persistSavedViews()`
- Filtering: `filterVideos()` — composable multi-criteria filter pipeline

**Data flow:**
- `useStatuses()` → column definitions (ordered by `sort_order`)
- `useVideos()` → all tenant videos (grouped by `status_id` into columns)
- `useVideoEditorMap()` → custom hook querying `video_editors` join table
- `useTeam()` → resolves editor IDs to names for display and search
- `useClients()`, `useVideoTypes()` → filter dropdown options

**Key conventions:**
- Column visibility persisted in `localStorage` (`se-board-columns`)
- Saved views persisted in `localStorage` (`se-board-views`)
- Default hidden statuses: `cancelled`, `archived` (via `DEFAULT_HIDDEN_SLUGS`)
- Per-column pagination: 20 cards/page, "Load more" button shows remaining count

### Dashboard Charts Architecture (Recharts)

All dashboard visualizations use **Recharts** `BarChart` with consistent patterns:

**SparklineBar (Revenue Cards):**
```tsx
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

<ResponsiveContainer width="100%" height={80}>
  <BarChart data={data}>
    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
    <Tooltip formatter={(v: number) => [`AED ${v.toFixed(2)}`, "Revenue"]} />
    <Bar dataKey="amount" fill="currentColor" radius={[3, 3, 0, 0]}
         animationDuration={800} animationEasing="ease-out" />
  </BarChart>
</ResponsiveContainer>
```

**Production Velocity (BarChart with current-month highlighting):**
```tsx
const currentMonth = new Date().getMonth();
<Bar dataKey="count" animationDuration={800}>
  {data.map((_, i) => (
    <Cell key={i} fill={i === currentMonth ? "#10b981" : "rgba(255,255,255,0.15)"} />
  ))}
</Bar>
```

**Key conventions:**
- All charts use `ResponsiveContainer` for fluid width
- Tooltips use `contentStyle` with dark theme: `{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }`
- Animation duration: `800ms`, easing: `ease-out`
- Radius on bars: `[3, 3, 0, 0]` (rounded top)
- No CartesianGrid — clean, minimal look

**Editor Performance Module:**
- Located in `AgencyCommandTab.tsx` (bottom section)
- Filters `useCommandCenter().teamPulse` to `editor` and `senior_editor` roles only
- Sorts by `completedThisMonth` (descending)
- Uses 🥇🥈🥉 emoji medals for top 3 + gold ring/border on #1
- Primary metric: `completedThisMonth` (large green number)
- Secondary metric: `assignedVideos` count
- Month badge shows current month name (e.g. "May")

### Tab Performance Pattern (MANDATORY)

**Problem:** `{activeTab === "X" && <Component />}` destroys and re-creates the entire component tree on every tab switch, causing 2-3 second delays as hooks re-fire and DOM rebuilds.

**Solution:** Use `<TabPanel>` from `@/components/ui/tab-panel.tsx`:
```tsx
import { TabPanel } from "@/components/ui/tab-panel";

// ✅ CORRECT — keeps tabs mounted, instant switching
<TabPanel active={activeTab === "Overview"}>
  <OverviewTab />
</TabPanel>
<TabPanel active={activeTab === "Details"} lazy>
  <DetailsTab />
</TabPanel>

// ❌ WRONG — destroys/recreates on every switch
{activeTab === "Overview" && <OverviewTab />}
{activeTab === "Details" && <DetailsTab />}
```

**Rules:**
- Default tab: `<TabPanel active={...}>` (no `lazy` — renders immediately)
- Other tabs: `<TabPanel active={...} lazy>` (defers mount until first visit, then stays alive)
- `staleTime` is 5 minutes (`300_000ms`) — data survives between tab visits
- Applied to: OwnerDashboard, FinancePage, ClientWorkspace, SalesHub, Settings, EmailHub, ProjectsDashboard

### FullBleed Layout Pattern (MANDATORY for Route-Level Pages)

Every authenticated route-level page MUST be wrapped in `<FullBleed>` for standardized responsive layout:

```tsx
import { FullBleed } from "@/components/app-shell/FullBleed";

export function MyPage() {
  return (
    <FullBleed>
      <div className="px-3 py-5 md:px-5 md:py-6">
        {/* page content */}
      </div>
    </FullBleed>
  );
}
```

**Rules:**
- ✅ Route-level pages (anything directly rendered by a route file) → wrap in `<FullBleed>`
- ✅ Standard internal padding: `px-3 py-5 md:px-5 md:py-6`
- ❌ Dialogs, Sheets → do NOT wrap (inherit from parent)
- ❌ Embedded tab content → do NOT wrap (parent already provides FullBleed)
- ❌ Shared widgets used inside another FullBleed → do NOT wrap
- ❌ Public pages outside AppShell (e.g., PublicFormPage) → do NOT wrap
- **Coverage:** 60+ components verified, 100% UI parity across all 9 roles

### CRM Profile Architecture

Person profiles use an **Attio-inspired layout**: tabs/content on the LEFT, detail sidebar on the RIGHT.

```
PersonProfilePage.tsx (← route: /owner/people/$personId)
├── LEFT PANEL (tabs + content)
│   ├── Tab: Overview     → highlights cards + recent activity
│   ├── Tab: Activity     → all-touchpoint timeline
│   ├── Tab: Deals        → linked deals + pipeline stages
│   ├── Tab: Calls        → Calendly events for this person
│   ├── Tab: Emails       → email_queue items for this person
│   ├── Tab: Company      → linked crm_company detail
│   ├── Tab: Notes        → editable rich-text notes
│   ├── Tab: Tasks        → person-scoped tasks
│   └── Tab: Files        → linked documents
└── RIGHT PANEL (always visible)
    └── ProfileSidebar.tsx → avatar, company, deal stage, status, tags
```

**Key files:** `src/components/crm/profile/` directory

### Mobile Navigation Architecture

```
AppShell.tsx
├── Desktop: AppSidebar.tsx (left sidebar, collapsible)
├── Mobile: MobileBottomNav.tsx (bottom bar, 4-5 items)
│   ├── mobile-nav-config.ts (role-aware item selection)
│   └── MobileMoreDrawer.tsx (overflow items drawer)
└── MobileSubTabs.tsx (section-specific horizontal tabs)
```

**Key files:** `src/components/app-shell/Mobile*.tsx` + `mobile-nav-config.ts`

### Key File Paths
| File | Purpose |
|------|---------|
| `src/routes/__root.tsx` | TanStack Router root layout |
| `src/contexts/AuthContext.tsx` | Auth provider + useAuth hook |
| `src/contexts/WorkspaceContext.tsx` | Header config context |
| `src/components/app-shell/AppShell.tsx` | Layout wrapper |
| `src/components/app-shell/TopNav.tsx` | Universal top nav bar |
| `src/components/app-shell/AppSidebar.tsx` | Main sidebar |
| `src/components/app-shell/FullBleed.tsx` | Responsive layout container |
| `src/components/app-shell/nav-config.ts` | Nav sections per role |
| `src/components/app-shell/MobileBottomNav.tsx` | Mobile bottom navigation |
| `src/components/app-shell/mobile-nav-config.ts` | Mobile nav items per role |
| `src/components/dashboard/` | Dashboard widget components (StatCard, TaskCard, etc.) |
| `src/components/video/` | Video + thumbnail review system |
| `src/components/crm/profile/` | CRM person profile (9-tab layout + sidebar) |
| `src/components/dashboards/owner/studio/` | Content Studio components |
| `src/components/dashboards/owner/finance/` | Finance module (Overview, Revenue, Subscriptions, Costs) |
| `src/components/dashboards/owner/pipeline/` | Pipeline deal management |
| `src/components/dashboards/shared/hq/` | HQ analytics tabs + charts |
| `src/components/dashboards/shared/profile/` | Team member profile pages |
| `src/components/platform/` | Platform admin dashboard |
| `src/components/projects/` | Project Builder (wizard + extracted primitives) |
| `src/components/grid/cells/MediaStubCells.tsx` | Grid cell renderers |
| `src/components/ui/` | shadcn/ui primitives |
| `src/hooks/query-keys.ts` | Centralized TanStack Query key definitions |
| `src/hooks/data/index.ts` | Barrel exports for all data hooks |
| `src/hooks/use-studio.ts` | Studio hooks (brain, foundation, scripts, cycles) |
| `src/hooks/use-operating-costs.ts` | Operating costs CRUD hooks |
| `src/hooks/use-stripe-actions.ts` | Stripe action hooks (payment links, subscriptions) |
| `src/hooks/use-hq-analytics.ts` | HQ analytics data hooks |
| `src/hooks/use-platform.ts` | Platform admin data hooks |
| `src/hooks/use-team-member-profile.ts` | Team member profile data hooks |
| `src/hooks/useClientAudience.ts` | Audience avatar CRUD hooks |
| `src/lib/templateBuilder.ts` | Template types, constants, helpers |
| `src/components/dashboards/senior-editor/ProductionBoard.tsx` | Senior Editor Kanban board (~680 lines) |
| `src/components/dashboards/senior-editor/board-helpers.ts` | Board shared types, filters, localStorage persistence |
| `src/components/dashboards/editor/EditorWorkspace.tsx` | Editor Tasks dashboard (StatCards, DataTable, upload zone) |
| `src/components/dashboards/editor/EditorVideosPage.tsx` | Editor Videos page (search, status filters, thumbnails) |
| `src/hooks/use-editor-videos.ts` | Editor hooks: assignments, videos, status mutation, client IDs |
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
- **Dynamic min-height** — use inline `style` prop, NOT dynamic Tailwind classes like `` `min-h-[${var}]` ``

### Backend Integrations (Edge Functions)
- Edge Functions deployed via Supabase MCP
- Located in `supabase/functions/`
- Used for privileged actions requiring `SERVICE_ROLE_KEY`
- `stripe-webhook` — handles Stripe payment events
- `send-campaign-email` — processes outbound email queue via Resend
- `sync-calendly-events` — syncs Calendly V2 API events → `calendly_events` table (used by closer + content_creator roles)

### Routing Convention
```
/{role}/                    → role dashboard
/{role}/clients             → client list
/{role}/clients/:id         → client workspace (tabs via context)
/{role}/projects             → project list
/{role}/projects/new         → project builder (4-step full-page wizard)
/{role}/projects/:id        → project detail
/{role}/videos              → video grid (owner/editor)
/{role}/videos/:id          → video review player
/{role}/studio              → content studio (two-state: table → client detail)
/{role}/finance             → finance module (4 tabs: Overview, Revenue, Subscriptions, Costs)
/{role}/sales               → sales hub (Leads, Pipeline, Schedule tabs)
/{role}/schedule            → Calendly schedule (closer, content-creator — ScheduleDashboard mode="live")
/{role}/forms               → form list
/{role}/forms/new           → form builder
/{role}/forms/:id/edit      → form editor
/{role}/email-hub           → email hub (5 tabs)
/{role}/templates           → template list
/{role}/templates/new       → template builder
/{role}/templates/:id       → template editor
/r/:token                   → guest viewer (public, no auth)
```

### Template Builder Architecture

**JSONB Config Pattern:**
Project type templates store a rich `config` JSONB column with 6 sections:
- **Identity** — internal name, tagline
- **Commercial Model** — billing type (one_time/recurring/hybrid), fees, currency, duration
- **Scope** — scope model (fixed/per_cycle/rate_based/unlimited), deliverables, cycles, contributors
- **Service Depth** — self / with_you / for_you
- **Modules** — user-defined array of `{ id, name, description, status }` (off/addon/bundled)
- **Workflow** — journey steps array of `{ key, label, order }`

**Key Types (in `src/lib/templateBuilder.ts`):**
`TemplateConfig`, `BillingType`, `ScopeModel`, `ServiceDepth`, `ModuleStatus`, `TemplateModule`, `JourneyStep`

**Key Files:**
| File | Purpose |
|------|---------|
| `src/lib/templateBuilder.ts` | Types, constants (`EMPTY_CONFIG`, `BILLING_OPTIONS`, `SCOPE_OPTIONS`, `DEPTH_OPTIONS`), helpers |
| `src/hooks/use-template-builder.ts` | TanStack Query hooks for template CRUD |
| `src/components/projects/CreateProjectPage.tsx` | 4-step project builder wizard |

**Project Builder Convention:**
- Full-page wizard (no modals/sheets for major creation flows)
- 4 steps: Select Client → Project Basics → Offer Config → Review
- Templates auto-populate config on selection
- "Save as Template" toggle always visible on Review step
- Paginated client list (10 per page with "Show more")
- Sub-components: `SectionCard`, `FieldRow`, `TogglePills`, `CurrencyInput`, `StatPill`, `ReviewRow`

## Feature Verification Protocol

> See `AGENTS.md` Section 8 for the full protocol. Summary below.

### Workflow: Decompose → Build → Verify → Log

Every feature implementation follows this loop:
1. **Decompose** the feature into atomic sub-features with acceptance criteria
2. **Build** the implementation
3. **Verify in browser** — navigate, click, interact, check console
4. **Log results** in a verification table (sub-feature / tested / pass-fail / notes)
5. **Fix failures** before moving on — never ship known-broken sub-features
6. **Report honestly** — separate what WORKS from what DOESN'T

### Feature-Specific Verification Checklists

**Chat / Messaging (Readiness: 98/100):**
- [x] Send a message → appears in thread
- [x] Receive a message (or refresh) → new message visible
- [x] Scroll to bottom on new message
- [x] Empty state for no messages
- [x] Timestamps display correctly (+ tooltip on hover with full datetime)
- [x] Voice notes: mic permission → record → stop → playback → waveform/duration → save to storage
- [x] File upload: picker → progress → preview → download link
- [x] Emoji/reactions: select → display → persist on refresh
- [x] DM name resolution: shows partner's name, not current user
- [x] Unread badges: 15s polling + realtime INSERT invalidation via `useChatRealtimeGlobalBadges()`
- [x] Room deletion: atomic via `delete_chat_room()` SECURITY DEFINER RPC
- [x] ARIA labels on all icon-only buttons
- [x] Escape key dismisses reply-to preview
- [x] No nested `<button>` elements (ChatRoomCard uses `<div role="button">`)
- [x] Message forwarding: `ForwardMessageDialog` room picker + `useForwardMessage()` + "↪ Forwarded" badge
- [x] Message pinning: `chat_pinned_messages` table + `PinnedMessagesBar` + 📌 indicator (owner/manager/senior_editor only)
- [x] Rate limiting: 500ms client-side throttle with toast feedback
- [x] Query key factory: `pinnedMessages` + `roomMembers` centralized

**Forms:**
- [ ] All field types render (text, select, checkbox, date, etc.)
- [ ] Validation fires on submit (required fields, format checks)
- [ ] Error messages appear next to the correct fields
- [ ] Submit saves to database
- [ ] Success toast/feedback shows
- [ ] Loading state during submission

**Tables / Data Grids:**
- [ ] Data loads and renders
- [ ] Sorting toggles correctly
- [ ] Search/filter returns correct results
- [ ] Empty state for no results
- [ ] Pagination works (if applicable)
- [ ] Row actions work (edit, delete, view)

**Modals / Dialogs:**
- [ ] Opens from trigger
- [ ] Closes via X button, backdrop click, and Escape key
- [ ] Form inside submits correctly
- [ ] Doesn't break body scroll when closed

**File Upload / Media:**
- [ ] File picker opens
- [ ] Upload shows progress indicator
- [ ] File saves to Supabase storage
- [ ] Preview works after upload (image, video, audio)
- [ ] Error feedback for wrong file type or oversized file

**Navigation / Tabs:**
- [ ] All tabs render their content
- [ ] Active tab visually highlighted
- [ ] Switching tabs doesn't break parent navigation (Header Ownership Rule)
- [ ] URL updates if tab is URL-driven

## Table UI Standards

### Two Table Systems
The app has two table systems — use the right one:

| System | Component | When to use |
|--------|-----------|-------------|
| **VideosGrid** | `components/grid/VideosGrid.tsx` + `ColumnHeader.tsx` | Content Studio videos — spreadsheet-style with drag-to-reorder columns, inline cell editing, column resize, virtualization |
| **Inline `<table>`** | Hand-coded `<table>` elements in each dashboard page | Management dashboards (Leads, Clients, CRM, Projects, Pipeline, People, etc.) — simpler read-only tables with toolbar sort/filter |

### Standardized `<th>` Style (Non-Negotiable)
Every table header cell in the app MUST use this style:

```
text-[11px] font-normal uppercase tracking-wide text-foreground-disabled
```

For inline tables, apply directly on the `<th>` or on a `<span>` inside. Example:
```tsx
<th className="border-b border-border px-3 py-2 text-left">
  <span className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
    {col.label}
  </span>
</th>
```

**❌ Never use:** `font-medium`, `text-xs`, `text-foreground-muted` on table headers.

### Column Header Interaction Model
- **Click** the header label → toggles sort (asc → desc → clear)
- **Right-click** the header → context menu with Sort / Hide / Rename / Edit / Delete
- **Drag** the header label area → reorder columns (cursor changes to `grab`)
- **Drag the right edge** → resize column

**⛔ No hover-to-reveal icons.** No grip handles, no gear icons, no chevron icons appearing on hover. The UI must stay clean.

### Media Column Widths
Video and thumbnail columns must have a minimum width of **110px** to ensure the 9:16 aspect ratio frame and label are both visible without manual column resizing.

### Theme Token Usage
All table borders, backgrounds, and text colors MUST use theme tokens:
- Borders: `border-border` (Tailwind class) or `var(--border)` (CSS)
- Header text: `text-foreground-disabled`
- Row hover: `hover:bg-foreground/[0.03]`
- Selected row: `bg-surface-raised`
- Checkbox: `border-border-strong checked:bg-primary`

**❌ Never use:** hardcoded `rgba()` values, `border-white/20`, `bg-white/90`

## TipTap Rich Text Editor Architecture

### Extension Stack (pinned to `@tiptap/*@3.22.5`)
| Extension | Package | Purpose |
|-----------|---------|---------|
| StarterKit | `@tiptap/starter-kit` | Base: paragraphs, headings, bold, italic, lists, code, blockquote |
| Color | `@tiptap/extension-color` | Text color |
| Highlight | `@tiptap/extension-highlight` | Background highlight |
| TextStyle | `@tiptap/extension-text-style` | Style wrapper for color/font |
| FontFamily | `@tiptap/extension-font-family` | Font family selection |
| Link | `@tiptap/extension-link` | Hyperlinks |
| Underline | `@tiptap/extension-underline` | Underline formatting |
| TextAlign | `@tiptap/extension-text-align` | Left/center/right/justify |
| Placeholder | `@tiptap/extension-placeholder` | Empty editor placeholder text |
| Details | `@tiptap/extension-details` | Collapsible toggle blocks (official) |
| FontSize | Custom (`FontSizeExtension.ts`) | Font size control via `textStyle` |

### ⛔ Focus-Safe Event Handling (Non-Negotiable)
**All toolbar/menu buttons that trigger editor commands MUST use `onMouseDown` + `e.preventDefault()`, NEVER `onClick`.**

```tsx
// ✅ CORRECT — preserves editor selection
<button onMouseDown={(e) => {
  e.preventDefault();
  editor.chain().focus().toggleBold().run();
}}>Bold</button>

// ❌ WRONG — steals focus, loses selection before command runs
<button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
```

This applies to: `ToolBtn`, `ColorPickerDropdown`, color swatches, bubble menu items, and any interactive element that controls the editor.

### Context Menu Race Condition Guard
The custom right-click menu uses a `pendingActionRef` to prevent the document-level `mousedown` listener from closing the menu before the action fires:

```tsx
const pendingActionRef = useRef(false);

// In menu item handler:
onMouseDown={(e) => {
  e.preventDefault();
  pendingActionRef.current = true;
  // execute editor command
  setTimeout(() => { pendingActionRef.current = false; setContextMenu(null); }, 50);
}}

// In document mousedown listener:
if (pendingActionRef.current) return; // don't close yet
```

### Toggle Blocks (Details Extension)
- Insert via toolbar: `editor.chain().focus().setDetails().run()`
- Insert via context menu "Save as Script": wrap selection in details + set summary text
- CSS targets `[data-type="details"]`, `[data-type="detailsSummary"]`, `[data-type="detailsContent"]`
- Toggle state tracked via `.is-open` class on the wrapper
- **Never use native `<details>/<summary>` HTML** — ProseMirror intercepts those events

### Key Files
| File | Role |
|------|------|
| `RichTextEditor.tsx` | Editor orchestrator — extensions, bubble menu, context menu |
| `EditorToolbar.tsx` | Pinned toolbar — formatting buttons, color picker, alignment |
| `FontSizeExtension.ts` | Custom font-size mark extension |
| `CycleEditor.tsx` | Cycle page wrapper — passes `enableScriptToggle` to editor |
| `styles.css` (§14) | Details block styling |

## Email System Architecture

### Email Hub (7 Tabs)
```
EmailHub.tsx (← route: /owner/email-hub, /manager/email-hub)
├── Tab 1: Templates     → template card grid with create/edit
├── Tab 2: Editor        → visual ↔ HTML toggle, template list sidebar, live preview
├── Tab 3: Design        → master template shell editor (DesignTab.tsx)
├── Tab 4: Compose       → audience picker, subject/body/CTA, send/schedule
├── Tab 5: History       → campaign list with rendered preview + per-recipient drill-down
├── Tab 6: Scheduled     → upcoming campaigns with cancel action
└── Tab 7: Outbox        → sent email monitoring (OutboxTab.tsx)
```

**Master Template System:**
- `email_master_template` table — stores the universal HTML shell with `{{CONTENT}}` placeholder
- `DesignTab.tsx` — visual editor for the master template
- `use-master-template.ts` — TanStack Query hook for `email_master_template` CRUD
- All campaign/transactional emails are wrapped in the master template shell before sending

**Key files:**
| File | Purpose |
|------|---------|
| `src/components/dashboards/shared/email-hub/DesignTab.tsx` | Master template visual editor |
| `src/components/dashboards/shared/email-hub/OutboxTab.tsx` | Sent email monitoring |
| `src/hooks/use-master-template.ts` | Master template CRUD hook |
| `src/hooks/use-email-templates.ts` | Individual template CRUD hooks |
| `src/hooks/use-email-campaigns.ts` | Campaign + scheduled + recipient hooks |

### Auth Email Branding (Edge Function + Auth Hook)
Supabase Auth emails (signup confirmation, password reset, magic link, email change) are routed through a custom Auth Hook to the `send-auth-email` Edge Function:

```
Auth Event (signup, password_reset, etc.)
  → Supabase Auth Hook (Send Email type)
    → send-auth-email Edge Function
      → Fetch master template from email_master_template table
      → Render auth-specific content (subject, body, CTA button)
      → Inject into master template shell
      → Send via Resend API
```

**Key details:**
- `send-auth-email` has `verify_jwt: false` (called by Supabase Auth internally)
- Uses `SERVICE_ROLE_KEY` to read master template from DB
- Renders branded HTML with ClipsOS logo, consistent colors, and professional footer
- Supports: `signup`, `recovery`, `magic_link`, `email_change`, `invite` email types

## Upload Engine Architecture

```
Upload Flow:
  1. Client → initialize-upload Edge Function
     → Creates upload_sessions row
     → Initiates Cloudflare Stream TUS upload
     → Initiates R2 multipart upload
     → Returns session_id + presigned URLs

  2. Client → presign-r2-part Edge Function (per chunk)
     → Returns presigned PUT URL for each R2 part

  3. Client → complete-upload Edge Function
     → Completes R2 multipart assembly
     → Updates video row with Stream ID + R2 path
     → Creates new video_version row (auto-versioning)
     → Marks upload_sessions as completed

  4. cleanup-stale-uploads (cron)
     → Aborts abandoned uploads older than 24h
```

**Key files:**
| File | Purpose |
|------|---------|
| `src/hooks/useUploadManager.ts` | Client-side upload orchestration |
| `src/components/upload/` | Upload queue UI components |
| `supabase/functions/initialize-upload/` | Upload initialization |
| `supabase/functions/presign-r2-part/` | R2 part presigning |
| `supabase/functions/complete-upload/` | Upload finalization |
