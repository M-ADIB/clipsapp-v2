/**
 * CycleScriptsList — Full-page freeform editor for a cycle with
 * "Save as Script" flow.
 *
 * The cycle is a writing pad. You write freely, then "Save as Script"
 * to convert the current content into a named script. Two options:
 *   - "Save & Clear" → saves as script, clears editor
 *   - "Save & Keep Writing" → saves as script, keeps editor content
 *
 * Saved scripts appear as a collapsible list below the editor.
 */
import { useState, useRef, useCallback } from "react";
import { FileText, Film, Loader2, RotateCcw, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./RichTextEditorLazy";
import { useCycleScripts, useCreateScript, useUpdateScript } from "@/hooks/use-studio";
import type { Json } from "@/integrations/supabase/types";

interface CycleScriptsListProps {
  cycleId: string;
  cycleName: string;
  clientId: string;
  tenantId: string;
}

export function CycleScriptsList({
  cycleId,
  cycleName,
  clientId,
  tenantId,
}: CycleScriptsListProps) {
  const { data: scripts, isLoading } = useCycleScripts(cycleId);
  const createScript = useCreateScript();
  const updateScript = useUpdateScript();

  // Editor content (TipTap JSON) — held in local state for the save flow
  const [editorJson, setEditorJson] = useState<Record<string, unknown> | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scriptTitle, setScriptTitle] = useState("");
  const [expandedScriptId, setExpandedScriptId] = useState<string | null>(null);

  // Key to force-remount the editor after clearing
  const editorResetKey = useRef(0);

  const handleEditorSave = useCallback((json: Record<string, unknown>) => {
    setEditorJson(json);
  }, []);

  const handleCreateScript = async (clearAfter: boolean) => {
    if (!scriptTitle.trim() || !editorJson) return;

    await createScript.mutateAsync(
      {
        title: scriptTitle.trim(),
        client_id: clientId,
        cycle_id: cycleId,
        body_json: editorJson as Json,
      },
      {
        onSuccess: () => {
          setScriptTitle("");
          setSaveDialogOpen(false);
          if (clearAfter) {
            setEditorJson(null);
            editorResetKey.current += 1;
          }
        },
      },
    );
  };

  const handleToggleFilmed = (scriptId: string, filmed: boolean) => {
    updateScript.mutate({ id: scriptId, filmed });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 flex-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-full min-h-[400px] w-full flex-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{cycleName}</h3>
          <p className="text-sm text-foreground-muted">
            Write freely, then save your ideas as scripts.
            {scripts && scripts.length > 0 && (
              <span className="ml-1">
                · {scripts.length} script{scripts.length !== 1 ? "s" : ""} saved
              </span>
            )}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          disabled={!editorJson}
          className="gap-1.5"
        >
          <FileText className="h-3.5 w-3.5" />
          Save as Script
        </Button>
      </div>

      {/* ── Full-page freeform editor ────────────────── */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-380px)]">
        <RichTextEditor
          key={editorResetKey.current}
          content=""
          placeholder={`Write freely for "${cycleName}" — ideas, hooks, angles, scripts… When you're ready, hit "Save as Script" to turn it into a script.`}
          onSave={handleEditorSave}
          minHeight="calc(100vh - 440px)"
        />
      </div>

      {/* ── Saved Scripts list ────────────────────────── */}
      {scripts && scripts.length > 0 && (
        <div className="shrink-0 border-t border-border pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
            Saved Scripts ({scripts.length})
          </h4>
          <div className="space-y-1.5">
            {scripts.map((script) => {
              const isExpanded = expandedScriptId === script.id;

              return (
                <div
                  key={script.id}
                  className={cn(
                    "border border-border rounded-lg bg-surface-card transition-all",
                    isExpanded && "ring-1 ring-primary/30",
                  )}
                >
                  {/* Script header */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent/5 transition-colors"
                    onClick={() => setExpandedScriptId(isExpanded ? null : script.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-foreground-muted shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-foreground-muted shrink-0" />
                    )}

                    <span className="flex-1 font-medium text-sm text-foreground truncate">
                      {script.title}
                    </span>

                    {script.filmed && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-emerald-500/40 text-emerald-400 gap-1"
                      >
                        <Film className="h-3 w-3" />
                        Filmed
                      </Badge>
                    )}
                  </button>

                  {/* Expanded: editor + filmed toggle */}
                  {isExpanded && (
                    <div className="px-3 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between py-2 px-1 border-t border-border/50">
                        <span className="text-xs text-foreground-muted flex items-center gap-1.5">
                          <Film className="h-3.5 w-3.5" />
                          Filmed
                        </span>
                        <Switch
                          checked={script.filmed ?? false}
                          onCheckedChange={(checked) => handleToggleFilmed(script.id, checked)}
                        />
                      </div>

                      <RichTextEditor
                        content={(script.body_json as Record<string, unknown>) ?? script.body ?? ""}
                        placeholder={`Write freely for "${script.title}"…`}
                        onSave={(json) =>
                          updateScript.mutate({
                            id: script.id,
                            body_json: json as Json,
                          })
                        }
                        minHeight="200px"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── "Save as Script" Dialog ──────────────────── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="bg-surface-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground-strong flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Save as Script
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-foreground-muted">
            Give this script a name. Your current editor content will be saved as its body.
          </p>

          <Input
            autoFocus
            placeholder="Script title…"
            value={scriptTitle}
            onChange={(e) => setScriptTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && scriptTitle.trim() && handleCreateScript(true)}
            className="bg-surface-input border-border"
          />

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 gap-1.5"
              onClick={() => handleCreateScript(true)}
              disabled={!scriptTitle.trim() || createScript.isPending}
            >
              {createScript.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Save & Clear
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => handleCreateScript(false)}
              disabled={!scriptTitle.trim() || createScript.isPending}
            >
              {createScript.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Save & Keep Writing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
