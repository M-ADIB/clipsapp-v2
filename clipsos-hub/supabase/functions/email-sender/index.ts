import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import {
  renderTemplate,
  renderWithMaster,
  type MasterTemplate,
} from "../_shared/renderTemplate.ts";

// ─────────────────────────────────────────────────────────────
// email-sender — Reads pending emails from email_queue,
// sends them via the Resend API, and updates each row's
// status to 'sent' or 'failed'.
//
// Phase 2 update: master template support.
// When a queued email references a template by slug
// (via metadata.template_slug), we re-render the email body
// from the latest version of that template, wrapped in the
// tenant's master template shell, using the shared renderer.
//
// verify_jwt: true (called by admin/cron, requires auth)
// Required env: RESEND_API_KEY, SUPABASE_URL,
//               SUPABASE_SERVICE_ROLE_KEY
// Optional env: RESEND_FROM_EMAIL (defaults to noreply@)
// ─────────────────────────────────────────────────────────────

/** Maximum emails to process per invocation */
const BATCH_SIZE = 10;

/** Resend API endpoint */
const RESEND_API_URL = "https://api.resend.com/emails";

interface EmailQueueRow {
  id: string;
  tenant_id: string;
  to_email: string;
  to_name: string | null;
  subject: string;
  body_html: string;
  metadata: Record<string, unknown> | null;
}

interface SendResult {
  id: string;
  to_email: string;
  status: "sent" | "failed";
  error?: string;
  resend_id?: string;
}

/**
 * Send a single email via the Resend API.
 * Returns the Resend message ID on success, or throws on failure.
 */
async function sendViaResend(
  apiKey: string,
  fromEmail: string,
  email: EmailQueueRow,
): Promise<string> {
  const toAddress = email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toAddress],
      subject: email.subject,
      html: email.body_html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }

  const result = (await response.json()) as { id: string };
  return result.id;
}

/**
 * Fetch the active master template for a tenant.
 * Returns null if none exists (backward compatible).
 */
