/**
 * useDashboardView — reusable hook for dashboard table column
 * visibility and filter state management.
 *
 * Stores state in localStorage so user preferences persist across
 * sessions. Each dashboard instance gets its own storage key.
 */
import { useCallback, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DashboardColumn {
  /** Unique column key matching the data field */
  key: string;
  /** Display label for the header */
  label: string;
  /** CSS width (e.g. "180px") */
  width: string;
  /** Whether the column can be hidden (first/name column is often pinned) */
  pinned?: boolean;
  /** Whether the column supports filtering */
  filterable?: boolean;
  /** Available filter values for dropdown-style filters */
  filterOptions?: string[];
}

export interface DashboardViewState {
  /** Set of hidden column keys */
  hidden: Set<string>;
  /** Active filters: key → selected values */
  filters: Record<string, string[]>;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useDashboardView(
  /** Unique key for localStorage persistence */
  storageKey: string,
  /** All available columns */
  allColumns: DashboardColumn[],
) {
  // Load persisted hidden columns
  const [hidden, setHidden] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`dashview:${storageKey}:hidden`);
      if (saved) return new Set(JSON.parse(saved) as string[]);
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // Active filters
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  // Visible columns (respecting hidden + never hide pinned)
  const visibleColumns = useMemo(
    () => allColumns.filter((c) => c.pinned || !hidden.has(c.key)),
    [allColumns, hidden],
  );

  // Count active filters
  const filterCount = useMemo(
    () => Object.values(filters).filter((v) => v.length > 0).length,
    [filters],
  );

  // Toggle column visibility
  const toggleColumn = useCallback(
    (key: string) => {
      setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        // Persist
        try {
          localStorage.setItem(`dashview:${storageKey}:hidden`, JSON.stringify(Array.from(next)));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageKey],
  );

  // Set a filter for a specific column
  const setFilter = useCallback((key: string, values: string[]) => {
    setFilters((prev) => {
      if (values.length === 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: values };
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => setFilters({}), []);

  // Show all columns (reset hidden)
  const showAllColumns = useCallback(() => {
    setHidden(new Set());
    try {
      localStorage.removeItem(`dashview:${storageKey}:hidden`);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return {
    allColumns,
    visibleColumns,
    hidden,
    filters,
    filterCount,
    toggleColumn,
    setFilter,
    clearFilters,
    showAllColumns,
  };
}
