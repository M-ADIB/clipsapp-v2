/**
 * Platform Billing — Plan tier management page.
 * Reads plans from `platform_plans` DB table (fully editable).
 */
import { useEffect, useState } from "react";
import {
  CreditCard,
  Building2,
  Users,
  Briefcase,
  Check,
  Zap,
  Crown,
  Sparkles,
  Pencil,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAllTenants,
  usePlatformPlans,
  useUpdatePlan,
  type PlatformPlan,
} from "@/hooks/use-platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/platform/billing")({
  component: PlatformBilling,
});

/* ── Icon map for plans ──────────────────────────────────────── */

const PLAN_ICONS: Record<string, typeof Zap> = {
  free: Zap,
  starter: Sparkles,
  pro: Crown,
  enterprise: Building2,
};

const PLAN_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  free: { text: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
  starter: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  pro: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  enterprise: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

const DEFAULT_COLORS = { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };

/* ── Helpers ─────────────────────────────────────────────────── */

function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "$0";
  return `$${(priceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ── Edit Plan Dialog ────────────────────────────────────────── */

function EditPlanDialog({
  plan,
  open,
  onClose,
}: {
  plan: PlatformPlan;
  open: boolean;
  onClose: () => void;
}) {
  const updatePlan = useUpdatePlan();

  const [name, setName] = useState(plan.name);
  const [priceDollars, setPriceDollars] = useState(
    plan.slug === "enterprise" ? "" : String(plan.price_cents / 100),
  );
  const [maxUsers, setMaxUsers] = useState(String(plan.max_users));
  const [maxClients, setMaxClients] = useState(String(plan.max_clients));
  const [isPopular, setIsPopular] = useState(plan.is_popular);
  const [features, setFeatures] = useState<string[]>(plan.features);
  const [newFeature, setNewFeature] = useState("");

  // Reset when plan changes
  useEffect(() => {
    setName(plan.name);
    setPriceDollars(plan.slug === "enterprise" ? "" : String(plan.price_cents / 100));
    setMaxUsers(String(plan.max_users));
    setMaxClients(String(plan.max_clients));
    setIsPopular(plan.is_popular);
    setFeatures([...plan.features]);
    setNewFeature("");
  }, [plan]);

  const handleAddFeature = () => {
    const trimmed = newFeature.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const priceCents = plan.slug === "enterprise" ? 0 : Math.round(Number(priceDollars) * 100);
    updatePlan.mutate(
      {
        planId: plan.id,
        updates: {
          name,
          price_cents: priceCents,
          max_users: Number(maxUsers),
          max_clients: Number(maxClients),
          is_popular: isPopular,
          features,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Plan — {plan.name}</DialogTitle>
          <DialogDescription>
            Update plan details. Changes take effect immediately for all tenants on this plan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starter"
            />
          </div>

          {/* Price */}
          <div className="grid gap-1.5">
            <Label htmlFor="plan-price">
              Monthly Price (USD)
              {plan.slug === "enterprise" && (
                <span className="ml-2 text-xs text-foreground-muted">
                  Enterprise = custom pricing
                </span>
              )}
            </Label>
            {plan.slug === "enterprise" ? (
              <Input disabled value="Custom" />
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                  $
                </span>
                <Input
                  id="plan-price"
                  type="number"
                  min="0"
                  step="1"
                  className="pl-7"
                  value={priceDollars}
                  onChange={(e) => setPriceDollars(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="plan-max-users">Max Team Members</Label>
              <Input
                id="plan-max-users"
                type="number"
                min="1"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="plan-max-clients">Max Clients</Label>
              <Input
                id="plan-max-clients"
                type="number"
                min="1"
                value={maxClients}
                onChange={(e) => setMaxClients(e.target.value)}
              />
            </div>
          </div>

          {/* Popular toggle */}
          <div className="flex items-center gap-3">
            <Switch id="plan-popular" checked={isPopular} onCheckedChange={setIsPopular} />
            <Label htmlFor="plan-popular" className="cursor-pointer">
              Mark as "Most Popular"
            </Label>
          </div>

          {/* Features */}
          <div className="grid gap-1.5">
            <Label>Features</Label>
            <div className="space-y-1.5">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                >
                  <span className="flex-1 text-foreground-muted">{f}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-foreground-disabled hover:text-status-danger transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add a feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFeature}
                disabled={!newFeature.trim()}
                className="shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {updatePlan.isError && (
            <div className="text-sm text-status-danger">{updatePlan.error.message}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updatePlan.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updatePlan.isPending || !name.trim()}>
            {updatePlan.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Component ──────────────────────────────────────────── */

function PlatformBilling() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { isPlatformAdmin } = useAuth();
  const { data: tenants } = useAllTenants();
  const { data: plans, isLoading: plansLoading } = usePlatformPlans();

  const [editingPlan, setEditingPlan] = useState<PlatformPlan | null>(null);

  useEffect(() => {
    setHeaderConfig({ title: "Billing & Plans" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  if (!isPlatformAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-foreground-muted">Access denied.</p>
      </div>
    );
  }

  // Count tenants per plan
  const nonPlatformTenants = (tenants ?? []).filter((t) => !t.is_platform_tenant);
  const planCounts: Record<string, number> = {};
  nonPlatformTenants.forEach((t) => {
    const plan = t.plan ?? "free";
    planCounts[plan] = (planCounts[plan] ?? 0) + 1;
  });

  // Calculate MRR from actual DB plan prices
  const activePlans = plans ?? [];
  const mrr = nonPlatformTenants.reduce((sum, tenant) => {
    const tenantPlan = activePlans.find((p) => p.slug === (tenant.plan ?? "free"));
    return sum + (tenantPlan?.price_cents ?? 0) / 100;
  }, 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ── Revenue Overview ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-border bg-surface-card">
          <CardContent className="p-4">
            <p className="text-xs text-foreground-muted">Total Tenants</p>
            <p className="text-2xl font-bold text-foreground-strong tabular-nums">
              {nonPlatformTenants.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface-card">
          <CardContent className="p-4">
            <p className="text-xs text-foreground-muted">Paid Tenants</p>
            <p className="text-2xl font-bold text-foreground-strong tabular-nums">
              {nonPlatformTenants.filter((t) => t.plan && t.plan !== "free").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface-card">
          <CardContent className="p-4">
            <p className="text-xs text-foreground-muted">Free Tenants</p>
            <p className="text-2xl font-bold text-foreground-strong tabular-nums">
              {nonPlatformTenants.filter((t) => !t.plan || t.plan === "free").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface-card">
          <CardContent className="p-4">
            <p className="text-xs text-foreground-muted">Est. MRR</p>
            <p className="text-2xl font-bold text-foreground-strong tabular-nums">
              ${mrr.toLocaleString()}
            </p>
            <p className="text-xs text-foreground-muted mt-0.5">+ custom enterprise</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Plan Cards ───────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground-strong">Available Plans</h3>
        {plansLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {activePlans.map((plan) => {
              const colors = PLAN_COLORS[plan.slug] ?? DEFAULT_COLORS;
              const Icon = PLAN_ICONS[plan.slug] ?? Zap;
              const count = planCounts[plan.slug] ?? 0;
              const isEnterprise = plan.slug === "enterprise";

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "group relative border bg-surface-card transition-colors",
                    plan.is_popular
                      ? "border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb,124,58,237),0.08)]"
                      : "border-border",
                  )}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Edit button */}
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="absolute top-3 right-3 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-raised/80 hover:bg-surface-raised text-foreground-muted hover:text-foreground-strong"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <CardHeader className="pb-2 pt-5">
                    <div className={cn("inline-flex rounded-lg p-2", colors.bg)}>
                      <Icon className={cn("h-5 w-5", colors.text)} />
                    </div>
                    <CardTitle className="mt-2 text-base font-bold text-foreground-strong">
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-bold text-foreground-strong">
                        {isEnterprise ? "Custom" : formatPrice(plan.price_cents)}
                      </span>
                      {!isEnterprise && (
                        <span className="text-sm text-foreground-muted">/{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Limits badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-foreground-muted">
                        <Users className="h-3 w-3" />
                        {plan.max_users >= 999 ? "Unlimited" : plan.max_users} users
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-foreground-muted">
                        <Briefcase className="h-3 w-3" />
                        {plan.max_clients >= 999 ? "Unlimited" : plan.max_clients} clients
                      </div>
                    </div>

                    {/* Tenant count */}
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-foreground-muted" />
                      <span className="text-xs text-foreground-muted">
                        {count} tenant{count !== 1 ? "s" : ""} on this plan
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", colors.text)} />
                          <span className="text-foreground-muted">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Info ──────────────────────────────────────────── */}
      <Card className="border-border bg-surface-card">
        <CardContent className="p-4">
          <p className="text-xs text-foreground-muted">
            <strong className="text-foreground-strong">Tip:</strong> Hover over any plan card and
            click the pencil icon to edit its name, pricing, limits, and features. Changes are saved
            to the database and apply to all tenants on that plan.
          </p>
        </CardContent>
      </Card>

      {/* ── Edit Dialog ────────────────────────────────────── */}
      {editingPlan && (
        <EditPlanDialog
          plan={editingPlan}
          open={!!editingPlan}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}
