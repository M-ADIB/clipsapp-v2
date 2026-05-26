/**
 * ModeratorDashboard — Posting Queue Dashboard.
 *
 * The moderator's primary workspace: a unified view of videos
 * they need to post on social media for clients.
 *
 * Layout:
 *   ┌─ 3 × StatCards (Ready to Post, Scheduled, Posted This Week) ──┐
 *   ├─ Status Filter Pills (All, Ready, Scheduled, Posted) ─────────┤
 *   ├─ Posting Queue DataTable ─────────────────────────────────────┤
 *   │  Columns: Video, Client, Post Date, Caption, Freebie,        │
 *   │           ManyChat Keyword, Status, Actions                   │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Data source: `videos` via `useVideos()`.
 * Moderator cares about: approved, scheduled, posted statuses.
 * Key fields: caption, freebie_word, freebie_content, text_hook, post_date.
 *
 * TOP-LEVEL route component for `/moderator` — owns setHeaderConfig().
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Search,
  Copy,
  ExternalLink,
  Download,
  FileText,
  Loader2,
  Send,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format, isThisWeek, isFuture, startOfToday } from "date-fns";

import { FullBleed } from "@/components/app-shell/FullBleed";

import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useVideos, useUpdateVideo, useStatuses } from "@/hooks/data";
import { StatCard, StatusBadge, DataTable, type DataTableColumn } from "@/components/dashboard";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type PostingFilter = "all" | "ready" | "scheduled" | "posted";

/** Status slugs the moderator cares about */
const RELEVANT_SLUGS = new Set(["approved", "scheduled", "posted"]);

function statusToFilter(slug: string | undefined): PostingFilter {
  if (slug === "approved") return "ready";
  if (slug === "scheduled") return "scheduled";
  if (slug === "posted") return "posted";
  return "all";
}

type StatusVariant = "approved" | "pending" | "posted" | "in_review" | "draft";
function slugToVariant(slug: string | undefined): StatusVariant {
  if (slug === "approved") return "approved";
  if (slug === "scheduled") return "pending";
  if (slug === "posted") return "posted";
  return "draft";
}

/* ------------------------------------------------------------------ */
/* Filter pills config                                                 */
/* ------------------------------------------------------------------ */

interface FilterDef {
  key: PostingFilter;
  label: string;
  icon: LucideIcon;
}

