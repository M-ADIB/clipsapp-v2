/**
 * CycleScriptCard — Full-text script card shown within a cycle.
 *
 * Matches the reference screenshot: title line + full body text, no truncation.
 * Example: "AD 1 - General (on camera) (Bobby)"
 */
import type { StudioScript } from "@/integrations/supabase/db-types";
import { Button } from "@/components/ui/button";
import { Check, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CycleScriptCardProps {
  script: StudioScript;
  onEdit?: (script: StudioScript) => void;
  onMarkFilmed?: (script: StudioScript) => void;
}

export function CycleScriptCard({ script, onEdit, onMarkFilmed }: CycleScriptCardProps) {
  // Build the title line: "AD 1 — Title (on camera) (Person)"
  const titleParts: string[] = [];
  if (script.script_type) titleParts.push(script.script_type);
  titleParts.push(script.title);
  if (script.on_camera) titleParts.push(`(on camera) (${script.on_camera})`);
  const displayTitle = titleParts.join(" — ");

  return (
    <div
      className={`rounded-xl border bg-surface-card p-5 transition-all group ${
        script.filmed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border hover:border-border-strong"
      }`}
    >
      {/* Title + Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-foreground-strong leading-snug">
          {displayTitle}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {!script.filmed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-foreground-muted hover:text-emerald-400"
              onClick={() => onMarkFilmed?.(script)}
              title="Mark as filmed"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          {script.filmed && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
              <Check className="h-3 w-3" />
              Filmed
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-card border-border">
              <DropdownMenuItem onClick={() => onEdit?.(script)}>Edit Script</DropdownMenuItem>
              {!script.filmed && (
                <DropdownMenuItem onClick={() => onMarkFilmed?.(script)}>
                  Mark as Filmed
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Full body text — no truncation */}
      {script.body && (
        <div className="text-sm text-foreground-muted leading-relaxed whitespace-pre-line">
          {script.body}
        </div>
      )}
    </div>
  );
}
