/**
 * JourneyEventCard — Calendar-style event card for "Their Journey" timeline.
 *
 * Shows: date block (month + day), event title, subtitle, optional arrow icon.
 * Used in: Client Workspace/Their Journey, Client Dashboard/Upcoming Events.
 *
 * From Figma: Practice Session / Shoot Day cards with yellow month labels.
 */

interface JourneyEventCardProps {
  /** Short month — e.g. "JUN", "OCT" */
  month: string;
  /** Day number — e.g. 14, 23 */
  day: number;
  /** Event title — e.g. "Practice Session", "Shoot Day" */
  title: string;
  /** Subtitle details — e.g. "Zoom Call • 14:00 GMT" */
  subtitle: string;
  /** Show navigation arrow */
  showArrow?: boolean;
  onClick?: () => void;
}

export function JourneyEventCard({
  month,
  day,
  title,
  subtitle,
  showArrow = true,
  onClick,
}: JourneyEventCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg bg-surface-card-2 p-6 text-left transition-colors hover:bg-surface-card"
    >
      <div className="flex items-center gap-6">
        {/* Date block with right border */}
        <div
          className="flex w-12 flex-col items-center pr-6"
          style={{ borderRight: "1px solid rgba(74, 69, 79, 0.2)" }}
        >
          <span className="text-body font-bold" style={{ color: "var(--status-success)" }}>
            {month}
          </span>
          <span className="font-[Manrope] text-2xl font-black leading-8 text-foreground-strong">
            {day}
          </span>
        </div>

        {/* Event info */}
        <div className="flex flex-col">
          <span className="text-base font-semibold leading-6 text-foreground-strong">{title}</span>
          <span className="text-body text-foreground-muted">{subtitle}</span>
        </div>
      </div>

      {/* Arrow */}
      {showArrow && (
        <span className="text-foreground-muted">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
