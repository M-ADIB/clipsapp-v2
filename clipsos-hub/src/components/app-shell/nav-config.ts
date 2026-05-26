/**
 * Role-driven navigation config. Single source of truth for which links
 * each role sees. Keep in sync with docs/PERMISSIONS-MATRIX.md.
 * Visibility only — RLS at the DB enforces real access.
 *
 * NOTE: Notifications are NOT in any sidebar — they're accessed via the
 * bell icon in TopNav. Every role has Settings for personal profile,
 * theme, password, etc.
 */
import {
  LayoutDashboard,
  Users,
  Video,
  Calendar,
  DollarSign,
  Settings,
  ListTodo,
  Briefcase,
  MessageSquare,
  FolderOpen,
  Building2,
  Layers,
  Clapperboard,
  Mail,
  TrendingUp,
  FileText,
  Send,
  Shield,
  CreditCard,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/integrations/supabase/db-types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Key for dynamic badge data — sidebar matches this to unread counts */
  badgeKey?: "team-chat" | "client-chats";
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/* ── Owner — Full access ─────────────────────────────────────── */

const owner: NavSection[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", to: "/owner", icon: LayoutDashboard },
      { label: "Tasks", to: "/owner/tasks", icon: ListTodo },
    ],
  },
  {
    label: "Production",
    items: [
      { label: "HQ", to: "/owner/hq", icon: Building2 },
      { label: "Clients", to: "/owner/clients", icon: Users },
      { label: "Projects", to: "/owner/projects", icon: Layers },
      { label: "Videos", to: "/owner/videos", icon: Video },
      { label: "Studio", to: "/owner/studio", icon: Clapperboard },
    ],
  },
  {
    label: "Sales & Finance",
    items: [
      { label: "CRM", to: "/owner/crm", icon: Briefcase },
      { label: "Sales", to: "/owner/sales", icon: TrendingUp },
      { label: "Schedule", to: "/owner/schedule", icon: Calendar },
      { label: "Finance", to: "/owner/finance", icon: DollarSign },
      { label: "Forms", to: "/owner/forms", icon: FileText },
      { label: "Analytics", to: "/owner/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Team Chat", to: "/owner/team-chat", icon: Users, badgeKey: "team-chat" as const },
      {
        label: "Client Chats",
        to: "/owner/client-chats",
        icon: MessageSquare,
        badgeKey: "client-chats" as const,
      },
      { label: "Email Hub", to: "/owner/email-hub", icon: Mail },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Team", to: "/owner/team", icon: Users },
      { label: "App Settings", to: "/owner/settings", icon: Settings },
    ],
  },
];

/* ── Manager — Everything except Finance ─────────────────────── */

const manager: NavSection[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", to: "/manager", icon: LayoutDashboard },
      { label: "Tasks", to: "/manager/tasks", icon: ListTodo },
    ],
  },
  {
    label: "Production",
    items: [
      { label: "HQ", to: "/manager/hq", icon: Building2 },
      { label: "Clients", to: "/manager/clients", icon: Users },
      { label: "Projects", to: "/manager/projects", icon: Layers },
      { label: "Videos", to: "/manager/videos", icon: Video },
      { label: "Studio", to: "/manager/studio", icon: Clapperboard },
    ],
  },
  {
    label: "Sales & Finance",
    items: [
      { label: "CRM", to: "/manager/crm", icon: Briefcase },
      { label: "Sales", to: "/manager/sales", icon: TrendingUp },
      { label: "Schedule", to: "/manager/schedule", icon: Calendar },
      { label: "Forms", to: "/manager/forms", icon: FileText },
      { label: "Analytics", to: "/manager/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Team Chat", to: "/manager/team-chat", icon: Users, badgeKey: "team-chat" as const },
      {
        label: "Client Chats",
        to: "/manager/client-chats",
        icon: MessageSquare,
        badgeKey: "client-chats" as const,
      },
      { label: "Email Hub", to: "/manager/email-hub", icon: Mail },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Team", to: "/manager/team", icon: Users },
      { label: "Settings", to: "/manager/settings", icon: Settings },
    ],
  },
];

/* ── Senior Editor — Production focus ────────────────────────── */

const senior_editor: NavSection[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", to: "/senior-editor", icon: LayoutDashboard },
      { label: "Tasks", to: "/senior-editor/tasks", icon: ListTodo },
    ],
  },
  {
    label: "Production",
    items: [
      { label: "Clients", to: "/senior-editor/clients", icon: Users },
      { label: "Projects", to: "/senior-editor/projects", icon: Layers },
      { label: "Videos", to: "/senior-editor/videos", icon: Video },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        label: "Team Chat",
        to: "/senior-editor/team-chat",
        icon: Users,
        badgeKey: "team-chat" as const,
      },
      {
        label: "Client Chats",
        to: "/senior-editor/client-chats",
        icon: MessageSquare,
        badgeKey: "client-chats" as const,
      },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", to: "/senior-editor/settings", icon: Settings }],
  },
];

