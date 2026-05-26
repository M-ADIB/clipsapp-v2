/**
 * FinanceOverviewTab — KPI cards + Payment History table.
 * All amounts displayed in AED with USD conversion hints on KPI cards.
 * Sources: useStripeCharges, useFinanceTransactions.
 */
import { useState, useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  DollarSign,
  Users,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  Download,
  Search,
  Link2,
  Banknote,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/hooks/query-keys";

import { useStripeCharges, useFinanceTransactions } from "@/hooks/data";
import { useStripeRealtimeSync, useDeleteFinanceTransaction } from "@/hooks/use-finance";
import { useOperatingCosts } from "@/hooks/use-operating-costs";
import { FilterPills, StatusBadge, StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fmtCents,
  fmtAmount,
  usdHintCents,
  usdHint,
  isThisMonth,
  isLastMonth,
  safeParseDate,
} from "./finance-helpers";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { SendPaymentLinkDialog } from "./SendPaymentLinkDialog";
import { InvoiceReceiptModal } from "./InvoiceReceiptModal";

/* ------------------------------------------------------------------ */
/* Status filter options                                               */
/* ------------------------------------------------------------------ */
const STATUS_PILLS = ["All", "Succeeded", "Failed"] as const;
const PROVIDER_PILLS = ["All", "Stripe", "Manual"] as const;

/* ------------------------------------------------------------------ */
/* Breakdown row helper                                                */
/* ------------------------------------------------------------------ */
function BreakdownRow({
  label,
  sublabel,
  amount,
  isCents = true,
  isDeduction = false,
  isBold = false,
  showUsdHint = false,
}: {
  label: string;
  sublabel?: string;
  amount: number;
  isCents?: boolean;
  isDeduction?: boolean;
  isBold?: boolean;
  showUsdHint?: boolean;
}) {
  const formatted = isCents ? fmtCents(Math.abs(amount)) : fmtAmount(Math.abs(amount));
  const usdStr = showUsdHint
    ? isCents
      ? usdHintCents(Math.abs(amount))
      : usdHint(Math.abs(amount))
    : null;

  return (
    <div
      className={`flex items-baseline justify-between py-1.5 ${isBold ? "border-t border-border pt-3 mt-2" : ""}`}
    >
      <div>
        <span
          className={`text-sm ${isBold ? "font-semibold text-foreground-strong" : "text-foreground-muted"}`}
        >
          {label}
        </span>
        {sublabel && <span className="ml-2 text-xs text-foreground-disabled">{sublabel}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-mono text-sm ${
            isBold
              ? "font-semibold text-foreground-strong"
              : isDeduction
                ? "text-[color:var(--status-danger)]"
                : "text-foreground-strong"
          }`}
        >
          {isDeduction ? `− ${formatted}` : formatted}
        </span>
        {usdStr && <span className="text-[11px] text-foreground-disabled">{usdStr}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Monthly P&L bar                                                     */
/* ------------------------------------------------------------------ */
function PLBar({
  label,
  revenueAed,
  costsAed,
  maxVal,
}: {
  label: string;
  revenueAed: number;
  costsAed: number;
  maxVal: number;
}) {
  const rPct = maxVal > 0 ? (revenueAed / maxVal) * 100 : 0;
  const cPct = maxVal > 0 ? (costsAed / maxVal) * 100 : 0;
  const netAed = revenueAed - costsAed;
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-xs text-foreground-muted">{label}</span>
      <div className="flex flex-1 flex-col gap-0.5">
        <div
          className="h-3 rounded-sm bg-emerald-500/30"
          style={{ width: `${Math.min(rPct, 100)}%` }}
        />
        <div
          className="h-3 rounded-sm bg-rose-500/30"
          style={{ width: `${Math.min(cPct, 100)}%` }}
        />
      </div>
      <span className="w-28 text-right font-mono text-xs text-foreground-muted">
        {fmtAmount(netAed)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export function FinanceOverviewTab() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-sync");
      if (error) throw error;
      toast.success(
        `Synced ${data?.charges_synced ?? 0} charges & ${data?.subscriptions_synced ?? 0} subscriptions successfully!`
      );
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.charges(tenantId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.subscriptions(tenantId) });
      }
    } catch (err: any) {
      console.error("Sync error:", err);
      toast.error(`Sync failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Wire realtime sync — auto-invalidates on new Stripe payments
  useStripeRealtimeSync();

  const { data: charges = [], isLoading: loadingCharges } = useStripeCharges();
  const { data: manualTxns = [], isLoading: loadingManual } = useFinanceTransactions();
  const { data: costs = [], isLoading: loadingCosts } = useOperatingCosts();
  const deleteMutation = useDeleteFinanceTransaction();

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [providerFilter, setProviderFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showPaymentLink, setShowPaymentLink] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState<{
    id: string;
    client_id: string;
    amount: number;
    currency: string;
    category?: string;
    payment_method?: string;
    payment_date?: string;
    notes?: string;
  } | null>(null);

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRow | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // ── Merged & filtered table rows ───────────────────────────────────
  type PaymentRow = {
    id: string;
    date: string;
    clientName: string;
    clientEmail: string;
    amount: number;
    currency: string;
    provider: "Stripe" | "Manual";
    status: string;
    isCents: boolean;
    receiptUrl?: string | null;
    client_id?: string;
    category?: string;
    paymentMethod?: string;
    notes?: string;
    fee?: number;
  };

  const allRows = useMemo<PaymentRow[]>(() => {
    const stripeRows: PaymentRow[] = charges.map((c) => ({
      id: c.id,
      date: c.stripe_created_at ?? c.created_at ?? "",
      clientName: c.client?.name ?? "",
      clientEmail: c.customer_email ?? "",
      amount: c.amount ?? 0,
      currency: c.currency ?? "usd",
      provider: "Stripe" as const,
      status: c.status ?? "unknown",
      isCents: true,
      receiptUrl: (c as { receipt_url?: string | null }).receipt_url ?? null,
      client_id: c.client_id ?? undefined,
      category: "service_fee",
      paymentMethod: "card",
      notes: "",
      fee: c.fee ?? undefined,
    }));
    const manualRows: PaymentRow[] = manualTxns.map((t) => ({
      id: t.id,
      date: t.payment_date ?? t.created_at ?? "",
      clientName: t.client?.name ?? "",
      clientEmail: "",
      amount: Number(t.amount) ?? 0,
      currency: t.currency ?? "usd",
      provider: "Manual" as const,
      status: t.payment_status ?? "unknown",
      isCents: false,
      client_id: t.client_id ?? undefined,
      category: t.category ?? undefined,
      paymentMethod: t.payment_method ?? undefined,
      notes: t.notes ?? undefined,
      fee: 0,
    }));
    return [...stripeRows, ...manualRows].sort((a, b) => {
      const da = safeParseDate(a.date);
      const db = safeParseDate(b.date);
      return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
    });
  }, [charges, manualTxns]);

  // ── KPI calculations ───────────────────────────────────────────────
  const kpis = useMemo(() => {
    const succeededStripe = charges.filter((c) => c.status === "succeeded");
    const succeededManual = manualTxns.filter((t) => t.payment_status === "succeeded");

    const stripeAedCentsList = succeededStripe.map((c) => {
      const isUsd = c.currency?.toLowerCase() === "usd";
      const amtAedCents = isUsd ? Math.round((c.amount ?? 0) * 3.6725) : (c.amount ?? 0);
      return {
        amountAedCents: amtAedCents,
        date: c.stripe_created_at ?? c.created_at,
        client_id: c.client_id,
      };
    });

    const manualAedCentsList = succeededManual.map((t) => {
      const isUsd = t.currency?.toLowerCase() === "usd";
      const rawAmtCents = Math.round(Number(t.amount ?? 0) * 100);
      const amtAedCents = isUsd ? Math.round(rawAmtCents * 3.6725) : rawAmtCents;
      return {
        amountAedCents: amtAedCents,
        date: t.payment_date ?? t.created_at,
        client_id: t.client_id,
      };
    });

    const allPayments = [...stripeAedCentsList, ...manualAedCentsList];

    const totalRevenueCents = allPayments.reduce((s, p) => s + p.amountAedCents, 0);

    const thisMonthPayments = allPayments.filter((p) => p.date && isThisMonth(p.date));
    const lastMonthPayments = allPayments.filter((p) => p.date && isLastMonth(p.date));

    const thisMonthCents = thisMonthPayments.reduce((s, p) => s + p.amountAedCents, 0);
    const lastMonthCents = lastMonthPayments.reduce((s, p) => s + p.amountAedCents, 0);
    const pctChange =
      lastMonthCents > 0 ? ((thisMonthCents - lastMonthCents) / lastMonthCents) * 100 : 0;

    const uniqueClients = new Set(allPayments.map((p) => p.client_id).filter(Boolean));
    const avgPerClientCents = uniqueClients.size > 0 ? totalRevenueCents / uniqueClients.size : 0;

    return {
      totalRevenueCents,
      thisMonthCents,
      pctChange,
      avgPerClientCents,
      clientsBilled: uniqueClients.size,
    };
  }, [charges, manualTxns]);

  // ── Combined Breakdown calculations ────────────────────────────────
  const breakdown = useMemo(() => {
    const succeededStripe = charges.filter((c) => c.status === "succeeded");
    const succeededManual = manualTxns.filter((t) => t.payment_status === "succeeded");

    const stripeGrossCents = succeededStripe.reduce((s, c) => {
      const isUsd = c.currency?.toLowerCase() === "usd";
      const amtAedCents = isUsd ? Math.round((c.amount ?? 0) * 3.6725) : (c.amount ?? 0);
      return s + amtAedCents;
    }, 0);

    const stripeFeesCents = succeededStripe.reduce((s, c) => {
      const isUsd = c.currency?.toLowerCase() === "usd";
      const feeAedCents = isUsd ? Math.round((c.fee ?? 0) * 3.6725) : (c.fee ?? 0);
      return s + feeAedCents;
    }, 0);

    const manualGrossCents = succeededManual.reduce((s, t) => {
      const isUsd = t.currency?.toLowerCase() === "usd";
      const rawAmtCents = Math.round(Number(t.amount ?? 0) * 100);
      const amtAedCents = isUsd ? Math.round(rawAmtCents * 3.6725) : rawAmtCents;
      return s + amtAedCents;
    }, 0);

    const grossCents = stripeGrossCents + manualGrossCents;
    const totalFeesCents = stripeFeesCents; // No processing fees for manual payments
    const netAfterFeesCents = grossCents - totalFeesCents;

    const activeCosts = costs.filter((c) => c.is_active);
    const monthlyOpexAed = activeCosts.reduce((s, c) => s + Number(c.amount), 0);

    const netAfterFeesAed = netAfterFeesCents / 100;
    const netProfitAed = netAfterFeesAed - monthlyOpexAed;

    return {
      grossCents,
      totalFeesCents,
      netAfterFeesCents,
      monthlyOpexAed,
      netProfitAed,
      numPayments: succeededStripe.length + succeededManual.length,
    };
  }, [charges, manualTxns, costs]);

  // ── Combined Monthly P&L Chart ─────────────────────────────────────
  const monthlyPL = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const label = format(d, "MMM");

      const monthCharges = charges.filter((c) => {
        if (c.status !== "succeeded" || !c.stripe_created_at) return false;
        const d = safeParseDate(c.stripe_created_at);
        return d && isWithinInterval(d, { start, end });
      });
      const stripeRevenueAed =
        monthCharges.reduce((s, c) => {
          const isUsd = c.currency?.toLowerCase() === "usd";
          const amtAedCents = isUsd ? Math.round((c.amount ?? 0) * 3.6725) : (c.amount ?? 0);
          return s + amtAedCents;
        }, 0) / 100;

      const monthManual = manualTxns.filter((t) => {
        if (t.payment_status !== "succeeded") return false;
        const dateStr = t.payment_date ?? t.created_at;
        const d = safeParseDate(dateStr);
        return d && isWithinInterval(d, { start, end });
      });
      const manualRevenueAed = monthManual.reduce((s, t) => {
        const isUsd = t.currency?.toLowerCase() === "usd";
        const rawAmt = Number(t.amount ?? 0);
        return s + (isUsd ? rawAmt * 3.6725 : rawAmt);
      }, 0);

      const revenueAed = stripeRevenueAed + manualRevenueAed;

      const activeCosts = costs.filter((c) => c.is_active);
      const opexAed = activeCosts.reduce((s, c) => s + Number(c.amount), 0);

      return { label, revenueAed, costsAed: opexAed };
    });
    return months;
  }, [charges, manualTxns, costs]);

  const maxPL = Math.max(...monthlyPL.map((m) => Math.max(m.revenueAed, m.costsAed)), 1);

  const filtered = useMemo(() => {
    let rows = allRows;
    if (statusFilter !== "All") rows = rows.filter((r) => r.status === statusFilter.toLowerCase());
    if (providerFilter !== "All") rows = rows.filter((r) => r.provider === providerFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) => r.clientName.toLowerCase().includes(q) || r.clientEmail.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [allRows, statusFilter, providerFilter, search]);

  // ── CSV export ─────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = "Date,Client,Email,Amount (AED),Amount (USD),Provider,Status\n";
    const body = filtered
      .map((r) => {
        const aed = r.isCents ? r.amount / 100 : r.amount;
        const usd = (aed / 3.6725).toFixed(2);
        const d = safeParseDate(r.date);
        const dateStr = d ? format(d, "yyyy-MM-dd") : "";
        return `${dateStr},${r.clientName},${r.clientEmail},${aed.toFixed(2)},${usd},${r.provider},${r.status}`;
      })
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this payment record? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Payment record deleted successfully");
        },
        onError: (err) => {
          toast.error(`Failed to delete: ${err.message}`);
        },
      });
    }
  };

  const isLoading = loadingCharges || loadingManual || loadingCosts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const pctStr =
    kpis.pctChange > 0 ? `+${kpis.pctChange.toFixed(0)}%` : `${kpis.pctChange.toFixed(0)}%`;

  return (
    <div className="space-y-6">
      {/* ── KPI Cards — Premium Finance Metrics ────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={fmtCents(kpis.totalRevenueCents)}
          subtitle={usdHintCents(kpis.totalRevenueCents)}
        />
        <StatCard
          title="This Month"
          value={fmtCents(kpis.thisMonthCents)}
          subtitle={usdHintCents(kpis.thisMonthCents)}
          change={pctStr}
          changeColor={kpis.pctChange >= 0 ? "success" : "danger"}
        />
        <StatCard
          title="Avg Per Client"
          value={fmtCents(kpis.avgPerClientCents)}
          subtitle={usdHintCents(kpis.avgPerClientCents)}
        />
        <StatCard
          title="Clients Billed"
          value={String(kpis.clientsBilled)}
          subtitle="Unique paying clients"
        />
      </div>

      {/* ── 2-Column Responsive Layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Payment History (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-foreground-strong">
              Payment History
            </h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={triggerSync} disabled={isSyncing}>
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing…" : "Sync Stripe"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowPaymentLink(true)}>
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                Send Link
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowRecordPayment(true)}>
                <Banknote className="mr-1.5 h-3.5 w-3.5" />
                Record Payment
              </Button>
              <Button size="sm" variant="outline" onClick={exportCSV}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                CSV
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email…"
                className="h-8 pl-8 text-sm"
              />
            </div>
            <FilterPills
              pills={STATUS_PILLS.map((s) => ({ label: s, value: s }))}
              active={statusFilter}
              onSelect={setStatusFilter}
            />
            <FilterPills
              pills={PROVIDER_PILLS.map((p) => ({ label: p, value: p }))}
              active={providerFilter}
              onSelect={setProviderFilter}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/20">
                  {["Date", "Client", "Amount (AED)", "Provider", "Status", ""].map((h) => (
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
                    <td colSpan={6} className="py-12 text-center text-sm text-foreground-disabled">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const aedDisplay = row.isCents
                      ? fmtCents(row.amount, row.currency)
                      : fmtAmount(row.amount, row.currency);
                    const usdDisplay = row.isCents
                      ? usdHintCents(row.amount, row.currency)
                      : `≈ $${(Number(row.amount) / 3.6725).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-border transition-colors hover:bg-foreground/[0.03]"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-foreground-muted">
                          {(() => {
                            const d = safeParseDate(row.date);
                            return d ? format(d, "MMM d, yyyy") : "—";
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground-strong">
                            {row.clientName || "—"}
                          </p>
                          {row.clientEmail && (
                            <p className="text-xs text-foreground-muted">{row.clientEmail}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="font-mono text-foreground-strong">{aedDisplay}</span>
                          <span className="ml-1.5 text-[11px] text-foreground-disabled">
                            {usdDisplay}
                          </span>
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
                          <div className="flex items-center justify-end gap-1.5">
                            {row.provider === "Stripe" && row.receiptUrl ? (
                              <a
                                href={row.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-card text-foreground-muted hover:text-primary transition-colors"
                                title="View Stripe receipt"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedReceiptPayment(row);
                                  setShowReceiptModal(true);
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-card text-foreground-muted hover:text-primary transition-colors"
                                title="View Receipt"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {row.provider === "Manual" && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingTransaction({
                                      id: row.id,
                                      client_id: row.client_id || "",
                                      amount: row.amount,
                                      currency: row.currency,
                                      category: row.category,
                                      payment_method: row.paymentMethod,
                                      payment_date: row.date,
                                      notes: row.notes,
                                    });
                                    setShowRecordPayment(true);
                                  }}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-card text-foreground-muted hover:text-primary transition-colors"
                                  title="Edit Payment details"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-card text-foreground-muted hover:text-status-danger transition-colors"
                                  title="Delete Payment record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Breakdown & Charts (1/3) */}
        <div className="space-y-6">
          {/* Net Revenue Breakdown Card */}
          <div className="rounded-xl border border-border bg-surface-card p-5">
            <h3 className="font-display text-base font-semibold text-foreground-strong">
              Net Revenue Breakdown
            </h3>
            <p className="mt-1 text-xs text-foreground-muted">
              from {breakdown.numPayments} succeeded payments · All amounts in AED
            </p>

            <div className="mt-6 space-y-0">
              <BreakdownRow label="Gross revenue" amount={breakdown.grossCents} showUsdHint />
              <BreakdownRow
                label="Stripe processing fees"
                sublabel="(2.9% + AED 1.10)"
                amount={breakdown.totalFeesCents}
                isDeduction
              />
              <BreakdownRow
                label="Net after fees"
                amount={breakdown.netAfterFeesCents}
                isBold
                showUsdHint
              />
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-medium uppercase tracking-wide text-foreground-disabled">
                Operating Expenses
              </p>
              <div className="mt-2 space-y-0">
                <BreakdownRow
                  label="Monthly operating costs"
                  sublabel={`(${costs.filter((c) => c.is_active).length} active items)`}
                  amount={breakdown.monthlyOpexAed}
                  isCents={false}
                  isDeduction
                  showUsdHint
                />
                <BreakdownRow
                  label="Net profit"
                  amount={breakdown.netProfitAed}
                  isCents={false}
                  isBold
                  showUsdHint
                />
              </div>
            </div>
          </div>

          {/* Monthly P&L Chart */}
          <div className="rounded-xl border border-border bg-surface-card p-5">
            <h3 className="font-display text-base font-semibold text-foreground-strong">
              Monthly P&L (Last 6 Months)
            </h3>
            <div className="mt-1 flex items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/50" /> Revenue
                (AED)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-500/50" /> Costs (AED)
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {monthlyPL.map((m) => (
                <PLBar
                  key={m.label}
                  label={m.label}
                  revenueAed={m.revenueAed}
                  costsAed={m.costsAed}
                  maxVal={maxPL}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dialogs ────────────────────────────────────────────────── */}
      <RecordPaymentDialog
        open={showRecordPayment}
        onOpenChange={(open) => {
          setShowRecordPayment(open);
          if (!open) setEditingTransaction(null);
        }}
        editTransaction={editingTransaction}
      />
      <SendPaymentLinkDialog open={showPaymentLink} onOpenChange={setShowPaymentLink} />
      <InvoiceReceiptModal
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        payment={selectedReceiptPayment}
      />
    </div>
  );
}
