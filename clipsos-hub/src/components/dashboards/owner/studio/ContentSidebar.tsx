/**
 * ContentSidebar — Left sidebar within the Content tab.
 *
 * Shows:
 *  - Foundation (standalone)
 *  - Docs section (dynamic list + Create new Doc)
 *  - Content Cycles section (dynamic list + Create new Cycle)
 */
import { useState } from "react";
import {
  useClientCycles,
  useCreateCycle,
  useClientDocs,
  useCreateClientDoc,
  useUpdateClientDoc,
  useDeleteClientDoc,
} from "@/hooks/use-studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Trash2, Edit2, Check, X, FileText, Settings, Heart } from "lucide-react";
import type { Cycle } from "@/integrations/supabase/db-types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SidebarView =
  | { type: "foundation" }
  | { type: "doc"; docId: string; docTitle: string }
  | { type: "cycle"; cycle: Cycle };

interface ContentSidebarProps {
  clientId: string;
  projectId: string | undefined;
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

export function ContentSidebar({
  clientId,
  projectId,
  activeView,
  onViewChange,
}: ContentSidebarProps) {
  const { role } = useAuth();
  const isTeam = role !== "client";

  // Cycle hooks
  const { data: cycles, isLoading: cyclesLoading } = useClientCycles(clientId);
  const createCycle = useCreateCycle();
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState("");

  // Doc hooks
  const { data: docs, isLoading: docsLoading } = useClientDocs(clientId);
  const createDoc = useCreateClientDoc();
  const updateDoc = useUpdateClientDoc();
  const deleteDoc = useDeleteClientDoc();

  // Rename Doc state
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");

  // Delete confirm state
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState<string | null>(null);

  // Handle Create Doc
  const handleCreateDoc = async () => {
    try {
      const defaultTitle = `Doc ${Date.now().toString().slice(-4)}`;
      const res = await createDoc.mutateAsync({ clientId, title: defaultTitle });
      if (res && res.id) {
        onViewChange({ type: "doc", docId: res.id, docTitle: res.title });
        setRenamingDocId(res.id);
        setRenameText(res.title);
      }
      toast.success("Document created!");
    } catch {
      toast.error("Failed to create document.");
    }
  };

  // Handle Rename Doc
  const handleRenameDoc = async (docId: string) => {
    if (!renameText.trim()) {
      setRenamingDocId(null);
      return;
    }
    try {
      await updateDoc.mutateAsync({
        id: docId,
        clientId,
        title: renameText.trim(),
      });
      setRenamingDocId(null);
      
      // If currently active view is this doc, update the active title state
      if (activeView.type === "doc" && activeView.docId === docId) {
        onViewChange({ type: "doc", docId, docTitle: renameText.trim() });
      }
    } catch {
      toast.error("Failed to rename document.");
    }
  };

  // Handle Delete Doc
  const handleDeleteDoc = async () => {
    if (!deleteConfirmDocId) return;
    try {
      await deleteDoc.mutateAsync({ id: deleteConfirmDocId, clientId });
      toast.success("Document deleted!");
      
      // If active view was the deleted doc, revert to foundation
      if (activeView.type === "doc" && activeView.docId === deleteConfirmDocId) {
        onViewChange({ type: "foundation" });
      }
      setDeleteConfirmDocId(null);
    } catch {
      toast.error("Failed to delete document.");
    }
  };

  // Handle Create Cycle
  const handleCreateCycle = async () => {
    if (!newCycleName.trim() || !projectId) return;
    try {
      const nextNumber = (cycles?.length ?? 0) + 1;
      await createCycle.mutateAsync({
        client_id: clientId,
        project_id: projectId,
        name: newCycleName.trim(),
        cycle_number: nextNumber,
        order_index: nextNumber - 1,
      });
      setNewCycleName("");
      setCycleDialogOpen(false);
      toast.success("Cycle created!");
    } catch {
      toast.error("Failed to create cycle.");
    }
  };

  const isFoundationActive = activeView.type === "foundation";

  return (
    <aside className="w-[220px] shrink-0 border-r border-border pr-4 space-y-6 select-none">
      {/* Standalone Foundation Link */}
      <div className="space-y-1">
        <button
          onClick={() => onViewChange({ type: "foundation" })}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
            isFoundationActive
              ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(var(--primary-rgb),0.05)]"
              : "text-foreground-muted hover:text-foreground-strong hover:bg-surface-raised border border-transparent"
          }`}
        >
          Foundation
        </button>
      </div>

      {/* Docs Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 mb-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground-disabled">
            Docs
          </h4>
          {isTeam && (
            <button
              onClick={handleCreateDoc}
              disabled={createDoc.isPending}
              className="p-1 rounded text-foreground-disabled hover:text-foreground hover:bg-surface-raised cursor-pointer transition-colors disabled:opacity-50"
              title="Create new Doc"
            >
              {createDoc.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        {docsLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground-disabled" />
          </div>
        )}

        <nav className="space-y-0.5">
          {docs?.map((doc) => {
            const isActive = activeView.type === "doc" && activeView.docId === doc.id;
            const isEditing = renamingDocId === doc.id;

            return (
              <div
                key={doc.id}
                className={`group relative flex items-center w-full rounded-md text-xs transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground-muted hover:text-foreground-strong hover:bg-surface-raised"
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1 w-full p-1">
                    <Input
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      onBlur={() => handleRenameDoc(doc.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameDoc(doc.id);
                        if (e.key === "Escape") setRenamingDocId(null);
                      }}
                      className="h-6 text-xs bg-surface-input border-border py-0.5 px-1.5 focus-visible:ring-1 focus-visible:ring-primary w-full"
                      autoFocus
                    />
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleRenameDoc(doc.id);
                      }}
                      className="p-0.5 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onViewChange({ type: "doc", docId: doc.id, docTitle: doc.title })}
                    onDoubleClick={() => {
                      if (isTeam) {
                        setRenamingDocId(doc.id);
                        setRenameText(doc.title);
                      }
                    }}
                    className="flex-1 text-left px-3 py-1.5 flex items-center gap-2 truncate cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-foreground-disabled" />
                    <span className="truncate">{doc.title}</span>
                  </button>
                )}

                {/* Inline Rename/Delete Actions (strategists only) */}
                {isTeam && !isEditing && (
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent">
                    <button
                      onClick={() => {
                        setRenamingDocId(doc.id);
                        setRenameText(doc.title);
                      }}
                      className="p-1 rounded hover:bg-surface-input text-foreground-disabled hover:text-foreground cursor-pointer"
                      title="Rename Doc"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmDocId(doc.id)}
                      className="p-1 rounded hover:bg-surface-input text-foreground-disabled hover:text-destructive cursor-pointer"
                      title="Delete Doc"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Content Cycles Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 mb-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground-disabled">
            Cycles
          </h4>
          {isTeam && (
            <button
              onClick={() => setCycleDialogOpen(true)}
              className="p-1 rounded text-foreground-disabled hover:text-foreground hover:bg-surface-raised cursor-pointer transition-colors"
              title="Create new Cycle"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>

        {cyclesLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground-disabled" />
          </div>
        )}

        <nav className="space-y-0.5">
          {cycles?.map((cycle) => {
            const isActive = activeView.type === "cycle" && activeView.cycle.id === cycle.id;
            const isActiveCycle =
              !cycle.is_backlog && cycles.filter((c) => !c.is_backlog)[0]?.id === cycle.id;

            return (
              <button
                key={cycle.id}
                onClick={() => onViewChange({ type: "cycle", cycle })}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground-muted hover:text-foreground-strong hover:bg-surface-raised"
                }`}
              >
                <span className="truncate">{cycle.name}</span>
                {isActiveCycle && (
                  <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 shrink-0">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Create Cycle Dialog */}
      {isTeam && (
        <Dialog open={cycleDialogOpen} onOpenChange={setCycleDialogOpen}>
          <DialogContent className="bg-surface-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground-strong">Create New Cycle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cycle-name" className="text-foreground-muted">Cycle Name</Label>
                <Input
                  id="cycle-name"
                  placeholder="e.g. Cycle 3 — Summer Launch"
                  value={newCycleName}
                  onChange={(e) => setNewCycleName(e.target.value)}
                  className="bg-surface-input border-border"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateCycle}
                disabled={!newCycleName.trim() || !projectId || createCycle.isPending}
              >
                {createCycle.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Cycle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Doc Confirm Dialog */}
      {isTeam && (
        <Dialog open={deleteConfirmDocId !== null} onOpenChange={(open) => !open && setDeleteConfirmDocId(null)}>
          <DialogContent className="bg-surface-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground-strong">Delete Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-xs text-foreground-muted leading-relaxed">
                Are you sure you want to delete this document? This action is permanent and cannot be undone.
              </p>
              <DialogFooter className="gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirmDocId(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteDoc}
                  disabled={deleteDoc.isPending}
                  className="text-xs"
                >
                  {deleteDoc.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Delete
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </aside>
  );
}
