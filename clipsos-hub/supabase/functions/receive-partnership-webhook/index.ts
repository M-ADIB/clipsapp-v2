// receive-partnership-webhook — public webhook for partnership recruitment form submissions
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendSlackNotification, SLACK_CHANNELS } from "../_shared/slack-notifier.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface PartnershipPayload {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  languages?: string;
  role?: string;
  target_audience?: string;
  experience_years?: string;
  portfolio_link?: string;
  best_pieces?: string;
  client_accounts?: string;
  has_paying_clients?: boolean;
  has_sold_service?: boolean;
  sold_service_explanation?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Security ──
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("PARTNERSHIP_WEBHOOK_SECRET");

    if (!expectedSecret) {
      console.error("[receive-partnership-webhook] PARTNERSHIP_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Init Supabase ──
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const body: PartnershipPayload = await req.json();

    if (!body.name || !body.email) {
      return new Response(JSON.stringify({ error: "name and email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = body.email.toLowerCase().trim();

    // ── CRM: Upsert person ──
    let personId: string | null = null;
    const { data: existingPerson } = await supabaseAdmin
      .from("crm_people")
      .select("id")
      .eq("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (existingPerson) {
      personId = existingPerson.id;
      const updates: Record<string, unknown> = {};
      if (body.phone) updates.phone = body.phone;
      if (body.location) updates.location = body.location;
      if (Object.keys(updates).length > 0) {
        await supabaseAdmin.from("crm_people").update(updates).eq("id", personId);
      }
    } else {
      const { data: newPerson, error: personErr } = await supabaseAdmin
        .from("crm_people")
        .insert({
          full_name: body.name,
          email: normalizedEmail,
          phone: body.phone ?? null,
          location: body.location ?? null,
          source: "partnership",
          notes:
            [
              body.role ? `Role: ${body.role}` : null,
              body.target_audience ? `Target Audience: ${body.target_audience}` : null,
              body.experience_years ? `Experience: ${body.experience_years}` : null,
            ]
              .filter(Boolean)
              .join("\n") || null,
        })
        .select("id")
        .single();
      if (!personErr && newPerson) personId = newPerson.id;
      else console.error("[receive-partnership-webhook] Person insert error:", personErr?.message);
    }

    // ── Insert into partnership_applications ──
    const applicationRecord = {
      person_id: personId,
      name: body.name,
      email: normalizedEmail,
      phone: body.phone ?? null,
      location: body.location ?? null,
      languages: body.languages ?? null,
      role: body.role ?? null,
      target_audience: body.target_audience ?? null,
      experience_years: body.experience_years ?? null,
      portfolio_link: body.portfolio_link ?? null,
      best_pieces: body.best_pieces ?? null,
      client_accounts: body.client_accounts ?? null,
      has_paying_clients: body.has_paying_clients ?? false,
      has_sold_service: body.has_sold_service ?? false,
      sold_service_explanation: body.sold_service_explanation ?? null,
      status: "new",
    };

    const { data, error } = await supabaseAdmin
      .from("partnership_applications")
      .insert(applicationRecord)
      .select("id")
      .single();

    if (error) {
      console.error("[receive-partnership-webhook] DB insert error:", error.message);
      throw new Error("Failed to save partnership application");
    }
    console.log("[receive-partnership-webhook] Application created:", data.id, "person:", personId);

    // ── Slack notification ──
    try {
      const fields = [
        `*Name:* ${body.name}`,
        `*Email:* ${normalizedEmail}`,
        body.role ? `*Role:* ${body.role}` : null,
        body.phone ? `*Phone:* ${body.phone}` : null,
        body.location ? `*Location:* ${body.location}` : null,
        body.languages ? `*Languages:* ${body.languages}` : null,
        body.target_audience ? `*Target Audience:* ${body.target_audience}` : null,
        body.experience_years ? `*Experience:* ${body.experience_years}` : null,
        body.portfolio_link ? `*Portfolio:* ${body.portfolio_link}` : null,
        `*Has Paying Clients:* ${body.has_paying_clients ? "✅ Yes" : "❌ No"}`,
        `*Has Sold Service:* ${body.has_sold_service ? "✅ Yes" : "❌ No"}`,
      ]
        .filter(Boolean)
        .join("\n");

      await sendSlackNotification({
        channel: SLACK_CHANNELS.CLIPS_APP,
        text: `🤝 *New Partnership Application*\n\n${fields}`,
        username: "ClipsOS Partnerships",
        icon_emoji: ":handshake:",
      });
    } catch (slackErr) {
      console.error("[receive-partnership-webhook] Slack notification failed:", slackErr);
    }

    // ── In-app notifications for owners + admins ──
    try {
      const { data: adminUsers } = await supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .in("role", ["owner", "admin"]);

      if (adminUsers && adminUsers.length > 0) {
        const roleLabel = body.role || "Partner";
        const notifs = adminUsers.map((u) => ({
          user_id: u.user_id,
          title: `New Partnership Application 🤝`,
          message: `${body.name} applied as ${roleLabel}`,
          type: "info",
          link: "/owner/partnerships",
        }));
        const { error: notifErr } = await supabaseAdmin.from("notifications").insert(notifs);
        if (notifErr)
          console.error("[receive-partnership-webhook] Notification error:", notifErr.message);
      }
    } catch (notifErr) {
      console.error("[receive-partnership-webhook] In-app notification failed:", notifErr);
    }

    return new Response(
      JSON.stringify({ success: true, application_id: data.id, person_id: personId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[receive-partnership-webhook] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
