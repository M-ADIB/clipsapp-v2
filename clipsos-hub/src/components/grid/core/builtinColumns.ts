/**
 * Built-in video columns — the canonical 15-column spec.
 *
 * These are the ONLY built-in columns. Anything else is a custom column
 * stored in `custom_columns` and added through the Add Column dialog.
 *
 * Source of truth: docs/ClipsApp-PRD.md + legacy FullyCustomizableTable.
 */
import type { AppRole } from "@/integrations/supabase/db-types";
import type { BuiltinColumn } from "./types";

const ALL_TEAM: AppRole[] = ["owner", "manager", "senior_editor", "content_creator", "editor"];

const PRODUCTION_LEADS: AppRole[] = ["owner", "manager", "senior_editor"];
const QA_LEADS: AppRole[] = ["owner", "manager", "senior_editor", "content_creator"];

/** Default registry. Order here is the default column order. */
export const BUILTIN_COLUMNS: ReadonlyArray<Omit<BuiltinColumn, "order" | "visible">> = [
  {
    source: "builtin",
    id: "video",
    field: "video_playback_url",
    label: "Video",
    type: "video",
    width: 110,
    sortable: false,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "thumbnail",
    field: "video_thumbnail_url",
    label: "Thumbnail",
    type: "thumbnail",
    width: 110,
    sortable: false,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "video_title",
    field: "video_title",
    label: "Title",
    type: "text",
    width: 260,
    sortable: true,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "trial_date",
    field: "trial_date",
    label: "Trial Date",
    type: "date",
    width: 130,
    sortable: true,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "post_date",
    field: "post_date",
    label: "Post It",
    type: "date",
    width: 130,
    sortable: true,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "status",
    field: "status_id",
    label: "Status",
    type: "status",
    width: 140,
    sortable: true,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "review",
    field: "review",
    label: "Review",
    type: "review",
    width: 130,
    sortable: false,
    editableBy: QA_LEADS,
  },
  {
    source: "builtin",
    id: "video_type",
    field: "video_type_id",
    label: "Type",
    type: "video_type",
    width: 130,
    sortable: true,
    editableBy: QA_LEADS,
  },
  {
    source: "builtin",
    id: "thumbnail_text",
    field: "thumbnail_text",
    label: "Thumbnail Text",
    type: "text",
    width: 200,
    sortable: false,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "text_hook",
    field: "text_hook",
    label: "Text Hook",
    type: "long_text",
    width: 220,
    sortable: false,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "transcript",
    field: "transcript",
    label: "Transcript",
    type: "long_text",
    width: 220,
    sortable: false,
    editableBy: PRODUCTION_LEADS,
  },
  {
    source: "builtin",
    id: "caption",
    field: "caption",
    label: "Caption",
    type: "long_text",
    width: 280,
    sortable: false,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "freebie_word",
    field: "freebie_word",
    label: "Trigger Word",
    type: "text",
    width: 140,
    sortable: false,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "freebie_content",
    field: "freebie_content",
    label: "Lead Magnet",
    type: "long_text",
    width: 200,
    sortable: false,
    editableBy: ALL_TEAM,
  },
  {
    source: "builtin",
    id: "editors",
    field: "editors",
    label: "Editors",
    type: "editors",
    width: 160,
    sortable: false,
    editableBy: PRODUCTION_LEADS,
  },
  {
    source: "builtin",
    id: "client_name",
    field: "client",
    label: "Client",
    type: "text",
    width: 160,
    sortable: true,
    editableBy: [], // read-only — derived from client join
  },
  {
    source: "builtin",
    id: "created_at",
    field: "created_at",
    label: "Date Added",
    type: "date",
    width: 140,
    sortable: true,
    editableBy: [], // read-only — system field
  },
];

/**
 * Per-role default visibility — ported 1:1 from the legacy
 * FullyCustomizableTable's `getDefaultVisibleColumns()`.
 */
export function defaultVisibleColumns(role: AppRole | null): Set<string> {
  if (role === "client") {
    return new Set([
      "video",
      "thumbnail",
      "video_title",
      "trial_date",
      "post_date",
      "status",
      "video_type",
      "text_hook",
      "caption",
      "freebie_word",
      "freebie_content",
    ]);
  }
  if (role === "editor") {
    return new Set([
      "video",
      "thumbnail",
      "video_title",
      "trial_date",
      "post_date",
      "status",
      "review",
      "video_type",
      "thumbnail_text",
      "text_hook",
      "transcript",
      "caption",
      "freebie_word",
      "freebie_content",
    ]);
  }
  // owner / manager / senior_editor / content_creator / moderator / closer → all
  return new Set(BUILTIN_COLUMNS.map((c) => c.id));
}
