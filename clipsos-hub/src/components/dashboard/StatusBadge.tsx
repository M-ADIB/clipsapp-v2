/**
 * StatusBadge — Dot + colored label for video/item statuses.
 *
 * 5 variants from My Videos Figma:
 *   in_review  → purple dot #95A4FC, text #8A8CD9
 *   approved   → green dot #A1E3CB, text #4AA785
 *   posted     → blue dot #B1E3FF, text #59A8D4
 *   pending    → yellow dot #FFE999, text #FFC555
 *   draft      → gray dot rgba(255,255,255,0.4)
 *
 * Also supports custom color overrides for statuses from the DB lookup table.
 */

type StatusVariant = "in_review" | "approved" | "posted" | "pending" | "draft";

interface StatusBadgeProps {
  /** Predefined variant — maps to the Figma color palette */
  variant?: StatusVariant;
  /** Label text — e.g. "In Review", "Approved" */
  label: string;
  /** Custom dot color (overrides variant) */
  dotColor?: string;
  /** Custom text color (overrides variant) */
  textColor?: string;
}

const VARIANT_COLORS: Record<StatusVariant, { dot: string; text: string }> = {
  in_review: { dot: "#95A4FC", text: "#8A8CD9" },
  approved: { dot: "#A1E3CB", text: "#4AA785" },
  posted: { dot: "#B1E3FF", text: "#59A8D4" },
  pending: { dot: "#FFE999", text: "#FFC555" },
  draft: { dot: "rgba(255,255,255,0.4)", text: "rgba(255,255,255,0.4)" },
};

export function StatusBadge({ variant = "draft", label, dotColor, textColor }: StatusBadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const finalDot = dotColor ?? colors.dot;
  const finalText = textColor ?? colors.text;

  return (
    <span className="inline-flex items-center gap-0 rounded" style={{ padding: "1px 0" }}>
      {/* Dot container — 16×16 with centered 6×6 circle */}
      <span className="flex h-4 w-4 items-center justify-center">
        <span
          className="block h-[6px] w-[6px] rounded-full"
          style={{ backgroundColor: finalDot }}
        />
      </span>
      {/* Label */}
      <span
        className="text-xs leading-[18px]"
        style={{
          color: finalText,
          fontFeatureSettings: "'ss01' on, 'cv01' on, 'cv11' on",
        }}
      >
        {label}
      </span>
    </span>
  );
}
