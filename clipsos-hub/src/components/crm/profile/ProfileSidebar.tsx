/**
 * ProfileSidebar — RIGHT column detail panel (always visible).
 *
 * Mirrors Attio's left sidebar but positioned on the right:
 * - Avatar + name + quick actions
 * - Record Details (email, phone, company, location, socials)
 * - Metadata (source, dates, IDs)
 * - Client Workspace link if applicable
 */

import {
  Building2,
  Calendar,
  Check,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Tag,
  X,
  ArrowRight,
} from "lucide-react";
import { getInitials, formatDate, formatDateTime, sourceBadgeColor } from "./utils";

/* ── Info Row ── */
function InfoRow({
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
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-foreground-disabled">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-foreground-disabled">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {value} <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-xs text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

/* ── Types ── */
interface ProfileSidebarProps {
  person: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    company_id: string | null;
    city: string | null;
    country: string | null;
    location: string | null;
    instagram: string | null;
    facebook: string | null;
    social_link: string | null;
    job_title: string | null;
    source: string | null;
    active: boolean | null;
    created_at: string | null;
    updated_at: string | null;
    first_calendar_at: string | null;
    last_calendar_at: string | null;
    attio_record_id: string | null;
    deal_stage: string | null;
    client_status: string | null;
  };
  linkedClient: { id: string; name: string; slug: string } | null | undefined;
  onNavigateToClient?: (slug: string) => void;
}

export function ProfileSidebar({ person, linkedClient, onNavigateToClient }: ProfileSidebarProps) {
  const location = [person.city, person.country].filter(Boolean).join(", ") || person.location;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* ── Avatar + Name ── */}
      <div className="flex flex-col items-center gap-2 border-b border-border px-4 py-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
          {getInitials(person.full_name)}
        </div>
        <div className="text-center">
          <h2 className="text-sm font-semibold text-foreground-strong">{person.full_name}</h2>
          {person.job_title && (
            <p className="mt-0.5 text-[11px] text-foreground-muted">{person.job_title}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${sourceBadgeColor(person.source)}`}
          >
            {person.source ?? "Unknown"}
          </span>
          {person.active !== false ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <Check className="h-3 w-3" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
              <X className="h-3 w-3" /> Inactive
            </span>
          )}
        </div>
      </div>

      {/* ── Client Workspace Link ── */}
      {linkedClient && onNavigateToClient && (
        <div className="border-b border-border px-4 py-3">
          <button
            onClick={() => onNavigateToClient(linkedClient.slug)}
            className="flex w-full items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs font-medium text-primary transition-all hover:bg-primary/10"
          >
            <span>View Client Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Record Details ── */}
      <div className="flex-1 space-y-0 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-foreground-disabled">
          Record Details
        </p>

        <InfoRow
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Email"
          value={person.email}
          href={person.email ? `mailto:${person.email}` : undefined}
        />
        <InfoRow
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Phone"
          value={person.phone}
          href={person.phone ? `tel:${person.phone}` : undefined}
        />
        <InfoRow
          icon={<Building2 className="h-3.5 w-3.5" />}
          label="Company"
          value={person.company_name}
        />
        <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={location} />

        <div className="!my-2.5 h-px bg-border" />

        <InfoRow
          icon={<Instagram className="h-3.5 w-3.5" />}
          label="Instagram"
          value={person.instagram}
          href={
            person.instagram?.startsWith("http")
              ? person.instagram
              : person.instagram
                ? `https://instagram.com/${person.instagram.replace("@", "")}`
                : undefined
          }
        />
        <InfoRow
          icon={<Facebook className="h-3.5 w-3.5" />}
          label="Facebook"
          value={person.facebook}
          href={person.facebook?.startsWith("http") ? person.facebook : undefined}
        />
        <InfoRow
          icon={<Globe className="h-3.5 w-3.5" />}
          label="Social Link"
          value={person.social_link}
          href={person.social_link?.startsWith("http") ? person.social_link : undefined}
        />

        <div className="!my-2.5 h-px bg-border" />

        <InfoRow
          icon={<Tag className="h-3.5 w-3.5" />}
          label="Deal Stage"
          value={person.deal_stage}
        />
        <InfoRow
          icon={<Tag className="h-3.5 w-3.5" />}
          label="Client Status"
          value={person.client_status}
        />

        <div className="!my-2.5 h-px bg-border" />

        <InfoRow
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Added"
          value={formatDate(person.created_at)}
        />
        <InfoRow
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Last Updated"
          value={formatDate(person.updated_at)}
        />
        <InfoRow
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="First Calendar"
          value={formatDateTime(person.first_calendar_at)}
        />
        <InfoRow
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Last Calendar"
          value={formatDateTime(person.last_calendar_at)}
        />

        {person.attio_record_id && (
          <InfoRow
            icon={<Tag className="h-3.5 w-3.5" />}
            label="Attio ID"
            value={person.attio_record_id}
          />
        )}
      </div>
    </div>
  );
}
