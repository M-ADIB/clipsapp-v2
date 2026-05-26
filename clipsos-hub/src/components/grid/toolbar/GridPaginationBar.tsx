/**
 * GridPaginationBar — footer pagination control for VideosGrid.
 *
 * Renders: "Showing 1–25 of 791 videos  |  Rows per page: [25 ▾]  |  < 1 of 32 >"
 * Placed between the table body and the floating bulk-action bar.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

interface GridPaginationBarProps {
  page: number; // 0-based current page
  pageSize: number;
  totalCount: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function GridPaginationBar({
  page,
  pageSize,
  totalCount,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
  className,
}: GridPaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalCount);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-4 border-t px-4 py-2 text-[12px] text-foreground-muted",
        isFetching && "opacity-60",
        className,
      )}
    >
      {/* Left: row range */}
      <span className="tabular-nums">
        {totalCount === 0
          ? "No videos"
          : `Showing ${from}–${to} of ${totalCount.toLocaleString()} video${totalCount === 1 ? "" : "s"}`}
      </span>

      {/* Right: page size + nav */}
      <div className="flex items-center gap-3">
        {/* Rows per page */}
        <div className="flex items-center gap-1.5">
          <span className="text-foreground-disabled">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(0); // reset to first page when size changes
            }}
            className="rounded border border-border bg-transparent px-1.5 py-0.5 text-[12px] text-foreground focus:outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <span className="h-3.5 w-px bg-border" />

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-foreground/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <span className="min-w-[60px] text-center tabular-nums">
            {page + 1} / {totalPages}
          </span>

          <button
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-foreground/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
