/**
 * TaskCard — Left-bordered task item for "What's Next" sections.
 *
 * Design spec (Figma):
 *   Light mode: transparent bg, border rgba(0,0,0,0.1), accent left border
 *   Dark mode: surface-card (#1E1C1D) bg, no outline border, accent left border
 *   Left border color = platform accent (var(--primary-glow) → #D8B4FE default)
 *
 * All accent colors are controlled by the design system (app branding).
 * Badges: light = solid fill + white text, dark = translucent fill + colored text.
 */

interface TaskCardProps {
  /** Task title — e.g. "Fill onboarding document" */
  title: string;
  /** Description text */
  description: string;
  /** Status badge label — e.g. "Complete", "Client", "Pending" */
  badgeLabel?: string;
  /** Badge color variant */
  badgeColor?: "success" | "accent" | "warning" | "danger" | "info" | "pink";
  onClick?: () => void;
}

/** Light-mode badge: solid bg + white text.  Dark-mode badge: translucent bg + colored text */
const BADGE_CFG: Record<string, { lightBg: string; darkBg: string; darkText: string }> = {
  success: {
    lightBg: "#20C933",
    darkBg: "rgba(221,255,215,0.1)",
    darkText: "#33FF00",
  },
  accent: {
    lightBg: "#CDB0FF",
    darkBg: "rgba(236,215,255,0.1)",
    darkText: "#ECD7FF",
  },
  warning: {
    lightBg: "#FCB400",
    darkBg: "rgba(252,180,0,0.1)",
    darkText: "#FCB400",
  },
  danger: {
    lightBg: "#DC2626",
    darkBg: "rgba(255,107,107,0.1)",
    darkText: "#FF6B6B",
  },
  info: {
    lightBg: "#2D7FF9",
    darkBg: "rgba(45,127,249,0.1)",
    darkText: "#A3D2FF",
  },
  pink: {
    lightBg: "#F99DE2",
    darkBg: "rgba(249,157,226,0.1)",
    darkText: "#F99DE2",
  },
};

export function TaskCard({
  title,
  description,
  badgeLabel,
  badgeColor = "accent",
  onClick,
}: TaskCardProps) {
  const badge = BADGE_CFG[badgeColor] ?? BADGE_CFG.accent;

  return (
    <button
      onClick={onClick}
      className="task-card flex w-full flex-col gap-2.5 md:gap-[14px] rounded-[7px] md:rounded-[10px] p-3 md:p-[15px] text-left transition-opacity hover:opacity-90"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 md:gap-4">
        <span className="font-display text-[15px] md:text-[17px] font-semibold leading-5 md:leading-6 text-foreground-muted dark:font-medium dark:text-foreground-strong">
          {title}
        </span>
        {badgeLabel && (
          <span
            className="task-card-badge shrink-0 rounded-xl px-2 md:px-2.5 py-[3px] text-[8px] md:text-[8.5px] font-semibold uppercase tracking-wide"
            style={
              {
                "--badge-light-bg": badge.lightBg,
                "--badge-dark-bg": badge.darkBg,
                "--badge-dark-text": badge.darkText,
              } as React.CSSProperties
            }
          >
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[11px] md:text-[12px] leading-[14px] text-foreground-muted">
        {description}
      </p>
    </button>
  );
}
