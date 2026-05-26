/**
 * GrowthChart — Platform bar chart with glow effect for Growth Insights.
 *
 * Shows: total views headline, bar chart (inactive=dark, last 2 bars=glowing),
 * platform breakdown row (TikTok, Instagram, YouTube counts).
 *
 * Used in: Client Workspace/Growth Insights, Client Dashboard/Analytics.
 */

interface PlatformStat {
  label: string;
  value: string;
}

interface GrowthChartProps {
  /** Big headline number — e.g. "47.2k" */
  totalViews: string;
  /** Bar heights (7 values, last 2 get glow) */
  bars: number[];
  /** Platform breakdown */
  platforms: PlatformStat[];
  /** Subtitle — e.g. "Total views across all platforms" */
  subtitle?: string;
}

export function GrowthChart({ totalViews, bars, platforms, subtitle }: GrowthChartProps) {
  const maxBar = Math.max(...bars, 1);

  return (
    <div className="flex flex-col rounded-lg bg-surface-card p-0">
      {/* Header */}
      <div className="px-5 pt-5">
        <span className="font-display text-[32px] font-medium tracking-tight text-foreground-strong">
          {totalViews}
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-center gap-1 px-8 pt-6" style={{ height: 100 }}>
        {bars.map((val, i) => {
          const height = (val / maxBar) * 80;
          const isGlowAccent = i === bars.length - 2;
          const isGlowSuccess = i === bars.length - 1;

          let bgStyle: React.CSSProperties;
          if (isGlowAccent) {
            bgStyle = {
              height,
              backgroundColor: "var(--primary-glow)",
              boxShadow: "0px 0px 15px var(--primary-soft)",
            };
          } else if (isGlowSuccess) {
            bgStyle = {
              height,
              backgroundColor: "#E8FFBF",
              boxShadow: "0px 0px 15px rgba(232, 255, 191, 0.3)",
            };
          } else {
            bgStyle = {
              height,
              backgroundColor: "var(--surface-muted)",
            };
          }

          return <div key={i} className="flex-1 rounded-t-sm" style={bgStyle} />;
        })}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="px-5 pt-4">
          <span className="text-body text-foreground-disabled">{subtitle}</span>
        </div>
      )}

      {/* Platform breakdown */}
      <div className="flex items-center justify-between px-6 pb-6 pt-5">
        {platforms.map((p) => (
          <div key={p.label} className="flex flex-col items-center gap-1">
            <span className="text-body-lg font-medium text-foreground-subtle">{p.label}</span>
            <span className="font-display text-[26px] font-medium tracking-tight text-foreground-strong">
              {p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
