/**
 * WeeklyTrendChart — Area chart showing completed videos over the last 4 weeks.
 *
 * Improvements:
 *  - Better axis contrast (white text)
 *  - Animated gradient with glow
 *  - Interactive dots with enlarged activeDot
 *  - Custom tooltip with delta indicator
 */
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { WeeklyTrendPoint } from "@/hooks/use-hq-analytics";

interface WeeklyTrendChartProps {
  data: WeeklyTrendPoint[];
}

const STROKE_COLOR = "#818cf8"; // indigo-400 — great on dark
const FILL_START = "rgba(129, 140, 248, 0.35)";
const FILL_END = "rgba(129, 140, 248, 0.0)";

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  // Compute week-over-week delta for tooltip
  const enriched = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        delta: i > 0 ? d.count - data[i - 1].count : 0,
        deltaLabel:
          i > 0
            ? d.count - data[i - 1].count >= 0
              ? `+${d.count - data[i - 1].count}`
              : `${d.count - data[i - 1].count}`
            : "—",
      })),
    [data],
  );

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={enriched} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={FILL_START} />
              <stop offset="100%" stopColor={FILL_END} />
            </linearGradient>
            {/* Glow filter */}
            <filter id="trendGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={STROKE_COLOR} floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glowColor" />
              <feMerge>
                <feMergeNode in="glowColor" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--foreground-strong)",
              fontSize: 12,
              fontWeight: 500,
              opacity: 0.85,
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--foreground-strong)",
              fontSize: 11,
              fontWeight: 500,
              opacity: 0.7,
            }}
            width={32}
            allowDecimals={false}
          />
          <Tooltip content={<TrendTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke={STROKE_COLOR}
            strokeWidth={2.5}
            fill="url(#trendGrad)"
            dot={{
              r: 5,
              fill: STROKE_COLOR,
              stroke: "var(--surface-card)",
              strokeWidth: 2,
              filter: "url(#trendGlow)",
            }}
            activeDot={{
              r: 7,
              fill: STROKE_COLOR,
              stroke: "white",
              strokeWidth: 2,
            }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Custom tooltip ── */
function TrendTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as {
    label: string;
    count: number;
    delta: number;
    deltaLabel: string;
  };

  return (
    <div className="rounded-lg border border-border/60 bg-surface-card px-3.5 py-2.5 shadow-xl shadow-black/20">
      <p className="text-[11px] font-medium text-muted-foreground">{d.label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-lg font-bold tabular-nums text-foreground-strong">
          {d.count}
        </span>
        <span className="text-[11px] text-muted-foreground">completed</span>
      </div>
      {d.deltaLabel !== "—" && (
        <p
          className={`mt-0.5 text-[11px] font-semibold tabular-nums ${
            d.delta >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {d.deltaLabel} vs prev week
        </p>
      )}
    </div>
  );
}
