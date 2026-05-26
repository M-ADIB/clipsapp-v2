/**
 * CycleTabs — horizontal tab strip above the Videos Grid.
 *
 * Tabs: All Videos | All Shoots | Cycle 1 | Cycle 2 | … | + New cycle
 * - Visible whenever the grid is scoped to a single client.
 * - "All Shoots" is a planned filter (videos without a cycle).
 * - Active tab is controlled by the parent (URL-synced).
 */
import { Plus, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCycle, useCyclesForClient } from "@/hooks/use-cycles";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { useAuth } from "@/contexts/AuthContext";

export type CycleTabValue = "all" | "shoots" | string; // string = cycle id

interface CycleTabsProps {
  clientId: string;
  /** First project's id — required to create a new cycle. Optional. */
  defaultProjectId?: string | null;
  value: CycleTabValue;
  onChange: (next: CycleTabValue) => void;
  canManage: boolean;
}

export function CycleTabs({
  clientId,
  defaultProjectId,
  value,
  onChange,
  canManage,
}: CycleTabsProps) {
  const { data: cycles = [], isLoading } = useCyclesForClient(clientId);
  const create = useCreateCycle(clientId);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { role } = useAuth();

  const activeCycle = cycles.find((c) => c.id === value);
  const canShareCycle = !!activeCycle;

  const handleCreate = async () => {
    if (!defaultProjectId) {
      toast.error("Project required to create a cycle");
      return;
    }
    await create.mutateAsync({ projectId: defaultProjectId, name });
    setName("");
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-4 py-1.5">
      <TabBtn active={value === "all"} onClick={() => onChange("all")}>
        All Videos
      </TabBtn>
      <TabBtn active={value === "shoots"} onClick={() => onChange("shoots")}>
        All Shoots
      </TabBtn>
      {!isLoading &&
        cycles.map((c) => (
          <TabBtn key={c.id} active={value === c.id} onClick={() => onChange(c.id)}>
            {c.name}
          </TabBtn>
        ))}
      {canManage && defaultProjectId ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className="ml-1 flex h-7 items-center gap-1 rounded-md px-2 text-xs text-foreground-muted hover:bg-foreground/[0.06]"
              aria-label="Add cycle"
            >
              <Plus className="h-3.5 w-3.5" />
              New cycle
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground-strong">New cycle</p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional name (e.g. Cycle 4)"
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreate();
                }}
              />
              <Button
                onClick={handleCreate}
                disabled={create.isPending}
                size="sm"
                className="w-full"
              >
                {create.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
      {canShareCycle && (
        <button
          onClick={() => setShareOpen(true)}
          className="ml-auto flex h-7 items-center gap-1 rounded-md px-2 text-xs text-foreground-muted hover:bg-foreground/[0.06]"
          title="Share this cycle"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share cycle
        </button>
      )}
      {activeCycle && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          target={{ scope: "cycle", cycleId: activeCycle.id, cycleName: activeCycle.name }}
          role={role}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-7 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors",
        active
          ? "bg-foreground/[0.10] text-foreground-strong"
          : "text-foreground-muted hover:bg-foreground/[0.06] hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
