/**
 * IntegrationsSettingsPanel — Tab content for Settings > Integrations
 *
 * Embedded version of integrations management. Does NOT set its own header
 * (the parent OwnerSettingsPage handles that).
 *
 * Uses V2 design tokens only — no legacy surface or brand classes.
 */
import React, { useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageSquare,
  ExternalLink,
  Plus,
  DollarSign,
  Mail,
  Loader2,
} from "lucide-react";
import { useTenantSettings } from "@/hooks/use-tenant-settings";
import { useCloserRegion } from "@/hooks/use-closer-region";
import { StripeSettingsDialog } from "./StripeSettingsDialog";
import { SlackSettingsDialog } from "./SlackSettingsDialog";
import { ResendSettingsDialog } from "./ResendSettingsDialog";
import { CalendlySettingsDialog } from "@/components/dashboards/closer/CalendlySettingsDialog";

export function IntegrationsSettingsPanel() {
  const { settings, isLoading: settingsLoading } = useTenantSettings();
  const { data: region, isLoading: regionLoading } = useCloserRegion();

  const [stripeOpen, setStripeOpen] = useState(false);
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const [slackOpen, setSlackOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);

  const stripeConnected = !!(settings?.stripe_public_key && settings?.stripe_secret_key);
  const calendlyConnected = !!region?.calendly_api_key;
  const slackConnected = !!settings?.slack_webhook_url;
  const resendConnected = !!settings?.resend_api_key;

  const isLoading = settingsLoading || regionLoading;

  const integrations = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing and subscription management.",
      icon: <DollarSign className="w-7 h-7 text-status-info" />,
      connected: stripeConnected,
      onManage: () => setStripeOpen(true),
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Automated meeting scheduling for the sales team.",
      icon: <Calendar className="w-7 h-7 text-status-info" />,
      connected: calendlyConnected,
      onManage: () => setCalendlyOpen(true),
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team notifications and client communication channels.",
      icon: <MessageSquare className="w-7 h-7 text-status-danger" />,
      connected: slackConnected,
      onManage: () => setSlackOpen(true),
    },
    {
      id: "resend",
      name: "Resend",
      description: "Transactional email and campaign delivery.",
      icon: <Mail className="w-7 h-7 text-foreground-muted" />,
      connected: resendConnected,
      onManage: () => setResendOpen(true),
    },
  ];

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* Action bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-foreground-muted md:text-sm">
            Connect third-party services to automate workflows.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex flex-col p-5 rounded-xl border border-border bg-surface-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-surface-raised rounded-lg">{integration.icon}</div>
                  <StatusBadge
                    variant={integration.connected ? "approved" : "draft"}
                    label={integration.connected ? "Connected" : "Not Connected"}
                  />
                </div>
                <h3 className="text-base font-semibold text-foreground-strong mb-1">
                  {integration.name}
                </h3>
                <p className="text-sm text-foreground-muted mb-6 flex-grow">
                  {integration.description}
                </p>

                <div className="mt-auto pt-4 border-t border-border">
                  <button
                    onClick={integration.onManage}
                    className="text-sm font-medium text-primary hover:text-primary-glow flex items-center gap-1 transition-colors"
                  >
                    {integration.connected ? "Manage settings" : "Connect account"}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Dialogs */}
      <StripeSettingsDialog open={stripeOpen} onOpenChange={setStripeOpen} />
      <CalendlySettingsDialog open={calendlyOpen} onOpenChange={setCalendlyOpen} />
      <SlackSettingsDialog open={slackOpen} onOpenChange={setSlackOpen} />
      <ResendSettingsDialog open={resendOpen} onOpenChange={setResendOpen} />
    </FullBleed>
  );
}
