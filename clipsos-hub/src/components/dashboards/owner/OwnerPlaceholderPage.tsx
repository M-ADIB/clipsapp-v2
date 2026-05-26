/**
 * OwnerPlaceholderPage — Temporary placeholder for owner sub-pages
 * that haven't been built yet. Shows a clean "coming soon" state
 * so navigation doesn't 404.
 */

interface OwnerPlaceholderPageProps {
  title: string;
  description?: string;
}

export function OwnerPlaceholderPage({
  title,
  description = "This page is under construction.",
}: OwnerPlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex min-h-[500px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-surface-card/30">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised">
            <span className="text-2xl">🚧</span>
          </div>
          <span className="text-sm font-medium text-foreground-subtle">{title}</span>
          <span className="max-w-xs text-center text-xs text-foreground-disabled">
            {description}
          </span>
        </div>
      </div>
    </div>
  );
}