async function fetchMasterTemplate(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  tenantId: string,
): Promise<MasterTemplate | null> {
  const { data, error } = await supabase
    .from("email_master_template")
    .select("wrapper_html, logo_url, accent_color, footer_html")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.warn(`Master template lookup failed for tenant=${tenantId}:`, error.message);
    return null;
  }

  if (!data) return null;

  return {
    wrapper_html: data.wrapper_html as string,
    logo_url: (data.logo_url as string) ?? "",
    accent_color: (data.accent_color as string) ?? "#000000",
    footer_html: (data.footer_html as string) ?? "Sent by ClipsOS · This is an automated message",
  };
}

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "ClipsOS <noreply@theclips.agency>";

  // —— Create Supabase admin client ——
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // —— Fetch pending emails (batch) ——
  const { data: pendingEmails, error: fetchError } = await supabase
    .from("email_queue")
    .select("id, tenant_id, to_email, to_name, subject, body_html, metadata")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error("Failed to fetch pending emails:", fetchError);
    return new Response(
      JSON.stringify({ error: "Failed to fetch queue", details: fetchError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!pendingEmails || pendingEmails.length === 0) {
    return new Response(JSON.stringify({ processed: 0, message: "No pending emails" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`Processing ${pendingEmails.length} pending emails`);

  // —— Pre-fetch master templates (cache by tenant_id to avoid re-fetching) ——
  const masterCache = new Map<string, MasterTemplate | null>();

  async function getMaster(tenantId: string): Promise<MasterTemplate | null> {
    if (masterCache.has(tenantId)) return masterCache.get(tenantId)!;
    const master = await fetchMasterTemplate(supabase, tenantId);
    masterCache.set(tenantId, master);
    return master;
  }

  // —— Process each email ——
  const results: SendResult[] = [];

  for (const email of pendingEmails as EmailQueueRow[]) {
    try {
      // Mark as sending (prevents duplicate processing by concurrent invocations)
      await supabase
        .from("email_queue")
        .update({ status: "sending" })
        .eq("id", email.id)
        .eq("status", "pending"); // Optimistic lock: only update if still pending

      // —— Optionally re-render from Email Hub template ——
      // If the queued row carries metadata.template_slug, fetch the latest
      // version of that template and render it via the shared renderer.
      // Variables come from metadata.template_vars (object of strings).
      let renderedSubject = email.subject;
      let renderedHtml = email.body_html;
      const meta = (email.metadata ?? {}) as Record<string, unknown>;
      const templateSlug = typeof meta.template_slug === "string" ? meta.template_slug : null;
      const templateVars =
        meta.template_vars && typeof meta.template_vars === "object"
          ? (meta.template_vars as Record<string, string>)
          : {};

      if (templateSlug) {
        const { data: tpl, error: tplErr } = await supabase
          .from("email_templates")
          .select("subject, body_html, headline, body, cta_text, cta_url, preview_text, edit_mode")
          .eq("tenant_id", email.tenant_id)
          .eq("slug", templateSlug)
          .eq("is_active", true)
          .maybeSingle();
        if (tplErr) {
          console.warn(`Template lookup failed for slug=${templateSlug}:`, tplErr.message);
        }
        if (tpl) {
          const templateInput = {
            edit_mode: (tpl.edit_mode as string) ?? "visual",
            subject: tpl.subject as string,
            preview_text: (tpl.preview_text as string | null) ?? null,
            headline: (tpl.headline as string | null) ?? null,
            body: (tpl.body as string | null) ?? null,
            cta_text: (tpl.cta_text as string | null) ?? null,
            cta_url: (tpl.cta_url as string | null) ?? null,
            body_html: (tpl.body_html as string) ?? "",
          };

          // Try to use master template wrapper; fall back to legacy
          const master = await getMaster(email.tenant_id);
          const rendered = master
            ? renderWithMaster(templateInput, master, templateVars)
            : renderTemplate(templateInput, templateVars);

          renderedSubject = rendered.subject;
          renderedHtml = rendered.html;
        }
      } else {
        // Even non-templated emails can benefit from the master wrapper
        // if they have raw HTML in body_html
        const master = await getMaster(email.tenant_id);
        if (master) {
          renderedHtml = master.wrapper_html
            .replace(/\{\{CONTENT\}\}/g, renderedHtml)
            .replace(
              /\{\{LOGO_BLOCK\}\}/g,
              master.logo_url
                ? `<img src="${master.logo_url}" alt="Logo" style="max-height:40px;max-width:200px;" />`
                : "",
            )
            .replace(/\{\{FOOTER_HTML\}\}/g, master.footer_html)
            .replace(/\{\{ACCENT_COLOR\}\}/g, master.accent_color);
        }
      }

      const resendId = await sendViaResend(resendApiKey, fromEmail, {
        ...email,
        subject: renderedSubject,
        body_html: renderedHtml,
      });

      // Mark as sent
      const { error: updateError } = await supabase
        .from("email_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          metadata: {
            ...((email.metadata as Record<string, unknown>) ?? {}),
            resend_id: resendId,
          },
        })
        .eq("id", email.id);

      if (updateError) {
        console.error(`Failed to mark email ${email.id} as sent:`, updateError);
      }

      results.push({
        id: email.id,
        to_email: email.to_email,
        status: "sent",
        resend_id: resendId,
      });

      console.log(`Email sent to ${email.to_email} (resend: ${resendId})`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Failed to send email ${email.id}:`, errorMessage);

      // Mark as failed with error details
      const { error: updateError } = await supabase
        .from("email_queue")
        .update({
          status: "failed",
          error: errorMessage.slice(0, 1000), // Truncate to prevent overflow
        })
        .eq("id", email.id);

      if (updateError) {
        console.error(`Failed to mark email ${email.id} as failed:`, updateError);
      }

      results.push({
        id: email.id,
        to_email: email.to_email,
        status: "failed",
        error: errorMessage,
      });
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const failed = results.filter((r) => r.status === "failed").length;

  console.log(`Batch complete: ${sent} sent, ${failed} failed`);

  return new Response(
    JSON.stringify({
      processed: results.length,
      sent,
      failed,
      results,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
