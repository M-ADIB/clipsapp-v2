/**
 * PlatformDashboard — Cross-tenant command center for platform super admins.
 *
 * Shows high-level KPIs across ALL tenants: total tenants, users, clients,
 * videos, and a list of recent tenants for quick access.
 */
import { useNavigate } from "@tanstack/react-router";
import { FullBleed } from "@/components/app-shell/FullBleed";
import {
  Building2,
  Users,
  UserCheck,
  Video,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  Shield,
} from "lucide-react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useEffect } from "react";
import { usePlatformStats, useAllTenants } from "@/hooks/use-platform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ── Status badge colors ─────────────────────────────────────── */

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  trial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  suspended: "bg-red-500/15 text-red-400 border-red-500/30",
  churned: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const PLAN_STYLE: Record<string, string> = {
  free: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  starter: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  enterprise: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function PlatformDashboard() {
  const { setHeaderConfig } = useWorkspaceHeader();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: tenants, isLoading: tenantsLoading } = useAllTenants();

  useEffect(() => {
    setHeaderConfig({
      title: "Platform Overview",
    });
  }, [setHeaderConfig]);

  const recentTenants = (tenants ?? []).slice(0, 8);
  const trialTenants = (tenants ?? []).filter((t) => t.status === "trial");
  const suspendedTenants = (tenants ?? []).filter((t) => t.status === "suspended");

  const isLoading = statsLoading || tenantsLoading;

  return (
    <FullBleed>
      <div className="space-y-6 px-3 py-5 md:px-5 md:py-6">
        {/* ── KPI Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <KPICard
            icon={Building2}
            label="Total Tenants"
            value={stats?.total ?? 0}
            loading={isLoading}
            detail={`${stats?.active ?? 0} active`}
          />
          <KPICard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            loading={isLoading}
            detail="Across all tenants"
          />
          <KPICard
            icon={UserCheck}
            label="Total Clients"
            value={stats?.totalClients ?? 0}
            loading={isLoading}
            detail="Across all tenants"
          />
          <KPICard
            icon={Video}
            label="Total Videos"
            value={stats?.totalVideos ?? 0}
            loading={isLoading}
            detail="Across all tenants"
          />
        </div>

        {/* ── Status Breakdown ─────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Needs Attention */}
          <div className="rounded-xl border border-border bg-surface-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground-strong">Needs Attention</h3>
            </div>
            {trialTenants.length === 0 && suspendedTenants.length === 0 ? (
              <p className="text-sm text-foreground-muted">All tenants are healthy ✨</p>
            ) : (
              <div className="space-y-2">
                {trialTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      navigate({ to: "/platform/tenants/$tenantId", params: { tenantId: t.id } })
                    }
                    className="flex w-full items-center justify-between rounded-lg bg-surface-raised/50 px-3 py-2 text-left transition-colors hover:bg-surface-raised cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-sm text-foreground-strong">{t.name}</span>
                    </div>
                    <Badge variant="outline" className={STATUS_STYLE.trial}>
                      Trial
                    </Badge>
                  </button>
                ))}
                {suspendedTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      navigate({ to: "/platform/tenants/$tenantId", params: { tenantId: t.id } })
                    }
                    className="flex w-full items-center justify-between rounded-lg bg-surface-raised/50 px-3 py-2 text-left transition-colors hover:bg-surface-raised cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-sm text-foreground-strong">{t.name}</span>
                    </div>
                    <Badge variant="outline" className={STATUS_STYLE.suspended}>
                      Suspended
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tenant Status Breakdown */}
          <div className="rounded-xl border border-border bg-surface-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground-strong">Status Breakdown</h3>
            <div className="space-y-2.5">
              {[
                { label: "Active", count: stats?.active ?? 0, color: "bg-emerald-400" },
                { label: "Trial", count: stats?.trial ?? 0, color: "bg-amber-400" },
                { label: "Suspended", count: stats?.suspended ?? 0, color: "bg-red-400" },
                { label: "Churned", count: stats?.churned ?? 0, color: "bg-zinc-400" },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="flex-1 text-sm text-foreground-muted">{label}</span>
                  <span className="text-sm font-semibold text-foreground-strong">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Tenants ───────────────────────────────── */}
        <div className="rounded-xl border border-border bg-surface-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground-strong">All Tenants</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate({ to: "/platform/tenants" })}
                className="text-xs text-foreground-muted"
              >
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              <Button size="sm" onClick={() => navigate({ to: "/platform/tenants/new" })}>
                <Plus className="mr-1 h-3.5 w-3.5" /> New Tenant
              </Button>
            </div>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-raised" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 animate-pulse rounded bg-surface-raised" />
                    <div className="h-3 w-20 animate-pulse rounded bg-surface-raised" />
                  </div>
                </div>
              ))
            ) : recentTenants.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Building2 className="mx-auto mb-2 h-8 w-8 text-foreground-muted" />
                <p className="text-sm text-foreground-muted">No tenants yet</p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate({ to: "/platform/tenants/new" })}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Create First Tenant
                </Button>
              </div>
            ) : (
              recentTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() =>
                    navigate({ to: "/platform/tenants/$tenantId", params: { tenantId: tenant.id } })
                  }
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-raised/30 cursor-pointer"
                >
                  {/* Logo / Initials */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {tenant.logo_url ? (
                      <img
                        src={tenant.logo_url}
                        alt={tenant.name}
                        className="h-6 w-6 object-contain"
                      />
                    ) : (
                      tenant.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground-strong">
                        {tenant.name}
                      </p>
                      {tenant.is_platform_tenant && (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/30 text-[10px]"
                        >
                          Platform
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-foreground-muted">
                      {tenant.slug}
                      {tenant.domain ? ` · ${tenant.domain}` : ""}
                    </p>
                  </div>

                  {/* Status + Plan */}
                  <div className="hidden items-center gap-2 md:flex">
                    <Badge
                      variant="outline"
                      className={PLAN_STYLE[tenant.plan ?? "free"] ?? PLAN_STYLE.free}
                    >
                      {tenant.plan ?? "free"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLE[tenant.status] ?? STATUS_STYLE.active}
                    >
                      {tenant.status}
                    </Badge>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-foreground-disabled" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </FullBleed>
  );
}

/* ── KPI Card ──────────────────────────────────────────────── */

function KPICard({
  icon: Icon,
  label,
  value,
  detail,
  loading,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
  detail?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </span>
        <span className="text-xs font-medium text-foreground-muted">{label}</span>
      </div>
      {loading ? (
        <div className="h-7 w-16 animate-pulse rounded bg-surface-raised" />
      ) : (
        <p className="text-2xl font-bold tracking-tight text-foreground-strong">
          {value.toLocaleString()}
        </p>
      )}
      {detail && <p className="mt-0.5 text-[11px] text-foreground-disabled">{detail}</p>}
    </div>
  );
}
