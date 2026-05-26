/**
 * StudioDashboard — Owner > Studio
 *
 * Two-state layout:
 *   State A (default): Table view of all clients with overview metrics
 *   State B (drill-in): Client detail with sidebar navigation
 *                        (Foundation, Pillars, Audience, Cycles)
 *
 * The back-bar has been replaced with a compact client switcher dropdown
 * so you can switch between clients without going back to the table view.
 *
 * Uses V2 design tokens only.
 */
import { useState, useEffect, useRef } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { StudioClientsTable } from "./studio/StudioClientsTable";
import { ContentTab } from "./studio/ContentTab";
import { BrainTab } from "./studio/BrainTab";
import { ResourcesTab } from "./studio/ResourcesTab";
import { ChevronDown, LayoutList, Search, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "Content", label: "Content" },
  { key: "Client Brain", label: "Client Brain" },
  { key: "Resources", label: "Resources" },
] as const;

export function StudioDashboard() {
  const { headerConfig, setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { tenantId } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();

  const activeTab = headerConfig?.activeTab || "Content";

  // Fetch all clients for the switcher dropdown
  const { data: allClients } = useQuery({
    queryKey: ["studio-clients-list", tenantId],
    queryFn: async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, name, account_status")
        .eq("tenant_id", tenantId!)
        .order("name");
      return data ?? [];
    },
    enabled: !!tenantId,
  });

  // Selected client data (derived from allClients to avoid extra query)
  const selectedClient = allClients?.find((c) => c.id === selectedClientId);

  // Update header based on whether a client is selected
  useEffect(() => {
    if (selectedClientId) {
      setHeaderConfig({
        title: "Studio",
        tabs: TABS.map((t) => ({ key: t.key, label: t.label })),
        activeTab: "Content",
      });
    } else {
      setHeaderConfig({
        title: "Studio",
        tabs: [],
        activeTab: undefined,
      });
    }
    return () => clearHeaderConfig();
  }, [selectedClientId, setHeaderConfig, clearHeaderConfig]);

  const handleBack = () => {
    setSelectedClientId(undefined);
  };

  // ── State A: Table landing page ──────────────────────────────────
  if (!selectedClientId) {
    return (
      <FullBleed>
        <div className="px-3 py-5 md:px-5 md:py-6">
          <StudioClientsTable onSelectClient={setSelectedClientId} />
        </div>
      </FullBleed>
    );
  }

  // ── State B: Client detail view ──────────────────────────────────
  return (
    <FullBleed>
      <div className="flex flex-col gap-5 w-full px-3 py-5 md:px-5 md:py-6">
        {/* Client Switcher Dropdown */}
        <ClientSwitcher
          clients={allClients ?? []}
          selectedId={selectedClientId}
          selectedName={selectedClient?.name}
          selectedStatus={selectedClient?.account_status}
          onSelect={setSelectedClientId}
          onAllClients={handleBack}
        />

        {/* Tab content */}
        <div className="min-h-[400px]">
          {activeTab === "Content" && <ContentTab clientId={selectedClientId} />}
          {activeTab === "Client Brain" && <BrainTab clientId={selectedClientId} />}
          {activeTab === "Resources" && <ResourcesTab clientId={selectedClientId} />}
        </div>
      </div>
    </FullBleed>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Client Switcher Dropdown                                                */
/* ──────────────────────────────────────────────────────────────────────── */

interface ClientSwitcherProps {
  clients: Array<{ id: string; name: string; account_status: string | null }>;
  selectedId: string;
  selectedName?: string;
  selectedStatus?: string | null;
  onSelect: (clientId: string) => void;
  onAllClients: () => void;
}

function ClientSwitcher({
  clients,
  selectedId,
  selectedName,
  selectedStatus,
  onSelect,
  onAllClients,
}: ClientSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const statusDot = (status: string | null | undefined) => {
    const color =
      status === "active"
        ? "bg-emerald-500"
        : status === "paused"
          ? "bg-amber-500"
          : status === "onboarding"
            ? "bg-blue-500"
            : "bg-foreground-muted";
    return <span className={cn("inline-flex h-2 w-2 rounded-full shrink-0", color)} />;
  };

  return (
    <div ref={ref} className="relative inline-flex">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border",
          "bg-surface-card hover:bg-surface-raised transition-colors",
          "text-sm font-medium text-foreground-strong",
          open && "ring-1 ring-primary/40 border-primary/40",
        )}
      >
        {statusDot(selectedStatus)}
        <span className="truncate max-w-[200px]">{selectedName || "Select Client"}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-foreground-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-[280px] rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
            <Search className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="flex-1 text-sm bg-transparent text-foreground placeholder:text-foreground-subtle focus:outline-none"
            />
          </div>

          {/* All Clients row */}
          <button
            type="button"
            onClick={() => {
              onAllClients();
              setOpen(false);
              setSearch("");
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground-muted hover:bg-surface-raised hover:text-foreground transition-colors border-b border-border"
          >
            <LayoutList className="h-3.5 w-3.5" />
            <span>All Clients</span>
            <span className="ml-auto text-[10px] text-foreground-subtle">Table View</span>
          </button>

          {/* Client list */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-xs text-foreground-muted text-center">
                No clients found
              </p>
            )}
            {filtered.map((client) => {
              const isSelected = client.id === selectedId;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    onSelect(client.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors",
                    isSelected
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-foreground-strong hover:bg-surface-raised",
                  )}
                >
                  {statusDot(client.account_status)}
                  <span className="truncate">{client.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 ml-auto text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
