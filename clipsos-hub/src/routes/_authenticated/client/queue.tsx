import { createFileRoute } from "@tanstack/react-router";
import { PostingQueue } from "@/components/dashboards/client/PostingQueue";

export const Route = createFileRoute("/_authenticated/client/queue")({
  component: PostingQueue,
});
