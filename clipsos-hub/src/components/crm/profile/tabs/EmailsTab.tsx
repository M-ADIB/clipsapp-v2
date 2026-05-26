/**
 * EmailsTab — Emails sent to this person (from email_queue).
 */

import { Mail } from "lucide-react";
import { formatDateTime, statusColor } from "../utils";

interface EmailsTabProps {
  emails: Array<{
    id: string;
    subject: string | null;
    status: string | null;
    to_email: string | null;
    to_name: string | null;
    sent_at: string | null;
    created_at: string;
  }>;
}

export function EmailsTab({ emails }: EmailsTabProps) {
  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised">
          <Mail className="h-8 w-8 text-foreground-disabled" />
        </div>
        <p className="text-sm font-medium text-foreground-muted">No emails</p>
        <p className="text-xs text-foreground-disabled">
          Emails sent to this person will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
        Emails ({emails.length})
      </h3>
      {emails.map((email) => (
        <div
          key={email.id}
          className="rounded-lg border border-border bg-surface-card p-3.5 transition-colors hover:bg-surface-raised/40"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <Mail className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {email.subject || "No subject"}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] text-foreground-disabled">
                    To: {email.to_name || email.to_email}
                  </span>
                  <span className="text-[10px] text-foreground-disabled">
                    {formatDateTime(email.sent_at || email.created_at)}
                  </span>
                </div>
              </div>
            </div>
            {email.status && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColor(email.status)}`}
              >
                {email.status}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
