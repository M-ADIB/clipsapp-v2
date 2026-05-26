/**
 * Platform Dashboard — Cross-tenant command center.
 * Shows aggregate KPIs across all tenants on the platform.
 */
import { useEffect } from "react";
import {
  Shield,
  Building2,
  Users,
  Video,
  UserPlus,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformStats, useAllTenants } from "@/hooks/use-platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/platform/")({
  component: PlatformDashboard,
});

/* ── Status badge colors ─────────────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  trial: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  suspended: "bg-red-500/15 text-red-400 border-red-500/20",
  churned: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

function PlatformDashboard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { isPlatformAdmin } = useAuth();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: tenants, isLoading: tenantsLoading } = useAllTenants();

  useEffect(() => {
    setHeaderConfig({ title: "Platform Overview" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  if (!isPlatformAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-foreground-muted">You do not have platform admin access.</p>
      </div>
    );
  }

  const recentTenants = (tenants ?? []).filter((t) => !t.is_platform_tenant).slice(0, 5);

  const attentionItems: { label: string; detail: string; type: "warning" | "info" }[] = [];

  // Check for trial tenants nearing expiry
  (tenants ?? []).forEach((t) => {
    if (t.status === "trial" && t.trial_ends_at) {
      const daysLeft = Math.ceil(
        (new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      if (daysLeft <= 7 && daysLeft > 0) {
        attentionItems.push({
          label: t.name,
          detail: `Trial expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
          type: "warning",
        });
      } else if (daysLeft <= 0) {
        attentionItems.push({
          label: t.name,
          detail: "Trial expired",
          type: "warning",
        });
      }
    }
    if (t.status === "suspended") {
      attentionItems.push({
        label: t.name,
        detail: "Account suspended",
        type: "warning",
      });
    }
  });

  const isLoading = statsLoading || tenantsLoading;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard
          label="Total Tenants"
          value={stats?.total ?? 0}
          icon={Building2}
          loading={isLoading}
          sub={`${stats?.active ?? 0} active`}
        />
        <KpiCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          loading={isLoading}
        />
        <KpiCard
          label="Total Clients"
          value={stats?.totalClients ?? 0}
          icon={UserPlus}
          loading={isLoading}
        />
        <KpiCard
          label="Total Videos"
          value={stats?.totalVideos ?? 0}
          icon={Video}
          loading={isLoading}
        />
      </div>

      {/* ── Two-column layout ──────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Needs Attention */}
        <Card className="border-border bg-surface-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground-strong">
              <span className="text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </span>
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attentionItems.length === 0 ? (
              <p className="text-sm text-foreground-muted">
                All clear — no items need attention right now.
              </p>
            ) : (
              attentionItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground-strong">{item.label}</p>
                    <p className="text-xs text-foreground-muted">{item.detail}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.type === "warning"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    }
                  >
                    {item.type === "warning" ? "Action needed" : "Info"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-border bg-surface-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground-strong">
              <span className="text-primary">
                <TrendingUp className="h-4 w-4" />
              </span>
              Tenant Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(
                [
                  { label: "Active", count: stats?.active ?? 0, status: "active" },
                  { label: "Trial", count: stats?.trial ?? 0, status: "trial" },
                  { label: "Suspended", count: stats?.suspended ?? 0, status: "suspended" },
                  { label: "Churned", count: stats?.churned ?? 0, status: "churned" },
                ] as const
              ).map((row) => (
                <div
                  key={row.status}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={STATUS_STYLES[row.status]}>
                      {row.label}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-foreground-strong tabular-nums">
                    {isLoading ? "…" : row.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Tenants ─────────────────────────────── */}
      <Card className="border-border bg-surface-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold text-foreground-strong">
            Recent Tenants
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/platform/tenants" className="flex items-center gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="mb-3 h-10 w-10 text-foreground-disabled" />
              <p className="text-sm text-foreground-muted">No tenants yet</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/platform/tenants/new">Create First Tenant</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTenants.map((tenant) => (
                <Link
                  key={tenant.id}
                  to={"/platform/tenants/$tenantId" as string}
                  params={{ tenantId: tenant.id }}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:bg-surface-raised"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground-strong">{tenant.name}</p>
                      <p className="text-xs text-foreground-muted">
                        {tenant.slug} • {tenant.owner_email ?? "No owner"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[tenant.status] ?? STATUS_STYLES.active}
                    >
                      {tenant.status}
                    </Badge>
                    <Badge variant="outline" className="border-border text-foreground-muted">
                      {tenant.plan ?? "free"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── KPI Card ────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  icon: Icon,
  loading,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  sub?: string;
}) {
  return (
    <Card className="border-border bg-surface-card">
      <CardContent className="flex items-start justify-between p-4">
        <div>
          <p className="text-xs font-medium text-foreground-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground-strong tabular-nums">
            {loading ? "…" : value.toLocaleString()}
          </p>
          {sub && <p className="mt-0.5 text-xs text-foreground-muted">{sub}</p>}
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
