/**
 * ProductionBoard — Senior Editor configurable Kanban.
 *
 * Dynamic columns from `statuses` lookup table. Each status = one column.
 * Users can show/hide columns, filter by client/editor/type, search,
 * paginate per-column, and save views. Clicking a card opens VideoPreviewModal.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useVideos } from "@/hooks/data";
import { useStatuses, useVideoTypes } from "@/hooks/use-lookups";
import { useClients } from "@/hooks/use-clients";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { VideoPreviewModal } from "@/components/video/preview/VideoPreviewModalLazy";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Bookmark,
  Check,
  ChevronDown,
  Clock,
  Columns3,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Save,
  Search,
  Trash2,
  User2,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  type BoardVideo,
  type BoardEditorMap,
  type BoardFilters,
  type BoardStatus,
  type SavedBoardView,
  type TeamMember,
  CARDS_PER_PAGE,
  DEFAULT_HIDDEN_SLUGS,
  emptyFilters,
  hasActiveFilters,
  filterVideos,
  getDaysInStatus,
  getDaysColor,
  getInitials,
  loadVisibleIds,
  saveVisibleIds,
  loadSavedViews,
  persistSavedViews,
} from "./board-helpers";

/* ------------------------------------------------------------------ */
/* Hook — video editors map                                            */
/* ------------------------------------------------------------------ */

