/**
 * schedule-adapters — pure transforms + the ScheduleEvent type, extracted from
 * ScheduleDashboard so the component file is UI-only.
 */
import { addDays, differenceInMinutes, getDay, getHours, getMinutes } from "date-fns";

import type { CalendlyEvent } from "@/integrations/supabase/db-types";

export interface ScheduleEvent {
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

export function classifyEventType(eventTypeName: string | null): ScheduleEvent["type"] {
  const lower = (eventTypeName || "").toLowerCase();
  if (lower.includes("discovery") || lower.includes("intro")) return "discovery";
  if (lower.includes("follow") || lower.includes("check-in")) return "follow_up";
  if (lower.includes("clos") || lower.includes("proposal") || lower.includes("deal"))
    return "closing";
  return "internal";
}

export function calendlyToScheduleEvent(
  event: CalendlyEvent,
  weekStart: Date,
  teamMap: Map<string, string>,
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
