/**
 * useEmailCampaigns / useScheduledCampaigns / useCampaignRecipients
 *
 * Phase 2 hooks for the Email Hub:
 *   - History tab reads campaigns + drills into recipients
 *   - Scheduled tab reads upcoming campaigns and supports cancel
 *   - Compose tab inserts a campaign + recipients + queue rows
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EmailCampaign {
  id: string;
  tenant_id: string;
  subject: string;
  headline: string | null;
  body: string;
  cta_text: string | null;
  cta_url: string | null;
  audience: string;
  recipient_count: number;
  status: "sent" | "scheduled" | "cancelled" | string;
  sent_at: string | null;
  scheduled_for: string | null;
  rendered_html: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  tenant_id: string;
  campaign_id: string;
  email: string;
  name: string | null;
  status: "queued" | "sent" | "failed" | "skipped" | string;
  error: string | null;
  sent_at: string | null;
  created_at: string;
}

const KEY_CAMPAIGNS = (tenantId: string) => ["email-campaigns", tenantId];
const KEY_SCHEDULED = (tenantId: string) => ["email-campaigns-scheduled", tenantId];
const KEY_RECIPIENTS = (campaignId: string | null) => ["email-campaign-recipients", campaignId];

/* ─── List all campaigns (History tab) ───────────────────────────────────── */

export function useEmailCampaigns() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: KEY_CAMPAIGNS(tenantId ?? ""),
    enabled: !!tenantId,
    queryFn: async (): Promise<EmailCampaign[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("email_campaigns")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EmailCampaign[];
    },
  });
}

/* ─── List upcoming scheduled campaigns (Scheduled tab) ──────────────────── */

export function useScheduledCampaigns() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: KEY_SCHEDULED(tenantId ?? ""),
    enabled: !!tenantId,
    queryFn: async (): Promise<EmailCampaign[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("email_campaigns")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("status", "scheduled")
        .gte("scheduled_for", new Date().toISOString())
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EmailCampaign[];
    },
  });
}

/* ─── List recipients for a single campaign ──────────────────────────────── */

export function useCampaignRecipients(campaignId: string | null) {
  return useQuery({
    queryKey: KEY_RECIPIENTS(campaignId),
    enabled: !!campaignId,
    queryFn: async (): Promise<CampaignRecipient[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("email_campaign_recipients")
        .select("*")
        .eq("campaign_id", campaignId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CampaignRecipient[];
    },
  });
}

/* ─── Cancel a scheduled campaign ────────────────────────────────────────── */

export function useCancelCampaign() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: campErr } = await (supabase as any)
        .from("email_campaigns")
        .update({ status: "cancelled" })
        .eq("id", campaignId);
      if (campErr) throw campErr;

      // Mark any pending queue entries as failed
      const { data: queueRows } = await supabase
        .from("email_queue")
        .select("id")
        .eq("status", "pending")
        .contains("metadata", { campaign_id: campaignId });

      if (queueRows?.length) {
        await supabase
          .from("email_queue")
          .update({ status: "failed", error: "Campaign cancelled" })
          .in(
            "id",
            queueRows.map((r) => r.id),
          );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_CAMPAIGNS(tenantId ?? "") });
      qc.invalidateQueries({ queryKey: KEY_SCHEDULED(tenantId ?? "") });
    },
  });
}
