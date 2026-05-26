/**
 * EmptyState — first-load greeting + 4 random suggested prompts.
 *
 * Prompts are tuned for a video-production agency operator (ClipsOS context),
 * not a clinic.
 */
import { useMemo } from "react";
import { Sparkles } from "lucide-react";

const PROMPT_POOL = [
  "How are we doing this week?",
  "Which clients need attention?",
  "Show me videos in production right now.",
  "What's overdue today?",
  "How much MRR are we running?",
  "Which editor has the heaviest workload?",
  "List clients who haven't paid this month.",
  "Show me the deal pipeline.",
  "How many videos shipped last month?",
  "Which leads should I follow up on?",
  "What's our average video turnaround time?",
  "Compare this month's revenue to last month.",
  "Top 5 clients by video volume.",
  "Which videos are stuck waiting on client review?",
  "Show me today's priorities.",
];

interface Props {
  onPick: (q: string) => void;
  displayName?: string | null;
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function EmptyState({ onPick, displayName }: Props) {
  const suggestions = useMemo(() => {
    const shuffled = [...PROMPT_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, []);

  const greeting = displayName ? `${timeGreeting()}, ${displayName}.` : `${timeGreeting()}.`;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/20">
        <Sparkles size={24} className="text-primary" />
      </div>
      <h1 className="mb-1.5 text-lg font-semibold text-foreground">{greeting}</h1>
      <p className="mb-5 max-w-md text-xs text-foreground-muted">
        I'm Clips. Ask me about your clients, videos, pipeline, or how the agency is performing.
      </p>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-surface-input"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
