# ClipsOS V2 — Style Theme

> Source of truth for frontend. Extracted from Figma CSS. Implementation: `src/styles.css`

## §1 Colors (Dual Theme — Light + Dark)

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#131314` | Page bg |
| `--surface` | `#1C1B1C` | Section panels |
| `--surface-card` | `#1E1C1D` | Card bg |
| `--surface-card-2` | `#201F20` | Alt cards (projects) |
| `--sidebar` | `#18181B` | Sidebar bg |
| `--surface-raised` | `#2B2930` | Search, user card |
| `--surface-input` | `#36343B` | Active nav, buttons |
| `--surface-muted` | `#353436` | Progress tracks |

### Foreground
| Token | Value | Usage |
|-------|-------|-------|
| `--foreground` | `#FFFFFF` | Logos, headings |
| `--foreground-strong` | `#E5E2E3` | Primary text |
| `--foreground-muted` | `#CDC3D0` | Descriptions |
| `--foreground-subtle` | `rgba(229,226,227,0.6)` | Inactive nav |
| `--foreground-disabled` | `#939193` | Inactive tabs |
| `--label-uppercase` | `rgba(205,195,208,0.4)` | Section labels |

### Brand (Lavender)
| Token | Value |
|-------|-------|
| `--primary` | `#ECD7FF` |
| `--primary-foreground` | `#131314` |
| `--primary-glow` | `#D8B4FE` |
| `--primary-soft` | `rgba(236,215,255,0.1)` |

### Status
| Token | Hex | Usage |
|-------|-----|-------|
| `--status-success` | `#84E787` | Posted, complete |
| `--status-warning` | `#E7E384` | Scheduled, pending |
| `--status-danger` | `#FFB4AB` | Overdue, review-needed |
| `--status-info` | `#A3D2FF` | Info badges |

### Extra Accents
| Hex | Usage |
|-----|-------|
| `#E8FFBF` | Note titles, glow bars |
| `#C3AEF0` | Avatar initials |
| `#33FF00` | "Complete" badge |
| `#262626` | Inactive bars, avatar bg |
| `#ADAAAA` | Timestamps in notes |

### Table Status Badge Colors (Dot + Label — from My Videos)
| Status | Dot | Text |
|--------|-----|------|
| In Review | `#95A4FC` | `#8A8CD9` |
| Approved | `#A1E3CB` | `#4AA785` |
| Posted | `#B1E3FF` | `#59A8D4` |
| Pending | `#FFE999` | `#FFC555` |
| Draft | `rgba(255,255,255,0.4)` | `rgba(255,255,255,0.4)` |

### Table Row Styling
| Token | Value |
|-------|-------|
| Header text | `rgba(255,255,255,0.4)` 12px |
| Header border | `rgba(255,255,255,0.2)` |
| Row border | `rgba(255,255,255,0.05)` |
| Row height | 45px (header 40px) |
| Selected row bg | `#2B2930` |
| Cell text | `rgba(255,255,255,0.9)` 10-12px |
| Horizontal fade | `linear-gradient(270deg, #131314, transparent)` |

## §2 Typography

### Fonts
- **Display:** `Neue Haas Grotesk Display Pro`, fallback `Inter`
- **Body:** `Inter`, system-ui
- **Accent:** `Manrope` (journey day numbers)

### Scale
| Name | Size | Weight | Spacing | Usage |
|------|------|--------|---------|-------|
| display-xl | 40px | 500 | -0.4px | Big stat numbers |
| display-lg | 26px | 500 | -0.26px | Section headings |
| display-md | 22px | 500 | -0.22px | Panel headings |
| display-sm | 18px | 500 | -0.18px | Page name in topnav |
| body-lg | 14px | 500 | -0.35px | Nav items, tabs |
| body | 12px | 400 | — | Descriptions |
| caption | 10px | 400 | — | Timestamps |
| eyebrow | 10px | 600 | 1px | Section labels (UPPERCASE) |

### Logo: `//ClipsApp` — NHGDP Black 900, 26px, -0.03em, white

## §3 Spacing & Layout

- **Sidebar:** 256px fixed
- **Top nav:** 65px, bottom border `rgba(255,255,255,0.2)`
- **Content padding:** 30px from sidebar
- **Card gap:** 20px horizontal, 16px vertical
- **Radii:** 4/6/8/12/14/16/18/24px scale

### Borders
| Pattern | Value |
|---------|-------|
| Default | `rgba(255,255,255,0.08)` |
| Strong | `rgba(255,255,255,0.20)` |
| Active tab | 3px bottom `#ECD7FF` |
| Task left | 5px `#D8B4FE` |
| Avatar ring | 2px parent-bg |

## §4 Components (14 Primitives in `src/components/dashboard/`)

### StatCard
Card bg, title 12-14px, value 30-40px display, optional badge + sparkline + footer.
**Progress bar is opt-in** — only renders when `percent` prop is explicitly provided and > 0. Summary metric cards (Calls Today, Pipeline Value, etc.) do NOT show bars.

### SparklineBar
Gradient opacity bars. Colors: accent (lavender), success (yellow).

### PipelineStepCard
Smart wrapper around StatCard — label, big 40px count. **"Total Videos" (percent=0) → no bar.** Status stages (percent > 0) → unified accent-colored bar. No per-stage color overrides.

### TaskCard
Left border 5px via `var(--primary-glow)` (platform accent). CSS-driven light/dark modes:
- **Light mode**: transparent bg, `border: 1px solid rgba(0,0,0,0.1)`, accent left border
- **Dark mode**: `surface-card` bg, no outline, accent left border
Badge variants: complete/client/warning/danger. Styled via `.task-card` and `.task-card-badge` CSS classes in `styles.css`.

### ProjectCard
Title, avatar stack (-8px overlap, 32px circles), gradient progress bar, status pill.

### NotificationRow
40px icon box + title + description + action buttons. Variants: danger/accent/warning.

### ActivityRow
Icon + heading + subtext + right-aligned amount/timestamp. Bg `--surface`.

### DashboardPanel
Scrollable panel with mesh blur, heading, filter pills, content slot.

### FilterPills
Rounded pills — active: filled primary, inactive: bordered `#3C3C3C`.

### SectionLabel
Eyebrow uppercase header, optional collapse chevron.

### JourneyEventCard
Date block (yellow month + bold day) | event title + subtitle. Right border divider.

### GrowthChart
Total views headline, 7 bars (dark inactive, last 2 glow), platform breakdown row.

### NoteCard
Obsidian style — avatar header, lime-green title, body, progress dots, footer with author.

### ProgressRow
Labeled progress bar with left label, right value, colored fill.

## §5 Effects

### Mesh Blur
`rgba(255,180,171,0.05)` + `blur(32px)` — offset glow in alert panels.

### Gradient Bar
`linear-gradient(90deg, #ECD7FF, #D8B4FE)` — progress bars.

### Glow Bars
Accent: `box-shadow: 0 0 15px rgba(209,188,255,0.3)`
Success: `box-shadow: 0 0 15px rgba(232,255,191,0.3)`

## §6 Interactions
- Card hover: bg shift `surface-card → surface-card-2`
- Button hover: opacity 0.8
- Active tab: 3px `#ECD7FF` bottom + text color match
- Note card hover: `scale(1.01)`
- Progress bars: `transition-all 500ms`
- **Stat cards are STATIC** — no live animations
