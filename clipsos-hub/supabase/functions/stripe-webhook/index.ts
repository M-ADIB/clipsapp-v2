// @ts-nocheck — Deno edge function; types resolved at runtime by Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ─────────────────────────────────────────────────────────────
// stripe-webhook — Receives Stripe webhook events, validates
// the signature, logs to stripe_events_log, and upserts
// stripe_charges or stripe_subscriptions.
//
// verify_jwt: false (webhook endpoint — Stripe sends raw POST)
// Required env: STRIPE_WEBHOOK_SECRET, SUPABASE_URL,
//               SUPABASE_SERVICE_ROLE_KEY
// ─────────────────────────────────────────────────────────────

/** Stripe event types we care about */
const CHARGE_EVENTS = [
  "charge.succeeded",
  "charge.failed",
  "charge.refunded",
  "charge.updated",
] as const;

const PAYMENT_INTENT_EVENTS = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
] as const;

const INVOICE_EVENTS = ["invoice.paid", "invoice.payment_failed"] as const;

const SUBSCRIPTION_EVENTS = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

// —— Crypto helpers for HMAC-SHA256 signature verification ——

async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, message);
  return new Uint8Array(sig);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verify Stripe webhook signature (v1 scheme).
 * Tolerance: 300 seconds (5 minutes).
 */
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const sigPart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !sigPart) return false;

  const timestamp = timestampPart.split("=")[1];
  const expectedSig = sigPart.split("=")[1];

  // Check timestamp tolerance (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(secret);
  const messageBytes = encoder.encode(signedPayload);
  const computedSig = toHex(await hmacSha256(keyBytes, messageBytes));

  return timingSafeEqual(computedSig, expectedSig);
}

/** Map Stripe charge status to our DB status */
function mapChargeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "succeeded":
      return "succeeded";
    case "failed":
      return "failed";
    case "pending":
      return "pending";
    default:
      return stripeStatus;
  }
}

