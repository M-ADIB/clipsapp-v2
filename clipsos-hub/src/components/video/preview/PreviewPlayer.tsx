/**
 * PreviewPlayer — <video> element + overlays (loading, buffering, error).
 *
 * The actual HLS attachment + state lives in `useVideoPlayer`. This component
 * is purely presentational and forwards the videoRef.
 */
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoPlayerState } from "./hooks/use-video-player";

interface PreviewPlayerProps {
  player: VideoPlayerState;
  onPrimaryClick?: () => void;
}

export function PreviewPlayer({ player, onPrimaryClick }: PreviewPlayerProps) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
      onClick={onPrimaryClick}
    >
      <video
        ref={player.videoRef}
        className="h-full w-full object-contain"
        playsInline
        crossOrigin="anonymous"
      />

      {player.isLoading && !player.hasError && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
          <p className="text-sm text-white/80">Loading…</p>
        </div>
      )}

      {player.isBuffering && !player.isLoading && !player.hasError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/60 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
      )}

      {player.hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90">
          <div className="rounded-full bg-destructive/20 p-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-sm font-medium text-white">
            {player.errorMessage ?? "Video failed to load"}
          </p>
          <p className="mt-1 max-w-xs text-center text-xs text-white/50">
            If this persists, try refreshing the page
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              player.retry();
            }}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
