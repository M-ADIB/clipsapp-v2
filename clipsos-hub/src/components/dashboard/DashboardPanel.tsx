/**
 * DashboardPanel — Alert/notification panel with heading, filter pills, and content.
 *
 * Used in: Payment Status (Owner), Video Queue (Editor), Pending Approvals (Manager).
 * Includes optional decorative mesh gradient blur.
 */
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface DashboardPanelProps {
  title: string;
  /** Optional danger summary — e.g. "Total Overdue: $18,400" */
  dangerSummary?: string;
  /** Filter content (e.g. FilterPills) */
  filters?: ReactNode;
  /** Main scrollable content */
  children: ReactNode;
  /** Panel max height before scroll */
  maxHeight?: string;
}

export function DashboardPanel({
  title,
  dangerSummary,
  filters,
  children,
  maxHeight = "608px",
}: DashboardPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface" style={{ maxHeight }}>
      {/* Decorative mesh blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[43px] -top-16 h-32 w-32 rounded-xl opacity-100"
        style={{ background: "rgba(255, 180, 171, 0.05)", filter: "blur(32px)" }}
      />

      <div className="relative flex flex-col gap-5 p-4 md:gap-8 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4">
          <h3 className="font-display text-lg md:text-xl font-medium tracking-tight text-foreground-strong">
            {title}
          </h3>

          {/* Filters */}
          {filters}

          {/* Danger summary */}
          {dangerSummary && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-[color:var(--status-danger)]" />
              <span className="text-body font-medium text-[color:var(--status-danger)]">
                {dangerSummary}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
