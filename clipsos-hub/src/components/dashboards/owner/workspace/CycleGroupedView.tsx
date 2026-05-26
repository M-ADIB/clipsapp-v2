/**
 * CycleGroupedView — Production table with collapsible cycle group headers.
 *
 * Strategy: One query fetches ALL videos for the client. We group them
 * client-side by cycle_id so every cycle section shows its own rows
 * without separate network requests.
 *
 * Videos with cycle_id = null appear in "Unassigned" at the bottom.
 * The most recent cycle (highest cycle_number) is marked "Active".
 */
import { useState, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCyclesForClient } from "@/hooks/use-cycles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { VideosGrid } from "@/components/grid/VideosGrid";
import type { Cycle } from "@/integrations/supabase/db-types";

interface CycleGroupedViewProps {
  clientId: string;
  projectId?: string;
  initialSearch?: string;
}

/** Fetches projects for the client (for project name badges). */
function useClientProjects(clientId: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["client_projects", tenantId, clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_name")
        .eq("client_id", clientId)
        .eq("tenant_id", tenantId!);
      if (error) throw error;
      return (data ?? []) as { id: string; project_name: string }[];
    },
    enabled: !!tenantId && !!clientId,
  });
}

/** Fetches video IDs grouped by cycle_id for a client — lightweight. */
function useVideoCountsByCycle(clientId: string, projectId?: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["video_counts_by_cycle", tenantId, clientId, projectId],
    queryFn: async () => {
      let q = supabase
        .from("videos")
        .select("id, cycle_id, project_id")
        .eq("client_id", clientId)
        .eq("tenant_id", tenantId!)
        .is("archived_at", null);
      if (projectId) {
        q = q.eq("project_id", projectId);
      }
      const { data, error } = await q;
      if (error) throw error;
      // Build a map: cycleId (or "unassigned") → count
      const counts: Record<string, number> = {};
      for (const v of data ?? []) {
        const key = v.cycle_id ?? "unassigned";
        counts[key] = (counts[key] ?? 0) + 1;
      }
      return counts;
    },
    enabled: !!tenantId && !!clientId,
  });
}

