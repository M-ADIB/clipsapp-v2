/**
 * ContentTab — The main Content tab with sidebar + main area layout.
 *
 * Sidebar: Foundation + Dynamic Docs + Content Cycles
 * Main: Dynamic view based on sidebar selection
 */
import { useState, useEffect } from "react";
import { ContentSidebar, type SidebarView } from "./ContentSidebar";
import { FoundationView } from "./FoundationView";
import { ClientDocEditorView } from "./ClientDocEditorView";
import { CycleEditor } from "./CycleEditor";
import { Loader2 } from "lucide-react";
import { useClientCycles } from "@/hooks/use-studio";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ContentTabProps {
  clientId: string | undefined;
}

export function ContentTab({ clientId }: ContentTabProps) {
  const [activeView, setActiveView] = useState<SidebarView>({
    type: "foundation",
  });

  const { tenantId } = useAuth();

  // Get the client's project_id (needed for cycle creation)
  const { data: project } = useQuery({
    queryKey: ["client-project", tenantId, clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("client_id", clientId!)
        .eq("tenant_id", tenantId!)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!clientId,
  });

  // Reset to foundation when client changes
  useEffect(() => {
    setActiveView({ type: "foundation" });
  }, [clientId]);

  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-foreground-muted text-sm">
          Select a client to view their content workspace
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-[500px]">
      {/* Sidebar */}
      <ContentSidebar
        clientId={clientId}
        projectId={project?.id}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main area */}
      {activeView.type === "foundation" && <FoundationView clientId={clientId} />}
      {activeView.type === "doc" && (
        <ClientDocEditorView
          clientId={clientId}
          docId={activeView.docId}
          docTitle={activeView.docTitle}
        />
      )}
      {activeView.type === "cycle" && activeView.cycle && (
        <CycleEditor
          cycleId={activeView.cycle.id}
          cycleName={activeView.cycle.name}
          clientId={clientId}
          tenantId={tenantId!}
        />
      )}
    </div>
  );
}
