/**
 * ContentCreatorProfileContent — Profile for content_creator role.
 *
 * Shows: script creation stats, filmed count, cycle participation.
 * Data comes from studio_scripts (created_by FK) and cycles.
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/hooks/query-keys";
import { formatDistanceToNow } from "date-fns";

interface ContentCreatorProfileContentProps {
  userId: string;
}

interface CCStats {
  totalScripts: number;
  filmedCount: number;
  approvedCount: number;
  draftCount: number;
  scriptTypes: Array<{ type: string; count: number }>;
  recentScripts: Array<{
    id: string;
    title: string;
    status: string;
    filmed: boolean;
    scriptType: string;
    createdAt: string;
  }>;
}

export function ContentCreatorProfileContent({ userId }: ContentCreatorProfileContentProps) {
  const { tenantId, isAuthenticated } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["teamProfile", "ccStats", tenantId!, userId],
    queryFn: async (): Promise<CCStats> => {
      // Fetch scripts created by this user
      const { data: scripts, error } = await supabase
        .from("studio_scripts")
        .select("id, title, status, filmed, script_type, on_camera, created_at")
        .eq("tenant_id", tenantId!)
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const all = scripts ?? [];

      if (all.length === 0) {
        return {
          totalScripts: 0,
          filmedCount: 0,
          approvedCount: 0,
          draftCount: 0,
          scriptTypes: [],
          recentScripts: [],
        };
      }

      let filmedCount = 0;
      let approvedCount = 0;
      let draftCount = 0;
      const typeMap = new Map<string, number>();

      for (const s of all) {
        if (s.filmed) filmedCount++;
        if (s.status === "approved") approvedCount++;
        if (s.status === "draft" || !s.status) draftCount++;

        const t = s.script_type ?? "General";
        typeMap.set(t, (typeMap.get(t) ?? 0) + 1);
      }

      return {
        totalScripts: all.length,
        filmedCount,
        approvedCount,
        draftCount,
        scriptTypes: Array.from(typeMap.entries())
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        recentScripts: all.slice(0, 10).map((s) => ({
          id: s.id,
          title: s.title ?? "Untitled Script",
          status: s.status ?? "draft",
          filmed: s.filmed ?? false,
          scriptType: s.script_type ?? "—",
          createdAt: s.created_at,
        })),
      };
    },
    enabled: isAuthenticated && !!tenantId && !!userId,
    staleTime: 60_000,
  });

  if (isLoading) return <CCSkeleton />;

  if (!stats || stats.totalScripts === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface-card p-12">
        <p className="text-sm font-medium text-foreground-strong">No Content Data Yet</p>
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Scripts and content metrics will appear once this creator begins authoring studio scripts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard title="Total Scripts" value={String(stats.totalScripts)} />
        <StatCard title="Filmed" value={String(stats.filmedCount)} changeColor="success" />
        <StatCard title="Approved" value={String(stats.approvedCount)} />
        <StatCard title="In Draft" value={String(stats.draftCount)} />
      </div>

      {/* ── Script Types ── */}
      {stats.scriptTypes.length > 0 && (
        <div className="rounded-lg border border-border bg-surface-card p-3 md:p-4">
          <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
            Script Types
          </h3>
          <div className="space-y-2">
            {stats.scriptTypes.map((t) => (
              <div key={t.type} className="flex items-center gap-3">
                <span className="min-w-[100px] truncate text-xs text-muted-foreground">
                  {t.type}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-overlay">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.round((t.count / stats.totalScripts) * 100)}%`,
                    }}
                  />
                </div>
                <span className="min-w-[28px] text-right text-xs tabular-nums text-foreground-strong">
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Scripts ── */}
      <div>
        <h3 className="mb-3 font-display text-xs font-medium text-foreground-strong">
          Recent Scripts
        </h3>
        <div className="overflow-hidden rounded-lg border border-border bg-surface-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-overlay/50">
                <th className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground">
                  Title
                </th>
                <th className="hidden px-3 py-2 text-left text-[11px] font-medium text-muted-foreground sm:table-cell">
                  Type
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-medium text-muted-foreground">
                  Filmed
                </th>
                <th className="hidden px-3 py-2 text-right text-[11px] font-medium text-muted-foreground md:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentScripts.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2">
                    <p className="truncate text-xs font-medium text-foreground-strong">{s.title}</p>
                  </td>
                  <td className="hidden px-3 py-2 text-xs text-muted-foreground sm:table-cell">
                    {s.scriptType}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-3 py-2 text-center text-xs">
                    {s.filmed ? (
                      <span className="text-emerald-400">✓</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-2 text-right text-[10px] text-muted-foreground md:table-cell">
                    {formatDistanceToNow(new Date(s.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-400",
    draft: "bg-gray-500/10 text-gray-400",
    review: "bg-amber-500/10 text-amber-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${colors[status] ?? "bg-gray-500/10 text-gray-400"}`}
    >
      {status}
    </span>
  );
}

function CCSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-border bg-surface-card"
          />
        ))}
      </div>
      <div className="h-[200px] animate-pulse rounded-lg border border-border bg-surface-card" />
    </div>
  );
}
