/**
 * MobileSubTabs — Scrollable pill bar for pages with header tabs.
 *
 * Renders BELOW the TopNav header on mobile only (md:hidden).
 * Reads tabs from WorkspaceContext and renders them as horizontal
 * scrollable pills. Replaces the cramped header-tab pattern on
 * small viewports.
 *
 * Specs:
 *   - Height: 44px
 *   - Pills: rounded-full, snap-x scrollable
 *   - Active pill: bg-primary, text-background
 *   - Inactive: bg-surface-raised, text-foreground-muted
 *   - Hidden on desktop (tabs live in TopNav header)
 */
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";

export function MobileSubTabs() {
  const { headerConfig, setActiveTab } = useWorkspaceHeader();

  const tabs = headerConfig?.tabs;
  const activeTab = headerConfig?.activeTab;

  // Only render on mobile when there are tabs
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="sticky top-[45px] z-30 flex h-11 items-center gap-2 overflow-x-auto border-b border-border bg-background/95 px-3 backdrop-blur scrollbar-none md:hidden">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-primary text-background"
                : "bg-surface-raised text-foreground-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
