/**
 * CalendlySettingsDialog — Closer inputs their Calendly API Key and event filter.
 *
 * Opens as a sheet from the Schedule page. Saves to `closer_regions` table.
 * Also triggers an initial sync on save.
 */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings2,
  Key,
  Filter,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCloserRegion,
  useUpsertCloserRegion,
  useSyncCalendlyEvents,
} from "@/hooks/use-closer-region";
import {
  calendlySettingsSchema,
  type CalendlySettingsValues,
} from "@/lib/forms/integration-schemas";

interface CalendlySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendlySettingsDialog({ open, onOpenChange }: CalendlySettingsDialogProps) {
  const { data: region, isLoading: regionLoading } = useCloserRegion();
  const upsertMutation = useUpsertCloserRegion();
  const syncMutation = useSyncCalendlyEvents();

  const [showKey, setShowKey] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CalendlySettingsValues>({
    resolver: zodResolver(calendlySettingsSchema),
    defaultValues: { apiKey: "", eventFilter: "30 Mins Discovery Call" },
  });

  // Populate from existing region config
  useEffect(() => {
    if (region) {
      reset({
        apiKey: region.calendly_api_key || "",
        eventFilter: region.calendar_event_filter || "30 Mins Discovery Call",
      });
    }
  }, [region, reset]);

  const hasApiKey = !!region?.calendly_api_key;

  const onSubmit = async (values: CalendlySettingsValues) => {
    try {
      await upsertMutation.mutateAsync({
        calendly_api_key: values.apiKey.trim(),
        calendar_event_filter: values.eventFilter.trim() || undefined,
      });
      toast.success("Calendly settings saved!");

      // Auto-trigger a sync after saving
      toast.info("Syncing Calendly events...");
      try {
        const result = await syncMutation.mutateAsync();
        toast.success(`Synced ${result.synced} events from Calendly.`);
      } catch (syncErr: unknown) {
        const msg = syncErr instanceof Error ? syncErr.message : "Sync failed";
        toast.error(msg);
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      toast.error(msg);
    }
  };

  const handleSyncOnly = async () => {
    if (!hasApiKey) {
      toast.error("Please save your API key first.");
      return;
    }
    toast.info("Syncing Calendly events...");
    try {
      const result = await syncMutation.mutateAsync();
      toast.success(`Synced ${result.synced} events.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      toast.error(msg);
    }
  };

  const isSaving = upsertMutation.isPending || syncMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Calendly Settings
          </SheetTitle>
          <SheetDescription>
            Connect your Calendly account to sync scheduled calls automatically.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {/* Status indicator */}
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: hasApiKey ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                border: `1px solid ${hasApiKey ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
              }}
            >
              {hasApiKey ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span className="text-sm text-foreground">
                {hasApiKey
                  ? "Calendly connected — events are syncing."
                  : "Not connected — add your API key to start syncing."}
              </span>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="calendly-api-key" className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-foreground-muted" />
                Personal Access Token
              </Label>
              <div className="relative">
                <Input
                  id="calendly-api-key"
                  type={showKey ? "text" : "password"}
                  placeholder="eyJhbGciOiJFUzI1Ni..."
                  className="pr-10 font-mono text-xs"
                  aria-invalid={!!errors.apiKey}
                  {...register("apiKey")}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground transition-colors"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.apiKey && (
                <p className="text-xs text-status-danger" role="alert">
                  {errors.apiKey.message}
                </p>
              )}
              <p className="text-[11px] text-foreground-muted leading-relaxed">
                Get your token from{" "}
                <a
                  href="https://calendly.com/integrations/api_webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  Calendly API Integrations
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </p>
            </div>

            {/* Event Filter */}
            <div className="space-y-2">
              <Label htmlFor="event-filter" className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-foreground-muted" />
                Event Type Filter
                <span className="text-[10px] text-foreground-disabled font-normal ml-1">
                  optional
                </span>
              </Label>
              <Input
                id="event-filter"
                placeholder="e.g. 30 Mins Discovery Call"
                className="text-sm"
                {...register("eventFilter")}
              />
              <p className="text-[11px] text-foreground-muted">
                Only sync events whose name contains this text. Leave empty to sync all events.
              </p>
            </div>

            {/* Sync button (manual re-sync) */}
            {hasApiKey && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncOnly}
                  disabled={syncMutation.isPending}
                  className="w-full gap-2"
                >
                  {syncMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {syncMutation.isPending ? "Syncing..." : "Re-sync Now"}
                </Button>
              </div>
            )}
          </div>

          <SheetFooter className="flex gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save & Sync"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
