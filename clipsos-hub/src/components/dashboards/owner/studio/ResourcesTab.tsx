/**
 * ResourcesTab — Hooks Library.
 *
 * Displays studio hooks with search, filter, and create functionality.
 */
import { useState } from "react";
import { useStudioHooks, useCreateHook } from "@/hooks/use-studio";
import { HookCard } from "./HookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Zap, Loader2 } from "lucide-react";

interface ResourcesTabProps {
  clientId: string | undefined;
}

export function ResourcesTab({ clientId }: ResourcesTabProps) {
  const { data: hooks, isLoading } = useStudioHooks(clientId);
  const createHook = useCreateHook();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHookText, setNewHookText] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSource, setNewSource] = useState("");

  const filteredHooks = hooks?.filter(
    (h) =>
      h.hook_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!clientId || !newHookText.trim()) return;
    await createHook.mutateAsync({
      client_id: clientId,
      hook_text: newHookText.trim(),
      category: newCategory.trim() || null,
      source: newSource.trim() || null,
    });
    setNewHookText("");
    setNewCategory("");
    setNewSource("");
    setDialogOpen(false);
  };

  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card border border-border mb-4">
          <Zap className="h-7 w-7 text-foreground-muted" />
        </div>
        <p className="text-foreground-muted text-sm">
          Select a client to browse their hooks library
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search hooks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-surface-card border-border"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Hook
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground-strong">Add Hook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hook Text</Label>
                <Textarea
                  placeholder='e.g. "Stop scrolling if you…"'
                  rows={3}
                  value={newHookText}
                  onChange={(e) => setNewHookText(e.target.value)}
                  className="bg-surface-input border-border resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="e.g. Question, Shock, Curiosity"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-surface-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Input
                  placeholder="e.g. Competitor, Original, Client"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="bg-surface-input border-border"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!newHookText.trim() || createHook.isPending}
              >
                {createHook.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Hook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!filteredHooks || filteredHooks.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card border border-border mb-4">
            <Zap className="h-7 w-7 text-foreground-muted" />
          </div>
          <h3 className="text-sm font-medium text-foreground-strong mb-1">
            {searchQuery ? "No hooks found" : "No hooks yet"}
          </h3>
          <p className="text-xs text-foreground-muted max-w-[280px]">
            {searchQuery
              ? "Try a different search term"
              : "Build your hooks library — great hooks make great content"}
          </p>
        </div>
      )}

      {/* Hooks list */}
      {filteredHooks && filteredHooks.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredHooks.map((hook) => (
            <HookCard key={hook.id} hook={hook} />
          ))}
        </div>
      )}
    </div>
  );
}
