/**
 * RevenueBreakdownTab — Net revenue, fees, costs, and monthly P&L.
 * All amounts displayed in AED with USD hints on key totals.
 * Stripe amounts are in AED cents. Operating costs are in AED (plain).
 * Sources: useStripeCharges, useOperatingCosts.
 */
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

import { useStripeCharges } from "@/hooks/data";
import { useOperatingCosts } from "@/hooks/use-operating-costs";
import { fmtCents, fmtAmount, usdHintCents, usdHint, safeParseDate } from "./finance-helpers";

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
export function RevenueBreakdownTab() {
  const { data: charges = [], isLoading: loadingCharges } = useStripeCharges();
  const { data: costs = [], isLoading: loadingCosts } = useOperatingCosts();

  const breakdown = useMemo(() => {
    const succeeded = charges.filter((c) => c.status === "succeeded");
    // Stripe amounts are in AED cents
    const grossCents = succeeded.reduce((s, c) => s + (c.amount ?? 0), 0);
    const totalFeesCents = succeeded.reduce((s, c) => s + (c.fee ?? 0), 0);
    const netAfterFeesCents = grossCents - totalFeesCents;
    const activeCosts = costs.filter((c) => c.is_active);
    // Operating costs are in AED (plain, not cents)
    const monthlyOpexAed = activeCosts.reduce((s, c) => s + Number(c.amount), 0);
    // Net profit: (net after fees in AED cents → AED) - opex (already AED)
    const netAfterFeesAed = netAfterFeesCents / 100;
    const netProfitAed = netAfterFeesAed - monthlyOpexAed;

    return {
      grossCents,
      totalFeesCents,
      netAfterFeesCents,
      monthlyOpexAed,
      netProfitAed,
      numPayments: succeeded.length,
    };
  }, [charges, costs]);

  // Monthly P&L for last 6 months
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
      // Revenue in AED (cents → plain)
      const revenueAed = monthCharges.reduce((s, c) => s + (c.amount ?? 0), 0) / 100;
      // Use same monthly opex for each month as an approximation
      const activeCosts = costs.filter((c) => c.is_active);
      const opexAed = activeCosts.reduce((s, c) => s + Number(c.amount), 0);

      return { label, revenueAed, costsAed: opexAed };
    });
    return months;
  }, [charges, costs]);

  const maxPL = Math.max(...monthlyPL.map((m) => Math.max(m.revenueAed, m.costsAed)), 1);

  if (loadingCharges || loadingCosts) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Net Revenue Breakdown Card ────────────────────────────────── */}
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

      {/* ── Monthly P&L Chart ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface-card p-5">
        <h3 className="font-display text-base font-semibold text-foreground-strong">
          Monthly P&L (Last 6 Months)
        </h3>
        <div className="mt-1 flex items-center gap-4 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/50" /> Revenue (AED)
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
  );
}
