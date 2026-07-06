/**
 * ClientWorkspacePage — Individual client workspace viewed by the Owner.
 *
 * URL: /{role}/clients/{slug}  (e.g. /owner/clients/ajmal-perfumes)
 *
 * Resolves the slug → clientId via useClientBySlug, then passes
 * the clientId down to every tab. Header: client name + tabs.
 */

import { useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useParams } from "@tanstack/react-router";
import { TabPanel } from "@/components/ui/tab-panel";
import { Loader2 } from "lucide-react";

import { useClientBySlug } from "@/hooks/data";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import {
  OverviewTab,
  ProductionTab,
  JourneyTab,
  SalesTab,
  ContentTab,
  AnalyticsTab,
  ActivityTab,
  SettingsTab,
} from "@/components/dashboards/owner/workspace";
import { ClientBillingTab } from "@/components/dashboards/owner/finance/ClientBillingTab";

const TABS = [
  "Overview",
  "Production",
  "Content",
  "Journey",
  "Sales",
  "Billing",
  "Analytics",
  "Activity",
  "Settings",
] as const;

type WorkspaceTab = (typeof TABS)[number];

export function ClientWorkspacePage() {
  const { clientSlug } = useParams({ strict: false }) as { clientSlug?: string };
  const { headerConfig, setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  const { data: client, isLoading, error } = useClientBySlug(clientSlug);
  const clientName = client?.name ?? "Loading…";
  const clientId = client?.id;

  useEffect(() => {
    setHeaderConfig({
      title: clientName,
      tabs: TABS.map((t) => ({ key: t, label: t })),
      activeTab: "Overview",
    });
    return () => clearHeaderConfig();
  }, [clientName, setHeaderConfig, clearHeaderConfig]);

  const activeTab = (headerConfig?.activeTab as WorkspaceTab) ?? "Overview";

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <span className="text-sm text-foreground-muted">
          {error ? `Client not found: ${clientSlug}` : "No client data available."}
        </span>
      </div>
    );
  }

  return (
    <FullBleed>
      <div className="flex flex-col px-3 py-5 md:px-5 md:py-6">
        <div>
          <TabPanel active={activeTab === "Overview"}>
            <OverviewTab clientId={clientId!} />
          </TabPanel>
          <TabPanel active={activeTab === "Production"} lazy>
            <ProductionTab clientId={clientId!} />
          </TabPanel>
          <TabPanel active={activeTab === "Content"} lazy>
            <ContentTab clientId={clientId!} />
          </TabPanel>
          <TabPanel active={activeTab === "Journey"} lazy>
            <JourneyTab clientId={clientId!} />
          </TabPanel>
          <TabPanel active={activeTab === "Sales"} lazy>
            <SalesTab clientId={clientId!} />
          </TabPanel>
          <TabPanel active={activeTab === "Billing"} lazy>
            <ClientBillingTab clientId={clientId!} />
          </TabPanel>
          <TabPanel active={activeTab === "Analytics"} lazy>
            <AnalyticsTab clientId={clientId!} />
          </TabPanel>
          <TabPanel active={activeTab === "Activity"} lazy>
            <ActivityTab clientId={clientId!} />
          </TabPanel>
          <TabPanel active={activeTab === "Settings"} lazy>
            <SettingsTab clientId={clientId!} />
          </TabPanel>
        </div>
      </div>
    </FullBleed>
  );
}
