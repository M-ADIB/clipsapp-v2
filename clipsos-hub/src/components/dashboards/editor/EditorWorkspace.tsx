/**
 * EditorWorkspace — Video editor's main task dashboard.
 *
 * Layout:
 *   ┌─ 4 × StatCards (Assigned, In Progress, Completed This Week, Overdue) ──┐
 *   ├─ Assigned Videos DataTable ─────────────────────────────────────────────┤
 *   │  Columns: Title, Client, Status, Deadline, Priority                    │
 *   │  Quick actions: Mark In Progress, Mark Ready for Review                │
 *   ├─ Upload Area ───────────────────────────────────────────────────────────┤
 *   │  Drag-and-drop upload zone for completed video files                    │
 *   └─────────────────────────────────────────────────────────────────────────┘
 *
 * Data source: `video_editors` join table → `videos` with status/client/project.
 * This component is the TOP-LEVEL route component for `/editor`.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import {
  Upload,
  FileVideo,
  Search,
  Play,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format, isThisWeek, isBefore, startOfToday } from "date-fns";

import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useStatuses } from "@/hooks/use-lookups";
import { useEditorVideos, useEditorUpdateVideoStatus } from "@/hooks/use-editor-videos";
import { StatCard, DataTable, StatusBadge, type DataTableColumn } from "@/components/dashboard";

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
  post_date: string | null;
  priority: "high" | "medium" | "low" | "normal";
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

export function EditorWorkspace() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // ── Header config (TOP-LEVEL route) ──────────────────────────────
  useEffect(() => {
    setHeaderConfig({ title: "Tasks" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  // ── Data hooks ───────────────────────────────────────────────────
  const { data: videos, isLoading: videosLoading } = useEditorVideos();
  const { data: statuses } = useStatuses();
  const updateStatus = useEditorUpdateVideoStatus();

  // ── Computed stats ───────────────────────────────────────────────
  const stats = useMemo(() => {
    const vids = (videos ?? []) as VideoRow[];
    const today = startOfToday();
    const assignedCount = vids.length;
    const inProgressCount = vids.filter(
      (v) =>
        v.status?.slug === "editing" ||
        v.status?.slug === "in_editing" ||
        v.status?.slug === "in_progress",
    ).length;
    const completedThisWeek = vids.filter(
      (v) =>
        (v.status?.slug === "approved" ||
          v.status?.slug === "posted" ||
          v.status?.slug === "published") &&
        v.post_date &&
        isThisWeek(new Date(v.post_date)),
    ).length;
    const overdueCount = vids.filter(
      (v) =>
        v.post_date &&
        isBefore(new Date(v.post_date), today) &&
        v.status?.slug !== "approved" &&
        v.status?.slug !== "posted" &&
        v.status?.slug !== "published",
    ).length;
    return { assignedCount, inProgressCount, completedThisWeek, overdueCount };
  }, [videos]);

  // ── Filtered videos ──────────────────────────────────────────────
  const filteredVideos = useMemo(() => {
    const vids = (videos ?? []) as VideoRow[];
    if (!search.trim()) return vids;
    const q = search.toLowerCase();
    return vids.filter(
      (v) =>
        v.video_title.toLowerCase().includes(q) ||
        v.client?.name.toLowerCase().includes(q) ||
        v.status?.display_name.toLowerCase().includes(q),
    );
  }, [videos, search]);

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
        key: "title",
        header: "Video Title",
        width: "280px",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-raised">
              <FileVideo className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">{row.video_title}</span>
          </div>
        ),
      },
      {
        key: "client",
        header: "Client",
        width: "160px",
        render: (row) => (
          <span className="text-xs text-foreground-muted">{row.client?.name ?? "—"}</span>
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
        width: "120px",
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
              {format(date, "MMM d")}
            </span>
          );
        },
      },
      {
        key: "priority",
        header: "Priority",
        width: "100px",
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
        width: "200px",
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
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-foreground-muted">Loading your assignments…</p>
      </div>
    );
  }

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* ── Stat Cards ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard title="Assigned Videos" value={String(stats.assignedCount)}>
            <div className="flex items-center gap-1.5 mt-1">
              <FileVideo className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-foreground-muted">Total in queue</span>
            </div>
          </StatCard>
          <StatCard title="In Progress" value={String(stats.inProgressCount)}>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="h-3.5 w-3.5 text-[var(--status-warning)]" />
              <span className="text-[10px] text-foreground-muted">Currently editing</span>
            </div>
          </StatCard>
          <StatCard title="Completed This Week" value={String(stats.completedThisWeek)}>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--status-success)]" />
              <span className="text-[10px] text-foreground-muted">Approved / Posted</span>
            </div>
          </StatCard>
          <StatCard title="Overdue" value={String(stats.overdueCount)}>
            <div className="flex items-center gap-1.5 mt-1">
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--status-danger)]" />
              <span className="text-[10px] text-foreground-muted">Past deadline</span>
            </div>
          </StatCard>
        </div>

        {/* ── Assigned Videos ───────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-foreground-strong md:text-xl">
              Assigned Videos
            </h2>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-disabled" />
              <input
                type="text"
                placeholder="Search videos…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 rounded-lg border border-border bg-surface-card pl-8 pr-3 text-xs text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none md:w-60"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredVideos}
            rowKey={(row) => row.id}
            selectable
            selectedKeys={selected}
            onSelectionChange={setSelected}
            emptyMessage={
              search.trim() ? "No videos match your search" : "No videos assigned to you yet"
            }
          />
        </div>

        {/* ── Upload Area ───────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-medium text-foreground-strong md:text-xl">
            Upload New Version
          </h2>
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors hover:border-primary/60 hover:bg-primary/[0.03]"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground-strong">
                Drag & drop your video file here
              </p>
              <p className="mt-1 text-xs text-foreground-muted">
                or click to browse — MP4, MOV up to 5GB
              </p>
            </div>
            <button className="mt-2 rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Choose File
            </button>
          </div>
        </div>
      </div>
    </FullBleed>
  );
}
