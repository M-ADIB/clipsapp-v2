import { createFileRoute } from "@tanstack/react-router";
import { TasksBoard } from "@/components/shared/TasksBoard";

export const Route = createFileRoute("/_authenticated/owner/tasks")({
  component: TasksBoard,
});
