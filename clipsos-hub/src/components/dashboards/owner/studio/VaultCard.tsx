/**
 * VaultCard — Card for a content vault reference entry.
 *
 * Shows title, content preview, category badge, tags, and source link.
 */
import type { ContentVaultEntry } from "@/integrations/supabase/db-types";
import { ExternalLink, Bookmark, Tag } from "lucide-react";

interface VaultCardProps {
  entry: ContentVaultEntry;
  onEdit?: (entry: ContentVaultEntry) => void;
}

export function VaultCard({ entry, onEdit }: VaultCardProps) {
  return (
    <div
      className="group relative rounded-xl border border-border bg-surface-card p-4 transition-all hover:border-border-strong hover:shadow-md cursor-pointer"
      onClick={() => onEdit?.(entry)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Bookmark className="h-4 w-4 text-amber-400" />
          </div>
          <h4 className="font-medium text-foreground-strong truncate text-sm">{entry.title}</h4>
        </div>

        {entry.source_url && (
          <a
            href={entry.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-foreground-muted hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Content preview */}
      {entry.content && (
        <p className="mt-3 text-sm text-foreground-muted line-clamp-2 leading-relaxed">
          {entry.content}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {entry.category && (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-violet-500/15 text-violet-400">
              {entry.category}
            </span>
          )}
          {entry.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-foreground-subtle bg-surface-muted"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
          {(entry.tags?.length ?? 0) > 2 && (
            <span className="text-xs text-foreground-subtle">+{(entry.tags?.length ?? 0) - 2}</span>
          )}
        </div>
        <span className="text-xs text-foreground-subtle shrink-0">
          {new Date(entry.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
