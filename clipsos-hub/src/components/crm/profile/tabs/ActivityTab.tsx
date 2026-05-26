/**
 * ActivityTab — Unified timeline of all person touchpoints.
 * Combines deals, calls, follow-ups, form subs, leads into a single feed.
 */

import { Activity, Calendar, DollarSign, FileText, Phone, Target, UserPlus } from "lucide-react";
import { timeAgo, formatDateTime } from "../utils";

interface ActivityEvent {
  id: string;
  type: "deal" | "call" | "follow_up" | "form_sub" | "lead" | "created";
  title: string;
  description?: string;
  timestamp: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActivityTabProps {
  personName: string | null;
  createdAt: string | null;
  deals: Array<Record<string, any>>;
  calls: Array<Record<string, any>>;
  followUps: Array<Record<string, any>>;
  formSubs: Array<Record<string, any>>;
  leads: Array<Record<string, any>>;
}

const iconMap: Record<ActivityEvent["type"], React.ReactNode> = {
  deal: <DollarSign className="h-3.5 w-3.5" />,
  call: <Phone className="h-3.5 w-3.5" />,
  follow_up: <Calendar className="h-3.5 w-3.5" />,
  form_sub: <FileText className="h-3.5 w-3.5" />,
  lead: <UserPlus className="h-3.5 w-3.5" />,
  created: <Target className="h-3.5 w-3.5" />,
};

const colorMap: Record<ActivityEvent["type"], string> = {
  deal: "bg-blue-500/15 text-blue-400",
  call: "bg-emerald-500/15 text-emerald-400",
  follow_up: "bg-amber-500/15 text-amber-400",
  form_sub: "bg-purple-500/15 text-purple-400",
  lead: "bg-pink-500/15 text-pink-400",
  created: "bg-primary/15 text-primary",
};

export function ActivityTab({
  personName,
  createdAt,
  deals,
  calls,
  followUps,
  formSubs,
  leads,
}: ActivityTabProps) {
  // Build unified timeline
  const events: ActivityEvent[] = [];

  deals.forEach((d) =>
    events.push({
      id: `deal-${d.id}`,
      type: "deal",
      title: `Deal "${d.name || "Untitled"}" created`,
      description: d.stage ? `Stage: ${d.stage}` : undefined,
      timestamp: d.created_at,
    }),
  );

  calls.forEach((c) =>
    events.push({
      id: `call-${c.id}`,
      type: "call",
      title: c.event_type_name || "Calendar event",
      description: c.status ? `Status: ${c.status}` : undefined,
      timestamp: c.start_time,
    }),
  );

  followUps.forEach((f) =>
    events.push({
      id: `fu-${f.id}`,
      type: "follow_up",
      title: f.title || "Follow-up created",
      description: f.status ? `Status: ${f.status}` : undefined,
      timestamp: f.created_at,
    }),
  );

  formSubs.forEach((f) =>
    events.push({
      id: `form-${f.id}`,
      type: "form_sub",
      title: `Form submitted: ${f.form?.title || "Unknown form"}`,
      timestamp: f.created_at,
    }),
  );

  leads.forEach((l) =>
    events.push({
      id: `lead-${l.id}`,
      type: "lead",
      title: "Lead record created",
      description: l.status ? `Status: ${l.status}` : undefined,
      timestamp: l.created_at,
    }),
  );

  if (createdAt) {
    events.push({
      id: "created",
      type: "created",
      title: `${personName || "Person"} was created`,
      timestamp: createdAt,
    });
  }

  // Sort descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Group by year/week
  const grouped: Record<string, ActivityEvent[]> = {};
  events.forEach((e) => {
    const date = new Date(e.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    let group: string;
    if (diffDays < 7) group = "This week";
    else if (diffDays < 30) group = "This month";
    else group = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(e);
  });

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Activity className="h-10 w-10 text-foreground-disabled" />
        <p className="text-sm text-foreground-muted">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground-strong">Activity</h3>
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <div className="mb-3 inline-block rounded-md bg-surface-raised px-2.5 py-1 text-[10px] font-medium text-foreground-muted">
            {group}
          </div>
          <div className="space-y-0">
            {items.map((event, idx) => (
              <div key={event.id} className="flex items-start gap-3 py-2.5">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${colorMap[event.type]}`}
                  >
                    {iconMap[event.type]}
                  </div>
                  {idx < items.length - 1 && (
                    <div className="mt-1 h-full w-px flex-1 bg-border" style={{ minHeight: 16 }} />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs text-foreground">{event.title}</p>
                  {event.description && (
                    <p className="mt-0.5 text-[10px] text-foreground-disabled">
                      {event.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 pt-0.5 text-[10px] text-foreground-disabled">
                  {timeAgo(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
