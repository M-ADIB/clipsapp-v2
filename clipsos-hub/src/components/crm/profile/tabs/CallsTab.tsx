/**
 * CallsTab — Calendly events linked to this person.
 */

import { Phone, Video, ExternalLink } from "lucide-react";
import { formatDateTime, statusColor } from "../utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CallsTabProps {
  calls: Array<Record<string, any>>;
}

export function CallsTab({ calls }: CallsTabProps) {
  if (!calls || calls.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised">
          <Video className="h-8 w-8 text-foreground-disabled" />
        </div>
        <p className="text-sm font-medium text-foreground-muted">No calls</p>
        <p className="text-xs text-foreground-disabled">
          Calendly events linked to this person will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
        Calls & Events ({calls.length})
      </h3>
      {calls.map((call) => {
        const duration = call.end_time
          ? Math.round(
              (new Date(call.end_time).getTime() - new Date(call.start_time).getTime()) / 60000,
            )
          : null;

        return (
          <div
            key={call.id}
            className="rounded-lg border border-border bg-surface-card p-3.5 transition-colors hover:bg-surface-raised/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Phone className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {call.event_type_name || "Calendar event"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-foreground-disabled">
                      {formatDateTime(call.start_time)}
                    </span>
                    {duration && (
                      <span className="text-[10px] text-foreground-muted">· {duration} min</span>
                    )}
                    {call.invitee_email && (
                      <span className="text-[10px] text-foreground-disabled">
                        {call.invitee_email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {call.status && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColor(call.status)}`}
                  >
                    {call.status}
                  </span>
                )}
                {call.reschedule_url && (
                  <a
                    href={call.reschedule_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground-disabled transition-colors hover:text-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