/** Map Stripe subscription status to our DB status */
function mapSubscriptionStatus(stripeStatus: string): string {
  // Stripe uses: active, past_due, canceled, unpaid, trialing, incomplete, incomplete_expired, paused
  return stripeStatus;
}

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Read the raw body for signature verification
  const body = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  if (!sigHeader) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // —— Step 1: Verify signature ——
  const isValid = await verifyStripeSignature(body, sigHeader, webhookSecret);
  if (!isValid) {
    console.error("Stripe signature verification failed");
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse the event
  let event: {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`Processing Stripe event: ${event.type} (${event.id})`);

  // —— Step 2: Create Supabase admin client ——
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // —— Step 3: Resolve tenant_id ——
  // Strategy: look at event metadata.tenant_id, or fall back to
  // looking up the stripe_customer_id in our existing records.
  const obj = event.data.object;
  const metadata = (obj.metadata as Record<string, string>) ?? {};
  let tenantId: string | null = metadata.tenant_id ?? null;

  if (!tenantId) {
    // Try to resolve from existing stripe_charges or stripe_subscriptions
    // by matching the stripe_customer_id
    const customerId = (obj.customer as string) ?? null;
    if (customerId) {
      const { data: existing } = await supabase
        .from("stripe_charges")
        .select("tenant_id")
        .eq("stripe_customer_id", customerId)
        .limit(1)
        .single();

      if (existing?.tenant_id) {
        tenantId = existing.tenant_id;
      } else {
        // Try subscriptions table
        const { data: existingSub } = await supabase
          .from("stripe_subscriptions")
          .select("tenant_id")
          .eq("stripe_customer_id", customerId)
          .limit(1)
          .single();
        if (existingSub?.tenant_id) {
          tenantId = existingSub.tenant_id;
        }
      }
    }
  }

  if (!tenantId) {
    // If we still can't resolve tenant, try fetching the single tenant
    // (works for single-tenant deployments)
    const { data: tenants } = await supabase.from("tenants").select("id").limit(1).single();
    if (tenants?.id) {
      tenantId = tenants.id;
    }
  }

  if (!tenantId) {
    console.error(`Cannot resolve tenant_id for event ${event.id}`);
    // Return 200 to prevent Stripe from retrying — we log it but can't process
    return new Response(JSON.stringify({ received: true, warning: "tenant_id unresolved" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // —— Step 4: Log event (idempotent via unique constraint) ——
  const { error: logError } = await supabase.from("stripe_events_log").insert({
    tenant_id: tenantId,
    stripe_event_id: event.id,
    event_type: event.type,
  });

  if (logError) {
    // If it's a unique violation, this event was already processed
    if (logError.code === "23505") {
      console.log(`Event ${event.id} already processed (idempotent skip)`);
      return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Failed to log event:", logError);
    // Return 500 so Stripe retries
    return new Response(JSON.stringify({ error: "Failed to log event" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // —— Step 5: Process by event type ——
  try {
    if ((CHARGE_EVENTS as readonly string[]).includes(event.type)) {
      await handleChargeEvent(supabase, tenantId, obj);
    } else if ((PAYMENT_INTENT_EVENTS as readonly string[]).includes(event.type)) {
      await handlePaymentIntentEvent(supabase, tenantId, obj, event.type);
    } else if ((INVOICE_EVENTS as readonly string[]).includes(event.type)) {
      await handleInvoiceEvent(supabase, tenantId, obj, event.type);
    } else if ((SUBSCRIPTION_EVENTS as readonly string[]).includes(event.type)) {
      await handleSubscriptionEvent(supabase, tenantId, obj, event.type);
    } else {
      console.log(`Unhandled event type: ${event.type} — logged only`);
    }
  } catch (err) {
    console.error(`Error processing ${event.type}:`, err);
    // Return 200 anyway — the event is logged and won't be retried.
    // We avoid 500 here because retrying won't help if the handler logic failed.
    return new Response(
      JSON.stringify({ received: true, status: "processing_error", error: String(err) }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ received: true, status: "processed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// —— Charge handler ——

async function handleChargeEvent(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  charge: Record<string, unknown>,
) {
  const chargeId = charge.id as string;
  const customerId = (charge.customer as string) ?? null;
  const customerEmail =
    ((charge.billing_details as Record<string, unknown>)?.email as string) ??
    (charge.receipt_email as string) ??
    null;
  const amount = (charge.amount as number) ?? 0;
  const currency = ((charge.currency as string) ?? "usd").toLowerCase();
  const status = mapChargeStatus(charge.status as string);
  const description = (charge.description as string) ?? null;
  const fee = ((charge.balance_transaction as Record<string, unknown>)?.fee as number) ?? 0;
  const net =
    ((charge.balance_transaction as Record<string, unknown>)?.net as number) ?? amount - fee;
  const stripeCreatedAt = charge.created
    ? new Date((charge.created as number) * 1000).toISOString()
    : null;

  // Resolve client_id from customer email if possible
  let clientId: string | null = null;
  if (customerEmail) {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("email", customerEmail)
      .limit(1)
      .single();
    clientId = client?.id ?? null;
  }

  const { error } = await supabase.from("stripe_charges").upsert(
    {
      tenant_id: tenantId,
      stripe_charge_id: chargeId,
      client_id: clientId,
      customer_email: customerEmail,
      stripe_customer_id: customerId,
      amount,
      currency,
      status,
      fee,
      net,
      description,
      receipt_url: (charge.receipt_url as string) || null,
      stripe_created_at: stripeCreatedAt,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "stripe_charge_id" },
  );

  if (error) {
    console.error("Failed to upsert charge:", error);
    throw new Error(`Charge upsert failed: ${error.message}`);
  }

  console.log(`Charge ${chargeId} upserted (status: ${status})`);
}

// —— Subscription handler ——

async function handleSubscriptionEvent(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  subscription: Record<string, unknown>,
  eventType: string,
) {
  const subId = subscription.id as string;
  const customerId = (subscription.customer as string) ?? null;
  const status =
    eventType === "customer.subscription.deleted"
      ? "canceled"
      : mapSubscriptionStatus(subscription.status as string);

  // Extract plan info from the first item
  const items = subscription.items as Record<string, unknown> | undefined;
  const itemsData = (items?.data as Array<Record<string, unknown>>) ?? [];
  const firstItem = itemsData[0] ?? {};
  const plan = (firstItem.plan as Record<string, unknown>) ?? {};
  const price = (firstItem.price as Record<string, unknown>) ?? plan;
  const planName = (price.nickname as string) ?? (plan.nickname as string) ?? null;
  const amount = (price.unit_amount as number) ?? (plan.amount as number) ?? 0;
  const currency = ((price.currency as string) ?? "usd").toLowerCase();
  const interval = (plan.interval as string) ?? "month";

  const currentPeriodStart = subscription.current_period_start
    ? new Date((subscription.current_period_start as number) * 1000).toISOString()
    : null;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date((subscription.current_period_end as number) * 1000).toISOString()
    : null;
  const canceledAt = subscription.canceled_at
    ? new Date((subscription.canceled_at as number) * 1000).toISOString()
    : null;
  const stripeCreatedAt = subscription.created
    ? new Date((subscription.created as number) * 1000).toISOString()
    : null;

  // Resolve customer email
  let customerEmail: string | null = null;
  let clientId: string | null = null;
  if (customerId) {
    // Try to find email from existing charges
    const { data: existingCharge } = await supabase
      .from("stripe_charges")
      .select("customer_email, client_id")
      .eq("stripe_customer_id", customerId)
      .limit(1)
      .single();
    customerEmail = existingCharge?.customer_email ?? null;
    clientId = existingCharge?.client_id ?? null;
  }

  const { error } = await supabase.from("stripe_subscriptions").upsert(
    {
      tenant_id: tenantId,
      stripe_subscription_id: subId,
      stripe_customer_id: customerId,
      client_id: clientId,
      customer_email: customerEmail,
      status,
      plan_name: planName,
      amount,
      currency,
      interval,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      canceled_at: canceledAt,
      stripe_created_at: stripeCreatedAt,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) {
    console.error("Failed to upsert subscription:", error);
    throw new Error(`Subscription upsert failed: ${error.message}`);
  }

  console.log(`Subscription ${subId} upserted (status: ${status})`);
}

async function handlePaymentIntentEvent(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  paymentIntent: Record<string, unknown>,
  eventType: string,
) {
  const piId = paymentIntent.id as string;
  const chargeId = (paymentIntent.latest_charge as string) ?? piId;
  const customerId = (paymentIntent.customer as string) ?? null;
  const customerEmail = (paymentIntent.receipt_email as string) ?? null;
  const amount = (paymentIntent.amount as number) ?? 0;
  const currency = ((paymentIntent.currency as string) ?? "usd").toLowerCase();
  const status = eventType === "payment_intent.succeeded" ? "succeeded" : "failed";
  const description = (paymentIntent.description as string) ?? null;
  const stripeCreatedAt = paymentIntent.created
    ? new Date((paymentIntent.created as number) * 1000).toISOString()
    : null;

  // Resolve client_id from customer email if possible
  let clientId: string | null = null;
  if (customerEmail) {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("email", customerEmail)
      .limit(1)
      .single();
    clientId = client?.id ?? null;
  }

  const { error } = await supabase.from("stripe_charges").upsert(
    {
      tenant_id: tenantId,
      stripe_charge_id: chargeId,
      client_id: clientId,
      customer_email: customerEmail,
      stripe_customer_id: customerId,
      amount,
      currency,
      status,
      fee: 0,
      net: amount,
      description,
      stripe_created_at: stripeCreatedAt,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "stripe_charge_id" },
  );

  if (error) {
    console.error("Failed to upsert charge from payment intent:", error);
    throw new Error(`Payment intent charge upsert failed: ${error.message}`);
  }

  console.log(`Charge ${chargeId} (via PaymentIntent ${piId}) upserted (status: ${status})`);
}

async function handleInvoiceEvent(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  invoice: Record<string, unknown>,
  eventType: string,
) {
  const invoiceId = invoice.id as string;
  const chargeId = (invoice.charge as string) ?? (invoice.payment_intent as string) ?? invoiceId;
  const customerId = (invoice.customer as string) ?? null;
  const customerEmail = (invoice.customer_email as string) ?? null;
  const amount =
    (invoice.amount_paid as number) ??
    (invoice.amount_due as number) ??
    (invoice.total as number) ??
    0;
  const currency = ((invoice.currency as string) ?? "usd").toLowerCase();
  const status = eventType === "invoice.paid" ? "succeeded" : "failed";
  const description = (invoice.description as string) ?? null;
  const stripeCreatedAt = invoice.created
    ? new Date((invoice.created as number) * 1000).toISOString()
    : null;

  // Resolve client_id from customer email if possible
  let clientId: string | null = null;
  if (customerEmail) {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("email", customerEmail)
      .limit(1)
      .single();
    clientId = client?.id ?? null;
  }

  const { error } = await supabase.from("stripe_charges").upsert(
    {
      tenant_id: tenantId,
      stripe_charge_id: chargeId,
      client_id: clientId,
      customer_email: customerEmail,
      stripe_customer_id: customerId,
      amount,
      currency,
      status,
      fee: 0,
      net: amount,
      description,
      stripe_created_at: stripeCreatedAt,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "stripe_charge_id" },
  );

  if (error) {
    console.error("Failed to upsert charge from invoice:", error);
    throw new Error(`Invoice charge upsert failed: ${error.message}`);
  }

  console.log(`Charge ${chargeId} (via Invoice ${invoiceId}) upserted (status: ${status})`);
}
