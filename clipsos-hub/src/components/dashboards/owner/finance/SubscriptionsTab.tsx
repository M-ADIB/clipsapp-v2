/**
 * SubscriptionsTab — Shows all Stripe subscriptions.
 * Uses useStripeSubscriptions hook (138 records already populated).
 */
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useStripeSubscriptions } from "@/hooks/data";
import { useCancelSubscription } from "@/hooks/use-stripe-actions";
import { StatusBadge, FilterPills } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Download, XCircle } from "lucide-react";
import { fmtCents, usdHintCents, safeParseDate } from "./finance-helpers";
import { toast } from "sonner";

const STATUS_PILLS = ["All", "Active", "Canceled", "Past Due"] as const;

function mapVariant(status: string) {
  switch (status) {
    case "active":
    case "trialing":
      return "approved" as const;
    case "canceled":
      return "draft" as const;
    case "past_due":
    case "unpaid":
      return "in_review" as const;
    default:
      return "pending" as const;
  }
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SubscriptionsTab() {
  const { data: subscriptions = [], isLoading } = useStripeSubscriptions();
  const cancelSub = useCancelSubscription();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cancelTarget, setCancelTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const filtered = useMemo(() => {
    let rows = subscriptions;
    if (statusFilter !== "All") {
      const mapped = statusFilter.toLowerCase().replace(/ /g, "_");
      rows = rows.filter((s) => s.status === mapped);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (s) =>
          (s.customer_email ?? "").toLowerCase().includes(q) ||
          (s.client?.name ?? "").toLowerCase().includes(q) ||
          (s.plan_name ?? "").toLowerCase().includes(q),
      );
    }
    return rows;
  }, [subscriptions, statusFilter, search]);

  const handleCancel = () => {
    if (!cancelTarget) return;
    cancelSub.mutate(cancelTarget.id, {
      onSuccess: () => {
        toast.success("Subscription canceled");
        setCancelTarget(null);
      },
      onError: (err) => toast.error(`Failed: ${err.message}`),
    });
  };

  const exportCSV = () => {
    const header = "Client,Email,Plan,Amount (AED),Interval,Status,Period Start,Period End\n";
    const body = filtered
      .map((s) => {
        const aed = (s.amount ?? 0) / 100;
        const startD = safeParseDate(s.current_period_start);
        const endD = safeParseDate(s.current_period_end);
        const startStr = startD ? format(startD, "yyyy-MM-dd") : "";
        const endStr = endD ? format(endD, "yyyy-MM-dd") : "";
        return `${s.client?.name ?? ""},${s.customer_email ?? ""},${s.plan_name ?? ""},${aed.toFixed(2)},${s.interval ?? ""},${s.status},${startStr},${endStr}`;
      })
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // KPI quick stats
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const mrrCents = activeSubs
    .filter((s) => s.interval === "month")
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const arrCents = activeSubs
    .filter((s) => s.interval === "year")
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const totalMRR = mrrCents + Math.round(arrCents / 12);

  return (
    <div className="space-y-6">
      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-foreground-disabled">
            Total Subscriptions
          </p>
          <p className="mt-1 text-xl font-bold text-foreground-strong">{subscriptions.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-foreground-disabled">Active</p>
          <p className="mt-1 text-xl font-bold text-[color:var(--status-success)]">
            {activeSubs.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-foreground-disabled">MRR</p>
          <p className="mt-1 text-xl font-bold text-foreground-strong">{fmtCents(totalMRR)}</p>
          <p className="text-[10px] text-foreground-disabled">{usdHintCents(totalMRR)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-foreground-disabled">Canceled</p>
          <p className="mt-1 text-xl font-bold text-foreground-muted">
            {subscriptions.filter((s) => s.status === "canceled").length}
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-foreground-strong">
          Subscriptions
        </h2>
        <Button size="sm" variant="outline" onClick={exportCSV}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          CSV
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, plan…"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <FilterPills
          pills={STATUS_PILLS.map((s) => ({ label: s, value: s }))}
          active={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Client", "Plan", "Amount (AED)", "Interval", "Status", "Period", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-foreground-disabled">
                  No subscriptions found
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-border transition-colors hover:bg-foreground/[0.03]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground-strong">{sub.client?.name ?? "—"}</p>
                    {sub.customer_email && (
                      <p className="text-xs text-foreground-muted">{sub.customer_email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground">{sub.plan_name ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-mono text-foreground-strong">
                      {fmtCents(sub.amount ?? 0, sub.currency ?? "aed")}
                    </span>
                    <span className="ml-1.5 text-[11px] text-foreground-disabled">
                      {usdHintCents(sub.amount ?? 0, sub.currency ?? "aed")}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-foreground-muted">
                    {sub.interval ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={mapVariant(sub.status ?? "unknown")}
                      label={statusLabel(sub.status ?? "unknown")}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-muted">
                    {(() => {
                      const startD = safeParseDate(sub.current_period_start);
                      return startD ? format(startD, "MMM d") : "—";
                    })()}{" "}
                    →{" "}
                    {(() => {
                      const endD = safeParseDate(sub.current_period_end);
                      return endD ? format(endD, "MMM d, yyyy") : "—";
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sub.status === "active" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() =>
                          setCancelTarget({
                            id: sub.stripe_subscription_id ?? "",
                            name: sub.client?.name ?? sub.customer_email ?? "this subscription",
                          })
                        }
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Cancel Confirmation ── */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the subscription for{" "}
              <strong>{cancelTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelSub.isPending ? "Canceling…" : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
