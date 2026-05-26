/**
 * TypeDistributionChart — Donut chart showing video type breakdown.
 *
 * Design: Cohesive cool palette matching the bar chart. Interactive
 * hover with synced legend, dynamic center label, custom tooltip.
 */
import { useState, useMemo, useCallback } from "react";
import { Cell, Pie, PieChart, Label, ResponsiveContainer, Tooltip } from "recharts";
import type { TypeDistribution } from "@/hooks/use-hq-analytics";

interface TypeDistributionChartProps {
  data: TypeDistribution[];
}

// Same cohesive palette as StatusBarChart
const COLORS = [
  "#818cf8", // indigo-400
  "#60a5fa", // blue-400
  "#22d3ee", // cyan-400
  "#34d399", // emerald-400
  "#a78bfa", // violet-400
  "#fbbf24", // amber-400
  "#fb923c", // orange-400
  "#f472b6", // pink-400
  "#4ade80", // green-400
];

export function TypeDistributionChart({ data }: TypeDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data]);

  const handleMouseEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      {/* Donut */}
      <div className="h-[240px] w-[240px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<DonutTooltip total={total} />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={58}
              outerRadius={95}
              strokeWidth={2}
              stroke="var(--surface-card)"
              paddingAngle={3}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              animationDuration={800}
              style={{ cursor: "pointer" }}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.slug}
                  fill={COLORS[i % COLORS.length]}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.3}
                  style={{ transition: "opacity 200ms ease" }}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const activeItem = activeIndex !== null ? data[activeIndex] : null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 6}
                          className="fill-foreground-strong text-2xl font-bold"
                        >
                          {activeItem ? activeItem.count : total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 16}
                          className="fill-muted-foreground text-[11px]"
                        >
                          {activeItem ? activeItem.name : "Videos"}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="mb-1 text-[11px] font-medium text-muted-foreground">Breakdown</p>
        {data.map((item, i) => {
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
          const isActive = activeIndex === i;
          return (
            <div
              key={item.slug}
              className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-all duration-200 cursor-pointer ${
                isActive ? "bg-surface-overlay/60" : "hover:bg-surface-overlay/30"
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 truncate text-xs text-foreground-strong">{item.name}</span>
              <span className="text-xs font-medium tabular-nums text-foreground-strong">
                {item.count}
              </span>
              <span className="min-w-[36px] text-right text-[10px] tabular-nums text-muted-foreground">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Custom tooltip ── */
function DonutTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: any[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as TypeDistribution;
  const idx = (payload[0] as any)?.dataIndex ?? 0;
  const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-lg border border-border/60 bg-surface-card px-3.5 py-2.5 shadow-xl shadow-black/20">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
        />
        <span className="text-xs font-semibold text-foreground-strong">{item.name}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-display text-lg font-bold tabular-nums text-foreground-strong">
          {item.count}
        </span>
        <span className="text-[11px] text-muted-foreground">videos</span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">{pct}%</span>
      </div>
    </div>
  );
}
