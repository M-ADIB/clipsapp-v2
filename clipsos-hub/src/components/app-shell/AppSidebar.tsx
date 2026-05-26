/**
 * AppSidebar — role-aware navigation. Link list comes from
 * `getNavForRole(role)` so an Editor never sees Owner-only routes.
 * Visibility only — RLS enforces actual access.
 *
 * Features:
 * - Collapsible sections with chevron toggle (persisted in localStorage)
 * - Clean collapsed state: no logo text, properly sized search icon
 * - Dashboard tab exact-match to avoid always-active bug
 */
import { useState, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut, Search, Settings, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { ROLE_LABEL } from "@/integrations/supabase/db-types";
import { getNavForRole, getPlatformNav } from "./nav-config";
import { useSidebarUnreadCounts } from "@/hooks/use-chat";
import { useChatRealtimeGlobalBadges } from "@/hooks/use-chat-realtime";
import { useClientFoundationReady } from "@/hooks/use-clients";

/* ── Helpers ─────────────────────────────────────────────────────── */

const LS_KEY = "clipsos-sidebar-collapsed-sections";

/** Read persisted collapsed sections from localStorage */
function readCollapsed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Write collapsed state to localStorage */
function writeCollapsed(state: Record<string, boolean>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded — ignore */
  }
}

/**
 * Determines if a nav item is the "active" one.
 * Root dashboard routes use EXACT match so they don't stay lit for every sub-page.
 */
function isNavActive(pathname: string, itemTo: string): boolean {
  if (pathname === itemTo) return true;
  const segments = itemTo.split("/").filter(Boolean);
  if (segments.length === 1) return false;
  return pathname.startsWith(itemTo + "/");
}

