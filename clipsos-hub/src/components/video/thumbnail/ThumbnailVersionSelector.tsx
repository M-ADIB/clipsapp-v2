/**
 * ThumbnailVersionSelector — dropdown showing all thumbnail versions.
 *
 * Displays version number, uploader name, upload date, and a "current" badge.
 * Click to switch the displayed thumbnail in the dialog.
 */
import { Check, ChevronDown, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

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

import { getThumbnailVersionLabel, type ThumbnailVersion } from "./hooks/use-thumbnail-versions";

interface ThumbnailVersionSelectorProps {
  versions: ThumbnailVersion[];
  selectedId: string | null;
  onSelect: (versionId: string) => void;
}

export function ThumbnailVersionSelector({
  versions,
  selectedId,
  onSelect,
}: ThumbnailVersionSelectorProps) {
  if (versions.length === 0) return null;

  const selected = versions.find((v) => v.id === selectedId) ?? versions[versions.length - 1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 hover:bg-accent">
          <ImageIcon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{getThumbnailVersionLabel(selected)}</span>
          {selected.is_current && (
            <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">
              current
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[240px]">
        <DropdownMenuLabel>Thumbnail Versions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {versions
          .slice()
          .reverse()
          .map((v) => {
            const isSelected = v.id === selected.id;
            const uploaderName = v.uploader?.display_name ?? v.uploader?.full_name ?? null;
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
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm flex items-center gap-1.5">
                      {getThumbnailVersionLabel(v)}
                      {v.is_current && (
                        <span className="text-[10px] uppercase text-primary font-semibold">
                          current
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-foreground-muted">
                      {uploaderName && `${uploaderName} · `}
                      {v.uploaded_at
                        ? format(new Date(v.uploaded_at), "MMM d, yyyy")
                        : format(new Date(v.created_at), "MMM d, yyyy")}
                    </span>
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
