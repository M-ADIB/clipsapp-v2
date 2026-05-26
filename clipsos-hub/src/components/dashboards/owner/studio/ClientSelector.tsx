/**
 * ClientSelector — Dropdown to pick the active client workspace.
 *
 * Fetches all active clients for the tenant and renders a popover combobox.
 */
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClients } from "@/hooks/use-clients";
import { Loader2 } from "lucide-react";

interface ClientSelectorProps {
  selectedClientId: string | undefined;
  onSelect: (clientId: string) => void;
}

export function ClientSelector({ selectedClientId, onSelect }: ClientSelectorProps) {
  const { data: clients, isLoading } = useClients();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-foreground-muted text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading clients…
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return <div className="text-sm text-foreground-muted">No clients yet</div>;
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <Select value={selectedClientId ?? ""} onValueChange={onSelect}>
      <SelectTrigger className="w-[260px] bg-surface-card border-border">
        <SelectValue placeholder="Select a client…">
          {selectedClient && (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedClient.logo_url ?? undefined} />
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  {selectedClient.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedClient.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-surface-card border-border">
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={client.logo_url ?? undefined} />
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  {client.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{client.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
