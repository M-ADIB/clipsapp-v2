# ClipsOS V2 — UI Standards & Wireframes

> This is the **single source of truth** for every page, component, and interaction pattern.
> Every new page MUST follow these standards. No exceptions.

---

## 1. Global Shell — Shared Across ALL Pages

### 1.1 Sidebar (256px)
| Element | Spec |
|---------|------|
| Width | 256px, bg `#18181B` |
| Logo | `//ClipsApp`, Neue Haas Grotesk 900, 25.9px, centered, 25px from top |
| Search bar | 240×36, bg `#2B2930`, radius 8px, positioned at y=106 |
| Search contents | 🔍 icon (16×16, `rgba(255,255,255,0.5)`) + "Search…" (12px Inter) + `⌘K` (14px) |
| Nav sections | Collapsible groups — eyebrow label (10px Inter 700, uppercase, 1px spacing, `rgba(205,195,208,0.4)`) |
| Nav items | 240×36, padding `8px 16px`, gap 12px icon-to-text |
| Active nav item | bg `#36343B`, radius 6px, icon + text `#ECD7FF` |
| Inactive nav item | no bg, icon + text `rgba(229,226,227,0.6)` |
| Collapse trigger | Inside sidebar header, next to logo |
| User card | Bottom-pinned, bg `#2B2930`, radius 14px, padding `15px 12px` |
| User avatar | 32×32, radius 12px, `box-shadow: 0px 0px 0px 1px #4A454F` |
| User name | 12px Inter 600, `#E5E2E3` |
| User email | 10px Inter 400, `rgba(205,195,208,0.6)` |
| Management link | Above user card, icon + "Management" text, `rgba(229,226,227,0.6)` |

### 1.2 Top Navigation Bar (65px)
| Element | Spec |
|---------|------|
| Height | 65px, bg `#131314`, bottom border `1px solid rgba(255,255,255,0.2)` |
| Left side | Page title (18px Neue Haas Grotesk 500) + optional tab row (gap 30px) |
| Right side | Ask Clips (sparkle icon + label) → Sun icon → Bell icon (28×28 each) |
| Notification dot | 8×8, `#FFB4AB`, `box-shadow: 0px 0px 0px 2px #131314` |
| Active tab | text `#ECD7FF`, `border-bottom: 3px solid #ECD7FF` |
| Inactive tab | text `#939193`, no border |
| Tab font | 14px Inter 500, tracking `-0.35px` |

### 1.3 Main Content Area
| Element | Spec |
|---------|------|
| Layout | `flex-1`, `overflow-auto`, padding `16px` (mobile) / `24px` (md+) |
| Background | `#131314` (inherits from bg) |
| Max width | fluid (fills available space) |
| Breakpoints | sm: 640px, md: 768px, lg: 1024px, xl: 1280px |

---

## 2. Mandatory Page Patterns — EVERY Page MUST Have These

### 2.1 List/Table Pages (Clients, Videos, Projects, People, Deals, etc.)

Every page that shows a collection of items MUST include:

#### Row 1: Page Header Bar (52px)
```
[Icon] [Page Title]  ........................................  [Share] [+ Primary CTA]
```
- Height: 52px, bottom border `rgba(255,255,255,0.08)`
- Title icon: 24×24, rounded bg `primary/20`, icon color `primary`
- Title text: 14px Inter 600, white
- Primary CTA: rounded-full, bg `primary`, 12px font-semibold, padding `6px 14px`

#### Row 2: Toolbar Bar (44px)
```
[List Selector ▼]  |  [View Settings]  ......  [Import/Export ▼]  [+ New Item]
```
- Height: 44px, bottom border `rgba(255,255,255,0.08)`
- List selector: dropdown with lists (e.g. Recently Contacted, All, Leads)
- View settings: gear icon + label
- Import/Export: dropdown with Import CSV, Export CSV, Sync contacts
- Divider: `1px` wide, `bg-white/10`, `h-4`

#### Row 3: Sort & Filter Bar (38px)
```
[↕ Sorted by Last interaction]  [🔍 Filter]  ..................  [🔎 Search]
```
- Height: 38px, bottom border `rgba(255,255,255,0.08)`
- Sort pill: bg `white/[0.06]`, 11px font-medium, `white/80`, dropdown for field selection
- Filter button: 11px, `white/50`, opens filter panel (future)
- Search toggle: 24×24, icon `white/40`

