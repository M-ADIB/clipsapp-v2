/**
 * ClientStudio — Client Content Studio View.
 *
 * Exposes Strategy (Foundation, Pillars, Audience), Cycles,
 * Client Brain, and Resources tabs directly to the client
 * once onboarding/foundation is ready.
 */
import { useEffect, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { ContentTab } from "../owner/studio/ContentTab";
import { BrainTab } from "../owner/studio/BrainTab";
import { ResourcesTab } from "../owner/studio/ResourcesTab";
import { useClientFoundationReady } from "@/hooks/use-clients";
import { Loader2, Clapperboard } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const TABS = [
  { key: "Content", label: "Content" },
  { key: "Client Brain", label: "Client Brain" },
  { key: "Resources", label: "Resources" },
] as const;

export function ClientStudio() {
  const { headerConfig, setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { clientId, isReady, isLoading } = useClientFoundationReady();
  const [activeTabState, setActiveTabState] = useState<string>("Content");
  const navigate = useNavigate();

  const activeTab = headerConfig?.activeTab || activeTabState;

  // Sync workspace page header configuration
  useEffect(() => {
    if (isReady && clientId) {
      setHeaderConfig({
        title: "Studio",
        tabs: TABS.map((t) => ({ key: t.key, label: t.label })),
        activeTab: activeTabState,
        onTabChange: (key: string) => setActiveTabState(key),
      });
    }
    return () => clearHeaderConfig();
  }, [clientId, isReady, setHeaderConfig, clearHeaderConfig, activeTabState]);

  // Security / access redirect
  useEffect(() => {
    if (!isLoading && !isReady) {
      toast.error("Content Studio is not activated yet.");
      navigate({ to: "/client" });
    }
  }, [isLoading, isReady, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
      </div>
    );
  }

  if (!isReady || !clientId) {
    return null;
  }

  return (
    <FullBleed>
      <div className="flex flex-col gap-5 w-full px-3 py-5 md:px-5 md:py-6">
        <div className="min-h-[400px]">
          {activeTab === "Content" && <ContentTab clientId={clientId} />}
          {activeTab === "Client Brain" && <BrainTab clientId={clientId} />}
          {activeTab === "Resources" && <ResourcesTab clientId={clientId} />}
        </div>
      </div>
    </FullBleed>
  );
}
