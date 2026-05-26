/**
 * ScheduledTab — list of upcoming scheduled campaigns with cancel.
 */
import { format } from "date-fns";
import { CalendarClock, Loader2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useScheduledCampaigns, useCancelCampaign } from "@/hooks/use-email-campaigns";

export function ScheduledTab() {
  const { data: campaigns, isLoading } = useScheduledCampaigns();
  const cancel = useCancelCampaign();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-foreground-subtle" />
      </div>
    );
  }

  if (!campaigns?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card/30 p-12 text-center">
        <CalendarClock className="mx-auto mb-3 h-8 w-8 text-foreground-disabled" />
        <h3 className="text-base font-medium text-foreground">No scheduled campaigns</h3>
        <p className="mt-1 text-sm text-foreground-subtle">
          When you schedule an email to send later, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-xl border border-border bg-surface-card px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{c.subject}</p>
            <div className="mt-0.5 flex items-center gap-3">
              <span className="text-xs text-foreground-subtle">{c.audience}</span>
              <span className="flex items-center gap-1 text-xs text-foreground-subtle">
                <Users className="h-3 w-3" />
                {c.recipient_count}
              </span>
              <span className="flex items-center gap-1 text-xs text-primary">
                <CalendarClock className="h-3 w-3" />
                {c.scheduled_for
                  ? format(new Date(c.scheduled_for), "MMM d, yyyy 'at' h:mm a")
                  : "—"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-status-danger/30 text-status-danger hover:bg-status-danger/10"
            disabled={cancel.isPending}
            onClick={() => {
              if (!confirm("Cancel this scheduled campaign?")) return;
              cancel.mutate(c.id, {
                onSuccess: () => toast.success("Campaign cancelled"),
                onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
              });
            }}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Cancel
          </Button>
        </div>
      ))}
    </div>
  );
}
