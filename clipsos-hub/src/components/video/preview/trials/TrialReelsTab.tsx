/**
 * TrialReelsTab — list trial hook variants for the current video.
 *
 * Selecting a trial swaps the player source temporarily; a "Back to main"
 * affordance is rendered by the parent modal when a trial is active.
 */
import { Crown, PlayCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { TrialReel } from "../hooks/use-trial-reels";

interface TrialReelsTabProps {
  trials: TrialReel[];
  isLoading: boolean;
  activeTrialId: string | null;
  onPlayTrial: (trial: TrialReel | null) => void;
}

export function TrialReelsTab({
  trials,
  isLoading,
  activeTrialId,
  onPlayTrial,
}: TrialReelsTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-foreground-muted">
        Loading trials…
      </div>
    );
  }

  if (trials.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <Sparkles className="h-6 w-6 text-foreground-muted" />
        <p className="text-sm font-medium">No trial hooks yet</p>
        <p className="text-xs text-foreground-muted">
          Trial reels let you A/B test alternative hooks for this video.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-3">
        {activeTrialId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-start gap-2"
            onClick={() => onPlayTrial(null)}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Back to main video
          </Button>
        )}

        {trials.map((trial) => {
          const isActive = trial.id === activeTrialId;
          return (
            <Button
              key={trial.id}
              type="button"
              variant="ghost"
              onClick={() => onPlayTrial(trial)}
              className={cn(
                "group flex h-auto w-full items-start gap-3 rounded-md border border-border/60 p-2 text-left transition-colors hover:bg-surface-raised",
                isActive && "border-primary/60 bg-primary/5",
              )}
              aria-label={`Play trial ${trial.trial_number}${trial.is_winner ? " (winner)" : ""}`}
              aria-pressed={isActive}
            >
              {trial.hook_thumbnail_url ? (
                <img
                  src={trial.hook_thumbnail_url}
                  alt={`Trial ${trial.trial_number}`}
                  className="h-14 w-24 shrink-0 rounded object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded bg-surface-raised">
                  <PlayCircle className="h-5 w-5 text-foreground-muted" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">Trial {trial.trial_number}</span>
                  {trial.is_winner && <Crown className="h-3 w-3 text-status-warning" />}
                </div>
                {trial.hook_description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-foreground-muted">
                    {trial.hook_description}
                  </p>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
