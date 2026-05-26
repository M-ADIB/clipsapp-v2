/**
 * ProductionBoard — Senior editor's Kanban overview of all active productions.
 *
 * Layout:
 *   ┌─ 5 Kanban columns (scrollable horizontal on mobile) ────────────┐
 *   │  Scripting → Recording → Editing → Review → Published          │
 *   │  Each card: title, editor, client, days in stage                │
 *   └─────────────────────────────────────────────────────────────────┘
 */
import { useEffect } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { GripVertical } from "lucide-react";

import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ProductionCard {
  id: string;
  title: string;
  editor: string;
  client: string;
  daysInStage: number;
}

interface KanbanColumn {
  key: string;
  label: string;
  color: string;
  dotColor: string;
  cards: ProductionCard[];
}

/* ------------------------------------------------------------------ */
/* Mock Data                                                           */
/* ------------------------------------------------------------------ */

const COLUMNS: KanbanColumn[] = [
  {
    key: "scripting",
    label: "Scripting",
    color: "color-mix(in srgb, var(--status-info) 15%, transparent)",
    dotColor: "var(--status-info)",
    cards: [
      {
        id: "s1",
        title: "Brand Story — Ep. 4",
        editor: "Kareem A.",
        client: "Ajmal Perfumes",
        daysInStage: 2,
      },
      {
        id: "s2",
        title: "Product Showcase — Ring",
        editor: "Sarah L.",
        client: "HomeTech UAE",
        daysInStage: 1,
      },
    ],
  },
  {
    key: "recording",
    label: "Recording",
    color: "color-mix(in srgb, var(--status-review) 15%, transparent)",
    dotColor: "var(--status-review)",
    cards: [
      {
        id: "r1",
        title: "Office Tour — Ep. 3",
        editor: "Youssef M.",
        client: "DIFC Towers",
        daysInStage: 3,
      },
      {
        id: "r2",
        title: "Testimonial — Rashid",
        editor: "Kareem A.",
        client: "Dubai Properties",
        daysInStage: 1,
      },
      {
        id: "r3",
        title: "Event Recap — Summit",
        editor: "Sarah L.",
        client: "FinTech Hub",
        daysInStage: 4,
      },
    ],
  },
  {
    key: "editing",
    label: "Editing",
    color: "color-mix(in srgb, var(--status-warning) 15%, transparent)",
    dotColor: "var(--status-warning)",
    cards: [
      {
        id: "e1",
        title: "Brand Launch — Hook A",
        editor: "Kareem A.",
        client: "Ajmal Perfumes",
        daysInStage: 1,
      },
      {
        id: "e2",
        title: "Brand Launch — Hook B",
        editor: "Kareem A.",
        client: "Ajmal Perfumes",
        daysInStage: 1,
      },
      {
        id: "e3",
        title: "Smart Lock Demo",
        editor: "Youssef M.",
        client: "HomeTech UAE",
        daysInStage: 2,
      },
    ],
  },
  {
    key: "review",
    label: "Review",
    color: "color-mix(in srgb, var(--status-danger) 15%, transparent)",
    dotColor: "var(--status-danger)",
    cards: [
      {
        id: "rv1",
        title: "Quarterly Recap — Q1",
        editor: "Sarah L.",
        client: "FinTech Hub",
        daysInStage: 2,
      },
      {
        id: "rv2",
        title: "Coral Bay Resort",
        editor: "Youssef M.",
        client: "Dubai Properties",
        daysInStage: 5,
      },
    ],
  },
  {
    key: "published",
    label: "Published",
    color: "color-mix(in srgb, var(--status-success) 15%, transparent)",
    dotColor: "var(--status-success)",
    cards: [
      {
        id: "p1",
        title: "Amber Oud Showcase",
        editor: "Kareem A.",
        client: "Ajmal Perfumes",
        daysInStage: 0,
      },
      {
        id: "p2",
        title: "Social Reel — BTS",
        editor: "Sarah L.",
        client: "Ajmal Perfumes",
        daysInStage: 0,
      },
      {
        id: "p3",
        title: "Harbor Point Marina",
        editor: "Youssef M.",
        client: "Dubai Properties",
        daysInStage: 0,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function KanbanCard({ card, dotColor }: { card: ProductionCard; dotColor: string }) {
  const isOverdue = card.daysInStage >= 4;
  return (
    <div className="group flex cursor-grab flex-col gap-2 rounded-lg bg-surface-card p-3 transition-shadow hover:shadow-lg active:cursor-grabbing">
      <div className="flex items-start justify-between">
        <h4 className="text-xs font-medium leading-tight text-foreground-strong">{card.title}</h4>
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-foreground-disabled opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-foreground-strong"
          style={{ background: dotColor }}
        >
          {card.editor.split(" ")[0][0]}
          {card.editor.split(" ")[1]?.[0] ?? ""}
        </div>
        <span className="text-[10px] text-foreground-muted">{card.editor}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-foreground-disabled">{card.client}</span>
        {card.daysInStage > 0 && (
          <span
            className={`text-[10px] font-medium ${isOverdue ? "text-status-danger" : "text-foreground-muted"}`}
          >
            {card.daysInStage}d
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function ProductionBoard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Production Board" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  return (
    <FullBleed>
      <div className="flex flex-col gap-4 px-3 py-5 md:px-5 md:py-6">
        {/* Summary strip */}
        <div className="flex flex-wrap items-center gap-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.dotColor }} />
              <span className="text-xs text-foreground-muted">{col.label}</span>
              <span className="text-xs font-semibold text-foreground-strong">
                {col.cards.length}
              </span>
            </div>
          ))}
        </div>

        {/* Kanban board */}
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="flex w-[260px] shrink-0 flex-col gap-2 rounded-xl p-3 lg:w-auto lg:flex-1"
              style={{ background: col.color }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-1 pb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: col.dotColor }}
                  />
                  <span className="text-xs font-semibold text-foreground-strong">{col.label}</span>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-card text-[10px] font-bold text-foreground-muted">
                  {col.cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {col.cards.map((card) => (
                  <KanbanCard key={card.id} card={card} dotColor={col.dotColor} />
                ))}
              </div>

              {/* Add card button */}
              <button
                className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed py-2 text-[11px] text-foreground-disabled transition-colors hover:border-primary/40 hover:text-primary"
                style={{ borderColor: "var(--border)" }}
              >
                + Add video
              </button>
            </div>
          ))}
        </div>
      </div>
    </FullBleed>
  );
}
