/**
 * SalesHub — Owner > Sales
 *
 * Unified Sales page with 4 sub-tabs rendered via the workspace header:
 * Leads, Deals (Pipeline Kanban), Calls, Schedule.
 *
 * Each tab renders its own full sub-component. The header tabs use the
 * existing WorkspaceContext pattern (same as HQ Dashboard).
 */

import { useEffect, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { TabPanel } from "@/components/ui/tab-panel";
import { LeadsPage } from "@/components/dashboards/shared/LeadsPage";
import { PipelineDashboard } from "./PipelineDashboard";
import { OwnerPlaceholderPage } from "./OwnerPlaceholderPage";

/* ------------------------------------------------------------------ */
/* Tab definitions                                                     */
/* ------------------------------------------------------------------ */

type SalesTab = "leads" | "deals" | "calls";

const SALES_TABS: { key: SalesTab; label: string }[] = [
  { key: "leads", label: "Leads" },
  { key: "deals", label: "Deals" },
  { key: "calls", label: "Calls" },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function SalesHub() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [activeTab, setActiveTab] = useState<SalesTab>("leads");

  useEffect(() => {
    setHeaderConfig({
      title: "Sales",
      tabs: SALES_TABS,
      activeTab,
      onTabChange: (key: string) => setActiveTab(key as SalesTab),
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, activeTab]);

  return (
    <FullBleed>
      <div className="flex h-full flex-col px-3 py-5 md:px-5 md:py-6">
        <TabPanel active={activeTab === "leads"}>
          <LeadsPage embedded />
        </TabPanel>
        <TabPanel active={activeTab === "deals"} lazy>
          <PipelineDashboard />
        </TabPanel>
        <TabPanel active={activeTab === "calls"} lazy>
          <OwnerPlaceholderPage
            title="Calls"
            description="Call scheduling and tracking — discovery calls, follow-ups, and meetings."
          />
        </TabPanel>
      </div>
    </FullBleed>
  );
}
