/**
 * AppShell — persistent layout wrapper for every authenticated page.
 *
 * Structure (desktop):
 *   ┌─────────────┬──────────────────────────────────────────────┐
 *   │  Sidebar    │  Header (52px) — ALWAYS VISIBLE              │
 *   │  256px      │  [≡] [Title + Tabs] ............. [☀ 🔔]     │
 *   │             ├──────────────────────────────────────────────┤
 *   │             │  Main content (scrollable)                   │
 *   └─────────────┴──────────────────────────────────────────────┘
 *
 * Structure (mobile):
 *   ┌──────────────────────────────────────────────┐
 *   │  Header (45px) — title only, no tabs         │
 *   ├──────────────────────────────────────────────┤
 *   │  [MobileSubTabs] (only if page has tabs)     │
 *   ├──────────────────────────────────────────────┤
 *   │  Main content (scrollable)                   │
 *   │  padding-bottom for bottom bar               │
 *   ├──────────────────────────────────────────────┤
 *   │  MobileBottomNav (fixed, 48px + safe-area)   │
 *   └──────────────────────────────────────────────┘
 */
import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileSubTabs } from "./MobileSubTabs";

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <WorkspaceProvider>
      {/*
       * defaultOpen={true}  → sidebar visible on desktop
       * On mobile, shadcn SidebarProvider auto-detects viewport and
       * switches to "offcanvas" mode — closed by default, slide-in on trigger.
       */}
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Universal header */}
            <header className="flex h-[45px] shrink-0 items-center gap-0 border-b border-border-strong bg-background/80 backdrop-blur md:h-[52px]">
              <TopNav />
            </header>

            {/* Mobile sub-tab pills — only renders when page has tabs, hidden on desktop */}
            <MobileSubTabs />

            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
              <div className="page-entry-motion">{children}</div>
            </main>
          </div>

          {/* Universal mobile bottom nav — role-aware, hidden on desktop */}
          <MobileBottomNav />
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
