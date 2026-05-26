/**
 * ToolPill — visual indicator for an in-progress or completed AI tool call.
 *
 * "Checking videos…" while running, "✓ Checked videos — 12 found" when done.
 * Friendly labels keep internal tool names (e.g. `list_videos`) out of the UI.
 */
import { Check, Loader2 } from "lucide-react";
import type { ClipsToolEvent } from "@/hooks/use-clips-chat";

const TOOL_LABELS: Record<string, string> = {
  get_business_kpis: "Checking business KPIs",
  list_clients: "Looking up clients",
  get_client_summary: "Pulling client summary",
  list_videos: "Looking up videos",
  get_video_details: "Reading video details",
  list_leads: "Looking up leads",
  list_deals: "Reviewing the pipeline",
  get_today_priorities: "Checking today's priorities",
  get_team_workload: "Sizing up team workload",
  describe_database_schema: "Looking at the data",
  query_database: "Querying records",
  aggregate_database: "Crunching numbers",
};

export function ToolPill({ event }: { event: ClipsToolEvent }) {
  const isRunning = event.status === "running";
  const label = TOOL_LABELS[event.name] || event.name.replace(/_/g, " ");
  return (
    <div className="inline-block">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${
          isRunning ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {isRunning ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
        <span className="font-medium">{label}</span>
        {!isRunning && event.summary && <span className="opacity-60">— {event.summary}</span>}
      </div>
    </div>
  );
}
