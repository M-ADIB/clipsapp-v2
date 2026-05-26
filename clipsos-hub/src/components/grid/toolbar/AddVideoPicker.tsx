/**
 * AddVideoPicker — popover that lets owners/managers pick a client when
 * adding a video from the all-tenant view (where scope.clientId is unset).
 */
import { useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useClients } from "@/hooks/use-clients";

interface AddVideoPickerProps {
  onPick: (clientId: string) => void;
  disabled?: boolean;
}

export function AddVideoPicker({ onPick, disabled }: AddVideoPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: clients = [], isLoading } = useClients();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 md:px-3.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Video</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <div className="flex items-center border-b border-border px-2">
            <Search className="h-3.5 w-3.5 text-foreground-disabled" />
            <CommandInput placeholder="Add video for…" className="h-9 border-0 text-xs" />
          </div>
          <CommandList>
            <CommandEmpty>{isLoading ? "Loading…" : "No clients found"}</CommandEmpty>
            <CommandGroup>
              {clients.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => {
                    onPick(c.id);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
