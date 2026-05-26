import { createFileRoute } from "@tanstack/react-router";
import { EditorVideosPage } from "@/components/dashboards/editor/EditorVideosPage";

export const Route = createFileRoute("/_authenticated/editor/videos")({
  component: EditorVideosPage,
});
