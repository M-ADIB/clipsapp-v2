/**
 * Public cycle review — /r/cycle/$token
 *
 * Loads a share link with scope='cycle', then fetches every video belonging
 * to that cycle and shows them in a guest-mode preview with queue navigation.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { VideoPreviewModal, GuestGateDialog } from "@/components/video/preview";

export const Route = createFileRoute("/r/cycle/$token")({
  head: () => ({
    meta: [{ title: "Review cycle" }, { name: "robots", content: "noindex" }],
  }),
  component: GuestCycleReview,
});

interface ShareLink {
  cycle_id: string | null;
  expires_at: string | null;
  is_active: boolean | null;
  allow_download: boolean | null;
  allow_comments: boolean | null;
}

function GuestCycleReview() {
  const { token } = Route.useParams();
  const [link, setLink] = useState<ShareLink | null>(null);
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const [guestInfo, setGuestInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("guest_reviewer_name");
    const email = localStorage.getItem("guest_reviewer_email");
    if (name && email) {
      setGuestInfo({ name, email });
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data, error: e } = await supabase
        .from("guest_review_links")
        .select("cycle_id, expires_at, is_active, allow_download, allow_comments")
        .eq("token", token)
        .maybeSingle();
      if (cancel) return;
      if (e || !data) return setError("This link is invalid or has been removed.");
      if (!data.is_active) return setError("This link has been deactivated.");
      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        return setError("This link has expired.");
      }
      setLink(data as ShareLink);
      if (data.cycle_id) {
        const { data: vids } = await supabase
          .from("videos")
          .select("id, order_index, created_at")
          .eq("cycle_id", data.cycle_id)
          .is("archived_at", null)
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: true });
        if (cancel) return;
        setVideoIds((vids ?? []).map((v) => v.id));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [token]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6 text-center text-white">
        <div>
          <h1 className="mb-2 text-lg font-semibold">Link unavailable</h1>
          <p className="text-sm text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  if (!link || videoIds.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        {link ? "No videos in this cycle yet." : "Loading…"}
      </div>
    );
  }

  if (!guestInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <GuestGateDialog onComplete={(info) => setGuestInfo(info)} videoTitle="this cycle" />
      </div>
    );
  }

  return (
    <VideoPreviewModal
      open={open}
      onOpenChange={setOpen}
      videoId={videoIds[index] ?? null}
      mode="guest"
      canDownload={!!link.allow_download}
      canComment={!!link.allow_comments}
      queue={{
        ids: videoIds,
        currentIndex: index,
        onNavigate: (next) => setIndex(next),
      }}
    />
  );
}
