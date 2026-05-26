/**
 * PillarBadge — Color-coded badge for content pillars.
 *
 * Maps pillar names to a consistent color scheme.
 */

const PILLAR_COLORS: Record<string, { bg: string; text: string }> = {
  reach: { bg: "bg-blue-500/15", text: "text-blue-400" },
  nurture: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  convert: { bg: "bg-amber-500/15", text: "text-amber-400" },
  educate: { bg: "bg-violet-500/15", text: "text-violet-400" },
  inspire: { bg: "bg-rose-500/15", text: "text-rose-400" },
  entertain: { bg: "bg-cyan-500/15", text: "text-cyan-400" },
};

const DEFAULT_COLORS = { bg: "bg-foreground-muted/10", text: "text-foreground-muted" };

interface PillarBadgeProps {
  pillar: string | null | undefined;
  className?: string;
}

export function PillarBadge({ pillar, className = "" }: PillarBadgeProps) {
  if (!pillar) return null;

  const key = pillar.toLowerCase();
  const colors = PILLAR_COLORS[key] ?? DEFAULT_COLORS;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${className}`}
    >
      {pillar}
    </span>
  );
}
