# ClipsOS V2 — Wireframes & Page Structure

> Page-by-page layout specs for all role dashboards. Reference for frontend agents building the UI.

## 1. Layout Shell (All Roles)

```
┌────────────────────────────────────────────────────────────────┐
│ TopNav: Logo | Global Search | Notifications Bell | User Menu │
├──────────┬─────────────────────────────────────────────────────┤
│          │                                                     │
│ Sidebar  │  Page Content Area                                  │
│ (role-   │  ┌─────────────────────────────────────────────────┐│
│  aware)  │  │ PageShell: Breadcrumb + Title + Actions         ││
│          │  ├─────────────────────────────────────────────────┤│
│ ┌──────┐ │  │ Tabs / Filters Bar                             ││
│ │ Nav  │ │  ├─────────────────────────────────────────────────┤│
│ │Items │ │  │                                                 ││
│ │      │ │  │  Content (DataTable / Kanban / Cards / Form)    ││
│ │      │ │  │                                                 ││
│ └──────┘ │  │                                                 ││
│          │  └─────────────────────────────────────────────────┘│
└──────────┴─────────────────────────────────────────────────────┘
```

## 2. Owner Dashboard (`/owner/dashboard`)

### 2.1 Three-Tab Layout
```
┌─ Production ─┬─ Sales ─┬─ Finance ─┐
```

### 2.2 Production Tab
```
┌─────────────────────────────────────────────┐
│ Stats Row: [Active Clients] [Videos MTD]    │
│            [In Pipeline] [Approval Rate]    │
├─────────────────────┬───────────────────────┤
│ Your Attention      │ Pipeline by Status    │
│ • Starred projects  │ (horizontal bar)      │
│ • Overdue items     │                       │
│ • Awaiting action   │                       │
├─────────────────────┼───────────────────────┤
│ Recent Activity     │ Editor Productivity   │
│ (timeline feed)     │ (sparkline cards)     │
└─────────────────────┴───────────────────────┘
```

### 2.3 Sales Tab
```
┌─────────────────────────────────────────────┐
│ Stats Row: [Leads MTD] [Calls Booked]       │
│            [Deal Value] [Win Rate]          │
├─────────────────────┬───────────────────────┤
│ Pipeline Mini       │ Recent Deals          │
│ (stage counts)      │ (card list)           │
├─────────────────────┼───────────────────────┤
│ Upcoming Calls      │ Closer Leaderboard    │
│ (calendar widget)   │ (bar chart)           │
└─────────────────────┴───────────────────────┘
```

### 2.4 Finance Tab (Owner Only)
```
┌─────────────────────────────────────────────┐
│ Stats Row: [Revenue MTD] [MRR] [Expenses]   │
│            [Net Profit] [Churn Rate]        │
├─────────────────────┬───────────────────────┤
│ Revenue Chart       │ Expense Breakdown     │
│ (area chart, 12mo)  │ (donut chart)         │
├─────────────────────┼───────────────────────┤
│ Recent Payments     │ Upcoming Renewals     │
│ (table widget)      │ (timeline)            │
└─────────────────────┴───────────────────────┘
```

## 3. Workspaces Page (`/{role}/clients`)

```
┌──────────────────────────────────────────────────┐
│ PageShell: "Workspaces" | [+ New Workspace] btn  │
├──────────────────────────────────────────────────┤
│ Filter Bar: Search | Type [All▾] | Status [All▾] │
│             Account Manager [All▾] | Sort [▾]    │
├──────────────────────────────────────────────────┤
│ DataTable                                        │
│ ┌──┬─────────┬──────┬────────┬────────┬─────────┐│
│ │☐ │ Name    │ Type │ Status │ Videos │ Manager ││
│ ├──┼─────────┼──────┼────────┼────────┼─────────┤│
│ │  │ Acme Co │ Co.  │Active  │ 42     │ Sarah   ││
│ │  │ Dr. Ali │ Ind. │Active  │ 18     │ John    ││
│ └──┴─────────┴──────┴────────┴────────┴─────────┘│
│ Pagination: ‹ 1 2 3 ... 12 ›                    │
└──────────────────────────────────────────────────┘
```

## 4. Workspace Detail (`/{role}/clients/:id`)

### 4.1 Header
```
┌──────────────────────────────────────────────────┐
│ [Avatar] Client Name    workspace_type badge     │
│ Account Status badge    Created: Jan 2026        │
│ [Edit] [Chat] [Invite] [⚙ Settings]            │
├──────────────────────────────────────────────────┤
│ Tabs: Overview | Projects | Members | Journey |  │
│       Files | Info | Chat | Settings             │
└──────────────────────────────────────────────────┘
```

