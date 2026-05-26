/**
 * TemplatesTab — list of templates with quick-open into the Editor tab.
 * Also supports creating new templates and basic edit/delete via the Editor.
 */
import { Mail, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EmailTemplate } from "@/hooks/use-email-templates";
import { Loader2 } from "lucide-react";

interface TemplatesTabProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onPick: (id: string) => void;
  onNew: () => void;
}

export function TemplatesTab({ templates, isLoading, onPick, onNew }: TemplatesTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-foreground-subtle" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-card/30 p-12 text-center">
        <Mail className="mx-auto mb-3 h-8 w-8 text-foreground-disabled" />
        <h3 className="text-base font-medium text-foreground">No templates yet</h3>
        <p className="mt-1 text-sm text-foreground-subtle">
          Run the Phase 1 SQL to seed starter templates, or click the card below to create one from
          scratch.
        </p>
        <button
          onClick={onNew}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          New template
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onPick(t.id)}
          className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-surface-card p-5 text-left transition-all hover:border-border-strong hover:bg-surface-raised"
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            {t.category && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                {t.category}
              </Badge>
            )}
          </div>
          <div>
            <h3 className="font-medium text-foreground">{t.name}</h3>
            <p className="mt-0.5 text-xs text-foreground-disabled">
              slug: <span className="font-mono">{t.slug}</span>
            </p>
          </div>
          <p className="line-clamp-2 text-sm text-foreground-subtle">{t.subject}</p>
        </button>
      ))}

      <button
        onClick={onNew}
        className="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-card/20 p-5 text-foreground-disabled transition-colors hover:border-border-strong hover:text-foreground-subtle"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <Plus className="h-5 w-5" />
          <span className="text-xs font-medium">New template</span>
        </div>
      </button>
    </div>
  );
}
