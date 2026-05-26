/**
 * useVideoDownload — calls the `download-media` edge function and triggers
 * a native browser download via a hidden iframe.
 *
 * Two phases:
 *  1. Resolve URL via JSON request (with 202/retry support).
 *  2. Navigate a hidden iframe to the edge function in `?stream=true` mode
 *     so the browser receives `Content-Disposition: attachment` and starts
 *     a real download (no JS bytes-shuffling).
 */
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

interface DownloadInput {
  videoId: string;
  videoTitle: string | null;
  cloudflareId?: string | null;
  directUrl?: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const MAX_RETRIES = 3;

export function useVideoDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(
    async ({ videoId, videoTitle, cloudflareId, directUrl }: DownloadInput) => {
      if (isDownloading) return;
      setIsDownloading(true);
      toast.loading("Preparing download…", { id: "video-download" });

      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) throw new Error("Not authenticated");

        const safeName = (videoTitle || "video").replace(/[^a-zA-Z0-9.-]/g, "_") + ".mp4";

        const params = new URLSearchParams({ filename: safeName, videoId });
        if (cloudflareId) params.set("cloudflareId", cloudflareId);
        if (directUrl) params.set("directUrl", directUrl);

        const headers: Record<string, string> = {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.access_token}`,
          Accept: "application/json",
        };

        let attempt = 0;
        let resolvedUrl: string | null = null;
        let source = "unknown";

        while (attempt <= MAX_RETRIES) {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 15_000);
          const res = await fetch(
            `${SUPABASE_URL}/functions/v1/download-media?${params.toString()}`,
            { headers, signal: ctrl.signal },
          );
          clearTimeout(t);

          if (res.status === 202) {
            attempt++;
            if (attempt > MAX_RETRIES) {
              toast.info("Video still processing — try again in a minute", {
                id: "video-download",
              });
              return;
            }
            const body = await res.json().catch(() => ({}));
            const wait = (body.retryAfterSeconds ?? 10) * 1000;
            toast.loading(`Preparing… (attempt ${attempt}/${MAX_RETRIES})`, {
              id: "video-download",
            });
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Download failed (${res.status})`);
          }

          const data = await res.json();
          resolvedUrl = data.downloadUrl;
          source = data.source ?? "unknown";
          break;
        }

        if (!resolvedUrl) throw new Error("Could not resolve download URL");

        // Trigger native download via hidden iframe in stream mode
        const streamParams = new URLSearchParams(params);
        streamParams.set("stream", "true");
        streamParams.set("token", session.access_token);
        const streamUrl = `${SUPABASE_URL}/functions/v1/download-media?${streamParams.toString()}`;

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = streamUrl;
        document.body.appendChild(iframe);
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {
            /* already removed */
          }
        }, 60_000);

        toast.success(source.includes("r2") ? "Original quality ✅" : "Compressed (Stream)", {
          id: "video-download",
          description: `Downloading ${safeName}`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Download failed";
        toast.error("Failed to download video", {
          id: "video-download",
          description: message,
        });
      } finally {
        setIsDownloading(false);
      }
    },
    [isDownloading],
  );

  return { download, isDownloading };
}
