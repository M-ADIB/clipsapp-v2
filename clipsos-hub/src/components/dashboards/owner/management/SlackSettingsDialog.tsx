import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@/components/ui/switch";
import { useTenantSettings } from "@/hooks/use-tenant-settings";
import { slackSettingsSchema, type SlackSettingsValues } from "@/lib/forms/integration-schemas";
import {
  Settings,
  MessageSquare,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface SlackSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SlackSettingsDialog({ open, onOpenChange }: SlackSettingsDialogProps) {
  const { settings, isUpdating, updateSettings } = useTenantSettings();
  const [showUrl, setShowUrl] = useState(false);

  const { register, handleSubmit, control, reset } = useForm<SlackSettingsValues>({
    resolver: zodResolver(slackSettingsSchema),
    defaultValues: { webhookUrl: "", notificationsEnabled: false },
  });

  useEffect(() => {
    if (settings) {
      reset({
        webhookUrl: settings.slack_webhook_url || "",
        notificationsEnabled: !!settings.slack_notifications_enabled,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (values: SlackSettingsValues) => {
    try {
      await updateSettings({
        slack_webhook_url: values.webhookUrl.trim(),
        slack_notifications_enabled: values.notificationsEnabled,
      });
      toast.success("Slack integration settings saved!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save Slack settings");
    }
  };

  const hasConfig = !!settings?.slack_webhook_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md bg-surface-card border-border flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground-strong">
            <MessageSquare className="h-5 w-5 text-primary" />
            Slack Integration Settings
          </DialogTitle>
          <DialogDescription className="text-foreground-muted">
            Connect Slack to receive instant team notifications for comments, video uploads, and
            client updates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
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
                    Slack Connected.
                  </span>
                ) : (
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    Not Connected.
                  </span>
                )}{" "}
                Configure Webhook URL below to pipe notifications.
              </div>
            </div>

            {/* Webhook URL */}
            <div className="space-y-1.5">
              <Label
                htmlFor="slack-webhook"
                className="flex items-center gap-1.5 text-foreground-strong"
              >
                Incoming Webhook URL
              </Label>
              <div className="relative">
                <Input
                  id="slack-webhook"
                  type={showUrl ? "text" : "password"}
                  placeholder="https://hooks.slack.com/services/..."
                  className="font-mono text-xs pr-10"
                  {...register("webhookUrl")}
                />
                <button
                  type="button"
                  onClick={() => setShowUrl(!showUrl)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground transition-colors"
                >
                  {showUrl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-foreground-muted leading-relaxed">
                Create a Slack App and enable Incoming Webhooks in your Slack workspace. Get a
                webhook URL from{" "}
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  Slack API Docs
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </p>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-surface-raised rounded-lg border border-border">
              <div className="space-y-0.5 pr-4">
                <Label
                  htmlFor="slack-notify"
                  className="text-sm font-semibold text-foreground-strong"
                >
                  Enable Notifications
                </Label>
                <p className="text-xs text-foreground-muted">
                  Post comments, approvals, and assignments to Slack.
                </p>
              </div>
              <Controller
                control={control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <Switch
                    id="slack-notify"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border mt-auto flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="gap-2">
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUpdating ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
