/**
 * CycleEditor — Full-page freeform editor for a cycle.
 *
 * This is the new Cycle writing surface:
 *   • Single infinite RichTextEditor with ScriptToggle extension enabled
 *   • Users write freely, then highlight text → right-click → "Save as Script"
 *   • Scripts become inline collapsible toggle blocks (first line = title)
 *   • Content auto-saves on blur to cycles.body_json
 *   • No separate script list, no save dialog
 */
import { useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "./RichTextEditorLazy";
import { useUpdateCycleBody, useCycleBody } from "@/hooks/use-studio";
import type { Json } from "@/integrations/supabase/types";

interface CycleEditorProps {
  cycleId: string;
  cycleName: string;
  clientId: string;
  tenantId: string;
}

export function CycleEditor({ cycleId, cycleName, clientId, tenantId }: CycleEditorProps) {
  const { data: bodyJson, isLoading } = useCycleBody(cycleId);
  const updateBody = useUpdateCycleBody();

  // Key to force-remount the editor when switching cycles
  const editorKey = useRef(cycleId);
  if (editorKey.current !== cycleId) {
    editorKey.current = cycleId;
  }

  const handleSave = useCallback(
    (json: Record<string, unknown>) => {
      updateBody.mutate({
        cycleId,
        body_json: json as Json,
      });
    },
    [cycleId, updateBody],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 flex-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-full min-h-[400px] w-full flex-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2">
      {/* ── Full-page freeform editor with script toggles ── */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-320px)]">
        <RichTextEditor
          key={editorKey.current}
          content={bodyJson ?? ""}
          placeholder={`Write freely for "${cycleName}" — ideas, hooks, angles, scripts…\n\nHighlight text and right-click → "Save as Script" to create inline collapsible script blocks.`}
          onSave={handleSave}
          minHeight="calc(100vh - 380px)"
          enableScriptToggle
        />
      </div>
    </div>
  );
}
