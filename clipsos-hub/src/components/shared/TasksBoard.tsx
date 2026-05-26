/**
 * TasksBoard — Shared Kanban task board for all roles.
 * Columns: To Do, In Progress, Review, Done.
 * Uses useTasks hook with real DB data + useCreateTask/useUpdateTask mutations.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/data";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/dashboard";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  GripVertical,
  ChevronDown,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const COLUMNS = [
  { key: "todo", label: "To Do", icon: AlertCircle, color: "hsl(210 80% 60%)" },
  { key: "in_progress", label: "In Progress", icon: Clock, color: "hsl(45 90% 50%)" },
  { key: "review", label: "Review", icon: Search, color: "hsl(280 70% 60%)" },
  { key: "done", label: "Done", icon: CheckCircle2, color: "hsl(140 60% 45%)" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

const PRIORITY_CONFIG: Record<
  string,
  { label: string; variant: "approved" | "pending" | "in_review" | "draft" | "posted" }
> = {
  urgent: { label: "Urgent", variant: "posted" },
  high: { label: "High", variant: "in_review" },
  medium: { label: "Medium", variant: "pending" },
  low: { label: "Low", variant: "draft" },
};

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  linked_entity_type: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

/* ------------------------------------------------------------------ */
/* Create Task Dialog                                                  */
/* ------------------------------------------------------------------ */

