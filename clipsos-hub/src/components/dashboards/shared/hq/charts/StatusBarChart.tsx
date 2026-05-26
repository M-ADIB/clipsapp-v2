/**
 * StatusBarChart — Vertical bar chart showing video count by status.
 *
 * Design: Single-hue blue-to-teal gradient ramp for cohesion.
 * Uses DB colors only for the tooltip indicator dot.
 * Better contrast: white axis labels, click-to-isolate, custom tooltip.
 */
import { useState, useMemo, useCallback } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { StatusBreakdown } from "@/hooks/use-hq-analytics";

interface StatusBarChartProps {
  data: StatusBreakdown[];
}

// Cohesive single-ramp palette (cool blue → teal)
const BAR_PALETTE = [
  "#6366f1", // indigo
  "#818cf8", // indigo-400
  "#60a5fa", // blue-400
  "#38bdf8", // sky-400
  "#22d3ee", // cyan-400
  "#2dd4bf", // teal-400
  "#34d399", // emerald-400
  "#4ade80", // green-400
  "#a3e635", // lime-400
  "#fbbf24", // amber-400 (for terminal stages)
  "#fb923c", // orange-400
];

export function StatusBarChart({ data }: StatusBarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

  const handleClick = useCallback((_: unknown, index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 28, right: 8, bottom: 8, left: 0 }} barGap={4}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--border)" />
          <XAxis
            dataKey="displayName"
            tickLine={false}
            axisLine={false}
            tick={<CustomXAxisTick />}
            interval={0}
            height={48}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--foreground-strong)",
              fontSize: 11,
              fontWeight: 500,
            }}
            width={36}
          />
          <Tooltip
            content={<CustomTooltip total={total} />}
            cursor={{ fill: "rgba(128,128,128,0.08)", radius: 6 }}
          />
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            animationDuration={800}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            {data.map((entry, idx) => (
              <Cell
                key={entry.slug}
                fill={BAR_PALETTE[idx % BAR_PALETTE.length]}
                opacity={activeIndex === null || activeIndex === idx ? 1 : 0.25}
                stroke={activeIndex === idx ? BAR_PALETTE[idx % BAR_PALETTE.length] : "transparent"}
                strokeWidth={activeIndex === idx ? 1.5 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Custom X-axis tick with better contrast ── */
function CustomXAxisTick(props: any) {
  const { x, y, payload } = props;
  const label = payload?.value ?? "";
  const truncated = label.length > 14 ? label.slice(0, 13) + "…" : label;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="var(--foreground-strong)"
        fontSize={11}
        fontWeight={500}
        opacity={0.85}
      >
        {truncated}
      </text>
    </g>
  );
}

/* ── Custom tooltip ── */
function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: any[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as StatusBreakdown;
  const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-lg border border-border/60 bg-surface-card px-3.5 py-2.5 shadow-xl shadow-black/20">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="text-xs font-semibold text-foreground-strong">{item.displayName}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-display text-lg font-bold tabular-nums text-foreground-strong">
          {item.count}
        </span>
        <span className="text-[11px] text-muted-foreground">videos</span>
        <span className="ml-auto rounded-full bg-surface-overlay px-2 py-0.5 text-[10px] font-semibold tabular-nums text-foreground-strong">
          {pct}%
        </span>
      </div>
    </div>
  );
}
