/**
 * ViewSettingsPopover — Frame.io-style "HD" popover with Quality, Guides & Zoom.
 *
 * Triggered by an "HD" badge button in the controls bar right group.
 */
import { useState } from "react";
import { ChevronRight, Grid3X3, Maximize, Minimize, Monitor, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { HlsQualityLevel } from "./hooks/use-video-player";

// ─── Types ──────────────────────────────────────────────────────────

export type GuideAspect = "2.35" | "1.85" | "16:9" | "9:16" | "4:3" | "1:1" | "off";
export type ZoomMode = "fit" | "fill" | "100";

interface ViewSettingsPopoverProps {
  qualityLevels: HlsQualityLevel[];
  currentQualityLevel: number;
  onQualityChange: (index: number) => void;
  guide: GuideAspect;
  onGuideChange: (guide: GuideAspect) => void;
  showMask: boolean;
  onShowMaskChange: (show: boolean) => void;
  zoom: ZoomMode;
  onZoomChange: (zoom: ZoomMode) => void;
}

const GUIDES: { value: GuideAspect; label: string }[] = [
  { value: "2.35", label: "2.35:1" },
  { value: "1.85", label: "1.85:1" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "off", label: "Off" },
];

const ZOOM_OPTIONS: { value: ZoomMode; label: string; shortcut: string }[] = [
  { value: "fit", label: "Fit", shortcut: "T" },
  { value: "fill", label: "Fill", shortcut: "Y" },
  { value: "100", label: "Zoom to 100%", shortcut: "⌘0" },
];

export function ViewSettingsPopover({
  qualityLevels,
  currentQualityLevel,
  onQualityChange,
  guide,
  onGuideChange,
  showMask,
  onShowMaskChange,
  zoom,
  onZoomChange,
}: ViewSettingsPopoverProps) {
  const [subMenu, setSubMenu] = useState<"quality" | "guides" | "zoom" | null>(null);

  const currentQLabel =
    currentQualityLevel === -1
      ? "Auto"
      : (qualityLevels.find((l) => l.index === currentQualityLevel)?.label ?? "Auto");

  const guideLabel =
    guide === "off" ? "Off" : (GUIDES.find((g) => g.value === guide)?.label ?? "Off");
  const zoomLabel = ZOOM_OPTIONS.find((z) => z.value === zoom)?.label ?? "Fit";

  const isHD = qualityLevels.some(
    (l) =>
      l.height &&
      l.height >= 720 &&
      (currentQualityLevel === -1 || l.index === currentQualityLevel),
  );

  return (
    <Popover onOpenChange={() => setSubMenu(null)}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1 px-2 text-white/80 hover:bg-white/15 hover:text-white",
            isHD && "text-white",
          )}
          onClick={(e) => e.stopPropagation()}
          aria-label="View settings"
        >
          <Monitor className="h-4 w-4" />
          {isHD && (
            <span className="rounded bg-primary/80 px-1 py-px text-[9px] font-bold uppercase tracking-wider text-white">
              HD
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="z-[200] w-64 border-white/10 bg-[#1e1e22]/95 p-0 shadow-2xl backdrop-blur-xl"
      >
        {subMenu === null && (
          <div className="py-1">
            {/* Quality row */}
            <button
              type="button"
              onClick={() => setSubMenu("quality")}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5 text-white/60" />
                <span>Quality</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/50">{currentQLabel}</span>
                {isHD && (
                  <span className="rounded bg-primary/80 px-1 py-px text-[8px] font-bold text-white">
                    HD
                  </span>
                )}
                <ChevronRight className="h-3 w-3 text-white/40" />
              </div>
            </button>

            {/* Guides row */}
            <button
              type="button"
              onClick={() => setSubMenu("guides")}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-3.5 w-3.5 text-white/60" />
                <span>Guides</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/50">{guideLabel}</span>
                <ChevronRight className="h-3 w-3 text-white/40" />
              </div>
            </button>

            {/* Zoom row */}
            <button
              type="button"
              onClick={() => setSubMenu("zoom")}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Maximize className="h-3.5 w-3.5 text-white/60" />
                <span>Zoom</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/50">{zoomLabel}</span>
                <ChevronRight className="h-3 w-3 text-white/40" />
              </div>
            </button>
          </div>
        )}

        {/* ── Quality sub-menu ───────────────────────────────────── */}
        {subMenu === "quality" && (
          <div className="py-1">
            <button
              type="button"
              onClick={() => setSubMenu(null)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-3 w-3 rotate-180" />
              Quality
            </button>
            <div className="border-t border-white/10 py-1">
              {/* Auto option */}
              <button
                type="button"
                onClick={() => {
                  onQualityChange(-1);
                  setSubMenu(null);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors",
                  currentQualityLevel === -1 ? "text-primary" : "text-white/80 hover:bg-white/10",
                )}
              >
                <span>Auto</span>
                {currentQualityLevel === -1 && <span className="text-primary text-xs">✓</span>}
              </button>
              {qualityLevels.map((level) => (
                <button
                  key={level.index}
                  type="button"
                  onClick={() => {
                    onQualityChange(level.index);
                    setSubMenu(null);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors",
                    currentQualityLevel === level.index
                      ? "text-primary"
                      : "text-white/80 hover:bg-white/10",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{level.label}</span>
                    {level.height && level.height >= 720 && (
                      <span className="rounded bg-white/10 px-1 py-px text-[8px] font-medium text-white/60">
                        HD
                      </span>
                    )}
                  </div>
                  {currentQualityLevel === level.index && (
                    <span className="text-primary text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Guides sub-menu ──────────────────────────────────── */}
        {subMenu === "guides" && (
          <div className="py-1">
            <button
              type="button"
              onClick={() => setSubMenu(null)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-3 w-3 rotate-180" />
              Guides
            </button>
            <div className="border-t border-white/10 py-1">
              {GUIDES.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => {
                    onGuideChange(g.value);
                    setSubMenu(null);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors",
                    guide === g.value ? "text-primary" : "text-white/80 hover:bg-white/10",
                  )}
                >
                  <span>{g.label}</span>
                  {guide === g.value && <span className="text-primary text-xs">✓</span>}
                </button>
              ))}
              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => onShowMaskChange(!showMask)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  <span>Show Mask</span>
                  <div
                    className={cn(
                      "h-4 w-7 rounded-full transition-colors",
                      showMask ? "bg-primary" : "bg-white/20",
                    )}
                  >
                    <div
                      className={cn(
                        "h-3 w-3 translate-y-0.5 rounded-full bg-white transition-transform shadow-sm",
                        showMask ? "translate-x-3.5" : "translate-x-0.5",
                      )}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Zoom sub-menu ────────────────────────────────────── */}
        {subMenu === "zoom" && (
          <div className="py-1">
            <button
              type="button"
              onClick={() => setSubMenu(null)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-3 w-3 rotate-180" />
              Zoom
            </button>
            <div className="border-t border-white/10 py-1">
              {ZOOM_OPTIONS.map((z) => (
                <button
                  key={z.value}
                  type="button"
                  onClick={() => {
                    onZoomChange(z.value);
                    setSubMenu(null);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors",
                    zoom === z.value ? "text-primary" : "text-white/80 hover:bg-white/10",
                  )}
                >
                  <span>{z.label}</span>
                  <div className="flex items-center gap-2">
                    <kbd className="text-[10px] text-white/40">{z.shortcut}</kbd>
                    {zoom === z.value && <span className="text-primary text-xs">✓</span>}
                  </div>
                </button>
              ))}
              <div className="border-t border-white/10 mt-1 pt-1 flex items-center justify-center gap-2 px-3 py-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => onZoomChange("100")}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-white/50 min-w-[36px] text-center">
                  {zoom === "100" ? "100%" : zoom === "fill" ? "Fill" : "Fit"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => onZoomChange("100")}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
