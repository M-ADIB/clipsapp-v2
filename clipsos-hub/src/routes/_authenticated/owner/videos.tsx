import { createFileRoute } from "@tanstack/react-router";
import { VideosDashboard } from "@/components/dashboards/owner/VideosDashboard";

export const Route = createFileRoute("/_authenticated/owner/videos")({
  component: VideosDashboard,
});
