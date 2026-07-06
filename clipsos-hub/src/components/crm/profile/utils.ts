import { formatDate, formatDateTime } from "@/lib/format";
/**
 * CRM Profile — Shared utility helpers (formatting, badges, initials).
 */

// Re-exported so existing `import { formatDate, formatDateTime } from "../utils"`
// call sites keep working now that these live in the shared format lib.
export { formatDate, formatDateTime };

export function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function sourceBadgeColor(source: string | null): string {
  switch (source) {
    case "attio":
      return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    case "career_form":
      return "bg-purple-500/15 text-purple-400 border-purple-500/20";
    case "intake_form":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "client":
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "partnership":
      return "bg-pink-500/15 text-pink-400 border-pink-500/20";
    default:
      return "bg-surface-raised text-foreground-muted border-border";
  }
}

export function statusColor(status: string | null): string {
  switch (status?.toLowerCase()) {
    case "active":
    case "completed":
    case "sent":
      return "bg-emerald-500/15 text-emerald-400";
    case "pending":
    case "scheduled":
    case "queued":
      return "bg-amber-500/15 text-amber-400";
    case "cancelled":
    case "failed":
    case "inactive":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-surface-raised text-foreground-muted";
  }
}
