import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenantSettings } from "@/hooks/use-tenant-settings";
import {
  Settings,
  Key,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clipboard,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface StripeSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StripeSettingsDialog({ open, onOpenChange }: StripeSettingsDialogProps) {
  const { settings, isLoading, isUpdating, updateSettings } = useTenantSettings();
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const webhookUrl = "https://toyekrhhzqmltstrycdv.supabase.co/functions/v1/stripe-webhook";

  useEffect(() => {
    if (settings) {
      setPublicKey(settings.stripe_public_key || "");
      setSecretKey(settings.stripe_secret_key || "");
      setWebhookSecret(settings.stripe_webhook_secret || "");
    }
  }, [settings]);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        stripe_public_key: publicKey.trim(),
        stripe_secret_key: secretKey.trim(),
        stripe_webhook_secret: webhookSecret.trim(),
      });
      toast.success("Stripe integration settings saved!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save Stripe settings");
    }
  };

  const hasConfig = !!settings?.stripe_secret_key && !!settings?.stripe_public_key;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-lg bg-surface-card border-border flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground-strong">
            <Settings className="h-5 w-5 text-primary" />
            Stripe Integration Settings
          </DialogTitle>
          <DialogDescription className="text-foreground-muted">
            Configure your Stripe keys and Webhook to automate billing and sync payments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Status info */}
          <div
            className="flex items-center gap-3 p-3.5 rounded-lg border text-sm"
            style={{
              background: hasConfig ? "rgba(16,185,129,0.05)" : "rgba(245,158,11,0.05)",
              borderColor: hasConfig ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
            }}
          >
            {hasConfig ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            )}
            <div className="text-foreground">
              {hasConfig ? (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Stripe Connected.
                </span>
              ) : (
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Not Connected.
                </span>
              )}{" "}
              Configure keys below to link subscription metrics and auto-process client invoicing.
            </div>
          </div>

          {/* Webhook Endpoint */}
          <div className="space-y-2 p-3 bg-surface-raised rounded-lg border border-border">
            <Label className="text-xs font-semibold text-foreground-strong uppercase tracking-wider">
              Webhook Endpoint URL
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly
                value={webhookUrl}
                className="font-mono text-xs bg-surface-card select-all h-9 flex-grow text-foreground-muted"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyWebhook}
                className="shrink-0 h-9 w-9"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[11px] text-foreground-muted leading-relaxed mt-1">
              Add this Webhook URL in Stripe Dashboard (Developers &gt; Webhooks). Select events:{" "}
              <code className="text-primary font-mono text-[10px]">
                charge.succeeded, charge.failed, customer.subscription.*
              </code>
            </p>
          </div>

          {/* Public Key */}
          <div className="space-y-1.5">
            <Label
              htmlFor="stripe-pub-key"
              className="flex items-center gap-1.5 text-foreground-strong"
            >
              <Key className="h-3.5 w-3.5 text-foreground-muted" />
              Publishable Key (pk_live_...)
            </Label>
            <Input
              id="stripe-pub-key"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="pk_live_..."
              className="font-mono text-xs"
            />
          </div>

          {/* Secret Key */}
          <div className="space-y-1.5">
            <Label
              htmlFor="stripe-sec-key"
              className="flex items-center gap-1.5 text-foreground-strong"
            >
              <Key className="h-3.5 w-3.5 text-foreground-muted" />
              Secret Key (sk_live_...)
            </Label>
            <div className="relative">
              <Input
                id="stripe-sec-key"
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_..."
                className="font-mono text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground transition-colors"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5">
            <Label
              htmlFor="stripe-wh-secret"
              className="flex items-center gap-1.5 text-foreground-strong"
            >
              <Key className="h-3.5 w-3.5 text-foreground-muted" />
              Webhook Signing Secret (whsec_...)
            </Label>
            <div className="relative">
              <Input
                id="stripe-wh-secret"
                type={showWebhookSecret ? "text" : "password"}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="whsec_..."
                className="font-mono text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground transition-colors"
              >
                {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border mt-auto flex gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating} className="gap-2">
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
