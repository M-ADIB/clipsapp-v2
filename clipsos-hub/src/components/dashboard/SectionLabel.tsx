/**
 * SectionLabel — Uppercase section header with optional collapse chevron.
 *
 * Used in: Sidebar nav groups, card sections.
 * Matches Figma: 10px, 600 weight, uppercase, letter-spacing 1px, muted text.
 */
import { ChevronRight } from "lucide-react";

interface SectionLabelProps {
  label: string;
  /** Show collapse chevron */
  collapsible?: boolean;
  /** Current collapsed state */
  collapsed?: boolean;
  onToggle?: () => void;
}

export function SectionLabel({
  label,
  collapsible = false,
  collapsed = false,
  onToggle,
}: SectionLabelProps) {
  const content = (
    <div className="flex w-full items-center justify-between px-6">
      <span className="text-eyebrow font-semibold uppercase tracking-[1px] text-label-uppercase">
        {label}
      </span>
      {collapsible && (
        <ChevronRight
          className={`h-[6px] w-[6px] text-label-uppercase transition-transform ${
            collapsed ? "" : "rotate-90"
          }`}
        />
      )}
    </div>
  );

  if (collapsible && onToggle) {
    return (
      <button onClick={onToggle} className="w-full py-0.5 text-left">
        {content}
      </button>
    );
  }

  return <div className="py-0.5">{content}</div>;
}
