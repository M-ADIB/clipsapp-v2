import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const STRIPE_API = "https://api.stripe.com/v1";

async function stripeGet(path: string, apiKey: string, params?: Record<string, string>) {
  const url = new URL(`${STRIPE_API}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchAllPages(path: string, apiKey: string, extraParams: Record<string, string> = {}) {
  const all: any[] = [];
  let startingAfter: string | undefined;
  let hasMore = true;
  while (hasMore) {
    const params: Record<string, string> = { limit: "100", ...extraParams };
    if (startingAfter) params.starting_after = startingAfter;
    const data = await stripeGet(path, apiKey, params);
    all.push(...data.data);
    hasMore = data.has_more;
    if (data.data.length > 0) startingAfter = data.data[data.data.length - 1].id;
  }
  return all;
}

Deno.serve(async (req) => {
  const corsRes = handleCorsPreflightRequest(req);
  if (corsRes) return corsRes;
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    }

    const userId = user.id;
    // Check owner/admin
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", userId);

    const ownerOrAdminRole = roles?.find((r: any) => r.role === "owner" || r.role === "admin");
    if (!ownerOrAdminRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers });
    }

    const tenantId = ownerOrAdminRole.tenant_id;
    if (!tenantId) {
      return new Response(JSON.stringify({ error: "Tenant ID not found for user" }), { status: 400, headers });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("Stripe_Secret_API2") || Deno.env.get("Stripe_Secret_API");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe API key not configured" }), { status: 500, headers });
    }

    // Fetch charges (last 12 months)
    const twelveMonthsAgo = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
    const charges = await fetchAllPages("/charges", stripeKey, {
      "created[gte]": String(twelveMonthsAgo),
    });

    // Upsert charges
    if (charges.length > 0) {
      // Get client email map
      const { data: clients } = await adminClient
        .from("clients")
        .select("id, email, stripe_customer_id")
        .eq("tenant_id", tenantId);
      const emailMap = new Map<string, string>();
      const custMap = new Map<string, string>();
      clients?.forEach((c: any) => {
        if (c.email) emailMap.set(c.email.toLowerCase(), c.id);
        if (c.stripe_customer_id) custMap.set(c.stripe_customer_id, c.id);
      });

      const chargeRows = charges.map((ch: any) => {
        const email = ch.billing_details?.email || ch.receipt_email || "";
        const clientId = custMap.get(ch.customer) || (email ? emailMap.get(email.toLowerCase()) : null) || null;
        return {
          tenant_id: tenantId,
          stripe_charge_id: ch.id,
          stripe_customer_id: ch.customer || null,
          client_id: clientId,
          customer_email: email || null,
          amount: ch.amount || 0,
          currency: ch.currency || "usd",
          status: ch.status === "succeeded" ? "succeeded" : ch.refunded ? "refunded" : ch.disputed ? "disputed" : ch.status || "failed",
          fee: ch.balance_transaction ? 0 : 0, // Will be updated below
          net: ch.amount || 0,
          description: ch.description || null,
          stripe_created_at: new Date(ch.created * 1000).toISOString(),
          synced_at: new Date().toISOString(),
        };
      });

      // Batch upsert in chunks of 500
      for (let i = 0; i < chargeRows.length; i += 500) {
        const batch = chargeRows.slice(i, i + 500);
        const { error: upsertErr } = await adminClient
          .from("stripe_charges")
          .upsert(batch, { onConflict: "stripe_charge_id" });
        if (upsertErr) {
          console.error("Error upserting charges batch:", upsertErr);
          throw upsertErr;
        }
      }
    }

    // Fetch balance transactions for fee data
    const balTxns = await fetchAllPages("/balance_transactions", stripeKey, {
      "created[gte]": String(twelveMonthsAgo),
      type: "charge",
    });

    // Update fees from balance transactions
    for (const bt of balTxns) {
      if (bt.source) {
        const { error: updateErr } = await adminClient
          .from("stripe_charges")
          .update({ fee: bt.fee || 0, net: bt.net || 0 })
          .eq("stripe_charge_id", bt.source)
          .eq("tenant_id", tenantId);
        if (updateErr) {
          console.error(`Error updating fee for charge ${bt.source}:`, updateErr);
          throw updateErr;
        }
      }
    }

    // Fetch subscriptions
    const subs = await fetchAllPages("/subscriptions", stripeKey, { status: "all" });

    if (subs.length > 0) {
      const { data: clients } = await adminClient
        .from("clients")
        .select("id, email, stripe_customer_id")
        .eq("tenant_id", tenantId);
      const emailMap = new Map<string, string>();
      const custMap = new Map<string, string>();
      clients?.forEach((c: any) => {
        if (c.email) emailMap.set(c.email.toLowerCase(), c.id);
        if (c.stripe_customer_id) custMap.set(c.stripe_customer_id, c.id);
      });

      const subRows = await Promise.all(
        subs.map(async (sub: any) => {
          // Get customer email
          let email = "";
          if (sub.customer) {
            try {
              const cust = await stripeGet(`/customers/${sub.customer}`, stripeKey);
              email = cust.email || "";
            } catch { /* ignore */ }
          }
          const clientId = custMap.get(sub.customer) || (email ? emailMap.get(email.toLowerCase()) : null) || null;
          const item = sub.items?.data?.[0];
          return {
            tenant_id: tenantId,
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub.customer || null,
            client_id: clientId,
            customer_email: email || null,
            status: sub.status,
            plan_name: item?.price?.nickname || item?.plan?.nickname || "Plan",
            amount: item?.price?.unit_amount || item?.plan?.amount || 0,
            currency: sub.currency || "usd",
            interval: item?.price?.recurring?.interval || item?.plan?.interval || "month",
            current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
            stripe_created_at: new Date(sub.created * 1000).toISOString(),
            synced_at: new Date().toISOString(),
          };
        })
      );

      for (let i = 0; i < subRows.length; i += 500) {
        const batch = subRows.slice(i, i + 500);
        const { error: upsertErr } = await adminClient
          .from("stripe_subscriptions")
          .upsert(batch, { onConflict: "stripe_subscription_id" });
        if (upsertErr) {
          console.error("Error upserting subscriptions batch:", upsertErr);
          throw upsertErr;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        charges_synced: charges.length,
        subscriptions_synced: subs.length,
        balance_transactions_processed: balTxns.length,
      }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("stripe-sync error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});
