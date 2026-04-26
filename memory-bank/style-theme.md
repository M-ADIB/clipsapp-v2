# ClipsOS V2 — Style Theme & Design System

> This document defines the visual identity, color system, typography, spacing, and component aesthetics for the ClipsOS V2 frontend. Lovable/frontend agents MUST reference this file for all UI decisions.

## 1. Brand Identity

| Property | Value |
|----------|-------|
| **App Name** | ClipsOS (internal), TheClips (client-facing) |
| **Brand Personality** | Premium, modern, professional agency OS |
| **Design Philosophy** | Dark-first, glassmorphism accents, vibrant accent colors, smooth micro-animations |
| **Target Feel** | Notion meets Linear meets Frame.io — clean, dense, fast |

## 2. Color System

### 2.1 Dark Theme (Primary)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0A0A0F` | App background |
| `--bg-secondary` | `#111118` | Cards, panels |
| `--bg-tertiary` | `#1A1A24` | Sidebar, nav |
| `--bg-elevated` | `#22222E` | Hover states, modals |
| `--bg-glass` | `rgba(17,17,24,0.8)` | Glassmorphism overlays |
| `--border-default` | `rgba(255,255,255,0.06)` | Subtle borders |
| `--border-hover` | `rgba(255,255,255,0.12)` | Hover borders |

### 2.2 Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#F5F5F7` | Headings, primary text |
| `--text-secondary` | `#A1A1AA` | Descriptions, labels |
| `--text-tertiary` | `#71717A` | Timestamps, metadata |
| `--text-muted` | `#52525B` | Disabled states |

### 2.3 Accent / Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-primary` | `#E91E63` | Primary CTA, active nav, brand pink |
| `--accent-primary-hover` | `#F06292` | Hover state |
| `--accent-primary-glow` | `rgba(233,30,99,0.25)` | Glow effects |
| `--accent-blue` | `#3B82F6` | Links, info states |
| `--accent-green` | `#10B981` | Success, approved |
| `--accent-amber` | `#F59E0B` | Warning, pending |
| `--accent-red` | `#EF4444` | Error, declined |
| `--accent-purple` | `#8B5CF6` | Tags, categories |

### 2.4 Status Colors (Maps to Modular Statuses)

| Status | Color | Hex |
|--------|-------|-----|
| New | Slate | `#64748B` |
| In Progress | Blue | `#3B82F6` |
| Rough Cut | Amber | `#F59E0B` |
| Internal Review | Purple | `#8B5CF6` |
| Final Review | Pink | `#EC4899` |
| Approved | Green | `#10B981` |
| Scheduled | Cyan | `#06B6D4` |
| Posted | Emerald | `#059669` |
| Revisions Requested | Orange | `#F97316` |
| Cancelled | Red | `#EF4444` |
| Archived | Gray | `#6B7280` |

## 3. Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| **Headings (H1)** | Inter | 28px | 700 | 1.2 |
| **Headings (H2)** | Inter | 22px | 600 | 1.3 |
| **Headings (H3)** | Inter | 18px | 600 | 1.3 |
| **Body** | Inter | 14px | 400 | 1.5 |
| **Body Small** | Inter | 13px | 400 | 1.5 |
| **Caption** | Inter | 12px | 400 | 1.4 |
| **Mono/Code** | JetBrains Mono | 13px | 400 | 1.5 |
| **Numbers/Stats** | Inter | 32px | 700 | 1.1 |

**Font loading:** Google Fonts — `Inter:400,500,600,700` + `JetBrains Mono:400`

## 4. Spacing Scale

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

## 5. Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 8px |
| Cards | 12px |
| Modals / Dialogs | 16px |
| Badges / Status Pills | 9999px (full) |
| Avatars | 9999px (circle) |
| Input Fields | 8px |

## 6. Shadows & Effects

| Effect | Value |
|--------|-------|
| **Card shadow** | `0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)` |
| **Elevated shadow** | `0 10px 25px rgba(0,0,0,0.5)` |
| **Glass backdrop** | `backdrop-filter: blur(16px)` |
| **Glow (accent)** | `box-shadow: 0 0 20px var(--accent-primary-glow)` |
| **Focus ring** | `0 0 0 2px var(--accent-primary), 0 0 0 4px rgba(233,30,99,0.2)` |

## 7. Animation Tokens

| Animation | Duration | Easing |
|-----------|----------|--------|
| **Hover transition** | 150ms | `ease-out` |
| **Page transition** | 200ms | `ease-in-out` |
| **Modal enter** | 250ms | `cubic-bezier(0.16,1,0.3,1)` |
| **Skeleton pulse** | 1.5s | `ease-in-out` (infinite) |
| **Toast slide-in** | 300ms | `cubic-bezier(0.16,1,0.3,1)` |

## 8. Component Patterns

### 8.1 Sidebar
- Width: 260px collapsed to 72px
- Dark bg (`--bg-tertiary`), subtle border-right
- Role-aware navigation items
- Active item: pink left border + highlighted bg
- Collapse animation: 200ms ease

### 8.2 Data Tables
- Sticky header, zebra rows on hover
- Sortable columns with up/down arrows
- Inline edit capability
- Row actions (kebab menu)
- Pagination: "Showing X–Y of Z"
- Column resizing and reordering

### 8.3 Kanban Boards
- Drag-and-drop cards between columns
- Column headers with count badges
- Cards: avatar, title, metadata row, status badge
- Smooth card transition animations

### 8.4 Status Badges
- Pill-shaped, colored by status lookup table
- Tiny dot indicator + text label
- Size variants: sm (table), md (card), lg (detail header)

### 8.5 Buttons
- Primary: filled accent-primary, white text
- Secondary: outlined, border + text
- Ghost: no border, text only
- Destructive: red variant
- All: 8px radius, 150ms hover transition, subtle glow on primary

### 8.6 Video Player
- Cloudflare Stream embed (HLS)
- Custom controls overlay
- Timestamp comment markers on seek bar
- Annotation drawing layer
- Version selector dropdown

## 9. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640–1024px | Collapsed sidebar, 2-col |
| Desktop | 1024–1440px | Full sidebar, 3-col |
| Wide | > 1440px | Full sidebar, 4-col grids |

## 10. Figma Reference

The complete design system lives in Figma. Lovable should pull from Figma MCP for exact component specs. This file is the code-side reference that ensures consistency when Figma is not available.
