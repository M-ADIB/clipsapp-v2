import { createFileRoute } from "@tanstack/react-router";
import { ClientStudio } from "@/components/dashboards/client/ClientStudio";

export const Route = createFileRoute("/_authenticated/client/studio")({
  component: ClientStudio,
});
