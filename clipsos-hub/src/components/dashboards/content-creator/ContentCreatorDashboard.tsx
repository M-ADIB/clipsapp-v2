/**
 * ContentCreatorDashboard — Content creator's landing page.
 *
 * Layout:
 *   ┌─ Weekly Calendly Events Widget ──────────────────────────────────┐
 *   │  7-day strip showing upcoming Calendly events per day            │
 *   ├─ Content Production Board (Kanban) ──────────────────────────────┤
 *   │  Full configurable Kanban with content-focused cards             │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * All data is live from Supabase via existing hooks.
 */
import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Settings2,
  RefreshCw,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { FullBleed } from "@/components/app-shell/FullBleed";

import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useCalendlyEvents } from "@/hooks/data";
import { useCloserRegion, useSyncCalendlyEvents } from "@/hooks/use-closer-region";
import { CalendlySettingsDialog } from "@/components/dashboards/closer/CalendlySettingsDialog";
import { ContentBoard } from "./ContentBoard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Calendar Helpers                                                     */
/* ------------------------------------------------------------------ */

function getWeekDays(offset: number): Date[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/* Calendly Event type (simplified for the widget)                      */
/* ------------------------------------------------------------------ */

interface CalendlyEventSlim {
  id: string;
  event_type_name: string | null;
  start_time: string;
  end_time: string;
  invitee_name: string | null;
  status: string;
}

/* ------------------------------------------------------------------ */
/* Calendly Events Calendar Widget                                     */
/* ------------------------------------------------------------------ */

function CalendlyCalendarWidget({
  weekOffset,
  onPrev,
  onNext,
  events,
  isLoading,
  isConnected,
  onOpenSettings,
  onSync,
  isSyncing,
}: {
  weekOffset: number;
  onPrev: () => void;
  onNext: () => void;
  events: CalendlyEventSlim[];
  isLoading: boolean;
  isConnected: boolean;
  onOpenSettings: () => void;
  onSync: () => void;
  isSyncing: boolean;
}) {
  const days = getWeekDays(weekOffset);
  const today = new Date();

  // Map events to their start dates
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendlyEventSlim[]>();
    for (const ev of events) {
      if (ev.status === "canceled") continue;
      const d = new Date(ev.start_time);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const weekLabel = useMemo(() => {
    const start = days[0];
    const end = days[6];
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  }, [days]);

  // Not connected — show onboarding CTA
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-card px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-sm font-semibold text-foreground-strong">
            Connect Your Calendar
          </h3>
          <p className="text-xs text-foreground-muted max-w-sm">
            Link your Calendly account to see your upcoming events right here. Add your personal API
            token to get started.
          </p>
        </div>
        <Button size="sm" onClick={onOpenSettings} className="gap-2">
          <Settings2 className="h-3.5 w-3.5" />
          Connect Calendly
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-medium text-foreground-strong">
            Upcoming Calls
          </h3>
          <span className="text-xs text-foreground-disabled">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-surface-raised disabled:opacity-50"
            title="Sync events"
          >
            {isSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground-muted" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-foreground-muted" />
            )}
          </button>
          <button
            onClick={onOpenSettings}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-surface-raised"
            title="Calendly settings"
          >
            <Settings2 className="h-3.5 w-3.5 text-foreground-muted" />
          </button>
          <div className="ml-1 h-4 w-px bg-border" />
          <button
            onClick={onPrev}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-surface-raised"
          >
            <ChevronLeft className="h-4 w-4 text-foreground-muted" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => {
                /* parent handles reset via setting offset 0 */
              }}
              className="rounded-md px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={onNext}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-surface-raised"
          >
            <ChevronRight className="h-4 w-4 text-foreground-muted" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[90px] animate-pulse rounded-lg bg-surface-raised" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((day) => {
            const todayFlag = isSameDay(day, today);
            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const dayEvents = eventsByDay.get(key) ?? [];

            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col gap-1.5 rounded-lg p-2.5 transition-colors min-h-[90px]",
                  todayFlag
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "bg-surface-raised/50 hover:bg-surface-raised",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-foreground-disabled">
                    {DAY_NAMES[day.getDay()]}
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                      todayFlag ? "bg-primary text-primary-foreground" : "text-foreground-strong",
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>
                {dayEvents.length === 0 ? (
                  <span className="text-[9px] text-foreground-disabled">No events</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const startTime = new Date(ev.start_time);
                      const timeStr = startTime.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });
                      return (
                        <div
                          key={ev.id}
                          className="flex items-start gap-1 rounded px-1 py-0.5"
                          style={{
                            borderLeft: "2px solid rgb(59,130,246)",
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="text-[9px] font-medium leading-tight text-foreground-strong truncate max-w-[100px]">
                              {ev.invitee_name || ev.event_type_name || "Event"}
                            </span>
                            <span className="text-[8px] text-foreground-disabled">{timeStr}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-foreground-disabled pl-1">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Link to full schedule page */}
      <div className="flex justify-end">
        <Link
          to="/content-creator/schedule"
          className="flex items-center gap-1.5 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          View full schedule
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function ContentCreatorDashboard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [weekOffset, setWeekOffset] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setHeaderConfig({ title: "Dashboard" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  // ── Calendly data ─────────────────────────────────────────────────
  const { data: region, isLoading: regionLoading } = useCloserRegion();
  const { data: calendlyEvents, isLoading: eventsLoading } = useCalendlyEvents();
  const syncMutation = useSyncCalendlyEvents();

  const isCalendlyConnected = !!region?.calendly_api_key;

  const calendlyEventsList: CalendlyEventSlim[] = useMemo(() => {
    if (!calendlyEvents) return [];
    return calendlyEvents.map((e) => ({
      id: e.id,
      event_type_name: e.event_type_name,
      start_time: e.start_time,
      end_time: e.end_time,
      invitee_name: e.invitee_name,
      status: e.status,
    }));
  }, [calendlyEvents]);

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Synced ${data.synced} events from Calendly`);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to sync events");
      },
    });
  };

  return (
    <FullBleed>
      {/* ── Calendly Events Calendar Widget (top strip) ── */}
      <div className="px-3 pt-5 md:px-5 md:pt-6">
        <CalendlyCalendarWidget
          weekOffset={weekOffset}
          onPrev={() => setWeekOffset((w) => w - 1)}
          onNext={() => setWeekOffset((w) => w + 1)}
          events={calendlyEventsList}
          isLoading={regionLoading || eventsLoading}
          isConnected={isCalendlyConnected}
          onOpenSettings={() => setSettingsOpen(true)}
          onSync={handleSync}
          isSyncing={syncMutation.isPending}
        />
      </div>

      {/* ── Calendly Settings Dialog ── */}
      <CalendlySettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* ── Content Production Board (full Kanban) ── */}
      <div className="flex flex-1 flex-col">
        <ContentBoard />
      </div>
    </FullBleed>
  );
}
