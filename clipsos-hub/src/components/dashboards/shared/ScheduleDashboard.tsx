/**
 * ScheduleDashboard — Google-Calendar-style weekly view.
 *
 * Mode 1 (Owner/Manager): Shows mock data (will integrate with org-wide
 *   Calendly later).
 * Mode 2 (Closer):  Reads live data from `calendly_events` table and
 *   offers a settings dialog to configure their personal Calendly API key.
 *
 * Pass `mode="live"` to enable Calendly integration.
 */

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  ExternalLink,
  Settings2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  format,
  isToday,
  getDay,
  getHours,
  getMinutes,
  differenceInMinutes,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { useCalendlyEvents } from "@/hooks/use-leads";
import { useCloserRegion, useSyncCalendlyEvents } from "@/hooks/use-closer-region";
import { CalendlySettingsDialog } from "@/components/dashboards/closer/CalendlySettingsDialog";
import { toast } from "sonner";
import type { CalendlyEvent } from "@/integrations/supabase/db-types";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/hooks/use-team";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ScheduleEvent {
  id: string;
  title: string;
  type: "discovery" | "follow_up" | "closing" | "internal";
  startHour: number; // 0-23
  startMinute: number;
  durationMinutes: number;
  dayOffset: number; // 0 = Monday, 6 = Sunday
  rep: string;
  attendee?: string;
  date: Date;
  sales_user_id?: string | null;
}

interface ScheduleDashboardProps {
  /** "mock" (default) uses hardcoded events, "live" fetches from calendly_events. */
  mode?: "mock" | "live";
}

const EVENT_COLORS: Record<ScheduleEvent["type"], { bg: string; border: string; text: string }> = {
  discovery: {
    bg: "rgba(59,130,246,0.12)",
    border: "rgb(59,130,246)",
    text: "rgb(59,130,246)",
  },
  follow_up: {
    bg: "rgba(245,158,11,0.12)",
    border: "rgb(245,158,11)",
    text: "rgb(245,158,11)",
  },
  closing: {
    bg: "rgba(16,185,129,0.12)",
    border: "rgb(16,185,129)",
    text: "rgb(16,185,129)",
  },
  internal: {
    bg: "rgba(139,92,246,0.12)",
    border: "rgb(139,92,246)",
    text: "rgb(139,92,246)",
  },
};

const TYPE_LABELS: Record<ScheduleEvent["type"], string> = {
  discovery: "Discovery Call",
  follow_up: "Follow-up",
  closing: "Closing Call",
  internal: "Internal",
};

const MEMBER_COLORS = [
  { name: "blue", border: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.12)", text: "rgb(59, 130, 246)" },
  { name: "purple", border: "rgb(168, 85, 247)", bg: "rgba(168, 85, 247, 0.12)", text: "rgb(168, 85, 247)" },
  { name: "emerald", border: "rgb(16, 185, 129)", bg: "rgba(16, 185, 129, 0.12)", text: "rgb(16, 185, 129)" },
  { name: "amber", border: "rgb(245, 158, 11)", bg: "rgba(245, 158, 11, 0.12)", text: "rgb(245, 158, 11)" },
  { name: "pink", border: "rgb(236, 72, 153)", bg: "rgba(236, 72, 153, 0.12)", text: "rgb(236, 72, 153)" },
  { name: "indigo", border: "rgb(99, 102, 241)", bg: "rgba(99, 102, 241, 0.12)", text: "rgb(99, 102, 241)" },
  { name: "orange", border: "rgb(249, 115, 22)", bg: "rgba(249, 115, 22, 0.12)", text: "rgb(249, 115, 22)" },
  { name: "teal", border: "rgb(20, 184, 166)", bg: "rgba(20, 184, 166, 0.12)", text: "rgb(20, 184, 166)" },
];

/* ------------------------------------------------------------------ */
/* Mock data — used for Owner/Manager mode                             */
/* ------------------------------------------------------------------ */

