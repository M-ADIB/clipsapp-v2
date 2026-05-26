import { createFileRoute } from "@tanstack/react-router";
import { EmailHub } from "@/components/dashboards/shared/EmailHub";

export const Route = createFileRoute("/_authenticated/manager/email-hub")({
  component: EmailHub,
});
