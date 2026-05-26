/**
 * OwnerSettingsPage — Owner > Settings
 *
 * Container page with tabs:
 *   - App Branding (color palette, logo, app name)
 *   - Billing (Stripe / plan)
 *   - Integrations (API keys, webhooks, etc.)
 *
 * Team has been promoted to its own sidebar page (/owner/team).
 * Reads ?tab= search param so redirects from old routes land on the right tab.
 */
import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";

import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { TabPanel } from "@/components/ui/tab-panel";
import { AppBrandingPage } from "./AppBrandingPage";
import { BillingSettingsPanel } from "./management/BillingSettingsPanel";
import { IntegrationsSettingsPanel } from "./management/IntegrationsSettingsPanel";

/* ── Tab types ─────────────────────────────────────────────── */

type SettingsTab = "branding" | "billing" | "integrations";

/* ── Main Component ────────────────────────────────────────── */

export function OwnerSettingsPage() {
  const { setHeaderConfig, clearHeaderConfig, headerConfig } = useWorkspaceHeader();

  // Read ?tab= from URL for redirect support
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;
  const initialTab = (search?.tab as SettingsTab) || "branding";

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Set header with tabs
  useEffect(() => {
    setHeaderConfig({
      title: "App Settings",
      tabs: [
        { key: "branding", label: "App Branding" },
        { key: "billing", label: "Billing" },
        { key: "integrations", label: "Integrations" },
      ],
      activeTab: initialTab,
    });
    return clearHeaderConfig;
  }, [setHeaderConfig, clearHeaderConfig, initialTab]);

  // Sync tab changes from header clicks
  useEffect(() => {
    if (headerConfig?.activeTab && headerConfig.activeTab !== activeTab) {
      setActiveTab(headerConfig.activeTab as SettingsTab);
    }
  }, [headerConfig?.activeTab, activeTab]);

  return (
    <>
      <TabPanel active={activeTab === "branding"}>
        <AppBrandingPage />
      </TabPanel>
      <TabPanel active={activeTab === "billing"} lazy>
        <BillingSettingsPanel />
      </TabPanel>
      <TabPanel active={activeTab === "integrations"} lazy>
        <IntegrationsSettingsPanel />
      </TabPanel>
    </>
  );
}
