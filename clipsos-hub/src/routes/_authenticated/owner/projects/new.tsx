import { createFileRoute } from "@tanstack/react-router";
import { CreateProjectPage } from "@/components/projects/CreateProjectPage";

export const Route = createFileRoute("/_authenticated/owner/projects/new")({
  component: CreateProjectPage,
});