#### Data Table
- Header row: 40px, text 11px `white/40`, bottom border `white/[0.08]`
- Data rows: 45px, text 10-12px `white/90`, bottom border `white/[0.05]`
- Checkbox column: 40px, rounded-sm checkbox, `border-white/20`
- Selected row: bg `#2B2930`
- Row hover: bg `white/[0.03]`, cursor pointer
- Pinned column header: shows 📌 icon on hover
- Footer: aggregation row (count + "Add calculation")

### 2.2 Dashboard Pages (Owner, Manager, etc.)

Dashboards do NOT have the toolbar rows. They show:
- Stat cards, charts, and panel widgets
- Optional tabs in the header (via WorkspaceContext)
- Section headings: 26px Neue Haas Grotesk 500, `#E5E2E3`

### 2.3 Workspace Pages (Client Workspace, etc.)

Workspace pages inject tabs into the TopNav via WorkspaceContext:
- Title: entity name (e.g. "Ajmal Perfumes")
- Tabs: Overview | Production | Content | Journey | Sales | Analytics | Activity | Settings
- Sub-navigation where needed (e.g. Production → All Plans | Cycles)

---

## 3. Status Badge System

Used across ALL pages. `StatusBadge` component: dot (6×6) + label (12px Inter).

| Status | Dot Color | Text Color | Usage |
|--------|-----------|------------|-------|
| In Review | `#95A4FC` | `#8A8CD9` | Videos awaiting review |
| Approved | `#A1E3CB` | `#4AA785` | Approved videos, active clients |
| Posted | `#B1E3FF` | `#59A8D4` | Published content |
| Pending | `#FFE999` | `#FFC555` | Awaiting action, leads, trials |
| Draft | `rgba(255,255,255,0.4)` | `rgba(255,255,255,0.4)` | Drafts, churned, paused |

---

## 4. Mini Stat Cards (Production Overview & Manager Dashboard)

| Spec | Value |
|------|-------|
| Size | 176×175px |
| Background | `#1E1C1D`, radius 8px |
| Label | 12px Neue Haas Grotesk 500, white, top-left (13px, 15px) |
| Value | 40px Neue Haas Grotesk 500, color varies per card |
| Bottom action | Time filter pills or CTA button |

### Time Filter Pills
- Options: `Today` | `This Week` | `This Month`
- Active: bg `#ECD7FF`, text `#1E1C1D`, border `#ECD7FF`
- Inactive: bg transparent, text white, border `#3C3C3C`
- Font: 7px Neue Haas Grotesk 450, radius 65px

### Card-Specific Colors
| Card | Value Color |
|------|-------------|
| Total Videos | `#ECD7FF` (purple) |
| Posted | `#84E787` (green) |
| Up for Review | `#FFB4AB` (red) |
| Active Clients | `#E7E384` (yellow) |

---

## 5. Video Review Card (Production Overview)

| Element | Spec |
|---------|------|
| Size | Full-width × 126px |
| Background | `#1E1C1D`, radius 20px |
| Thumbnail | 103×103, bg `#929292`, radius 11px, margin 12px |
| Title | 22px Neue Haas Grotesk 500, `#E5E2E3` |
| Status | StatusBadge `in_review` variant |
| Date pill | Bordered `rgba(255,255,255,0.9)`, radius 7px, 10px Inter text |

---

## 6. Quick Review Popup (Row Click in Production Table)

**Trigger:** Click empty space in a production table row.

| Element | Spec |
|---------|------|
| Container | 858×610, bg `#18181B`, shadow `0px 4px 124px 20px rgba(138,138,138,0.25)`, radius 20px |
| Video preview (left) | 319×568, bg `#272727` with video, radius 9px |
| Title (right) | 28px Neue Haas Grotesk 500, `#E5E2E3` |
| StatusBadge | `in_review` variant |
| Approve button | 86×19, bg `#A1E3CB`, text `#18181B`, radius 4px |
| Drop Feedback button | 86×19, bg `#FFB4AB`, text `#18181B`, radius 4px |
| Caption label | "Caption", 12px 500 |
| Caption text box | 473×185, bg `#2B2930`, border `#3C3C3C`, radius 6px |
| Edit button | 42×19, bg `#ECD7FF`, text `#18181B`, radius 4px |
| Thumbnail section | Label + 111×188 image, bg `#929292`, radius 9px |
| Close icon | Top-right, `#E5E2E3` |

