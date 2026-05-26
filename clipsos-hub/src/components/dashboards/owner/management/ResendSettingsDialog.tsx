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
  Mail,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface ResendSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResendSettingsDialog({ open, onOpenChange }: ResendSettingsDialogProps) {
  const { settings, isLoading, isUpdating, updateSettings } = useTenantSettings();
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.resend_api_key || "");
      setFromEmail(settings.resend_from_email || "ClipsOS <noreply@theclips.agency>");
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        resend_api_key: apiKey.trim(),
        resend_from_email: fromEmail.trim(),
      });
      toast.success("Resend integration settings saved!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save Resend settings");
    }
  };

  const hasConfig = !!settings?.resend_api_key;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md bg-surface-card border-border flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground-strong">
            <Mail className="h-5 w-5 text-primary" />
            Resend Integration Settings
          </DialogTitle>
          <DialogDescription className="text-foreground-muted">
            Configure Resend API key to deliver transactional notifications, campaign newsletters,
            and verification emails.
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
                  Resend Connected.
                </span>
              ) : (
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Not Connected.
                </span>
              )}{" "}
              Add your API key below to send tenant emails.
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <Label
              htmlFor="resend-key"
              className="flex items-center gap-1.5 text-foreground-strong"
            >
              Resend API Key (re_...)
            </Label>
            <div className="relative">
              <Input
                id="resend-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="re_..."
                className="font-mono text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-foreground-muted">
              Get your API key from your{" "}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                Resend Dashboard
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>

          {/* From Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="resend-from"
              className="flex items-center gap-1.5 text-foreground-strong"
            >
              Default From Email Address
            </Label>
            <Input
              id="resend-from"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="Agency Name <noreply@agency.com>"
              className="text-sm"
            />
            <p className="text-[11px] text-foreground-muted">
              Specify the sender name and address. Must be a verified domain in your Resend account.
            </p>
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
