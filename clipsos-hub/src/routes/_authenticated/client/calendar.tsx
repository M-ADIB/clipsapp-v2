import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/client/calendar")({
  beforeLoad: () => {
    throw redirect({
      to: "/client/videos",
      search: { tab: "calendar" },
    });
  },
});
