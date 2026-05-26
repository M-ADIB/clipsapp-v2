/**
 * ClientMyVideos — Media Hub wrapper for clients.
 *
 * Provides a unified Media Hub interface with 4 tabs:
 *  - Review Feed (feed)
 *  - Spreadsheet (table)
 *  - Calendar (calendar)
 *  - Library (library)
 *
 * Tabs state is kept alive and fully synchronized with the `tab` URL search parameter.
 */
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Film, Table, FolderOpen } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { Route } from "@/routes/_authenticated/client/videos";
import { cn } from "@/lib/utils";

import { PostingFeedView } from "./PostingFeedView";
import { CycleGroupedView } from "@/components/dashboards/owner/workspace/CycleGroupedView";
import { ClientFiles } from "./ClientFiles";
import { TabPanel } from "@/components/ui/tab-panel";

const STATUS_SLUG_LABELS: Record<string, string> = {
  all: "",
  in_progress: "In Progress",
  review: "Review",
  rough_cut: "Rough Cut",
  final_review: "Final Review",
  scheduled: "Scheduled",
  posted: "Posted",
};

const TAB_ITEMS = [
  { id: "feed", label: "Review Feed", icon: Film },
  { id: "table", label: "Spreadsheet", icon: Table },
  { id: "library", label: "Library", icon: FolderOpen },
];

export function ClientMyVideos() {
  const { user } = useAuth();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const navigate = useNavigate({ from: Route.fullPath });

  // Read search params (?tab=, ?status=, ?projectId=)
  const { tab = "feed", status: statusSlug, projectId } = Route.useSearch();

  const { data: clientIds = [], isLoading } = useQuery({
    queryKey: ["client_access", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_access")
        .select("client_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.client_id);
    },
  });

  const clientId = clientIds[0];

  // Set the universal header title
  useEffect(() => {
    if (!clientId) return;
    setHeaderConfig({
      title: "Videos",
    });
    return () => clearHeaderConfig();
  }, [clientId, setHeaderConfig, clearHeaderConfig]);

  const handleTabChange = (newTab: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        tab: newTab,
      }),
    });
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-foreground-muted">Loading Videos…</div>;
  }

  if (!clientId) {
    return (
      <div className="p-6 text-sm text-foreground-muted">
        You don't have access to a client workspace yet.
      </div>
    );
  }

  // Convert status slug to display-name search string for Spreadsheet
  const initialSearch = statusSlug ? (STATUS_SLUG_LABELS[statusSlug] ?? statusSlug) : "";

  return (
    <FullBleed className="flex flex-col h-full overflow-hidden">
      {/* Sleek Tab Row */}
      <div className="flex items-center gap-1 border-b border-border/80 px-4 py-2 bg-background shrink-0 select-none">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-foreground-muted hover:bg-foreground/[0.04] hover:text-foreground-strong",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels with keep-alive */}
      <div className="flex-1 min-h-0 relative bg-background overflow-hidden flex flex-col">
        <TabPanel active={tab === "feed"}>
          <div className="h-full overflow-y-auto px-4 py-5 md:px-6">
            <PostingFeedView clientId={clientId} projectId={projectId} statusSlug={statusSlug} />
          </div>
        </TabPanel>

        <TabPanel active={tab === "table"}>
          <div className="h-full overflow-y-auto px-3 py-5 md:px-5 md:py-6">
            <CycleGroupedView
              clientId={clientId}
              projectId={projectId}
              initialSearch={initialSearch}
            />
          </div>
        </TabPanel>

        <TabPanel active={tab === "library"} lazy>
          <div className="h-full">
            <ClientFiles embedded={true} />
          </div>
        </TabPanel>
      </div>
    </FullBleed>
  );
}
