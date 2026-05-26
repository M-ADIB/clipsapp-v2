/**
 * VideosGrid — modular spreadsheet-style table for the videos domain.
 *
 * Wave 3.6: range clipboard highlight, column drag-to-reorder, sticky frozen
 * columns, row virtualization (TanStack Virtual), and tenant Add-Row picker.
 */
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Film, Filter, GripVertical, Settings2, X } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import { CellRenderer } from "./cells/CellRenderer";
import { GridProvider, useGrid } from "./core/GridProvider";
import { useColumnLabels } from "./core/useColumnLabels";
import { useGridColumns } from "./core/useGridColumns";
import { useGridKeyboard } from "./core/useGridKeyboard";
import { useGridMutations } from "./core/useGridMutations";
import { useGridRealtime } from "./core/useGridRealtime";
import { useGridRows } from "./core/useGridRows";
import { useGridView } from "./core/useGridView";
import { useRowReorder } from "./core/useRowReorder";
import { useUndoRedo, type UndoEntry } from "./core/useUndoRedo";
import { isInRange } from "./core/rangeUtils";
import { ColumnDialog } from "./dialogs/ColumnDialog";
import { ManageColumnsSheet } from "./dialogs/ManageColumnsSheet";
import { ColumnHeader } from "./header/ColumnHeader";
import { RowContextMenu } from "./rows/RowContextMenu";
import { AddVideoPicker } from "./toolbar/AddVideoPicker";
import { AddVideoDialog } from "./toolbar/AddVideoDialog";
import { BulkActionBar } from "./toolbar/BulkActionBar";
import { CycleTabs, type CycleTabValue } from "./toolbar/CycleTabs";
import { FilterBuilder, applyFilters } from "./toolbar/FilterBuilder";
import { GridPaginationBar } from "./toolbar/GridPaginationBar";
import { GridToolbar } from "./toolbar/GridToolbar";
import { SavedViewsMenu } from "./toolbar/SavedViewsMenu";
import { GridQueueProvider } from "./core/GridQueueContext";
import { useCyclesForClient } from "@/hooks/use-cycles";
import {
  DENSITY_ROW_HEIGHT,
  type GridColumn,
  type GridRow,
  type GridScope,
  type SortRule,
  type Density,
} from "./core/types";

interface VideosGridProps {
  scope: GridScope;
  /** Persistence key for this grid instance — drives saved_filter_views.page */
  viewKey: string;
  title?: string;
  /** Called when a row is double-clicked or "Open" in context menu (Wave 4 hook) */
  onRowOpen?: (videoId: string) => void;
  /** Controlled cycle tab value (omit for internal state). */
  cycleTab?: CycleTabValue;
  onCycleTabChange?: (next: CycleTabValue) => void;
  /** Hide the in-grid CycleTabs strip (when the parent renders them elsewhere, e.g. TopNav). */
  hideCycleTabs?: boolean;
  /**
   * Default page size for pagination.
   * When the grid is scoped to a single client the full set is small enough
   * that we skip pagination (pass `false` to disable explicitly).
   * When omitted the grid auto-enables pagination for global (cross-client) views.
   */
  defaultPageSize?: number | false;
  /** Pre-populate the search box (used by dashboard stat-card deep links). */
  initialSearch?: string;
}

export function VideosGrid(props: VideosGridProps) {
  return (
    <GridProvider scope={props.scope}>
      <VideosGridInner {...props} />
    </GridProvider>
  );
}

