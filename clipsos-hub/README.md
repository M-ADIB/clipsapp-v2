# ClipsOS Hub

> The Clips Agency — Internal Operations Dashboard (V2)

## Tech Stack

| Layer              | Technology                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| **Frontend**       | React 19 + Vite 7 + TypeScript (strict)                                                            |
| **Styling**        | Tailwind CSS 4 (`@theme inline`) + shadcn/ui (Radix)                                               |
| **Routing**        | TanStack Router v1 (file-based)                                                                    |
| **Server State**   | TanStack Query v5                                                                                  |
| **Auth**           | Supabase Auth (role-based: owner, manager, senior_editor, editor, content_creator, closer, client) |
| **Database**       | PostgreSQL 17 via Supabase                                                                         |
| **Storage**        | Supabase Storage + Cloudflare R2                                                                   |
| **Video**          | Cloudflare Stream                                                                                  |
| **Edge Functions** | Supabase Deno Edge Functions                                                                       |

## Supabase Project

- **Project ID**: `toyekrhhzqmltstrycdv`
- **Region**: `ap-southeast-1`
- **DB Host**: `db.toyekrhhzqmltstrycdv.supabase.co`

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

## Project Structure

```
src/
├── components/
│   ├── app-shell/      # Sidebar, TopNav, NotificationsPopover
│   ├── chat/           # Real-time chat system
│   ├── dashboards/     # Role-specific dashboard pages
│   ├── forms/          # Form builder module
│   ├── grid/           # VideosGrid (AG Grid based)
│   ├── mentions/       # Universal @mention system
│   ├── projects/       # Project builder & journey
│   ├── shared/         # Reusable components
│   ├── sharing/        # Video share links
│   ├── templates/      # Project type templates
│   ├── ui/             # shadcn/ui primitives
│   └── video/          # Video preview & player
├── contexts/           # AuthContext, WorkspaceContext
├── hooks/              # TanStack Query data hooks
├── integrations/       # Supabase client & types
├── lib/                # Utilities
├── routes/             # TanStack Router file-based routes
└── styles.css          # Global design tokens (OKLCH)

scripts/                # Migration & import scripts
memory-bank/            # Agent context files
docs/                   # PRD, permissions matrix, schema
```

## Agent Configuration

All AI agents working on this project must read `AGENTS.md` before writing code.
It contains architecture rules, naming conventions, security requirements, and verification protocols.

- **AGENTS.md** — Master directive (all agents)
- **memory-bank/** — Project context for agent continuity
- **docs/** — PRD, permissions matrix, database schema reference
