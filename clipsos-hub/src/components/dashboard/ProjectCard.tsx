/**
 * ProjectCard — Plan/project card with header, team avatars, and progress bar.
 *
 * Used in: Client/Your Plans, Manager/Active Projects.
 */

interface TeamMember {
  name: string;
  avatarUrl?: string;
}

interface ProjectCardProps {
  /** Project name — e.g. "ClipsOS" */
  name: string;
  /** Start date label — e.g. "Started 26 May 2026" */
  startedAt?: string;
  /** Team members (shows avatar stack) */
  team?: TeamMember[];
  /** Extra member count — e.g. +3 */
  extraMembers?: number;
  /** Progress label — e.g. "Progress" */
  progressLabel?: string;
  /** Progress percentage text — e.g. "65%" */
  progressValue?: string;
  /** Progress bar 0–100 */
  percent?: number;
  onClick?: () => void;
}

export function ProjectCard({
  name,
  startedAt,
  team = [],
  extraMembers = 0,
  progressLabel = "Progress",
  progressValue,
  percent = 0,
  onClick,
}: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-4 md:gap-6 rounded-lg bg-surface-card-2 p-4 md:p-6 text-left transition-colors hover:bg-surface-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          {startedAt && (
            <span className="font-display text-[10px] font-[450] tracking-tight text-foreground-muted">
              {startedAt}
            </span>
          )}
          <h4 className="font-display text-[20px] md:text-[26px] font-medium leading-none tracking-tight text-foreground-strong">
            {name}
          </h4>
        </div>
        {/* More menu icon */}
        <span className="text-label-uppercase">⋯</span>
      </div>

      {/* Team avatars */}
      {(team.length > 0 || extraMembers > 0) && (
        <div className="flex items-center">
          {team.map((m, i) => (
            <div
              key={i}
              className="-ml-2 first:ml-0 h-8 w-8 overflow-hidden rounded-xl border-2 border-surface-card-2"
            >
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-muted text-[10px] font-bold text-foreground-strong">
                  {m.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {extraMembers > 0 && (
            <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-surface-card-2 bg-surface-muted">
              <span className="text-[10px] font-bold text-foreground-strong">+{extraMembers}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-body text-foreground-muted">{progressLabel}</span>
          {progressValue && (
            <span className="text-body font-bold text-foreground-strong">{progressValue}</span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>
    </button>
  );
}
