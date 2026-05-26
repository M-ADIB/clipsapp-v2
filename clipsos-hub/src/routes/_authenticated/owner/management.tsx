/**
 * /owner/management — Redirects to /owner/settings.
 * Kept for backward compatibility with any existing links/bookmarks.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/owner/management")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/settings" });
  },
  component: () => null,
});
