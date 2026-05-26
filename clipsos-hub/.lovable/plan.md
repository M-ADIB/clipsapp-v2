# VideoPreviewModal Parity Audit + Revised Wave Plan

## What we have ✅ (Waves 1–4)

Player (HLS + Safari), controls, keyboard shortcuts, header, download (R2→CF fallback), threaded comments with realtime, mobile bottom-sheet (3 states), desktop sidebar, timeline pins, annotations (pen/arrow/rect/ellipse) with overlay playback, role-gated status workflow.

## Gaps vs. legacy (`VideoReviewModal`, 1,907 LOC)

### High-impact

1. **Versions** — no selector, no version-aware filtering of comments/annotations, no upload-new-version flow, no realtime version sync.
2. **Trial reels** — no trials tab, upload, or playback mode.
3. **Queue navigation** — modal takes a single video; no prev/next arrows, no swipe between videos in a grid.
4. **Frame.io range comments** — no I/O keys, no range markers, no loop-between-points.
5. **In-app sharing** — no share entry point and no permission gate (download yes/no).
6. **Comment composer power-ups** — no @mentions, no internal/public toggle, no attachments, no guest name capture, no auto-pause on focus.
7. **Comment sidebar tools** — no search, no filter (status / has-annotation / range), no sort.
8. **HLS quality selector** + **global loop toggle** missing from controls.

### Medium-impact

9. **Annotation overlay sizing** — letterbox-aware (use `videoWidth/Height` + offsets) instead of container box.
10. **Annotation frame thumbnail** — capture canvas snapshot and persist with annotation.
11. **Workflow side-effects** — auto-comment on approve/revision, invoke notification edge function, write `activity_log`, auto-advance to next in queue.
12. **Editor pre-flight** — block `internal_revision` until video file + thumbnail exist.

### Polish (low)

13. UI bugs to fix now: **duplicate close buttons**, **download button misplaced** (see Wave 5).
14. Trial-playing banner, mobile floating action bar, swipe indicator, `--app-vh` for in-app browsers, auto-pause on composer focus.

### Explicitly OUT of scope

- Comment categories — dropped per request.
- External "Share" button as a top-level player chrome action — removed; replaced by in-app share with permission picker (see Wave 7).

---

## Revised waves

### Wave 5 — UI cleanup + Versions + Trials

**UI fixes (do first):**

- Audit modal chrome and remove the duplicate close button (header has Back + ×; we keep one × top-right).
- Reposition Download into a single right-aligned action cluster: `[Download] [Status pill] [×]` on desktop; on mobile, Download collapses into the player overflow menu.

**Versions:**

- `useVideoVersions(videoId)` hook (realtime via `video_versions` channel).
- `VersionSelector` rendered in header (compact dropdown showing v1, v2…).
- Switching version swaps the HLS manifest URL.
- All comment + annotation queries scope by `version_id`.
- `VersionUploadDialog` (multipart R2 upload via existing infra; reuses `MediaStubCells` upload path).

**Trials:**

- Sidebar gets `Tabs`: Comments / Versions / Trials.
- `TrialReelsTab` lists trials per video, supports upload (`UploadTrialDialog`) and "Play this trial" mode that swaps the player source temporarily with a "← Back to main" pill.

### Wave 6 — Queue navigation + In-app sharing system

**Queue navigation:**

- Modal accepts `queue?: { ids: string[]; currentIndex: number; onNavigate: (i: number) => void }`.
- Desktop: prev/next arrows overlaid on player edges.
- Mobile: horizontal swipe (uses existing `useSwipeable`).
- Keyboard ←/→ wired to queue (Shift+← / Shift+→ stays as scrub-5s).

**Sharing system (3 levels, all in-app):**
A single `ShareDialog` component reused across entry points. Step 1 picks **permissions** (`Allow download`, `Allow comments`, `Expires in [24h / 7d / 30d / never]`). Step 2 generates a link backed by `guest_review_links` and copies it.

| Level                 | Entry point                                                      | Payload stored                       |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------ |
| **Single video**      | Share button inside `VideoPreviewModal` toolbar                  | `video_id`                           |
| **Multiple selected** | Bulk action bar in the videos grid (when ≥2 rows selected)       | `video_ids[]` in `permissions.jsonb` |
| **Entire cycle**      | "Share cycle" action on the cycle header in `/owner/clients/$id` | `cycle_id`                           |

DB: extend `guest_review_links` with `scope` enum (`video` / `videos` / `cycle`), `target_ids uuid[]`, `allow_download boolean`, `allow_comments boolean`. Public review route resolves the token → renders the right view (single modal, multi-grid, or cycle grid).

Architected so we can plug in additional formats later (e.g. project-level, public showcase reels) without changing the dialog API.

### Wave 7 — Range comments + composer/sidebar power-ups

- I / O keyboard shortcuts; in-point flash; range markers on timeline; loop-between-points playback.
- Composer: @mentions (uses `profiles` autocomplete), internal/public toggle (gated to team roles), attachments (R2 upload, image/video/file), guest name capture for guest-token sessions, auto-pause on focus.
- Sidebar: search box, filter dropdown (status: open/resolved; type: text/annotation/range), sort (newest/oldest/timestamp).
- Player controls: HLS quality selector (Auto + level list) and global loop toggle.

### Wave 8 — Annotation polish + workflow side-effects

- Letterbox-aware overlay sizing (measure `videoWidth/videoHeight` + compute offsets).
- Capture frame thumbnail (canvas `toDataURL`) when saving annotation; persist on `video_annotations.frame_thumbnail`.
- Approve / Revision / Cancel posts auto-comment, invokes notification edge function (`notify-video-approval`, `notify-video-feedback`), writes to `activity_log`, and auto-advances queue.
- Editor pre-flight: block `internal_revision` unless video file + thumbnail present (toast actionable error).

### Wave 9 — Mobile & polish

- `--app-vh` CSS variable hook for in-app browsers.
- Mobile floating action bar (Approve / Revision / Cancel).
- Trial-playing banner, swipe direction indicator, auto-pause on composer focus.

---

## Recommendation

Start with **Wave 5** since it includes the UI bug fixes (duplicate close, download placement) plus the highest-impact missing features (versions + trials). Sharing system (Wave 6) is the next biggest user-facing gap.

Approve to begin **Wave 5**, or tell me which wave to start with.
