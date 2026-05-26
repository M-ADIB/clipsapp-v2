/**
 * VersionSelector — compact dropdown shown in the preview header.
 *
 * Lists all video_versions and lets moderators switch the active one.
 * Switching swaps the player source AND scopes comments/annotations.
 */
import { Check, ChevronDown, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { getVersionLabel, type VideoVersion } from "./hooks/use-video-versions";

interface VersionSelectorProps {
  versions: VideoVersion[];
  selectedId: string | null;
  onSelect: (versionId: string) => void;
  canManage?: boolean;
  onSetCurrent?: (versionId: string) => void;
  compact?: boolean;
}

export function VersionSelector({
  versions,
  selectedId,
  onSelect,
  canManage = false,
  onSetCurrent,
  compact = false,
}: VersionSelectorProps) {
  if (versions.length === 0) return null;

  const selected = versions.find((v) => v.id === selectedId) ?? versions[versions.length - 1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-8 gap-1.5 text-white hover:bg-white/15", compact && "h-7 px-2")}
        >
          <GitBranch className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{getVersionLabel(selected)}</span>
          {selected.is_current && (
            <span className="text-[10px] uppercase tracking-wide text-primary-glow">live</span>
          )}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel>Versions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {versions
          .slice()
          .reverse()
          .map((v) => {
            const isSelected = v.id === selected.id;
            return (
              <DropdownMenuItem
                key={v.id}
                onSelect={() => onSelect(v.id)}
                className="flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-2">
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <span className="w-3.5" />
                  )}
                  <span className="text-sm">{getVersionLabel(v)}</span>
                  {v.is_current && (
                    <span className="text-[10px] uppercase text-primary-glow">live</span>
                  )}
                </span>
                {canManage && !v.is_current && onSetCurrent && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetCurrent(v.id);
                    }}
                    className="h-auto px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground-muted hover:text-foreground"
                    aria-label={`Set ${getVersionLabel(v)} as live`}
                  >
                    Make live
                  </Button>
                )}
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
