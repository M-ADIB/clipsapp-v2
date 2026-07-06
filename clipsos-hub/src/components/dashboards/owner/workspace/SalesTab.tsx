/**
 * SalesTab — Finance overview for this client workspace.
 *
 * Wired to: useClientFinance(clientId)
 * Shows: Total Spend, Transactions, Customer LTV stat cards,
 *        Active Subscriptions, Payment History, and Recent Activity.
 *
 * Falls back to "No financial data" empty state when tables are empty.
 */
import { useMemo } from "react";
import { useClientFinance } from "@/hooks/data";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Loader2,
  TrendingUp,
  CreditCard,
  Star,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface SalesTabProps {
  clientId: string;
}

const PAYMENT_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  paid: { bg: "rgba(202,199,107,0.2)", text: "#E7E384" },
  completed: { bg: "rgba(202,199,107,0.2)", text: "#E7E384" },
  processing: { bg: "rgba(216,180,254,0.2)", text: "#ECD7FF" },
  pending: { bg: "rgba(216,180,254,0.2)", text: "#ECD7FF" },
  overdue: { bg: "rgba(147,0,10,0.2)", text: "#FFB4AB" },
  failed: { bg: "rgba(147,0,10,0.2)", text: "#FFB4AB" },
  refunded: { bg: "rgba(89,168,212,0.2)", text: "#59A8D4" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function SalesTab({ clientId }: SalesTabProps) {
  const { data: finance, isLoading, error } = useClientFinance(clientId);

  const stats = useMemo(() => {
    if (!finance)
      return { totalSpend: 0, txCount: 0, ltv: 0, activeSubs: [], recentTx: [], recentCharges: [] };

    const charges = finance.charges ?? [];
    const subs = finance.subscriptions ?? [];
    const transactions = finance.transactions ?? [];

    // Total spend = sum of all charge amounts (in cents → dollars)
    const totalCharges = charges.reduce((sum, c) => sum + Number(c.amount ?? 0) / 100, 0);
    // Total from transactions table (already in dollars)
    const totalTx = transactions.reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

    const totalSpend = totalCharges + totalTx;
    const txCount = charges.length + transactions.length;
    const ltv = totalSpend; // Simple LTV = total spend for now

    const activeSubs = subs.filter((s) => s.status === "active" || s.status === "trialing");

    // Recent transactions for the payment history table
    const recentTx = transactions.slice(0, 8);

    // Recent charges for activity feed
    const recentCharges = charges.slice(0, 5);

    return { totalSpend, txCount, ltv, activeSubs, recentTx, recentCharges };
  }, [finance]);

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-[color:var(--status-danger)]/20">
        <span className="text-sm text-[color:var(--status-danger)]">
          Failed to load finance data: {error.message}
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const hasData = stats.txCount > 0 || stats.activeSubs.length > 0;

  // ── Empty state ──
  if (!hasData) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 pt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card">
          <CreditCard className="h-8 w-8 text-foreground-muted" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground-strong">No financial data yet</p>
          <p className="mt-1 max-w-sm text-sm text-foreground-muted">
            Payment history, subscriptions, and revenue data will appear here once transactions are
            recorded for this client.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {/* Total Spend */}
        <div
          className="flex flex-col justify-between rounded-lg p-4 md:p-6"
          style={{
            background: "#1E1C1D",
            border: "1px solid rgba(74,69,79,0.05)",
            minHeight: 175,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-strong">Total Spend</span>
            <TrendingUp className="h-4 w-4 text-primary opacity-50" />
          </div>
          <span
            className="text-xl font-medium tracking-[-0.01em] text-foreground-strong md:text-[30px]"
            style={{ lineHeight: "100%" }}
          >
            {formatCurrency(stats.totalSpend)}
          </span>
          <span className="text-xs text-[#CDC3D0] opacity-50">All time</span>
        </div>

        {/* Transactions */}
        <div
          className="flex flex-col justify-between rounded-lg p-4 md:p-6"
          style={{
            background: "#1E1C1D",
            border: "1px solid rgba(74,69,79,0.05)",
            minHeight: 176,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-strong">Transactions</span>
            <CreditCard className="h-4 w-4 text-primary opacity-50" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-xl font-medium tracking-[-0.01em] text-foreground-strong md:text-[30px]"
              style={{ lineHeight: "100%" }}
            >
              {stats.txCount}
            </span>
            <span className="text-xs text-[rgba(229,226,227,0.4)]">Total Payments</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-xl bg-[#353436]">
            <div
              className="h-full rounded-xl bg-[#D8B4FE] transition-all"
              style={{
                width: `${Math.min(100, (stats.txCount / Math.max(stats.txCount, 20)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Customer LTV */}
        <div
          className="flex flex-col justify-between rounded-lg p-4 md:p-6"
          style={{
            background: "#1E1C1D",
            border: "1px solid rgba(74,69,79,0.05)",
            minHeight: 175,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-strong">Customer LTV</span>
            <Star className="h-4 w-4 text-primary opacity-50" />
          </div>
          <span
            className="text-xl font-medium tracking-[-0.01em] text-foreground-strong md:text-[30px]"
            style={{ lineHeight: "100%" }}
          >
            {formatCurrency(stats.ltv)}
          </span>
          <span className="text-xs text-[#CDC3D0] opacity-50">Projected Lifetime Value</span>
        </div>
      </div>

      {/* ── Subscriptions + Payment History ─────────────── */}
      <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Active Subscriptions */}
          {stats.activeSubs.length > 0 && (
            <div
              className="overflow-hidden rounded-lg"
              style={{
                background: "#1C1B1C",
                border: "1px solid rgba(74,69,79,0.05)",
              }}
            >
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ background: "rgba(32,31,32,0.5)" }}
              >
                <span className="text-base font-semibold text-[#E5E2E3]">Active Subscriptions</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[-0.25px] text-[#E7E384]"
                  style={{ background: "rgba(202,199,107,0.1)" }}
                >
                  {stats.activeSubs.length} Active
                </span>
              </div>

              {stats.activeSubs.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-sm"
                      style={{ background: "rgba(236,215,255,0.1)" }}
                    >
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#E5E2E3]">
                        {sub.plan_name ??
                          sub.stripe_subscription_id?.slice(0, 12) ??
                          "Subscription"}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25px] text-[rgba(229,226,227,0.4)]">
                        {sub.interval ?? "Monthly"} •{" "}
                        {sub.status === "trialing" ? "Trial" : "Auto-Renew"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#E5E2E3]">
                        {formatCurrency(Number(sub.amount ?? 0) / 100)}
                      </p>
                      <p className="text-[10px] text-[rgba(229,226,227,0.4)]">
                        per {sub.interval ?? "month"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[rgba(229,226,227,0.4)]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment History */}
          {stats.recentTx.length > 0 && (
            <div
              className="overflow-hidden rounded-lg"
              style={{
                background: "#1C1B1C",
                border: "1px solid rgba(74,69,79,0.05)",
              }}
            >
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ background: "rgba(32,31,32,0.5)" }}
              >
                <span className="text-base font-semibold text-[#E5E2E3]">Payment History</span>
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#ECD7FF]">
                  {stats.recentTx.length} records
                </span>
              </div>

              <div className="flex flex-col">
                {stats.recentTx.map((tx, i) => {
                  const statusKey = (tx.payment_status ?? "pending").toLowerCase();
                  const st = PAYMENT_STATUS_STYLES[statusKey] ?? {
                    bg: "rgba(205,195,208,0.1)",
                    text: "#CDC3D0",
                  };
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between px-6 py-4"
                      style={{
                        borderTop: i > 0 ? "1px solid rgba(74,69,79,0.1)" : undefined,
                      }}
                    >
                      <div className="w-[140px] min-w-[140px]">
                        <p className="text-[13px] font-semibold text-[#E5E2E3]">
                          {formatDate(tx.payment_date)}
                        </p>
                        <p className="font-mono text-[10px] text-[rgba(229,226,227,0.4)]">
                          {tx.category ?? tx.transaction_type}
                        </p>
                      </div>

                      <div className="flex-1">
                        <span
                          className="rounded-full px-2 py-[0.5px] text-[10px] font-bold uppercase tracking-[-0.25px]"
                          style={{ background: st.bg, color: st.text }}
                        >
                          {tx.payment_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-sm font-bold text-[#E5E2E3]">
                          {formatCurrency(Number(tx.amount), tx.currency ?? "AED")}
                        </span>
                        <ChevronRight className="h-3 w-3 text-[rgba(229,226,227,0.4)]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Recent Activity sidebar ──────────────────── */}
        <div
          className="relative overflow-hidden rounded-[10px] p-6"
          style={{ background: "#1C1B1C" }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-xl"
            style={{ background: "rgba(255,180,171,0.05)", filter: "blur(32px)" }}
          />

          <div className="relative flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-base font-semibold text-[#E5E2E3]">Recent Activity</span>
            </div>

            {stats.recentCharges.length === 0 && stats.recentTx.length === 0 ? (
              <p className="text-sm text-foreground-muted">No recent activity to show.</p>
            ) : (
              <>
                {stats.recentCharges.map((charge) => {
                  const isPaid = charge.status === "succeeded";
                  return (
                    <div key={charge.id} className="flex gap-4 pb-2">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded"
                        style={{
                          background: isPaid ? "rgba(5,147,0,0.2)" : "rgba(147,0,10,0.2)",
                        }}
                      >
                        {isPaid ? (
                          <CheckCircle className="h-4 w-4 text-[#84E787]" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-[#FFB4AB]" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[rgba(229,226,227,0.4)]">
                          {timeAgo(charge.stripe_created_at ?? charge.created_at)}
                        </span>
                        <span className="text-sm font-semibold text-[#E5E2E3]">
                          {isPaid ? "Payment Received" : "Payment Failed"}
                        </span>
                        <p className="text-xs leading-4 text-[#CDC3D0]">
                          {formatCurrency(Number(charge.amount ?? 0) / 100)} via{" "}
                          {charge.description ?? "card"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
