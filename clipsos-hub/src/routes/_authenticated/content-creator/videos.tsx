import { createFileRoute } from "@tanstack/react-router";
import { ContentCreatorVideosPage } from "@/components/dashboards/content-creator/ContentCreatorVideosPage";

/**
 * Content Creator > Videos — full videos grid with CC-scoped viewKey.
 * RLS enforces actual row-level access.
 */
export const Route = createFileRoute("/_authenticated/content-creator/videos")({
  component: ContentCreatorVideosPage,
});
