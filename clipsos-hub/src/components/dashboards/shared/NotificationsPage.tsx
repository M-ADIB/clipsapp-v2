/**
 * NotificationsPage — shared notification center for all roles.
 *
 * Shows all notifications for the current user with read/unread state,
 * mark-as-read on click, and "Mark all as read" bulk action.
 */
import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  Video,
  MessageSquare,
  UserPlus,
  AlertCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AtSign,
  RefreshCw,
  ThumbsUp,
  MessagesSquare,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
} from "@/hooks/use-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";

type FilterTab = "all" | "unread";

const TYPE_ICONS: Record<string, LucideIcon> = {
  info: Bell,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  mention: AtSign,
  comment: MessageSquare,
  status_change: RefreshCw,
  assignment: UserPlus,
  approval: ThumbsUp,
  chat: MessagesSquare,
  task: ListTodo,
};

function getIcon(type: string | null): LucideIcon {
  if (!type) return Bell;
  return TYPE_ICONS[type] ?? Bell;
}

export function NotificationsPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    setHeaderConfig({ title: "Notifications", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const handleMarkAllRead = async () => {
    if (!tenantId || !user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .eq("read", false);
    qc.invalidateQueries({ queryKey: queryKeys.notifications.list(tenantId, user.id) });
    qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(tenantId, user.id) });
  };

  return (
    <FullBleed>
      <div className="flex w-full flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* ── Toolbar ────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        {/* ── Filter tabs ───────────────────────────────────── */}
        <div className="flex gap-1 rounded-lg bg-surface-card-2 p-1">
          {(["all", "unread"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                filter === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              {tab === "unread" ? `Unread (${unreadCount})` : "All"}
            </button>
          ))}
        </div>

        {/* ── List ──────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-card-2" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/[0.06]">
              <BellOff className="h-5 w-5 text-foreground-disabled" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-xs text-foreground-muted">
              {filter === "unread"
                ? "You're all caught up!"
                : "You'll see updates about your videos, tasks, and team activity here."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((notification) => {
              const Icon = getIcon(notification.type);
              const isUnread = !notification.read;

              return (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (isUnread) markRead.mutate(notification.id);
                    if (notification.link) navigate({ to: notification.link });
                  }}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                    isUnread
                      ? "bg-primary/[0.04] hover:bg-primary/[0.08]"
                      : "hover:bg-foreground/[0.03]",
                  )}
                >
                  {/* Unread dot */}
                  <div className="flex shrink-0 items-center pt-1">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isUnread ? "bg-primary" : "bg-transparent",
                      )}
                    />
                  </div>

                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      isUnread
                        ? "bg-primary/10 text-primary"
                        : "bg-foreground/[0.06] text-foreground-muted",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        isUnread ? "font-medium text-foreground-strong" : "text-foreground",
                      )}
                    >
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="line-clamp-2 text-xs text-foreground-muted">
                        {notification.message}
                      </p>
                    )}
                    <span className="mt-0.5 text-[11px] text-foreground-disabled">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FullBleed>
  );
}