function VideosGridInner({
  scope,
  viewKey,
  title = "All Videos",
  onRowOpen,
  cycleTab: cycleTabProp,
  onCycleTabChange,
  hideCycleTabs = false,
  defaultPageSize,
  initialSearch = "",
}: VideosGridProps) {
  const { role } = useAuth();
  const isClient = role === "client";
  const canManage = role === "owner" || role === "manager" || role === "senior_editor";

  // ── Pagination ─────────────────────────────────────────────────────
  // Auto-enable for global (cross-client) views; disable when scoped to one client.
  const paginationEnabled =
    defaultPageSize !== false && (defaultPageSize !== undefined || !scope.clientId);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(
    typeof defaultPageSize === "number" ? defaultPageSize : 25,
  );
  const pagination = paginationEnabled ? { page, pageSize } : undefined;

  // ── Cycle tab (only when scoped to a single client) ────────────────
  const { data: cycles = [] } = useCyclesForClient(scope.clientId);
  const [cycleTabInternal, setCycleTabInternal] = useState<CycleTabValue>("all");
  const cycleTab = cycleTabProp ?? cycleTabInternal;
  const setCycleTab = (next: CycleTabValue) => {
    if (onCycleTabChange) onCycleTabChange(next);
    else setCycleTabInternal(next);
  };
  const effectiveScope = useMemo(() => {
    if (!scope.clientId) return scope;
    if (cycleTab === "all" || cycleTab === "shoots") return scope;
    return { ...scope, cycleId: cycleTab };
  }, [scope, cycleTab]);
  const defaultProjectId = useMemo(() => cycles[0]?.project_id ?? null, [cycles]);

  const {
    view,
    setView,
    views,
    activeId,
    selectView,
    saveAs,
    updateActive,
    toggleShared,
    deleteView,
  } = useGridView(viewKey);
  const { canRename, setLabel: setTenantLabel } = useColumnLabels();
  const { columns, visibleColumns, refetch: refetchColumns } = useGridColumns(effectiveScope, view);
  const { rows, totalCount, isLoading, isFetching } = useGridRows(effectiveScope, pagination);
  const {
    updateCell,
    archiveRows,
    bulkUpdate,
    bulkAssignEditor,
    duplicateRow,
    addRow,
    moveRowEdge,
  } = useGridMutations(effectiveScope, pagination);
  const { canReorder, reorder } = useRowReorder(effectiveScope);
  const { state, dispatch, isRowSelected, isCellEditing } = useGrid();

  // ── Realtime subscription for live data sync ──────────────────────
  useGridRealtime(effectiveScope);

  const [search, setSearch] = useState(initialSearch);
  const [manageOpen, setManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [editColumnId, setEditColumnId] = useState<string | null>(null);
  // New video upload dialog
  const [addVideoDialogOpen, setAddVideoDialogOpen] = useState(false);
  // Track right-clicked column for context menu actions
  const [rightClickedColumnId, setRightClickedColumnId] = useState<string | null>(null);

  // Reset to page 1 when search or filters change
  const handleSearchChange = (q: string) => {
    setSearch(q);
    setPage(0);
  };
  const handleFiltersChange = (filters: typeof view.filters) => {
    setView({ filters });
    setPage(0);
  };

  // ── Filter + sort ─────────────────────────────────────────────────
  const sort = view.sort[0] ?? null;

  const processedRows = useMemo(() => {
    let out = applyFilters(rows, view.filters, visibleColumns);
    // "All Shoots" tab: show only videos with no cycle assigned
    if (cycleTab === "shoots") {
      out = out.filter((r) => (r.data as { cycle_id?: string | null }).cycle_id == null);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((r) =>
        Object.values(r.data).some((v) => v != null && String(v).toLowerCase().includes(q)),
      );
    }
    if (view.sort.length > 0) {
      const rules = [...view.sort];
      out = [...out].sort((a, b) => {
        for (const rule of rules) {
          const col = visibleColumns.find((c) => c.id === rule.columnId);
          if (!col) continue;
          const av = readValue(a, col);
          const bv = readValue(b, col);
          if (av == null && bv == null) continue;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return rule.direction === "asc" ? -1 : 1;
          if (av > bv) return rule.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return out;
  }, [rows, view.filters, view.sort, search, visibleColumns, cycleTab]);

  // ── Undo / Redo ───────────────────────────────────────────────────
  const applyEntry = useCallback(
    (entry: UndoEntry, direction: "undo" | "redo") => {
      const value = direction === "undo" ? entry.prev : entry.next;
      updateCell.mutate({ rowId: entry.rowId, column: entry.column, value });
    },
    [updateCell],
  );

  const {
    push: pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo({
    apply: applyEntry,
  });

  const commitCell = useCallback(
    (rowId: string, column: GridColumn, next: unknown) => {
      const row = processedRows.find((r) => r.id === rowId);
      const prev = row ? readValue(row, column) : null;
      pushHistory({ rowId, column, prev, next });
      updateCell.mutate({ rowId, column, value: next });
    },
    [processedRows, pushHistory, updateCell],
  );

  const clearCell = useCallback(
    (rowId: string, column: GridColumn) => {
      if (!role || !column.editableBy.includes(role)) return;
      if (column.type === "review") return;
      commitCell(rowId, column, null);
    },
    [role, commitCell],
  );

  // ── Keyboard ──────────────────────────────────────────────────────
  useGridKeyboard({
    rows: processedRows,
    columns: visibleColumns,
    onCommitFromClipboard: commitCell,
    onClearCell: clearCell,
    onUndo: undo,
    onRedo: redo,
  });

  // ── Sort / width / hide / rename ──────────────────────────────────
  const updateColumnSort = (columnId: string, dir: "asc" | "desc" | null, additive: boolean) => {
    if (dir === null) {
      setView({ sort: view.sort.filter((s) => s.columnId !== columnId) });
      return;
    }
    const rule: SortRule = { columnId, direction: dir };
    if (additive) {
      const without = view.sort.filter((s) => s.columnId !== columnId);
      setView({ sort: [...without, rule] });
    } else {
      setView({ sort: [rule] });
    }
  };
  const updateColumnWidth = (columnId: string, width: number) => {
    setView({ widths: { ...view.widths, [columnId]: width } });
  };
  const hideColumn = (columnId: string) => {
    setView({ hidden: [...view.hidden, columnId] });
  };
  const renameColumn = (columnId: string, label: string) => {
    if (canRename) setTenantLabel(columnId, label);
  };

  // ── Column & Row reorder (drag in <thead> & <tbody>) ─────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const reorderEnabled = canReorder && view.sort.length === 0 && !search.trim();

  const handleGlobalDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    // Check if the dragged item is a column
    const isCol = visibleColumns.some((c) => c.id === active.id);
    if (isCol) {
      const ids = visibleColumns.map((c) => c.id);
      const oldIdx = ids.indexOf(String(active.id));
      const newIdx = ids.indexOf(String(over.id));
      if (oldIdx === -1 || newIdx === -1) return;
      const next = arrayMove(ids, oldIdx, newIdx);
      setView({ order: next });
    } else {
      const ids = processedRows.map((r) => r.id);
      const oldIdx = ids.indexOf(String(active.id));
      const newIdx = ids.indexOf(String(over.id));
      if (oldIdx === -1 || newIdx === -1) return;
      const next = arrayMove(ids, oldIdx, newIdx);
      reorder.mutate(next);
    }
  };

  // ── Bulk actions ──────────────────────────────────────────────────
  const selectedIds = Array.from(state.selection.rows);
  const clearSelection = () => dispatch({ type: "CLEAR_ROW_SELECTION" });

  const exportCsv = useCallback(() => {
    const cols = visibleColumns;
    const header = cols.map((c) => c.label).join(",");
    const lines = processedRows
      .filter((r) => state.selection.rows.has(r.id))
      .map((r) =>
        cols
          .map((c) => {
            const v = readValue(r, c);
            const s = v == null ? "" : String(v);
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(","),
      );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `videos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [visibleColumns, processedRows, state.selection.rows]);

  // ── Row open + context-menu helpers ───────────────────────────────
  const copyRowLink = (rowId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#video=${rowId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success("Link copied");
  };

  // ── Add row — upload-first dialog ────────────────────────────────
  // We never create an empty row. Instead we open AddVideoDialog which
  // requires a file before writing to the DB.
  const openAddDialog = canManage ? () => setAddVideoDialogOpen(true) : undefined;
  // Keep these for the toolbar slot props (they pass through to AddVideoPicker)
  // but we override the top-level button to open our dialog instead.
  const addRowDirect = openAddDialog;
  const addRowViaPicker = undefined; // replaced by dialog

  // ── Sticky / frozen columns ──────────────────────────────────────
  const frozenCount = Math.min(view.frozenCount ?? 3, visibleColumns.length);
  const leftOffsets = useMemo(() => {
    // Cumulative left for each visible column (after the gutter columns)
    const out: number[] = [];
    let acc = 0;
    for (const c of visibleColumns) {
      out.push(acc);
      acc += c.width;
    }
    return out;
  }, [visibleColumns]);
  /** Gutter width (drag handle + checkbox) — used for header offset baseline */
  const gutterWidth = (reorderEnabled ? 24 : 0) + 40;

  // ── Render ────────────────────────────────────────────────────────
  const allSelected =
    processedRows.length > 0 && state.selection.rows.size === processedRows.length;
  const rowHeight = DENSITY_ROW_HEIGHT[view.density];
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Virtualization ────────────────────────────────────────────────
  const virtualizer = useVirtualizer({
    count: processedRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
    getItemKey: (i) => processedRows[i]?.id ?? i,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0 ? totalHeight - virtualItems[virtualItems.length - 1].end : 0;

  const queueIds = useMemo(() => processedRows.map((r) => r.id), [processedRows]);

  return (
    <GridQueueProvider ids={queueIds}>
      <div className="flex h-full min-h-0 flex-col">
        {scope.clientId && !hideCycleTabs ? (
          <CycleTabs
            clientId={scope.clientId}
            defaultProjectId={defaultProjectId}
            value={cycleTab}
            onChange={setCycleTab}
            canManage={canManage}
          />
        ) : null}
        <GridToolbar
          title={title}
          search={search}
          onSearchChange={handleSearchChange}
          density={view.density}
          onDensityChange={(d) => setView({ density: d })}
          onManageColumns={() => setManageOpen(true)}
          onAddColumn={() => setAddOpen(true)}
          rowCount={paginationEnabled ? totalCount : processedRows.length}
          columns={visibleColumns}
          sort={sort}
          onSortChange={(s) => updateColumnSort(s?.columnId ?? "", s?.direction ?? null, false)}
          onOpenFilter={() => setFilterOpen(true)}
          onClearFilters={view.filters.length > 0 ? () => handleFiltersChange([]) : undefined}
          filterCount={view.filters.length}
          leftSlot={
            <SavedViewsMenu
              views={views}
              activeId={activeId}
              onSelect={selectView}
              onSaveAs={saveAs}
              onUpdate={updateActive}
              onToggleShared={toggleShared}
              onDelete={deleteView}
            />
          }
          canAddRow={!isClient}
          canAddColumn={false}
          canManage={canManage}
          onAddRow={addRowDirect}
          addRowSlot={addRowViaPicker ? <AddVideoPicker onPick={addRowViaPicker} /> : undefined}
          manageColumnsSlot={
            <ManageColumnsSheet
              open={manageOpen}
              onOpenChange={setManageOpen}
              columns={columns}
              view={view}
              onViewChange={setView}
              onAddColumn={() => setAddOpen(true)}
            >
              <button className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground md:flex">
                <Settings2 className="h-3 w-3" />
                View settings
              </button>
            </ManageColumnsSheet>
          }
          filterSlot={
            <div className="flex items-center">
              <FilterBuilder
                open={filterOpen}
                onOpenChange={setFilterOpen}
                columns={visibleColumns}
                filters={view.filters}
                onChange={handleFiltersChange}
              >
                <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
                  <Filter className="h-3 w-3" />
                  Filter
                  {view.filters.length > 0 && (
                    <span className="rounded-full bg-primary px-1.5 text-[9px] font-bold text-primary-foreground">
                      {view.filters.length}
                    </span>
                  )}
                </button>
              </FilterBuilder>
              {view.filters.length > 0 && (
                <button
                  onClick={() => handleFiltersChange([])}
                  title="Clear filters"
                  className="flex h-5 w-5 items-center justify-center rounded text-foreground-disabled transition-colors hover:bg-foreground/[0.06] hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          }
        />

        {/* ── Table ────────────────────────────────────────── */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleGlobalDragEnd}
        >
          <div ref={scrollRef} className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-30 bg-background">
                <tr>
                  {reorderEnabled && (
                    <th
                      className="sticky left-0 z-20 w-6 border-b border-border"
                      style={{ backgroundColor: "var(--background)" }}
                    />
                  )}
                  <th
                    className="sticky z-20 w-10 border-b border-border px-3 py-2 text-center"
                    style={{
                      left: reorderEnabled ? 24 : 0,
                      backgroundColor: "var(--background)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        dispatch({
                          type: "SELECT_ALL_ROWS",
                          rowIds: processedRows.map((r) => r.id),
                        })
                      }
                      className="h-3.5 w-3.5 cursor-pointer rounded-sm border border-border-strong bg-background accent-primary"
                    />
                  </th>
                  <SortableContext
                    items={visibleColumns.map((c) => c.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {visibleColumns.map((c, idx) => {
                      const activeSort = view.sort.find((s) => s.columnId === c.id) ?? null;
                      const pinned = idx < frozenCount;
                      const pinLeft = pinned ? gutterWidth + leftOffsets[idx] : undefined;
                      return (
                        <SortableHeader
                          key={c.id}
                          column={c}
                          sort={activeSort}
                          onSort={(dir, additive) => updateColumnSort(c.id, dir, additive)}
                          onResize={(w) => updateColumnWidth(c.id, w)}
                          onHide={() => hideColumn(c.id)}
                          onRename={(label) => renameColumn(c.id, label)}
                          canRename={canRename}
                          canDrag={!isClient}
                          pinned={pinned}
                          pinLeft={pinLeft}
                          lastPinned={pinned && idx === frozenCount - 1}
                          onEdit={
                            c.source === "custom"
                              ? () => setEditColumnId(c.customColumnId)
                              : undefined
                          }
                        />
                      );
                    })}
                  </SortableContext>
                  {/* Spacer column — "Add column" is inside View Settings */}
                  <th
                    className="border-b border-border px-3 py-2 text-left"
                    style={{ width: "40px" }}
                  />
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <SkeletonRows
                    count={8}
                    cols={visibleColumns.length + (reorderEnabled ? 2 : 1) + 1}
                    rowHeight={rowHeight}
                  />
                )}

                {!isLoading && processedRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + (reorderEnabled ? 2 : 1) + 1}
                      className="px-4 py-16 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/[0.06]">
                          <Film className="h-4 w-4 text-foreground-disabled" />
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {search || view.filters.length > 0
                            ? "No videos match your filters"
                            : "No videos yet"}
                        </div>
                        {search || view.filters.length > 0 ? (
                          <button
                            onClick={() => {
                              setSearch("");
                              setView({ filters: [] });
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Clear filters
                          </button>
                        ) : (
                          addRowDirect && (
                            <button
                              onClick={addRowDirect}
                              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                              Add Video
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && processedRows.length > 0 && (
                  <SortableContext
                    items={processedRows.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {paddingTop > 0 && (
                      <tr style={{ height: paddingTop }}>
                        <td colSpan={visibleColumns.length + (reorderEnabled ? 2 : 1) + 1} />
                      </tr>
                    )}
                    {virtualItems.map((vi) => {
                      const row = processedRows[vi.index];
                      if (!row) return null;
                      return (
                        <SortableRow
                          key={row.id}
                          row={row}
                          reorderEnabled={reorderEnabled}
                          visibleColumns={visibleColumns}
                          rowHeight={rowHeight}
                          density={view.density}
                          isSelected={isRowSelected(row.id)}
                          isClient={isClient}
                          activeAddress={state.selection.active}
                          range={state.selection.range}
                          rowsForRange={processedRows}
                          role={role}
                          isCellEditing={isCellEditing}
                          frozenCount={frozenCount}
                          leftOffsets={leftOffsets}
                          gutterWidth={gutterWidth}
                          onSelectRow={() =>
                            dispatch({
                              type: "SELECT_ROW",
                              rowId: row.id,
                              mode: "toggle",
                            })
                          }
                          onFocusCell={(columnId, extend) =>
                            extend
                              ? dispatch({
                                  type: "EXTEND_RANGE",
                                  focus: { rowId: row.id, columnId },
                                })
                              : dispatch({
                                  type: "FOCUS_CELL",
                                  address: { rowId: row.id, columnId },
                                })
                          }
                          onBeginEdit={(columnId) =>
                            dispatch({
                              type: "BEGIN_EDIT",
                              address: { rowId: row.id, columnId },
                            })
                          }
                          onEndEdit={() => dispatch({ type: "END_EDIT" })}
                          onCommitCell={commitCell}
                          onRowOpen={onRowOpen}
                          onDuplicate={() => duplicateRow.mutate(row.id)}
                          onCopyLink={() => copyRowLink(row.id)}
                          onMoveTop={() => moveRowEdge.mutate({ rowId: row.id, edge: "top" })}
                          onMoveBottom={() => moveRowEdge.mutate({ rowId: row.id, edge: "bottom" })}
                          onArchive={() => archiveRows.mutate([row.id])}
                          rightClickedColumnId={rightClickedColumnId}
                          setRightClickedColumnId={setRightClickedColumnId}
                          clearCell={clearCell}
                        />
                      );
                    })}
                    {paddingBottom > 0 && (
                      <tr style={{ height: paddingBottom }}>
                        <td colSpan={visibleColumns.length + (reorderEnabled ? 2 : 1) + 1} />
                      </tr>
                    )}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </div>
        </DndContext>

        {/* ── Pagination bar ───────────────────────────────── */}
        {paginationEnabled && (
          <GridPaginationBar
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            isFetching={isFetching}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(0);
            }}
          />
        )}

        {/* ── Floating bulk action bar ─────────────────────── */}
        {!isClient && (
          <BulkActionBar
            selectedCount={selectedIds.length}
            selectedIds={selectedIds}
            onClear={clearSelection}
            onArchive={() => {
              archiveRows.mutate(selectedIds);
              clearSelection();
            }}
            onSetStatus={(statusId) =>
              bulkUpdate.mutate({ rowIds: selectedIds, patch: { status_id: statusId } })
            }
            onSetType={(typeId) =>
              bulkUpdate.mutate({ rowIds: selectedIds, patch: { video_type_id: typeId } })
            }
            onAssignEditor={(editorId) =>
              bulkAssignEditor.mutate({ rowIds: selectedIds, editorId })
            }
            onSetPostDate={(date) =>
              bulkUpdate.mutate({ rowIds: selectedIds, patch: { post_date: date } })
            }
            onSetCycle={(cycleId) =>
              bulkUpdate.mutate({ rowIds: selectedIds, patch: { cycle_id: cycleId } })
            }
            clientId={scope.clientId}
            onExportCsv={exportCsv}
          />
        )}

        <ColumnDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          projectId={scope.projectId}
          onSaved={() => refetchColumns()}
        />
        <ColumnDialog
          open={!!editColumnId}
          onOpenChange={(v) => !v && setEditColumnId(null)}
          projectId={scope.projectId}
          columnId={editColumnId}
          onSaved={() => refetchColumns()}
        />
        <AddVideoDialog
          open={addVideoDialogOpen}
          onOpenChange={setAddVideoDialogOpen}
          defaultClientId={scope.clientId}
          projectId={scope.projectId}
          cycleId={scope.cycleId}
        />
      </div>
    </GridQueueProvider>
  );
}

/* ------------------------------------------------------------------ */
/* Sortable header (column drag wrapper)                               */
/* ------------------------------------------------------------------ */

interface SortableHeaderProps {
  column: GridColumn;
  sort: SortRule | null;
  onSort: (direction: "asc" | "desc" | null, additive: boolean) => void;
  onResize: (width: number) => void;
  onHide: () => void;
  onRename: (label: string) => void;
  onEdit?: () => void;
  canRename: boolean;
  canDrag: boolean;
  pinned: boolean;
  pinLeft?: number;
  lastPinned?: boolean;
}

function SortableHeader({
  column,
  sort,
  onSort,
  onResize,
  onHide,
  onRename,
  onEdit,
  canRename,
  canDrag,
  pinned,
  pinLeft,
  lastPinned,
}: SortableHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    disabled: !canDrag,
  });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 40 : pinned ? 20 : undefined,
  };

  return (
    <ColumnHeader
      column={column}
      sort={sort}
      onSort={onSort}
      onResize={onResize}
      onHide={onHide}
      onRename={onRename}
      onEdit={onEdit}
      canRename={canRename}
      setNodeRef={setNodeRef}
      dragStyle={dragStyle}
      dragHandleProps={canDrag ? { ...attributes, ...listeners } : undefined}
      pinned={pinned}
      pinLeft={pinLeft}
      lastPinned={lastPinned}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Sortable row                                                        */
/* ------------------------------------------------------------------ */

interface SortableRowProps {
  row: GridRow;
  reorderEnabled: boolean;
  visibleColumns: GridColumn[];
  rowHeight: number;
  isSelected: boolean;
  isClient: boolean;
  activeAddress: { rowId: string; columnId: string } | null;
  range: {
    anchor: { rowId: string; columnId: string };
    focus: { rowId: string; columnId: string };
  } | null;
  rowsForRange: GridRow[];
  role: string | null;
  isCellEditing: (rowId: string, columnId: string) => boolean;
  frozenCount: number;
  leftOffsets: number[];
  gutterWidth: number;
  onSelectRow: () => void;
  onFocusCell: (columnId: string, extend: boolean) => void;
  onBeginEdit: (columnId: string) => void;
  onEndEdit: () => void;
  onCommitCell: (rowId: string, col: GridColumn, value: unknown) => void;
  onRowOpen?: (videoId: string) => void;
  onDuplicate: () => void;
  onCopyLink: () => void;
  onMoveTop: () => void;
  onMoveBottom: () => void;
  onArchive: () => void;
  rightClickedColumnId: string | null;
  setRightClickedColumnId: (columnId: string | null) => void;
  clearCell: (rowId: string, column: GridColumn) => void;
  density: Density;
}

const SortableRow = React.memo(function SortableRow({
  row,
  reorderEnabled,
  visibleColumns,
  rowHeight,
  isSelected,
  isClient,
  activeAddress,
  range,
  rowsForRange,
  role,
  isCellEditing,
  frozenCount,
  leftOffsets,
  gutterWidth,
  onSelectRow,
  onFocusCell,
  onBeginEdit,
  onEndEdit,
  onCommitCell,
  onRowOpen,
  onDuplicate,
  onCopyLink,
  onMoveTop,
  onMoveBottom,
  onArchive,
  rightClickedColumnId,
  setRightClickedColumnId,
  clearCell,
  density,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: !reorderEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: rowHeight,
    opacity: isDragging ? 0.6 : 1,
  };

  const rowBg = isSelected ? "bg-primary/[0.06]" : "bg-background hover:bg-foreground/[0.03]";

  // Inline style for pinned (frozen) cells — MUST be opaque so scrolled
  // content never bleeds through. We use inline `style` because:
  //   1. `--background` is oklch(), so wrapping it in hsl() is invalid CSS
  //   2. Tailwind `bg-background` gets overridden by the <tr>'s translucent hover state
  //   3. Inline styles have higher specificity than class-based backgrounds
  const pinnedStyle: React.CSSProperties = {
    backgroundColor: "var(--background)",
  };
  // When selected, overlay a translucent primary tint on top of the opaque base
  const pinnedSelectedStyle: React.CSSProperties = {
    backgroundColor: "var(--background)",
    backgroundImage:
      "linear-gradient(color-mix(in oklch, var(--primary) 10%, transparent), color-mix(in oklch, var(--primary) 10%, transparent))",
  };
  const getPinnedStyle = () => (isSelected ? pinnedSelectedStyle : pinnedStyle);

  return (
    <RowContextMenu
      canEdit={!isClient}
      onOpen={() => onRowOpen?.(row.id)}
      onDuplicate={onDuplicate}
      onCopyLink={onCopyLink}
      onMoveTop={onMoveTop}
      onMoveBottom={onMoveBottom}
      onArchive={onArchive}
      rightClickedColumnId={rightClickedColumnId}
      onClearCell={(columnId) => {
        const col = visibleColumns.find((c) => c.id === columnId);
        if (col) {
          clearCell(row.id, col);
        }
      }}
    >
      <tr
        ref={setNodeRef}
        style={style}
        className={cn("border-b border-border transition-colors", rowBg)}
        onDoubleClick={(e) => {
          const tag = (e.target as HTMLElement).tagName;
          if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
          onRowOpen?.(row.id);
        }}
        onContextMenu={(e) => {
          const td = (e.target as HTMLElement).closest("td");
          const colId = td?.getAttribute("data-column-id");
          setRightClickedColumnId(colId || null);
        }}
      >
        {reorderEnabled && (
          <td
            className="sticky left-0 z-10 w-6 cursor-grab px-1 text-foreground-disabled hover:text-foreground-muted"
            style={getPinnedStyle()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </td>
        )}
        <td
          className="sticky z-10 px-3 py-2 text-center"
          style={{ left: reorderEnabled ? 24 : 0, ...getPinnedStyle() }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelectRow}
            className="h-3.5 w-3.5 cursor-pointer rounded-sm border border-border-strong bg-background accent-primary"
          />
        </td>
        {visibleColumns.map((col, idx) => {
          const isReadOnly = !role || !col.editableBy.includes(role as never);
          const isEditing = isCellEditing(row.id, col.id);
          const active = activeAddress?.rowId === row.id && activeAddress?.columnId === col.id;
          const inRange = isInRange(row.id, col.id, range, rowsForRange, visibleColumns);
          const pinned = idx < frozenCount;
          const pinLeft = pinned ? gutterWidth + leftOffsets[idx] : undefined;
          // Add a right-side shadow to the LAST pinned column for clear separation
          const isLastPinned = pinned && idx === frozenCount - 1;
          return (
            <td
              key={col.id}
              data-column-id={col.id}
              className={cn(
                "p-0 align-middle",
                pinned && "sticky z-10",
                isLastPinned && "shadow-[2px_0_6px_-2px_rgba(0,0,0,0.15)]",
                active && "ring-1 ring-inset ring-primary/60",
                inRange && !active && "bg-primary/[0.08] ring-1 ring-inset ring-primary/30",
              )}
              style={{
                width: col.width,
                minWidth: col.width,
                maxWidth: col.width,
                height: rowHeight,
                ...(pinned && pinLeft != null ? { left: pinLeft } : {}),
                ...(pinned ? getPinnedStyle() : {}),
              }}
              onClick={(e) => {
                // Non-editable media cells: just focus
                const mediaTypes = new Set(["video", "thumbnail", "review"]);
                if (mediaTypes.has(col.type)) {
                  onFocusCell(col.id, e.shiftKey);
                  return;
                }
                // Interactive cells (dropdowns, date pickers, checkboxes) should
                // enter edit mode on the FIRST click — no focus-first step.
                const interactiveTypes = new Set([
                  "date",
                  "status",
                  "video_type",
                  "single_select",
                  "multi_select",
                  "yes_no",
                  "rating",
                  "editors",
                ]);
                if (!isReadOnly && interactiveTypes.has(col.type)) {
                  if (!active) {
                    onFocusCell(col.id, e.shiftKey);
                  }
                  onBeginEdit(col.id);
                  return;
                }
                // Text-like cells: single-click to focus AND edit immediately
                if (!isReadOnly && !isEditing) {
                  onFocusCell(col.id, e.shiftKey);
                  onBeginEdit(col.id);
                  return;
                }
                onFocusCell(col.id, e.shiftKey);
              }}
            >
              <div className="flex h-full items-center">
                <div className="w-full">
                  <CellRenderer
                    column={col}
                    row={row}
                    value={readValue(row, col)}
                    isEditing={isEditing}
                    isReadOnly={isReadOnly}
                    density={density}
                    onBeginEdit={() => onBeginEdit(col.id)}
                    onCommit={(next) => {
                      onCommitCell(row.id, col, next);
                      onEndEdit();
                    }}
                    onCancel={onEndEdit}
                  />
                </div>
              </div>
            </td>
          );
        })}
        <td />
      </tr>
    </RowContextMenu>
  );
});

/* ------------------------------------------------------------------ */
/* Skeletons                                                           */
/* ------------------------------------------------------------------ */

function SkeletonRows({
  count,
  cols,
  rowHeight,
}: {
  count: number;
  cols: number;
  rowHeight: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-border" style={{ height: rowHeight }}>
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-3 py-2">
              <div className="h-3 w-full animate-pulse rounded bg-foreground/[0.06]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function readValue(row: GridRow, col: GridColumn): unknown {
  if (col.source === "custom") return row.custom[col.id] ?? null;
  return row.data[col.field];
}
