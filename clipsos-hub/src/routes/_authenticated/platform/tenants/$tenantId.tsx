/**
 * Tenant Detail — Master view for a single tenant.
 * Overview, config editing, user list, and management actions.
 */
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Video,
  Briefcase,
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  Calendar,
  Mail,
  Globe,
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant, useTenantCounts, useTenantUsers, useUpdateTenant } from "@/hooks/use-platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ROLE_LABEL } from "@/integrations/supabase/db-types";
import type { AppRole } from "@/integrations/supabase/db-types";

export const Route = createFileRoute("/_authenticated/platform/tenants/$tenantId")({
  component: TenantDetail,
});

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  trial: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  suspended: "bg-red-500/15 text-red-400 border-red-500/20",
  churned: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

function TenantDetail() {
  const { tenantId } = useParams({ from: "/_authenticated/platform/tenants/$tenantId" });
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { isPlatformAdmin } = useAuth();

  const { data: tenant, isLoading } = useTenant(tenantId);
  const { data: counts } = useTenantCounts(tenantId);
  const { data: users } = useTenantUsers(tenantId);
  const updateTenant = useUpdateTenant();

  // Local editing state
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editPlan, setEditPlan] = useState("free");
  const [editMaxUsers, setEditMaxUsers] = useState(10);
  const [editMaxClients, setEditMaxClients] = useState(20);

  useEffect(() => {
    setHeaderConfig({
      title: tenant?.name ?? "Tenant Detail",
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, tenant?.name]);

  // Sync local state when tenant loads
  useEffect(() => {
    if (tenant) {
      setEditName(tenant.name);
      setEditStatus(tenant.status);
      setEditPlan(tenant.plan ?? "free");
      setEditMaxUsers(tenant.max_users);
      setEditMaxClients(tenant.max_clients);
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenantId) return;
    try {
      await updateTenant.mutateAsync({
        tenantId,
        updates: {
          name: editName,
          status: editStatus,
          plan: editPlan,
          max_users: editMaxUsers,
          max_clients: editMaxClients,
        },
      });
      toast.success("Changes saved successfully.");
    } catch (err) {
      toast.error(`Update failed: ${String(err)}`);
    }
  };

  if (!isPlatformAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-foreground-muted">Access denied.</p>
      </div>
    );
  }

  if (isLoading || !tenant) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/platform/tenants" className="flex items-center gap-1.5 text-foreground-muted">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Tenants
        </Link>
      </Button>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
            {tenant.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground-strong">{tenant.name}</h2>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <span>{tenant.slug}</span>
              {tenant.domain && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {tenant.domain}
                  </span>
                </>
              )}
              {tenant.owner_email && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {tenant.owner_email}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <Badge variant="outline" className={STATUS_STYLES[tenant.status] ?? STATUS_STYLES.active}>
          {tenant.status}
        </Badge>
      </div>

      {/* ── KPI Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Users", value: counts?.users ?? 0, max: tenant.max_users, icon: Users },
          {
            label: "Clients",
            value: counts?.clients ?? 0,
            max: tenant.max_clients,
            icon: Briefcase,
          },
          { label: "Videos", value: counts?.videos ?? 0, max: null, icon: Video },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border bg-surface-card">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs text-foreground-muted">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground-strong tabular-nums">
                  {kpi.value}
                  {kpi.max !== null && (
                    <span className="text-sm font-normal text-foreground-muted">/{kpi.max}</span>
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <Tabs defaultValue="config" className="mt-2">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="users">Users ({users?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        {/* Config Tab */}
        <TabsContent value="config" className="mt-4 space-y-4">
          <Card className="border-border bg-surface-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground-strong">
                Tenant Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Plan</Label>
                  <Select value={editPlan} onValueChange={setEditPlan}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max Users</Label>
                  <Input
                    type="number"
                    value={editMaxUsers}
                    onChange={(e) => setEditMaxUsers(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max Clients</Label>
                  <Input
                    type="number"
                    value={editMaxClients}
                    onChange={(e) => setEditMaxClients(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={handleSave} disabled={updateTenant.isPending}>
                  {updateTenant.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <Card className="border-border bg-surface-card">
            <CardContent className="p-0">
              {!users?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-8 w-8 text-foreground-disabled" />
                  <p className="text-sm text-foreground-muted">No users in this tenant yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {users.map((u) => (
                    <div key={u.user_id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {(u.profile?.full_name ?? u.profile?.email ?? "?")
                              .split(" ")
                              .map((w: string) => w[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground-strong">
                            {u.profile?.full_name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {u.profile?.email ?? u.user_id}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-border text-foreground-muted text-xs"
                      >
                        {ROLE_LABEL[u.role as AppRole] ?? u.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-4">
          <Card className="border-border bg-surface-card">
            <CardContent className="space-y-3 p-4">
              {[
                { label: "Tenant ID", value: tenant.id, icon: Shield },
                {
                  label: "Created",
                  value: new Date(tenant.created_at).toLocaleDateString(),
                  icon: Calendar,
                },
                {
                  label: "Last Updated",
                  value: new Date(tenant.updated_at).toLocaleDateString(),
                  icon: Calendar,
                },
                {
                  label: "Trial Ends",
                  value: tenant.trial_ends_at
                    ? new Date(tenant.trial_ends_at).toLocaleDateString()
                    : "N/A",
                  icon: Calendar,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-xs font-medium text-foreground-muted">
                    <row.icon className="h-3 w-3" />
                    {row.label}
                  </span>
                  <span className="font-mono text-xs text-foreground-strong">{row.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
