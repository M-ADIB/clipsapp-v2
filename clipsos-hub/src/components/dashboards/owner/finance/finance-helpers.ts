/**
 * Shared helpers for the Finance page tabs.
 *
 * PRIMARY CURRENCY: AED (UAE Dirham)
 * Stripe amounts are stored in the Stripe account's native currency (AED).
 * The conversion helpers handle showing USD equivalents where needed.
 */

/** Fixed AED/USD conversion rate (1 USD ≈ 3.6725 AED) */
export const USD_TO_AED = 3.6725;

/**
 * Format cents (Stripe) to AED display string.
 * Stripe stores amounts in the account's native currency (AED) in cents.
 * If source currency is explicitly USD, convert to AED first.
 */
export function fmtCents(cents: number, sourceCurrency = "aed"): string {
  const base = cents / 100;
  const aedAmount = sourceCurrency.toLowerCase() === "usd" ? base * USD_TO_AED : base;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(aedAmount);
}

/**
 * Format a plain amount to AED display string.
 * If the source currency is USD, it converts to AED first.
 */
export function fmtAmount(amount: number, sourceCurrency = "aed"): string {
  const aedAmount = sourceCurrency.toLowerCase() === "usd" ? amount * USD_TO_AED : amount;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(aedAmount);
}

/**
 * Convert cents (AED by default) to a small USD hint — e.g. "≈ $4,493.17"
 */
export function usdHintCents(cents: number, sourceCurrency = "aed"): string {
  const base = cents / 100;
  const usd = sourceCurrency.toLowerCase() === "usd" ? base : base / USD_TO_AED;
  return `≈ ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(usd)}`;
}

/**
 * Convert a plain amount to a small USD hint — e.g. "≈ $1,234.56"
 */
export function usdHint(amount: number, sourceCurrency = "aed"): string {
  const usd = sourceCurrency.toLowerCase() === "usd" ? amount : amount / USD_TO_AED;
  return `≈ ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(usd)}`;
}

/** Short month label from a Date */
export function shortMonth(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short" });
}

/** Parse date safely handling ISO strings with spaces instead of 'T' */
export function safeParseDate(dateStr: string | Date | null | undefined): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  
  const formatted = typeof dateStr === "string" && dateStr.includes(" ") && !dateStr.includes("T")
    ? dateStr.replace(" ", "T")
    : dateStr;
  const d = new Date(formatted);
  return isNaN(d.getTime()) ? null : d;
}

/** Check if a date is in the current month */
export function isThisMonth(dateStr: string | null | undefined): boolean {
  const d = safeParseDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getUTCMonth() === now.getUTCMonth() && d.getUTCFullYear() === now.getUTCFullYear();
}

/** Check if a date is in last month */
export function isLastMonth(dateStr: string | null | undefined): boolean {
  const d = safeParseDate(dateStr);
  if (!d) return false;
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getUTCMonth() === lastMonth.getUTCMonth() && d.getUTCFullYear() === lastMonth.getUTCFullYear();
}

/** Category pill color map */
export const CATEGORY_COLORS: Record<string, string> = {
  salary: "bg-emerald-500/20 text-emerald-400",
  subscription: "bg-pink-500/20 text-pink-400",
  contractor: "bg-blue-500/20 text-blue-400",
  other: "bg-gray-500/20 text-gray-400",
};

/** Finance tab keys */
export const FINANCE_TABS = ["Overview", "Revenue Breakdown", "Subscriptions", "Costs"] as const;
export type FinanceTab = (typeof FINANCE_TABS)[number];