/* ── Editor — Task-focused, assigned work only ───────────────── */

const editor: NavSection[] = [
  {
    label: "My Work",
    items: [
      { label: "Tasks", to: "/editor", icon: ListTodo },
      { label: "Videos", to: "/editor/videos", icon: Video },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Team Chat", to: "/editor/team-chat", icon: Users, badgeKey: "team-chat" as const },
      {
        label: "Client Chats",
        to: "/editor/client-chats",
        icon: MessageSquare,
        badgeKey: "client-chats" as const,
      },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", to: "/editor/settings", icon: Settings }],
  },
];

/* ── Content Creator — Content studio focus ──────────────────── */

const content_creator: NavSection[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", to: "/content-creator", icon: LayoutDashboard },
      { label: "Schedule", to: "/content-creator/schedule", icon: Calendar },
      { label: "Tasks", to: "/content-creator/tasks", icon: ListTodo },
    ],
  },
  {
    label: "Production",
    items: [
      { label: "Clients", to: "/content-creator/clients", icon: Users },
      { label: "Videos", to: "/content-creator/videos", icon: Video },
      { label: "Studio", to: "/content-creator/studio", icon: Clapperboard },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        label: "Team Chat",
        to: "/content-creator/team-chat",
        icon: Users,
        badgeKey: "team-chat" as const,
      },
      {
        label: "Client Chats",
        to: "/content-creator/client-chats",
        icon: MessageSquare,
        badgeKey: "client-chats" as const,
      },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", to: "/content-creator/settings", icon: Settings }],
  },
];

/* ── Moderator — Posting focus ───────────────────────────────── */

const moderator: NavSection[] = [
  {
    label: "Posting",
    items: [{ label: "Posting Queue", to: "/moderator", icon: Send }],
  },
  {
    label: "Communication",
    items: [
      {
        label: "Client Chats",
        to: "/moderator/client-chats",
        icon: MessageSquare,
        badgeKey: "client-chats" as const,
      },
      {
        label: "Team Chat",
        to: "/moderator/team-chat",
        icon: MessageSquare,
        badgeKey: "team-chat" as const,
      },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", to: "/moderator/settings", icon: Settings }],
  },
];

/* ── Closer — Sales focus ────────────────────────────────────── */

const closer: NavSection[] = [
  {
    label: "Sales",
    items: [
      { label: "Dashboard", to: "/closer", icon: LayoutDashboard },
      { label: "Pipeline", to: "/closer/pipeline", icon: DollarSign },
      { label: "Calls", to: "/closer/calls", icon: Calendar },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Team Chat", to: "/closer/team-chat", icon: Users, badgeKey: "team-chat" as const },
      {
        label: "Client Chats",
        to: "/closer/client-chats",
        icon: MessageSquare,
        badgeKey: "client-chats" as const,
      },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", to: "/closer/settings", icon: Settings }],
  },
];

/* ── Client — Own workspace only ─────────────────────────────── */

const client: NavSection[] = [
  {
    label: "Main",
    items: [
      { label: "Home", to: "/client", icon: LayoutDashboard },
      { label: "Videos", to: "/client/videos", icon: Video },
      { label: "Posting Queue", to: "/client/queue", icon: Calendar },
      { label: "Chat", to: "/client/chat", icon: MessageSquare },
    ],
  },
];

/* ── Role → Nav mapping ──────────────────────────────────────── */

const NAV_BY_ROLE: Record<AppRole, NavSection[]> = {
  owner,
  manager,
  senior_editor,
  content_creator,
  editor,
  moderator,
  closer,
  client,
};

export function getNavForRole(role: AppRole | null, options?: { isFoundationReady?: boolean }): NavSection[] {
  if (!role) return [];
  const baseNav = NAV_BY_ROLE[role] ?? [];
  if (role === "client" && options?.isFoundationReady) {
    return baseNav.map(sec => {
      if (sec.label === "Main") {
        const hasStudio = sec.items.some(item => item.to === "/client/studio");
        if (!hasStudio) {
          return {
            ...sec,
            items: [
              ...sec.items.slice(0, 1), // after Home
              { label: "Studio", to: "/client/studio", icon: Clapperboard },
              ...sec.items.slice(1) // rest (Videos, Chat)
            ]
          };
        }
      }
      return sec;
    });
  }
  return baseNav;
}

/* ── Platform Admin Nav (cross-tenant super admin) ──────────── */

const platformNav: NavSection[] = [
  {
    label: "Platform",
    items: [
      { label: "Overview", to: "/platform", icon: Shield },
      { label: "Tenants", to: "/platform/tenants", icon: Building2 },
      { label: "Billing", to: "/platform/billing", icon: CreditCard },
      { label: "Settings", to: "/platform/settings", icon: Settings },
    ],
  },
];

/**
 * Returns the Platform Admin nav section.
 * Only shown to users in the `platform_admins` table.
 */
export function getPlatformNav(): NavSection[] {
  return platformNav;
}
