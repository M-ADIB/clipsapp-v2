/**
 * ClientStep — Step 0 of the Project Builder.
 *
 * Lets users select a client for the project, or skip entirely
 * to build a template without a client assignment.
 */

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Check, Search, SkipForward } from "lucide-react";

const PAGE_SIZE = 10;

export interface ClientStepProps {
  clients: Array<{ id: string; name: string; logo_url?: string | null }>;
  loading: boolean;
  selectedId: string;
  search: string;
  onSearchChange: (q: string) => void;
  onSelect: (id: string, name: string) => void;
}

export function ClientStep({
  clients,
  loading,
  selectedId,
  search,
  onSearchChange,
  onSelect,
}: ClientStepProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when search changes
  const handleSearch = useCallback(
    (q: string) => {
      onSearchChange(q);
      setVisibleCount(PAGE_SIZE);
    },
    [onSearchChange],
  );

  const visibleClients = useMemo(() => clients.slice(0, visibleCount), [clients, visibleCount]);

  const remaining = clients.length - visibleCount;

  return (
    <div className="space-y-4">
      {/* Skip option for template-only flow */}
      <button
        onClick={() => onSelect("", "")}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] px-4 py-3 text-left transition-all hover:border-primary/50 hover:bg-primary/[0.06]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <SkipForward className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">Skip — build template only</span>
          <p className="text-[11px] text-foreground-muted">
            Create a reusable service template without assigning a client
          </p>
        </div>
      </button>

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
        {!loading && clients.length > 0 && (
          <span className="shrink-0 text-[11px] text-foreground-muted">
            {Math.min(visibleCount, clients.length)} of {clients.length}
          </span>
        )}
      </div>

      {/* Client grid */}
      <div className="grid gap-2 sm:grid-cols-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))
        ) : clients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="mb-3 h-10 w-10 text-foreground-muted/40" />
            <p className="text-sm text-foreground-muted">
              {search ? "No clients match your search" : "No clients found"}
            </p>
          </div>
        ) : (
          visibleClients.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelect(client.id, client.name)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                selectedId === client.id
                  ? "border-primary bg-primary/[0.06] shadow-sm ring-1 ring-primary/20"
                  : "border-white/[0.08] hover:border-white/20 hover:bg-surface-raised"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-xs font-semibold uppercase text-foreground-muted">
                {client.logo_url ? (
                  <img
                    src={client.logo_url}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  client.name.slice(0, 2)
                )}
              </div>
              <span className="flex-1 truncate text-sm font-medium">{client.name}</span>
              {selectedId === client.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))
        )}
      </div>

      {/* Show more */}
      {remaining > 0 && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] py-2.5 text-xs font-medium text-foreground-muted transition-colors hover:border-white/20 hover:bg-surface-raised hover:text-foreground"
        >
          Show {Math.min(remaining, PAGE_SIZE)} more
          <span className="text-foreground-disabled">({remaining} remaining)</span>
        </button>
      )}
    </div>
  );
}
