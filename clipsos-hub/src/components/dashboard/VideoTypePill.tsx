/**
 * VideoTypePill — Bordered pill badge for video type labels.
 *
 * From Figma My Videos table:
 *   border: 0.5px solid rgba(255,255,255,0.9)
 *   radius: 90px (fully rounded)
 *   font: 10px Inter, rgba(255,255,255,0.9), opacity 0.8
 *   padding: 2.5px 8.5px
 */

interface VideoTypePillProps {
  /** Type label — e.g. "Caption Video", "Talking Head", "B-Roll" */
  label: string;
}

export function VideoTypePill({ label }: VideoTypePillProps) {
  return (
    <span
      className="inline-flex items-center justify-center whitespace-nowrap rounded-full opacity-80"
      style={{
        border: "0.5px solid rgba(255,255,255,0.9)",
        padding: "2.5px 8.5px",
      }}
    >
      <span
        className="text-[10px] leading-[15px]"
        style={{
          color: "rgba(255,255,255,0.9)",
          fontFeatureSettings: "'ss01' on, 'cv01' on, 'cv11' on",
        }}
      >
        {label}
      </span>
    </span>
  );
}
