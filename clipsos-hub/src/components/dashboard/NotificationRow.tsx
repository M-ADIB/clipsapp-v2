/**
 * NotificationRow — Alert/notification item used in Payment Status
 * and other alert panels across dashboards.
 *
 * Shows: colored icon box, title, description, action buttons.
 */
import type { LucideIcon } from "lucide-react";

interface NotificationAction {
  label: string;
  color?: "danger" | "accent";
  onClick?: () => void;
}

interface NotificationRowProps {
  icon: LucideIcon;
  /** Icon container bg — e.g. "danger", "success", "accent" */
  iconVariant?: "danger" | "success" | "accent";
  title: string;
  description: string;
  actions?: NotificationAction[];
}

const ICON_BG: Record<string, string> = {
  danger: "bg-[rgba(147,0,10,0.2)]",
  success: "bg-[rgba(231,227,132,0.1)]",
  accent: "bg-[rgba(80,61,111,0.2)]",
};

const ICON_COLOR: Record<string, string> = {
  danger: "text-[color:var(--status-danger)]",
  success: "text-[color:var(--status-success)]",
  accent: "text-primary",
};

const ACTION_COLOR: Record<string, string> = {
  danger: "text-[color:var(--status-danger)]",
  accent: "text-primary",
};

export function NotificationRow({
  icon: Icon,
  iconVariant = "danger",
  title,
  description,
  actions,
}: NotificationRowProps) {
  return (
    <div className="flex items-start gap-3 md:gap-4 pb-2">
      {/* Icon */}
      <div
        className={`flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded ${ICON_BG[iconVariant]}`}
      >
        <Icon className={`h-4 w-4 md:h-[18px] md:w-[18px] ${ICON_COLOR[iconVariant]}`} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-semibold text-foreground-strong">{title}</span>
        <span className="text-body text-foreground-muted">{description}</span>
        {actions && actions.length > 0 && (
          <div className="mt-1 flex gap-5">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className={`text-caption font-semibold uppercase tracking-wide transition-opacity hover:opacity-80 ${
                  ACTION_COLOR[a.color ?? "accent"]
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
