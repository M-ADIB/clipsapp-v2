/**
 * StatCard — Reusable metric card used across all dashboards.
 *
 * Shows: title, big number, optional % badge, optional sparkline,
 * optional footer text + "View Details" link.
 *
 * Used in: Owner/Sales Overview, Manager/Dashboard, Closer/Pipeline
 */
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface StatCardProps {
  /** Card heading — e.g. "Monthly Recurring" */
  title: string;
  /** Big formatted number — e.g. "AED 42,850.12" */
  value: string;
  /** Small subtitle below value — e.g. "≈ $11,672.44" */
  subtitle?: string;
  /** Optional % change badge — e.g. "+12.4%" */
  change?: string;
  /** Badge color variant */
  changeColor?: "accent" | "success" | "danger";
  /** Optional footer timestamp */
  updatedAt?: string;
  /** If true, shows "View Details" link */
  onViewDetails?: () => void;
  /** Sparkline or chart content rendered below the value */
  children?: ReactNode;
  /** Optional sub-info block (e.g. pipeline breakdown) */
  subInfo?: ReactNode;
}

const BADGE_STYLES: Record<string, string> = {
  accent: "bg-[color:var(--primary-soft)] text-primary",
  success: "bg-[rgba(231,227,132,0.1)] text-[color:var(--status-success)]",
  danger: "bg-[rgba(147,0,10,0.2)] text-[color:var(--status-danger)]",
};

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changeColor = "accent",
  updatedAt,
  onViewDetails,
  children,
  subInfo,
  percent,
}: StatCardProps & { percent?: number }) {
  return (
    <div className="flex flex-1 flex-col justify-between rounded-lg border border-border bg-surface-card p-3 pb-3 md:p-4 md:pb-[18px]">
      <div className="flex flex-col gap-2 md:gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[11px] md:text-xs font-medium tracking-tight text-foreground-strong">
            {title}
          </h3>
          {change && (
            <span
              className={`rounded-xl px-2 py-0.5 text-[10px] font-semibold ${BADGE_STYLES[changeColor]}`}
            >
              {change}
            </span>
          )}
        </div>

        {/* Big number */}
        <p className="font-display text-[28px] md:text-[40px] font-medium leading-none tracking-tight text-foreground-strong">
          {value}
        </p>
        {subtitle && <p className="mt-1 text-[11px] text-foreground-disabled">{subtitle}</p>}
      </div>

      {/* Progress bar — only when percent is explicitly provided AND > 0 (and not the default 100% used as a placeholder) */}
      {percent != null && percent > 0 && percent < 100 && (
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      )}

      {/* Optional sections */}
      {(subInfo || children || updatedAt || onViewDetails) && (
        <div className="flex flex-col gap-3 flex-1 mt-4">
          {subInfo && <div>{subInfo}</div>}
          {children && <div className="flex-1">{children}</div>}

          {(updatedAt || onViewDetails) && (
            <div className="mt-auto flex items-center justify-between">
              {updatedAt && (
                <span className="text-caption leading-4 text-foreground-muted">{updatedAt}</span>
              )}
              {onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="flex items-center gap-1 text-caption font-medium text-primary transition-opacity hover:opacity-80"
                >
                  View Details
                  <ArrowRight className="h-[9px] w-[9px]" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
