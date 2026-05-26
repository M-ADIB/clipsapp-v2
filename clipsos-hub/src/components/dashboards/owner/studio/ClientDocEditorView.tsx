/**
 * ClientDocEditorView — Full-page Rich Text Editor for Client Docs.
 *
 * Provides a Google Docs-like distraction-free writing experience.
 * Stored in client_docs table.
 */
import { useClientDocs, useUpdateClientDoc } from "@/hooks/use-studio";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "./RichTextEditor";
import { Loader2 } from "lucide-react";

interface ClientDocEditorViewProps {
  clientId: string;
  docId: string;
  docTitle: string;
}

export function ClientDocEditorView({ clientId, docId, docTitle }: ClientDocEditorViewProps) {
  const { data: docs, isLoading } = useClientDocs(clientId);
  const updateDoc = useUpdateClientDoc();

  const currentDoc = docs?.find((d) => d.id === docId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 flex-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-full min-h-[500px] w-full flex-1" />
      </div>
    );
  }

  if (!currentDoc) {
    return (
      <div className="flex items-center justify-center py-20 text-foreground-muted text-xs">
        Document not found.
      </div>
    );
  }

  // Parse document content
  const docContent = currentDoc.content;
  let initialContent: string | Record<string, unknown> = "";
  if (
    docContent &&
    typeof docContent === "object" &&
    "type" in (docContent as Record<string, unknown>)
  ) {
    initialContent = docContent as Record<string, unknown>;
  } else if (typeof docContent === "string") {
    initialContent = docContent;
  }

  const handleSave = (json: Record<string, unknown>) => {
    updateDoc.mutate({
      id: docId,
      clientId,
      content: json,
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 select-text">
      {/* Document Header Panel */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full select-none">
            Document
          </span>
          <h2 className="text-sm font-semibold text-foreground-strong truncate">
            {docTitle}
          </h2>
        </div>
        {updateDoc.isPending && (
          <span className="text-[10px] text-foreground-disabled flex items-center gap-1 select-none">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving changes...
          </span>
        )}
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-220px)] border border-border rounded-xl overflow-hidden bg-surface-card">
        <RichTextEditor
          content={initialContent}
          placeholder={`Write content strategies, scripts, hooks, or notes for "${docTitle}" here...`}
          onSave={handleSave}
          minHeight="calc(100vh - 260px)"
        />
      </div>
    </div>
  );
}
