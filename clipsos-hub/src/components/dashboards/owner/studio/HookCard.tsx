/**
 * HookCard — Card for a studio hook entry.
 */
import type { StudioHook } from "@/integrations/supabase/db-types";
import { Zap } from "lucide-react";

interface HookCardProps {
  hook: StudioHook;
}

export function HookCard({ hook }: HookCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-surface-card p-4 transition-all hover:border-border-strong hover:shadow-md">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
          <Zap className="h-4 w-4 text-rose-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground-strong leading-relaxed">"{hook.hook_text}"</p>
          <div className="mt-2 flex items-center gap-2">
            {hook.category && (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-rose-500/15 text-rose-400">
                {hook.category}
              </span>
            )}
            {hook.source && (
              <span className="text-xs text-foreground-subtle">via {hook.source}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
