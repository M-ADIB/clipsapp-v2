/**
 * NoteCard — Obsidian-style note card for internal notes/memos.
 *
 * Shows: header (avatar initials + name + date), body (title + description),
 * progress visual, footer (author dot + name + action icons).
 *
 * Used in: Client Workspace/Notes, Content Creator/Notes, Editor/Notes.
 *
 * From Figma: "Article - The Obsidian Note Card" component.
 */

interface NoteCardProps {
  /** Note author name / workspace — e.g. "Ajmal Perfumes" */
  authorName: string;
  /** Author initials for avatar — e.g. "SK" */
  authorInitials: string;
  /** Date label — e.g. "Today", "2 days ago" */
  dateLabel: string;
  /** Note title (rendered in accent green) — e.g. "Thumbnail Design" */
  title: string;
  /** Note body text */
  body: string;
  /** Footer author name (who wrote it) — e.g. "Sachin" */
  footerAuthor?: string;
  onClick?: () => void;
}

export function NoteCard({
  authorName,
  authorInitials,
  dateLabel,
  title,
  body,
  footerAuthor,
  onClick,
}: NoteCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col overflow-hidden rounded-[18px] border border-[rgba(72,72,71,0.2)] bg-surface-card text-left shadow-[0px_23px_46px_-11px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.01]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(72,72,71,0.1)] px-[22px] py-[22px]">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted">
            <span className="text-[11px] font-normal uppercase tracking-wider text-primary">
              {authorInitials}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-normal text-foreground-strong">{authorName}</span>
            <span className="text-[8px] font-normal uppercase tracking-wider text-foreground-disabled">
              {dateLabel}
            </span>
          </div>
        </div>
        {/* More icon */}
        <span className="text-foreground-disabled">⋯</span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-[29px] py-[29px]">
        <h3 className="text-[18px] font-semibold leading-7 tracking-tight text-primary">{title}</h3>
        <p className="text-[14px] font-normal leading-[115%] text-foreground-strong">{body}</p>
      </div>

      {/* Progress dot visual */}
      <div className="px-[29px] pb-[29px]">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= 3 ? "bg-primary" : "bg-surface-muted"}`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-sidebar px-[22px] py-[22px]">
        <div className="flex items-center gap-2">
          <div className="h-[7px] w-[7px] rounded-full bg-primary" />
          <span className="text-body text-foreground-muted">{footerAuthor}</span>
        </div>
        <div className="flex gap-4">
          {/* Action icons placeholder */}
          <span className="text-foreground-disabled">📎</span>
          <span className="text-foreground-disabled">💬</span>
        </div>
      </div>
    </button>
  );
}
