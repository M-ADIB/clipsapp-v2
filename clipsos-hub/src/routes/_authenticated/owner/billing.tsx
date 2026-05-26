/**
 * /owner/billing — Redirects to /owner/settings (Billing tab).
 * Billing management now lives as a tab inside Settings.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/owner/billing")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/settings", search: { tab: "billing" } });
  },
  component: () => null,
});
