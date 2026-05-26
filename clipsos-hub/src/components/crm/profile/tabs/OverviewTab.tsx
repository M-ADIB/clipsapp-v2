/**
 * OverviewTab — Highlights cards + recent activity preview.
 * Mirrors Attio's Overview tab: key field cards + activity feed snippet.
 */

import {
  Building2,
  Calendar,
  Check,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Target,
  Tag,
  User,
  ExternalLink,
  Activity,
} from "lucide-react";
import { formatDate, formatDateTime, timeAgo } from "../utils";

interface OverviewTabProps {
  person: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    deal_stage: string | null;
    client_status: string | null;
    income_range: string | null;
    goal: string | null;
    obstacle: string | null;
    fit: string | null;
    interested_in: string | null;
    payment_link: string | null;
    description: string | null;
    first_calendar_at: string | null;
    last_calendar_at: string | null;
    city: string | null;
    country: string | null;
    location: string | null;
    created_at: string | null;
  };
  dealsCount: number;
  callsCount: number;
  emailsCount: number;
}

/* ── Highlight Card ── */
function HighlightCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-card p-3.5 transition-colors hover:bg-surface-raised/40">
      <div className="mb-1.5 flex items-center gap-1.5 text-foreground-disabled">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {value} <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <p className="text-xs font-medium text-foreground">{value || "—"}</p>
      )}
    </div>
  );
}

export function OverviewTab({ person, dealsCount, callsCount, emailsCount }: OverviewTabProps) {
  const location = [person.city, person.country].filter(Boolean).join(", ") || person.location;

  // Build highlights grid
  const highlights = [
    {
      icon: <Mail className="h-3.5 w-3.5" />,
      label: "Email addresses",
      value: person.email,
      href: person.email ? `mailto:${person.email}` : undefined,
    },
    {
      icon: <Phone className="h-3.5 w-3.5" />,
      label: "Phone numbers",
      value: person.phone || "No phone numbers",
    },
    {
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: "Primary location",
      value: location || "No primary location",
    },
    {
      icon: <Building2 className="h-3.5 w-3.5" />,
      label: "Company",
      value: person.company_name || "No company",
    },
    {
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: "Next calendar interaction",
      value: person.last_calendar_at ? formatDateTime(person.last_calendar_at) : "No interaction",
    },
    {
      icon: <Target className="h-3.5 w-3.5" />,
      label: "Deal stage",
      value: person.deal_stage || "No deal stage",
    },
  ];

  // Detail fields
  const detailFields = [
    { label: "Client Status", value: person.client_status, icon: <Tag className="h-3.5 w-3.5" /> },
    {
      label: "Income Range",
      value: person.income_range,
      icon: <DollarSign className="h-3.5 w-3.5" />,
    },
    { label: "Goal", value: person.goal, icon: <Target className="h-3.5 w-3.5" /> },
    { label: "Obstacle", value: person.obstacle, icon: <Tag className="h-3.5 w-3.5" /> },
    { label: "Fit", value: person.fit, icon: <Check className="h-3.5 w-3.5" /> },
    { label: "Interested In", value: person.interested_in, icon: <Tag className="h-3.5 w-3.5" /> },
  ].filter((f) => f.value);

  return (
    <div className="space-y-6">
      {/* ── Highlights Grid ── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-foreground-disabled" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Highlights
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h) => (
            <HighlightCard key={h.label} {...h} />
          ))}
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="flex gap-3">
        {[
          { label: "Deals", count: dealsCount },
          { label: "Calls", count: callsCount },
          { label: "Emails", count: emailsCount },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-1 items-center justify-between rounded-lg border border-border bg-surface-card px-4 py-3"
          >
            <span className="text-xs text-foreground-muted">{s.label}</span>
            <span className="text-sm font-semibold text-foreground-strong">{s.count}</span>
          </div>
        ))}
      </div>

      {/* ── Detail Fields ── */}
      {detailFields.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Details
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {detailFields.map((f) => (
              <div key={f.label} className="rounded-lg border border-border bg-surface-card p-3">
                <div className="mb-1 flex items-center gap-1.5 text-foreground-disabled">
                  {f.icon}
                  <span className="text-[10px] uppercase tracking-wider">{f.label}</span>
                </div>
                <p className="text-xs text-foreground">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Payment Link ── */}
      {person.payment_link && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Payment Link
          </h3>
          <a
            href={person.payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-card px-3 py-2 text-xs text-primary transition-colors hover:bg-surface-raised"
          >
            <ExternalLink className="h-3 w-3" /> {person.payment_link}
          </a>
        </div>
      )}

      {/* ── Description ── */}
      {person.description && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Description
          </h3>
          <div className="rounded-lg border border-border bg-surface-card p-3">
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground-muted">
              {person.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Activity Preview ── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-foreground-disabled" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Activity
          </h3>
        </div>
        <div className="rounded-lg border border-border bg-surface-card p-4">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>
              <span className="font-medium text-foreground">{person.full_name}</span> was created
            </span>
            <span className="ml-auto text-[10px] text-foreground-disabled">
              {person.created_at ? timeAgo(person.created_at) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Empty State ── */}
      {detailFields.length === 0 && !person.payment_link && !person.description && (
        <div className="flex flex-col items-center gap-3 py-12">
          <User className="h-10 w-10 text-foreground-disabled" />
          <p className="text-sm text-foreground-muted">No additional details available.</p>
        </div>
      )}
    </div>
  );
}
