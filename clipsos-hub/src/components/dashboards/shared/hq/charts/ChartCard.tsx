/**
 * ChartCard — Reusable card wrapper for all HQ dashboard charts.
 *
 * Features: title, optional subtitle, optional badge, hover glow,
 * animated entrance, and consistent styling.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: { label: string; className?: string };
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, badge, children, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/60 bg-surface-card p-4 md:p-5",
        "transition-all duration-300 ease-out",
        "hover:border-border hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      {/* Ambient glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-b from-primary/[0.02] to-transparent" />

      {/* Header */}
      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display text-[13px] font-semibold tracking-tight text-foreground-strong">
            {title}
          </h3>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold tabular-nums",
              badge.className ?? "bg-primary/10 text-primary",
            )}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
