/**
 * KeyboardShortcutsPanel — Frame.io-style keyboard shortcut overlay.
 *
 * Triggered by a ⌨ icon button in the controls bar right group.
 * Lists all available keyboard shortcuts for the preview modal.
 */
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Shortcut {
  label: string;
  keys: string[];
}

const SHORTCUTS: Shortcut[] = [
  { label: "Submit comment", keys: ["Enter"] },
  { label: "Play / Pause", keys: ["Space"] },
  { label: "2 seconds back", keys: ["←"] },
  { label: "2 seconds forward", keys: ["→"] },
  { label: "Frame back", keys: ["Shift", "←"] },
  { label: "Frame forward", keys: ["Shift", "→"] },
  { label: "Add comment", keys: ["C"] },
  { label: "Draw / Annotate", keys: ["D"] },
  { label: "Voice memo", keys: ["V"] },
  { label: "Section mode", keys: ["R"] },
  { label: "Toggle mute", keys: ["M"] },
  { label: "Toggle fullscreen", keys: ["F"] },
  { label: "Close modal", keys: ["Esc"] },
];

export function KeyboardShortcutsPanel() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/80 hover:bg-white/15 hover:text-white"
          aria-label="Keyboard shortcuts"
          onClick={(e) => e.stopPropagation()}
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="z-[200] w-72 border-white/10 bg-[#1e1e22]/95 p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Keyboard className="h-4 w-4 text-white/60" />
            Keyboard shortcuts
          </div>
        </div>
        <div className="max-h-[320px] overflow-y-auto px-4 py-2">
          {SHORTCUTS.map((sc) => (
            <div key={sc.label} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-white/70">{sc.label}</span>
              <div className="flex items-center gap-1">
                {sc.keys.map((key, i) => (
                  <span key={i}>
                    {i > 0 && <span className="mx-0.5 text-white/30">&</span>}
                    <kbd className="inline-flex h-5 min-w-[24px] items-center justify-center rounded border border-white/20 bg-white/10 px-1.5 text-[10px] font-medium text-white/80">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
