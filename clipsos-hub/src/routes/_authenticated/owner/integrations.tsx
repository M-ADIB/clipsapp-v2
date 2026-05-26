/**
 * /owner/integrations — Redirects to /owner/settings (Integrations tab).
 * Integrations management now lives as a tab inside Settings.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/owner/integrations")({
  beforeLoad: () => {
    throw redirect({
      to: "/owner/settings",
      search: { tab: "integrations" },
    });
  },
  component: () => null,
});
