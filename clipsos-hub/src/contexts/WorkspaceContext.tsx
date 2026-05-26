/**
 * WorkspaceContext — shared state between the TopNav header and page content.
 *
 * Any page can call `setHeaderConfig(...)` to control what the universal
 * top header bar shows on its LEFT side. The RIGHT side (Ask Clips, theme
 * toggle, bell) is always the same.
 *
 * When a page unmounts, it should call `clearHeaderConfig()` so the header
 * falls back to the default (auto-generated page title).
 *
 * Browser tab title is automatically kept in sync:
 *   setHeaderConfig({ title: "Ajmal Perfumes" }) → "Ajmal Perfumes | ClipsOS"
 *   clearHeaderConfig()                          → "ClipsOS"
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const APP_NAME = "ClipsOS";

/** localStorage key prefix for persisted active tab per route. */
const TAB_STORAGE_PREFIX = "clipsos:activeTab:";

/**
 * Read the last active tab for a given route pathname.
 * Returns `undefined` if nothing was persisted.
 */
export function getPersistedTab(pathname: string): string | undefined {
  try {
    return localStorage.getItem(TAB_STORAGE_PREFIX + pathname) ?? undefined;
  } catch {
    return undefined;
  }
}

export interface HeaderTab {
  key: string;
  label: string;
}

export interface HeaderConfig {
  /** Title shown before tabs (e.g. "Ajmal Perfumes") */
  title: string;
  /** Optional tabs rendered after the title */
  tabs?: HeaderTab[];
  /** Currently active tab key */
  activeTab?: string;
  /** Optional handler called when a tab in the top nav is clicked */
  onTabChange?: (key: string) => void;
}

interface WorkspaceContextValue {
  /** Current header configuration (null = use default route-based title) */
  headerConfig: HeaderConfig | null;
  /** Set custom header config (title + tabs) */
  setHeaderConfig: (config: HeaderConfig) => void;
  /** Reset to default header */
  clearHeaderConfig: () => void;
  /** Update only the active tab (called by TopNav on tab click) */
  setActiveTab: (tabKey: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [headerConfig, setHeaderConfigState] = useState<HeaderConfig | null>(null);

  const setHeaderConfig = useCallback((config: HeaderConfig) => {
    setHeaderConfigState(config);
  }, []);

  const clearHeaderConfig = useCallback(() => {
    setHeaderConfigState(null);
  }, []);

  const setActiveTab = useCallback((tabKey: string) => {
    let callback: ((key: string) => void) | undefined;
    
    setHeaderConfigState((prev) => {
      if (!prev) return prev;
      callback = prev.onTabChange;
      return { ...prev, activeTab: tabKey };
    });

    if (callback) {
      queueMicrotask(() => {
        callback?.(tabKey);
      });
    }

    // ── Persist so the tab survives refresh / sign-out ──────────────────────
    try {
      localStorage.setItem(TAB_STORAGE_PREFIX + window.location.pathname, tabKey);
    } catch {
      // Storage might be unavailable (private mode, quota full) — silently ignore
    }
  }, []);

  // ── Dynamic browser tab title ──────────────────────────────────────────────
  // Automatically sync document.title whenever the page header title changes.
  // Format: "Page Title | ClipsOS"  (or just "ClipsOS" when no config is set)
  useEffect(() => {
    if (!headerConfig?.title) {
      document.title = APP_NAME;
      return;
    }
    let activeTabLabel = "";
    if (headerConfig.tabs && headerConfig.activeTab) {
      const activeTab = headerConfig.tabs.find((t) => t.key === headerConfig.activeTab);
      if (activeTab) activeTabLabel = activeTab.label;
    }
    document.title = activeTabLabel
      ? `${activeTabLabel} · ${headerConfig.title} | ${APP_NAME}`
      : `${headerConfig.title} | ${APP_NAME}`;
  }, [headerConfig?.title, headerConfig?.tabs, headerConfig?.activeTab]);

  const value = useMemo(
    () => ({ headerConfig, setHeaderConfig, clearHeaderConfig, setActiveTab }),
    [headerConfig, setHeaderConfig, clearHeaderConfig, setActiveTab],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceHeader() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspaceHeader must be used within WorkspaceProvider");
  return ctx;
}
