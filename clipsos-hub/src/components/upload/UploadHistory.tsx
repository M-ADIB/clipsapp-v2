/**
 * UploadHistory — standalone component showing a paginated table of past uploads.
 *
 * Embeddable anywhere: in a Sheet, Dialog, or directly on a page.
 * Uses the useUploadHistory hook for data, shadcn/ui Table + Badge + Select.
 */

import { useState } from "react";
import { Clock, FileVideo, Upload, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useUploadHistory,
  type UploadHistoryStatus,
  type UploadSessionRow,
} from "@/hooks/useUploadHistory";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";
const formatFileSize = formatBytes;

// ── Helpers ─────────────────────────────────────────────────────────

/** Format bytes into human-readable KB / MB / GB. */

/** Format a duration in ms into "2m 34s" style. */
function formatDuration(ms: number): string {
  if (ms < 1000) return "<1s";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Format a date into relative time (e.g., "2 hours ago"). */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// ── Status badge ────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const config: Record<string, { label: string; className: string }> = {
    completed: {
      label: "Completed",
      className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-400",
    },
    failed: {
      label: "Failed",
      className: "bg-red-500/15 text-red-700 border-red-500/25 dark:text-red-400",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-amber-500/15 text-amber-700 border-amber-500/25 dark:text-amber-400",
    },
    uploading: {
      label: "Uploading",
      className: "bg-blue-500/15 text-blue-700 border-blue-500/25 dark:text-blue-400 animate-pulse",
    },
    processing: {
      label: "Processing",
      className: "bg-blue-500/15 text-blue-700 border-blue-500/25 dark:text-blue-400 animate-pulse",
    },
    initializing: {
      label: "Initializing",
      className: "bg-blue-500/15 text-blue-700 border-blue-500/25 dark:text-blue-400",
    },
    pending: {
      label: "Pending",
      className: "bg-slate-500/15 text-slate-700 border-slate-500/25 dark:text-slate-400",
    },
  };

  const { label, className } = config[normalized] ?? {
    label: status,
    className: "bg-slate-500/15 text-slate-600 border-slate-500/25",
  };

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", className)}>
      {label}
    </Badge>
  );
}

// ── Empty state ─────────────────────────────────────────────────────

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-muted p-3">
        <Upload className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          {hasFilter ? "No matching uploads" : "No uploads yet"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasFilter ? "Try changing the status filter." : "Upload a video to see it here."}
        </p>
      </div>
    </div>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

// ── Row component ───────────────────────────────────────────────────

function UploadRow({ session }: { session: UploadSessionRow }) {
  const duration =
    session.completed_at && session.created_at
      ? formatDuration(
          new Date(session.completed_at).getTime() - new Date(session.created_at).getTime(),
        )
      : "—";

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2 min-w-0">
          <FileVideo className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium" title={session.file_name}>
            {session.file_name}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {formatFileSize(session.file_size)}
      </TableCell>
      <TableCell>
        <StatusBadge status={session.overall_status} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(session.created_at)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {duration}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground truncate max-w-[120px]">
        {session.uploader?.full_name ?? "Unknown"}
      </TableCell>
    </TableRow>
  );
}

// ── Main component ──────────────────────────────────────────────────

export function UploadHistory() {
  const [statusFilter, setStatusFilter] = useState<UploadHistoryStatus>("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, isError, error } = useUploadHistory({
    statusFilter,
    page,
    pageSize,
  });

  const sessions = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasFilter = statusFilter !== "all";

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {totalCount} upload{totalCount === 1 ? "" : "s"}
        </span>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as UploadHistoryStatus);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-destructive">Failed to load upload history</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState hasFilter={hasFilter} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Uploaded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <UploadRow key={session.id} session={session} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
