/**
 * Stateless dashboard placeholder used by every role's home page during
 * Sprint 1. Real role-specific dashboards land in Sprint 2+.
 */
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL } from "@/integrations/supabase/db-types";

export function RoleDashboardPlaceholder() {
  const auth = useAuth();
  const roleLabel = auth.role ? ROLE_LABEL[auth.role] : "Unknown";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface-card p-8">
        <p className="text-eyebrow uppercase text-label-uppercase">Welcome</p>
        <h1 className="mt-2 font-display text-display-xl text-foreground">
          {auth.profile?.full_name ?? auth.user?.email ?? "there"}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground-muted">
          You're signed in as <span className="text-primary">{roleLabel}</span>. The full{" "}
          {roleLabel.toLowerCase()} dashboard ships in Sprint 2 — for now, this placeholder confirms
          auth, routing, and the AppShell are wired.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(["Tenant", "Role", "User ID"] as const).map((label, idx) => {
          const value = [auth.tenantId ?? "—", roleLabel, auth.user?.id ?? "—"][idx];
          return (
            <div key={label} className="rounded-md border border-border bg-surface-card-2 p-4">
              <p className="text-eyebrow uppercase text-label-uppercase">{label}</p>
              <p className="mt-2 truncate font-mono text-sm text-foreground-strong">{value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
