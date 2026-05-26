/**
 * OutboxTab — merged History + Scheduled view with second-line sub-tabs.
 *
 * Combines the two previously separate tabs into one unified "Outbox"
 * with two internal sub-tabs: "Scheduled" and "History".
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { HistoryTab } from "./HistoryTab";
import { ScheduledTab } from "./ScheduledTab";

type SubTab = "scheduled" | "history";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "scheduled", label: "Scheduled" },
  { key: "history", label: "History" },
];

export function OutboxTab() {
  const [subTab, setSubTab] = useState<SubTab>("scheduled");

  return (
    <div className="space-y-4">
      {/* Second-line sub-tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-surface-card/60 p-1 w-fit">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSubTab(t.key)}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-medium transition-all",
              subTab === t.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground-subtle hover:text-foreground hover:bg-surface-raised/60",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {subTab === "scheduled" && <ScheduledTab />}
      {subTab === "history" && <HistoryTab />}
    </div>
  );
}
