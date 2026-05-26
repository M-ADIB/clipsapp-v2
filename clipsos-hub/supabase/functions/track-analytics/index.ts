import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Basic ISO country code to name mapping
const countryMap: Record<string, string> = {
  AE: "United Arab Emirates",
  LB: "Lebanon",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IN: "India",
  SG: "Singapore",
  SA: "Saudi Arabia",
  QA: "Qatar",
  KW: "Kuwait",
  OM: "Oman",
  BH: "Bahrain",
  EG: "Egypt",
  JO: "Jordan",
  TR: "Turkey",
  NL: "Netherlands",
  IE: "Ireland",
  IT: "Italy",
  ES: "Spain",
  JP: "Japan",
  CN: "China",
  HK: "Hong Kong",
  MY: "Malaysia",
  ZA: "South Africa",
  BR: "Brazil",
  MX: "Mexico",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload = await req.json();
    const {
      tenant_id,
      visitor_id,
      session_id,
      event_type,
      path,
      source = "Direct",
      device,
      variant,
    } = payload;

    // Validate required fields
    if (!tenant_id || !visitor_id || !session_id || !event_type || !path || !device) {
      throw new Error(
        "Missing required parameters: tenant_id, visitor_id, session_id, event_type, path, device",
      );
    }

    // Resolve country from CDN headers
    const countryCode = req.headers.get("cf-ipcountry") || req.headers.get("x-country-code") || "";
    const countryName = countryMap[countryCode.toUpperCase()] || countryCode || "Unknown";

    // Initialize Supabase Service Role client to write events bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        tenant_id,
        visitor_id,
        session_id,
        event_type,
        path,
        source,
        device,
        variant,
        country: countryName,
      })
      .select()
      .single();

    if (error) {
      console.error("[track-analytics] Insert error:", error);
      throw error;
    }

    console.log("[track-analytics] Successfully tracked event:", data.id);

    return new Response(JSON.stringify({ success: true, event_id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[track-analytics] Fatal error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
