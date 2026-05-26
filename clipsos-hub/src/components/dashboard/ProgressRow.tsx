/**
 * ProgressRow — Labeled progress bar used in pipeline cards.
 *
 * Shows: label (left), percentage/value (right), progress track.
 * Used in: Sales Pipeline, Project Progress, Deal Stages.
 */

interface ProgressRowProps {
  label: string;
  value: string;
  /** 0–100 */
  percent: number;
  /** Color of the filled portion */
  color?: "accent" | "accent-muted" | "success" | "danger";
}

const BAR_COLORS: Record<string, string> = {
  accent: "#ECD7FF",
  "accent-muted": "#D8B4FE",
  success: "#E7E384",
  danger: "#FFB4AB",
};

export function ProgressRow({ label, value, percent, color = "accent" }: ProgressRowProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-body leading-4 text-foreground-muted">{label}</span>
        <span className="text-body font-semibold text-foreground-strong">{value}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: BAR_COLORS[color],
          }}
        />
      </div>
    </div>
  );
}
