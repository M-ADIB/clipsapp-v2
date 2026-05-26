/**
 * OverviewTab — Client workspace overview wired to live Supabase data.
 *
 * Sections:
 *  1. Production Overview (video status counts from `videos`)
 *  2. Active Projects (from `projects`)
 *  3. Their Journey (from `client_journey_steps`)
 *  4. Growth Insights (placeholder — analytics TBD)
 *  5. Notes (from `client_notes` with add-note form)
 */
import { useMemo, useState } from "react";
import {
  PipelineStepCard,
  ProjectCard,
  JourneyEventCard,
  GrowthChart,
  NoteCard,
} from "@/components/dashboard";
import {
  useVideosByClient,
  useProjectsByClient,
  useClientJourney,
  useClientNotes,
  useCreateClientNote,
} from "@/hooks/data";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Plus, StickyNote } from "lucide-react";

interface OverviewTabProps {
  clientId: string;
}

/* ────────────────────────────────────────────────────────────────────── */
/* Helpers                                                               */
/* ────────────────────────────────────────────────────────────────────── */

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ────────────────────────────────────────────────────────────────────── */
/* Component                                                             */
/* ────────────────────────────────────────────────────────────────────── */

export function OverviewTab({ clientId }: OverviewTabProps) {
  const { user } = useAuth();
  const { data: videos = [], isLoading: loadingVideos } = useVideosByClient(clientId);
  const { data: projects = [], isLoading: loadingProjects } = useProjectsByClient(clientId);
  const { data: journeySteps = [], isLoading: loadingJourney } = useClientJourney(clientId);
  const { data: notes = [], isLoading: loadingNotes } = useClientNotes(clientId);
  const createNote = useCreateClientNote();

  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);

  /* ── Production pipeline stats ──────────────────────────────────── */
  const pipelineSteps = useMemo(() => {
    const total = videos.length;
    const statusCounts: Record<string, number> = {};
    for (const v of videos) {
      const slug = (v.status as { slug?: string } | null)?.slug ?? "unknown";
      statusCounts[slug] = (statusCounts[slug] || 0) + 1;
    }
    const inProgress =
      (statusCounts["in-progress"] ?? 0) +
      (statusCounts["in_progress"] ?? 0) +
      (statusCounts["filming"] ?? 0) +
      (statusCounts["editing"] ?? 0);
    const review =
      statusCounts["review"] ?? statusCounts["in-review"] ?? statusCounts["in_review"] ?? 0;
    const scheduled = statusCounts["scheduled"] ?? statusCounts["approved"] ?? 0;
    const posted = statusCounts["posted"] ?? statusCounts["published"] ?? 0;

    return [
      { label: "Total Videos", count: total, percent: 0 },
      {
        label: "In Progress",
        count: inProgress,
        percent: total ? Math.round((inProgress / total) * 100) : 0,
      },
      { label: "Review", count: review, percent: total ? Math.round((review / total) * 100) : 0 },
      {
        label: "Scheduled",
        count: scheduled,
        percent: total ? Math.round((scheduled / total) * 100) : 0,
      },
      { label: "Posted", count: posted, percent: total ? Math.round((posted / total) * 100) : 0 },
    ];
  }, [videos]);

  /* ── Active projects ────────────────────────────────────────────── */
  const activeProjects = useMemo(
    () => projects.filter((p) => (p.status as string) === "active" || p.status === "in_progress"),
    [projects],
  );

  /* ── Submit note ────────────────────────────────────────────────── */
  const handleSubmitNote = () => {
    if (!noteTitle.trim() && !noteBody.trim()) return;
    createNote.mutate(
      {
        client_id: clientId,
        title: noteTitle.trim() || "Untitled Note",
        body: noteBody.trim(),
      },
      {
        onSuccess: () => {
          setNoteTitle("");
          setNoteBody("");
          setShowNoteForm(false);
        },
      },
    );
  };

  const isLoading = loadingVideos || loadingProjects;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ── Production Overview ─────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <h2 className="font-display text-xl font-medium tracking-tight text-foreground-strong md:text-[26px]">
            Production Overview
          </h2>
          <span className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold tracking-tight text-primary-foreground">
            {activeProjects.length} Active Project{activeProjects.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 md:gap-5">
          {pipelineSteps.map((step) => (
            <PipelineStepCard
              key={step.label}
              label={step.label}
              count={step.count}
              percent={step.percent}
            />
          ))}
        </div>
      </section>

      {/* ── Active Projects + Their Journey ─────────────────────────── */}
      <section className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-8">
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-xl font-medium tracking-tight text-foreground-strong md:text-[26px]">
            Active Projects
          </h2>

          {activeProjects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg bg-surface-card py-10">
              <span className="text-sm text-foreground-muted">No active projects</span>
            </div>
          ) : (
            activeProjects.map((project) => {
              const projectVideos = videos.filter((v) => v.project_id === project.id);
              const totalVids = projectVideos.length;
              const postedVids = projectVideos.filter((v) => {
                const slug = (v.status as { slug?: string } | null)?.slug ?? "";
                return slug === "posted" || slug === "published";
              }).length;
              const percent = totalVids > 0 ? Math.round((postedVids / totalVids) * 100) : 0;

              return (
                <ProjectCard
                  key={project.id}
                  name={project.project_name}
                  startedAt={`Started ${formatDate(project.created_at)}`}
                  team={[]}
                  extraMembers={0}
                  progressLabel="Completion"
                  progressValue={`${percent}%`}
                  percent={percent}
                />
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="font-display text-xl font-medium tracking-tight text-foreground-strong md:text-[26px]">
            Their Journey
          </h2>

          {loadingJourney ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : journeySteps.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg bg-surface-card py-10">
              <span className="text-sm text-foreground-muted">No journey steps configured</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {journeySteps.map((step) => {
                const d = step.completed_at ? new Date(step.completed_at) : null;
                const month = d ? d.toLocaleString("en-US", { month: "short" }).toUpperCase() : "—";
                const day = d ? d.getDate() : 0;
                const meta = step.metadata as Record<string, string> | null;

                return (
                  <JourneyEventCard
                    key={step.id}
                    month={month}
                    day={day}
                    title={step.step_label}
                    subtitle={meta?.description ?? step.status ?? "—"}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Growth Insights + Notes ─────────────────────────────────── */}
      <section className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-8">
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-xl font-medium tracking-tight text-foreground-strong md:text-[26px]">
            Growth Insights
          </h2>
          <GrowthChart
            totalViews="—"
            bars={[0, 0, 0, 0, 0, 0, 0]}
            platforms={[
              { label: "TikTok", value: "—" },
              { label: "Instagram", value: "—" },
              { label: "YouTube", value: "—" },
            ]}
            subtitle="Analytics integration coming soon"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-medium tracking-tight text-foreground-strong md:text-[26px]">
              Notes
            </h2>
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Note
            </button>
          </div>

          {/* Add note form */}
          {showNoteForm && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-card p-4">
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title…"
                className="rounded-md bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Write a note…"
                rows={3}
                className="resize-none rounded-md bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNoteForm(false);
                    setNoteTitle("");
                    setNoteBody("");
                  }}
                  className="rounded-md px-3 py-1.5 text-xs text-foreground-muted hover:bg-surface-raised"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNote}
                  disabled={createNote.isPending || (!noteTitle.trim() && !noteBody.trim())}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {createNote.isPending ? "Saving…" : "Save Note"}
                </button>
              </div>
            </div>
          )}

          {/* Notes list */}
          {loadingNotes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg bg-surface-card py-10">
              <StickyNote className="h-6 w-6 text-foreground-disabled" />
              <span className="text-sm text-foreground-muted">No notes yet — add one above</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notes.map((note) => {
                const authorName =
                  (note.author as { full_name?: string } | null)?.full_name ?? "Team";
                return (
                  <NoteCard
                    key={note.id}
                    authorName={authorName}
                    authorInitials={getInitials(authorName)}
                    dateLabel={timeAgo(note.created_at)}
                    title={note.title ?? ""}
                    body={note.body ?? ""}
                    footerAuthor={authorName}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
