/**
 * CommentsSidebar — desktop right-side panel.
 *
 * Top tabs: "Comments" | "Fields"
 * Below: "All comments" toolbar with filter / sort / search / more.
 */
import { useState, useMemo, useRef } from "react";
import {
  AtSign,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  CircleCheck,
  Filter,
  Hash,
  ListFilter,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Printer,
  Search,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import type { CommentThread } from "../hooks/use-video-comments";
import type { ToolAction } from "../PlayerControls";
import type { TrialReel } from "../hooks/use-trial-reels";
import { CommentsPanel } from "./CommentsPanel";

/* ─── Filter definition ────────────────────────────────────────── */
interface FilterState {
  annotations: boolean;
  attachments: boolean;
  completed: boolean;
  incomplete: boolean;
  unread: boolean;
  mentions: boolean;
}
const EMPTY_FILTERS: FilterState = {
  annotations: false,
  attachments: false,
  completed: false,
  incomplete: false,
  unread: false,
  mentions: false,
};

const FILTER_OPTIONS: {
  key: keyof FilterState;
  label: string;
  Icon: typeof PenLine;
}[] = [
  { key: "annotations", label: "Annotations", Icon: PenLine },
  { key: "attachments", label: "Attachments", Icon: Paperclip },
  { key: "completed", label: "Completed", Icon: CircleCheck },
  { key: "incomplete", label: "Incomplete", Icon: Circle },
  { key: "unread", label: "Unread", Icon: BookOpen },
  { key: "mentions", label: "Mentions and reactions", Icon: AtSign },
];

/* ─── Sort definition ──────────────────────────────────────────── */
type SortField = "timecode" | "oldest" | "newest" | "commenter" | "completed";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "timecode", label: "Timecode (Default)" },
  { value: "oldest", label: "Oldest" },
  { value: "newest", label: "Newest" },
  { value: "commenter", label: "Commenter" },
  { value: "completed", label: "Completed" },
];

/* ─── Props ────────────────────────────────────────────────────── */
interface CommentsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threads: CommentThread[];
  isLoading: boolean;
  currentUserId: string | null;
  canComment: boolean;
  canModerate: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onAdd: (input: {
    body: string;
    timestampSeconds: number | null;
    timestampEndSeconds: number | null;
    mentionedUserIds: string[];
    isInternal: boolean;
  }) => Promise<void> | void;
  onReply: (parentId: string, body: string, mentionedUserIds?: string[]) => Promise<void> | void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;

  onToolAction?: (tool: ToolAction) => void;
  activeToolAction?: ToolAction | null;

  // Kept for API compat — versions/trials live in header
  versions?: unknown[];
  selectedVersionId?: string | null;
  onSelectVersion?: (versionId: string) => void;
  onSetCurrentVersion?: (versionId: string) => void;
  trials?: TrialReel[];
  trialsLoading?: boolean;
  activeTrialId?: string | null;
  onPlayTrial?: (trial: TrialReel | null) => void;
}