function CreateTaskDialog({ column, onClose }: { column: ColumnKey; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const createTask = useCreateTask();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || null,
      status: column,
      priority,
      due_date: dueDate || null,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[420px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-surface-card p-5 shadow-2xl">
        <h3 className="text-sm font-semibold text-foreground">New Task</h3>
        <div className="mt-4 flex flex-col gap-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none resize-none"
          />
          <div className="flex gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs text-foreground-muted hover:bg-foreground/[0.06]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || createTask.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createTask.isPending ? "Creating…" : "Create Task"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Task Card                                                           */
/* ------------------------------------------------------------------ */

interface TaskCardProps {
  task: TaskItem;
  onStatusChange: (id: string, status: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

function TaskCard({ task, onStatusChange, onDragStart, onDragEnd, isDragging }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const overdue = task.status !== "done" && isOverdue(task.due_date);

  return (
    <div
      draggable={true}
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragEnd={onDragEnd}
      className={`group cursor-grab active:cursor-grabbing select-none rounded-lg border border-[var(--border)] bg-surface-card p-3 transition-all hover:border-primary/30 hover:shadow-sm ${
        isDragging ? "opacity-40 border-dashed border-primary/50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-medium text-foreground line-clamp-2">{task.title}</h4>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-3.5 w-3.5 text-foreground-disabled" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-[140px] rounded-lg border border-[var(--border)] bg-surface-card py-1 shadow-2xl">
                {COLUMNS.filter((c) => c.key !== task.status).map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      onStatusChange(task.id, c.key);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-foreground-muted hover:bg-foreground/[0.06]"
                  >
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                    {c.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {task.description && (
        <p className="mt-1.5 text-[10px] text-foreground-disabled line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="mt-2.5 flex items-center justify-between">
        <StatusBadge variant={p.variant} label={p.label} />
        {task.due_date && (
          <span
            className={`flex items-center gap-1 text-[10px] ${overdue ? "text-red-400" : "text-foreground-disabled"}`}
          >
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export function TasksBoard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [createColumn, setCreateColumn] = useState<ColumnKey | null>(null);
  const [filterMine, setFilterMine] = useState(false);

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnKey | null>(null);

  useEffect(() => {
    setHeaderConfig({ title: "Tasks", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const { data: tasks = [], isLoading } = useTasks(
    filterMine && user ? { assignedTo: user.id } : undefined,
  );
  const updateTask = useUpdateTask();

  const handleStatusChange = useCallback(
    (id: string, status: string) => {
      updateTask.mutate({
        id,
        status,
        completed_at: status === "done" ? new Date().toISOString() : null,
      });
    },
    [updateTask],
  );

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    // Defer setting the draggedTaskId so the drag image doesn't capture the opacity change.
    setTimeout(() => {
      setDraggedTaskId(id);
    }, 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, column: ColumnKey) => {
      e.preventDefault();
      if (dragOverColumn !== column) {
        setDragOverColumn(column);
      }
    },
    [dragOverColumn],
  );

  const handleDragEnter = useCallback((e: React.DragEvent, column: ColumnKey) => {
    e.preventDefault();
    setDragOverColumn(column);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, column: ColumnKey) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain") || draggedTaskId;
      if (id) {
        handleStatusChange(id, column);
      }
      setDraggedTaskId(null);
      setDragOverColumn(null);
    },
    [draggedTaskId, handleStatusChange],
  );

  /* Group tasks by column */
  const grouped = useMemo(() => {
    const filtered = searchTerm
      ? tasks.filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : tasks;
    const map: Record<ColumnKey, TaskItem[]> = { todo: [], in_progress: [], review: [], done: [] };
    for (const t of filtered) {
      const col = (t.status as ColumnKey) ?? "todo";
      (map[col] ?? map.todo).push(t as TaskItem);
    }
    return map;
  }, [tasks, searchTerm]);

  const totalCount = tasks.length;

  return (
    <FullBleed>
      {/* Toolbar */}
      <div
        className="flex h-auto min-h-[44px] flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-5 md:py-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex rounded-md bg-surface-raised p-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${viewMode === "kanban" ? "bg-surface-card text-foreground shadow-sm" : "text-foreground-muted"}`}
            >
              <LayoutGrid className="h-3 w-3" /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${viewMode === "list" ? "bg-surface-card text-foreground shadow-sm" : "text-foreground-muted"}`}
            >
              <List className="h-3 w-3" /> List
            </button>
          </div>
          <div className="h-4 w-px" style={{ background: "var(--border)" }} />
          <button
            onClick={() => setFilterMine(!filterMine)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition-colors ${filterMine ? "bg-primary/10 text-primary" : "text-foreground-muted hover:bg-foreground/[0.06]"}`}
          >
            <User className="h-3 w-3" /> My Tasks
          </button>
        </div>
        <div className="flex items-center gap-2">
          {searchOpen && (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks…"
                className="h-6 w-40 rounded bg-foreground/[0.06] px-2 text-[11px] text-foreground placeholder:text-foreground-disabled focus:outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <X className="h-3 w-3 text-foreground-disabled" />
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-6 w-6 items-center justify-center rounded text-foreground-disabled hover:bg-foreground/[0.06]"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCreateColumn("todo")}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : viewMode === "kanban" ? (
          <div
            className="flex gap-4 p-4 md:p-5 overflow-x-auto min-h-[calc(100vh-220px)]"
            onDragOver={(e) => {
              if (e.target === e.currentTarget) {
                setDragOverColumn(null);
              }
            }}
          >
            {COLUMNS.map((col) => {
              const colTasks = grouped[col.key];
              return (
                <div
                  key={col.key}
                  onDragOver={(e) => handleDragOver(e, col.key)}
                  onDragEnter={(e) => handleDragEnter(e, col.key)}
                  onDrop={(e) => handleDrop(e, col.key)}
                  className={`flex w-[280px] shrink-0 flex-col gap-3 rounded-xl p-1.5 transition-all duration-200 ${
                    dragOverColumn === col.key
                      ? "bg-primary/[0.04] ring-2 ring-primary/20 scale-[1.01]"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between rounded-lg bg-surface-card px-3 py-2 border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                      <span className="text-xs font-medium text-foreground">{col.label}</span>
                      <span className="rounded-full bg-surface-raised px-1.5 py-0.5 text-[10px] text-foreground-muted">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setCreateColumn(col.key)}
                      className="text-foreground-disabled hover:text-foreground-muted"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedTaskId === task.id}
                      />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center">
                        <p className="text-[10px] text-foreground-disabled">No tasks</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setCreateColumn(col.key)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] text-foreground-disabled hover:bg-surface-card hover:text-foreground-muted"
                  >
                    <Plus className="h-3 w-3" /> Add task
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Task", "Status", "Priority", "Due Date", "Created"].map((h) => (
                  <th key={h} className="border-b border-[var(--border)] px-4 py-2.5 text-left">
                    <span className="text-[11px] font-normal text-foreground-disabled">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-sm text-foreground-muted">
                    No tasks yet. Click "New Task" to get started.
                  </td>
                </tr>
              )}
              {tasks.map((t) => {
                const p = PRIORITY_CONFIG[t.priority ?? "medium"] ?? PRIORITY_CONFIG.medium;
                const colCfg = COLUMNS.find((c) => c.key === t.status) ?? COLUMNS[0];
                return (
                  <tr
                    key={t.id}
                    className="border-b border-[var(--border)] hover:bg-foreground/[0.03]"
                  >
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium text-foreground">{t.title}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-xs text-foreground-muted">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: colCfg.color }}
                        />
                        {colCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge variant={p.variant} label={p.label} />
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-xs ${t.status !== "done" && isOverdue(t.due_date) ? "text-red-400" : "text-foreground-muted"}`}
                      >
                        {formatDate(t.due_date) || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-foreground-muted">
                        {new Date(t.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex h-[36px] items-center px-3 md:px-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-[11px] text-foreground-disabled">{totalCount} tasks</span>
      </div>

      {/* Create Dialog */}
      {createColumn && (
        <CreateTaskDialog column={createColumn} onClose={() => setCreateColumn(null)} />
      )}
    </FullBleed>
  );
}
