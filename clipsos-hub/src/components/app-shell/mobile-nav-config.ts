/**
 * mobile-nav-config.ts — Per-role mobile bottom tab bar configuration.
 *
 * Kept separate from nav-config.ts (sidebar) because mobile bottom tabs
 * are curated for thumb-accessibility — max 5 tabs — not a 1:1 mirror
 * of the sidebar.
 *
 * Items that don't fit in the bottom bar are exposed through the "More"
 * drawer, which reuses sections from nav-config.ts.
 */
import {
  LayoutDashboard,
  Users,
  Video,
  MessageSquare,
  MoreHorizontal,
  ListTodo,
  Calendar,
  DollarSign,
  Layers,
  FolderOpen,
  Send,
  Home,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/integrations/supabase/db-types";
import { getNavForRole, type NavSection } from "./nav-config";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface MobileTab {
  label: string;
  icon: LucideIcon;
  to: string;
  /** When true, this tab opens the "More" drawer instead of navigating */
  isMore?: boolean;
  /** Key for dynamic badge data (mirrors sidebar badgeKey) */
  badgeKey?: string;
}

export interface MobileNavConfig {
  /** Tabs shown in the fixed bottom bar (max 5) */
  bottomTabs: MobileTab[];
  /** Nav sections shown in the "More" drawer — auto-computed from sidebar */
  moreSections: NavSection[];
}

/* ------------------------------------------------------------------ */
/* Per-role bottom tab definitions                                    */
/* ------------------------------------------------------------------ */

const MORE_TAB: MobileTab = {
  label: "More",
  icon: MoreHorizontal,
  to: "",
  isMore: true,
};

const ownerTabs: MobileTab[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/owner" },
  { label: "Clients", icon: Users, to: "/owner/clients" },
  { label: "Videos", icon: Video, to: "/owner/videos" },
  { label: "Chat", icon: MessageSquare, to: "/owner/team-chat", badgeKey: "team-chat" },
  MORE_TAB,
];

const managerTabs: MobileTab[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/manager" },
  { label: "Clients", icon: Users, to: "/manager/clients" },
  { label: "Videos", icon: Video, to: "/manager/videos" },
  { label: "Chat", icon: MessageSquare, to: "/manager/team-chat", badgeKey: "team-chat" },
  MORE_TAB,
];

const seniorEditorTabs: MobileTab[] = [
  { label: "Board", icon: Layers, to: "/senior-editor" },
  { label: "Videos", icon: Video, to: "/senior-editor/videos" },
  { label: "Clients", icon: Users, to: "/senior-editor/clients" },
  { label: "Chat", icon: MessageSquare, to: "/senior-editor/team-chat", badgeKey: "team-chat" },
  MORE_TAB,
];

const contentCreatorTabs: MobileTab[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/content-creator" },
  { label: "Videos", icon: Video, to: "/content-creator/videos" },
  { label: "Clients", icon: Users, to: "/content-creator/clients" },
  { label: "Chat", icon: MessageSquare, to: "/content-creator/team-chat", badgeKey: "team-chat" },
];

const editorTabs: MobileTab[] = [
  { label: "Tasks", icon: ListTodo, to: "/editor" },
  { label: "Videos", icon: Video, to: "/editor/videos" },
  { label: "Chat", icon: MessageSquare, to: "/editor/team-chat", badgeKey: "team-chat" },
];

const closerTabs: MobileTab[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/closer" },
  { label: "Pipeline", icon: DollarSign, to: "/closer/pipeline" },
  { label: "Calls", icon: Calendar, to: "/closer/calls" },
  { label: "Chat", icon: MessageSquare, to: "/closer/team-chat", badgeKey: "team-chat" },
];

const clientTabs: MobileTab[] = [
  { label: "Home", icon: Home, to: "/client" },
  { label: "My Videos", icon: Video, to: "/client/videos" },
  { label: "Chat", icon: MessageSquare, to: "/client/chat" },
  { label: "Files", icon: FolderOpen, to: "/client/files" },
];

const moderatorTabs: MobileTab[] = [
  { label: "Queue", icon: Send, to: "/moderator" },
  { label: "Chat", icon: MessageSquare, to: "/moderator/client-chats", badgeKey: "client-chats" },
];

/* ------------------------------------------------------------------ */
/* Mapping                                                            */
/* ------------------------------------------------------------------ */

const MOBILE_TABS_BY_ROLE: Record<AppRole, MobileTab[]> = {
  owner: ownerTabs,
  manager: managerTabs,
  senior_editor: seniorEditorTabs,
  content_creator: contentCreatorTabs,
  editor: editorTabs,
  moderator: moderatorTabs,
  closer: closerTabs,
  client: clientTabs,
};

export function getMobileNavForRole(role: AppRole | null, options?: { isFoundationReady?: boolean }): MobileNavConfig {
  if (!role) return { bottomTabs: [], moreSections: [] };

  const baseTabs = MOBILE_TABS_BY_ROLE[role] ?? [];
  let bottomTabs = [...baseTabs];

  if (role === "client" && options?.isFoundationReady) {
    const hasStudio = bottomTabs.some((t) => t.to === "/client/studio");
    if (!hasStudio) {
      // Let's insert Studio at index 2 (middle tab)
      bottomTabs = [
        { label: "Home", icon: Home, to: "/client" },
        { label: "My Videos", icon: Video, to: "/client/videos" },
        { label: "Studio", icon: Clapperboard, to: "/client/studio" },
        { label: "Chat", icon: MessageSquare, to: "/client/chat" },
        { label: "Files", icon: FolderOpen, to: "/client/files" },
      ];
    }
  }

  const sidebarSections = getNavForRole(role, options);

  // Routes already covered by bottom tabs (excluding "More")
  const bottomRoutes = new Set(bottomTabs.filter((t) => !t.isMore).map((t) => t.to));

  // Build "More" sections — only include items not in the bottom bar
  const moreSections: NavSection[] = sidebarSections
    .map((section) => ({
      label: section.label,
      items: section.items.filter((item) => !bottomRoutes.has(item.to)),
    }))
    .filter((section) => section.items.length > 0);

  return { bottomTabs, moreSections };
}