const FILTER_PILLS: FilterDef[] = [
  { key: "all", label: "All", icon: Eye },
  { key: "ready", label: "Ready to Post", icon: CheckCircle2 },
  { key: "scheduled", label: "Scheduled", icon: CalendarCheck },
  { key: "posted", label: "Posted", icon: Send },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function ModeratorDashboard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<PostingFilter>("all");

  // ── Header config (TOP-LEVEL route) ──────────────────────────────
  useEffect(() => {
    setHeaderConfig({ title: "Posting Queue" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  // ── Data hooks ───────────────────────────────────────────────────
  const { data: allVideos, isLoading } = useVideos();
  const { data: statuses } = useStatuses();
  const updateVideo = useUpdateVideo();

  // ── Filter to only relevant videos (approved / scheduled / posted) ──
  const relevantVideos = useMemo(() => {
    if (!allVideos) return [];
    return allVideos.filter((v) => {
      const slug = (v.status as { slug?: string } | null)?.slug;
      return slug && RELEVANT_SLUGS.has(slug);
    });
  }, [allVideos]);

  // ── Computed stats ───────────────────────────────────────────────
  const stats = useMemo(() => {
    const readyCount = relevantVideos.filter(
      (v) => (v.status as { slug?: string } | null)?.slug === "approved",
    ).length;
    const scheduledCount = relevantVideos.filter(
      (v) => (v.status as { slug?: string } | null)?.slug === "scheduled",
    ).length;
    const postedThisWeek = relevantVideos.filter((v) => {
      const slug = (v.status as { slug?: string } | null)?.slug;
      return slug === "posted" && v.post_date && isThisWeek(new Date(v.post_date));
    }).length;
    return { readyCount, scheduledCount, postedThisWeek };
  }, [relevantVideos]);

  // ── Filtered + searched videos ──────────────────────────────────
  const filteredVideos = useMemo(() => {
    let result = relevantVideos;

    // Status filter
    if (activeFilter !== "all") {
      result = result.filter((v) => {
        const slug = (v.status as { slug?: string } | null)?.slug;
        return statusToFilter(slug) === activeFilter;
      });
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((v) => {
        const client = v.client as { name?: string } | null;
        return (
          v.video_title?.toLowerCase().includes(q) ||
          client?.name?.toLowerCase().includes(q) ||
          v.caption?.toLowerCase().includes(q) ||
          v.freebie_word?.toLowerCase().includes(q)
        );
      });
    }

    // Sort: ready first, then by post_date ascending
    return result.sort((a, b) => {
      const slugA = (a.status as { slug?: string } | null)?.slug ?? "";
      const slugB = (b.status as { slug?: string } | null)?.slug ?? "";
      const order: Record<string, number> = { approved: 0, scheduled: 1, posted: 2 };
      const diff = (order[slugA] ?? 3) - (order[slugB] ?? 3);
      if (diff !== 0) return diff;
      // Within same status, sort by post_date
      if (!a.post_date && !b.post_date) return 0;
      if (!a.post_date) return 1;
      if (!b.post_date) return -1;
      return new Date(a.post_date).getTime() - new Date(b.post_date).getTime();
    });
  }, [relevantVideos, activeFilter, search]);

  // ── Actions ──────────────────────────────────────────────────────
  const copyCaption = useCallback((caption: string) => {
    navigator.clipboard.writeText(caption);
    toast.success("Caption copied to clipboard");
  }, []);

  const markAsScheduled = useCallback(
    (videoId: string) => {
      const scheduledStatus = statuses?.find((s) => s.slug === "scheduled");
      if (!scheduledStatus) return;
      updateVideo.mutate(
        { id: videoId, status_id: scheduledStatus.id },
        { onSuccess: () => toast.success("Marked as Scheduled") },
      );
    },
    [statuses, updateVideo],
  );

  const markAsPosted = useCallback(
    (videoId: string) => {
      const postedStatus = statuses?.find((s) => s.slug === "posted");
      if (!postedStatus) return;
      updateVideo.mutate(
        { id: videoId, status_id: postedStatus.id },
        { onSuccess: () => toast.success("Marked as Posted") },
      );
    },
    [statuses, updateVideo],
  );

  // ── Column definitions ──────────────────────────────────────────
  const columns: DataTableColumn<(typeof filteredVideos)[number]>[] = useMemo(
    () => [
      {
        key: "video",
        header: "Video",
        width: "220px",
        render: (row) => {
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-raised">
                {row.video_thumbnail_url ? (
                  <img
                    src={row.video_thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-primary" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="line-clamp-1 text-xs font-medium text-foreground">
                  {row.video_title}
                </span>
                {row.video_playback_url && (
                  <a
                    href={row.video_playback_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                  >
                    <Download className="h-2.5 w-2.5" />
                    Download
                  </a>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "client",
        header: "Client",
        width: "140px",
        render: (row) => {
          const client = row.client as { name?: string; logo_url?: string | null } | null;
          return (
            <div className="flex items-center gap-2">
              {client?.logo_url ? (
                <img src={client.logo_url} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                  {client?.name?.charAt(0) ?? "?"}
                </div>
              )}
              <span className="text-xs text-foreground-muted">{client?.name ?? "—"}</span>
            </div>
          );
        },
      },
      {
        key: "post_date",
        header: "Post Date",
        width: "110px",
        render: (row) => {
          if (!row.post_date)
            return <span className="text-xs text-foreground-disabled">Not set</span>;
          const d = new Date(row.post_date);
          const upcoming = isFuture(d);
          return (
            <div className="flex items-center gap-1">
              {upcoming && <CalendarCheck className="h-3 w-3 text-primary" />}
              <span
                className={`text-xs font-medium ${upcoming ? "text-primary" : "text-foreground-muted"}`}
              >
                {format(d, "MMM d, yyyy")}
              </span>
            </div>
          );
        },
      },
      {
        key: "caption",
        header: "Caption",
        width: "200px",
        render: (row) => {
          if (!row.caption)
            return <span className="text-xs text-foreground-disabled italic">No caption</span>;
          return (
            <div className="group flex items-start gap-1">
              <p className="line-clamp-2 text-xs text-foreground">{row.caption}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyCaption(row.caption!);
                }}
                className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                title="Copy caption"
              >
                <Copy className="h-3 w-3 text-foreground-muted hover:text-primary" />
              </button>
            </div>
          );
        },
      },
      {
        key: "freebie",
        header: "Lead Magnet",
        width: "140px",
        render: (row) => {
          if (!row.freebie_content && !row.freebie_word)
            return <span className="text-xs text-foreground-disabled">—</span>;
          return (
            <div className="flex flex-col gap-0.5">
              {row.freebie_content && (
                <span className="line-clamp-1 text-xs text-foreground-muted">
                  {row.freebie_content.startsWith("http") ? (
                    <a
                      href={row.freebie_content}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-0.5 text-primary hover:underline"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      View Resource
                    </a>
                  ) : (
                    row.freebie_content
                  )}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "freebie_word",
        header: "ManyChat Keyword",
        width: "130px",
        render: (row) => {
          if (!row.freebie_word) return <span className="text-xs text-foreground-disabled">—</span>;
          return (
            <div className="group flex items-center gap-1">
              <code className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] font-mono text-primary">
                {row.freebie_word}
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(row.freebie_word!);
                  toast.success("Keyword copied");
                }}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                title="Copy keyword"
              >
                <Copy className="h-3 w-3 text-foreground-muted hover:text-primary" />
              </button>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        width: "110px",
        render: (row) => {
          const status = row.status as {
            display_name?: string;
            slug?: string;
            color?: string | null;
          } | null;
          return (
            <StatusBadge
              variant={slugToVariant(status?.slug)}
              label={status?.display_name ?? "Unknown"}
              dotColor={status?.color ?? undefined}
            />
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        width: "140px",
        render: (row) => {
          const slug = (row.status as { slug?: string } | null)?.slug;

          if (slug === "posted") {
            return (
              <span className="text-[10px] font-medium text-[var(--status-success)]">✓ Done</span>
            );
          }

          return (
            <div className="flex items-center gap-1.5">
              {slug === "approved" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsScheduled(row.id);
                  }}
                  disabled={updateVideo.isPending}
                  className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--status-info)_15%,transparent)] px-2 py-1 text-[10px] font-medium text-[var(--status-info)] transition-colors hover:bg-[color-mix(in_srgb,var(--status-info)_25%,transparent)] disabled:opacity-50"
                  title="Mark as Scheduled"
                >
                  <CalendarCheck className="h-3 w-3" />
                  Schedule
                </button>
              )}
              {(slug === "approved" || slug === "scheduled") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsPosted(row.id);
                  }}
                  disabled={updateVideo.isPending}
                  className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--status-success)_15%,transparent)] px-2 py-1 text-[10px] font-medium text-[var(--status-success)] transition-colors hover:bg-[color-mix(in_srgb,var(--status-success)_25%,transparent)] disabled:opacity-50"
                  title="Mark as Posted"
                >
                  <Send className="h-3 w-3" />
                  Posted
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [copyCaption, markAsScheduled, markAsPosted, updateVideo.isPending],
  );

  // ── Filter pill counts ──────────────────────────────────────────
  const filterCounts = useMemo(() => {
    const all = relevantVideos.length;
    const ready = relevantVideos.filter(
      (v) => (v.status as { slug?: string } | null)?.slug === "approved",
    ).length;
    const scheduled = relevantVideos.filter(
      (v) => (v.status as { slug?: string } | null)?.slug === "scheduled",
    ).length;
    const posted = relevantVideos.filter(
      (v) => (v.status as { slug?: string } | null)?.slug === "posted",
    ).length;
    return { all, ready, scheduled, posted };
  }, [relevantVideos]);

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <FullBleed>
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-foreground-muted">Loading posting queue…</p>
        </div>
      </FullBleed>
    );
  }

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* ── Stat Cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard title="Ready to Post" value={String(stats.readyCount)}>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--status-success)]" />
              <span className="text-[10px] text-foreground-muted">
                Approved videos awaiting posting
              </span>
            </div>
          </StatCard>
          <StatCard title="Scheduled" value={String(stats.scheduledCount)}>
            <div className="flex items-center gap-1.5 mt-1">
              <CalendarCheck className="h-3.5 w-3.5 text-[var(--status-info)]" />
              <span className="text-[10px] text-foreground-muted">Upcoming posts in calendar</span>
            </div>
          </StatCard>
          <StatCard title="Posted This Week" value={String(stats.postedThisWeek)}>
            <div className="flex items-center gap-1.5 mt-1">
              <Send className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-foreground-muted">Successfully published</span>
            </div>
          </StatCard>
        </div>

        {/* ── Queue Header ──────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-disabled" />
              <input
                type="text"
                placeholder="Search videos, clients, captions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-52 rounded-lg border border-border bg-surface-card pl-8 pr-3 text-xs text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none md:w-64"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5">
            {FILTER_PILLS.map((f) => {
              const isActive = activeFilter === f.key;
              const Icon = f.icon;
              const count =
                f.key === "all"
                  ? filterCounts.all
                  : f.key === "ready"
                    ? filterCounts.ready
                    : f.key === "scheduled"
                      ? filterCounts.scheduled
                      : filterCounts.posted;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-raised text-foreground-muted hover:bg-surface-raised/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {f.label}
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-surface-card text-foreground-disabled"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <DataTable
            columns={columns}
            data={filteredVideos}
            rowKey={(row) => row.id}
            emptyMessage={
              search.trim()
                ? "No videos match your search"
                : activeFilter === "ready"
                  ? "No videos ready to post — check back when videos are approved ✨"
                  : activeFilter === "scheduled"
                    ? "No scheduled posts yet"
                    : activeFilter === "posted"
                      ? "No posted videos yet"
                      : "No videos in the posting queue"
            }
            showOverflowFade={false}
          />
        </div>
      </div>
    </FullBleed>
  );
}