const MOCK_EVENTS: ScheduleEvent[] = [
  {
    id: "1",
    title: "Discovery – ACME Corp",
    type: "discovery",
    startHour: 9,
    startMinute: 0,
    durationMinutes: 30,
    dayOffset: 0,
    rep: "Mohammed",
    attendee: "John Smith",
    date: new Date(),
  },
  {
    id: "2",
    title: "Follow-up – TechStart",
    type: "follow_up",
    startHour: 11,
    startMinute: 0,
    durationMinutes: 45,
    dayOffset: 0,
    rep: "Mohammed",
    attendee: "Sarah Lee",
    date: new Date(),
  },
  {
    id: "3",
    title: "Closing Call – MediaPro",
    type: "closing",
    startHour: 14,
    startMinute: 30,
    durationMinutes: 30,
    dayOffset: 1,
    rep: "Mohammed",
    attendee: "Alex Chen",
    date: new Date(),
  },
  {
    id: "4",
    title: "Team Sync",
    type: "internal",
    startHour: 10,
    startMinute: 0,
    durationMinutes: 60,
    dayOffset: 2,
    rep: "Mohammed",
    date: new Date(),
  },
  {
    id: "5",
    title: "Discovery – FreshBrand",
    type: "discovery",
    startHour: 15,
    startMinute: 0,
    durationMinutes: 30,
    dayOffset: 3,
    rep: "Youssef",
    attendee: "Mark Jones",
    date: new Date(),
  },
  {
    id: "6",
    title: "Follow-up – DigitalCo",
    type: "follow_up",
    startHour: 9,
    startMinute: 30,
    durationMinutes: 30,
    dayOffset: 4,
    rep: "Youssef",
    attendee: "Lisa Park",
    date: new Date(),
  },
  {
    id: "7",
    title: "Discovery – GrowthHub",
    type: "discovery",
    startHour: 13,
    startMinute: 0,
    durationMinutes: 45,
    dayOffset: 1,
    rep: "Youssef",
    attendee: "Tom White",
    date: new Date(),
  },
  {
    id: "8",
    title: "Pipeline Review",
    type: "internal",
    startHour: 16,
    startMinute: 0,
    durationMinutes: 30,
    dayOffset: 4,
    rep: "Mohammed",
    date: new Date(),
  },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM → 7 PM

/* ------------------------------------------------------------------ */
/* Helpers — classify Calendly event names into types                   */
/* ------------------------------------------------------------------ */

function classifyEventType(eventTypeName: string | null): ScheduleEvent["type"] {
  const lower = (eventTypeName || "").toLowerCase();
  if (lower.includes("discovery") || lower.includes("intro")) return "discovery";
  if (lower.includes("follow") || lower.includes("check-in")) return "follow_up";
  if (lower.includes("clos") || lower.includes("proposal") || lower.includes("deal"))
    return "closing";
  return "internal";
}

function calendlyToScheduleEvent(
  event: CalendlyEvent,
  weekStart: Date,
  teamMap: Map<string, string>
): ScheduleEvent | null {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  // Get day of week (0=Sun → adjust to Mon=0)
  const jsDay = getDay(start); // 0=Sun, 1=Mon, ..., 6=Sat
  const dayOffset = jsDay === 0 ? 6 : jsDay - 1; // Mon=0, Sun=6

  // Check if this event falls within the current week view
  const weekEnd = addDays(weekStart, 7);
  if (start < weekStart || start >= weekEnd) return null;

  const repName = event.sales_user_id ? teamMap.get(event.sales_user_id) : undefined;

  return {
    id: event.id,
    title: event.event_type_name || "Calendly Event",
    type: classifyEventType(event.event_type_name),
    startHour: getHours(start),
    startMinute: getMinutes(start),
    durationMinutes: differenceInMinutes(end, start),
    dayOffset,
    rep: repName || "You",
    attendee: event.invitee_name || undefined,
    date: start,
    sales_user_id: event.sales_user_id,
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function ScheduleDashboard({ mode = "mock" }: ScheduleDashboardProps) {
  const { user, role, profile } = useAuth();
  const isLead = role === "owner" || role === "manager";

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedRep, setSelectedRep] = useState<string>("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [myCalendarsCollapsed, setMyCalendarsCollapsed] = useState(false);
  const [otherCalendarsCollapsed, setOtherCalendarsCollapsed] = useState(false);

  const isLive = mode === "live";

  // Query all regions to find who has a Calendly API key (enabled only if isLive && isLead)
  const { data: allRegions } = useQuery({
    queryKey: ["closer-regions", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closer_regions")
        .select("user_id, calendly_api_key");
      if (error) throw error;
      return data;
    },
    enabled: isLive && isLead,
  });

  const connectedUserIds = useMemo(() => {
    const set = new Set<string>();
    if (allRegions) {
      allRegions.forEach((r) => {
        if (r.calendly_api_key) {
          set.add(r.user_id);
        }
      });
    }
    return set;
  }, [allRegions]);

  // Load the team list using useTeam()
  const { data: teamMembers, isLoading: teamLoading } = useTeam();

  // Initialize selectedMemberIds with current user's ID
  useEffect(() => {
    if (user?.id && selectedMemberIds.length === 0) {
      setSelectedMemberIds([user.id]);
    }
  }, [user?.id, selectedMemberIds]);

  // Live data hooks
  const { data: calendlyEvents, isLoading: eventsLoading } = useCalendlyEvents();
  const { data: region } = useCloserRegion();
  const syncMutation = useSyncCalendlyEvents();

  const hasApiKey = !!region?.calendly_api_key;

  const teamMap = useMemo(() => {
    const map = new Map<string, string>();
    if (teamMembers) {
      teamMembers.forEach((member) => {
        if (member.id && member.full_name) {
          map.set(member.id, member.full_name);
        }
      });
    }
    return map;
  }, [teamMembers]);

  // Map user IDs to consistent distinct colors
  const memberColorMap = useMemo(() => {
    const map = new Map<string, typeof MEMBER_COLORS[0]>();
    if (teamMembers) {
      const sorted = [...teamMembers].sort((a, b) => (a.id || "").localeCompare(b.id || ""));
      sorted.forEach((m, idx) => {
        if (m.id) {
          map.set(m.id, MEMBER_COLORS[idx % MEMBER_COLORS.length]);
        }
      });
    }
    if (user?.id && !map.has(user.id)) {
      map.set(user.id, MEMBER_COLORS[0]);
    }
    return map;
  }, [teamMembers, user?.id]);

  // Convert Calendly events to schedule events (for live mode)
  const liveEvents = useMemo(() => {
    if (!isLive || !calendlyEvents) return [];
    return calendlyEvents
      .filter((e) => e.status === "active")
      .map((e) => calendlyToScheduleEvent(e, weekStart, teamMap))
      .filter((e): e is ScheduleEvent => e !== null);
  }, [isLive, calendlyEvents, weekStart, teamMap]);

  const activeEvents = isLive ? liveEvents : MOCK_EVENTS;

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const reps = useMemo(() => {
    const set = new Set(activeEvents.map((e) => e.rep));
    return Array.from(set).sort();
  }, [activeEvents]);

  // Filter events based on active selected checkbox member IDs
  const filteredEvents = useMemo(
    () =>
      isLive
        ? activeEvents.filter((e) => e.sales_user_id && selectedMemberIds.includes(e.sales_user_id))
        : selectedRep === "all"
        ? activeEvents
        : activeEvents.filter((e) => e.rep === selectedRep),
    [isLive, selectedRep, activeEvents, selectedMemberIds],
  );

  // Group events by day offset and calculate overlapping divisions (Google Calendar layout)
  const layedOutEvents = useMemo(() => {
    // Group events by dayOffset
    const days: Record<number, ScheduleEvent[]> = {};
    for (let i = 0; i < 7; i++) days[i] = [];

    filteredEvents.forEach((event) => {
      if (event.dayOffset >= 0 && event.dayOffset < 7) {
        days[event.dayOffset].push(event);
      }
    });

    const results: {
      event: ScheduleEvent;
      colIdx: number;
      colCount: number;
    }[] = [];

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const events = days[dayIdx].sort(
        (a, b) => (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute)
      );

      const columns: ScheduleEvent[][] = [];
      events.forEach((event) => {
        let placed = false;
        const eventStart = event.startHour * 60 + event.startMinute;

        for (let i = 0; i < columns.length; i++) {
          const lastInCol = columns[i][columns[i].length - 1];
          const lastStart = lastInCol.startHour * 60 + lastInCol.startMinute;
          const lastEnd = lastStart + lastInCol.durationMinutes;

          if (eventStart >= lastEnd) {
            columns[i].push(event);
            placed = true;
            break;
          }
        }

        if (!placed) {
          columns.push([event]);
        }
      });

      columns.forEach((col, colIdx) => {
        col.forEach((event) => {
          results.push({ event, colIdx, colCount: columns.length });
        });
      });
    }

    return results;
  }, [filteredEvents]);

  const goToPrevWeek = () => setWeekStart((w) => subWeeks(w, 1));
  const goToNextWeek = () => setWeekStart((w) => addWeeks(w, 1));
  const goToToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handleSync = useCallback(async () => {
    toast.info("Syncing events from Calendly...");
    try {
      const result = await syncMutation.mutateAsync();
      toast.success(`Synced ${result.synced} events.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      toast.error(msg);
    }
  }, [syncMutation]);

  // Stats
  const totalCalls = filteredEvents.length;
  const discoveryCalls = filteredEvents.filter((e) => e.type === "discovery").length;
  const followUps = filteredEvents.filter((e) => e.type === "follow_up").length;

  const isOwnCalendarSelected = selectedMemberIds.includes(user?.id || "");

  // Toggle checklist selections
  const toggleMemberId = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered team members list for sidebar
  const otherTeamMembers = useMemo(() => {
    if (!teamMembers || !user?.id) return [];
    return teamMembers.filter((m) => m.id !== user.id);
  }, [teamMembers, user?.id]);

  const filteredOtherTeamMembers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return otherTeamMembers;
    return otherTeamMembers.filter(
      (m) =>
        (m.full_name || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term)
    );
  }, [otherTeamMembers, searchTerm]);

  // Sidebar list renderer
  const renderTeamList = () => (
    <div className="flex flex-col h-full bg-background border-r border-border w-64 select-none">
      {/* Search Bar */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search team member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-raised pl-8 pr-3 py-1.5 rounded-md text-[11px] border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Category: My Calendars */}
        <div className="space-y-1">
          <button
            onClick={() => setMyCalendarsCollapsed(!myCalendarsCollapsed)}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground-disabled hover:bg-surface-raised rounded transition-colors"
          >
            <span>My Calendars</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${myCalendarsCollapsed ? "-rotate-90" : ""}`} />
          </button>
          
          {!myCalendarsCollapsed && user?.id && (
            <div className="pl-1 pt-1">
              {(() => {
                const isChecked = selectedMemberIds.includes(user.id);
                const color = memberColorMap.get(user.id) || MEMBER_COLORS[0];
                return (
                  <button
                    onClick={() => toggleMemberId(user.id)}
                    className="w-full flex items-center gap-2.5 p-1.5 rounded-md hover:bg-surface-raised/60 text-left transition-colors"
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition-all ${
                        isChecked ? "text-white" : "border-foreground-muted"
                      }`}
                      style={{
                        backgroundColor: isChecked ? color.border : "transparent",
                        borderColor: color.border,
                      }}
                    >
                      {isChecked && (
                        <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex items-center justify-between pr-1">
                      <span className="text-xs truncate font-medium text-foreground-strong">
                        {profile?.full_name || "My Calendar"}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          hasApiKey ? "bg-emerald-500" : "bg-zinc-400"
                        }`}
                        title={hasApiKey ? "Connected" : "Not connected"}
                      />
                    </div>
                  </button>
                );
              })()}
            </div>
          )}
        </div>

        {/* Category: Other Calendars */}
        <div className="space-y-1">
          <button
            onClick={() => setOtherCalendarsCollapsed(!otherCalendarsCollapsed)}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground-disabled hover:bg-surface-raised rounded transition-colors"
          >
            <span>Other Calendars</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${otherCalendarsCollapsed ? "-rotate-90" : ""}`} />
          </button>

          {!otherCalendarsCollapsed && (
            <div className="space-y-0.5 pl-1 pt-1">
              {teamLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />
                </div>
              ) : filteredOtherTeamMembers.length === 0 ? (
                <div className="text-center py-4 text-[10px] text-foreground-disabled">
                  No other members found
                </div>
              ) : (
                filteredOtherTeamMembers.map((member) => {
                  if (!member.id) return null;
                  const isChecked = selectedMemberIds.includes(member.id);
                  const isConnected = connectedUserIds.has(member.id);
                  const color = memberColorMap.get(member.id) || MEMBER_COLORS[0];

                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleMemberId(member.id)}
                      className="w-full flex items-center gap-2.5 p-1.5 rounded-md hover:bg-surface-raised/60 text-left transition-colors"
                    >
                      <div
                        className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked ? "text-white" : "border-foreground-muted"
                        }`}
                        style={{
                          backgroundColor: isChecked ? color.border : "transparent",
                          borderColor: color.border,
                        }}
                      >
                        {isChecked && (
                          <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex items-center justify-between pr-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate font-medium text-foreground-strong">
                            {member.full_name || "Unknown User"}
                          </p>
                          <p className="text-[9px] text-foreground-disabled capitalize">
                            {member.role?.replace("_", " ")}
                          </p>
                        </div>
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isConnected ? "bg-emerald-500" : "bg-zinc-400"
                          }`}
                          title={isConnected ? "Connected" : "Not connected"}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const calendarMainArea = (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* ── Header Bar ──────────────────────────────────── */}
      <div
        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle button (visible to leads only on mobile layout) */}
          {isLead && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-8 w-8 md:hidden"
            >
              <User className="h-4 w-4" />
            </Button>
          )}

          {/* Week navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevWeek}
              className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-sm font-semibold text-foreground-strong">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Rep filter (only for mock mode with multiple reps) */}
          {!isLive && reps.length > 1 && (
            <>
              <div className="flex rounded-md bg-surface-raised p-0.5">
                <button
                  onClick={() => setSelectedRep("all")}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    selectedRep === "all"
                      ? "bg-surface-card text-foreground shadow-sm"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  All Reps
                </button>
                {reps.map((rep) => (
                  <button
                    key={rep}
                    onClick={() => setSelectedRep(rep)}
                    className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      selectedRep === rep
                        ? "bg-surface-card text-foreground shadow-sm"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {rep}
                  </button>
                ))}
              </div>
              <div className="h-4 w-px" style={{ background: "var(--border)" }} />
            </>
          )}

          {/* Live mode actions: Only enabled for logged-in user's own calendar */}
          {isLive && isOwnCalendarSelected && hasApiKey && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="gap-1.5 text-xs"
              >
                {syncMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Sync
              </Button>
              <div className="h-4 w-px" style={{ background: "var(--border)" }} />
            </>
          )}

          {isLive ? (
            isOwnCalendarSelected && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <Settings2 className="h-3 w-3" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )
          ) : (
            <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Calendly</span>
            </button>
          )}
        </div>
      </div>

      {/* Own calendar not connected notice bar (Owner/Manager view) */}
      {isLive && isLead && isOwnCalendarSelected && !hasApiKey && !eventsLoading && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-500">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Your own Calendly calendar is not connected yet. Sync will be disabled for your calendar.
          </span>
          <button
            onClick={() => setSettingsOpen(true)}
            className="font-medium underline hover:text-amber-400 transition-colors cursor-pointer"
          >
            Connect Calendly
          </button>
        </div>
      )}

      {/* ── Non-Lead Block (for Closers and Content Creators) ── */}
      {!isLead && isLive && !hasApiKey && !eventsLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12">
          <div
            className="flex items-center justify-center h-16 w-16 rounded-2xl"
            style={{ background: "rgba(59,130,246,0.1)" }}
          >
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
          <h3
            className="text-lg font-semibold text-foreground-strong"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Connect Your Calendly
          </h3>
          <p className="text-sm text-foreground-muted text-center max-w-sm">
            Link your Calendly account to see your booked calls here. You'll need your Personal Access
            Token.
          </p>
          <Button onClick={() => setSettingsOpen(true)} className="gap-2">
            <Settings2 className="h-4 w-4" />
            Set Up Calendly
          </Button>
        </div>
      ) : (
        <>
          {/* ── Quick Stats ──────────────────────────────────── */}
          <div
            className="flex items-center gap-6 px-4 py-2 md:px-6"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3 w-3 text-foreground-disabled" />
              <span className="text-[11px] text-foreground-muted">
                <span className="font-medium text-foreground">{totalCalls}</span> calls this week
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-blue-500" />
              <span className="text-[11px] text-foreground-muted">
                <span className="font-medium text-foreground">{discoveryCalls}</span> discovery
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-amber-500" />
              <span className="text-[11px] text-foreground-muted">
                <span className="font-medium text-foreground">{followUps}</span> follow-ups
              </span>
            </div>
          </div>

          {/* ── Loading state ────────────────────────────────── */}
          {isLive && eventsLoading && (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />
              <span className="text-sm text-foreground-muted">Loading events...</span>
            </div>
          )}

          {/* ── Empty state (live, no events) ────────── */}
          {isLive && !eventsLoading && filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="h-8 w-8 text-foreground-disabled" />
              <p className="text-sm text-foreground-muted text-center max-w-sm">
                No events scheduled for the selected team members this week. Make sure calendars are connected.
              </p>
              {isOwnCalendarSelected && hasApiKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncMutation.isPending}
                  className="gap-1.5"
                >
                  {syncMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Sync Now
                </Button>
              )}
            </div>
          )}

          {/* ── Calendar Grid ────────────────────────────────── */}
          {(!isLive || !eventsLoading) && (
            <div className="flex-1 overflow-auto">
              <div className="min-w-[800px]">
                {/* Day headers */}
                <div
                  className="sticky top-0 z-10 grid grid-cols-[60px_repeat(7,1fr)]"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--background)",
                  }}
                >
                  <div className="px-2 py-2" /> {/* Time gutter */}
                  {weekDays.map((day, i) => {
                    const today = isToday(day);
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center py-2"
                        style={{ borderLeft: "1px solid var(--border)" }}
                      >
                        <span className="text-[10px] font-medium uppercase text-foreground-disabled">
                          {format(day, "EEE")}
                        </span>
                        <span
                          className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            today ? "bg-primary text-primary-foreground" : "text-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Time grid */}
                <div className="relative">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-[60px_repeat(7,1fr)]"
                      style={{ height: 64, borderBottom: "1px solid var(--border)" }}
                    >
                      {/* Time label */}
                      <div className="flex items-start justify-end pr-2 pt-1">
                        <span className="text-[10px] text-foreground-disabled">
                          {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </span>
                      </div>
                      {/* Day columns */}
                      {weekDays.map((_, dayIdx) => (
                        <div
                          key={dayIdx}
                          className="relative"
                          style={{ borderLeft: "1px solid var(--border)" }}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Events overlay */}
                  {layedOutEvents.map(({ event, colIdx, colCount }) => {
                    const topOffset = (event.startHour - 8) * 64 + (event.startMinute / 60) * 64;
                    const height = (event.durationMinutes / 60) * 64;

                    const memberColor = event.sales_user_id ? memberColorMap.get(event.sales_user_id) : undefined;
                    const colors = memberColor || EVENT_COLORS[event.type];

                    const dayPercent = 100 / 7;
                    const dayLeft = (event.dayOffset / 7) * 100;
                    
                    const widthPercent = dayPercent / colCount;
                    const leftPercent = dayLeft + (colIdx / colCount) * dayPercent;

                    // Don't render events outside the visible hour range
                    if (event.startHour < 8 || event.startHour >= 20) return null;

                    return (
                      <div
                        key={event.id}
                        className="absolute cursor-pointer rounded-md px-1.5 py-1 transition-all hover:shadow-md border-l-[3px]"
                        style={{
                          top: topOffset,
                          height: Math.max(height, 24),
                          left: `calc(60px + ${leftPercent}% + 2px)`,
                          width: `calc(${widthPercent}% - 6px)`,
                          backgroundColor: colors.bg,
                          borderLeftColor: colors.border,
                        }}
                      >
                        <p
                          className="truncate text-[10px] font-semibold leading-tight"
                          style={{ color: colors.text }}
                        >
                          {event.title}
                        </p>
                        {height >= 40 && (
                          <p className="mt-0.5 truncate text-[9px] text-foreground-muted">
                            {format(new Date(2024, 0, 1, event.startHour, event.startMinute), "h:mm a")} ·{" "}
                            {event.durationMinutes}min
                          </p>
                        )}
                        {height >= 55 && event.rep && (
                          <div className="mt-0.5 flex items-center gap-1">
                            <User className="h-2.5 w-2.5 text-foreground-disabled" />
                            <span className="truncate text-[9px] text-foreground-disabled">
                              {event.rep}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Legend Footer ─────────────────────────────────── */}
          <div
            className="flex items-center gap-4 px-4 py-2 md:px-6"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {(
              Object.entries(EVENT_COLORS) as [
                ScheduleEvent["type"],
                (typeof EVENT_COLORS)["discovery"],
              ][]
            ).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.border }} />
                <span className="text-[10px] text-foreground-muted">{TYPE_LABELS[type]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Settings dialog (live mode) */}
      {isLive && isOwnCalendarSelected && (
        <CalendlySettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      )}
    </div>
  );

  if (isLead) {
    return (
      <div className="flex h-full w-full overflow-hidden">
        {/* Column 1: Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:border-r border-border bg-background h-full shrink-0">
          {renderTeamList()}
        </div>
        {/* Column 2: Main Area */}
        {calendarMainArea}
        
        {/* Mobile Drawer Sheet */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 border-r border-border">
            {renderTeamList()}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 h-full w-full">
      {calendarMainArea}
    </div>
  );
}