### Interactions
- Click video → opens frame.io-style review modal (future)
- Click thumbnail → opens thumbnail review modal (future)
- Approve → changes status
- Drop Feedback → opens revision comment flow

---

## 7. Page Inventory — Current State

### ✅ Built Pages

| Page | Route | Has Filter/Sort? | Has Toolbar? | Notes |
|------|-------|-------------------|--------------|-------|
| Owner Dashboard | `/owner` | N/A (dashboard) | N/A | 2 tabs: Sales Overview, Production Overview |
| Manager Dashboard | `/manager` | N/A (dashboard) | N/A | Single view = Production Overview |
| Owner CRM | `/owner/crm` | ✅ Sort + Filter + Search | ✅ Full toolbar | Gold standard — all pages should match |
| Owner Clients | `/owner/clients` | ✅ Sort + Filter + Search | ✅ Full toolbar | Standardized — matches CRM pattern |
| Client My Videos | `/client/videos` | ✅ Add + Filter + Sort | ✅ Partial | Has action bar, needs list selector |
| Client Workspace | `/owner/clients/$id` | Per-tab | Per-tab | 4 tabs built (Overview, Production, Journey, Sales) |

### 🔲 Unbuilt Pages (use same patterns above)

| Page | Route | Expected Type |
|------|-------|---------------|
| Owner HQ | `/owner/hq` | Dashboard |
| Owner Projects | `/owner/projects` | Table (full toolbar) |
| Owner Videos | `/owner/videos` | Table (full toolbar) |
| Owner Content Studio | `/owner/studio` | Workspace |
| Owner Pipeline | `/owner/pipeline` | Kanban / Table |
| Owner People | `/owner/people` | Table (full toolbar) |
| Owner Deals | `/owner/deals` | Table (full toolbar) |
| Owner Calls | `/owner/calls` | Table / Calendar |
| Owner Tasks | `/owner/tasks` | Table (full toolbar) |
| Manager Clients | `/manager/clients` | Table (full toolbar) |
| Manager Team | `/manager/team` | Table (full toolbar) |
| Manager Videos | `/manager/videos` | Table (full toolbar) |
| Manager Schedule | `/manager/schedule` | Calendar |
| Production Board | `/senior-editor` | Kanban |
| Editor Workspace | `/editor` | Task list |
| Content Creator | `/content-creator` | Dashboard |
| Closer Dashboard | `/closer` | Dashboard + Pipeline |
| Moderator Inbox | `/moderator` | Feed list |

---

## 8. Sidebar Navigation by Role

### Owner
| Section | Items |
|---------|-------|
| Main | Dashboard, My Tasks, CRM |
| Production | HQ, Clients, Projects, Videos, Content Studio |
| Sales | Pipeline, People, Deals, Calls |

### Manager
| Section | Items |
|---------|-------|
| Workspace | Dashboard, Clients, Team |
| Production | Videos, Schedule |

### Client
| Section | Items |
|---------|-------|
| Main | Home, My Videos, Posting Queue, Chat, My Files |
| Support | Feedback, Settings, Help Center |

### Senior Editor
| Section | Items |
|---------|-------|
| Production | Dashboard, Videos, Editors |

### Editor
| Section | Items |
|---------|-------|
| My work | Tasks, Videos |

### Content Creator
| Section | Items |
|---------|-------|
| Content | Dashboard, Videos, Schedule |

### Closer
| Section | Items |
|---------|-------|
| Sales | Dashboard, Pipeline, Calls |

### Moderator
| Section | Items |
|---------|-------|
| Engagement | Inbox, Posts |

---

## 9. Typography Quick Reference

