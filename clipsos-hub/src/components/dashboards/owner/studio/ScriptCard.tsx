/**
 * ScriptCard — Card for a single content script.
 *
 * Shows title, body preview, video type, status, and action buttons.
 */
import type { StudioScript } from "@/integrations/supabase/db-types";
import { PillarBadge } from "./PillarBadge";
import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ScriptCardProps {
  script: StudioScript;
  onEdit?: (script: StudioScript) => void;
  onSendToProduction?: (script: StudioScript) => void;
}

export function ScriptCard({ script, onEdit, onSendToProduction }: ScriptCardProps) {
  return (
    <div className="group relative rounded-xl border border-border bg-surface-card p-4 transition-all hover:border-border-strong hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-foreground-strong truncate text-sm">{script.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              {script.video_type && <PillarBadge pillar={script.video_type} />}
              {script.status && (
                <span className="text-xs text-foreground-muted capitalize">{script.status}</span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-surface-card border-border">
            <DropdownMenuItem onClick={() => onEdit?.(script)}>Edit Script</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendToProduction?.(script)}>
              Send to Production
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body preview */}
      {script.body && (
        <p className="mt-3 text-sm text-foreground-muted line-clamp-3 leading-relaxed">
          {script.body}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-foreground-subtle">
        <span>
          {new Date(script.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
