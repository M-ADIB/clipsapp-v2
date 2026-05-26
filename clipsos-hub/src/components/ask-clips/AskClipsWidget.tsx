/**
 * AskClipsWidget — the trigger button + Popover/Dialog wrapper.
 *
 * - Renders the same "Ask Clips" chip the TopNav already had.
 * - ⌘K / Ctrl+K toggles open/close from anywhere.
 * - Compact mode: Popover anchored to the chip.
 * - Expanded mode: Dialog at 95vw × 90vh.
 */
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AskClipsPanel } from "./AskClipsPanel";
import { ClipsIcon } from "./ClipsIcon";

export function AskClipsWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => {
    setOpen(false);
    setExpanded(false);
  };
  const toggleExpand = () => setExpanded((v) => !v);

  const trigger = (
    <button
      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:bg-surface-input/50 hover:text-foreground md:px-2.5"
      aria-label="Ask Clips (⌘K)"
      title="Ask Clips (⌘K)"
    >
      <ClipsIcon size={14} className="text-primary" />
      <span className="hidden md:inline">Ask Clips</span>
    </button>
  );

  return (
    <>
      <Popover
        open={open && !expanded}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setExpanded(false);
        }}
      >
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[420px] max-w-[calc(100vw-1rem)] overflow-hidden border-border p-0 shadow-2xl"
        >
          <AskClipsPanel onClose={close} expanded={false} onToggleExpand={toggleExpand} />
        </PopoverContent>
      </Popover>

      <Dialog
        open={open && expanded}
        onOpenChange={(v) => {
          if (!v) {
            setExpanded(false);
            setOpen(false);
          }
        }}
      >
        <DialogContent className="h-[90vh] w-[95vw] max-w-[900px] gap-0 overflow-hidden border-border p-0 [&>button]:hidden">
          <AskClipsPanel onClose={close} expanded onToggleExpand={toggleExpand} />
        </DialogContent>
      </Dialog>
    </>
  );
}
