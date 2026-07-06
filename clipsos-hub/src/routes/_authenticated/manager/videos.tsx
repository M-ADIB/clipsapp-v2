import { createFileRoute } from "@tanstack/react-router";
import { VideosDashboard } from "@/components/dashboards/shared/VideosDashboard";

export const Route = createFileRoute("/_authenticated/manager/videos")({
  component: VideosDashboard,
});
