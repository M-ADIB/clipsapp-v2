# ClipsApp — UI/UX Visual Inventory (Live Audit)
**Companion to PRD v1.0 + Permissions Matrix + Database Schema**
*Generated: 2026-04-26*
*Source: live filesystem audit — 73 page files, 489 component files, 5 layout shells, dual token system*

---

## ⚠️ READ THIS FIRST — REBUILD INTENT

> **This document is a REFERENCE INVENTORY of what currently exists. It is NOT a copy-paste blueprint.**
>
> The whole point of the rebuild is that **the current implementation has problems**:
> - Many components are duplicated across roles (Owner ≈ Admin ≈ EditorAdmin pages)
> - Two competing design token systems coexist (`shadcn HSL` legacy + `V2` Figma tokens)
> - Some pages are stale, some folders are bloated, naming is inconsistent
> - 489 components is far more than necessary — heavy consolidation is expected
>
> **How to use this doc:**
> 1. Understand SCOPE — what features and surfaces exist, so the rebuild doesn't accidentally drop something or build a duplicate
> 2. Identify CONSOLIDATION targets — places where 3 components do similar jobs
> 3. Pull DESIGN INTENT from the V2 token system (the legacy HSL one is being phased out)
> 4. **Redesign freely** — names, folder structure, component boundaries, even page existence are open
> 5. Cross-reference `PRD.md` and `PERMISSIONS-MATRIX.md` for what should actually ship
>
> **Markers used:**
> - 🔄 **CONSOLIDATE** — merge with similar components
> - 🗑️ **DROP** — does not survive the rebuild
> - ✅ **KEEP** — pattern is solid, carry the concept forward (not necessarily the code)
> - ➕ **ADD** — new component the rebuild needs that doesn't exist yet
> - ⚠️ **LEGACY** — replaced by a newer version that ships alongside it

---

## Table of Contents

