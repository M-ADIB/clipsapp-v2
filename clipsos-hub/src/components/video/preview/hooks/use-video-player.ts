/**
 * useVideoPlayer — wraps a <video> element with HLS.js for Cloudflare Stream.
 *
 * Returns a stable API for play, pause, seek, volume, mute, fullscreen, etc.
 * Handles HLS.js lifecycle (attach, destroy) and falls back to native HLS on
 * Safari (which supports it directly).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

export interface HlsQualityLevel {
  /** -1 = auto, otherwise hls.js level index */
  index: number;
  height: number | null;
  bitrate: number | null;
  label: string;
}

export interface VideoPlayerState {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  isLooping: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isFullscreen: boolean;
  qualityLevels: HlsQualityLevel[];
  /** -1 means auto */
  currentQualityLevel: number;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  setPlaybackRate: (rate: number) => void;
  setQualityLevel: (index: number) => void;
  toggleFullscreen: () => void;
  retry: () => void;
}

interface UseVideoPlayerOptions {
  manifestUrl: string | null;
  containerRef: React.RefObject<HTMLElement | null>;
  autoPlay?: boolean;
}

export function useVideoPlayer({
  manifestUrl,
  containerRef,
  autoPlay = true,
}: UseVideoPlayerOptions): VideoPlayerState {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [qualityLevels, setQualityLevels] = useState<HlsQualityLevel[]>([]);
  const [currentQualityLevel, setCurrentQualityLevelState] = useState<number>(-1);

  // ─── Source attachment (HLS.js or native) ─────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);

    // Tear down any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const canPlayNative = video.canPlayType("application/vnd.apple.mpegurl") !== "";

    if (canPlayNative) {
      // Set crossOrigin before src for proper CORS handling
      video.crossOrigin = "anonymous";
      video.src = manifestUrl;

      // Safari handles adaptive streaming natively — we can't switch
      // quality levels, but we detect the active resolution so the UI
      // shows something meaningful.
      const onNativeLoaded = () => {
        const h = video.videoHeight;
        if (h > 0) {
          setQualityLevels([{ index: 0, height: h, bitrate: null, label: `${h}p` }]);
          setCurrentQualityLevelState(-1); // "Auto"
        }
      };
      // Try to detect resolution changes (quality shifts)
      const onNativeResize = () => {
        const h = video.videoHeight;
        if (h > 0) {
          setQualityLevels((prev) => {
            // Only add if we don't already have this resolution
            if (prev.some((l) => l.height === h)) return prev;
            const next = [
              ...prev,
              { index: prev.length, height: h, bitrate: null, label: `${h}p` },
            ].sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
            return next;
          });
        }
      };
      video.addEventListener("loadedmetadata", onNativeLoaded);
      video.addEventListener("resize", onNativeResize);

      return () => {
        video.removeEventListener("loadedmetadata", onNativeLoaded);
        video.removeEventListener("resize", onNativeResize);
        video.removeAttribute("src");
        video.load();
        setQualityLevels([]);
        setCurrentQualityLevelState(-1);
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hlsRef.current = hls;
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels: HlsQualityLevel[] = hls.levels.map((lvl, idx) => ({
          index: idx,
          height: lvl.height ?? null,
          bitrate: lvl.bitrate ?? null,
          label: lvl.height
            ? `${lvl.height}p`
            : lvl.bitrate
              ? `${Math.round(lvl.bitrate / 1000)}kbps`
              : `Level ${idx}`,
        }));
        setQualityLevels(levels);
        setCurrentQualityLevelState(-1);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        // Only mirror state when user has not pinned a level (auto mode).
        if (hls.autoLevelEnabled) {
          setCurrentQualityLevelState(-1);
        } else {
          setCurrentQualityLevelState(data.level);
        }
      });
      let recoveryAttempts = 0;
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        recoveryAttempts++;
        // Allow up to 2 recovery attempts before giving up
        if (recoveryAttempts > 2) {
          setHasError(true);
          setErrorMessage(`Playback failed: ${data.details ?? "unknown error"}`);
          return;
        }
        // Attempt recovery based on error type
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.warn("[HLS] fatal network error, attempting recovery…", data.details);
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn("[HLS] fatal media error, attempting recovery…", data.details);
            hls.recoverMediaError();
            break;
          default:
            setHasError(true);
            setErrorMessage(data.details ?? "Playback failed");
            break;
        }
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
        setQualityLevels([]);
        setCurrentQualityLevelState(-1);
      };
    }

    setHasError(true);
    setErrorMessage("HLS playback not supported in this browser");
  }, [manifestUrl, retryToken]);

  // ─── <video> event listeners ───────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsLoading(false);
    };
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolumeState(video.volume);
    };
    const onError = () => {
      // On Safari native HLS, transient network hiccups can trigger
      // MediaError MEDIA_ERR_NETWORK (code 2). Don't immediately give up —
      // Safari often retries internally for adaptive streams.
      const code = video.error?.code;
      const message = video.error?.message ?? "";
      console.warn("[VideoPlayer] <video> error:", { code, message, src: video.src });

      // MEDIA_ERR_SRC_NOT_SUPPORTED (4) = definitely broken
      // MEDIA_ERR_DECODE (3) = codec issue, unlikely to self-heal
      // MEDIA_ERR_NETWORK (2) = transient, Safari may recover
      // MEDIA_ERR_ABORTED (1) = user-initiated, ignore
      if (code === 4 || code === 3) {
        setHasError(true);
        setErrorMessage(code === 4 ? "This video format is not supported" : "Video decoding error");
        setIsLoading(false);
      } else if (code === 2) {
        // Network error — give the native player a moment, then fail
        // so the user can click "Try again"
        setTimeout(() => {
          if (video.error) {
            setHasError(true);
            setErrorMessage("Network error — check your connection and try again");
            setIsLoading(false);
          }
        }, 3000);
      }
      // code === 1 (ABORTED) — ignore, not a real error
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("error", onError);
    };
  }, [manifestUrl]);

  // ─── Auto-play once when ready ────────────────────────────────────────
  const hasAutoPlayedRef = useRef(false);
  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [manifestUrl]);

  useEffect(() => {
    if (!autoPlay || isLoading || hasError || hasAutoPlayedRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    hasAutoPlayedRef.current = true;
    video.play().catch(() => {
      // Browsers block autoplay with sound — try muted
      video.muted = true;
      video.play().catch(() => {});
    });
  }, [autoPlay, hasError, isLoading]);

  // ─── Fullscreen tracking ──────────────────────────────────────────────
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ─── Action API ───────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const play = useCallback(() => videoRef.current?.play().catch(() => {}), []);
  const pause = useCallback(() => videoRef.current?.pause(), []);

  const seek = useCallback((time: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(time, v.duration || time));
  }, []);

  const skip = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + seconds, v.duration || 0));
  }, []);

  const setVolume = useCallback((value: number) => {
    const v = videoRef.current;
    if (!v) return;
    const clamped = Math.max(0, Math.min(1, value));
    v.volume = clamped;
    if (clamped > 0) v.muted = false;
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  }, []);

  const toggleLoop = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.loop = !v.loop;
    setIsLooping(v.loop);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRateState(rate);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const target = containerRef.current ?? videoRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void target.requestFullscreen();
    }
  }, [containerRef]);

  const retry = useCallback(() => {
    setRetryToken((t) => t + 1);
  }, []);

  const setQualityLevel = useCallback((index: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    // -1 = auto. hls.currentLevel = -1 hands control back to the ABR engine.
    hls.currentLevel = index;
    setCurrentQualityLevelState(index);
  }, []);

  return useMemo(
    () => ({
      videoRef,
      isPlaying,
      isMuted,
      isLooping,
      isLoading,
      isBuffering,
      hasError,
      errorMessage,
      currentTime,
      duration,
      volume,
      playbackRate,
      isFullscreen,
      qualityLevels,
      currentQualityLevel,
      togglePlay,
      play,
      pause,
      seek,
      skip,
      setVolume,
      toggleMute,
      toggleLoop,
      setPlaybackRate,
      setQualityLevel,
      toggleFullscreen,
      retry,
    }),
    [
      isPlaying,
      isMuted,
      isLooping,
      isLoading,
      isBuffering,
      hasError,
      errorMessage,
      currentTime,
      duration,
      volume,
      playbackRate,
      isFullscreen,
      qualityLevels,
      currentQualityLevel,
      togglePlay,
      play,
      pause,
      seek,
      skip,
      setVolume,
      toggleMute,
      toggleLoop,
      setPlaybackRate,
      setQualityLevel,
      toggleFullscreen,
      retry,
    ],
  );
}
