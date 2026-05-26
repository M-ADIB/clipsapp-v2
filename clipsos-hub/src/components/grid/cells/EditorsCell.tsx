/**
 * EditorsCell — avatar stack with a popover picker.
 *
 * Reads from `video_editors` (already loaded in useGridRows for the row),
 * writes via the `editors:assign` action exposed by useGridMutations.
 */
import { Check, Plus } from "lucide-react";
import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useTenantEditors } from "../core/useTenantEditors";

interface EditorsCellProps {
  value: string[];
  isReadOnly: boolean;
  onCommit: (next: string[]) => void;
  density?: "compact" | "regular" | "comfortable";
}

function initials(name: string | null | undefined, fallback: string) {
  if (!name) return fallback.slice(0, 2).toUpperCase();
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function EditorsCellInner({ value, isReadOnly, onCommit, density }: EditorsCellProps) {
  const [open, setOpen] = useState(false);
  const { data: editors = [] } = useTenantEditors();
  const selectedSet = new Set(value);
  const selected = editors.filter((e) => selectedSet.has(e.id));

  const toggle = (id: string) => {
    if (isReadOnly) return;
    const next = selectedSet.has(id) ? value.filter((v) => v !== id) : [...value, id];
    onCommit(next);
  };

  // Density-specific spacing and scaling helper classes
  const containerClass = density === "compact"
    ? "px-2 gap-0.5"
    : density === "comfortable"
      ? "px-4 gap-1.5"
      : "px-3 gap-1";

  const unassignedTextClass = density === "compact"
    ? "text-[10px]"
    : density === "comfortable"
      ? "text-sm"
      : "text-xs";

  const plusIconSize = density === "compact"
    ? "h-2.5 w-2.5"
    : density === "comfortable"
      ? "h-3.5 w-3.5"
      : "h-3 w-3";

  const avatarSizeClass = density === "compact"
    ? "h-5 w-5 text-[8px] ring-1 ring-background"
    : density === "comfortable"
      ? "h-8 w-8 text-xs ring-2 ring-background"
      : "h-6 w-6 text-[10px] ring-2 ring-background";

  return (
    <Popover open={open} onOpenChange={isReadOnly ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isReadOnly}
          className={cn("flex h-full w-full items-center text-left transition-colors hover:bg-foreground/[0.04]", containerClass)}
        >
          {selected.length === 0 && (
            <span className={cn("flex items-center gap-1 text-foreground-disabled italic", unassignedTextClass)}>
              <Plus className={plusIconSize} />
              Unassigned
            </span>
          )}
          {selected.slice(0, 3).map((e) => (
            <span
              key={e.id}
              title={e.full_name ?? ""}
              className={cn("flex items-center justify-center rounded-full bg-primary/15 font-semibold text-primary", avatarSizeClass)}
            >
              {e.avatar_url ? (
                <img
                  src={e.avatar_url}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials(e.full_name, e.id)
              )}
            </span>
          ))}
          {selected.length > 3 && (
            <span className={cn("text-foreground-muted font-medium", unassignedTextClass)}>+{selected.length - 3}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search editors…" />
          <CommandList>
            <CommandEmpty>No editors found.</CommandEmpty>
            <CommandGroup>
              {editors.map((e) => {
                const isOn = selectedSet.has(e.id);
                return (
                  <CommandItem
                    key={e.id}
                    onSelect={() => toggle(e.id)}
                    className="flex items-center gap-2"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                      {e.avatar_url ? (
                        <img
                          src={e.avatar_url}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        initials(e.full_name, e.id)
                      )}
                    </span>
                    <span className="flex-1 truncate">{e.full_name ?? "Unnamed"}</span>
                    <Check
                      className={cn("h-3.5 w-3.5", isOn ? "opacity-100 text-primary" : "opacity-0")}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
