/**
 * NotesTab — Editable notes + description.
 */

import { useState } from "react";
import { Edit3, Save, StickyNote } from "lucide-react";

interface NotesTabProps {
  notes: string | null;
  description: string | null;
  onSave: (notes: string) => void;
  isSaving: boolean;
}

export function NotesTab({ notes, description, onSave, isSaving }: NotesTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(notes ?? "");

  const handleEdit = () => {
    setValue(notes ?? "");
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  const hasContent = !!notes || !!description;

  return (
    <div className="space-y-6">
      {/* ── Description (read-only) ── */}
      {description && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Description
          </h3>
          <div className="rounded-lg border border-border bg-surface-card p-4">
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground-muted">
              {description}
            </p>
          </div>
        </div>
      )}

      {/* ── Editable Notes ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
            Notes
          </h3>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-foreground-muted transition-colors hover:bg-surface-raised"
            >
              <Edit3 className="h-3 w-3" /> Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-border bg-surface-card p-3 text-xs text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none resize-none"
              placeholder="Add notes about this contact…"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-3 w-3" /> {isSaving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-md px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:bg-surface-raised"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface-card p-4 min-h-[120px]">
            {notes ? (
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground-muted">
                {notes}
              </p>
            ) : (
              <p className="text-xs italic text-foreground-disabled">
                No notes yet. Click edit to add notes.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Empty State ── */}
      {!hasContent && !isEditing && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised">
            <StickyNote className="h-8 w-8 text-foreground-disabled" />
          </div>
          <p className="text-sm font-medium text-foreground-muted">No notes</p>
          <p className="text-xs text-foreground-disabled">
            Add a note to keep track of important details.
          </p>
          <button
            onClick={handleEdit}
            className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + New note
          </button>
        </div>
      )}
    </div>
  );
}
