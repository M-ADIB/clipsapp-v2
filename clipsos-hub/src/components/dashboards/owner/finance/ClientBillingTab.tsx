/**
 * ClientBillingTab — per-client Stripe billing view.
 *
 * Shows:
 *  • Active subscription (status, plan, next billing date, cancel action)
 *  • Payment history (all charges for this client)
 *  • Quick actions: Send Payment Link, Record Payment
 *
 * Used inside the Client Workspace as the "Billing" tab.
 */
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CreditCard,
  RefreshCw,
  ExternalLink,
  Link2,
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClientFinance, useStripeRealtimeSync } from "@/hooks/use-finance";
import { useClient, useVideosByClient, useCreatePortalSession } from "@/hooks/data";
import { toast } from "sonner";
import { fmtCents, fmtAmount, usdHintCents, safeParseDate } from "./finance-helpers";
import { SendPaymentLinkDialog } from "./SendPaymentLinkDialog";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { StatusBadge } from "@/components/dashboard";

interface Props {
  clientId: string;
  readOnly?: boolean;
}

// ── Subscription status helpers ──────────────────────────────────────────────

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    active: {
      label: "Active",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      cls: "bg-emerald-500/15 text-emerald-400",
    },
    past_due: {
      label: "Past Due",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      cls: "bg-amber-500/15 text-amber-400",
    },
    canceled: {
      label: "Canceled",
      icon: <XCircle className="h-3.5 w-3.5" />,
      cls: "bg-red-500/15 text-red-400",
    },
    trialing: {
      label: "Trialing",
      icon: <Clock className="h-3.5 w-3.5" />,
      cls: "bg-blue-500/15 text-blue-400",
    },
  };
  const s = map[status] ?? {
    label: status,
    icon: null,
    cls: "bg-surface-raised text-foreground-muted",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.cls}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ClientBillingTab({ clientId, readOnly = false }: Props) {
  // Realtime sync so this tab updates when payments land
  useStripeRealtimeSync();

  const { data, isLoading } = useClientFinance(clientId);
  const { data: client } = useClient(clientId);
  const { data: videos = [] } = useVideosByClient(clientId);
  const createPortalSession = useCreatePortalSession();

  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);

  const activeSub = useMemo(
    () =>
      data?.subscriptions?.find((s) => s.status === "active" || s.status === "trialing") ?? null,
    [data],
  );

  const allPayments = useMemo(() => {
    const stripe = (data?.charges ?? []).map((c) => ({
      id: c.id,
      date: c.stripe_created_at ?? c.created_at ?? "",
      amount: c.amount ?? 0,
      currency: c.currency ?? "usd",
      status: c.status ?? "unknown",
      provider: "Stripe" as const,
      isCents: true,
      receiptUrl: (c as { receipt_url?: string | null }).receipt_url ?? null,
      description: c.description ?? null,
    }));
    const manual = (data?.transactions ?? []).map((t) => ({
      id: t.id,
      date: t.payment_date ?? t.created_at ?? "",
      amount: Number(t.amount ?? 0),
      currency: t.currency ?? "usd",
      status: t.payment_status ?? "unknown",
      provider: "Manual" as const,
      isCents: false,
      receiptUrl: null,
      description: t.notes ?? null,
    }));
    return [...stripe, ...manual].sort((a, b) => {
      const da = safeParseDate(a.date);
      const db = safeParseDate(b.date);
      return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
    });
  }, [data]);

  // Completed video usage calculation (current calendar month)
  const completedCount = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return videos.filter((v) => {
      const isCompleted = ["approved", "posted", "scheduled"].includes(
        (v.status as { slug?: string } | null)?.slug ?? "",
      );
      if (!isCompleted) return false;
      const createdAt = v.created_at ? new Date(v.created_at) : null;
      return createdAt && createdAt >= startOfMonth;
    }).length;
  }, [videos]);

  const limit = client?.videos_per_month ?? 15;
  const percentage = Math.min(100, Math.round((completedCount / limit) * 100));

  const hasUnpaidPayments = useMemo(() => {
    return allPayments.some(
      (p) =>
        p.provider === "Stripe" &&
        (p.status === "failed" || p.status === "pending" || p.status === "unpaid"),
    );
  }, [allPayments]);

  const handlePortalRedirect = () => {
    createPortalSession.mutate(
      { client_id: clientId, return_url: window.location.href },
      {
        onSuccess: (res) => {
          if (res?.url) {
            window.location.href = res.url;
          } else {
            toast.error("Billing portal link not returned.");
          }
        },
        onError: (err) => {
          console.error("Portal error:", err);
          toast.error("Failed to load billing portal.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Circular progress meter properties
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* ── Direct Unpaid Checkouts Alert ── */}
      {hasUnpaidPayments && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground-strong">
                Outstanding Balance / Failed Payment
              </p>
              <p className="text-xs text-foreground-muted mt-0.5">
                You have one or more pending or failed payments in your history. Please update your
                card or complete payment inside the billing portal.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={handlePortalRedirect}
            disabled={createPortalSession.isPending}
            className="shrink-0"
          >
            Resolve Now
          </Button>
        </div>
      )}

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowPaymentLink(true)}>
            <Link2 className="mr-1.5 h-3.5 w-3.5" />
            Send Payment Link
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowRecordPayment(true)}>
            <Banknote className="mr-1.5 h-3.5 w-3.5" />
            Record Payment
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Active Subscription ────────────────────────────────────── */}
        <div className="flex flex-col">
          <h3 className="mb-3 text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
            Subscription
          </h3>
          {activeSub ? (
            <div className="flex-1 rounded-xl border border-border bg-surface-card p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15">
                    <RefreshCw className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground-strong">
                      {activeSub.plan_name ?? "Subscription"}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {fmtCents(activeSub.amount ?? 0, activeSub.currency ?? "usd")} /{" "}
                      {activeSub.interval ?? "month"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <SubStatusBadge status={activeSub.status ?? "active"} />
                  {readOnly && (
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 text-xs text-primary hover:text-primary-hover font-semibold"
                      onClick={handlePortalRedirect}
                      disabled={createPortalSession.isPending}
                    >
                      {createPortalSession.isPending ? "Loading..." : "Manage Billing →"}
                    </Button>
                  )}
                </div>
              </div>
              {activeSub.current_period_end && (
                <p className="mt-3 text-xs text-foreground-muted">
                  Next billing:{" "}
                  <span className="text-foreground-strong">
                    {(() => {
                      const d = safeParseDate(activeSub.current_period_end);
                      return d ? format(d, "MMM d, yyyy") : "—";
                    })()}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div className="flex-1 rounded-xl border border-dashed border-border p-6 text-center text-sm text-foreground-disabled flex flex-col items-center justify-center gap-3 bg-surface-card/50">
              <p>No active subscription</p>
              {readOnly && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePortalRedirect}
                  disabled={createPortalSession.isPending}
                >
                  {createPortalSession.isPending ? "Loading..." : "Open Billing Portal"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Usage Quota Card ────────────────────────────────────────── */}
        <div className="flex flex-col">
          <h3 className="mb-3 text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
            Video Quota
          </h3>
          <div className="flex-1 rounded-xl border border-border bg-surface-card p-4 flex items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground-strong">Monthly Usage</p>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Videos completed in the current calendar month.
              </p>
              <p className="text-2xl font-bold font-display text-foreground-strong pt-2">
                {completedCount}{" "}
                <span className="text-xs font-medium text-foreground-disabled">
                  / {limit} videos
                </span>
              </p>
            </div>
            {/* Circular Progress Meter */}
            <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-border/40"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-primary transition-all duration-500 ease-out"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-foreground-strong">
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment History ────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
          Payment History
        </h3>
        {allPayments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-foreground-disabled">
            No payments recorded
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Amount (AED)", "Type", "Status", ""].map((h) => (
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
                {allPayments.map((row) => {
                  const aed = row.isCents
                    ? fmtCents(row.amount, row.currency)
                    : fmtAmount(row.amount, row.currency);
                  const usd = row.isCents
                    ? usdHintCents(row.amount, row.currency)
                    : `≈ $${(row.amount / 3.6725).toFixed(2)}`;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-foreground/[0.03]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-foreground-muted">
                        {(() => {
                          const d = safeParseDate(row.date);
                          return d ? format(d, "MMM d, yyyy") : "—";
                        })()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-mono text-foreground-strong">{aed}</span>
                        <span className="ml-1.5 text-[11px] text-foreground-disabled">{usd}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            row.provider === "Stripe"
                              ? "bg-indigo-500/15 text-indigo-400"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {row.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          variant={
                            row.status === "succeeded"
                              ? "approved"
                              : row.status === "failed"
                                ? "draft"
                                : "pending"
                          }
                          label={
                            row.status === "succeeded"
                              ? "Succeeded"
                              : row.status === "failed"
                                ? "Failed"
                                : "Pending"
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.receiptUrl ? (
                          <a
                            href={row.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-foreground-muted hover:text-primary transition-colors"
                            title="View Stripe receipt"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <CreditCard className="h-3.5 w-3.5 text-foreground-disabled" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────── */}
      <SendPaymentLinkDialog
        open={showPaymentLink}
        onOpenChange={setShowPaymentLink}
        preselectedClientId={clientId}
      />
      <RecordPaymentDialog
        open={showRecordPayment}
        onOpenChange={setShowRecordPayment}
        preselectedClientId={clientId}
      />
    </div>
  );
}
