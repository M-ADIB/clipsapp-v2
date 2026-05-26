/**
 * useUndoRedo — in-memory undo/redo stack for grid cell edits.
 *
 * Each entry captures `{ rowId, columnId, prev, next }` and the column ref
 * (so we can replay through useGridMutations.updateCell).
 *
 * Features:
 *   - Toast feedback on undo/redo so user knows what happened
 *   - Duplicate guard: skips push if the last entry is identical
 */
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import type { GridColumn } from "./types";

export interface UndoEntry {
  rowId: string;
  column: GridColumn;
  prev: unknown;
  next: unknown;
}

interface UseUndoRedoArgs {
  apply: (entry: UndoEntry, direction: "undo" | "redo") => void;
}

function isDuplicateEntry(a: UndoEntry | undefined, b: UndoEntry): boolean {
  if (!a) return false;
  return (
    a.rowId === b.rowId && a.column.id === b.column.id && a.next === b.next && a.prev === b.prev
  );
}

export function useUndoRedo({ apply }: UseUndoRedoArgs) {
  const [past, setPast] = useState<UndoEntry[]>([]);
  const [future, setFuture] = useState<UndoEntry[]>([]);
  // Ref to check last entry without triggering re-renders
  const lastEntryRef = useRef<UndoEntry | undefined>(undefined);

  const push = useCallback((entry: UndoEntry) => {
    // Skip duplicate consecutive entries (e.g. rapid blur + enter)
    if (isDuplicateEntry(lastEntryRef.current, entry)) return;
    lastEntryRef.current = entry;
    setPast((p) => [...p, entry].slice(-100));
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const entry = p[p.length - 1];
      apply(entry, "undo");
      setFuture((f) => [entry, ...f]);
      toast.info(`Undo: ${entry.column.label} restored`, { duration: 2000 });
      lastEntryRef.current = undefined;
      return p.slice(0, -1);
    });
  }, [apply]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const [entry, ...rest] = f;
      apply(entry, "redo");
      setPast((p) => [...p, entry]);
      toast.info(`Redo: ${entry.column.label} applied`, { duration: 2000 });
      lastEntryRef.current = entry;
      return rest;
    });
  }, [apply]);

  const reset = useCallback(() => {
    setPast([]);
    setFuture([]);
    lastEntryRef.current = undefined;
  }, []);

  return {
    push,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
