/**
 * send-auth-email — Supabase Auth "Send Email" Hook
 *
 * Intercepts ALL Supabase Auth emails (magic links, password reset,
 * invites, email change, etc.) and sends them via Resend using our
 * master template wrapper for consistent branding.
 *
 * Once enabled in the Dashboard (Authentication → Hooks → Send Email),
 * Supabase stops using its built-in email templates and routes all
 * auth emails through this function instead.
 *
 * Required secrets:
 *   RESEND_API_KEY        — Resend API key
 *   SEND_EMAIL_HOOK_SECRET — Webhook secret from Supabase (v1,whsec_xxx)
 *   SUPABASE_URL          — Auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — Auto-injected
 *
 * Optional:
 *   RESEND_FROM_EMAIL — defaults to "ClipsOS <noreply@theclips.agency>"
 *
 * verify_jwt: false (webhook from Supabase Auth, verified via HMAC)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { applyMasterWrapper, buildVisualContent } from "../_shared/renderTemplate.ts";
import type { MasterTemplate } from "../_shared/renderTemplate.ts";

// ─── Email action type → human-readable config ─────────────────────
interface EmailConfig {
  subject: string;
  headline: string;
  body: string;
  ctaText: string;
}

function getEmailConfig(actionType: string, confirmUrl: string, token: string): EmailConfig {
  switch (actionType) {
    case "signup":
      return {
        subject: "Confirm your email — ClipsOS",
        headline: "Confirm your email ✉️",
        body: "Thanks for signing up! Click the button below to confirm your email address and get started.",
        ctaText: "Confirm Email",
      };
    case "magiclink":
      return {
        subject: "Your sign-in link — ClipsOS",
        headline: "Sign in to ClipsOS 🔑",
        body: "Click the button below to sign in. This link will expire in 1 hour.",
        ctaText: "Sign In",
      };
    case "recovery":
      return {
        subject: "Reset your password — ClipsOS",
        headline: "Reset your password 🔒",
        body: "We received a request to reset your password. Click the button below to choose a new one.",
        ctaText: "Reset Password",
      };
    case "invite":
      return {
        subject: "You've been invited to ClipsOS",
        headline: "You're invited! 🎉",
        body: "You've been invited to join a workspace on ClipsOS. Click below to accept and set up your account.",
        ctaText: "Accept Invitation",
      };
    case "email_change":
      return {
        subject: "Confirm email change — ClipsOS",
        headline: "Confirm your email change 📧",
        body: "You requested to change your email address. Click below to confirm this change.",
        ctaText: "Confirm Change",
      };
    case "reauthentication":
      return {
        subject: "Confirm your identity — ClipsOS",
        headline: "Confirm your identity 🔐",
        body: `Enter this code to confirm your identity: ${token}`,
        ctaText: "",
      };
    default:
      return {
        subject: "Action required — ClipsOS",
        headline: "Action Required",
        body: "Click the link below to proceed.",
        ctaText: "Continue",
      };
  }
}

/**
 * Fetch the default (first) tenant's master template.
 * Auth emails are pre-tenant, so we use the first active template.
 */
async function fetchDefaultMasterTemplate(
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<MasterTemplate | null> {
  const { data, error } = await supabase
    .from("email_master_template")
    .select("wrapper_html, logo_url, accent_color, footer_html")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Master template lookup failed:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    wrapper_html: data.wrapper_html as string,
    logo_url: (data.logo_url as string) ?? "",
    accent_color: (data.accent_color as string) ?? "#000000",
    footer_html: (data.footer_html as string) ?? "Sent by ClipsOS",
  };
}

/**
 * Build a standalone fallback HTML email (when no master template exists).
 */
function buildFallbackHtml(config: EmailConfig, confirmUrl: string): string {
  const cta = config.ctaText
    ? `<div style="margin:24px 0 8px;"><a href="${confirmUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${config.ctaText}</a></div>`
    : "";

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f5;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:40px 32px 24px;">
            <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:600;color:#09090b;">${config.headline}</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">${config.body}</p>
            ${cta}
          </td></tr>
          <tr><td style="padding:24px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;">Sent by ClipsOS</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: { http_code: 500, message: "RESEND_API_KEY not configured" } }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
  if (!hookSecret) {
    console.error("SEND_EMAIL_HOOK_SECRET not configured");
    return new Response(
      JSON.stringify({
        error: { http_code: 500, message: "SEND_EMAIL_HOOK_SECRET not configured" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "ClipsOS <noreply@theclips.agency>";

  // ─── Verify webhook signature ───────────────────────────────────
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret.replace("v1,whsec_", ""));

  let user: { email: string };
  let emailData: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
  };

  try {
    const verified = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: typeof emailData;
    };
    user = verified.user;
    emailData = verified.email_data;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response(
      JSON.stringify({ error: { http_code: 401, message: "Invalid webhook signature" } }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // ─── Build the confirmation URL ─────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${emailData.redirect_to || emailData.site_url}`;

  // ─── Build email content ────────────────────────────────────────
  const config = getEmailConfig(emailData.email_action_type, confirmUrl, emailData.token);

  let html: string;

  try {
    // Try to use the master template wrapper
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const master = await fetchDefaultMasterTemplate(supabase);

    if (master) {
      const contentHtml = buildVisualContent(
        {
          edit_mode: "visual",
          subject: config.subject,
          headline: config.headline,
          body: config.body,
          cta_text: config.ctaText || undefined,
          cta_url: confirmUrl || undefined,
          body_html: "",
        },
        master.accent_color,
      );
      html = applyMasterWrapper(contentHtml, master);
    } else {
      html = buildFallbackHtml(config, confirmUrl);
    }
  } catch (err) {
    console.warn("Master template render failed, using fallback:", err);
    html = buildFallbackHtml(config, confirmUrl);
  }

  // ─── Send via Resend ────────────────────────────────────────────
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: config.subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Resend API error: ${response.status} ${errorBody}`);
      return new Response(
        JSON.stringify({
          error: { http_code: response.status, message: `Resend error: ${errorBody}` },
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = (await response.json()) as { id: string };
    console.log(
      `Auth email sent to ${user.email} (type=${emailData.email_action_type}, resend=${result.id})`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Failed to send auth email: ${msg}`);
    return new Response(JSON.stringify({ error: { http_code: 500, message: msg } }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
