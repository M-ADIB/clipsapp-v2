/**
 * CompanyTab — Shows linked crm_company details.
 */

import { Building2, Globe, MapPin, Phone, Tag, Calendar, ExternalLink } from "lucide-react";
import { formatDate } from "../utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CompanyTabProps {
  company: Record<string, any> | null | undefined;
  isLoading: boolean;
  companyName: string | null;
}

export function CompanyTab({ company, isLoading, companyName }: CompanyTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised">
          <Building2 className="h-8 w-8 text-foreground-disabled" />
        </div>
        <p className="text-sm font-medium text-foreground-muted">No company linked</p>
        <p className="text-xs text-foreground-disabled">
          {companyName
            ? `"${companyName}" is set as text but not linked to a CRM company record.`
            : "No company information available for this person."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Company Header ── */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-card p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
          {company.name?.charAt(0)?.toUpperCase() || "C"}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground-strong">{company.name}</h3>
          {company.domain && (
            <a
              href={
                company.domain.startsWith("http") ? company.domain : `https://${company.domain}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {company.domain} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* ── Details Grid ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {company.team_country && (
          <DetailCard
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Country"
            value={company.team_country}
          />
        )}
        {company.team_phone && (
          <DetailCard
            icon={<Phone className="h-3.5 w-3.5" />}
            label="Phone"
            value={company.team_phone}
          />
        )}
        {company.domain && (
          <DetailCard
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Domain"
            value={company.domain}
          />
        )}
        {company.last_interaction_at && (
          <DetailCard
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Last Interaction"
            value={formatDate(company.last_interaction_at)}
          />
        )}
        {company.created_at && (
          <DetailCard
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Created"
            value={formatDate(company.created_at)}
          />
        )}
      </div>

      {/* ── Categories ── */}
      {company.categories && company.categories.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {company.categories.map((cat: string) => (
              <span
                key={cat}
                className="rounded-full border border-border bg-surface-raised px-2.5 py-0.5 text-[10px] font-medium text-foreground-muted"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Description ── */}
      {company.description && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Description
          </h4>
          <div className="rounded-lg border border-border bg-surface-card p-3">
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground-muted">
              {company.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Social Links ── */}
      {company.social_links && Object.keys(company.social_links).length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Social Links
          </h4>
          <div className="space-y-1.5">
            {Object.entries(company.social_links).map(([key, url]) => (
              <a
                key={key}
                href={String(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <Globe className="h-3 w-3" />
                {key}: {String(url)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-foreground-disabled">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-foreground">{value}</p>
    </div>
  );
}
