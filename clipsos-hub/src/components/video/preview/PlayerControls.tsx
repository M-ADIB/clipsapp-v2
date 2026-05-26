/**
 * PlayerControls — transport controls for the preview player.
 *
 * Desktop (Frame.io-style): in document flow below the video.
 *   Timeline → controls bar with 3 groups:
 *     LEFT:   Play | Loop | Speed | Volume (expand-on-hover)
 *     CENTER: Detailed timecode display + format selector
 *     RIGHT:  View settings (HD/Guides/Zoom) | Keyboard shortcuts | Fullscreen
 *
 * Mobile: absolute overlay at the bottom (legacy behavior preserved).
 */
import { useRef, useState } from "react";
import { ChevronDown, Maximize, Pause, Play, Repeat, Volume2, VolumeX } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { VideoPlayerState } from "./hooks/use-video-player";
import { formatDuration, formatTime, type TimeDisplayFormat } from "./lib/format";
import { KeyboardShortcutsPanel } from "./KeyboardShortcutsPanel";
import { ViewSettingsPopover, type GuideAspect, type ZoomMode } from "./ViewSettingsPopover";

/** The action buttons (now used in the sidebar composer). */
export type ToolAction = "section" | "comment" | "annotate" | "voice";

interface PlayerControlsProps {
  player: VideoPlayerState;
  isMobile: boolean;
  isVisible: boolean;
  /** Optional overlay rendered on top of the scrub slider (e.g. comment pins). */
  timelineOverlay?: React.ReactNode;
  /** Current time display format (controlled by parent for sharing with composer). */
  timeDisplayFormat?: TimeDisplayFormat;
  /** Callback when user changes the time display format. */
  onTimeDisplayFormatChange?: (format: TimeDisplayFormat) => void;
  /** View settings state — guides. */
  guide?: GuideAspect;
  onGuideChange?: (guide: GuideAspect) => void;
  showMask?: boolean;
  onShowMaskChange?: (show: boolean) => void;
  zoom?: ZoomMode;
  onZoomChange?: (zoom: ZoomMode) => void;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const TIME_FORMATS: { value: TimeDisplayFormat; label: string }[] = [
  { value: "timecode", label: "Timecode" },
  { value: "standard", label: "Standard" },
  { value: "frames", label: "Frames" },
];

export function PlayerControls({
  player,
  isMobile,
  isVisible,
  timelineOverlay,
  timeDisplayFormat = "timecode",
  onTimeDisplayFormatChange,
  guide = "off",
  onGuideChange,
  showMask = false,
  onShowMaskChange,
  zoom = "fit",
  onZoomChange,
}: PlayerControlsProps) {
  const [scrubbing, setScrubbing] = useState<number | null>(null);
  const [volumeExpanded, setVolumeExpanded] = useState(false);
  const volumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayTime = scrubbing ?? player.currentTime;
  const progressPct = player.duration > 0 ? (displayTime / player.duration) * 100 : 0;

  const collapseVolume = () => {
    volumeTimerRef.current = setTimeout(() => setVolumeExpanded(false), 400);
  };
  const expandVolume = () => {
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    setVolumeExpanded(true);
  };

  /* ─── Shared timeline ───────────────────────────────────────────── */
  const timelineJsx = (
    <div className="relative">
      <Slider
        value={[progressPct]}
        min={0}
        max={100}
        step={0.1}
        onValueChange={(v) => {
          if (!player.duration) return;
          setScrubbing((v[0] / 100) * player.duration);
        }}
        onValueCommit={(v) => {
          if (!player.duration) return;
          player.seek((v[0] / 100) * player.duration);
          setScrubbing(null);
        }}
        className="cursor-pointer"
      />
      {timelineOverlay}
    </div>
  );

  /* ─── Mobile: absolute overlay (unchanged) ──────────────────────── */
  if (isMobile) {
    return (
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 to-transparent transition-opacity duration-300",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="space-y-2 px-3 pb-3 pt-2">
          {timelineJsx}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  player.togglePlay();
                }}
                className="h-8 w-8 text-white hover:bg-white/15"
                aria-label={player.isPlaying ? "Pause" : "Play"}
              >
                {player.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
            <div className="font-mono text-xs text-white/90">
              {formatDuration(displayTime)} / {formatDuration(player.duration)}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  player.toggleMute();
                }}
                className="h-8 w-8 text-white hover:bg-white/15"
                aria-label={player.isMuted || player.volume === 0 ? "Unmute" : "Mute"}
              >
                {player.isMuted || player.volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  player.toggleFullscreen();
                }}
                className="h-8 w-8 text-white hover:bg-white/15"
                aria-label="Toggle fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Desktop: document-flow bar below the video ────────────────── */
  return (
    <div className="z-20 border-t border-white/10 bg-black/95 px-4 pb-2 pt-1">
      {/* Timeline — extra bottom padding (pb-7) reserves space for comment pins below the track */}
      <div className="pb-7 pt-1">{timelineJsx}</div>

      {/* Controls row: LEFT | CENTER | RIGHT */}
      <div className="flex items-center text-white">
        {/* ─── LEFT GROUP: Play, Loop, Speed, Volume ─────────────── */}
        <div className="flex items-center gap-1">
          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              player.togglePlay();
            }}
            className="h-8 w-8 text-white hover:bg-white/15"
            aria-label={player.isPlaying ? "Pause" : "Play"}
          >
            {player.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {/* Loop toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              player.toggleLoop();
            }}
            className={cn(
              "h-8 w-8 hover:bg-white/15",
              player.isLooping ? "text-primary" : "text-white/60 hover:text-white",
            )}
            aria-label={player.isLooping ? "Disable loop" : "Enable loop"}
            aria-pressed={player.isLooping}
          >
            <Repeat className="h-4 w-4" />
          </Button>

          {/* Speed selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="h-8 px-2 text-xs text-white/80 hover:bg-white/15 hover:text-white"
                aria-label={`Playback speed: ${player.playbackRate}×`}
              >
                {player.playbackRate}×
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-[200]">
              {PLAYBACK_RATES.map((rate) => (
                <DropdownMenuItem
                  key={rate}
                  onClick={() => player.setPlaybackRate(rate)}
                  className={cn("text-xs", rate === player.playbackRate && "bg-accent")}
                >
                  {rate}×
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Volume: icon-only by default, expands slider on hover */}
          <div
            className="flex items-center"
            onMouseEnter={expandVolume}
            onMouseLeave={collapseVolume}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (volumeExpanded) {
                  player.toggleMute();
                } else {
                  expandVolume();
                }
              }}
              className="h-8 w-8 text-white/80 hover:bg-white/15 hover:text-white"
              aria-label={player.isMuted || player.volume === 0 ? "Unmute" : "Mute"}
            >
              {player.isMuted || player.volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                volumeExpanded ? "w-20 opacity-100" : "w-0 opacity-0",
              )}
            >
              <Slider
                value={[player.isMuted ? 0 : player.volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(v) => player.setVolume(v[0])}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* ─── CENTER: Timecode display + format selector ──────────── */}
        <div className="flex flex-1 items-center justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-white/10"
                aria-label="Time display format"
              >
                <span className="font-mono text-sm font-medium tracking-wider text-white/90">
                  {formatTime(displayTime, timeDisplayFormat)}
                </span>
                <span className="text-white/30 font-mono text-xs">/</span>
                <span className="font-mono text-xs text-white/50">
                  {formatTime(player.duration, timeDisplayFormat)}
                </span>
                <ChevronDown className="h-3 w-3 text-white/40" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="center"
              side="top"
              className="z-[200] w-40 border-white/10 bg-[#1e1e22]/95 p-1 shadow-2xl backdrop-blur-xl"
            >
              {TIME_FORMATS.map((fmt) => (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => onTimeDisplayFormatChange?.(fmt.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors",
                    timeDisplayFormat === fmt.value
                      ? "bg-white/10 text-primary"
                      : "text-white/80 hover:bg-white/10",
                  )}
                >
                  <span>{fmt.label}</span>
                  {timeDisplayFormat === fmt.value && (
                    <span className="text-primary text-xs">✓</span>
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* ─── RIGHT GROUP: View Settings | Shortcuts | Fullscreen ────── */}
        <div className="flex items-center gap-1">
          {/* View settings (Quality / Guides / Zoom) */}
          <ViewSettingsPopover
            qualityLevels={player.qualityLevels}
            currentQualityLevel={player.currentQualityLevel}
            onQualityChange={player.setQualityLevel}
            guide={guide}
            onGuideChange={onGuideChange ?? (() => {})}
            showMask={showMask}
            onShowMaskChange={onShowMaskChange ?? (() => {})}
            zoom={zoom}
            onZoomChange={onZoomChange ?? (() => {})}
          />

          {/* Keyboard shortcuts */}
          <KeyboardShortcutsPanel />

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              player.toggleFullscreen();
            }}
            className="h-8 w-8 text-white hover:bg-white/15"
            aria-label="Toggle fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
