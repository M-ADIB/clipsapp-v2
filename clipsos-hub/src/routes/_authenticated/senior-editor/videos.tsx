import { createFileRoute } from "@tanstack/react-router";
import { VideosDashboard } from "@/components/dashboards/shared/VideosDashboard";

/**
 * Senior Editor > Videos — full videos grid.
 * RLS allows senior editors to see all tenant videos.
 */
export const Route = createFileRoute("/_authenticated/senior-editor/videos")({
  component: VideosDashboard,
});
