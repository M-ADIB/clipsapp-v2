/**
 * MobileBottomNav — Universal mobile bottom navigation bar.
 *
 * Replaces the old client-only MobileTabBar with a role-aware
 * bottom bar. Shows 4–5 curated tabs per role. The optional 5th
 * "More" tab opens a drawer with remaining sidebar items.
 *
 * Specs:
 *   - Fixed to bottom, 56px + safe-area
 *   - Only visible below md breakpoint (md:hidden)
 *   - Active state: primary color, filled icon
 *   - Inactive: muted foreground
 *   - "More" tab opens MobileMoreDrawer
 */
import { useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getMobileNavForRole } from "./mobile-nav-config";
import { MobileMoreDrawer } from "./MobileMoreDrawer";
import { useClientFoundationReady } from "@/hooks/use-clients";

export function MobileBottomNav() {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const { isReady: isFoundationReady } = useClientFoundationReady();
  const config = getMobileNavForRole(role, { isFoundationReady });
  const { bottomTabs, moreSections } = config;

  // Nothing to render if role has no mobile tabs
  if (bottomTabs.length === 0) return null;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {bottomTabs.map((tab) => {
          // "More" tab opens drawer
          if (tab.isMore) {
            return (
              <button
                key="__more__"
                onClick={() => setMoreOpen(true)}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors ${
                  moreOpen ? "text-primary" : "text-foreground-disabled"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          // Regular navigation tab
          const isActive =
            tab.to === `/${role}` || tab.to === `/${role?.replace(/_/g, "-")}`
              ? location.pathname === tab.to
              : location.pathname.startsWith(tab.to);
          const Icon = tab.icon;

          return (
            <button
              key={tab.to}
              onClick={() => navigate({ to: tab.to })}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-foreground-disabled"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* "More" drawer */}
      {moreSections.length > 0 && (
        <MobileMoreDrawer open={moreOpen} onOpenChange={setMoreOpen} sections={moreSections} />
      )}
    </>
  );
}
