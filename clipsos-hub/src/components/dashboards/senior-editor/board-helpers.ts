/**
 * board-helpers — shared types, constants, and localStorage logic for ProductionBoard.
 */
import { differenceInDays } from "date-fns";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface BoardStatus {
  id: string;
  slug: string;
  display_name: string;
  color: string;
  sort_order: number;
}

export interface BoardVideo {
  id: string;
  video_title: string;
  updated_at: string;
  created_at: string;
  post_date: string | null;
  video_thumbnail_url: string | null;
  status_id: string | null;
  status: { id: string; display_name: string; slug: string; color: string } | null;
  client: { id: string; name: string; logo_url: string | null } | null;
  video_type: { id: string; display_name: string; slug: string } | null;
  project: { id: string; project_name: string } | null;
  cycle: { id: string; name: string; cycle_number: number } | null;
}

export interface BoardEditorMap {
  [videoId: string]: string[]; // editor_id[]
}

export interface TeamMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

export interface BoardFilters {
  clientIds: string[];
  editorIds: string[];
  typeIds: string[];
  search: string;
}

export interface SavedBoardView {
  id: string;
  name: string;
  visibleStatusIds: string[];
  filters: BoardFilters;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const CARDS_PER_PAGE = 20;
export const LS_COLUMNS_KEY = "se-board-columns";
export const LS_VIEWS_KEY = "se-board-views";

/** Statuses hidden by default */
export const DEFAULT_HIDDEN_SLUGS = new Set(["cancelled", "archived"]);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function getDaysInStatus(updatedAt: string): number {
  return differenceInDays(new Date(), new Date(updatedAt));
}

export function getDaysColor(days: number): string {
  if (days <= 2) return "text-foreground-muted";
  if (days <= 5) return "text-status-warning";
  return "text-status-error";
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const emptyFilters: BoardFilters = {
  clientIds: [],
  editorIds: [],
  typeIds: [],
  search: "",
};

export function hasActiveFilters(f: BoardFilters): boolean {
  return (
    f.clientIds.length > 0 ||
    f.editorIds.length > 0 ||
    f.typeIds.length > 0 ||
    f.search.trim().length > 0
  );
}

/* ------------------------------------------------------------------ */
/* LocalStorage                                                        */
/* ------------------------------------------------------------------ */

export function loadVisibleIds(): string[] | null {
  try {
    const raw = localStorage.getItem(LS_COLUMNS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveVisibleIds(ids: string[]) {
  localStorage.setItem(LS_COLUMNS_KEY, JSON.stringify(ids));
}

export function loadSavedViews(): SavedBoardView[] {
  try {
    const raw = localStorage.getItem(LS_VIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistSavedViews(views: SavedBoardView[]) {
  localStorage.setItem(LS_VIEWS_KEY, JSON.stringify(views));
}

/* ------------------------------------------------------------------ */
/* Filtering                                                           */
/* ------------------------------------------------------------------ */

export function filterVideos(
  videos: BoardVideo[],
  filters: BoardFilters,
  editorMap: BoardEditorMap,
  team: TeamMember[],
): BoardVideo[] {
  let out = videos;

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    const teamMap = new Map(team.map((t) => [t.id, t.full_name?.toLowerCase() ?? ""]));
    out = out.filter((v) => {
      if (v.video_title.toLowerCase().includes(q)) return true;
      if (v.client?.name.toLowerCase().includes(q)) return true;
      if (v.project?.project_name.toLowerCase().includes(q)) return true;
      const eds = editorMap[v.id] ?? [];
      return eds.some((eid) => teamMap.get(eid)?.includes(q));
    });
  }

  if (filters.clientIds.length > 0) {
    const set = new Set(filters.clientIds);
    out = out.filter((v) => v.client && set.has(v.client.id));
  }

  if (filters.editorIds.length > 0) {
    const set = new Set(filters.editorIds);
    out = out.filter((v) => {
      const eds = editorMap[v.id] ?? [];
      return eds.some((eid) => set.has(eid));
    });
  }

  if (filters.typeIds.length > 0) {
    const set = new Set(filters.typeIds);
    out = out.filter((v) => v.video_type && set.has(v.video_type.id));
  }

  return out;
}
