/**
 * ContentVideoCard — Card for CC production board.
 * Shows caption, text_hook, freebie_word, freebie_content prominently.
 */
import { Clock, Copy, Check, MessageSquareText, Sparkles, Gift, Type } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { CCBoardVideo, CCTeamMember } from "./cc-board-helpers";
import { getDaysInStatus, getDaysColor, getInitials } from "./cc-board-helpers";

function mapSlugToVariant(slug: string): "in_review" | "approved" | "posted" | "pending" | "draft" {
  if (["posted", "published", "scheduled"].includes(slug)) return "posted";
  if (["approved"].includes(slug)) return "approved";
  if (
    [
      "in_review",
      "internal_review",
      "final_review",
      "changes_requested",
      "revisions_requested",
    ].includes(slug)
  )
    return "in_review";
  if (["in_progress", "assigned", "editing", "rough_cut", "pending", "new"].includes(slug))
    return "pending";
  return "draft";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-0.5 rounded hover:bg-surface-raised transition-colors"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 text-foreground-disabled hover:text-foreground-muted" />
      )}
    </button>
  );
}

interface Props {
  video: CCBoardVideo;
  editorIds: string[];
  teamMap: Map<string, CCTeamMember>;
  onClick: () => void;
}

export function ContentVideoCard({ video, editorIds, teamMap, onClick }: Props) {
  const days = getDaysInStatus(video.updated_at);
  const daysColor = getDaysColor(days);
  const rawSlug = video.status?.slug ?? "draft";
  const badgeVariant = mapSlugToVariant(rawSlug);

  const editors = editorIds.map((eid) => teamMap.get(eid)).filter((t): t is CCTeamMember => !!t);
  const hasCaption = video.caption && video.caption.trim().length > 0;
  const hasHook = video.text_hook && video.text_hook.trim().length > 0;
  const hasKeyword = video.freebie_word && video.freebie_word.trim().length > 0;
  const hasFreebie = video.freebie_content && video.freebie_content.trim().length > 0;

  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col gap-2 rounded-xl border border-border bg-surface-card p-3.5 text-left transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
    >
      {/* Status + Days */}
      <div className="flex items-start justify-between gap-2">
        <StatusBadge variant={badgeVariant} label={video.status?.display_name ?? "Draft"} />
        <span className={`text-[10px] flex items-center gap-1 ${daysColor}`}>
          <Clock className="h-3 w-3" />
          {days === 0 ? "Today" : `${days}d`}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground-strong line-clamp-2 leading-snug">
        {video.video_title}
      </p>

      {/* Client */}
      <div className="flex items-center gap-2">
        {video.client && (
          <div className="flex items-center gap-1.5 min-w-0">
            {video.client.logo_url ? (
              <img
                src={video.client.logo_url}
                alt=""
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[7px] font-bold text-primary">
                {getInitials(video.client.name)}
              </div>
            )}
            <span className="text-xs text-foreground-muted truncate max-w-[100px]">
              {video.client.name}
            </span>
          </div>
        )}
        {video.video_type && (
          <>
            <span className="text-foreground-disabled text-[10px]">·</span>
            <span className="text-[9px] font-medium uppercase tracking-wider text-foreground-disabled">
              {video.video_type.display_name}
            </span>
          </>
        )}
      </div>

      {/* ── Content Fields ── */}
      <div className="flex flex-col gap-1.5 pt-1.5 border-t border-border">
        {/* Caption */}
        <div className="flex items-start gap-1.5">
          <MessageSquareText className="h-3 w-3 text-foreground-disabled mt-0.5 shrink-0" />
          {hasCaption ? (
            <div className="flex-1 min-w-0 flex items-start gap-1">
              <p className="text-[10px] text-foreground-muted line-clamp-2 flex-1">
                {video.caption}
              </p>
              <CopyButton text={video.caption!} />
            </div>
          ) : (
            <span className="text-[10px] text-foreground-disabled italic">No caption</span>
          )}
          {video.caption_approved && (
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
              ✓ Approved
            </span>
          )}
        </div>

        {/* Text Hook */}
        {hasHook && (
          <div className="flex items-start gap-1.5">
            <Type className="h-3 w-3 text-foreground-disabled mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0 flex items-start gap-1">
              <p className="text-[10px] text-foreground-muted line-clamp-1 flex-1">
                <span className="font-medium text-foreground-strong">Hook:</span> {video.text_hook}
              </p>
              <CopyButton text={video.text_hook!} />
            </div>
          </div>
        )}

        {/* Freebie Keyword */}
        {hasKeyword && (
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-foreground-disabled shrink-0" />
            <span className="text-[10px] text-foreground-muted">
              <span className="font-medium text-foreground-strong">Keyword:</span>{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-mono text-primary">
                {video.freebie_word}
              </code>
            </span>
            <CopyButton text={video.freebie_word!} />
          </div>
        )}

        {/* Lead Magnet */}
        {hasFreebie && (
          <div className="flex items-start gap-1.5">
            <Gift className="h-3 w-3 text-foreground-disabled mt-0.5 shrink-0" />
            <p className="text-[10px] text-foreground-muted line-clamp-1 flex-1">
              <span className="font-medium text-foreground-strong">Lead Magnet:</span>{" "}
              {video.freebie_content}
            </p>
          </div>
        )}
      </div>

      {/* Footer: Editors + Post Date */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border">
        <div className="flex items-center gap-1.5">
          {editors.length > 0 ? (
            <div className="flex items-center -space-x-1.5">
              {editors.slice(0, 2).map((ed) => (
                <div
                  key={ed.id}
                  title={ed.full_name ?? "Editor"}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[8px] font-bold text-primary border border-surface-card"
                >
                  {getInitials(ed.full_name ?? "?")}
                </div>
              ))}
              {editors.length > 2 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised text-[8px] font-bold text-foreground-muted border border-surface-card">
                  +{editors.length - 2}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-foreground-disabled">Unassigned</span>
          )}
        </div>
        {video.post_date && (
          <span className="text-[9px] text-foreground-disabled">
            📅{" "}
            {new Date(video.post_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        )}
      </div>
    </button>
  );
}
