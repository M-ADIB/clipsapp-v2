/**
 * cc-board-helpers — shared types, constants, and localStorage logic
 * for the Content Creator Production Board.
 *
 * Mirrors senior-editor/board-helpers.ts but uses separate localStorage
 * keys (so CC and SE views don't collide) and adds caption/content-specific
 * search fields.
 */
import { differenceInDays } from "date-fns";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface CCBoardStatus {
  id: string;
  slug: string;
  display_name: string;
  color: string;
  sort_order: number;
}

export interface CCBoardVideo {
  id: string;
  video_title: string;
  updated_at: string;
  created_at: string;
  post_date: string | null;
  video_thumbnail_url: string | null;
  status_id: string | null;
  caption: string | null;
  caption_approved: boolean | null;
  caption_context: string | null;
  text_hook: string | null;
  freebie_word: string | null;
  freebie_content: string | null;
  status: { id: string; display_name: string; slug: string; color: string } | null;
  client: { id: string; name: string; logo_url: string | null } | null;
  video_type: { id: string; display_name: string; slug: string } | null;
  project: { id: string; project_name: string } | null;
  cycle: { id: string; name: string; cycle_number: number } | null;
}

export interface CCBoardEditorMap {
  [videoId: string]: string[];
}

export interface CCTeamMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

export interface CCBoardFilters {
  clientIds: string[];
  editorIds: string[];
  typeIds: string[];
  search: string;
  /** Only show videos with captions (non-null, non-empty) */
  hasCaption: boolean | null;
  /** Only show videos with caption_approved = true */
  captionApproved: boolean | null;
}

export interface SavedCCBoardView {
  id: string;
  name: string;
  visibleStatusIds: string[];
  filters: CCBoardFilters;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const CC_CARDS_PER_PAGE = 20;
export const CC_LS_COLUMNS_KEY = "cc-board-columns";
export const CC_LS_VIEWS_KEY = "cc-board-views";

/** Statuses hidden by default */
export const CC_DEFAULT_HIDDEN_SLUGS = new Set(["cancelled", "archived"]);

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

export const emptyFilters: CCBoardFilters = {
  clientIds: [],
  editorIds: [],
  typeIds: [],
  search: "",
  hasCaption: null,
  captionApproved: null,
};

export function hasActiveFilters(f: CCBoardFilters): boolean {
  return (
    f.clientIds.length > 0 ||
    f.editorIds.length > 0 ||
    f.typeIds.length > 0 ||
    f.search.trim().length > 0 ||
    f.hasCaption !== null ||
    f.captionApproved !== null
  );
}

/* ------------------------------------------------------------------ */
/* LocalStorage                                                        */
/* ------------------------------------------------------------------ */

export function loadVisibleIds(): string[] | null {
  try {
    const raw = localStorage.getItem(CC_LS_COLUMNS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveVisibleIds(ids: string[]) {
  localStorage.setItem(CC_LS_COLUMNS_KEY, JSON.stringify(ids));
}

export function loadSavedViews(): SavedCCBoardView[] {
  try {
    const raw = localStorage.getItem(CC_LS_VIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistSavedViews(views: SavedCCBoardView[]) {
  localStorage.setItem(CC_LS_VIEWS_KEY, JSON.stringify(views));
}

/* ------------------------------------------------------------------ */
/* Filtering                                                           */
/* ------------------------------------------------------------------ */

export function filterVideos(
  videos: CCBoardVideo[],
  filters: CCBoardFilters,
  editorMap: CCBoardEditorMap,
  team: CCTeamMember[],
): CCBoardVideo[] {
  let out = videos;

  // Text search — also searches caption, text_hook, freebie fields
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    const teamMap = new Map(team.map((t) => [t.id, t.full_name?.toLowerCase() ?? ""]));
    out = out.filter((v) => {
      if (v.video_title.toLowerCase().includes(q)) return true;
      if (v.client?.name.toLowerCase().includes(q)) return true;
      if (v.project?.project_name.toLowerCase().includes(q)) return true;
      if (v.caption?.toLowerCase().includes(q)) return true;
      if (v.text_hook?.toLowerCase().includes(q)) return true;
      if (v.freebie_word?.toLowerCase().includes(q)) return true;
      if (v.freebie_content?.toLowerCase().includes(q)) return true;
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

  // Caption content filter
  if (filters.hasCaption === true) {
    out = out.filter((v) => v.caption && v.caption.trim().length > 0);
  } else if (filters.hasCaption === false) {
    out = out.filter((v) => !v.caption || v.caption.trim().length === 0);
  }

  // Caption approval filter
  if (filters.captionApproved === true) {
    out = out.filter((v) => v.caption_approved === true);
  } else if (filters.captionApproved === false) {
    out = out.filter((v) => v.caption_approved !== true);
  }

  return out;
}
