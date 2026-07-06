/**
 * Shared priority badge styles for editor video/task lists.
 *
 * Previously duplicated verbatim in EditorWorkspace.tsx and EditorVideosPage.tsx.
 * Values are theme tokens (CSS custom properties) so they re-theme correctly in
 * light/dark and per-tenant branding — no hardcoded hex.
 */
export interface PriorityStyle {
  bg: string;
  text: string;
  label: string;
}

export const PRIORITY_STYLES: Record<string, PriorityStyle> = {
  high: {
    bg: "color-mix(in srgb, var(--status-danger) 15%, transparent)",
    text: "var(--status-danger)",
    label: "High",
  },
  medium: {
    bg: "color-mix(in srgb, var(--status-warning) 15%, transparent)",
    text: "var(--status-warning)",
    label: "Medium",
  },
  low: {
    bg: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    text: "var(--foreground-muted)",
    label: "Low",
  },
  normal: {
    bg: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    text: "var(--foreground-muted)",
    label: "Normal",
  },
};

/** Resolve a priority's style, falling back to "normal" for unknown values. */
export function priorityStyle(priority: string | null | undefined): PriorityStyle {
  return (priority && PRIORITY_STYLES[priority]) || PRIORITY_STYLES.normal;
}
