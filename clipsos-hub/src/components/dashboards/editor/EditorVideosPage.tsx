/**
 * EditorVideosPage — Standalone videos page for the editor role.
 *
 * Shows a full-width DataTable of ONLY videos assigned to this editor
 * via the `video_editors` join table. Supports:
 *  - Search (by title, client, status)
 *  - Status filter dropdown
 *  - Inline status change (Start / Send to Review)
 *  - Upload zone for completed files
 *
 * Route: /editor/videos
 * This is a TOP-LEVEL route component — it owns setHeaderConfig().
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, FileVideo, Play, Eye, Filter, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { format, isBefore, startOfToday } from "date-fns";

import { FullBleed } from "@/components/app-shell/FullBleed";

import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useStatuses } from "@/hooks/use-lookups";
import { useEditorVideos, useEditorUpdateVideoStatus } from "@/hooks/use-editor-videos";
import { DataTable, StatusBadge, type DataTableColumn } from "@/components/dashboard";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type StatusVariant = "in_review" | "approved" | "posted" | "pending" | "draft";

interface VideoRow {
  id: string;
  video_title: string;
  client: { id: string; name: string; logo_url: string | null } | null;
  status: { id: string; display_name: string; slug: string; color: string | null } | null;
  project: { id: string; project_name: string } | null;
  cycle: { id: string; name: string; cycle_number: number } | null;
  post_date: string | null;
  priority: "high" | "medium" | "low" | "normal";
  video_thumbnail_url: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Status Helpers                                                      */
/* ------------------------------------------------------------------ */

const SLUG_TO_VARIANT: Record<string, StatusVariant> = {
  editing: "pending",
  in_editing: "pending",
  in_progress: "pending",
  in_review: "in_review",
  ready_for_review: "in_review",
  revision: "draft",
  revision_requested: "draft",
  approved: "approved",
  posted: "posted",
  published: "posted",
  scheduled: "posted",
  draft: "draft",
  scripting: "draft",
  recording: "draft",
  pending_assets: "draft",
};

