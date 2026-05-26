import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ClientMyVideos } from "@/components/dashboards/client/ClientMyVideos";

const searchSchema = z.object({
  /** Pre-filter slug passed from the dashboard stat cards (e.g. "review") */
  status: z.string().optional(),
  projectId: z.string().optional(),
  tab: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/client/videos")({
  validateSearch: searchSchema,
  component: ClientMyVideos,
});
