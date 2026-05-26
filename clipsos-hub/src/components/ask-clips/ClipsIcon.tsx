/**
 * ClipsIcon — the MingCute "message-1-ai-fill" glyph used everywhere
 * we previously rendered <Sparkles /> for the Ask Clips feature.
 *
 * Inline SVG so we don't pull in a whole icon font for one mark.
 * Uses currentColor so callers can style with text-* utilities.
 */
import type { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function ClipsIcon({ size = 24, className, ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Speech bubble */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.03 2 11c0 2.79 1.41 5.27 3.61 6.91L4.5 21.5a.5.5 0 0 0 .74.55l4.07-2.27c.86.14 1.76.22 2.69.22 5.523 0 10-4.03 10-9S17.523 2 12 2Z"
      />
      {/* AI sparkle accent (top-right) */}
      <path d="M19.5 2.5a.4.4 0 0 1 .76 0l.34 1.04a1 1 0 0 0 .64.64l1.04.34a.4.4 0 0 1 0 .76l-1.04.34a1 1 0 0 0-.64.64l-.34 1.04a.4.4 0 0 1-.76 0l-.34-1.04a1 1 0 0 0-.64-.64l-1.04-.34a.4.4 0 0 1 0-.76l1.04-.34a1 1 0 0 0 .64-.64l.34-1.04Z" />
    </svg>
  );
}