### 4.2 Overview Tab
```
Stats Row → Projects List → Recent Videos → Activity Feed
```

## 5. Video Pipeline (`/{role}/pipeline`)

```
Kanban layout:
┌──────────┬──────────┬──────────┬──────────┬──────┐
│ New (12) │ In Prog  │ Rough    │ Final    │ ...  │
│          │ (8)      │ Cut (5)  │ Review(3)│      │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │          │      │
│ │Card  │ │ │Card  │ │ │Card  │ │          │      │
│ │title │ │ │title │ │ │title │ │          │      │
│ │editor│ │ │editor│ │ │client│ │          │      │
│ │due   │ │ │due   │ │ │due   │ │          │      │
│ └──────┘ │ └──────┘ │ └──────┘ │          │      │
└──────────┴──────────┴──────────┴──────────┴──────┘
```

## 6. CRM Deals Kanban (`/{role}/crm/deals`)

```
Same Kanban pattern as Pipeline, but columns = deal_stages
Card: [Avatar] Deal Name | Plan | Total Videos | Owner
```

## 7. Video Review Player (`/review/:videoId`)

```
┌──────────────────────────────────────────────────┐
│ ┌────────────────────────────┬──────────────────┐ │
│ │                            │ Version Selector │ │
│ │     Video Player           │ V1 V2 V3        │ │
│ │     (Cloudflare Stream)    ├──────────────────┤ │
│ │                            │ Comments Panel   │ │
│ │                            │ ┌──────────────┐ │ │
│ │     [Annotation Layer]     │ │ @user 0:12   │ │ │
│ │                            │ │ "Fix the..."  │ │ │
│ ├──────[seek bar]────────────┤ │              │ │ │
│ │ ▶ 0:12 / 0:45  [⬛] [🔊] │ │ @guest 0:30  │ │ │
│ │                            │ │ "Love this!" │ │ │
│ │ [📝] [🖊] [↗] [⤓]       │ └──────────────┘ │ │
│ └────────────────────────────┤ [Add Comment]   │ │
│                              │ [Approve][Revise]│ │
│                              └──────────────────┘ │
└──────────────────────────────────────────────────┘
```

## 8. Client Dashboard (`/client/dashboard`)

```
┌──────────────────────────────────────────────────┐
│ Hero Card: "Welcome back, [Name]!"               │
│ [X videos ready for review] [Next delivery: Fri] │
├──────────────────────────────────────────────────┤
│ Your Attention                                   │
│ • 3 videos awaiting your review                  │
│ • Onboarding: 12/16 complete                     │
├──────────────────────────────────────────────────┤
│ This Week's Delivery                             │
│ [Video Card] [Video Card] [Video Card]           │
├──────────────────────────────────────────────────┤
│ Quick Links: [Chat] [Files] [My Team] [Settings] │
└──────────────────────────────────────────────────┘
```

## 9. Closer Dashboard (`/closer/dashboard`)

```
┌──────────────────────────────────────────────────┐
│ Stats: [My Leads] [My Deals $] [Calls Today]     │
├──────────────────────┬───────────────────────────┤
│ Today's Schedule     │ Pipeline Summary          │
│ (calendar day view)  │ (stage counts + values)   │
├──────────────────────┼───────────────────────────┤
│ Follow-ups Due       │ Recent Activity           │
│ (sorted by urgency)  │ (feed)                    │
└──────────────────────┴───────────────────────────┘
```

## 10. Sidebar Navigation (Per Role)

### Owner/Manager
```
Dashboard
─── PRODUCTION
Workspaces
Projects
Videos
Pipeline
─── SALES & CRM
Leads
CRM ▾ (People, Companies, Deals, Calls, Editors)
Partnerships
─── CONTENT
Studio
Email Hub
─── TEAM
Tasks
Workboard
Editor Productivity
─── ANALYTICS
Analytics
Agency Growth
─── FINANCE (Owner only)
Finance
─── ADMIN
User Management
Management ▾ (Statuses, Roles, Video Types, Deal Stages, Templates, AI, Branding)
Credentials
Settings
```

### Editor
```
Dashboard
My Projects
My Videos
Workboard
Tasks
My Performance
Inspiration
Chat
Notifications
Settings
```

### Client
```
Home
My Videos
Posting Queue
Analytics
Files
My Team
Chat
Settings
```

### Closer
```
Dashboard
Leads
Schedule
Follow-ups
Pipeline
Calls
People / Companies
Settings
```
