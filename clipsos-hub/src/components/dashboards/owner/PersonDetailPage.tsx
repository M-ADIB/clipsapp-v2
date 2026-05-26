/**
 * PersonDetailPage — Attio-style CRM contact profile
 *
 * Two-column layout:
 * - Left: Contact card (avatar, info, social links, status)
 * - Right: Tabbed content (Overview, Deals, Notes)
 *
 * PRD §3.6.1 / §4.2: /owner/crm/people/:id
 */

import { FullBleed } from "@/components/app-shell/FullBleed";
import { useEffect, useState } from "react";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useCrmPerson, useUpdateCrmPerson, usePersonDeals } from "@/hooks/data";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  DollarSign,
  Edit3,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Save,
  Tag,
  Target,
  User,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sourceBadgeColor(source: string | null): string {
  switch (source) {
    case "attio":
      return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    case "career_form":
      return "bg-purple-500/15 text-purple-400 border-purple-500/20";
    case "intake_form":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "client":
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "partnership":
      return "bg-pink-500/15 text-pink-400 border-pink-500/20";
    default:
      return "bg-surface-raised text-foreground-muted border-border";
  }
}

/* ------------------------------------------------------------------ */
/* Info Row                                                            */
/* ------------------------------------------------------------------ */

function InfoRow({
  icon,
  label,
  value,
  href,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  href?: string;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-3 py-2 ${className}`}>
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
            className="text-xs text-primary hover:underline flex items-center gap-1"
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

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface PersonDetailPageProps {
  personId: string;
}

export function PersonDetailPage({ personId }: PersonDetailPageProps) {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const navigate = useNavigate();
  const { data: person, isLoading } = useCrmPerson(personId);
  const { data: deals = [] } = usePersonDeals(personId);
  const updatePerson = useUpdateCrmPerson();

  const [activeTab, setActiveTab] = useState<"overview" | "deals" | "notes">("overview");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  useEffect(() => {
    setHeaderConfig({ title: person?.full_name ?? "Person", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, person?.full_name]);

  useEffect(() => {
    if (person?.notes) setNotesValue(person.notes);
  }, [person?.notes]);

  const handleBack = () => {
    const path = window.location.pathname;
    const rolePrefix = path.startsWith("/manager")
      ? "/manager"
      : path.startsWith("/closer")
        ? "/closer"
        : "/owner";
    navigate({ to: `${rolePrefix}/people` as string });
  };

  const handleSaveNotes = () => {
    if (!person) return;
    updatePerson.mutate(
      { id: person.id, notes: notesValue },
      {
        onSuccess: () => setIsEditingNotes(false),
      },
    );
  };

  if (isLoading) {
    return (
      <FullBleed>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-foreground-muted">Loading contact…</p>
          </div>
        </div>
      </FullBleed>
    );
  }

  if (!person) {
    return (
      <FullBleed>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <User className="h-10 w-10 text-foreground-disabled" />
            <p className="text-sm text-foreground-muted">Person not found.</p>
            <button onClick={handleBack} className="text-xs text-primary hover:underline">
              ← Back to People
            </button>
          </div>
        </div>
      </FullBleed>
    );
  }

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "deals" as const, label: `Deals (${deals.length})` },
    { key: "notes" as const, label: "Notes" },
  ];

  const location = [person.city, person.country].filter(Boolean).join(", ") || person.location;

  return (
    <FullBleed>
      {/* ── Top bar ── */}
      <div
        className="flex h-[52px] items-center gap-3 px-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={handleBack}
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            {getInitials(person.full_name)}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground-strong">{person.full_name}</h1>
            {person.job_title && (
              <p className="text-[10px] text-foreground-muted">{person.job_title}</p>
            )}
          </div>
        </div>
        <div className="flex-1" />
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${sourceBadgeColor(person.source)}`}
        >
          {person.source ?? "Unknown"}
        </span>
        {person.active !== false ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
            <Check className="h-3 w-3" /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-medium text-red-400">
            <X className="h-3 w-3" /> Inactive
          </span>
        )}
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* ── Left column: Contact Card ── */}
        <div
          className="w-full shrink-0 overflow-y-auto lg:w-[320px]"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          <div className="p-4 space-y-1">
            {/* Contact info */}
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

            {/* Divider */}
            <div className="!my-3 h-px bg-border" />

            {/* Social links */}
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

            {/* Divider */}
            <div className="!my-3 h-px bg-border" />

            {/* Metadata */}
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

        {/* ── Right column: Tabs ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab bar */}
          <div
            className="flex h-[42px] items-center gap-0 px-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex h-full items-center px-4 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-primary"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "overview" && <OverviewTab person={person} />}
            {activeTab === "deals" && <DealsTab deals={deals} />}
            {activeTab === "notes" && (
              <NotesTab
                notes={notesValue}
                description={person.description}
                isEditing={isEditingNotes}
                onEdit={() => {
                  setNotesValue(person.notes ?? "");
                  setIsEditingNotes(true);
                }}
                onChange={setNotesValue}
                onSave={handleSaveNotes}
                onCancel={() => setIsEditingNotes(false)}
                isSaving={updatePerson.isPending}
              />
            )}
          </div>
        </div>
      </div>
    </FullBleed>
  );
}

