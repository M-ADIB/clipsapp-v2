/**
 * ActivityRow — Recent activity feed item.
 *
 * Shows: colored icon, heading, subtitle, right-aligned amount + timestamp.
 * Used in: Owner/Dashboard, Manager/Dashboard, any "Recent Activity" feed.
 */
import type { LucideIcon } from "lucide-react";

interface ActivityRowProps {
  icon: LucideIcon;
  /** Icon bg variant */
  iconVariant?: "success" | "accent" | "danger";
  heading: string;
  subtext: string;
  /** Right-aligned value — e.g. "$12,000" */
  amount?: string;
  /** Right-aligned timestamp — e.g. "2 hrs ago" */
  timestamp?: string;
}

const ICON_BG: Record<string, string> = {
  success: "bg-[rgba(231,227,132,0.1)]",
  accent: "bg-[rgba(80,61,111,0.2)]",
  danger: "bg-[rgba(147,0,10,0.2)]",
};

const ICON_TEXT: Record<string, string> = {
  success: "text-[color:var(--status-success)]",
  accent: "text-primary",
  danger: "text-[color:var(--status-danger)]",
};

export function ActivityRow({
  icon: Icon,
  iconVariant = "accent",
  heading,
  subtext,
  amount,
  timestamp,
}: ActivityRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-surface p-4">
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${ICON_BG[iconVariant]}`}
      >
        <Icon className={`h-[18px] w-[18px] ${ICON_TEXT[iconVariant]}`} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold text-foreground-strong">{heading}</span>
        <span className="text-body text-foreground-muted">{subtext}</span>
      </div>

      {/* Right side */}
      {(amount || timestamp) && (
        <div className="flex shrink-0 flex-col items-end">
          {amount && <span className="text-sm font-bold text-foreground-strong">{amount}</span>}
          {timestamp && <span className="text-caption text-foreground-muted">{timestamp}</span>}
        </div>
      )}
    </div>
  );
}
