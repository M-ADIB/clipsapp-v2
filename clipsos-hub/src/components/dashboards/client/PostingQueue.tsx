/**
 * PostingQueue — client-only page.
 *
 * Tabs (Review | Up Next | Scheduled | Posted) live in the universal
 * TopNav header via WorkspaceContext — no in-page heading.
 */
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { Calendar } from "lucide-react";
import { useMyClientIds } from "@/hooks/use-clients";

import { useGridRows } from "@/components/grid/core/useGridRows";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { formatDate } from "@/lib/format";

// FullCalendar (core + daygrid + timegrid + interaction) is heavy and only
// needed on the Calendar tab, which is never the default. Defer its chunk
// until the user actually opens that tab.
const PostingCalendar = lazy(() =>
  import("./PostingCalendar").then((m) => ({ default: m.PostingCalendar })),
);

type Tab = "review" | "next" | "scheduled" | "posted" | "calendar";

const TABS: { key: Tab; label: string }[] = [
  { key: "review", label: "Review" },
  { key: "next", label: "Up Next" },
  { key: "scheduled", label: "Scheduled" },
  { key: "posted", label: "Posted" },
  { key: "calendar", label: "Calendar" },
];

export function PostingQueue() {
  const { tenantId } = useAuth();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [tab, setTab] = useState<Tab>("review");

  useEffect(() => {
    setHeaderConfig({
      title: "Posting Queue",
      tabs: TABS.map((t) => ({ key: t.key, label: t.label })),
      activeTab: tab,
      onTabChange: (k) => setTab(k as Tab),
    });
    return () => clearHeaderConfig();
  }, [tab, setHeaderConfig, clearHeaderConfig]);

  const { data: clientIds = [] } = useMyClientIds();

  const primaryClientId = clientIds[0];
  const scope = useMemo(() => ({ clientId: primaryClientId }), [primaryClientId]);
  const { rows, isLoading } = useGridRows(scope);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return rows.filter((r) => {
      const status = r.data.status as { slug?: string } | null;
      const slug = status?.slug ?? "";
      const postDate = (r.data.post_date as string | null) ?? null;
      switch (tab) {
        case "review":
          return slug === "in_review" || slug === "ready_for_review";
        case "next":
          return slug === "approved" && !postDate;
        case "scheduled":
          return postDate != null && postDate >= today && slug !== "posted";
        case "posted":
          return slug === "posted";
        default:
          return false;
      }
    });
  }, [rows, tab]);

  if (!tenantId) return null;

  return (
    <FullBleed className="flex flex-col h-full overflow-hidden">
      {tab === "calendar" ? (
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center px-3 py-5 text-sm text-foreground-muted">
              Loading calendar…
            </div>
          }
        >
          <PostingCalendar embedded={true} active={tab === "calendar"} />
        </Suspense>
      ) : (
        <div className="flex-1 overflow-auto px-3 py-5 md:px-5 md:py-6">
          {isLoading ? (
            <p className="text-sm text-foreground-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="mb-3 h-10 w-10 text-foreground-disabled" />
              <p className="text-sm text-foreground-muted">
                Nothing in {TABS.find((t) => t.key === tab)?.label}.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((r) => (
                <QueueCard
                  key={r.id}
                  title={(r.data.video_title as string | null) ?? "Untitled"}
                  statusLabel={
                    (r.data.status as { display_name?: string } | null)?.display_name ?? "—"
                  }
                  statusColor={(r.data.status as { color?: string } | null)?.color ?? "#888"}
                  postDate={r.data.post_date as string | null}
                  thumbnailUrl={r.data.video_thumbnail_url as string | null}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </FullBleed>
  );
}

function QueueCard({
  title,
  statusLabel,
  statusColor,
  postDate,
  thumbnailUrl,
}: {
  title: string;
  statusLabel: string;
  statusColor: string;
  postDate: string | null;
  thumbnailUrl: string | null;
}) {
  return (
    <li
      className="flex items-center gap-3 md:gap-4 rounded-lg border bg-surface-card px-2.5 py-2 md:px-3 md:py-2.5 transition-colors hover:bg-foreground/[0.04]"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="h-12 w-12 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-md bg-foreground/[0.08]"
        style={{
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground-strong">{title}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: statusColor }}
          />
          <span>{statusLabel}</span>
        </div>
      </div>
      {postDate ? (
        <span
          className="hidden sm:inline-block rounded-full border px-3 py-1 text-[11px] text-foreground-muted"
          style={{ borderColor: "var(--border)" }}
        >
          {formatDate(postDate)}
        </span>
      ) : null}
    </li>
  );
}
