/**
 * BrainTab — Client knowledge base.
 */
import { useClientBrain } from "@/hooks/use-studio";
import { Brain, User, Users, Target, Loader2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/db-types";

interface BrainTabProps {
  clientId: string | undefined;
}

interface FoundationData {
  name?: string;
  profession?: string;
  bio?: string;
  three_words?: string[];
  achievements?: string[];
  unique_angle?: string;
  [key: string]: unknown;
}

interface AudienceAvatar {
  name?: string;
  emoji?: string;
  age_range?: string;
  description?: string;
  fears?: string[];
  desires?: string[];
}

interface PillarData {
  name?: string;
  percentage?: number;
  description?: string;
}

interface BioData {
  platform?: string;
  bio?: string;
}

function parseJson<T>(raw: Json | null | undefined): T | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as T;
}

function parseJsonArray<T>(raw: Json | null | undefined): T[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw as T[];
}

export function BrainTab({ clientId }: BrainTabProps) {
  const { data: brain, isLoading } = useClientBrain(clientId);

  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card border border-border mb-4">
          <Brain className="h-7 w-7 text-foreground-muted" />
        </div>
        <p className="text-foreground-muted text-sm">Select a client to view their brain</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
      </div>
    );
  }

  if (!brain) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card border border-border mb-4">
          <Brain className="h-7 w-7 text-foreground-muted" />
        </div>
        <h3 className="text-sm font-medium text-foreground-strong mb-1">No brain data yet</h3>
        <p className="text-xs text-foreground-muted max-w-[280px]">
          Complete the client onboarding to populate the foundation, audience avatars, and content
          pillars
        </p>
      </div>
    );
  }

  const foundation = parseJson<FoundationData>(brain.foundation);
  const avatars = parseJsonArray<AudienceAvatar>(brain.audience_avatars);
  const pillars = parseJsonArray<PillarData>(brain.pillars);
  const bios = parseJsonArray<BioData>(brain.bios);

  return (
    <div className="space-y-6">
      <FoundationSection foundation={foundation} />
      <AvatarsSection avatars={avatars} />
      <PillarsSection pillars={pillars} />
      <BiosSection bios={bios} />
    </div>
  );
}

function FoundationSection({ foundation }: { foundation: FoundationData | null }) {
  if (!foundation) return null;
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground-strong">Foundation</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {foundation.name && <Field label="Name" value={foundation.name} />}
        {foundation.profession && <Field label="Profession" value={foundation.profession} />}
        {foundation.unique_angle && (
          <Field label="Unique Angle" value={foundation.unique_angle} span />
        )}
        {foundation.bio && <Field label="Bio" value={foundation.bio} span />}
        {foundation.three_words && foundation.three_words.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-xs text-foreground-muted mb-1.5">Three Words</p>
            <div className="flex gap-2">
              {foundation.three_words.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AvatarsSection({ avatars }: { avatars: AudienceAvatar[] }) {
  if (avatars.length === 0) return null;
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
          <Users className="h-4 w-4 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-foreground-strong">Audience Avatars</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {avatars.map((avatar, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{avatar.emoji ?? "👤"}</span>
              <div>
                <p className="text-sm font-medium text-foreground-strong">
                  {avatar.name ?? `Avatar ${i + 1}`}
                </p>
                {avatar.age_range && (
                  <p className="text-xs text-foreground-muted">{avatar.age_range}</p>
                )}
              </div>
            </div>
            {avatar.description && (
              <p className="text-xs text-foreground-muted leading-relaxed mb-2">
                {avatar.description}
              </p>
            )}
            <TagList label="Fears" items={avatar.fears} color="red" />
            <TagList label="Desires" items={avatar.desires} color="emerald" />
          </div>
        ))}
      </div>
    </section>
  );
}

function PillarsSection({ pillars }: { pillars: PillarData[] }) {
  if (pillars.length === 0) return null;
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
          <Target className="h-4 w-4 text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold text-foreground-strong">Content Pillars</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground-strong">
                {pillar.name ?? `Pillar ${i + 1}`}
              </h4>
              {pillar.percentage != null && (
                <span className="text-xs font-medium text-primary">{pillar.percentage}%</span>
              )}
            </div>
            {pillar.percentage != null && (
              <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pillar.percentage}%` }}
                />
              </div>
            )}
            {pillar.description && (
              <p className="text-xs text-foreground-muted leading-relaxed">{pillar.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function BiosSection({ bios }: { bios: BioData[] }) {
  if (bios.length === 0) return null;
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5">
      <h3 className="text-sm font-semibold text-foreground-strong mb-4">Platform Bios</h3>
      <div className="space-y-3">
        {bios.map((bio, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-cyan-500/15 text-cyan-400 capitalize">
              {bio.platform ?? "General"}
            </span>
            <p className="text-sm text-foreground-muted leading-relaxed flex-1">{bio.bio ?? "—"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <p className="text-xs text-foreground-muted mb-1">{label}</p>
      <p className="text-sm text-foreground-strong leading-relaxed">{value}</p>
    </div>
  );
}

function TagList({ label, items, color }: { label: string; items?: string[]; color: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-1.5">
      <p className="text-[10px] uppercase tracking-wider text-foreground-subtle mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, j) => (
          <span
            key={j}
            className={`text-[11px] px-1.5 py-0.5 rounded bg-${color}-500/10 text-${color}-400`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
