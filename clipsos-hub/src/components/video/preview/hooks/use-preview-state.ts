/**
 * usePreviewState — orchestrates version/trial selection, playback source
 * resolution, controls auto-hide, body scroll lock, and focus trapping.
 *
 * Extracted from VideoPreviewModal to reduce its cognitive footprint.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { useVideoPlayer } from "./use-video-player";
import { useVideoVersions } from "./use-video-versions";
import { useTrialReels, type TrialReel } from "./use-trial-reels";
import { getCloudflareId, getHlsManifestUrl } from "../lib/cloudflare-stream";

interface UsePreviewStateOptions {
  open: boolean;
  videoId: string | null;
  isMobile: boolean;
  /** The raw video row — used as fallback source when no version/trial. */
  video:
    | {
        video_cloudflare_id?: string | null;
        video_playback_url?: string | null;
        video_thumbnail_url?: string | null;
      }
    | null
    | undefined;
}

export function usePreviewState({ open, videoId, isMobile, video }: UsePreviewStateOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Versions ────────────────────────────────────────────────────── */
  const { versions, currentVersion, setCurrentVersion } = useVideoVersions(open ? videoId : null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (currentVersion && !selectedVersionId) {
      setSelectedVersionId(currentVersion.id);
    }
  }, [open, currentVersion, selectedVersionId]);

  useEffect(() => {
    if (!open) setSelectedVersionId(null);
  }, [open, videoId]);

  const activeVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId) ?? currentVersion,
    [versions, selectedVersionId, currentVersion],
  );

  /* ─── Trials ──────────────────────────────────────────────────────── */
  const { trials, isLoading: trialsLoading } = useTrialReels(open ? videoId : null);
  const [activeTrial, setActiveTrial] = useState<TrialReel | null>(null);
  useEffect(() => {
    if (!open) setActiveTrial(null);
  }, [open, videoId]);

  /* ─── Playback source resolution ──────────────────────────────────── */
  const playbackMedia = useMemo(() => {
    if (activeTrial) {
      return {
        video_cloudflare_id: activeTrial.hook_cloudflare_id,
        video_playback_url: activeTrial.hook_playback_url,
        video_thumbnail_url: activeTrial.hook_thumbnail_url,
      };
    }
    // Only use version data if it actually has a playback source
    if (activeVersion?.video_cloudflare_id || activeVersion?.video_playback_url) {
      return {
        video_cloudflare_id: activeVersion.video_cloudflare_id,
        video_playback_url: activeVersion.video_playback_url,
        video_thumbnail_url: activeVersion.video_thumbnail_url,
      };
    }
    return video ?? null;
  }, [activeTrial, activeVersion, video]);

  const manifestUrl = useMemo(
    () => (playbackMedia ? getHlsManifestUrl(playbackMedia) : null),
    [playbackMedia],
  );
  const cloudflareId = useMemo(() => getCloudflareId(playbackMedia), [playbackMedia]);

  const player = useVideoPlayer({
    manifestUrl,
    containerRef,
    autoPlay: open,
  });

  /* ─── Auto-hide controls ──────────────────────────────────────────── */
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!isMobile && player.isPlaying && !player.isBuffering) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2_500);
    }
  }, [isMobile, player.isPlaying, player.isBuffering]);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showControls, player.isPlaying]);

  /* ─── Body scroll lock ────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ─── Focus trap ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const root = document.getElementById("root");
    if (root) root.setAttribute("inert", "");
    requestAnimationFrame(() => containerRef.current?.focus());
    return () => {
      if (root) root.removeAttribute("inert");
    };
  }, [open]);

  return {
    containerRef,
    // Versions
    versions,
    currentVersion,
    setCurrentVersion,
    selectedVersionId,
    setSelectedVersionId,
    // Trials
    trials,
    trialsLoading,
    activeTrial,
    setActiveTrial,
    // Playback
    player,
    manifestUrl,
    cloudflareId,
    // Controls
    controlsVisible,
    showControls,
  };
}