function slugToVariant(slug: string | undefined): StatusVariant {
  if (!slug) return "draft";
  return SLUG_TO_VARIANT[slug] ?? "draft";
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: {
    bg: "color-mix(in srgb, var(--status-danger) 15%, transparent)",
    text: "var(--status-danger)",
    label: "High",
  },
  medium: {
    bg: "color-mix(in srgb, var(--status-warning) 15%, transparent)",
    text: "var(--status-warning)",
    label: "Medium",
  },
  low: {
    bg: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    text: "var(--foreground-muted)",
    label: "Low",
  },
  normal: {
    bg: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    text: "var(--foreground-muted)",
    label: "Normal",
  },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function EditorVideosPage() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // ── Header config (TOP-LEVEL route) ──────────────────────────────
  useEffect(() => {
    setHeaderConfig({ title: "Videos" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  // ── Data hooks ───────────────────────────────────────────────────
  const { data: videos, isLoading: videosLoading } = useEditorVideos();
  const { data: statuses } = useStatuses();
  const updateStatus = useEditorUpdateVideoStatus();

  // ── Unique statuses in assigned videos (for filter dropdown) ─────
  const videoStatuses = useMemo(() => {
    const slugSet = new Set<string>();
    const result: { slug: string; label: string }[] = [];
    for (const v of (videos ?? []) as VideoRow[]) {
      if (v.status?.slug && !slugSet.has(v.status.slug)) {
        slugSet.add(v.status.slug);
        result.push({ slug: v.status.slug, label: v.status.display_name });
      }
    }
    return result.sort((a, b) => a.label.localeCompare(b.label));
  }, [videos]);

  // ── Filtered videos ──────────────────────────────────────────────
  const filteredVideos = useMemo(() => {
    let vids = (videos ?? []) as VideoRow[];

    if (statusFilter) {
      vids = vids.filter((v) => v.status?.slug === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      vids = vids.filter(
        (v) =>
          v.video_title.toLowerCase().includes(q) ||
          v.client?.name.toLowerCase().includes(q) ||
          v.project?.project_name.toLowerCase().includes(q) ||
          v.status?.display_name.toLowerCase().includes(q),
      );
    }
    return vids;
  }, [videos, search, statusFilter]);

  // ── Quick actions ────────────────────────────────────────────────
  const findStatusId = useCallback(
    (slug: string) => (statuses ?? []).find((s) => s.slug === slug)?.id,
    [statuses],
  );

  const handleMarkInProgress = useCallback(
    (videoId: string) => {
      const statusId =
        findStatusId("editing") ?? findStatusId("in_editing") ?? findStatusId("in_progress");
      if (!statusId) {
        toast.error("Status not found — check lookup table");
        return;
      }
      updateStatus.mutate(
        { videoId, statusId },
        {
          onSuccess: () => toast.success("Marked as In Progress"),
          onError: () => toast.error("Failed to update status"),
        },
      );
    },
    [findStatusId, updateStatus],
  );

  const handleMarkReadyForReview = useCallback(
    (videoId: string) => {
      const statusId = findStatusId("in_review") ?? findStatusId("ready_for_review");
      if (!statusId) {
        toast.error("Status not found — check lookup table");
        return;
      }
      updateStatus.mutate(
        { videoId, statusId },
        {
          onSuccess: () => toast.success("Marked as Ready for Review"),
          onError: () => toast.error("Failed to update status"),
        },
      );
    },
    [findStatusId, updateStatus],
  );

  // ── Column definitions ──────────────────────────────────────────
  const columns: DataTableColumn<VideoRow>[] = useMemo(
    () => [
      {
        key: "thumbnail",
        header: "",
        width: "48px",
        render: (row) =>
          row.video_thumbnail_url ? (
            <img src={row.video_thumbnail_url} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-surface-raised">
              <FileVideo className="h-4 w-4 text-primary" />
            </div>
          ),
      },
      {
        key: "title",
        header: "Video Title",
        width: "260px",
        render: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground">{row.video_title}</span>
            {row.project && (
              <span className="text-[10px] text-foreground-disabled">
                {row.project.project_name}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "client",
        header: "Client",
        width: "150px",
        render: (row) => (
          <div className="flex items-center gap-2">
            {row.client?.logo_url ? (
              <img src={row.client.logo_url} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                {row.client?.name?.[0] ?? "?"}
              </div>
            )}
            <span className="text-xs text-foreground-muted">{row.client?.name ?? "—"}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "140px",
        render: (row) => {
          const variant = slugToVariant(row.status?.slug);
          return (
            <StatusBadge
              variant={variant}
              label={row.status?.display_name ?? "Unknown"}
              dotColor={row.status?.color ?? undefined}
            />
          );
        },
      },
      {
        key: "deadline",
        header: "Deadline",
        width: "110px",
        render: (row) => {
          if (!row.post_date) return <span className="text-xs text-foreground-disabled">—</span>;
          const date = new Date(row.post_date);
          const isOverdue =
            isBefore(date, startOfToday()) &&
            row.status?.slug !== "approved" &&
            row.status?.slug !== "posted";
          return (
            <span
              className={`text-xs font-medium ${isOverdue ? "text-status-danger" : "text-foreground-muted"}`}
            >
              {format(date, "MMM d, yyyy")}
            </span>
          );
        },
      },
      {
        key: "priority",
        header: "Priority",
        width: "90px",
        render: (row) => {
          const p = PRIORITY_STYLES[row.priority] ?? PRIORITY_STYLES.normal;
          return (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: p.bg, color: p.text }}
            >
              {p.label}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        width: "180px",
        render: (row) => {
          const slug = row.status?.slug;
          const isEditing = slug === "editing" || slug === "in_editing" || slug === "in_progress";
          const canMarkReview = isEditing || slug === "revision" || slug === "revision_requested";

          return (
            <div className="flex items-center gap-1.5">
              {!isEditing && slug !== "approved" && slug !== "posted" && slug !== "published" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkInProgress(row.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
                  disabled={updateStatus.isPending}
                >
                  <Play className="h-3 w-3" />
                  Start
                </button>
              )}
              {canMarkReview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkReadyForReview(row.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--status-info)_15%,transparent)] px-2 py-1 text-[10px] font-medium text-[var(--status-info)] transition-colors hover:bg-[color-mix(in_srgb,var(--status-info)_25%,transparent)]"
                  disabled={updateStatus.isPending}
                >
                  <Eye className="h-3 w-3" />
                  Review
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleMarkInProgress, handleMarkReadyForReview, updateStatus.isPending],
  );

  // ── Loading state ────────────────────────────────────────────────
  if (videosLoading) {
    return (
      <FullBleed>
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-foreground-muted">Loading your videos…</p>
        </div>
      </FullBleed>
    );
  }

  return (
    <FullBleed>
      <div className="flex flex-col gap-5 px-3 py-5 md:px-5 md:py-6">
        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-disabled" />
            <input
              type="text"
              placeholder="Search videos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-48 rounded-lg border border-border bg-surface-card pl-8 pr-3 text-xs text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none md:w-64"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-foreground-disabled" />
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusFilter(null)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  !statusFilter
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-raised text-foreground-muted hover:bg-surface-raised/80"
                }`}
              >
                All ({(videos ?? []).length})
              </button>
              {videoStatuses.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => setStatusFilter(s.slug === statusFilter ? null : s.slug)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    statusFilter === s.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-raised text-foreground-muted hover:bg-surface-raised/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter(null)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-foreground-muted transition-colors hover:bg-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Videos Table ─────────────────────────────────── */}
        <DataTable
          columns={columns}
          data={filteredVideos}
          rowKey={(row) => row.id}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          emptyMessage={
            search.trim() || statusFilter
              ? "No videos match your filters"
              : "No videos assigned to you yet"
          }
        />

        {/* ── Upload Area ───────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-base font-medium text-foreground-strong">
            Upload Completed Video
          </h2>
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors hover:border-primary/60 hover:bg-primary/[0.03]"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground-strong">
                Drag & drop your video file here
              </p>
              <p className="mt-1 text-xs text-foreground-muted">MP4, MOV up to 5GB</p>
            </div>
            <button className="mt-1 rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Choose File
            </button>
          </div>
        </div>
      </div>
    </FullBleed>
  );
}
