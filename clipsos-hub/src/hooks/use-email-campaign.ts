/**
 * use-email-campaign — encapsulates the "send campaign" flow that used to live
 * inline in ComposeTab: resolve recipients from the selected audiences, then
 * insert the campaign + recipient rows + per-recipient queue entries.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { renderTemplate } from "@/lib/email/renderTemplate";

interface Recipient {
  email: string;
  name: string;
}

export interface SendCampaignInput {
  subject: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  preview_text: string;
  audiences: string[];
  customList: string;
  scheduledFor?: Date;
}

/** Resolve the recipient list for the selected audiences + custom emails. */
async function resolveRecipients(
  tenantId: string,
  audiences: string[],
  customList: string,
): Promise<Recipient[]> {
  const recipients: Recipient[] = [];
  const seen = new Set<string>();
  const add = (email: string | null, name: string | null) => {
    if (!email) return;
    const k = email.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    recipients.push({ email, name: name ?? "" });
  };

  if (audiences.includes("leads")) {
    const { data } = await supabase
      .from("leads")
      .select("email, first_name")
      .eq("tenant_id", tenantId);
    data?.forEach((r) => add(r.email, r.first_name));
  }
  if (audiences.includes("active_clients")) {
    const { data } = await supabase
      .from("clients")
      .select("email, name")
      .eq("tenant_id", tenantId)
      .eq("account_status", "active");
    data?.forEach((r) => add(r.email, r.name));
  }
  if (audiences.includes("all_clients")) {
    const { data } = await supabase.from("clients").select("email, name").eq("tenant_id", tenantId);
    data?.forEach((r) => add(r.email, r.name));
  }
  if (audiences.includes("team")) {
    const { data } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("tenant_id", tenantId);
    data?.forEach((r) => add(r.email, r.full_name));
  }
  if (customList.trim()) {
    customList
      .split(/[,\n]+/)
      .map((e) => e.trim())
      .filter(Boolean)
      .forEach((email) => add(email, ""));
  }

  return recipients;
}

/**
 * Sends (or schedules) a campaign. Returns the recipient count on success.
 * Throws "No recipients found for the selected audiences" when the resolved
 * audience is empty (callers surface this to the user).
 */
export function useSendCampaign() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendCampaignInput): Promise<number> => {
      if (!tenantId) throw new Error("Tenant not loaded — try again.");

      const recipients = await resolveRecipients(tenantId, input.audiences, input.customList);
      if (recipients.length === 0) {
        throw new Error("No recipients found for the selected audiences");
      }

      const { scheduledFor } = input;
      const templateFields = {
        edit_mode: "visual" as const,
        subject: input.subject,
        headline: input.headline,
        body: input.body,
        cta_text: input.ctaText,
        cta_url: input.ctaUrl,
        preview_text: input.preview_text,
        body_html: "",
      };

      // Snapshot the rendered HTML for the first recipient (history preview)
      const firstName = recipients[0]?.name?.split(" ")[0] || "there";
      const { html: renderedHtml } = renderTemplate(templateFields, { client_name: firstName });

      // 1) Campaign row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: campaign, error: campErr } = await (supabase as any)
        .from("email_campaigns")
        .insert({
          tenant_id: tenantId,
          subject: input.subject,
          headline: input.headline || null,
          body: input.body,
          cta_text: input.ctaText || null,
          cta_url: input.ctaUrl || null,
          audience: input.audiences.join(", ") + (input.customList.trim() ? ", custom" : ""),
          recipient_count: recipients.length,
          status: scheduledFor ? "scheduled" : "sent",
          sent_at: scheduledFor ? null : new Date().toISOString(),
          scheduled_for: scheduledFor ? scheduledFor.toISOString() : null,
          rendered_html: renderedHtml,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();
      if (campErr) throw campErr;

      // 2) Recipients
      const recRows = recipients.map((r) => ({
        tenant_id: tenantId,
        campaign_id: campaign!.id,
        email: r.email,
        name: r.name || null,
        status: "queued",
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: recErr } = await (supabase as any)
        .from("email_campaign_recipients")
        .insert(recRows);
      if (recErr) throw recErr;

      // 3) Queue entries (one per recipient, individually rendered)
      const queueRows = recipients.map((r) => {
        const fname = r.name?.split(" ")[0] || "";
        const { html, subject } = renderTemplate(templateFields, { client_name: fname });
        return {
          tenant_id: tenantId,
          to_email: r.email,
          to_name: r.name || null,
          subject,
          body_html: html,
          status: "pending",
          metadata: { campaign_id: campaign!.id },
        };
      });

      // Insert in batches of 100
      for (let i = 0; i < queueRows.length; i += 100) {
        const batch = queueRows.slice(i, i + 100);
        const { error } = await supabase.from("email_queue").insert(batch);
        if (error) throw error;
      }

      return recipients.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-campaigns", tenantId] });
      qc.invalidateQueries({ queryKey: ["email-campaigns-scheduled", tenantId] });
    },
  });
}
