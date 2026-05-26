/**
 * HistoryTab — collapsible list of past campaigns with rendered preview
 * and per-recipient drill-down.
 */
import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Loader2, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEmailCampaigns, useCampaignRecipients } from "@/hooks/use-email-campaigns";

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-status-success/15 text-status-success border-status-success/30",
  scheduled: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-surface-card text-foreground-subtle border-border",
  queued: "bg-status-warning/15 text-status-warning border-status-warning/30",
  failed: "bg-status-danger/15 text-status-danger border-status-danger/30",
  skipped: "bg-surface-card text-foreground-subtle border-border",
};

export function HistoryTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: campaigns, isLoading } = useEmailCampaigns();
  const { data: recipients } = useCampaignRecipients(expandedId);

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
        <Mail className="mx-auto mb-3 h-8 w-8 text-foreground-disabled" />
        <h3 className="text-base font-medium text-foreground">No campaigns yet</h3>
        <p className="mt-1 text-sm text-foreground-subtle">
          Once you send or schedule a campaign from the Compose tab, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((c) => (
        <Collapsible
          key={c.id}
          open={expandedId === c.id}
          onOpenChange={(open) => setExpandedId(open ? c.id : null)}
        >
          <div className="rounded-xl border border-border bg-surface-card">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-raised/40">
                <div className="flex min-w-0 items-center gap-3">
                  {expandedId === c.id ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-foreground-subtle" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground-subtle" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.subject}</p>
                    <div className="mt-0.5 flex items-center gap-3">
                      <span className="text-xs text-foreground-subtle">{c.audience}</span>
                      <span className="flex items-center gap-1 text-xs text-foreground-subtle">
                        <Users className="h-3 w-3" />
                        {c.recipient_count}
                      </span>
                      <span className="text-xs text-foreground-subtle">
                        {c.sent_at
                          ? format(new Date(c.sent_at), "MMM d, yyyy h:mm a")
                          : c.scheduled_for
                            ? format(new Date(c.scheduled_for), "MMM d, yyyy h:mm a")
                            : "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={STATUS_STYLES[c.status] ?? ""}>
                  {c.status}
                </Badge>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="space-y-4 px-4 pb-4">
                {c.rendered_html && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-foreground-subtle">Email Preview</p>
                    <div className="overflow-hidden rounded-lg border border-border bg-white">
                      <iframe
                        srcDoc={c.rendered_html}
                        title="Campaign preview"
                        sandbox=""
                        className="h-[400px] w-full border-0"
                      />
                    </div>
                  </div>
                )}

                {expandedId === c.id && recipients && recipients.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-foreground-subtle">
                      Recipients ({recipients.length})
                    </p>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-surface-card">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-foreground-subtle">
                              Email
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-foreground-subtle">
                              Name
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-foreground-subtle">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipients.map((r) => (
                            <tr key={r.id} className="border-t border-border">
                              <td className="px-3 py-1.5 text-foreground">{r.email}</td>
                              <td className="px-3 py-1.5 text-foreground-subtle">
                                {r.name ?? "—"}
                              </td>
                              <td className="px-3 py-1.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${STATUS_STYLES[r.status] ?? ""}`}
                                >
                                  {r.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
