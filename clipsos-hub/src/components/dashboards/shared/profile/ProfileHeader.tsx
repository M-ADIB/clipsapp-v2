/**
 * ProfileHeader — Hero section for team member profile pages.
 *
 * Shows: avatar (with initials fallback), name, role badge,
 * monthly progress pill, and daily pace indicator.
 */

import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  monthCompleted?: number;
  monthlyGoal?: number;
  dailyPace?: "on_track" | "at_risk" | "behind";
}

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  editor: {
    label: "Editor",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  senior_editor: {
    label: "Senior Editor",
    className: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  },
  closer: {
    label: "Closer",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  content_creator: {
    label: "Content Creator",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  manager: {
    label: "Manager",
    className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  },
  owner: {
    label: "Owner",
    className: "bg-primary/15 text-primary border-primary/20",
  },
};

const PACE_CONFIG = {
  on_track: { label: "On Track", className: "bg-emerald-500/15 text-emerald-400" },
  at_risk: { label: "At Risk", className: "bg-amber-500/15 text-amber-400" },
  behind: { label: "Behind", className: "bg-red-500/15 text-red-400" },
} as const;

export function ProfileHeader({
  fullName,
  email,
  avatarUrl,
  role,
  monthCompleted,
  monthlyGoal,
  dailyPace,
}: ProfileHeaderProps) {
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleConfig = ROLE_LABELS[role] ?? {
    label: role,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-card p-6 text-center sm:flex-row sm:text-left">
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName}
          className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-border"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary ring-2 ring-border">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <h2 className="font-display text-lg font-semibold text-foreground-strong truncate">
          {fullName}
        </h2>
        <p className="text-xs text-muted-foreground truncate">{email}</p>

        {/* Badges row */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {/* Role badge */}
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              roleConfig.className,
            )}
          >
            {roleConfig.label}
          </span>

          {/* Goal progress pill */}
          {monthCompleted != null && monthlyGoal != null && (
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground-strong tabular-nums">
              {monthCompleted}/{monthlyGoal} this month
            </span>
          )}

          {/* Pace indicator */}
          {dailyPace && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                PACE_CONFIG[dailyPace].className,
              )}
            >
              {PACE_CONFIG[dailyPace].label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