function useVideoEditorMap() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["board", "video_editors", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_editors")
        .select("video_id, editor_id")
        .eq("tenant_id", tenantId!);
      if (error) throw error;
      const map: BoardEditorMap = {};
      for (const row of data ?? []) {
        if (!row.video_id) continue;
        (map[row.video_id] ??= []).push(row.editor_id);
      }
      return map;
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export function ProductionBoard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  useEffect(() => {
    setHeaderConfig({ title: "Production Board", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  // ── Data hooks ──────────────────────────────────────────────────
  const { data: videos = [], isLoading: videosLoading } = useVideos();
  const { data: statuses = [], isLoading: statusesLoading } = useStatuses();
  const { data: editorMap = {} } = useVideoEditorMap();
  const { data: team = [] } = useTeam() as { data: TeamMember[] };
  const { data: clients = [] } = useClients();
  const { data: videoTypes = [] } = useVideoTypes();

  // ── Column visibility ───────────────────────────────────────────
  const [visibleStatusIds, setVisibleStatusIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (statuses.length === 0 || initialized) return;
    const saved = loadVisibleIds();
    if (saved && saved.length > 0) {
      setVisibleStatusIds(saved);
    } else {
      const defaults = statuses.filter((s) => !DEFAULT_HIDDEN_SLUGS.has(s.slug)).map((s) => s.id);
      setVisibleStatusIds(defaults);
    }
    setInitialized(true);
  }, [statuses, initialized]);

  const toggleStatusColumn = useCallback((statusId: string) => {
    setVisibleStatusIds((prev) => {
      const next = prev.includes(statusId)
        ? prev.filter((id) => id !== statusId)
        : [...prev, statusId];
      saveVisibleIds(next);
      return next;
    });
  }, []);

  // ── Filters ─────────────────────────────────────────────────────
  const [filters, setFilters] = useState<BoardFilters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Saved Views ─────────────────────────────────────────────────
  const [savedViews, setSavedViews] = useState<SavedBoardView[]>(loadSavedViews);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const saveCurrentView = useCallback(() => {
    if (!newViewName.trim()) return;
    const view: SavedBoardView = {
      id: crypto.randomUUID(),
      name: newViewName.trim(),
      visibleStatusIds,
      filters,
    };
    const next = [...savedViews, view];
    setSavedViews(next);
    persistSavedViews(next);
    setNewViewName("");
  }, [newViewName, visibleStatusIds, filters, savedViews]);

  const loadView = useCallback((view: SavedBoardView) => {
    setVisibleStatusIds(view.visibleStatusIds);
    saveVisibleIds(view.visibleStatusIds);
    setFilters(view.filters);
    setViewsOpen(false);
  }, []);

  const deleteView = useCallback(
    (viewId: string) => {
      const next = savedViews.filter((v) => v.id !== viewId);
      setSavedViews(next);
      persistSavedViews(next);
    },
    [savedViews],
  );

  // ── Per-column pagination ───────────────────────────────────────
  const [limits, setLimits] = useState<Record<string, number>>({});
  const getLimit = (statusId: string) => limits[statusId] ?? CARDS_PER_PAGE;
  const loadMore = (statusId: string) =>
    setLimits((prev) => ({
      ...prev,
      [statusId]: (prev[statusId] ?? CARDS_PER_PAGE) + CARDS_PER_PAGE,
    }));

  // ── Preview modal ───────────────────────────────────────────────
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = useCallback((videoId: string) => {
    setPreviewId(videoId);
    setPreviewOpen(true);
  }, []);

  // ── Computed data ───────────────────────────────────────────────
  const boardVideos = videos as unknown as BoardVideo[];
  const filteredVideos = useMemo(
    () => filterVideos(boardVideos, filters, editorMap, team),
    [boardVideos, filters, editorMap, team],
  );

  const sortedStatuses = useMemo(
    () => [...(statuses as BoardStatus[])].sort((a, b) => a.sort_order - b.sort_order),
    [statuses],
  );

  const visibleStatuses = useMemo(
    () => sortedStatuses.filter((s) => visibleStatusIds.includes(s.id)),
    [sortedStatuses, visibleStatusIds],
  );

  const columnData = useMemo(() => {
    const map: Record<string, BoardVideo[]> = {};
    for (const s of sortedStatuses) map[s.id] = [];
    for (const v of filteredVideos) {
      const sid = v.status_id ?? v.status?.id;
      if (sid && map[sid]) map[sid].push(v);
    }
    return map;
  }, [filteredVideos, sortedStatuses]);

  const totalFiltered = filteredVideos.length;
  const activeCount = visibleStatuses.reduce((acc, s) => acc + (columnData[s.id]?.length ?? 0), 0);

  // Team map for resolving editor names
  const teamMap = useMemo(() => new Map(team.map((t) => [t.id, t])), [team]);

  // ── Unique values for filter dropdowns ──────────────────────────
  const uniqueClients = useMemo(() => {
    const ids = new Set(boardVideos.map((v) => v.client?.id).filter(Boolean));
    return (clients ?? []).filter((c: { id: string }) => ids.has(c.id));
  }, [boardVideos, clients]);

  const uniqueEditorIds = useMemo(() => {
    const ids = new Set<string>();
    for (const eds of Object.values(editorMap)) for (const eid of eds) ids.add(eid);
    return [...ids];
  }, [editorMap]);

  // ── Loading ─────────────────────────────────────────────────────
  if (videosLoading || statusesLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FullBleed>
      <div className="flex flex-col h-full">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-3.5 w-3.5 text-foreground-disabled pointer-events-none" />
            <input
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search videos…"
              className="h-8 w-52 rounded-md bg-surface-raised pl-7 pr-7 text-xs text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                className="absolute right-2 text-foreground-disabled hover:text-foreground-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filters Popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground-muted hover:bg-surface-raised transition-colors">
                <Filter className="h-3.5 w-3.5" />
                Filters
                {hasActiveFilters(filters) && (
                  <span className="rounded-full bg-primary px-1.5 text-[9px] font-bold text-primary-foreground">
                    {[
                      filters.clientIds.length,
                      filters.editorIds.length,
                      filters.typeIds.length,
                    ].reduce((a, b) => a + (b > 0 ? 1 : 0), 0)}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3 space-y-3">
              <FilterSection
                label="Client"
                options={uniqueClients.map((c: { id: string; name: string }) => ({
                  id: c.id,
                  name: c.name,
                }))}
                selected={filters.clientIds}
                onChange={(ids) => setFilters((f) => ({ ...f, clientIds: ids }))}
              />
              <FilterSection
                label="Editor"
                options={uniqueEditorIds.map((eid) => ({
                  id: eid,
                  name: teamMap.get(eid)?.full_name ?? "Unknown",
                }))}
                selected={filters.editorIds}
                onChange={(ids) => setFilters((f) => ({ ...f, editorIds: ids }))}
              />
              <FilterSection
                label="Video Type"
                options={(videoTypes ?? []).map((t: { id: string; display_name: string }) => ({
                  id: t.id,
                  name: t.display_name,
                }))}
                selected={filters.typeIds}
                onChange={(ids) => setFilters((f) => ({ ...f, typeIds: ids }))}
              />
              {hasActiveFilters(filters) && (
                <button
                  onClick={() => setFilters(emptyFilters)}
                  className="text-xs text-destructive hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </PopoverContent>
          </Popover>

          {/* Column Visibility */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground-muted hover:bg-surface-raised transition-colors">
                <Columns3 className="h-3.5 w-3.5" />
                Columns
                <span className="text-[10px] text-foreground-disabled">
                  {visibleStatuses.length}/{sortedStatuses.length}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-2">
              <div className="space-y-0.5">
                {sortedStatuses.map((s) => {
                  const visible = visibleStatusIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleStatusColumn(s.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-surface-raised"
                    >
                      {visible ? (
                        <Eye className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-foreground-disabled" />
                      )}
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span
                        className={visible ? "text-foreground-strong" : "text-foreground-disabled"}
                      >
                        {s.display_name}
                      </span>
                      <span className="ml-auto text-[10px] text-foreground-disabled">
                        {columnData[s.id]?.length ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Saved Views */}
          <Popover open={viewsOpen} onOpenChange={setViewsOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground-muted hover:bg-surface-raised transition-colors">
                <Bookmark className="h-3.5 w-3.5" />
                Views
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2 space-y-2">
              {savedViews.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-1">
                  <button
                    onClick={() => loadView(v)}
                    className="flex-1 rounded-md px-2.5 py-1.5 text-xs text-foreground-muted text-left hover:bg-surface-raised"
                  >
                    {v.name}
                  </button>
                  <button
                    onClick={() => deleteView(v.id)}
                    className="p-1 text-foreground-disabled hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                <input
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="Save current view…"
                  className="flex-1 h-7 rounded bg-surface-raised px-2 text-xs placeholder:text-foreground-disabled focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && saveCurrentView()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveCurrentView}
                  disabled={!newViewName.trim()}
                  className="h-7 px-2"
                >
                  <Save className="h-3 w-3" />
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1" />

          {/* Counts */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-foreground-muted">
              Total: <span className="font-semibold text-foreground-strong">{totalFiltered}</span>
            </span>
            <span className="text-foreground-muted">
              Visible: <span className="font-semibold text-primary">{activeCount}</span>
            </span>
          </div>
        </div>

        {/* ── Summary Bar ── */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border overflow-x-auto">
          {visibleStatuses.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 shrink-0">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] text-foreground-muted whitespace-nowrap">
                {s.display_name}:{" "}
                <span className="font-medium text-foreground-strong">
                  {columnData[s.id]?.length ?? 0}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* ── Kanban Board ── */}
        <div className="flex flex-1 gap-3 overflow-x-auto p-4 pb-12">
          {visibleStatuses.map((status) => {
            const items = columnData[status.id] ?? [];
            const limit = getLimit(status.id);
            const visible = items.slice(0, limit);
            const hasMore = items.length > limit;

            return (
              <div
                key={status.id}
                className="flex h-full w-80 min-w-[300px] flex-col rounded-xl bg-surface-card/50"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <h3 className="text-sm font-medium text-foreground-strong flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    {status.display_name}
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-raised px-1.5 text-xs text-foreground-muted">
                      {items.length}
                    </span>
                  </h3>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto overflow-x-hidden px-3 pb-3 custom-scrollbar">
                  {visible.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      editorIds={editorMap[video.id] ?? []}
                      teamMap={teamMap}
                      onClick={() => openPreview(video.id)}
                    />
                  ))}
                  {visible.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border">
                      <p className="text-xs text-foreground-muted">No items</p>
                    </div>
                  )}
                  {hasMore && (
                    <button
                      onClick={() => loadMore(status.id)}
                      className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs text-foreground-muted hover:bg-surface-raised transition-colors"
                    >
                      <ChevronDown className="h-3 w-3" />
                      Load more ({items.length - limit} remaining)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Preview Modal ── */}
        <VideoPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          videoId={previewId}
          mode="preview"
        />
      </div>
    </FullBleed>
  );
}

/* ------------------------------------------------------------------ */
/* VideoCard                                                           */
/* ------------------------------------------------------------------ */

function mapSlugToVariant(slug: string): "in_review" | "approved" | "posted" | "pending" | "draft" {
  if (["posted", "published", "scheduled"].includes(slug)) return "posted";
  if (["approved"].includes(slug)) return "approved";
  if (
    [
      "in_review",
      "internal_review",
      "final_review",
      "changes_requested",
      "revisions_requested",
    ].includes(slug)
  )
    return "in_review";
  if (["in_progress", "assigned", "editing", "rough_cut", "pending", "new"].includes(slug))
    return "pending";
  return "draft";
}

interface VideoCardProps {
  video: BoardVideo;
  editorIds: string[];
  teamMap: Map<string, TeamMember>;
  onClick: () => void;
}

function VideoCard({ video, editorIds, teamMap, onClick }: VideoCardProps) {
  const days = getDaysInStatus(video.updated_at);
  const daysColor = getDaysColor(days);
  const rawSlug = video.status?.slug ?? "draft";
  const badgeVariant = mapSlugToVariant(rawSlug);

  const editors = editorIds.map((eid) => teamMap.get(eid)).filter((t): t is TeamMember => !!t);

  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col gap-2 rounded-xl border border-border bg-surface-card p-3.5 text-left transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
    >
      {/* Status + Days */}
      <div className="flex items-start justify-between gap-2">
        <StatusBadge variant={badgeVariant} label={video.status?.display_name ?? "Draft"} />
        <span className={`text-[10px] flex items-center gap-1 ${daysColor}`}>
          <Clock className="h-3 w-3" />
          {days === 0 ? "Today" : `${days}d`}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground-strong line-clamp-2 leading-snug">
        {video.video_title}
      </p>

      {/* Client + Project */}
      <div className="flex items-center gap-2">
        {video.client && (
          <div className="flex items-center gap-1.5 min-w-0">
            {video.client.logo_url ? (
              <img
                src={video.client.logo_url}
                alt=""
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[7px] font-bold text-primary">
                {getInitials(video.client.name)}
              </div>
            )}
            <span className="text-xs text-foreground-muted truncate max-w-[100px]">
              {video.client.name}
            </span>
          </div>
        )}
        {video.project && (
          <>
            <span className="text-foreground-disabled text-[10px]">·</span>
            <span className="text-[10px] text-foreground-disabled truncate max-w-[80px]">
              {video.project.project_name}
            </span>
          </>
        )}
      </div>

      {/* Footer: Editors + Type */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          {editors.length > 0 ? (
            <div className="flex items-center -space-x-1.5">
              {editors.slice(0, 2).map((ed) => (
                <div
                  key={ed.id}
                  title={ed.full_name ?? "Editor"}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[8px] font-bold text-primary border border-surface-card"
                >
                  {getInitials(ed.full_name ?? "?")}
                </div>
              ))}
              {editors.length > 2 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised text-[8px] font-bold text-foreground-muted border border-surface-card">
                  +{editors.length - 2}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised">
                <User2 className="h-3 w-3 text-foreground-disabled" />
              </div>
              <span className="text-[10px] text-foreground-disabled">Unassigned</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {video.video_type && (
            <span className="text-[9px] font-medium uppercase tracking-wider text-foreground-disabled">
              {video.video_type.display_name}
            </span>
          )}
          {video.post_date && (
            <span className="text-[9px] text-foreground-disabled">
              📅{" "}
              {new Date(video.post_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* FilterSection                                                       */
/* ------------------------------------------------------------------ */

function FilterSection({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const selectedSet = new Set(selected);
  const toggle = (id: string) => {
    const next = selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id];
    onChange(next);
  };

  const sorted = [...options].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="text-[11px] font-medium text-foreground-muted mb-1">{label}</div>
      <div className="max-h-32 overflow-y-auto space-y-0.5">
        {sorted.length === 0 && (
          <p className="text-[10px] text-foreground-disabled py-1">None available</p>
        )}
        {sorted.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-surface-raised transition-colors"
          >
            <div
              className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                selectedSet.has(opt.id) ? "bg-primary border-primary" : "border-border"
              }`}
            >
              {selectedSet.has(opt.id) && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
            </div>
            <span className="truncate text-foreground-strong">{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
