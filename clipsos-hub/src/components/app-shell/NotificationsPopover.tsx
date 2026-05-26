/**
 * NotificationsPopover — Bell icon dropdown matching the reference design.
 *
 * Features:
 * - Tabs: All / Mentioned / Assigned
 * - Search input with "Unread only" toggle
 * - Empty state with bell icon
 * - "Mark all read" / "Settings" via ··· menu
 * - Pops from the bell icon in TopNav
 * - Wired to live notification data
 */
import { useState, useMemo } from "react";
import {
  Bell,
  Search,
  MoreHorizontal,
  X,
  AtSign,
  UserPlus,
  MessageSquare,
  RefreshCw,
  ThumbsUp,
  MessagesSquare,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
} from "@/hooks/use-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";

type NotifTab = "all" | "mentioned" | "assigned";

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

interface NotificationsPopoverProps {
  /** Number shown on the badge dot — 0 hides the dot */
  unreadCount?: number;
}

export function NotificationsPopover({ unreadCount: _externalCount }: NotificationsPopoverProps) {
  const [tab, setTab] = useState<NotifTab>("all");
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  const { data: notifications = [] } = useNotifications();
  const { data: liveUnreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();

  const unreadCount = _externalCount ?? liveUnreadCount;

  const tabs: { key: NotifTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "mentioned", label: "Mentioned" },
    { key: "assigned", label: "Assigned" },
  ];

  // Filter notifications based on tab, search, and unread toggle
  const filtered = useMemo(() => {
    let items = notifications;

    // Tab filter
    if (tab === "mentioned") {
      items = items.filter((n) => n.type === "mention");
    } else if (tab === "assigned") {
      items = items.filter((n) => n.type === "assignment" || n.type === "task");
    }

    // Unread only
    if (unreadOnly) {
      items = items.filter((n) => !n.read);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) => n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q),
      );
    }

    return items;
  }, [notifications, tab, unreadOnly, search]);

  const handleMarkAllRead = async () => {
    if (!tenantId || !user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .eq("read", false);
    qc.invalidateQueries({
      queryKey: queryKeys.notifications.list(tenantId, user.id),
    });
    qc.invalidateQueries({
      queryKey: queryKeys.notifications.unreadCount(tenantId, user.id),
    });
    setShowMenu(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-7 w-7 items-center justify-center rounded-lg text-foreground hover:text-foreground-muted hover:bg-surface-raised/60"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span
              className="absolute right-[4px] top-[2px] h-2 w-2 rounded-full bg-status-danger badge-pulse"
              style={{ boxShadow: "0px 0px 0px 2px var(--background)" }}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-[380px] p-0">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-base font-semibold text-foreground">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1">
            {/* ··· menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-disabled hover:bg-foreground/[0.06] hover:text-foreground-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-[160px] rounded-md border border-border bg-surface-card py-1 shadow-lg">
                    <button
                      onClick={handleMarkAllRead}
                      className="flex w-full items-center px-3 py-1.5 text-xs text-foreground-muted hover:bg-foreground/[0.04] hover:text-foreground"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center px-3 py-1.5 text-xs text-foreground-muted hover:bg-foreground/[0.04] hover:text-foreground"
                    >
                      Notification settings
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="flex items-center gap-4 border-b border-border px-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "border-b-2 pb-2 text-xs font-medium transition-colors",
                t.key === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-foreground-disabled hover:text-foreground-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Search + Unread toggle ─────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-surface-raised/50 px-2.5 py-1.5">
            <Search className="h-3 w-3 text-foreground-disabled" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-foreground-disabled focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="h-3 w-3 text-foreground-disabled hover:text-foreground-muted" />
              </button>
            )}
          </div>

          {/* Unread only toggle */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                unreadOnly ? "bg-primary" : "bg-foreground/10",
              )}
              aria-label="Toggle unread only"
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                  unreadOnly ? "left-[18px]" : "left-0.5",
                )}
              />
            </button>
            <span className="text-[11px] text-foreground-disabled whitespace-nowrap">
              Unread only
            </span>
          </div>
        </div>

        {/* ── Notification list / empty state ─────────────────── */}
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto px-2 pb-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/[0.06]">
                <Bell className="h-6 w-6 text-foreground-disabled" />
              </div>
              <span className="text-sm text-foreground-disabled">
                {search
                  ? "No matching notifications"
                  : unreadOnly
                    ? "No unread notifications"
                    : "No notifications yet"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filtered.map((notification) => {
                const Icon = getIcon(notification.type);
                const isUnread = !notification.read;

                return (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (isUnread) markRead.mutate(notification.id);
                      if (notification.link) {
                        navigate({ to: notification.link });
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "group flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                      isUnread
                        ? "bg-primary/[0.04] hover:bg-primary/[0.08]"
                        : "hover:bg-foreground/[0.03]",
                    )}
                  >
                    {/* Unread dot */}
                    <div className="flex shrink-0 items-center pt-1">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isUnread ? "bg-primary" : "bg-transparent",
                        )}
                      />
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        isUnread
                          ? "bg-primary/10 text-primary"
                          : "bg-foreground/[0.06] text-foreground-muted",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p
                        className={cn(
                          "text-[13px] leading-snug",
                          isUnread ? "font-medium text-foreground-strong" : "text-foreground",
                        )}
                      >
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="line-clamp-2 text-[11px] text-foreground-muted">
                          {notification.message}
                        </p>
                      )}
                      <span className="mt-0.5 text-[10px] text-foreground-disabled">
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
      </PopoverContent>
    </Popover>
  );
}