export function CommentsSidebar(props: CommentsSidebarProps) {
  const { open, onOpenChange, threads } = props;
  const count = threads.length;

  /* ─── Local toolbar state ─────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<"comments" | "fields">("comments");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortField>("timecode");

  const hasFilters = Object.values(filters).some(Boolean);

  /* ─── Filtered + sorted threads ────────────────────────────────── */
  const processedThreads = useMemo(() => {
    let result = [...threads];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.comment.toLowerCase().includes(q) ||
          (t.author?.display_name ?? t.author?.full_name ?? t.guest_name ?? "")
            .toLowerCase()
            .includes(q),
      );
    }

    // Filters
    if (filters.annotations) {
      result = result.filter((t) => t.comment_type === "annotation");
    }
    if (filters.attachments) {
      result = result.filter((t) => /\.(png|jpg|jpeg|gif|webp|mp4|mov|pdf|zip)/i.test(t.comment));
    }
    if (filters.completed) {
      result = result.filter((t) => t.resolved_at != null);
    }
    if (filters.incomplete) {
      result = result.filter((t) => t.resolved_at == null);
    }
    if (filters.unread) {
      // Placeholder: show all since we don't have read tracking yet
    }
    if (filters.mentions && props.currentUserId) {
      const uid = props.currentUserId;
      result = result.filter(
        (t) =>
          t.mentioned_user_ids?.includes(uid) ||
          t.replies.some((r) => r.mentioned_user_ids?.includes(uid)),
      );
    }

    // Sort
    switch (sort) {
      case "timecode":
        result.sort((a, b) => {
          const aT = a.timestamp_seconds ?? Infinity;
          const bT = b.timestamp_seconds ?? Infinity;
          return aT - bT;
        });
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "commenter": {
        const getName = (t: CommentThread) =>
          (t.author?.display_name ?? t.author?.full_name ?? t.guest_name ?? "").toLowerCase();
        result.sort((a, b) => getName(a).localeCompare(getName(b)));
        break;
      }
      case "completed":
        result.sort((a, b) => {
          const aR = a.resolved_at ? 0 : 1;
          const bR = b.resolved_at ? 0 : 1;
          return aR - bR;
        });
        break;
    }

    return result;
  }, [threads, searchQuery, filters, sort, props.currentUserId]);

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchQuery("");
  };

  /* ─── Print handler ───────────────────────────────────────────── */
  const printComments = () => {
    const lines = threads.map(
      (t, i) =>
        `#${i + 1} [${t.author?.display_name ?? t.guest_name ?? "User"}] ${t.timestamp_seconds != null ? `@${t.timestamp_seconds.toFixed(1)}s` : ""}\n${t.comment}`,
    );
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(
        `<html><head><title>Comments</title><style>body{font-family:system-ui;padding:2rem;white-space:pre-wrap;}hr{margin:1rem 0;}</style></head><body>${lines.join("\n<hr/>\n")}</body></html>`,
      );
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      {/* Toggle when closed */}
      {!open && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 gap-1 shadow-lg"
          onClick={() => onOpenChange(true)}
        >
          <MessageSquare className="h-4 w-4" />
          {count > 0 && <span className="text-xs font-medium">{count}</span>}
          <ChevronRight className="h-3 w-3 rotate-180" />
        </Button>
      )}

      <aside
        className={cn(
          "h-full shrink-0 border-l border-border/60 bg-background flex flex-col transition-all duration-300 overflow-hidden",
          open ? "w-[380px]" : "w-0",
        )}
        aria-hidden={!open}
      >
        {open && (
          <>
            {/* ─── Tab row: Comments | Fields ──────────────────── */}
            <header className="flex items-center border-b border-border/60">
              <div className="flex flex-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("comments")}
                  className={cn(
                    "flex-1 py-2.5 text-center text-sm font-medium transition-colors border-b-2",
                    activeTab === "comments"
                      ? "border-primary text-foreground"
                      : "border-transparent text-foreground-muted hover:text-foreground",
                  )}
                >
                  Comments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("fields")}
                  className={cn(
                    "flex-1 py-2.5 text-center text-sm font-medium transition-colors border-b-2",
                    activeTab === "fields"
                      ? "border-primary text-foreground"
                      : "border-transparent text-foreground-muted hover:text-foreground",
                  )}
                >
                  Fields
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 mr-1 shrink-0"
                onClick={() => onOpenChange(false)}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </header>

            {/* ─── Content ─────────────────────────────────────── */}
            {activeTab === "comments" ? (
              <div className="flex flex-col flex-1 min-h-0">
                {/* ─── Toolbar ─────────────────────────────────── */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-border/40">
                  <span className="text-xs font-medium text-foreground-muted">All comments</span>
                  <span className="flex-1" />

                  {/* ── Filter popover ─────────────────────────── */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", hasFilters && "text-primary")}
                        aria-label="Filter comments"
                      >
                        <Filter className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-60 p-0">
                      <div className="px-3 py-2 text-xs font-medium text-foreground-muted border-b border-border/40">
                        Filter by...
                      </div>
                      <div className="py-1">
                        {FILTER_OPTIONS.map(({ key, label, Icon }) => (
                          <label
                            key={key}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-raised cursor-pointer"
                          >
                            <Icon className="h-4 w-4 text-foreground-muted shrink-0" />
                            <span className="flex-1">{label}</span>
                            <Checkbox
                              checked={filters[key]}
                              onCheckedChange={(checked) =>
                                setFilters((f) => ({
                                  ...f,
                                  [key]: !!checked,
                                }))
                              }
                            />
                          </label>
                        ))}
                      </div>
                      {/* Divider + sub-menu items */}
                      <div className="border-t border-border/40 py-1">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-raised"
                        >
                          <Hash className="h-4 w-4 text-foreground-muted" />
                          <span className="flex-1 text-left">Hashtag</span>
                          <ChevronRight className="h-3.5 w-3.5 text-foreground-muted" />
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-raised"
                        >
                          <User className="h-4 w-4 text-foreground-muted" />
                          <span className="flex-1 text-left">Person</span>
                          <ChevronRight className="h-3.5 w-3.5 text-foreground-muted" />
                        </button>
                      </div>
                      {/* Clear filters — always show */}
                      <div className="border-t border-border/40 py-1">
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="w-full py-2 text-center text-sm text-primary hover:bg-surface-raised"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* ── Sort popover ───────────────────────────── */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", sort !== "timecode" && "text-primary")}
                        aria-label="Sort comments"
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-52 p-0">
                      <div className="px-3 py-2 text-xs font-medium text-foreground-muted border-b border-border/40">
                        Sort thread by...
                      </div>
                      <div className="py-1">
                        {SORT_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSort(value)}
                            className={cn(
                              "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface-raised",
                              sort === value && "text-primary",
                            )}
                          >
                            <span>{label}</span>
                            {sort === value && <Check className="h-3.5 w-3.5 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* ── Search toggle ──────────────────────────── */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-7 w-7", searchOpen && "text-primary")}
                    onClick={() => {
                      setSearchOpen((o) => !o);
                      if (searchOpen) setSearchQuery("");
                    }}
                    aria-label="Search comments"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>

                  {/* ── More options ───────────────────────────── */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-1">
                      <button
                        type="button"
                        onClick={printComments}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-surface-raised"
                      >
                        <Printer className="h-4 w-4 text-foreground-muted" />
                        Print Comments
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* ─── Search bar (slides in) ──────────────────── */}
                {searchOpen && (
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40">
                    <Search className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search comments..."
                      className="h-7 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="text-xs text-foreground-muted hover:text-foreground shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Active filter indicator */}
                {hasFilters && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/5 border-b border-border/40">
                    <span className="text-[11px] text-primary">
                      {Object.values(filters).filter(Boolean).length} filter(s) active
                    </span>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-[11px] text-foreground-muted hover:text-foreground ml-auto"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* ─── Comment list ────────────────────────────── */}
                <div className="flex-1 min-h-0">
                  <CommentsPanel {...props} threads={processedThreads} />
                </div>
              </div>
            ) : (
              /* Fields placeholder */
              <div className="flex-1 flex items-center justify-center text-center text-foreground-muted px-6">
                <p className="text-sm">Field metadata will be available here.</p>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}