/* ------------------------------------------------------------------ */
/* Overview Tab                                                        */
/* ------------------------------------------------------------------ */

function OverviewTab({ person }: { person: NonNullable<ReturnType<typeof useCrmPerson>["data"]> }) {
  const fields = [
    { label: "Deal Stage", value: person.deal_stage, icon: <Target className="h-3.5 w-3.5" /> },
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
      {/* Key fields grid */}
      {fields.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Details
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
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

      {/* Payment link */}
      {person.payment_link && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Payment Link
          </h3>
          <a
            href={person.payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-card px-3 py-2 text-xs text-primary hover:bg-surface-raised transition-colors"
          >
            <ExternalLink className="h-3 w-3" /> {person.payment_link}
          </a>
        </div>
      )}

      {/* Description */}
      {person.description && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Description
          </h3>
          <div className="rounded-lg border border-border bg-surface-card p-3">
            <p className="text-xs text-foreground-muted whitespace-pre-wrap">
              {person.description}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {fields.length === 0 && !person.payment_link && !person.description && (
        <div className="flex flex-col items-center gap-3 py-16">
          <User className="h-10 w-10 text-foreground-disabled" />
          <p className="text-sm text-foreground-muted">No additional details available.</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Deals Tab                                                           */
/* ------------------------------------------------------------------ */

function DealsTab({ deals }: { deals: ReturnType<typeof usePersonDeals>["data"] }) {
  if (!deals || deals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <DollarSign className="h-10 w-10 text-foreground-disabled" />
        <p className="text-sm text-foreground-muted">No deals linked to this person.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
        Linked Deals
      </h3>
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="flex items-center justify-between rounded-lg border border-border bg-surface-card p-3 transition-colors hover:bg-surface-raised/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{deal.name || "Untitled Deal"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-foreground-disabled">
                  {formatDate(deal.created_at)}
                </p>
                {deal.plan && (
                  <span className="text-[10px] text-foreground-muted">· {deal.plan}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {deal.deal_owner && (
              <span className="text-[10px] text-foreground-disabled">{deal.deal_owner}</span>
            )}
            {deal.stage && (
              <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-[10px] font-medium text-foreground-muted">
                {deal.stage}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notes Tab                                                           */
/* ------------------------------------------------------------------ */

function NotesTab({
  notes,
  description,
  isEditing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: {
  notes: string;
  description: string | null;
  isEditing: boolean;
  onEdit: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Description (read-only) */}
      {description && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Description
          </h3>
          <div className="rounded-lg border border-border bg-surface-card p-4">
            <p className="text-xs text-foreground-muted whitespace-pre-wrap leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}

      {/* Editable notes */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Notes
          </h3>
          {!isEditing && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-foreground-muted transition-colors hover:bg-surface-raised"
            >
              <Edit3 className="h-3 w-3" /> Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => onChange(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-border bg-surface-card p-3 text-xs text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none resize-none"
              placeholder="Add notes about this contact…"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-3 w-3" /> {isSaving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={onCancel}
                className="rounded-md px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:bg-surface-raised"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface-card p-4 min-h-[100px]">
            {notes ? (
              <p className="text-xs text-foreground-muted whitespace-pre-wrap leading-relaxed">
                {notes}
              </p>
            ) : (
              <p className="text-xs text-foreground-disabled italic">
                No notes yet. Click edit to add notes.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
