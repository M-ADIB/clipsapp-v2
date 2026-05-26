/**
 * StudioTab — Scripts workspace.
 *
 * Displays all scripts for the selected client with search, filter,
 * and create functionality.
 */
import { useState } from "react";
import { useStudioScripts, useCreateScript } from "@/hooks/use-studio";
import { ScriptCard } from "./ScriptCard";
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
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import type { StudioScript } from "@/integrations/supabase/db-types";

interface StudioTabProps {
  clientId: string | undefined;
}

export function StudioTab({ clientId }: StudioTabProps) {
  const { data: scripts, isLoading } = useStudioScripts(clientId);
  const createScript = useCreateScript();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newVideoType, setNewVideoType] = useState("");

  const filteredScripts = scripts?.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.body?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!clientId || !newTitle.trim()) return;
    await createScript.mutateAsync({
      client_id: clientId,
      title: newTitle.trim(),
      body: newBody.trim() || null,
      video_type: newVideoType.trim() || null,
      status: "draft",
    });
    setNewTitle("");
    setNewBody("");
    setNewVideoType("");
    setDialogOpen(false);
  };

  // ── No client selected ──────────────────────────────────────────────────
  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card border border-border mb-4">
          <FileText className="h-7 w-7 text-foreground-muted" />
        </div>
        <p className="text-foreground-muted text-sm">Select a client to start writing scripts</p>
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
            placeholder="Search scripts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-surface-card border-border"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground-strong">New Script</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. Why most founders get branding wrong"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-surface-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Video Type</Label>
                <Input
                  placeholder="e.g. Reach, Nurture, Convert"
                  value={newVideoType}
                  onChange={(e) => setNewVideoType(e.target.value)}
                  className="bg-surface-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  placeholder="Write the script body…"
                  rows={6}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="bg-surface-input border-border resize-none"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!newTitle.trim() || createScript.isPending}
              >
                {createScript.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Script
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
      {!isLoading && (!filteredScripts || filteredScripts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card border border-border mb-4">
            <FileText className="h-7 w-7 text-foreground-muted" />
          </div>
          <h3 className="text-sm font-medium text-foreground-strong mb-1">
            {searchQuery ? "No scripts found" : "No scripts yet"}
          </h3>
          <p className="text-xs text-foreground-muted max-w-[280px]">
            {searchQuery
              ? "Try a different search term"
              : "Create your first script to start building content for this client"}
          </p>
        </div>
      )}

      {/* Scripts grid */}
      {filteredScripts && filteredScripts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredScripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      )}
    </div>
  );
}
