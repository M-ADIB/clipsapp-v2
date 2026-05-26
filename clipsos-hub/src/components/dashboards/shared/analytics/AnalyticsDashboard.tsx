/**
 * AnalyticsDashboard — Premium Web Analytics Dashboard for Owners and Managers.
 *
 * Implements interactive charts, top row KPI cards, A/B testing conversion metrics,
 * and 2x2 breakdowns of geolocation, devices, referrers, and paths.
 */
import { useEffect, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAnalytics } from "@/hooks/use-analytics";
import { TabPanel } from "@/components/ui/tab-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Eye,
  FileText,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Laptop,
  Smartphone,
  Tablet,
  Globe2,
  TrendingUp,
  Split,
  Calendar,
} from "lucide-react";

export function AnalyticsDashboard() {
  const { headerConfig, setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [activeTab, setActiveTab] = useState<"landing">("landing");

  // State for filters
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [variant, setVariant] = useState<"All" | "A" | "B">("All");

  // Fetch analytics data using custom hook
  const { data, isLoading, error } = useAnalytics(timeRange, variant);

  // Register header config
  useEffect(() => {
    setHeaderConfig({
      title: "Analytics",
      tabs: [{ key: "landing", label: "Landing Page" }],
      activeTab,
      onTabChange: (v: string) => setActiveTab(v as "landing"),
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, activeTab]);

  // Duration Formatter (e.g. 2m 56s)
  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Helper for percentage formatting
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  if (error) {
    return (
      <FullBleed>
        <div className="px-3 py-5 md:px-5 md:py-6 text-center text-rose-500">
          Error loading analytics data. Please make sure the migrations are applied.
        </div>
      </FullBleed>
    );
  }

  // Fallbacks for data when loading or empty
  const kpis = data?.kpis ?? {
    uniqueVisitors: 0,
    pageviews: 0,
    viewsPerVisit: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
  };
  const dailyTrend = data?.dailyTrend ?? [];
  const referrers = data?.referrers ?? [];
  const paths = data?.paths ?? [];
  const countries = data?.countries ?? [];
  const devices = data?.devices ?? [];
  const abComparison = data?.abComparison ?? {
    variantA: { landingVisitors: 0, convertedVisitors: 0, conversionRate: 0 },
    variantB: { landingVisitors: 0, convertedVisitors: 0, conversionRate: 0 },
  };

  // Calculate A/B conversion lift
  const rateA = abComparison.variantA.conversionRate;
  const rateB = abComparison.variantB.conversionRate;
  const abLift = rateA > 0 ? ((rateB - rateA) / rateA) * 100 : 0;

  return (
    <FullBleed>
      <div className="px-3 py-5 md:px-5 md:py-6 space-y-6">
        {/* Filters Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-card border border-border rounded-xl p-4 transition-all duration-300">
          <div>
            <h2 className="text-sm font-medium text-foreground-muted">Scope & Context</h2>
            <p className="text-xs text-foreground-disabled">Select dates and A/B test parameters</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Variant selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground-disabled hidden md:inline">Variant:</span>
              <Select value={variant} onValueChange={(v) => setVariant(v as "All" | "A" | "B")}>
                <SelectTrigger className="w-[130px] bg-background border-border-strong text-xs h-9">
                  <SelectValue placeholder="All Variants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Variants</SelectItem>
                  <SelectItem value="A">Variant A</SelectItem>
                  <SelectItem value="B">Variant B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground-disabled hidden md:inline">Timeframe:</span>
              <Select
                value={timeRange}
                onValueChange={(v) => setTimeRange(v as "7d" | "30d" | "90d")}
              >
                <SelectTrigger className="w-[130px] bg-background border-border-strong text-xs h-9">
                  <SelectValue placeholder="7 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* TabPanel Landing Page */}
        <TabPanel active={activeTab === "landing"}>
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Unique Visitors */}
              <Card className="hover:border-primary/[0.3] hover:shadow-lg transition-all duration-300 bg-surface-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Unique Visitors
                  </span>
                  <Users className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-foreground/[0.05] animate-pulse rounded" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold tracking-tight">
                        {kpis.uniqueVisitors}
                      </div>
                      <p className="text-[10px] text-foreground-disabled mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" /> Active trackers
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pageviews */}
              <Card className="hover:border-primary/[0.3] hover:shadow-lg transition-all duration-300 bg-surface-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Pageviews
                  </span>
                  <Eye className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-foreground/[0.05] animate-pulse rounded" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold tracking-tight">{kpis.pageviews}</div>
                      <p className="text-[10px] text-foreground-disabled mt-1 flex items-center gap-1">
                        Total paths visited
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Views per Visit */}
              <Card className="hover:border-primary/[0.3] hover:shadow-lg transition-all duration-300 bg-surface-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Views per Visit
                  </span>
                  <FileText className="w-4 h-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-foreground/[0.05] animate-pulse rounded" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold tracking-tight">
                        {kpis.viewsPerVisit.toFixed(1)}
                      </div>
                      <p className="text-[10px] text-foreground-disabled mt-1">
                        Average paths / session
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Average Session Duration */}
              <Card className="hover:border-primary/[0.3] hover:shadow-lg transition-all duration-300 bg-surface-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Visit Duration
                  </span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-foreground/[0.05] animate-pulse rounded" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold tracking-tight">
                        {formatDuration(kpis.avgSessionDuration)}
                      </div>
                      <p className="text-[10px] text-foreground-disabled mt-1">
                        Time spent per session
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Bounce Rate */}
              <Card className="hover:border-primary/[0.3] hover:shadow-lg transition-all duration-300 bg-surface-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                    Bounce Rate
                  </span>
                  <Activity className="w-4 h-4 text-violet-500" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-foreground/[0.05] animate-pulse rounded" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold tracking-tight">
                        {formatPercent(kpis.bounceRate)}
                      </div>
                      <p className="text-[10px] text-foreground-disabled mt-1">
                        Single pageviews / total
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts and A/B Conversion Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* A/B Conversion Comparison Card */}
              <Card className="lg:col-span-1 bg-surface-card border-border flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <Split className="w-4 h-4" />
                    <CardTitle className="text-sm font-semibold tracking-tight">
                      A/B Testing Funnel
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-foreground-disabled">
                    Conversion Rate comparison: landing on `/` vs. reaching `/thank-you`
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-grow flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-4 divide-x divide-border">
                    {/* Variant A */}
                    <div className="space-y-2 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
                        Variant A
                      </span>
                      <div className="text-3xl font-bold text-foreground">
                        {isLoading ? "..." : formatPercent(rateA)}
                      </div>
                      <p className="text-[10px] text-foreground-disabled">
                        {abComparison.variantA.convertedVisitors} /{" "}
                        {abComparison.variantA.landingVisitors} users
                      </p>
                    </div>

                    {/* Variant B */}
                    <div className="space-y-2 text-center pl-4">
                      <span className="inline-flex items-center justify-center rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">
                        Variant B
                      </span>
                      <div className="text-3xl font-bold text-foreground">
                        {isLoading ? "..." : formatPercent(rateB)}
                      </div>
                      <p className="text-[10px] text-foreground-disabled">
                        {abComparison.variantB.convertedVisitors} /{" "}
                        {abComparison.variantB.landingVisitors} users
                      </p>
                    </div>
                  </div>

                  {/* Lift Box */}
                  {!isLoading && (
                    <div className="bg-foreground/[0.02] border border-border rounded-xl p-4 text-center mt-auto">
                      <div className="text-xs text-foreground-disabled">Conversion Lift</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {abLift >= 0 ? (
                          <>
                            <span className="text-lg font-semibold text-emerald-500">
                              +{abLift.toFixed(1)}%
                            </span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                              <ArrowUpRight className="w-3 h-3" /> Variant B Win
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-semibold text-rose-500">
                              {abLift.toFixed(1)}%
                            </span>
                            <span className="text-[10px] bg-rose-500/10 text-rose-400 rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                              <ArrowDownRight className="w-3 h-3" /> Variant A Win
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Main Line / Area Chart */}
              <Card className="lg:col-span-2 bg-surface-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-sm font-semibold tracking-tight">
                      Daily Unique Visitors
                    </CardTitle>
                    <CardDescription className="text-xs text-foreground-disabled">
                      Active user sessions tracked over this interval
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="h-64 pl-0">
                  {isLoading ? (
                    <div className="w-full h-full bg-foreground/[0.03] animate-pulse rounded-lg" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailyTrend}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "var(--foreground-disabled)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "var(--foreground-disabled)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface-card)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            fontSize: "11px",
                            color: "var(--foreground)",
                          }}
                          labelClassName="font-medium mb-1 text-foreground"
                          formatter={(value) => [value, "Visitors"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorVisitors)"
                          animationDuration={800}
                          animationEasing="ease-out"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 2x2 Breakdown Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Referrer Sources */}
              <Card className="bg-surface-card border-border flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Referrer Channels
                  </CardTitle>
                  <CardDescription className="text-xs text-foreground-disabled">
                    Where your traffic originates
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto max-h-64">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-8 bg-foreground/[0.03] animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : referrers.length === 0 ? (
                    <div className="text-center text-xs text-foreground-disabled py-10">
                      No traffic sources recorded.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                            Source
                          </th>
                          <th className="pb-2 text-right text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                            Visitors
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrers.map((ref, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-border/40 hover:bg-foreground/[0.01]"
                          >
                            <td className="py-2.5 pr-4 text-xs font-medium max-w-[200px] truncate">
                              <div className="flex flex-col gap-1">
                                <span>{ref.source}</span>
                                <div className="h-1.5 w-full bg-foreground/[0.04] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary/70 rounded-full transition-all duration-500"
                                    style={{ width: `${ref.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-right text-xs font-semibold">
                              {ref.visitors}
                              <span className="text-[10px] text-foreground-disabled ml-1.5 font-normal">
                                ({formatPercent(ref.percentage)})
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Visited Paths */}
              <Card className="bg-surface-card border-border flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" /> Top Visited Paths
                  </CardTitle>
                  <CardDescription className="text-xs text-foreground-disabled">
                    Most frequently viewed routes
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto max-h-64">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-8 bg-foreground/[0.03] animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : paths.length === 0 ? (
                    <div className="text-center text-xs text-foreground-disabled py-10">
                      No visited paths recorded.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                            Path
                          </th>
                          <th className="pb-2 text-right text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                            Pageviews
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paths.map((pathItem, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-border/40 hover:bg-foreground/[0.01]"
                          >
                            <td className="py-2.5 pr-4 text-xs font-mono font-medium max-w-[200px] truncate">
                              {pathItem.path}
                            </td>
                            <td className="py-2.5 text-right text-xs font-semibold">
                              {pathItem.pageviews}
                              <span className="text-[10px] text-foreground-disabled ml-1.5 font-normal">
                                ({formatPercent(pathItem.percentage)})
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Country Listing */}
              <Card className="bg-surface-card border-border flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-cyan-500" /> Geolocation List
                  </CardTitle>
                  <CardDescription className="text-xs text-foreground-disabled">
                    Traffic distribution by country
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto max-h-64">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-8 bg-foreground/[0.03] animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : countries.length === 0 ? (
                    <div className="text-center text-xs text-foreground-disabled py-10">
                      No country data recorded.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                            Country
                          </th>
                          <th className="pb-2 text-right text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                            Visitors
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {countries.map((c, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-border/40 hover:bg-foreground/[0.01]"
                          >
                            <td className="py-2.5 text-xs font-medium flex items-center gap-2">
                              <span className="text-base select-none">{c.flag}</span>
                              <span>{c.country}</span>
                            </td>
                            <td className="py-2.5 text-right text-xs font-semibold">
                              {c.visitors}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Device Distribution */}
              <Card className="bg-surface-card border-border flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-violet-500" /> Device Distribution
                  </CardTitle>
                  <CardDescription className="text-xs text-foreground-disabled">
                    Platform type breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center gap-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-8 bg-foreground/[0.03] animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="text-center text-xs text-foreground-disabled py-10">
                      No device data recorded.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {devices.map((d, idx) => {
                        const Icon =
                          d.device === "Mobile"
                            ? Smartphone
                            : d.device === "Tablet"
                              ? Tablet
                              : Laptop;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-2 text-foreground-muted">
                                <Icon className="w-3.5 h-3.5 text-foreground-disabled" />
                                {d.device}
                              </span>
                              <span className="font-semibold text-foreground">
                                {d.count}{" "}
                                <span className="text-[10px] text-foreground-disabled ml-1 font-normal">
                                  ({formatPercent(d.percentage)})
                                </span>
                              </span>
                            </div>
                            <div className="h-2 w-full bg-foreground/[0.04] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                                style={{ width: `${d.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabPanel>
      </div>
    </FullBleed>
  );
}
