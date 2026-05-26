/**
 * FilterPills — Rounded pill filter buttons used across dashboards.
 *
 * Active = filled bg (accent), inactive = bordered.
 * Used in: Payment Status panel, Video filters, Pipeline filters.
 */

interface FilterPill {
  label: string;
  value: string;
}

interface FilterPillsProps {
  pills: FilterPill[];
  active: string;
  onSelect: (value: string) => void;
}

export function FilterPills({ pills, active, onSelect }: FilterPillsProps) {
  return (
    <div className="flex items-center gap-1">
      {pills.map((pill) => {
        const isActive = pill.value === active;
        return (
          <button
            key={pill.value}
            onClick={() => onSelect(pill.value)}
            className={`rounded-full px-2 py-[5px] font-display text-[9.33px] font-medium tracking-tight transition-all ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "border border-border-strong text-foreground hover:border-foreground/30"
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
