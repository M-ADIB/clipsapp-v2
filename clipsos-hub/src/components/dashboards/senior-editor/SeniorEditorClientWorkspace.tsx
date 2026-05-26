/**
 * SeniorEditorClientWorkspace — Client workspace for senior editors.
 *
 * Senior editors only see: Overview, Production, Content tabs.
 * They do NOT see: Journey, Sales, Analytics, Activity, Settings.
 */

import { useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useParams } from "@tanstack/react-router";
import { TabPanel } from "@/components/ui/tab-panel";

import { useClientBySlug } from "@/hooks/data";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import {
  OverviewTab,
  ProductionTab,
  ContentTab,
  ActivityTab,
} from "@/components/dashboards/owner/workspace";

const TABS = ["Overview", "Production", "Content", "Activity"] as const;
type WorkspaceTab = (typeof TABS)[number];

export function SeniorEditorClientWorkspace() {
  const { clientSlug } = useParams({ strict: false }) as { clientSlug?: string };
  const { headerConfig, setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  const { data: client } = useClientBySlug(clientSlug);
  const clientId = client?.id;
  const clientName = client?.name ?? "Loading…";

  useEffect(() => {
    setHeaderConfig({
      title: clientName,
      tabs: TABS.map((t) => ({ key: t, label: t })),
      activeTab: "Overview",
    });
    return () => clearHeaderConfig();
  }, [clientName, setHeaderConfig, clearHeaderConfig]);

  const activeTab = (headerConfig?.activeTab as WorkspaceTab) ?? "Overview";

  return (
    <FullBleed>
      <div className="flex flex-col px-3 py-5 md:px-5 md:py-6">
        <div>
          <TabPanel active={activeTab === "Overview"}>
            {clientId && <OverviewTab clientId={clientId} />}
          </TabPanel>
          <TabPanel active={activeTab === "Production"} lazy>
            {clientId && <ProductionTab clientId={clientId} />}
          </TabPanel>
          <TabPanel active={activeTab === "Content"} lazy>
            {clientId && <ContentTab clientId={clientId} />}
          </TabPanel>
          <TabPanel active={activeTab === "Activity"} lazy>
            {clientId && <ActivityTab clientId={clientId} />}
          </TabPanel>
        </div>
      </div>
    </FullBleed>
  );
}
