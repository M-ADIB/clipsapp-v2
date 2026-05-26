/**
 * PipelineStepCard — Static metric card showing a stage count + optional progress bar.
 *
 * Used in: Client/Pipeline Velocity, Manager/Production Overview.
 * Each card = one stage in the video pipeline.
 *
 * Progress bar only renders when `percent` is greater than 0.
 * "Total Videos" cards pass percent=0 → no bar.
 * Stage cards pass their proportion → accent-colored bar.
 */

import { StatCard } from "./StatCard";

interface PipelineStepCardProps {
  /** Stage label — e.g. "Total Videos", "In Progress", "Review" */
  label: string;
  /** Count displayed large — e.g. 32 */
  count: number;
  /** Progress bar fill 0–100. When 0 or omitted, no bar is rendered. */
  percent?: number;
  /** Bar color — kept for API compat but now uses accent from design system */
  color?: "accent" | "accent-muted" | "danger" | "success" | "warning";
  /** Direct hex color override — kept for API compat */
  barColor?: string;
}

export function PipelineStepCard({ label, count, percent }: PipelineStepCardProps) {
  // Only pass percent to StatCard when it's a positive number
  // This ensures "Total Videos" (percent=0 or undefined) doesn't render a bar
  const showBar = percent != null && percent > 0;

  return <StatCard title={label} value={String(count)} {...(showBar ? { percent } : {})} />;
}
