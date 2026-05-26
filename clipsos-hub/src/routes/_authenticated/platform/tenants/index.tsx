/**
 * Tenant Directory — List of all agencies on the platform.
 * Searchable, filterable table with status badges and quick actions.
 */
import { useEffect, useState, useMemo } from "react";
import { Building2, Plus, Search, Users, Video, Briefcase } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAllTenants } from "@/hooks/use-platform";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/platform/tenants/")({
  component: TenantDirectory,
});

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  trial: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  suspended: "bg-red-500/15 text-red-400 border-red-500/20",
  churned: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

const PLAN_STYLES: Record<string, string> = {
  free: "border-zinc-500/20 text-zinc-400",
  starter: "border-blue-500/20 text-blue-400",
  pro: "border-violet-500/20 text-violet-400",
  enterprise: "border-amber-500/20 text-amber-400",
};

function TenantDirectory() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { isPlatformAdmin } = useAuth();
  const { data: tenants, isLoading } = useAllTenants();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  useEffect(() => {
    setHeaderConfig({ title: "Tenants" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const filtered = useMemo(() => {
    let list = tenants ?? [];

    // Exclude the platform tenant itself
    list = list.filter((t) => !t.is_platform_tenant);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.owner_email?.toLowerCase().includes(q) ?? false),
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (planFilter !== "all") {
      list = list.filter((t) => (t.plan ?? "free") === planFilter);
    }

    return list;
  }, [tenants, search, statusFilter, planFilter]);

  if (!isPlatformAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-foreground-muted">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Search tenants…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[120px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="h-9 w-[120px] text-sm">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" asChild>
          <Link to="/platform/tenants/new" className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Tenant
          </Link>
        </Button>
      </div>

      {/* ── Results ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border bg-surface-card">
              <CardContent className="p-4">
                <div className="h-10 rounded bg-surface-raised" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border bg-surface-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="mb-3 h-12 w-12 text-foreground-disabled" />
            <p className="text-sm font-medium text-foreground-muted">
              {search || statusFilter !== "all" || planFilter !== "all"
                ? "No tenants match your filters"
                : "No tenants created yet"}
            </p>
            {!search && statusFilter === "all" && planFilter === "all" && (
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/platform/tenants/new">Create First Tenant</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((tenant) => (
            <Link
              key={tenant.id}
              to={"/platform/tenants/$tenantId" as string}
              params={{ tenantId: tenant.id }}
              className="block"
            >
              <Card className="border-border bg-surface-card transition-colors hover:bg-surface-raised/50 cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {tenant.logo_url ? (
                      <img
                        src={tenant.logo_url}
                        alt={tenant.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {tenant.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                    {/* Info */}
                    <div>
                      <p className="text-sm font-semibold text-foreground-strong">{tenant.name}</p>
                      <p className="text-xs text-foreground-muted">
                        {tenant.slug}
                        {tenant.domain ? ` • ${tenant.domain}` : ""}
                        {tenant.owner_email ? ` • ${tenant.owner_email}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Right side — stats + badges */}
                  <div className="flex items-center gap-4">
                    <div className="hidden items-center gap-4 text-xs text-foreground-muted md:flex">
                      <span className="flex items-center gap-1" title="Max users">
                        <Users className="h-3 w-3" /> {tenant.max_users}
                      </span>
                      <span className="flex items-center gap-1" title="Max clients">
                        <Briefcase className="h-3 w-3" /> {tenant.max_clients}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[tenant.status] ?? STATUS_STYLES.active}
                    >
                      {tenant.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={PLAN_STYLES[tenant.plan ?? "free"] ?? PLAN_STYLES.free}
                    >
                      {tenant.plan ?? "free"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* ── Summary ─────────────────────────────────────── */}
      <p className="text-xs text-foreground-disabled text-center pt-2">
        Showing {filtered.length} of {(tenants ?? []).filter((t) => !t.is_platform_tenant).length}{" "}
        tenants
      </p>
    </div>
  );
}
