/**
 * TopNav — the UNIVERSAL top header bar.
 *
 * Structure (always the same):
 *   [Title + optional Tabs] .................. [Ask Clips | ☀/🌙 | 🔔]
 *
 * LEFT SIDE:
 *   - Default: auto-generated page title from URL path
 *   - Custom: any page can set title + tabs via useWorkspaceHeader()
 *
 * RIGHT SIDE (always present):
 *   - Ask Clips button (sparkle icon)
 *   - Theme toggle (sun/moon icon) — toggles via BrandingContext
 *   - Notifications bell (with dot)
 *
 * No role badges. No conditional hiding. One bar, everywhere.
 */
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { AskClipsWidget } from "@/components/ask-clips/AskClipsWidget";
import { NotificationsPopover } from "@/components/app-shell/NotificationsPopover";

function titleForPath(pathname: string): string {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length <= 1) return "Dashboard";
  return segs
    .slice(1)
    .map((s) => s.replace(/-/g, " "))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" / ");
}

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { headerConfig, setActiveTab } = useWorkspaceHeader();
  const branding = useBranding();
  const auth = useAuth();
  const rolePrefix = auth.role ? `/${auth.role.replace(/_/g, "-")}` : "/owner";

  const title = headerConfig?.title ?? titleForPath(location.pathname);
  const tabs = headerConfig?.tabs;
  const activeTab = headerConfig?.activeTab;

  return (
    <div className="flex h-full flex-1 items-center justify-between">
      {/* ── Left side: Title + optional Tabs ── */}
      <div className="flex h-full min-w-0 items-center overflow-hidden">
        {/* Title */}
        <div className="flex shrink-0 items-center px-3 md:px-[30px]">
          <h1
            className="whitespace-nowrap text-base font-medium leading-none text-foreground md:text-lg"
            style={{ fontFamily: "var(--font-display, Inter)" }}
          >
            {title}
          </h1>
        </div>

        {/* Tabs (only if page provides them via context) — hidden on mobile (MobileSubTabs handles it) */}
        {tabs && tabs.length > 0 && (
          <div className="hidden h-full items-center gap-4 overflow-x-auto md:flex md:gap-[30px]">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-full shrink-0 items-center border-b-[3px] px-0 text-xs font-medium transition-all duration-200 ease-out md:text-sm cursor-pointer ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-foreground-disabled hover:text-foreground-muted"
                  }`}
                  style={{ letterSpacing: "-0.35px" }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right side: Always the same ── */}
      <div className="flex shrink-0 items-center gap-1 pr-3 md:gap-1.5 md:pr-[22px]">
        {/* Ask Clips */}
        <AskClipsWidget />

        {/* Theme toggle — functional via BrandingContext */}
        <button
          onClick={branding.toggleMode}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-raised/60 transition-all duration-300 hover:scale-105 active:scale-95 active:rotate-12 cursor-pointer"
          aria-label={`Switch to ${branding.mode === "dark" ? "light" : "dark"} mode`}
        >
          {branding.mode === "dark" ? (
            <Sun className="h-[18px] w-[18px] transition-transform duration-500 hover:rotate-45" />
          ) : (
            <Moon className="h-[18px] w-[18px] transition-transform duration-500 hover:-rotate-12" />
          )}
        </button>

        {/* Notifications */}
        <NotificationsPopover />
      </div>
    </div>
  );
}