export function CycleGroupedView({ clientId, projectId, initialSearch }: CycleGroupedViewProps) {
  const { data: cycles = [], isLoading: cyclesLoading } = useCyclesForClient(clientId);
  const { data: projects = [] } = useClientProjects(clientId);
  const { data: countsByCycle = {} } = useVideoCountsByCycle(clientId, projectId);

  const projectNameMap = new Map(projects.map((p) => [p.id, p.project_name]));

  // Sort cycles newest → oldest, filtered by projectId if provided
  const sortedCycles = useMemo(() => {
    let list = cycles;
    if (projectId) {
      list = list.filter((c) => c.project_id === projectId);
    }
    return [...list].sort((a, b) => b.cycle_number - a.cycle_number);
  }, [cycles, projectId]);

  const maxCycleNumber = sortedCycles[0]?.cycle_number ?? 0;

  // Auto-expand the newest (active) cycle on mount
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (sortedCycles.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set([sortedCycles[0].id]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedCycles.length]);

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const unassignedCount = countsByCycle["unassigned"] ?? 0;
  const [unassignedExpanded, setUnassignedExpanded] = useState(false);
  const [hasAutoExpandedUnassigned, setHasAutoExpandedUnassigned] = useState(false);

  useEffect(() => {
    if (Object.keys(countsByCycle).length > 0 && !hasAutoExpandedUnassigned) {
      const allCyclesEmpty = sortedCycles.every((c) => !countsByCycle[c.id]);
      if (allCyclesEmpty && countsByCycle["unassigned"] > 0) {
        setUnassignedExpanded(true);
        setHasAutoExpandedUnassigned(true);
      }
    }
  }, [countsByCycle, sortedCycles, hasAutoExpandedUnassigned]);

  if (cyclesLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-foreground-muted">
        Loading production data…
      </div>
    );
  }

  // No cycles: fall back to a flat scoped grid (all videos for client/project)
  if (sortedCycles.length === 0) {
    return (
      <div className="flex flex-col min-h-[450px] h-[calc(100vh-280px)]">
        <VideosGrid
          scope={{ clientId, projectId }}
          viewKey={
            projectId
              ? `owner.client.${clientId}.project.${projectId}.production`
              : `owner.client.${clientId}.production`
          }
          title="Production"
          defaultPageSize={false}
          hideCycleTabs
          initialSearch={initialSearch}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {sortedCycles.map((cycle) => {
        const isActive = cycle.cycle_number === maxCycleNumber;
        const isExpanded = expandedIds.has(cycle.id);
        const projectName = projectNameMap.get(cycle.project_id) ?? null;
        const videoCount = countsByCycle[cycle.id] ?? 0;

        return (
          <CycleSection
            key={cycle.id}
            cycle={cycle}
            clientId={clientId}
            projectName={projectName}
            isActive={isActive}
            isExpanded={isExpanded}
            videoCount={videoCount}
            onToggle={() => toggle(cycle.id)}
            initialSearch={initialSearch}
          />
        );
      })}

      {/* Unassigned videos (no cycle_id) */}
      <div className="border-t border-border/50">
        <button
          onClick={() => setUnassignedExpanded((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:outline-none"
          aria-expanded={unassignedExpanded}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200",
              unassignedExpanded && "rotate-90",
            )}
          />
          <span className="text-2xl font-bold tracking-tight text-foreground-strong">
            Unassigned
          </span>
          <Badge
            variant="outline"
            className="rounded-full border-border px-2.5 py-0.5 text-[11px] font-medium text-foreground-disabled"
          >
            {unassignedCount} video{unassignedCount !== 1 ? "s" : ""}
          </Badge>
        </button>

        {unassignedExpanded && (
          <div className="border-t border-border/30 pb-4">
            <UnassignedGrid
              clientId={clientId}
              projectId={projectId}
              initialSearch={initialSearch}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Cycle section (header + scoped grid)                               */
/* ------------------------------------------------------------------ */

interface CycleSectionProps {
  cycle: Cycle;
  clientId: string;
  projectName: string | null;
  isActive: boolean;
  isExpanded: boolean;
  videoCount: number;
  onToggle: () => void;
  initialSearch?: string;
}

function CycleSection({
  cycle,
  clientId,
  projectName,
  isActive,
  isExpanded,
  videoCount,
  onToggle,
  initialSearch,
}: CycleSectionProps) {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      {/* ── Header ── */}
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-4 text-left transition-colors",
          "hover:bg-foreground/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
        aria-expanded={isExpanded}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200",
            isExpanded && "rotate-90",
          )}
        />

        <span className="text-2xl font-bold tracking-tight text-foreground-strong">
          {cycle.name}
        </span>

        {projectName && (
          <Badge
            variant="outline"
            className="rounded-full border-border px-2.5 py-0.5 text-[11px] font-medium text-foreground-muted"
          >
            {projectName}
          </Badge>
        )}

        <Badge
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            isActive
              ? "border-0 bg-emerald-500/15 text-emerald-400"
              : "border border-border bg-transparent text-foreground-disabled",
          )}
        >
          {isActive ? "Active" : "Completed"}
        </Badge>

        {/* Video count hint */}
        <span className="ml-auto text-xs text-foreground-disabled">
          {videoCount} video{videoCount !== 1 ? "s" : ""}
        </span>
      </button>

      {/* ── Grid (only when expanded) ── */}
      {isExpanded && (
        <div className="border-t border-border/30 pb-6 min-h-[400px] flex flex-col">
          <VideosGrid
            scope={{ clientId, projectId: cycle.project_id, cycleId: cycle.id }}
            viewKey={`owner.client.${clientId}.cycle.${cycle.id}`}
            title={cycle.name}
            defaultPageSize={false}
            hideCycleTabs
            initialSearch={initialSearch}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Unassigned section — shows videos with cycle_id IS NULL            */
/* ------------------------------------------------------------------ */

/** Uses the "none" sentinel in scope.cycleId which maps to IS NULL in useGridRows. */
function UnassignedGrid({
  clientId,
  projectId,
  initialSearch,
}: {
  clientId: string;
  projectId?: string;
  initialSearch?: string;
}) {
  return (
    <div className="min-h-[400px] flex flex-col">
      <VideosGrid
        scope={{ clientId, projectId, cycleId: "none" }}
        viewKey={
          projectId
            ? `owner.client.${clientId}.project.${projectId}.unassigned`
            : `owner.client.${clientId}.unassigned`
        }
        title="Unassigned"
        defaultPageSize={false}
        hideCycleTabs
        initialSearch={initialSearch}
      />
    </div>
  );
}