1. [Page List](#1-page-list-every-route)
2. [Component Inventory](#2-component-inventory)
3. [Layout Structure](#3-layout-structure)
4. [Design Tokens (Current)](#4-design-tokens-current)
5. [Rebuild Recommendations](#5-rebuild-recommendations)

---

## 1. Page List (every route)

### 1.1 Public routes (no auth)

| Route | Page Component | Title | Shows |
|---|---|---|---|
| `/` | redirect | — | Redirects to `/login` |
| `/login` | `Index.tsx` | Sign In | Email/password + Google OAuth + "Send magic link" form |
| `/welcome` | `Welcome.tsx` | Welcome | Post-signup landing for first-time users |
| `/onboarding` | `Onboarding.tsx` | Onboarding | 16-question client onboarding wizard (gated route) |
| `/auth/callback` | `AuthCallback.tsx` | — | OAuth provider callback handler |
| `/auth/magic-link` | `MagicLinkCallback.tsx` | — | Magic link exchange handler |
| `/oauth/callback` | `OAuthCallback.tsx` | — | Generic OAuth callback (Meta/Stripe) |
| `/reset-password` | `ResetPassword.tsx` | Reset Password | Set new password after temp-password login |
| `/review/:videoId` | `VideoReview.tsx` | Video Review | Public guest video-review surface (token-gated) |
| `/v/:code` | `ShortLinkRedirect.tsx` | — | Short-link resolver |
| `/project-review/:projectId` | `PublicProjectReview.tsx` | Project Review | All videos in a project for guest reviewers |
| `/workspace/public/:token` | `WorkspaceAccess.tsx` | — | Public workspace access via magic link |
| `/unauthorized` | `Unauthorized.tsx` | Unauthorized | 403 page |
| `/404` (catch-all) | `NotFound.tsx` | Not Found | 404 with role-aware redirect |
| `/clipsos` | `ClipsOS.tsx` | ClipsOS | 🗑️ Marketing — out of rebuild scope |
| `/our-solution` | `OurSolution.tsx` | Our Solution | 🗑️ Marketing |
| `/testimonials` | `Testimonials.tsx` | Testimonials | 🗑️ Marketing |
| `/submit-form` | `SubmitForm.tsx` | Submit Form | 🗑️ Legacy lead form — replaced by new Forms feature |
| `/book-a-call-uae` | `BookACallUAE.tsx` | Book a Call (UAE) | 🗑️ Marketing booking page |
| `/book-a-call-aus` | `BookACallAUS.tsx` | Book a Call (AUS) | 🗑️ Marketing booking page |
| `/book-a-call-ca` | `BookACallCA.tsx` | Book a Call (CA) | 🗑️ Marketing booking page |
| `/thank-you` | `ThankYou.tsx` | Thank You | 🗑️ Post-form thank-you |
| `/careers` | `Careers.tsx` | Careers | 🗑️ Job listings |
| `/careers/:jobSlug` | `CareerApplication.tsx` | Apply | 🔄 Replace with generic Forms feature |
| `/talent-network-apply` | `TalentApplicationPage.tsx` | Apply (Editor) | 🔄 Replace with Forms |
| `/videographer-apply` | `VideographerApplicationPage.tsx` | Apply (Videographer) | 🔄 Replace with Forms |
| `/studio-apply` | `StudioApplicationPage.tsx` | Apply (Studio) | 🔄 Replace with Forms |
| `/va-apply` | `VAApplicationPage.tsx` | Apply (VA) | 🔄 Replace with Forms |
| `/privacy` | `PrivacyPolicy.tsx` | Privacy | Legal |
| `/terms` | `TermsOfService.tsx` | Terms | Legal |

### 1.2 Owner routes (`/owner/*`)

| Route | Page | Title | Shows |
|---|---|---|---|
| `/owner/dashboard` | `Dashboard.tsx` | Dashboard | 3-tab Owner overview: Production / Sales / Finance |
| `/owner/clients` | `Clients.tsx` | Clients | Workspaces table with filter sheet |
| `/owner/clients/:clientId` | `ClientDetail.tsx` | Client | Workspace detail (Home/Journey/Members/Info/Settings tabs) |
| `/owner/clients/:clientId/projects/:projectId` | `projects/ProjectDetail.tsx` | Project | Cycles/videos/schedule/notes/tasks |
| `/owner/projects` | `Projects.tsx` | Projects | Cross-workspace project list |
| `/owner/videos` | `AllVideos.tsx` | Videos | Cross-workspace video table (FullyCustomizableTable) |
| `/owner/analytics` | `AgencyGrowth.tsx` | Analytics | Agency-wide analytics (renders AgencyGrowth) |
| `/owner/agency-growth` | `AgencyGrowth.tsx` | Agency Growth | Owner financial + production overview |
| `/owner/agency-growth-manage` | `AgencyGrowthManage.tsx` | Manage Growth | Manage finance entries / Stripe matches |
| `/owner/editor-productivity` | `EditorProductivity.tsx` | HQ | Editor productivity leaderboard |
| `/owner/editor-productivity/:editorId` | `EditorProductivityDetail.tsx` | Editor Detail | Per-editor performance |
| `/owner/clips-ai` | `ClipsAI.tsx` | Jarvis | AI chat (🔄 swap to GPT-5 Mini) |
| `/owner/settings` | `Settings.tsx` | Settings | Tenant settings |
| `/owner/credentials` | `Credentials.tsx` | Credentials | Internal credentials vault |
| `/owner/tasks` | `shared/MyTasks.tsx` | My Tasks | Owner task list |
| `/owner/workboard` | `shared/Workboard.tsx` | Workboard | Cross-team Kanban |
| `/owner/notifications` | `NotificationsPage.tsx` | Notifications | Notification inbox |
| `/owner/media-library` | `MediaLibrary.tsx` | Media Library | File browser (Drive replacement) |
| `/owner/management` | `Management.tsx` | Management | Hub for admin sub-surfaces |
| `/owner/user-management` | `UserManagement.tsx` | Users | Invite/edit/delete team members |
| `/owner/talent-network` | `TalentNetwork.tsx` | Talent Network | 🗑️ DROP marketplace, keep browse only |
| `/owner/talent-network/:talentId` | `TalentProfilePage.tsx` | Talent Profile | 🗑️ DROP transactional |
| `/owner/error-logs` | `ErrorLogs.tsx` | Error Logs | Client error inbox |
| `/owner/security` | `Security.tsx` | Security | RLS linter / login history |
| `/owner/studio` | `ContentStudioPicker.tsx` | Studio | Pick a client to enter Studio |
| `/owner/studio/:clientId` | `ContentStudio.tsx` | Studio | Per-client Studio (Foundation/Strategy/Scripts/Hooks/Vault tabs) |
| `/owner/client-chats` | `ClientChats.tsx` | Chats | Inbox of all client chats |
| `/owner/client-chats/:roomId` | `ClientChats.tsx` | Chat | Specific client chat thread |
| `/owner/leads` | `Leads.tsx` | Pipeline | Inbound leads inbox |
| `/owner/crm/people` | `sales/CrmPeople.tsx` | People | Unified CRM people list |
| `/owner/crm/people/:id` | `crm/PersonProfile.tsx` | Person | Attio-style profile with full history |
| `/owner/crm/companies` | `sales/CrmCompanies.tsx` | Companies | CRM companies list |
| `/owner/crm/deals` | `sales/CrmDeals.tsx` | Deals | Kanban + table view |
| `/owner/crm/editors` | `sales/CrmEditors.tsx` | Editors | External editor talent list |
| `/owner/crm/contacts` | `shared/CrmContacts.tsx` | Contacts | Unified inbox |
| `/owner/crm/calls` | `sales/Calls.tsx` | Calls | Calendly + Fireflies call list |
| `/owner/crm/calls/:id` | `sales/CallDetail.tsx` | Call Detail | Recording, transcript, AI score |
| `/owner/partnerships` | `Partnerships.tsx` | Partnerships | Partnership applications |
| `/owner/email-hub` | `EmailHub.tsx` | Email Hub | Compose / templates / sequences / history |
| `/owner/test-email` | `TestEmail.tsx` | Test Email | 🗑️ Internal dev tool |

### 1.3 Admin routes (`/admin/*`) — ⚠️ ~80% duplicate of Owner

Routes mostly mirror Owner with `/admin/` prefix. Different page only at `/admin/dashboard` (`AdminDashboard.tsx`). **Rebuild action:** collapse Owner + Admin into the **Manager** role (per PRD rename). Single layout, single page set, permission gate at the data layer (RLS + nav config).

### 1.4 Editor Admin routes (`/editor-admin/*`) — ⚠️ Duplicate

Mirrors Admin with `/editor-admin/` prefix + `/my-performance`. **Rebuild → `senior_editor` role with one set of pages.**

### 1.5 Content Admin routes (`/content-admin/*`)

Subset focused on Studio + production QA. **Rebuild → `content_creator` role.**

### 1.6 Editor routes (`/editor/*`)

| Route | Page | Title |
|---|---|---|
| `/editor/dashboard` | `editor/EditorDashboard.tsx` | My Dashboard |
| `/editor/projects` | `editor/EditorProjects.tsx` | My Projects |
| `/editor/videos` | `editor/EditorVideos.tsx` | My Videos |
| `/editor/clients/:clientId` | `ClientDetail.tsx` | Client (assigned) |
| `/editor/clients/:clientId/projects/:projectId` | `ProjectDetail.tsx` | Project |
| `/editor/tasks` | `shared/MyTasks.tsx` | My Tasks |
| `/editor/workboard` | `shared/Workboard.tsx` | Workboard |
| `/editor/my-performance` | `EditorProductivityDetail.tsx` | My Performance |
| `/editor/inspiration` | `AllVideos.tsx` (read-only) | Inspiration |
| `/editor/help` | `editor/EditorHelp.tsx` | Help |
| `/editor/clips-ai` | `ClipsAI.tsx` | Jarvis |
| `/editor/settings` | `Settings.tsx` | Settings |
| `/editor/credentials` | `MyCredentials.tsx` | My Credentials |
| `/editor/notifications` | `NotificationsPage.tsx` | Notifications |
| `/editor/client-chats` | `ClientChats.tsx` | Client Chats |
| `/editor/client-chats/:roomId` | `ClientChats.tsx` | Chat |

### 1.7 Sales routes (`/sales/*`) → rebuild to `closer`

| Route | Page | Title |
|---|---|---|
| `/sales/dashboard` | `sales/SalesDashboard.tsx` | Dashboard |
| `/sales/leads` | `Leads.tsx` | Leads (region-scoped) |
| `/sales/schedule` | `sales/SalesSchedule.tsx` | Schedule |
| `/sales/follow-ups` | `sales/SalesFollowUps.tsx` | Follow-ups |
| `/sales/settings` | `sales/SalesSettings.tsx` | Settings |
| `/sales/notifications` | `NotificationsPage.tsx` | Notifications |
| `/sales/crm/deals` | `sales/CrmDeals.tsx` | Deals |
| `/sales/crm/calls` | `sales/Calls.tsx` | Calls |
| `/sales/crm/calls/:id` | `sales/CallDetail.tsx` | Call Detail |
| `/sales/crm/contacts` | `shared/CrmContacts.tsx` | Contacts |
| `/sales/crm/people` | `sales/CrmPeople.tsx` | People |
| `/sales/crm/people/:id` | `crm/PersonProfile.tsx` | Person |
| `/sales/crm/companies` | `sales/CrmCompanies.tsx` | Companies |

### 1.8 Client routes (`/client/*`)

| Route | Page | Title | Shows |
|---|---|---|---|
| `/client/dashboard` | `client/ClientDashboard.tsx` | Home | Hero card, journey, urgent notifs, what's-next |
| `/client/videos` | `client/ClientVideos.tsx` | My Videos | 3-tier tabs: My Videos / All / Backlog |
| `/client/videos/:sessionId` | `client/ClientSessionVideos.tsx` | Cycle | Per-cycle video list |
| `/client/queue` | `client/ClientPostingQueue.tsx` | Posting Queue | Scheduled/posted feed |
| `/client/monetization` | `client/ClientMonetizationAnalytics.tsx` | Analytics | Reel Insights (Top/Bottom per platform) |
| `/client/notifications` | `NotificationsPage.tsx` | Notifications | Inbox |
| `/client/files` | `client/ClientFiles.tsx` | My Files | Workspace file browser |
| `/client/media-library` | `MediaLibrary.tsx` | Media Library | Same as files |
| `/client/profile` → redirect | — | — | → `/client/settings?tab=profile` |
| `/client/settings` | `client/ClientSettings.tsx` | Settings | Profile/brand/billing/notifications/integrations |
| `/client/clips-ai` | `ClipsAI.tsx` | Jarvis | AI assistant |
| `/client/archived` | `ClientArchived.tsx` | Archived | Archived videos |
| `/client/talent-network` | `client/ClientTalentNetwork.tsx` | Talent Network | 🗑️ DROP transactional, keep browse |
| `/client/talent-network/:talentId` | `TalentProfilePage.tsx` | Talent | 🗑️ DROP |
| `/client/my-team` | `client/ClientMyTeam.tsx` | My Team | Agency team assigned |
| `/client/chat` | `client/ClientChat.tsx` | Chat | 1:1 with agency |

### 1.9 Shared / utility routes

| Route | Page |
|---|---|
| `/profile/:userId` | `UserProfile.tsx` |
| `/search` | `SearchResults.tsx` |
| `/dashboard` | `RoleBasedRedirect` |

---

## 2. Component Inventory

### 2.1 Counts

- **`src/components/` root:** 52 components
- **`src/components/ui/` (shadcn primitives + custom):** 70 components
- **38 feature folders:** ~370 components
- **Total:** 489 component files

### 2.2 UI Primitives — `src/components/ui/`

> 🗑️ **Most of these are stock shadcn/ui** — the rebuild can re-scaffold from current shadcn rather than carrying these forward. Only the **non-stock** items below need design attention.

**Stock shadcn (rebuild = re-scaffold from latest shadcn):** `accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle`, `toggle-group`, `tooltip`.

**Custom / extended primitives (worth carrying the concept):**

| Component | File | Purpose | Notes |
|---|---|---|---|
| `aceternity-sidebar` | `ui/aceternity-sidebar.tsx` | Animated collapsible sidebar (240→60px) with hover-expand | ✅ KEEP concept; the sidebar story |
| `attio-kanban` | `ui/attio-kanban.tsx` | Kanban board styled like Attio | ✅ KEEP for Deals view |
| `customizable-kanban` | `ui/customizable-kanban.tsx` | Generic Kanban with column reorder | 🔄 Merge with `kanban` |
| `kanban` | `ui/kanban.tsx` | Generic Kanban primitive | 🔄 Merge |
| `glass-card` | `ui/glass-card.tsx` | Glassmorphism card | ✅ KEEP |
| `lamp` | `ui/lamp.tsx` | Aceternity hero "lamp" decoration | 🗑️ Marketing-only |
| `liquid-notification` | `ui/liquid-notification.tsx` | Animated notification toast variant | 🔄 Consolidate with `sonner` |
| `notification-inbox-popover` | `ui/notification-inbox-popover.tsx` | Notification dropdown content | ✅ KEEP |
| `lucide-icon-drawer` | `ui/lucide-icon-drawer.tsx` | Animated icon hover effect hook | ✅ KEEP utility |
| `swipeable-card` | `ui/swipeable-card.tsx` | Mobile swipe gesture card | ✅ KEEP for mobile review |
| `rainbow-button` | `ui/rainbow-button.tsx` | Marketing CTA button | 🗑️ Marketing-only |
| `shimmer-button` | `ui/shimmer-button.tsx` | Marketing CTA variant | 🗑️ Marketing-only |
| `neural-network-background` | `ui/neural-network-background.tsx` | Animated bg for marketing | 🗑️ Marketing-only |
| `confirm-dialog` | `ui/confirm-dialog.tsx` | Generic Yes/No confirm | ✅ KEEP |
| `delete-confirm-dialog` | `ui/delete-confirm-dialog.tsx` | "Type X to delete" confirm | ✅ KEEP — bulk-delete safety |
| `generating-loader` | `ui/generating-loader.tsx` | AI generation animation | ✅ KEEP |
| `pulsating-loader` | `ui/pulsating-loader.tsx` | Loading dot animation | ✅ KEEP |
| `loader` | `ui/loader.tsx` | Spinner | ✅ KEEP |
| `spinner` | `ui/spinner.tsx` | Spinner variant | 🔄 Consolidate with `loader` |
| `lazy-image` | `ui/lazy-image.tsx` | Lazy-loaded `<img>` with skeleton | ✅ KEEP |
| `menu-toggle-icon` | `ui/menu-toggle-icon.tsx` | Animated hamburger icon | ✅ KEEP |
| `upload-success-animation` | `ui/upload-success-animation.tsx` | Lottie-like upload success | ✅ KEEP |

### 2.3 Layout Shell — `src/components/` root

| Component | Purpose | Used by | Notes |
|---|---|---|---|
| `AceternitySidebar` | Role-based collapsible sidebar | All authenticated layouts | ✅ KEEP. Reads from `src/config/navigation.ts` |
| `TopNavBar` | Page title + sub-tabs + actions | All authenticated layouts | ✅ KEEP — `useTopNavContext` registers per-page tabs |
| `MobileMenuButton` | Hamburger trigger for sidebar drawer | All layouts | ✅ KEEP |
| `PageTransition` | Framer-motion page enter animation | Wraps every page | ✅ KEEP |
| `PageHeader` | Right-aligned action bar | Inside pages | ⚠️ Underused — `PageContainer` is the canonical wrapper |
| `Breadcrumbs` | Breadcrumb nav | Detail pages | ✅ KEEP |
| `PreviewBanner` | "Previewing as X — Exit" pin | All authenticated layouts | ✅ KEEP — Universal Preview Mode |
| `PreviewClientPicker` | Pick a client to preview | Sidebar (admin roles) | ✅ KEEP |
| `RealtimeConnectionStatus` | Online/offline indicator | All layouts | ✅ KEEP |
| `ConnectionGuard` | Blocks UI when offline | Client layout | ✅ KEEP |
| `PWAInstallPrompt` | "Install app" toast | All layouts | ✅ KEEP |
| `PushNotificationManager` | Web Push subscription manager | App root | ✅ KEEP |
| `NotificationBell` | Top-bar bell icon w/ count | TopNavBar | ✅ KEEP |
| `NotificationCenter` | Dropdown panel | NotificationBell | ✅ KEEP |
| `InAppNotification` | Toast for in-app notifs | App root | 🔄 Consolidate with sonner toast |
| `ThemeToggle` | Dark/light switcher | Sidebar bottom + TopNav | ✅ KEEP |
| `UserProfileDropdown` | User avatar menu | TopNavBar | ✅ KEEP |
| `CookieConsent` | Cookie banner | App root | ✅ KEEP |
| `ErrorBoundary` | React error boundary | App root | ✅ KEEP |
| `ProtectedRoute` | Auth gate | Routes | ✅ KEEP |
| `RoleProtectedRoute` | Auth + role gate | Routes | ✅ KEEP |
| `RoleBasedRedirect` | Routes user to their dashboard | Catch-all | ✅ KEEP |
| `AppTabBar` | Browser-style multi-tab bar | TopNavBar | ✅ KEEP — in-app tab system |
| `Sidebar` | ⚠️ Legacy sidebar | (none) | 🗑️ DROP — replaced by AceternitySidebar |
| `AdminSidebar` | ⚠️ Legacy admin sidebar | (none) | 🗑️ DROP |
| `RoleBasedSidebar` | ⚠️ Legacy role sidebar | (none) | 🗑️ DROP |
| `ClientBottomNav` | ⚠️ Legacy mobile bottom nav | (none) | 🗑️ DROP |
| `EditorBottomNav` | ⚠️ Legacy mobile bottom nav | (none) | 🗑️ DROP |
| `SidebarTooltip` | Tooltip on collapsed sidebar items | AceternitySidebar | ✅ KEEP |

### 2.4 Domain components (by folder)

#### `components/dashboard/` (22)

Owner/Admin/Editor dashboard widgets. Heavy duplication between role-specific cards.

| Component | Purpose | Rebuild |
|---|---|---|
| `ClientHeroCard` | Client dashboard hero with journey CTA | ✅ KEEP |
| `EditorHeroCard` | Editor dashboard hero | 🔄 Merge with ClientHeroCard into generic `RoleHeroCard` |
| `OwnerProductionOverview` / `OwnerSalesOverview` / `OwnerFinanceOverview` | 3-tab Owner dashboard panels | ✅ KEEP |
| `CustomizableMetricCard` / `CompactMetricCard` / `MetricCardSelector` / `MetricCardSelectorTrigger` | User-customizable KPI cards | ✅ KEEP — concept is great |
| `ContentJourneyChart` / `ProductionVelocityChart` / `EditorClientWorkloadChart` / `EditorProductivityChart` | Recharts panels | ✅ KEEP charts |
| `DeadlineCard` / `EditorDeadlineQueue` / `EmptyDeadlinesState` | Stage-deadline widgets | ✅ KEEP |
| `StarredProjectsFeed` | "Your Attention" feed | ✅ KEEP |
| `UploadHealthCard` | Upload pipeline status | ✅ KEEP |
| `StripeDrilldownSheet` / `StripeMatchPreviewSheet` | Owner finance drilldown | ✅ KEEP |
| `ClientActivityTimeline` | Timeline of client events | ✅ KEEP |
| `DashboardSkeleton` | Loading skeleton | ✅ KEEP |

#### `components/client/` (33) + `components/client/analytics/` (5)

Client portal-specific UI. Largest folder besides `projects/`.

Notable:
- `ClientHomeTab`, `ClientInfoTab`, `ClientOverviewTab`, `ClientJourney`, `ClientPlanCard`, `ClientProjectCard`, `ClientProjectRow`, `ClientUrgentNotifications`, `WhatsNextItem` — client home composition
- `ClientVideoCard`, `ClientVideoGallery`, `ClientVideosTable`, `CycleGroupedTable`, `QueueVideoCard` — video presentation
- `ApprovalModal`, `BrandingDeckReviewModal`, `ThumbnailApprovalModal`, `VideoApprovalCard` — review actions
- `JourneyRenewalBanner`, `BookmarkReminder`, `MobileFilterSheet` — journey + filter UX
- `AdminClientSettings`, `AssignEditorDialog`, `CaptionRegenerationDialog`, `SendNotificationDialog` — admin actions on client
- `ColorPaletteEditor`, `PriorityAlertsPanel`, `PipelineVelocityCard` — secondary widgets
- `analytics/`: `ClientOrganicInsights`, `ClientAdsInsights`, `ClientAutomationInsights`, `TopReelsSection`, `AnalyticsIntegrationsSection` — Reel Insights tab

> 🔄 **Heavy consolidation needed.** The "AdminClientSettings" component is misnamed — it's a settings dialog that should live in `dialogs/`. Many "Client*" components are essentially just generic cards with role-specific fields. Rebuild should normalize on a single `<EntityCard>` + `<EntityTable>` system parameterized by entity type.

#### `components/projects/` (49) + `components/projects/table/` 

Largest folder. Contains the **FullyCustomizableTable** system — the platform's defining table primitive.

Critical components:
- `FullyCustomizableTable` — the data-grid backbone (column reorder, custom columns, inline edit, keyboard nav, copy/paste, find/replace) — ✅ **KEEP this concept**, it's a competitive moat
- `AllVideosTable`, `RedesignedVideosTable`, `VideosList` — variants 🔄 **Consolidate to one**
- `ProjectHeader`, `ProjectStatsCard`, `ProjectFilterSheet`, `ProjectBulkActions`, `BulkActionsBar` (×2)
- `InlineEditableCell`, `EnhancedInlineCell`, `ExpandableTextCell`, `ThumbnailCell`, `VideoCell`, `ReviewToggleCell`, `CellWithContextMenu`, `CustomFieldRenderer`
- `AdvancedFilterPanel`, `PropertyFilters`, `ManageColumnsPanel`, `ManageOptionsSection`, `ColumnOrderSection`
- `SortableTableRow`, `TableHeaderRow`, `TableEmptyState`, `TableToolbar`, `TableSettingsSheet`, `TableDialogs`
- `ExcelToolbar`, `ExcelStatusBar`, `FindReplaceDialog`, `ResizeHandle`, `CellSelectionIndicator` — Excel-like UX
- `ProjectTasksKanban`, `PostingScheduleCard`, `NoteCard`, `NotesEditor`
- `VideoAssignmentDialog`, `RegenerateAIDialog`, `UnifiedProjectTemplate`
- `CircularProgressUpload`, `ColorPaletteDisplay`, `ThumbnailUploadField`, `UploadLogsViewer`
- `TrialTableRow`, `TrialVideoCell` — trial reels integration

> ✅ **The table system is the gem of the codebase.** Rebuild should preserve the UX intent but write it as a clean, well-documented library — current implementation has overlapping cell components and 2 BulkActionsBar files (one in root, one in `table/` subfolder).

#### `components/video/` (15)

Video review surface.

| Component | Purpose |
|---|---|
| `VideoPreviewModal` | Main video review modal with tabs |
| `VideoAnnotationCanvas`, `AnnotationOverlay`, `AnnotationToolbar` | Drawn annotations |
| `VersionSelector`, `VersionTimeline`, `VersionUploadDialog` | Version management |
| `TrialReelCard`, `TrialReelsTab`, `UploadTrialDialog` | Trial reels UI 🔄 rework per PRD trial logic |
| `VideoFeedbackDialog` | Client feedback action |
| `TranscriptionStatus`, `BackgroundUploadNotifier` | Status indicators |
| `DesktopNavigationArrows`, `SwipeIndicator` | Modal nav |

#### `components/chat/` (11)

Real-time chat (Supabase Realtime). WhatsApp/Slack-inspired.

`ChatRoom`, `MessageList`, `MessageBubble`, `MessageComposer`, `ChatReactionBar`, `MentionAutocomplete`, `VoiceRecorder`, `VoiceNotePlayer`, `ThreadList`, `CreateThreadDialog`, `YourTeamBar`.

> ✅ KEEP architecture. Rebuild should add Moderator role to mention-target lists.

#### `components/crm/` (14)

| Component | Purpose |
|---|---|
| `CrmDataTable` | Generic CRM table (people/companies/editors) |
| `CrmDetailSheet`, `CrmCreateSheet` | Side-sheet detail/create |
| `DealCard`, `DealOptionsManager`, `DealsFilterPanel`, `DealsSortPanel`, `DealsViewSettings` | Deals Kanban |
| `PersonOverviewTab`, `PersonNotesTab`, `PersonCallsTab`, `PersonDetailsSidebar` | Person profile (Attio-style) |
| `InlineFieldEditor`, `CategoryChips` | Inline editing primitives |

#### `components/dialogs/` (36)

🔄 **Bloated grab-bag.** Mixes confirm dialogs, create/edit forms, and feature-specific modals. Rebuild should split into:
- `confirms/` — Pause/Archive/Unarchive/Delete/Reactivate confirms (one generic `ConfirmDialog` parameterized)
- `entity-create/` — AddClient/AddProject/AddSession/CreateEditor (consolidate into a single Forms-driven flow)
- `entity-edit/` — Edit*Dialog × 6 (same pattern)
- Standalone: `SearchDialog`, `FeedbackDialog`, `ForgotPasswordDialog`, `FirstLoginPasswordChange`, `CalendlyDialog`, `BookingCallDialog`, `EmbeddedDocumentModal`, `CSVFieldMapperDialog`, `GuestNameDialog`, `RequestTrialsDialog`, `ManageSolutionTypesDialog`, `CreateProjectTypeDialog`, `ShareProjectDialog`, `ShareProjectsWithClientDialog`, `UploadBrandingDeckDialog`, `UploadVersionToVideoDialog`

#### `components/onboarding/` (14) + `wizard/` (6)

`OnboardingDialog`, `OnboardingWizard`, `OnboardingStep1..5`, `OnboardingGate`, `OnboardingReminder`, `OnboardingDocumentViewer`, `BookCallDialog`, `BookPracticeDialog`, `MeetTeamDialog`, `WelcomeVideoModal`, `LockedStepCard`, `PhaseSection`, `PlatformUnlockAnimation`, `ProductTour`, `WhatToExpectSection`, `LifestyleDatePicker`.

> 🔄 **Replace with the new Forms feature** per PRD. Most of this is a hard-coded 16-question flow.

#### `components/studio/` (17)

Content Studio per-client workspace.

`FoundationTab`, `BioTab`, `AudienceTab`, `PillarsTab`, `ContentTab`, `ProductionTab`, `ResourcesTab`, `ScriptEditor`, `IdeasBoard`, `HooksLibrary`, `TemplatesGrid`, `ContentVault`, `SessionDetail`, `SessionsList`, `ClientBrainPanel`, `PillarToolbar`, `PasteSummaryDialog`.

> ⚠️ Studio detailed UX is `[TBD]` per PRD — keep the data model, defer detailed rebuild.

#### `components/email-hub/` (5)

`ComposeTab`, `TemplatesTab`, `ScheduledTab`, `HistoryTab`, `RichTextEditor`.

> ✅ KEEP structure. Rebuild on Lovable Native Email instead of Resend.

#### `components/sales/` (5)

`CallDetailSheet`, `CreateFollowUpDialog`, `TodaysCallsWidget`, `UpcomingFollowUps`, `WeekCallsOverview`.

#### `components/workboard/` (2)

`WorkboardFilters`, `WorkboardVideoCard`.

#### `components/notifications/` (3)

`NotificationCard`, `NotificationEmptyState`, `NotificationIcon`.

#### `components/media-library/` (5)

`MediaLibraryBrowser`, `FolderTreeView`, `MediaGrid`, `MediaListView`, `MediaPreviewModal`.

#### `components/leads/` (1)

`LeadsColumnSettings` — ⚠️ very thin folder.

#### `components/agency-growth/` (5)

`MetricCard`, `VideoStatsSection`, `InstagramMetricsSection`, `FacebookAdsMetricsSection`, `AgencyGrowthPreview`.

#### `components/comments/`, `components/credentials/`, `components/clips-ai/`, `components/content-admin/`, `components/productivity/`, `components/search/`, `components/skeletons/`, `components/sops/`, `components/talent/`, `components/upload/`, `components/video-upload/`, `components/announcements/`, `components/careers/`, `components/marketing/`, `components/loading/`, `components/shared/`, `components/shared/video/`, `components/layout/`

Smaller folders. Highlights:
- `layout/PageContainer` — ✅ canonical page wrapper (narrow/default/wide/full widths)
- `talent/*` — 🗑️ DROP per PRD
- `marketing/*` — 🗑️ DROP per PRD
- `careers/*` — 🔄 replace with Forms
- `upload/UploadActivityIndicator`, `video-upload/*` — ✅ R2 multipart upload UI (KEEP)
- `loading/*`, `skeletons/*` — ✅ KEEP loading states
- `comments/*` — ✅ video comment system

---

## 3. Layout Structure

### 3.1 The 5 layout shells

| Layout | File | Used by | Notes |
|---|---|---|---|
| `OwnerLayout` | `layouts/OwnerLayout.tsx` | `/owner/*`, `/admin/*` | ⚠️ shared by 2 roles — rebuild = single `InternalLayout` for all internal roles |
| `EditorAdminLayout` | `layouts/EditorAdminLayout.tsx` | `/editor-admin/*` | 🔄 Merge into InternalLayout |
| `EditorLayout` | `layouts/EditorLayout.tsx` | `/editor/*` | 🔄 Merge into InternalLayout |
| `SalesLayout` | `layouts/SalesLayout.tsx` | `/sales/*` (closer in rebuild) | 🔄 Merge into InternalLayout |
| `ClientLayout` | `layouts/ClientLayout.tsx` | `/client/*` | ✅ KEEP separate (mounts onboarding gate + reminder dialogs) |

> **All 5 layouts share the same shell:** `<PreviewBanner /> + <AceternitySidebar role={role} /> + <MobileMenuButton /> + <PWAInstallPrompt /> + <RealtimeConnectionStatus /> + <TopNavBar /> + <Outlet />`. Only `ClientLayout` adds onboarding orchestration (OnboardingDialog, BookCallDialog, BookPracticeDialog, MeetTeamDialog, PlatformUnlockAnimation, OnboardingGate, OnboardingReminder). **Rebuild → 1 generic InternalLayout + 1 ClientLayout.**

### 3.2 Sidebar (`AceternitySidebar`)

- **Width:** collapsed `60px` ↔ expanded `207px` (animated via framer-motion, 300ms easeInOut)
- **Navigation source of truth:** `src/config/navigation.ts` exports `roleNavigation` keyed by role
- **Mobile:** becomes a sheet drawer triggered by `MobileMenuButton`
- **Persistence:** collapsed groups stored in `localStorage` under `sidebar-collapsed-groups`
- **Group structure (Owner):** CORE | PRODUCTION | SALES → bottom: Management dropdown
- **Group structure (Sales/Closer):** SALES | CRM
- **Group structure (Client):** CORE (Dashboard / My Videos / Posting Queue / My Files) | CONNECT | … (gated by `showWhen: 'onboarding-complete'`)
- **Quick actions in sidebar:** Add Client, Invite Team, Assign Task, Upload Video, Search (mobile)
- **Bottom area:** ThemeToggle, FeedbackButton, NotificationBell, UserProfileDropdown

### 3.3 Top bar (`TopNavBar`)

- **Height:** 40px, border-bottom `var(--v2-border)`
- **Left:** Page title (auto-resolved from path via `roleNavigation` flat map) + sub-tabs (registered per page via `useRegisterPage`)
- **Right:** Sub-tab badges (numeric counts), `PreviewClientPicker` for admin roles, ThemeToggle, NotificationBell, UserProfileDropdown
- **Sub-tabs:** dynamic, registered with `useTopNavContext.setSubTabs(...)`. Each tab can have a `badge` count.
- **In-app tab system (`AppTabBar`):** browser-style multi-tab navigation, max 12 tabs, "Active" tab is permanent

### 3.4 Main content area

- **Wrapper:** every page should use `<PageContainer>` (from `src/components/layout/PageContainer.tsx`)
- **Widths:**
  - `narrow` = `max-w-3xl` (settings, forms)
  - `default` = `max-w-7xl` (dashboards)
  - `wide` = `max-w-screen-2xl` (CRM, data tables)
  - `full` = no cap (edge-to-edge)
- **Padding:** `p-4 sm:p-6 lg:p-8` (default), `p-4 sm:p-6` (compact), `none`
- **Page transitions:** `<PageTransition>` wraps `<Outlet />` content (framer-motion fade + slide)

### 3.5 Mobile adaptation

- Sidebar → drawer via `MobileMenuButton` + `Sheet`
- TopNavBar collapses (icons only on right side)
- Tables → horizontal overflow + `MobileFilterSheet` for filtering
- Video review modal → swipe gestures (`SwipeIndicator`, `useSwipeNavigation`)
- Bottom nav components exist (`ClientBottomNav`, `EditorBottomNav`) but are **legacy / unused** — drawer pattern wins
- Safe area insets handled via `pb-safe`/`pt-safe` utilities for PWA

---

## 4. Design Tokens (Current)

> ⚠️ **Two competing systems coexist.** The rebuild should pick **one** — recommended: V2 tokens (`new-ui-tokens.css`) since they map to Figma. The legacy shadcn HSL system in `src/index.css` should be dropped or auto-mapped from V2.

### 4.1 Colors — Light Mode

| Token | Hex | Purpose |
|---|---|---|
| `--v2-bg-app` | `#FFFFFF` | App background |
| `--v2-bg-sidebar` | `#F8F8F9` | Sidebar background |
| `--v2-bg-card` | `#FFFFFF` | Card background |
| `--v2-bg-search` | `#F4F4F5` | Search input bg |
| `--v2-bg-active` | `#FCE7F3` | Active state pink tint |
| `--v2-bg-hover` | `rgba(219, 39, 119, 0.04)` | Hover state |
| `--v2-bg-selected` | `rgba(219, 39, 119, 0.08)` | Selected state |
| `--v2-text-primary` | `#18181B` | Primary text (near-black) |
| `--v2-text-body` | `#27272A` | Body text |
| `--v2-text-muted` | `#71717A` | Muted text |
| `--v2-text-active` | `#EC4899` | Active label (pink-500) |
| `--v2-text-label` | `#A1A1AA` | Section headers |
| `--v2-accent-pink` | `#EC4899` | Brand pink-500 (primary) |
| `--v2-accent-pink-hover` | `#DB2777` | Hover pink |
| `--v2-accent-lavender` | `#F9A8D4` | Decorative pink |
| `--v2-border-default` | `#E4E4E7` | Default border |
| `--v2-border-subtle` | `#F4F4F5` | Subtle divider |
| `--v2-border-active` | `#EC4899` | Active border |

### 4.2 Colors — Dark Mode

| Token | Hex | Purpose |
|---|---|---|
| `--v2-bg-app` | `#131314` | App background |
| `--v2-bg-sidebar` | `#18181B` | Sidebar background |
| `--v2-bg-card` | `#1E1E22` | Card background |
| `--v2-bg-search` | `#2B2930` | Search input bg |
| `--v2-bg-active` | `#36343B` | Active state |
| `--v2-text-primary` | `#FFFFFF` | Primary text |
| `--v2-text-body` | `#E5E2E3` | Body text |
| `--v2-text-muted` | `rgba(229, 226, 227, 0.6)` | Muted text |
| `--v2-text-active` | `#FFB3FF` | Active label (soft pink) |
| `--v2-accent-pink` | `#FFB3FF` | Brand pink (soft) |
| `--v2-accent-pink-hover` | `#f0abfc` | Hover pink |
| `--v2-border-default` | `#2B2930` | Default border |

### 4.3 Status Colors (same in both modes)

| Token | Hex | Purpose |
|---|---|---|
| `--v2-status-in-progress` | `#6366F1` | In Progress (indigo) |
| `--v2-status-complete` | `#22C55E` | Complete (green) |
| `--v2-status-pending` | `#EAB308` | Pending (amber) |
| `--v2-status-approved` | `#F59E0B` | Approved (orange) |
| `--v2-status-rejected` | `#6B7280` | Rejected (gray) |
| `--v2-status-critical` | `#EF4444` | Critical (red) |
| `--v2-status-draft` | `#FFB3FF` | Draft (pink) |
| `--v2-status-review` | `#3B82F6` | Review (blue) |

### 4.4 Brand colors (`src/lib/branding/colors.ts`)

| Name | Hex | HSL |
|---|---|---|
| Pink (legacy) | `#F5D1FF` | `300 100% 91%` |
| Purple (legacy) | `#4C229D` | `268 65% 37%` |
| White | `#FFFFFF` | `0 0% 100%` |

> 🗑️ **Legacy file** — superseded by V2 tokens above. The actual brand pink is `#EC4899` (light) / `#FFB3FF` (dark).

### 4.5 Fonts

| Family | Use | Files |
|---|---|---|
| **Neue Haas Grotesk Display Pro** | Headings + metric numbers | `Bold` (700), `Black` (900) |
| **Inter** | Body, UI text | `Regular` (400), `Bold` (700), `ExtraBold` (800), `Black` (900) |

Tailwind aliases:
- `font-title` → Neue Haas Grotesk Display Pro
- `font-body` / `font-sans` → Inter

### 4.6 Font sizes (custom scale in `tailwind.config.ts`)

| Class | Size | Line height |
|---|---|---|
| `text-xs` | 11px | 16px |
| `text-sm` | 12px | 18px |
| `text-base` / `text-md` | 14px | 22px |
| `text-lg` | 16px | 24px |
| `text-xl` | 20px | 28px |
| `text-2xl` | 24px | 32px |
| `text-3xl` | 32px | 40px |

> ⚠️ Custom scale — NOT Tailwind defaults. Rebuild should explicitly carry these or pick fresh.

### 4.7 Spacing scale (V2)

| Token | Value |
|---|---|
| `--v2-space-xs` | 4px |
| `--v2-space-sm` | 8px |
| `--v2-space-md` | 12px |
| `--v2-space-lg` | 16px |
| `--v2-space-xl` | 24px |
| `--v2-space-2xl` | 32px |
| `--v2-space-3xl` | 48px |

### 4.8 Border radius

| Token | Value | Use |
|---|---|---|
| `--v2-radius-card` | 12px | Cards |
| `--v2-radius-sidebar` | 8px | Sidebar items |
| `--v2-radius-button` | 6px | Buttons |
| `--v2-radius-badge` | 9999px | Badges (full) |
| `--v2-radius-input` | 8px | Inputs |
| `--radius` (legacy) | 0.5rem (8px) | shadcn default |

### 4.9 Shadows

| Token | Value (light) | Value (dark) |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | `0 1px 2px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | `0 2px 8px rgba(0,0,0,0.4)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)` | `0 4px 16px rgba(0,0,0,0.5)` |
| `--shadow-glow` | `0 0 0 3px rgba(255,179,255,0.2)` | `0 0 0 2px rgba(255,179,255,0.2)` |

### 4.10 Gradients

| Token | Value |
|---|---|
| `--gradient-primary` | `linear-gradient(135deg, #FFFFFF 0%, #FDF2F8 50%, #FCE7F3 100%)` |
| `--gradient-hero` | `linear-gradient(180deg, #FFFFFF 0%, #FDF2F8 50%, #FCE7F3 100%)` |
| `--gradient-accent` | `linear-gradient(135deg, #FFB3FF 0%, #F472B6 100%)` |
| `--gradient-card` | `linear-gradient(135deg, #FFFFFF 0%, #FDF9FC 100%)` |
| `--gradient-text` | `linear-gradient(135deg, #FFB3FF 0%, #F472B6 50%, #DB2777 100%)` |
| `--gradient-dark-section` | `linear-gradient(180deg, #1F2937 0%, #111827 100%)` |
| `--gradient-subtle` | `linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)` |

### 4.11 Glassmorphism

- `--glass-bg`: `rgba(255, 255, 255, 0.85)` / dark: `rgba(30, 30, 34, 0.8)`
- `--glass-border`: `rgba(255, 179, 255, 0.15)` / dark: `rgba(43, 41, 48, 0.6)`
- `--glass-blur`: `20px` / dark: `16px`

### 4.12 Animations (Tailwind keyframes)

- `accordion-down` / `accordion-up` (200ms)
- `fade-in` (200ms), `fade-in-up` / `fade-in-down` (300ms)
- `scale-in` (200ms)
- `slide-in-right` / `slide-in-left` (250ms)
- `shimmer` (2s infinite linear)
- `stagger-in` (300ms forwards)
- Custom (in `index.css`): `bell-ring`, `cell-update`, `cell-copied`, `row-highlight`, `selection-anchor` pulse, `metric-highlight-spin` (28s)
- Transitions: `--v2-transition-fast: 150ms`, `normal: 200ms`, `slow: 300ms`

### 4.13 Z-index scale (`design-system.ts`)

| Layer | Value |
|---|---|
| base | 0 |
| dropdown | 10 |
| sticky | 20 |
| sidebar | 40 |
| header | 50 |
| overlay | 60 |
| modal | 70 |
| popover | 80 |
| tooltip | 90 |

---

## 5. Rebuild Recommendations

### 5.1 Component consolidation targets

| Current state | Rebuild action |
|---|---|
| 5 layouts (Owner / EditorAdmin / Editor / Sales / Client) all wrapping the same shell | **1 InternalLayout + 1 ClientLayout** |
| `Sidebar.tsx`, `AdminSidebar.tsx`, `RoleBasedSidebar.tsx`, `ClientBottomNav.tsx`, `EditorBottomNav.tsx` (all unused) | **DROP all 5 — keep only AceternitySidebar** |
| `AllVideosTable`, `RedesignedVideosTable`, `VideosList`, `ClientVideosTable`, `CycleGroupedTable` | **One `<VideosTable>` parameterized by view mode** |
| `BulkActionsBar` (×2 — root + table/) | **One** |
| `kanban` + `customizable-kanban` + `attio-kanban` | **One generic `<Kanban>` with theme variants** |
| `loader` + `spinner` + `pulsating-loader` + `generating-loader` | **One `<Loader variant="...">`** |
| 36 dialogs in `dialogs/` grab-bag | **Split: `confirms/`, `entity-create/`, `entity-edit/`, standalone** |
| Owner dashboard widgets duplicated for Editor (`*HeroCard` × 2) | **Generic `<RoleHeroCard>`** |
| `ContentSessionVideos`, `EditorVideos`, `AllVideos`, `ClientVideos` — 4 separate pages doing the same thing with different filters | **One `<VideosPage>` + role-aware default filters** |
| Owner `/owner/*` routes ~80% identical to Admin `/admin/*` routes | **Single route tree under role-aware layout** |
| 4 separate apply pages (talent/videographer/studio/va) | **Generic `/forms/:slug` from new Forms feature** |
| Two design token systems (legacy HSL + V2) | **V2 wins; auto-map shadcn HSL vars from V2** |
| `interview` / `session` / `cycle` terminology mixed | **Lock on `cycle` per PRD** |

### 5.2 Pages to ADD (don't currently exist)

- `/moderator/*` — entire role surface (new role per PRD)
- `/owner/manage/statuses` — modular status admin
- `/owner/manage/roles` — modular role admin
- `/owner/manage/deal-stages` — modular stage admin
- `/owner/manage/video-types` — modular type admin
- `/owner/manage/ai-prompts` — editable AI system prompts
- `/owner/manage/notification-rules` — per-event channel routing
- `/owner/manage/branding` — tenant branding (logo/colors/subdomain)
- `/owner/forms` — Forms list + builder
- `/owner/forms/:id/edit` — Form builder UI
- `/f/:formSlug` — public form (no auth)
- `/owner/finance` — unified finance dashboard (Owner-only)
- `/owner/accounting` — manual ledger
- `/company/*` — Company workspace overview pages

### 5.3 Pages/components to DROP

- All marketing pages (`/clipsos`, `/our-solution`, `/testimonials`, `/book-a-call-*`, `/thank-you`, `/careers`)
- All Talent Network transactional UI (`talent/`, `studios/`, `client_hires` UI)
- ClipsAI hard-coded prompts (replace with modular `ai_prompts` table)
- `TestEmail.tsx` (internal dev tool)
- Legacy sidebars (5 components)
- Legacy bottom nav (2 components)
- ElevenLabs/Resend integrations (per PRD: switch to GPT-5 Mini + Lovable Native Email)

### 5.4 Folder structure recommendation for the rebuild

```
src/
  components/
    primitives/       # shadcn re-scaffolded
    shell/            # sidebar, topnav, layout, page-container
    forms/            # builder + renderer (NEW)
    tables/           # FullyCustomizableTable + cells (consolidated)
    kanban/           # one Kanban (consolidated)
    chat/             # chat system
    crm/              # CRM
    studio/           # Content Studio
    review/           # video review modal + annotations
    onboarding/       # ClientLayout-only orchestration
    dialogs/
      confirms/
      entity-create/
      entity-edit/
    domain/
      videos/
      projects/
      clients/
      deals/
      calls/
  pages/              # one tree per role, no duplicates
  layouts/
    InternalLayout.tsx
    ClientLayout.tsx
  config/
    navigation.ts     # KEEP (already canonical)
  styles/
    tokens.css        # V2 only
```

### 5.5 What's worth carrying forward as **design intent** (not code)

✅ **AceternitySidebar pattern** — collapsible 60↔207px, hover-expand, role-driven config
✅ **TopNavBar with registered sub-tabs + badges** — `useTopNavContext` is a clean API
✅ **PageContainer with width variants** — solves padding inconsistency
✅ **FullyCustomizableTable** — Excel-like table is a moat
✅ **Universal Preview Mode** with banner pin
✅ **In-app multi-tab system (AppTabBar)** — browser-style productivity
✅ **Real-time chat with voice notes + reactions + threads**
✅ **Dual theme with proper HSL semantic tokens**
✅ **CustomizableMetricCard** — user-pickable KPI cards
✅ **R2 multipart upload UX** with progress + resume
✅ **30-day guest review tokens** with optional download toggle
✅ **Onboarding gating with "I'll do it later" + persistent reminder**
✅ **Slack notification routing with mention opt-out**

---

*End of UI/UX Inventory. Use alongside `PRD.md`, `PERMISSIONS-MATRIX.md`, and `DATABASE-SCHEMA.md`. Redesign freely — this is reference, not gospel.*
