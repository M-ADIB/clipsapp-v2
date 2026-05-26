/**
 * Create Tenant Wizard — 4-step form to provision a new agency.
 * Steps: Agency Info → Branding → Plan → Review & Create
 */
import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Palette,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateTenant } from "@/hooks/use-platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/platform/tenants/new")({
  component: CreateTenantWizard,
});

/* ── Types ───────────────────────────────────────────────────── */

interface WizardData {
  // Step 1 — Agency Info
  name: string;
  slug: string;
  domain: string;
  owner_email: string;
  // Step 2 — Branding
  primary_color: string;
  theme_mode: "dark" | "light";
  // Step 3 — Plan
  plan: string;
  max_users: number;
  max_clients: number;
  trial_days: number;
}

const INITIAL: WizardData = {
  name: "",
  slug: "",
  domain: "",
  owner_email: "",
  primary_color: "#ECD7FF",
  theme_mode: "dark",
  plan: "starter",
  max_users: 10,
  max_clients: 20,
  trial_days: 14,
};

const STEPS = [
  { label: "Agency Info", icon: Building2 },
  { label: "Branding", icon: Palette },
  { label: "Plan", icon: CreditCard },
  { label: "Review", icon: ClipboardList },
];

const PLAN_OPTIONS = [
  { value: "free", label: "Free", users: 3, clients: 5, price: "$0/mo" },
  { value: "starter", label: "Starter", users: 10, clients: 20, price: "$99/mo" },
  { value: "pro", label: "Pro", users: 30, clients: 50, price: "$249/mo" },
  { value: "enterprise", label: "Enterprise", users: 999, clients: 999, price: "Custom" },
];

/* ── Component ───────────────────────────────────────────────── */

function CreateTenantWizard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { isPlatformAdmin } = useAuth();
  const navigate = useNavigate();
  const createTenant = useCreateTenant();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL);

  useEffect(() => {
    setHeaderConfig({ title: "Create Tenant" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const update = useCallback(<K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-generate slug from name
      if (key === "name") {
        next.slug = (value as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      // Auto-set limits from plan
      if (key === "plan") {
        const plan = PLAN_OPTIONS.find((p) => p.value === value);
        if (plan) {
          next.max_users = plan.users;
          next.max_clients = plan.clients;
        }
      }
      return next;
    });
  }, []);

  const canProceed = () => {
    if (step === 0)
      return (
        data.name.trim().length > 0 && data.slug.trim().length > 0 && data.owner_email.includes("@")
      );
    return true;
  };

  const handleCreate = async () => {
    try {
      const trialEnds =
        data.trial_days > 0
          ? new Date(Date.now() + data.trial_days * 86400000).toISOString()
          : null;

      await createTenant.mutateAsync({
        name: data.name,
        slug: data.slug,
        domain: data.domain || undefined,
        owner_email: data.owner_email,
        plan: data.plan,
        max_users: data.max_users,
        max_clients: data.max_clients,
        trial_ends_at: trialEnds,
        brand_colors: {
          dark: { primary: data.primary_color },
          light: { primary: data.primary_color },
        },
        settings: {
          theme_mode: data.theme_mode,
          app_name: data.name,
        },
      });

      toast.success(`${data.name} has been provisioned successfully.`);

      void navigate({ to: "/platform/tenants" });
    } catch (err) {
      toast.error(`Failed to create tenant: ${String(err)}`);
    }
  };

  if (!isPlatformAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-foreground-muted">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* ── Step indicator ──────────────────────────────── */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCompleted = i < step;
          const isCurrent = i === step;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-foreground-disabled",
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium md:inline",
                  isCurrent ? "text-foreground-strong" : "text-foreground-muted",
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn("mx-1 h-px w-8 md:w-12", i < step ? "bg-primary" : "bg-border")}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step content ────────────────────────────────── */}
      <Card className="border-border bg-surface-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground-strong">
            {STEPS[step].label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label className="text-sm">Agency Name *</Label>
                <Input
                  placeholder="Acme Content Agency"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Slug *</Label>
                <Input
                  placeholder="acme-content"
                  value={data.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-foreground-muted">
                  Used in URLs: {data.slug || "agency-slug"}.clipsos.app
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Custom Domain</Label>
                <Input
                  placeholder="acme.agency (optional)"
                  value={data.domain}
                  onChange={(e) => update("domain", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Owner Email *</Label>
                <Input
                  type="email"
                  placeholder="owner@acme.agency"
                  value={data.owner_email}
                  onChange={(e) => update("owner_email", e.target.value)}
                />
                <p className="text-xs text-foreground-muted">
                  The agency owner will be invited to this email.
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label className="text-sm">Primary Brand Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.primary_color}
                    onChange={(e) => update("primary_color", e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-border bg-surface-card"
                  />
                  <Input
                    value={data.primary_color}
                    onChange={(e) => update("primary_color", e.target.value)}
                    className="font-mono text-sm max-w-[120px]"
                  />
                  <div
                    className="flex-1 rounded-lg py-3 text-center text-sm font-semibold"
                    style={{
                      backgroundColor: data.primary_color,
                      color: data.theme_mode === "dark" ? "#131314" : "#FFFFFF",
                    }}
                  >
                    Preview
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Default Theme</Label>
                <Select
                  value={data.theme_mode}
                  onValueChange={(v) => update("theme_mode", v as "dark" | "light")}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="light">Light Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {PLAN_OPTIONS.map((plan) => (
                  <button
                    key={plan.value}
                    onClick={() => update("plan", plan.value)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors cursor-pointer",
                      data.plan === plan.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface hover:bg-surface-raised/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground-strong">{plan.label}</p>
                      <Badge variant="outline" className="text-xs">
                        {plan.price}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {plan.users === 999 ? "Unlimited" : plan.users} users •{" "}
                      {plan.clients === 999 ? "Unlimited" : plan.clients} clients
                    </p>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm">Max Users</Label>
                  <Input
                    type="number"
                    value={data.max_users}
                    onChange={(e) => update("max_users", Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Max Clients</Label>
                  <Input
                    type="number"
                    value={data.max_clients}
                    onChange={(e) => update("max_clients", Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Trial Days</Label>
                  <Input
                    type="number"
                    value={data.trial_days}
                    onChange={(e) => update("trial_days", Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-foreground-muted">
                Review the details below and click &quot;Create Tenant&quot; to provision this
                agency.
              </p>

              {[
                { label: "Agency Name", value: data.name },
                { label: "Slug", value: data.slug },
                { label: "Domain", value: data.domain || "—" },
                { label: "Owner Email", value: data.owner_email },
                { label: "Primary Color", value: data.primary_color },
                { label: "Theme", value: data.theme_mode },
                { label: "Plan", value: data.plan },
                { label: "Max Users", value: String(data.max_users) },
                { label: "Max Clients", value: String(data.max_clients) },
                { label: "Trial Days", value: String(data.trial_days) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <span className="text-xs font-medium text-foreground-muted">{row.label}</span>
                  <span className="text-sm text-foreground-strong">
                    {row.label === "Primary Color" ? (
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded border border-border"
                          style={{ backgroundColor: row.value }}
                        />
                        <span className="font-mono text-xs">{row.value}</span>
                      </span>
                    ) : (
                      row.value
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Navigation buttons ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            step === 0 ? navigate({ to: "/platform/tenants" }) : setStep((s) => s - 1)
          }
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button size="sm" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Next
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleCreate} disabled={createTenant.isPending}>
            {createTenant.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            )}
            Create Tenant
          </Button>
        )}
      </div>
    </div>
  );
}
