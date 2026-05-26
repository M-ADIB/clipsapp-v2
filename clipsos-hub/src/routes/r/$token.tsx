/**
 * Public single-video review — /r/$token
 *
 * Loads the share link by token, validates it's active and unexpired, and
 * renders the VideoPreviewModal in guest mode with the configured
 * permissions (allow_download, allow_comments).
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { VideoPreviewModal, GuestGateDialog } from "@/components/video/preview";

export const Route = createFileRoute("/r/$token")({
  head: () => ({
    meta: [{ title: "Review video" }, { name: "robots", content: "noindex" }],
  }),
  component: GuestVideoReview,
});

interface ShareLink {
  video_id: string | null;
  scope: string | null;
  expires_at: string | null;
  is_active: boolean | null;
  allow_download: boolean | null;
  allow_comments: boolean | null;
}

function GuestVideoReview() {
  const { token } = Route.useParams();
  const [link, setLink] = useState<ShareLink | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        .select("video_id, scope, expires_at, is_active, allow_download, allow_comments")
        .eq("token", token)
        .maybeSingle();
      if (cancel) return;
      if (e || !data) {
        setError("This link is invalid or has been removed.");
        return;
      }
      if (!data.is_active) {
        setError("This link has been deactivated.");
        return;
      }
      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        setError("This link has expired.");
        return;
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

  if (!link || !link.video_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading…
      </div>
    );
  }

  if (!guestInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <GuestGateDialog onComplete={(info) => setGuestInfo(info)} />
      </div>
    );
  }

  return (
    <VideoPreviewModal
      open={open}
      onOpenChange={setOpen}
      videoId={link.video_id}
      mode="guest"
      canDownload={!!link.allow_download}
      canComment={!!link.allow_comments}
    />
  );
}