| Use Case | Font | Size | Weight | Color |
|----------|------|------|--------|-------|
| Logo | Neue Haas Grotesk | 25.9px | 900 | white |
| Page title (header) | Neue Haas Grotesk | 18px | 500 | white |
| Section heading | Neue Haas Grotesk | 26px | 500 | `#E5E2E3` |
| Card heading | Neue Haas Grotesk | 20px | 500 | `#E5E2E3` |
| Stat value (large) | Neue Haas Grotesk | 40px | 500 | varies |
| Stat value (medium) | Neue Haas Grotesk | 30px | 500 | `#E5E2E3` |
| Sidebar nav | Inter | 14px | 500 | varies |
| Sidebar eyebrow | Inter | 10px | 700 | `rgba(205,195,208,0.4)` |
| Table header | Inter | 11-12px | 400 | `white/40` |
| Table cell | Inter | 10-12px | 400 | `white/90` |
| Button text | Inter | 12px | 600 | varies |
| Toolbar label | Inter | 11px | 500 | `white/50` |

---

## 10. Color System Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#131314` | Page bg |
| Surface Card | `#1E1C1D` | Cards, chart containers |
| Surface Raised | `#2B2930` | Dropdowns, search bar, user card |
| Sidebar | `#18181B` | Sidebar bg |
| Border | `rgba(255,255,255,0.2)` | Header border |
| Border Subtle | `rgba(255,255,255,0.08)` | Table/toolbar borders |
| Primary | `#ECD7FF` | CTA, active states, accent |
| Success | `#A1E3CB` / `#84E787` | Approved, posted |
| Warning | `#FFE999` / `#E7E384` | Pending, active clients |
| Danger | `#FFB4AB` | Failed, overdue, review needed |
| Info | `#95A4FC` / `#B1E3FF` | In review, posted |

---

## 11. Mobile Responsiveness Standards

> Desktop-first but mobile-functional. All components MUST degrade gracefully.

### 11.1 Breakpoints
| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Base (mobile) | < 640px | Single column, stacked grids, hidden secondary labels |
| sm | ≥ 640px | Some labels appear, 2-col grids start |
| md | ≥ 768px | Sidebar visible (overlay), full toolbars, padding increases to 24px |
| lg | ≥ 1024px | Sidebar static, multi-column grids, all UI elements visible |
| xl | ≥ 1280px | Full desktop layout |

### 11.2 Sidebar
| State | Behavior |
|-------|----------|
| Mobile (< md) | Collapsed/overlay, triggered by hamburger or swipe |
| Desktop (≥ md) | Static 256px, collapsible to icon-only 64px |
| Search bar | Collapsed → icon only; Expanded → full 240×36 |

### 11.3 TopNav
| Element | Mobile | Desktop |
|---------|--------|---------|
| Tabs | Horizontal scroll (`overflow-x-auto`) | Full row (gap 30px) |
| "Ask Clips" label | Hidden | Visible |
| Icons | All visible (24px) | All visible (28px) |

### 11.4 Page Toolbars
| Element | Mobile | Desktop |
|---------|--------|---------|
| Page Header | 44px, px-3 | 52px, px-5 |
| Toolbar | Wraps, py-2, px-3 | Single row, 44px, px-5 |
| View Settings | Hidden | Visible |
| Import/Export | Hidden | Visible |
| Primary CTA label | Hidden (icon-only) | Visible |
| Sort & Filter bar | px-3 | px-5 |

### 11.5 Data Tables
| Feature | Mobile | Desktop |
|---------|--------|---------|
| Container | `overflow-x-auto` with touch scrolling | Full width |
| Min width | `min-w-[700px]` (scrollable) | Auto |
| Scrollbar | 4px height, translucent thumb | Standard |
| Footer | Stacks vertically | Single row |

### 11.6 Dashboard Grids
| Section | Mobile | Desktop |
|---------|--------|---------|
| Sales Overview stats | Single column | `lg:grid-cols-[1fr_1fr_460px]` |
| Production Overview | Single column, chart on top | `lg:grid-cols-[1fr_370px]` |
| Mini stat cards | 2-col grid, smaller values (28px) | 2-col grid, full values (40px) |
| Workspace 2-col sections | Stacked | `md:grid-cols-[1fr_1fr]` |
| Sales tab stat cards | 1-col → 2-col (sm) → 3-col (lg) | 3-col |
| Video review cards | Thumbnail hidden, smaller title | Full card with 103×103 thumbnail |
| Pipeline step cards | Horizontal scroll | Full row |

### 11.7 Typography Scaling
| Element | Mobile | Desktop |
|---------|--------|---------|
| Section heading | 20px | 26px |
| Stat value (large) | 28px | 40px |
| Stat value (medium) | 20px | 30px |
| Video review title | 16px | 22px |
