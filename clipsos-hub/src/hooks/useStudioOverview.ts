/**
 * useStudioOverview — Aggregated client data for the Content Studio landing table.
 *
 * Fetches all clients + foundation counts + cycle/script counts + video counts
 * in parallel, then merges into a single flat row per client.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FOUNDATION_FIELDS = [
  "full_name",
  "profession_title",
  "professional_bio",
  "personal_bio",
  "three_words",
  "preferred_language",
  "noteworthy_achievements",
  "social_media_links",
  "controversial_topic",
  "industry_challenges",
  "target_audience",
  "common_questions",
  "content_inspirations",
  "brand_guidelines",
  "self_perception",
  "others_perception",
  "desired_perception",
] as const;

export const TOTAL_FOUNDATION_FIELDS = FOUNDATION_FIELDS.length; // 17

export interface StudioClientRow {
  id: string;
  name: string;
  logo_url: string | null;
  industry: string | null;
  account_status: string;
  created_at: string;
  foundationFilled: number;
  foundationTotal: number;
  foundationPct: number;
  cyclesCount: number;
  scriptsCount: number;
  videosInProduction: number;
}

export function useStudioOverview() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ["studio-overview", tenantId],
    queryFn: async (): Promise<StudioClientRow[]> => {
      const [clientsRes, foundationRes, cyclesRes, scriptsRes, videosRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name, logo_url, industry, account_status, created_at")
          .eq("tenant_id", tenantId!)
          .order("name"),
        supabase
          .from("client_foundation")
          .select("client_id, foundation")
          .eq("tenant_id", tenantId!),
        supabase.from("cycles").select("client_id").eq("tenant_id", tenantId!),
        supabase.from("studio_scripts").select("client_id").eq("tenant_id", tenantId!),
        supabase.from("videos").select("client_id").eq("tenant_id", tenantId!),
      ]);

      const clients = clientsRes.data ?? [];
      const foundationRows = (foundationRes.data ?? []) as Array<{
        client_id: string;
        foundation: Record<string, unknown> | null;
      }>;

      const foundationByClient = new Map<string, Record<string, unknown> | null>();
      foundationRows.forEach((row) => foundationByClient.set(row.client_id, row.foundation));

      const countBy = <T extends { client_id: string | null }>(rows: T[]) => {
        const map = new Map<string, number>();
        rows.forEach((r) => {
          if (!r.client_id) return;
          map.set(r.client_id, (map.get(r.client_id) ?? 0) + 1);
        });
        return map;
      };

      const cyclesCount = countBy(cyclesRes.data ?? []);
      const scriptsCount = countBy(scriptsRes.data ?? []);
      const videosCount = countBy(videosRes.data ?? []);

      return clients.map((c) => {
        const f = foundationByClient.get(c.id);
        let filled = 0;
        let total: number = TOTAL_FOUNDATION_FIELDS;

        if (f) {
          if (f.questions && Array.isArray(f.questions)) {
            total = f.questions.length;
            filled = f.questions.reduce((acc: number, q: any) => {
              const ans = q?.answer;
              return acc + (ans && String(ans).trim().length > 0 ? 1 : 0);
            }, 0);
          } else {
            filled = FOUNDATION_FIELDS.reduce((acc, key) => {
              const v = (f as Record<string, unknown>)[key];
              return acc + (v && String(v).trim().length > 0 ? 1 : 0);
            }, 0);
          }
        }

        return {
          id: c.id,
          name: c.name,
          logo_url: c.logo_url ?? null,
          industry: c.industry ?? null,
          account_status: c.account_status ?? "active",
          created_at: c.created_at,
          foundationFilled: filled,
          foundationTotal: total,
          foundationPct: total > 0 ? Math.round((filled / total) * 100) : 0,
          cyclesCount: cyclesCount.get(c.id) ?? 0,
          scriptsCount: scriptsCount.get(c.id) ?? 0,
          videosInProduction: videosCount.get(c.id) ?? 0,
        };
      });
    },
    enabled: !!tenantId,
  });
}