/* ── Component ───────────────────────────────────────────────────── */

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const auth = useAuth();
  const branding = useBranding();
  const navigate = useNavigate();

  const { isReady: isFoundationReady } = useClientFoundationReady();
  const sections = getNavForRole(auth.role, { isFoundationReady });
  const platformSections = auth.isPlatformAdmin ? getPlatformNav() : [];
  const { data: unreadCounts } = useSidebarUnreadCounts();

  // Global realtime subscription for instant badge updates
  useChatRealtimeGlobalBadges();

  // ── Collapsible sections (persisted) ──
  const [collapsedSections, setCollapsedSections] =
    useState<Record<string, boolean>>(readCollapsed);

  // Persist whenever it changes
  useEffect(() => {
    writeCollapsed(collapsedSections);
  }, [collapsedSections]);

  const toggleSection = useCallback((label: string) => {
    setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const initials =
    auth.profile?.full_name
      ?.split(" ")
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ??
    auth.user?.email?.[0]?.toUpperCase() ??
    "?";

  const logoUrl = branding.logoUrl;
  const appName = branding.appName;

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      {/* ── Header: Logo (expanded) / Collapse trigger (collapsed) ── */}
      <SidebarHeader className="px-3 pb-0 pt-3">
        <div className="flex items-center justify-between">
          {!collapsed ? (
            logoUrl ? (
              <img src={logoUrl} alt={appName} className="h-6 max-w-[140px] object-contain" />
            ) : (
              <h1 className="font-display text-base font-semibold tracking-tight text-foreground">
                {appName}
              </h1>
            )
          ) : (
            /* Collapsed: no logo — just the toggle trigger centered */
            <span className="sr-only">{appName}</span>
          )}
          <SidebarTrigger className="text-foreground-muted hover:text-foreground" />
        </div>
      </SidebarHeader>

      {/* ── Search bar ──────────────────────────────────── */}
      <div className="px-3 pb-1 pt-2.5">
        {!collapsed ? (
          <button
            className="flex w-full items-center gap-2 rounded-md bg-surface-raised px-2.5 py-1.5 hover:bg-surface-input transition-colors cursor-pointer"
            style={{ height: 32 }}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            <span className="flex-1 text-left text-xs text-foreground-muted">Search…</span>
            <kbd className="rounded bg-surface-input px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">
              ⌘K
            </kbd>
          </button>
        ) : (
          <button
            className="flex w-full items-center justify-center rounded-md bg-surface-raised p-1.5 hover:bg-surface-input transition-colors cursor-pointer"
            style={{ height: 32 }}
            aria-label="Search"
          >
            <Search className="h-4 w-4 text-foreground-muted" />
          </button>
        )}
      </div>

      {/* ── Nav sections ────────────────────────────────── */}
      <SidebarContent className="gap-0 px-3 pt-1">
        {/* Role-specific sections (always first) */}
        {sections.map((section, sIdx) => {
          const isSectionCollapsed = !!collapsedSections[section.label];

          return (
            <SidebarGroup key={section.label} className={cn("p-0", sIdx > 0 && "mt-4")}>
              {/* Section header with collapse toggle */}
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="group/section-toggle mb-0.5 flex h-6 w-full items-center justify-between rounded px-2 text-left transition-colors hover:bg-surface-raised/50"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-disabled">
                    {section.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-foreground-disabled opacity-0 transition-all group-hover/section-toggle:opacity-100",
                      isSectionCollapsed && "-rotate-90",
                    )}
                  />
                </button>
              )}
              {/* Collapsible content — animate with grid trick */}
              <SidebarGroupContent
                className={cn(
                  "transition-[grid-template-rows] duration-200 ease-out",
                  !collapsed && isSectionCollapsed && "hidden",
                )}
              >
                <SidebarMenu className="gap-0.5">
                  {section.items.map((item) => {
                    const isActive = isNavActive(location.pathname, item.to);

                    // Badge data from unread counts
                    let badgeCount = 0;
                    let hasMentions = false;
                    if (item.badgeKey && unreadCounts) {
                      if (item.badgeKey === "team-chat") {
                        badgeCount = unreadCounts.teamUnread;
                        hasMentions = unreadCounts.teamMentions > 0;
                      } else if (item.badgeKey === "client-chats") {
                        badgeCount = unreadCounts.clientUnread;
                        hasMentions = unreadCounts.clientMentions > 0;
                      }
                    }

                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={collapsed ? item.label : undefined}
                          size="sm"
                        >
                          <Link to={item.to} className="relative">
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span>{item.label}</span>}
                            {/* Unread badge */}
                            {badgeCount > 0 &&
                              (collapsed ? (
                                <span
                                  className={cn(
                                    "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full",
                                    hasMentions
                                      ? "bg-mention shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                                      : "bg-primary shadow-[0_0_6px_rgba(var(--primary-rgb),0.3)]",
                                  )}
                                />
                              ) : (
                                <span
                                  className={cn(
                                    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                                    hasMentions
                                      ? "bg-mention text-mention-foreground shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                      : "bg-foreground-muted/20 text-foreground-muted",
                                  )}
                                >
                                  {badgeCount > 99 ? "99+" : badgeCount}
                                </span>
                              ))}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        {/* Divider between role nav and platform */}
        {platformSections.length > 0 && (
          <div className={cn("my-3 border-t border-border", collapsed && "mx-1")} />
        )}

        {/* Platform Admin sections (shown below management for super admins) */}
        {platformSections.map((section, sIdx) => {
          const isSectionCollapsed = !!collapsedSections[section.label];
          return (
            <SidebarGroup
              key={`platform-${section.label}`}
              className={cn("p-0", sIdx > 0 && "mt-4")}
            >
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="group/section-toggle mb-0.5 flex h-6 w-full items-center justify-between rounded px-2 text-left transition-colors hover:bg-surface-raised/50"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {section.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-foreground-disabled opacity-0 transition-all group-hover/section-toggle:opacity-100",
                      isSectionCollapsed && "-rotate-90",
                    )}
                  />
                </button>
              )}
              <SidebarGroupContent
                className={cn(
                  "transition-[grid-template-rows] duration-200 ease-out",
                  !collapsed && isSectionCollapsed && "hidden",
                )}
              >
                <SidebarMenu className="gap-0.5">
                  {section.items.map((item) => {
                    const isActive = isNavActive(location.pathname, item.to);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={collapsed ? item.label : undefined}
                          size="sm"
                        >
                          <Link to={item.to}>
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span>{item.label}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* ── Footer: user profile ────────────────────────── */}
      <SidebarFooter className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {!collapsed ? (
              <button className="flex w-full items-center gap-3 rounded-xl bg-surface-raised p-2.5 transition-colors hover:bg-surface-input cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={auth.profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-foreground-strong">
                    {auth.profile?.full_name ?? auth.user?.email ?? "Unknown"}
                  </p>
                  <p className="truncate text-xs text-foreground-muted">
                    {auth.role ? ROLE_LABEL[auth.role] : "No role"}
                  </p>
                </div>
                <ChevronUp className="h-4 w-4 text-foreground-muted" />
              </button>
            ) : (
              <button
                className="flex w-full items-center justify-center rounded-md p-2 text-foreground-muted transition-colors hover:bg-surface-input hover:text-foreground cursor-pointer"
                aria-label="Account menu"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={auth.profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem
              onClick={() => {
                const settingsPath = auth.role
                  ? `/${auth.role === "senior_editor" ? "senior-editor" : auth.role === "content_creator" ? "content-creator" : auth.role}/settings`
                  : "/settings";
                navigate({ to: settingsPath });
              }}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => auth.signOut()} className="cursor-pointer text-danger">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
