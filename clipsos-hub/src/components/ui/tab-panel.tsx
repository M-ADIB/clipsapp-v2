/**
 * TabPanel — keeps children mounted but hidden when not active.
 *
 * Instead of `{activeTab === "X" && <Component />}` which destroys/recreates
 * the entire component tree (triggering re-fetches, re-mounts, layout thrashing),
 * this component keeps all tabs in the DOM but hides inactive ones with CSS.
 *
 * Benefits:
 * - No re-mount on tab switch → no re-fetch, no layout recalculation
 * - Instant tab switches (paint-only, no JS work)
 * - TanStack Query caches stay warm because hooks stay subscribed
 * - Scroll position preserved per tab
 *
 * Usage:
 *   <TabPanel active={activeTab === "Sales"}>
 *     <SalesOverviewTab />
 *   </TabPanel>
 */
import { useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabPanelProps {
  /** Whether this panel is the currently visible tab */
  active: boolean;
  children: ReactNode;
  /** Optional: delay initial mount until first activation (lazy mount) */
  lazy?: boolean;
  className?: string;
}

export function TabPanel({ active, children, lazy = false, className }: TabPanelProps) {
  // Track whether this tab has ever been activated
  const [hasBeenActive, setHasBeenActive] = useState(!lazy || active);

  useEffect(() => {
    if (active && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [active, hasBeenActive]);

  // If lazy and never been active, don't render at all
  if (!hasBeenActive) return null;

  return (
    <div
      className={
        active
          ? cn("h-full w-full", className)
          : "pointer-events-none invisible absolute -z-10 h-0 overflow-hidden opacity-0"
      }
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}
