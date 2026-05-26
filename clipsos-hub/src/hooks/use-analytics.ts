/**
 * useAnalytics — Custom hook for retrieving and aggregating tenant web analytics.
 *
 * Implements filtering by timeRange ('7d' | '30d' | '90d') and variant ('All' | 'A' | 'B').
 * Automatically computes KPIs, charts, and breakdown lists.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import { subDays, startOfDay, format, parseISO, eachDayOfInterval } from "date-fns";

export interface AnalyticsKPIs {
  uniqueVisitors: number;
  pageviews: number;
  viewsPerVisit: number;
  avgSessionDuration: number; // in seconds
  bounceRate: number; // percentage
}

export interface DailyTrendPoint {
  date: string; // Formatted date e.g. "May 20"
  visitors: number;
}

export interface ReferrerSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface VisitedPath {
  path: string;
  pageviews: number;
  percentage: number;
}

export interface CountryListing {
  country: string;
  flag: string;
  visitors: number;
}

export interface DeviceDistribution {
  device: string;
  percentage: number;
  count: number;
}

export interface ABConversionComparison {
  variantA: {
    landingVisitors: number;
    convertedVisitors: number;
    conversionRate: number; // percentage
  };
  variantB: {
    landingVisitors: number;
    convertedVisitors: number;
    conversionRate: number; // percentage
  };
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  dailyTrend: DailyTrendPoint[];
  referrers: ReferrerSource[];
  paths: VisitedPath[];
  countries: CountryListing[];
  devices: DeviceDistribution[];
  abComparison: ABConversionComparison;
}

// Country flags lookup map
const countryFlags: Record<string, string> = {
  "United Arab Emirates": "🇦🇪",
  Lebanon: "🇱🇧",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  France: "🇫🇷",
  India: "🇮🇳",
  Singapore: "🇸🇬",
  "Saudi Arabia": "🇸🇦",
  Qatar: "🇶🇦",
  Kuwait: "🇰🇼",
  Oman: "🇴🇲",
  Bahrain: "🇧🇭",
  Egypt: "🇪🇬",
  Jordan: "🇯🇴",
  Turkey: "🇹🇷",
  Netherlands: "🇳🇱",
  Ireland: "🇮🇪",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Japan: "🇯🇵",
  China: "🇨🇳",
  "Hong Kong": "🇭🇰",
  Malaysia: "🇲🇾",
  "South Africa": "🇿🇦",
  Brazil: "🇧🇷",
  Mexico: "🇲🇽",
  Unknown: "🏳️",
};

export function useAnalytics(
  timeRange: "7d" | "30d" | "90d" = "7d",
  variant: "All" | "A" | "B" = "All",
) {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery<AnalyticsData>({
    queryKey: queryKeys.analytics.stats(tenantId!, { timeRange, variant }),
    queryFn: async () => {
      // Calculate sinceDate
      const now = new Date();
      let daysCount = 7;
      if (timeRange === "30d") daysCount = 30;
      else if (timeRange === "90d") daysCount = 90;

      const sinceDate = subDays(now, daysCount - 1);
      const sinceDateStart = startOfDay(sinceDate);

      // Fetch all events for the tenant in the time range
      // Get total count of events first to determine pagination pages
      const { count, error: countError } = await supabase
        .from("analytics_events" as any)
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId!)
        .gte("timestamp", sinceDateStart.toISOString());

      if (countError) throw countError;

      const total = count ?? 0;
      const pageSize = 1000;
      const totalPages = Math.ceil(total / pageSize);

      let allEvents: any[] = [];

      if (totalPages > 0) {
        // Fetch pages in parallel to bypass PostgREST's default 1000 row limit
        const promises = Array.from({ length: totalPages }).map((_, idx) =>
          supabase
            .from("analytics_events" as any)
            .select("*")
            .eq("tenant_id", tenantId!)
            .gte("timestamp", sinceDateStart.toISOString())
            .range(idx * pageSize, (idx + 1) * pageSize - 1)
        );

        const results = await Promise.all(promises);
        for (const res of results) {
          if (res.error) throw res.error;
          allEvents = allEvents.concat(res.data ?? []);
        }
      }

      // ── A/B Conversion Rates Calculation (Uses FULL dataset in timeRange) ──
      // Conversion defined as: reaching '/thank-you' divided by landing on '/'
      const calculateVariantConversion = (variantChar: "A" | "B") => {
        const variantEvents = allEvents.filter((e) => e.variant === variantChar);

        // Find unique visitors on landing path '/'
        const landingVisitors = new Set(
          variantEvents.filter((e) => e.path === "/").map((e) => e.visitor_id),
        );

        // Find unique visitors on conversion path '/thank-you'
        const convertedVisitors = new Set(
          variantEvents.filter((e) => e.path === "/thank-you").map((e) => e.visitor_id),
        );

        // Keep only converted visitors who also landed on '/' (true conversion funnel)
        const trueConvertedCount = Array.from(convertedVisitors).filter((v) =>
          landingVisitors.has(v),
        ).length;

        const landingCount = landingVisitors.size;
        const conversionRate = landingCount > 0 ? (trueConvertedCount / landingCount) * 100 : 0;

        return {
          landingVisitors: landingCount,
          convertedVisitors: trueConvertedCount,
          conversionRate,
        };
      };

      const abComparison: ABConversionComparison = {
        variantA: calculateVariantConversion("A"),
        variantB: calculateVariantConversion("B"),
      };

      // ── Filter events based on active variant filter for overall stats ──
      const filteredEvents =
        variant === "All" ? allEvents : allEvents.filter((e) => e.variant === variant);

      // ── KPI Calculations ──
      const uniqueVisitorsSet = new Set(filteredEvents.map((e) => e.visitor_id));
      const uniqueVisitors = uniqueVisitorsSet.size;

      const pageviewsEvents = filteredEvents.filter((e) => e.event_type === "pageview");
      const pageviews = pageviewsEvents.length;

      const uniqueSessionsSet = new Set(filteredEvents.map((e) => e.session_id));
      const totalSessions = uniqueSessionsSet.size;

      const viewsPerVisit = totalSessions > 0 ? pageviews / totalSessions : 0;

      // Group events by session_id to compute Session Durations and Bounces
      const sessionEventsMap = new Map<string, any[]>();
      for (const e of filteredEvents) {
        const arr = sessionEventsMap.get(e.session_id) ?? [];
        arr.push(e);
        sessionEventsMap.set(e.session_id, arr);
      }

      let totalDurationSeconds = 0;
      let sessionsWithDurationCount = 0;
      let bounceCount = 0;

      sessionEventsMap.forEach((events) => {
        // Sort by timestamp
        events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const firstEvent = events[0];
        const lastEvent = events[events.length - 1];

        const durationMs =
          new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime();
        const durationSec = durationMs / 1000;

        if (durationSec > 0) {
          totalDurationSeconds += durationSec;
          sessionsWithDurationCount++;
        }

        // Bounce definition: exactly 1 pageview event and no heartbeats
        const pvCount = events.filter((e) => e.event_type === "pageview").length;
        const hbCount = events.filter((e) => e.event_type === "heartbeat").length;

        if (pvCount === 1 && hbCount === 0) {
          bounceCount++;
        }
      });

      const avgSessionDuration =
        sessionsWithDurationCount > 0 ? totalDurationSeconds / sessionsWithDurationCount : 0;

      const bounceRate = totalSessions > 0 ? (bounceCount / totalSessions) * 100 : 0;

      // ── Daily Trend (Unique Visitors per day) ──
      const interval = eachDayOfInterval({
        start: sinceDateStart,
        end: now,
      });

      const dailyTrend: DailyTrendPoint[] = interval.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const visitorsOnDay = new Set(
          filteredEvents
            .filter((e) => format(parseISO(e.timestamp), "yyyy-MM-dd") === dateStr)
            .map((e) => e.visitor_id),
        );

        return {
          date: format(date, "MMM d"),
          visitors: visitorsOnDay.size,
        };
      });

      // ── Referrer Breakdown ──
      const referrerMap = new Map<string, Set<string>>();
      for (const e of filteredEvents) {
        const visitors = referrerMap.get(e.source) ?? new Set<string>();
        visitors.add(e.visitor_id);
        referrerMap.set(e.source, visitors);
      }

      const referrers: ReferrerSource[] = Array.from(referrerMap.entries())
        .map(([source, visitors]) => ({
          source: source || "Direct",
          visitors: visitors.size,
          percentage: uniqueVisitors > 0 ? (visitors.size / uniqueVisitors) * 100 : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);

      // ── Top Visited Paths ──
      const pathMap = new Map<string, number>();
      for (const e of pageviewsEvents) {
        const count = pathMap.get(e.path) ?? 0;
        pathMap.set(e.path, count + 1);
      }

      const paths: VisitedPath[] = Array.from(pathMap.entries())
        .map(([path, count]) => ({
          path,
          pageviews: count,
          percentage: pageviews > 0 ? (count / pageviews) * 100 : 0,
        }))
        .sort((a, b) => b.pageviews - a.pageviews);

      // ── Geolocation Breakdown ──
      const countryMapLocal = new Map<string, Set<string>>();
      for (const e of filteredEvents) {
        const cName = e.country || "Unknown";
        const visitors = countryMapLocal.get(cName) ?? new Set<string>();
        visitors.add(e.visitor_id);
        countryMapLocal.set(cName, visitors);
      }

      const countries: CountryListing[] = Array.from(countryMapLocal.entries())
        .map(([country, visitors]) => ({
          country,
          flag: countryFlags[country] || "🏳️",
          visitors: visitors.size,
        }))
        .sort((a, b) => b.visitors - a.visitors);

      // ── Device Distribution ──
      const deviceMap = new Map<string, Set<string>>();
      for (const e of filteredEvents) {
        const dev = e.device || "Desktop";
        const visitors = deviceMap.get(dev) ?? new Set<string>();
        visitors.add(e.visitor_id);
        deviceMap.set(dev, visitors);
      }

      const devices: DeviceDistribution[] = Array.from(deviceMap.entries())
        .map(([device, visitors]) => ({
          device,
          count: visitors.size,
          percentage: uniqueVisitors > 0 ? (visitors.size / uniqueVisitors) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        kpis: {
          uniqueVisitors,
          pageviews,
          viewsPerVisit,
          avgSessionDuration,
          bounceRate,
        },
        dailyTrend,
        referrers,
        paths,
        countries,
        devices,
        abComparison,
      };
    },
    enabled: isAuthenticated && !!tenantId,
    staleTime: 30_000, // Cache for 30s
  });
}
