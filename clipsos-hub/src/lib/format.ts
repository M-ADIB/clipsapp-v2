/**
 * Shared formatting helpers.
 *
 * Consolidates ~25 near-identical `formatDate` / `formatDateTime` / `formatBytes`
 * definitions that were copy-pasted across the codebase. Behaviour matches the
 * previous local copies (e.g. returning "—" for empty/invalid input).
 *
 * NOTE on currency: money formatting deliberately lives in the finance module
 * (`finance-helpers.ts`, which also handles AED<->USD conversion and cents).
 * `formatCurrency` here is a thin, explicit-currency helper for non-finance
 * call sites; it does NOT convert. Pass the currency the amount is already in.
 */

const EMPTY = "—";

/** e.g. "Jan 5, 2026" — returns "—" for null/invalid input. */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return EMPTY;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return EMPTY;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** e.g. "Jan 5, 2026, 3:45 PM" — returns "—" for null/invalid input. */
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return EMPTY;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return EMPTY;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Human-readable file size, e.g. "1.5 MB". Returns "—" for empty/zero. */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return EMPTY;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

/**
 * Format a plain amount in the given currency. Does NOT convert — pass the
 * currency the amount is already denominated in. Defaults to AED (the app's
 * primary currency). For Stripe cents + conversion, use `finance-helpers.ts`.
 */
export function formatCurrency(amount: number, currency = "AED"): string {
  const locale = currency.toUpperCase() === "USD" ? "en-US" : "en-AE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
