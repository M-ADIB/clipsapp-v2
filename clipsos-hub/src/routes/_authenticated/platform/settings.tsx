/**
 * Platform Settings — Global platform configuration.
 */
import { useEffect } from "react";
import { Settings, Shield, Building2, Bell, Lock } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/platform/settings")({
  component: PlatformSettings,
});

function PlatformSettings() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { isPlatformAdmin } = useAuth();

  useEffect(() => {
    setHeaderConfig({ title: "Platform Settings" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  if (!isPlatformAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-foreground-muted">Access denied.</p>
      </div>
    );
  }

  const sections = [
    {
      title: "Platform Identity",
      icon: Shield,
      description:
        "Configure your platform name, logo, and default branding applied to new tenants.",
      status: "Phase 2",
    },
    {
      title: "Default Tenant Settings",
      icon: Building2,
      description:
        "Set the default statuses, video types, and pipeline stages seeded for new tenants.",
      status: "Configured",
    },
    {
      title: "Notifications",
      icon: Bell,
      description:
        "Configure platform-level email notifications for new signups, trial expirations, and payment events.",
      status: "Phase 2",
    },
    {
      title: "Security & Access",
      icon: Lock,
      description:
        "Manage platform admin access, IP whitelisting, and audit log retention policies.",
      status: "Phase 2",
    },
  ];

  return (
    <div className="space-y-4 p-4 md:p-6">
      <p className="text-sm text-foreground-muted">
        Platform-wide settings that apply across all tenants. Individual tenant settings are managed
        from the tenant detail page.
      </p>

      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="border-border bg-surface-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground-strong">
                    <Icon className="h-4 w-4 text-primary" />
                    {section.title}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      section.status === "Configured"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : "bg-zinc-500/15 text-zinc-400 border-zinc-500/20"
                    }
                  >
                    {section.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground-muted">{section.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
