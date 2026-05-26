import { createFileRoute } from "@tanstack/react-router";
import { EmailHub } from "@/components/dashboards/shared/EmailHub";

export const Route = createFileRoute("/_authenticated/owner/email-hub")({
  component: EmailHub,
});
