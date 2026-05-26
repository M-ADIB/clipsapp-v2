/**
 * FinancePage — Full accounting module for agency owners.
 *
 * Tabs injected into universal header via WorkspaceContext:
 *   1. Overview      — KPI cards + Payment History table
 *   2. Revenue Breakdown — Gross/Net/Fees/P&L
 *   3. Subscriptions — Stripe subscription management
 *   4. Costs         — Operating costs CRUD (salaries, subscriptions, contractors)
 *
 * Route: /owner/finance
 */
import { useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { TabPanel } from "@/components/ui/tab-panel";
import {
  FinanceOverviewTab,
  RevenueBreakdownTab,
  SubscriptionsTab,
  CostsTab,
  FINANCE_TABS,
  type FinanceTab,
} from "./finance";

export function FinancePage() {
  const { headerConfig, setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  // Register tabs in the universal header
  useEffect(() => {
    setHeaderConfig({
      title: "Finance",
      tabs: FINANCE_TABS.map((t) => ({ key: t, label: t })),
      activeTab: "Overview",
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const activeTab = (headerConfig?.activeTab as FinanceTab) ?? "Overview";

  return (
    <FullBleed>
      <div className="px-3 py-5 md:px-5 md:py-6">
        <TabPanel active={activeTab === "Overview"}>
          <FinanceOverviewTab />
        </TabPanel>
        <TabPanel active={activeTab === "Revenue Breakdown"} lazy>
          <RevenueBreakdownTab />
        </TabPanel>
        <TabPanel active={activeTab === "Subscriptions"} lazy>
          <SubscriptionsTab />
        </TabPanel>
        <TabPanel active={activeTab === "Costs"} lazy>
          <CostsTab />
        </TabPanel>
      </div>
    </FullBleed>
  );
}
