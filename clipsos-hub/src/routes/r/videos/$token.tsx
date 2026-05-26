/**
 * Public multi-video review — /r/videos/$token
 *
 * Loads a share link with scope='videos', then lets the guest scroll through
 * the selected videos via the modal's queue navigation.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { VideoPreviewModal, GuestGateDialog } from "@/components/video/preview";

export const Route = createFileRoute("/r/videos/$token")({
  head: () => ({
    meta: [{ title: "Review videos" }, { name: "robots", content: "noindex" }],
  }),
  component: GuestVideosReview,
});

interface ShareLink {
  target_ids: string[] | null;
  expires_at: string | null;
  is_active: boolean | null;
  allow_download: boolean | null;
  allow_comments: boolean | null;
}

function GuestVideosReview() {
  const { token } = Route.useParams();
  const [link, setLink] = useState<ShareLink | null>(null);
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
        .select("target_ids, expires_at, is_active, allow_download, allow_comments")
        .eq("token", token)
        .maybeSingle();
      if (cancel) return;
      if (e || !data) return setError("This link is invalid or has been removed.");
      if (!data.is_active) return setError("This link has been deactivated.");
      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        return setError("This link has expired.");
      }
      setLink(data as ShareLink);
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

  const ids = link?.target_ids ?? [];
  if (!link || ids.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        {link ? "No videos in this link." : "Loading…"}
      </div>
    );
  }

  if (!guestInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <GuestGateDialog onComplete={(info) => setGuestInfo(info)} videoTitle="these videos" />
      </div>
    );
  }

  return (
    <VideoPreviewModal
      open={open}
      onOpenChange={setOpen}
      videoId={ids[index] ?? null}
      mode="guest"
      canDownload={!!link.allow_download}
      canComment={!!link.allow_comments}
      queue={{
        ids,
        currentIndex: index,
        onNavigate: (next) => setIndex(next),
      }}
    />
  );
}
