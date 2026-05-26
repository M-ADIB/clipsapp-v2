/**
 * SparklineBar — Interactive mini bar chart with tooltips.
 *
 * Used inside StatCard for Gross Volume, Net Volume, Monthly Recurring.
 * Bars fade from transparent (oldest) → solid (current month).
 * Now uses Recharts for hover tooltips and animated entry.
 */
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SparklineBarProps {
  /** Array of values (any numeric scale — chart auto-normalizes) */
  data: number[];
  /** Color scheme */
  color?: "accent" | "success";
  /** Bar height in px (chart area) */
  height?: number;
}

const COLOR_MAP = {
  accent: {
    solid: "var(--primary)",
    muted: "color-mix(in oklab, var(--primary) 35%, transparent)",
    cursor: "color-mix(in oklab, var(--primary) 8%, transparent)",
  },
  success: {
    solid: "#E7E384",
    muted: "rgba(231, 227, 132, 0.3)",
    cursor: "rgba(231, 227, 132, 0.08)",
  },
};

function MiniTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-md px-2.5 py-1.5 shadow-lg"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
      }}
    >
      {label && <p className="text-[9px] font-medium text-foreground-muted">{label}</p>}
      <p className="text-xs font-semibold text-foreground-strong">
        AED {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function SparklineBar({ data, color = "accent", height = 72 }: SparklineBarProps) {
  const config = COLOR_MAP[color];

  // Generate month labels working backwards from current month
  const now = new Date();
  const chartData = data.map((val, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (data.length - 1 - i), 1);
    return {
      name: d.toLocaleString("default", { month: "short" }),
      value: Math.round(val),
    };
  });

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Tooltip
            content={({ active, payload, label }) => (
              <MiniTooltip
                active={active}
                payload={payload as Array<{ value: number }>}
                label={label}
              />
            )}
            cursor={{ fill: config.cursor, radius: 3 }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} animationDuration={600}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={i === chartData.length - 1 ? config.solid : config.muted} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
