/**
 * DataTable — Generic sortable, selectable data table.
 *
 * From Figma My Videos:
 *   Header: 40px, bottom border rgba(255,255,255,0.2), text rgba(255,255,255,0.4)
 *   Rows: 45px, bottom border rgba(255,255,255,0.05)
 *   Selected row: bg #2B2930
 *   Checkbox: 16×16
 *   Right-fade gradient for horizontal overflow
 *
 * Generic — works for any entity table (videos, clients, deals, etc.)
 */

import { useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface DataTableColumn<T> {
  /** Column key — used for sorting */
  key: string;
  /** Header label */
  header: string;
  /** Width (CSS value) */
  width?: string;
  /** Min/max widths */
  minWidth?: string;
  maxWidth?: string;
  /** Render cell content */
  render: (row: T, index: number) => ReactNode;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Whether this column is sortable */
  sortable?: boolean;
}

interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Unique key extractor per row */
  rowKey: (row: T) => string;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Currently selected row keys */
  selectedKeys?: Set<string>;
  /** Selection change handler */
  onSelectionChange?: (keys: Set<string>) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Show right-fade gradient for horizontal overflow */
  showOverflowFade?: boolean;
  /** Optional action bar above the table */
  actionBar?: ReactNode;
  /** Empty state */
  emptyMessage?: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function DataTable<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys: controlledSelected,
  onSelectionChange,
  onRowClick,
  showOverflowFade = true,
  actionBar,
  emptyMessage = "No data",
}: DataTableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const selected = controlledSelected ?? internalSelected;
  const setSelected = onSelectionChange ?? setInternalSelected;

  const toggleRow = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.map(rowKey)));
    }
  };

  const allSelected = data.length > 0 && selected.size === data.length;

  return (
    <div className="relative w-full">
      {/* Action bar */}
      {actionBar && <div className="mb-4 flex items-center justify-end gap-2">{actionBar}</div>}

      {/* Scrollable table container */}
      <div className="relative overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr>
              {selectable && (
                <th
                  className="w-6 border-b px-0 py-2 text-center"
                  style={{ borderColor: "var(--border)" }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="h-10 border-b px-3 py-2 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled"
                  style={{
                    borderColor: "var(--border)",
                    width: col.width,
                    minWidth: col.minWidth ?? "80px",
                    maxWidth: col.maxWidth ?? "240px",
                    textAlign: col.align ?? "left",
                    fontFeatureSettings: "'ss01' on, 'cv01' on, 'cv11' on",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center text-sm text-foreground-disabled"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const key = rowKey(row);
                const isSelected = selected.has(key);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={`h-[45px] cursor-pointer border-b transition-colors ${
                      isSelected ? "bg-surface-raised" : "hover:bg-foreground/[0.03]"
                    }`}
                    style={{ borderColor: "var(--border)" }}
                  >
                    {selectable && (
                      <td className="w-6 px-0 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleRow(key);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 cursor-pointer appearance-none rounded-sm border border-border-strong bg-transparent checked:bg-primary"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-2"
                        style={{
                          width: col.width,
                          minWidth: col.minWidth ?? "80px",
                          maxWidth: col.maxWidth ?? "240px",
                          textAlign: col.align ?? "left",
                        }}
                      >
                        {col.render(row, i)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Right-fade gradient for horizontal overflow */}
        {showOverflowFade && (
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-32"
            style={{
              background: "linear-gradient(270deg, var(--background) 0%, transparent 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
