/**
 * ActivityTab — Filterable activity feed for this client.
 *
 * Wired to: useActivityLog({ entityType: "client", entityId: clientId })
 * Shows: chronological feed with actor info, event types, timestamps
 */
import { useState, useMemo } from "react";
import { useActivityLog } from "@/hooks/data";
import {
  FileEdit,
  Upload,
  MessageSquare,
  UserPlus,
  Settings,
  CheckCircle,
  Loader2,
  Activity,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityTabProps {
  clientId: string;
}

const ACTION_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  created: { icon: FileEdit, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  updated: { icon: Settings, color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  deleted: { icon: Trash2, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  uploaded: { icon: Upload, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  commented: { icon: MessageSquare, color: "#eab308", bg: "rgba(234,179,8,0.1)" },
  assigned: { icon: UserPlus, color: "#d8b4fe", bg: "rgba(216,180,254,0.1)" },
  approved: { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  status_changed: { icon: Activity, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
};

const DEFAULT_CONFIG = { icon: Activity, color: "#9ca3af", bg: "rgba(156,163,175,0.1)" };

const FILTER_OPTIONS = [
  { value: "All", label: "All Activity" },
  { value: "created", label: "Creations" },
  { value: "updated", label: "Updates" },
  { value: "status_changed", label: "Status Changes" },
  { value: "uploaded", label: "Uploads" },
  { value: "commented", label: "Comments" },
  { value: "approved", label: "Approvals" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ActivityTab({ clientId }: ActivityTabProps) {
  const {
    data: logs,
    isLoading,
    error,
  } = useActivityLog({ entityType: "client", entityId: clientId, limit: 100 });

  const [filter, setFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    if (!logs) return [];
    if (filter === "All") return logs;
    return logs.filter((l) => l.action === filter);
  }, [logs, filter]);

  const renderDescription = (log: any) => {
    const meta = log.metadata as Record<string, any> | null;
    const targetName = meta?.target_name
      ? `"${meta.target_name}"`
      : `this ${log.entity_type || "item"}`;
    const actorName = log.actor?.full_name || "System";

    switch (log.action) {
      case "status_changed":
        if (meta?.old_status && meta?.new_status) {
          return (
            <span>
              <strong>{actorName}</strong> changed status of {targetName} from{" "}
              <span className="text-foreground-muted underline font-medium">{meta.old_status}</span>{" "}
              to <span className="text-primary font-semibold">{meta.new_status}</span>
            </span>
          );
        }
        return (
          <span>
            <strong>{actorName}</strong> updated status of {targetName}
          </span>
        );
      case "commented":
        return (
          <span>
            <strong>{actorName}</strong> commented on {targetName}
          </span>
        );
      case "uploaded":
        return (
          <span>
            <strong>{actorName}</strong> uploaded version{" "}
            {meta?.version_name ? `"${meta.version_name}"` : ""} for {targetName}
          </span>
        );
      case "approved":
        return (
          <span>
            <strong>{actorName}</strong> marked journey step {targetName} as complete
          </span>
        );
      case "created":
        return (
          <span>
            <strong>{actorName}</strong> created {log.entity_type} {targetName}
          </span>
        );
      case "updated":
        return (
          <span>
            <strong>{actorName}</strong> updated {log.entity_type} {targetName}
          </span>
        );
      case "deleted":
        return (
          <span>
            <strong>{actorName}</strong> deleted {log.entity_type} {targetName}
          </span>
        );
      default:
        return (
          <span>
            <strong>{actorName}</strong> performed action "{log.action}" on {targetName}
          </span>
        );
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-[color:var(--status-danger)]/20">
        <span className="text-sm text-[color:var(--status-danger)]">
          Failed to load activity: {error.message}
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-surface-card text-foreground-disabled border border-border-strong hover:text-foreground hover:bg-surface-card/85"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto shrink-0 text-caption text-foreground-disabled">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Feed list */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-card/25 p-8">
          <Activity className="h-8 w-8 text-foreground-disabled" />
          <span className="text-sm font-medium text-foreground-muted">No activity logged</span>
          <span className="text-xs text-foreground-disabled">
            Any updates or operations performed in this client workspace will appear here.
          </span>
        </div>
      ) : (
        <div className="flex flex-col border border-border-strong rounded-xl bg-surface-card divide-y divide-border-strong overflow-hidden shadow-sm">
          {filtered.map((log) => {
            const cfg = ACTION_CONFIG[log.action] ?? DEFAULT_CONFIG;
            const Icon = cfg.icon;
            const actorName = log.actor?.full_name || "System";

            return (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 transition-colors hover:bg-foreground/[0.01]"
              >
                {/* User Avatar */}
                <Avatar className="h-8 w-8 shrink-0 border border-border-strong">
                  {log.actor?.avatar_url && (
                    <AvatarImage src={log.actor.avatar_url} alt={actorName} />
                  )}
                  <AvatarFallback className="text-[10px] font-bold bg-background text-foreground-muted">
                    {getInitials(actorName)}
                  </AvatarFallback>
                </Avatar>

                {/* Event Details */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="text-xs text-foreground-muted leading-relaxed">
                    {renderDescription(log)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-foreground-disabled uppercase font-semibold tracking-wider">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span>•</span>
                    <span>{log.entity_type}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <span className="shrink-0 text-[10px] text-foreground-disabled font-medium">
                  {timeAgo(log.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
