/**
 * TasksTab — Tasks linked to this person.
 */

import { CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import { formatDate, statusColor } from "../utils";

interface TasksTabProps {
  tasks: Array<{
    id: string;
    title: string | null;
    description: string | null;
    status: string | null;
    priority: string | null;
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
  }>;
}

function priorityColor(priority: string | null): string {
  switch (priority?.toLowerCase()) {
    case "high":
    case "urgent":
      return "text-red-400";
    case "medium":
      return "text-amber-400";
    case "low":
      return "text-emerald-400";
    default:
      return "text-foreground-disabled";
  }
}

export function TasksTab({ tasks }: TasksTabProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised">
          <CheckSquare className="h-8 w-8 text-foreground-disabled" />
        </div>
        <p className="text-sm font-medium text-foreground-muted">No tasks</p>
        <p className="text-xs text-foreground-disabled">
          Tasks linked to this person will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
        Tasks ({tasks.length})
      </h3>
      {tasks.map((task) => {
        const isDone = task.status === "completed" || !!task.completed_at;
        return (
          <div
            key={task.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-surface-card p-3.5 transition-colors hover:bg-surface-raised/40"
          >
            {isDone ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-foreground-disabled" />
            )}
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-medium ${isDone ? "text-foreground-muted line-through" : "text-foreground"}`}
              >
                {task.title || "Untitled task"}
              </p>
              {task.description && (
                <p className="mt-0.5 line-clamp-2 text-[10px] text-foreground-disabled">
                  {task.description}
                </p>
              )}
              <div className="mt-1 flex items-center gap-2">
                {task.priority && (
                  <span className={`text-[10px] font-medium ${priorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
                {task.due_date && (
                  <span className="text-[10px] text-foreground-disabled">
                    Due: {formatDate(task.due_date)}
                  </span>
                )}
                {task.status && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
