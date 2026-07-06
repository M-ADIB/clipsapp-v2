/** Display formatters for the preview modal. */

// ─── Time display format types ─────────────────────────────────────
export type TimeDisplayFormat = "timecode" | "standard" | "frames";

const DEFAULT_FPS = 24;

/**
 * SMPTE timecode: HH:MM:SS:FF
 * e.g. 00:37:53:22
 */
export function formatTimecode(totalSeconds: number | null | undefined, fps = DEFAULT_FPS): string {
  if (!totalSeconds || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "00:00:00:00";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const frames = Math.floor((totalSeconds % 1) * fps);
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
    String(frames).padStart(2, "0"),
  ].join(":");
}

/**
 * Standard time: M:SS or H:MM:SS
 * e.g. 37:53 or 1:37:53
 */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Frame count: absolute frame number.
 * e.g. 54,550
 */
export function formatFrameCount(
  totalSeconds: number | null | undefined,
  fps = DEFAULT_FPS,
): string {
  if (!totalSeconds || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0";
  }
  const frame = Math.floor(totalSeconds * fps);
  return frame.toLocaleString();
}

/**
 * Auto-format based on the selected display format.
 */
export function formatTime(
  totalSeconds: number | null | undefined,
  format: TimeDisplayFormat,
  fps = DEFAULT_FPS,
): string {
  switch (format) {
    case "timecode":
      return formatTimecode(totalSeconds, fps);
    case "frames":
      return formatFrameCount(totalSeconds, fps);
    case "standard":
    default:
      return formatDuration(totalSeconds);
  }
}

// ─── Other formatters (unchanged) ──────────────────────────────────

export function formatTimeAgo(timestamp: string | null | undefined): string {
  if (!timestamp) return "Unknown";
  const diffSec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diffSec < 86_400) {
    const h = Math.floor(diffSec / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const d = Math.floor(diffSec / 86_400);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}
