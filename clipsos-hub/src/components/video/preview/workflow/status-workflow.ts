/**
 * Status workflow rules — role-based status control.
 *
 * Role behaviour:
 *   • owner / manager / content_creator / senior_editor → full status dropdown
 *   • editor → single "Submit for Review" button (→ internal_review)
 *     - Only enabled when the video has BOTH a video AND a thumbnail uploaded
 *   • moderator → view-only badge, no actions
 *   • client → "Approve" + "Request Revision" buttons
 *   • closer → same as moderator (view only)
 *
 * Senior editors are the gateway: only they (and above) can push a video
 * from internal_review → final_review, which is what makes it visible
 * to clients.
 */
import type { AppRole } from "@/integrations/supabase/db-types";

// ─── Canonical slug type ────────────────────────────────────────────────────
export type StatusSlug =
  | "new"
  | "in_progress"
  | "rough_cut"
  | "internal_review"
  | "final_review"
  | "approved"
  | "scheduled"
  | "posted"
  | "revisions_requested"
  | "cancelled"
  | "archived"
  // Catch-all for tenant-custom statuses
  | (string & {});

// ─── Role classification ────────────────────────────────────────────────────

/** Roles that see the full status dropdown (can change to ANY status). */
const ADMIN_ROLES = new Set<AppRole>(["owner", "manager", "content_creator", "senior_editor"]);

/** Roles that see the Approve/Revision buttons. */
const CLIENT_ROLES = new Set<AppRole>(["client"]);

/** Roles that only see a read-only status badge. */
const VIEW_ONLY_ROLES = new Set<AppRole>(["moderator", "closer"]);

// ─── View mode per role ─────────────────────────────────────────────────────

export type StatusViewMode =
  /** Full dropdown — can change to any status */
  | "dropdown"
  /** Single "Submit for Review" button */
  | "editor_submit"
  /** "Approve" + "Request Revision" buttons */
  | "client_review"
  /** Read-only badge */
  | "view_only"
  /** Hidden (guest / unknown role) */
  | "hidden";

export function getStatusViewMode(role: AppRole | null | undefined): StatusViewMode {
  if (!role) return "hidden";
  if (ADMIN_ROLES.has(role)) return "dropdown";
  if (role === "editor") return "editor_submit";
  if (CLIENT_ROLES.has(role)) return "client_review";
  if (VIEW_ONLY_ROLES.has(role)) return "view_only";
  return "hidden";
}

// ─── Editor guard ───────────────────────────────────────────────────────────

/**
 * Whether the editor's "Submit for Review" button is enabled.
 * Requires both a video AND a thumbnail to be present.
 */
export function canEditorSubmit(
  video:
    | {
        video_cloudflare_id?: string | null;
        video_playback_url?: string | null;
        video_original_url?: string | null;
        video_thumbnail_url?: string | null;
        thumbnail_storage_path?: string | null;
      }
    | null
    | undefined,
): boolean {
  if (!video) return false;
  const hasVideo = !!(
    video.video_cloudflare_id ||
    video.video_playback_url ||
    video.video_original_url
  );
  const hasThumbnail = !!(video.video_thumbnail_url || video.thumbnail_storage_path);
  return hasVideo && hasThumbnail;
}

// ─── Status list for dropdown ───────────────────────────────────────────────

export interface StatusOption {
  id: string;
  slug: string;
  displayName: string;
  color: string;
}

/**
 * Statuses available in the admin dropdown.
 * All statuses are shown — the admin dropdown is unrestricted.
 */
export function getDropdownStatuses(
  statuses: Array<{ id: string; slug: string; display_name: string; color: string | null }>,
): StatusOption[] {
  return statuses.map((s) => ({
    id: s.id,
    slug: s.slug,
    displayName: s.display_name,
    color: s.color ?? "#64748b",
  }));
}
