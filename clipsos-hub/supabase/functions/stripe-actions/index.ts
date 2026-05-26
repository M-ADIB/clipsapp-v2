import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
// ─────────────────────────────────────────────────────────────
// stripe-actions — Authenticated Edge Function for owner-initiated
// Stripe operations: payment links, subscriptions, customer sync.
//
// verify_jwt: true — Only authenticated users (owner role) can call.
// Required env: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ─────────────────────────────────────────────────────────────
const STRIPE_API = "https://api.stripe.com/v1";
/** Helper to call Stripe REST API with form-encoded body */ async function stripeRequest(
  path,
  method,
  body,
) {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
  const headers = {
    Authorization: `Bearer ${stripeKey}`,
  };
  let reqBody;
  if (body && (method === "POST" || method === "PUT")) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    reqBody = new URLSearchParams(body).toString();
  }
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers,
    body: reqBody,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Stripe API error:", data);
    throw new Error(data.error?.message ?? `Stripe error ${res.status}`);
  }
  return data;
}
/** Get or create a Stripe customer for a ClipsOS client */ async function ensureStripeCustomer(
  supabase,
  tenantId,
  clientId,
) {
  // Fetch client info
  const { data: client, error } = await supabase
    .from("clients")
    .select("id, name, email, stripe_customer_id")
    .eq("id", clientId)
    .eq("tenant_id", tenantId)
    .single();
  if (error || !client) throw new Error(`Client not found: ${clientId}`);
  // If already linked, return existing
  if (client.stripe_customer_id) {
    return {
      customerId: client.stripe_customer_id,
      email: client.email ?? "",
    };
  }
  // Search Stripe by email first
  if (client.email) {
    const search = await stripeRequest(
      `/customers?email=${encodeURIComponent(client.email)}&limit=1`,
      "GET",
    );
    const existing = search.data?.[0];
    if (existing?.id) {
      // Link and return
      await supabase
        .from("clients")
        .update({
          stripe_customer_id: existing.id,
        })
        .eq("id", clientId);
      return {
        customerId: existing.id,
        email: client.email,
      };
    }
  }
  // Create new customer
  const params = {
    name: client.name ?? "",
    "metadata[tenant_id]": tenantId,
    "metadata[client_id]": clientId,
  };
  if (client.email) params.email = client.email;
  const customer = await stripeRequest("/customers", "POST", params);
  const customerId = customer.id;
  // Save back to clients table
  await supabase
    .from("clients")
    .update({
      stripe_customer_id: customerId,
    })
    .eq("id", clientId);
  return {
    customerId,
    email: client.email ?? "",
  };
}
// ── Action Handlers ──────────────────────────────────────────
/** Create a Stripe Payment Link (one-time) */ async function handleCreatePaymentLink(
  supabase,
  tenantId,
  payload,
) {
  const clientId = payload.client_id;
  const amount = payload.amount; // in cents
  const currency = (payload.currency ?? "aed").toLowerCase();
  const description = payload.description ?? "Payment";
  // Ensure Stripe customer exists
  const { customerId } = await ensureStripeCustomer(supabase, tenantId, clientId);
  // Create a Price for this one-time payment
  const price = await stripeRequest("/prices", "POST", {
    unit_amount: String(amount),
    currency,
    "product_data[name]": description,
  });
  // Create Payment Link
  const link = await stripeRequest("/payment_links", "POST", {
    "line_items[0][price]": price.id,
    "line_items[0][quantity]": "1",
    "metadata[tenant_id]": tenantId,
    "metadata[client_id]": clientId,
    "metadata[description]": description,
  });
  return {
    payment_link_url: link.url,
    payment_link_id: link.id,
    stripe_customer_id: customerId,
  };
}
/** Create a Stripe Subscription */ async function handleCreateSubscription(
  supabase,
  tenantId,
  payload,
) {
  const clientId = payload.client_id;
  const priceId = payload.price_id;
  const amount = payload.amount;
  const currency = (payload.currency ?? "aed").toLowerCase();
  const interval = payload.interval ?? "month";
  const planName = payload.plan_name ?? "Monthly Plan";
  const { customerId } = await ensureStripeCustomer(supabase, tenantId, clientId);
  let finalPriceId = priceId;
  // If no priceId provided, create an ad-hoc price
  if (!finalPriceId && amount) {
    const price = await stripeRequest("/prices", "POST", {
      unit_amount: String(amount),
      currency,
      recurring_interval: interval,
      "product_data[name]": planName,
    });
    finalPriceId = price.id;
  }
  if (!finalPriceId) {
    throw new Error("Either price_id or amount is required");
  }
  const sub = await stripeRequest("/subscriptions", "POST", {
    customer: customerId,
    "items[0][price]": finalPriceId,
    "metadata[tenant_id]": tenantId,
    "metadata[client_id]": clientId,
    payment_behavior: "default_incomplete",
    "payment_settings[save_default_payment_method]": "on_subscription",
    "expand[]": "latest_invoice.payment_intent",
  });
  // Extract client_secret for Stripe Elements checkout
  const invoice = sub.latest_invoice;
  const pi = invoice?.payment_intent;
  return {
    subscription_id: sub.id,
    status: sub.status,
    client_secret: pi?.client_secret ?? null,
    stripe_customer_id: customerId,
  };
}
/** Cancel a subscription */ async function handleCancelSubscription(payload) {
  const subscriptionId = payload.subscription_id;
  if (!subscriptionId) throw new Error("subscription_id is required");
  const result = await stripeRequest(`/subscriptions/${subscriptionId}`, "DELETE");
  return {
    subscription_id: result.id,
    status: result.status,
    canceled_at: result.canceled_at,
  };
}
/** List Stripe Products/Prices */ async function handleListProducts() {
  const products = await stripeRequest("/products?active=true&limit=100", "GET");
  const prices = await stripeRequest("/prices?active=true&limit=100&expand[]=data.product", "GET");
  return {
    products: products.data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
    })),
    prices: prices.data.map((p) => {
      const product = p.product;
      return {
        id: p.id,
        product_id: typeof product === "string" ? product : product?.id,
        product_name: typeof product === "string" ? null : product?.name,
        unit_amount: p.unit_amount,
        currency: p.currency,
        interval: p.recurring?.interval ?? null,
        nickname: p.nickname,
      };
    }),
  };
}
/** Record a manual (non-Stripe) payment */ async function handleRecordPayment(
  supabase,
  tenantId,
  payload,
) {
  const { error, data } = await supabase
    .from("finance_transactions")
    .insert({
      tenant_id: tenantId,
      client_id: payload.client_id,
      amount: payload.amount,
      currency: (payload.currency ?? "AED").toUpperCase(),
      transaction_type: payload.transaction_type ?? "income",
      category: payload.category ?? "service_fee",
      payment_status: "succeeded",
      payment_date: payload.payment_date ?? new Date().toISOString().slice(0, 10),
      payment_method: payload.payment_method ?? "bank_transfer",
      notes: payload.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(`Insert failed: ${error.message}`);
  return data;
}
/** Create a Stripe Billing Portal session */
async function handleCreatePortalSession(supabase, tenantId, payload) {
  const clientId = payload.client_id;
  const returnUrl = payload.return_url ?? "https://clips.app/client";
  const { customerId } = await ensureStripeCustomer(supabase, tenantId, clientId);

  const session = await stripeRequest("/billing_portal/sessions", "POST", {
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    url: session.url,
  };
}
// ── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
  try {
    const { action, ...payload } = await req.json();
    if (!action) {
      return new Response(
        JSON.stringify({
          error: "Missing 'action' field",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    // Create admin Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Resolve tenant from the authenticated user's JWT
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    // Get tenant_id from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
    if (!profile?.tenant_id) {
      return new Response(
        JSON.stringify({
          error: "No tenant found",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    const tenantId = profile.tenant_id;
    let result;
    switch (action) {
      case "create-payment-link":
        result = await handleCreatePaymentLink(supabase, tenantId, payload);
        break;
      case "create-subscription":
        result = await handleCreateSubscription(supabase, tenantId, payload);
        break;
      case "cancel-subscription":
        result = await handleCancelSubscription(payload);
        break;
      case "list-products":
        result = await handleListProducts();
        break;
      case "record-payment":
        result = await handleRecordPayment(supabase, tenantId, payload);
        break;
      case "create-portal-session":
        result = await handleCreatePortalSession(supabase, tenantId, payload);
        break;
      default:
        return new Response(
          JSON.stringify({
            error: `Unknown action: ${action}`,
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (err) {
    console.error("stripe-actions error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
