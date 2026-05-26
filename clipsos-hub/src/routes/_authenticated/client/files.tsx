import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/client/files")({
  beforeLoad: () => {
    throw redirect({
      to: "/client/videos",
      search: { tab: "library" },
    });
  },
});
