/**
 * FilesTab — Placeholder for files linked to this person.
 * Currently shows empty state since there's no dedicated person-files table yet.
 */

import { FileText } from "lucide-react";

export function FilesTab() {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised">
        <FileText className="h-8 w-8 text-foreground-disabled" />
      </div>
      <p className="text-sm font-medium text-foreground-muted">No files</p>
      <p className="text-xs text-foreground-disabled">
        Files linked to this person will appear here when available.
      </p>
    </div>
  );
}
