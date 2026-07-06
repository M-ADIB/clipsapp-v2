/**
 * download-media — resolves a download URL for a video, with optional
 * file-streaming proxy for native browser downloads.
 *
 * Auth modes:
 *   1. JWT in Authorization header (preferred — RLS scopes the lookup).
 *   2. Short-lived signed download token in `?dl=` (used by the streaming
 *      iframe trigger, which cannot set an Authorization header). The token is
 *      an HMAC over (videoId, exp) minted only AFTER a header-authenticated
 *      JSON request authorized the caller for that video. It expires in ~2 min
 *      and authorizes exactly one video, so a leak (logs/referer/history) is
 *      near-worthless — unlike the raw session JWT that was previously placed
 *      in the URL.
 *
 * Resolution priority for the actual file URL:
 *   1. R2 original (videos.video_original_url) — highest quality
 *   2. Cloudflare Stream MP4 download (`/downloads/default.mp4`)
 *      • If downloads aren't enabled yet, auto-enables via Stream API and
 *        returns 202 + retryAfterSeconds so the client retries.
 *
 * Modes:
 *   • Default → JSON `{ downloadUrl, filename, source, dlToken }`.
 *   • `?stream=true` → proxies the file with `Content-Disposition: attachment`
 *     so the browser triggers a native download instead of opening a tab.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  // Never send the token-bearing URL to third parties via Referer.
  "Referrer-Policy": "no-referrer",
};

const DL_TOKEN_TTL_SECONDS = 120;

/* ---------------- Signed download-token helpers ---------------- */
// HMAC-SHA256 keyed with the service-role secret (server-only, never leaves
// the function). The token proves "this caller was authorized for this videoId
// until `exp`", nothing more.
async function hmacKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function mintDlToken(videoId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + DL_TOKEN_TTL_SECONDS;
  const payload = `${videoId}.${exp}`;
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    new TextEncoder().encode(payload),
  );
  return `${payload}.${b64url(new Uint8Array(sig))}`;
}

async function verifyDlToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [videoId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!videoId || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  const expected = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    new TextEncoder().encode(`${videoId}.${exp}`),
  );
  if (b64url(new Uint8Array(expected)) !== sig) return null;
  return videoId;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get("filename") ?? "download";
    const cloudflareId = url.searchParams.get("cloudflareId");
    const directUrl = url.searchParams.get("directUrl");
    let videoId = url.searchParams.get("videoId");
    const streamMode = url.searchParams.get("stream") === "true";
    const dlToken = url.searchParams.get("dl");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    /* ---------------- AUTH ---------------- */
    // Path A: signed short-lived download token (streaming iframe path).
    // Path B: Authorization header (JSON path + any header-capable client).
    let supabase;
    let authorizedVideoId: string | null = null;

    if (dlToken) {
      const tokenVideoId = await verifyDlToken(dlToken);
      if (!tokenVideoId) {
        return jsonError("Unauthorized — invalid or expired download token", 401);
      }
      // Token already proves authorization for this specific video; resolve the
      // file with the service client (no user JWT is present on this request).
      authorizedVideoId = tokenVideoId;
      videoId = tokenVideoId;
      supabase = createClient(supabaseUrl, serviceKey);
    } else {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return jsonError("Unauthorized — no token provided", 401);
      }
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsErr } = await supabase.auth.getUser(token);
      if (claimsErr || !claims?.user) {
        return jsonError("Unauthorized — invalid or expired token", 401);
      }
    }

    /* ---------------- AUTHZ via RLS (header path) ---------------- */
    let resolvedDirectUrl = directUrl;
    let resolvedCloudflareId = cloudflareId;

    if (videoId) {
      // Header path: RLS-scoped client enforces access. Token path: service
      // client, but the signed token already gated access to this videoId.
      const { data: video, error: videoErr } = await supabase
        .from("videos")
        .select("id, video_cloudflare_id, video_playback_url, video_original_url")
        .eq("id", videoId)
        .maybeSingle();

      if (videoErr || !video) {
        return jsonError("Forbidden — no access to this video", 403);
      }

      // Trust DB values over query params (defense in depth)
      resolvedDirectUrl ??= video.video_original_url ?? null;
      resolvedCloudflareId ??= video.video_cloudflare_id ?? null;
      if (!resolvedCloudflareId && video.video_playback_url) {
        const m = video.video_playback_url.match(/cloudflarestream\.com\/([a-f0-9]{20,})/i);
        if (m) resolvedCloudflareId = m[1];
      }
    } else if (dlToken) {
      // A signed token must always carry a videoId.
      return jsonError("Bad request — token missing video scope", 400);
    }

    /* ---------------- URL RESOLUTION ---------------- */
    let cfSubdomain = Deno.env.get("CLOUDFLARE_CUSTOMER_SUBDOMAIN") ?? "";
    cfSubdomain = cfSubdomain.replace(/^customer-/, "").replace(/\.cloudflarestream\.com$/, "");

    let resolvedUrl: string | null = null;
    let downloadSource = "unknown";

    // Priority 1: R2 original
    if (resolvedDirectUrl) {
      try {
        const head = await fetch(resolvedDirectUrl, { method: "HEAD" });
        if (head.ok) {
          resolvedUrl = resolvedDirectUrl;
          downloadSource = resolvedDirectUrl.includes("r2.") ? "r2-original" : "direct-url";
        }
      } catch {
        /* fall through */
      }
    }

    // Priority 2: Cloudflare Stream MP4 download
    if (!resolvedUrl && resolvedCloudflareId && cfSubdomain) {
      const streamUrl = `https://customer-${cfSubdomain}.cloudflarestream.com/${resolvedCloudflareId}/downloads/default.mp4`;
      try {
        const head = await fetch(streamUrl, { method: "HEAD" });
        if (head.ok) {
          resolvedUrl = streamUrl;
          downloadSource = "cloudflare-stream-compressed";
        } else if (head.status === 403 || head.status === 404) {
          // Auto-enable downloads via Stream API
          const cfAccountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
          const cfApiToken = Deno.env.get("CLOUDFLARE_ACESS_TOKEN_API_KEY");
          if (cfAccountId && cfApiToken) {
            const enable = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${resolvedCloudflareId}/downloads`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${cfApiToken}`,
                  "Content-Type": "application/json",
                },
              },
            );
            const enableJson = await enable.json().catch(() => ({}));
            if (enable.ok && enableJson.success) {
              return new Response(JSON.stringify({ status: "preparing", retryAfterSeconds: 10 }), {
                status: 202,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          }
        }
      } catch {
        /* fall through */
      }
    }

    if (!resolvedUrl) {
      return jsonError("File not available — original may not be uploaded yet", 404);
    }

    /* ---------------- FILENAME ---------------- */
    const hasExt = /\.\w{2,4}$/.test(filename);
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_") + (hasExt ? "" : ".mp4");

    /* ---------------- STREAM MODE (proxy) ---------------- */
    if (streamMode) {
      const upstream = await fetch(resolvedUrl);
      if (!upstream.ok || !upstream.body) {
        return jsonError(`Upstream fetch failed (${upstream.status})`, 502);
      }
      const headers: Record<string, string> = {
        ...corsHeaders,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Type": "application/octet-stream",
        "X-Download-Source": downloadSource,
        "Cache-Control": "no-store",
      };
      const len = upstream.headers.get("Content-Length");
      if (len) headers["Content-Length"] = len;
      return new Response(upstream.body, { status: 200, headers });
    }

    /* ---------------- JSON MODE (default) ---------------- */
    // Mint a short-lived, single-video download token so the streaming iframe
    // never has to carry the raw session JWT in its URL.
    const tokenVideoId = authorizedVideoId ?? videoId;
    const dl = tokenVideoId ? await mintDlToken(tokenVideoId) : null;

    return new Response(
      JSON.stringify({
        downloadUrl: resolvedUrl,
        filename: safeFilename,
        source: downloadSource,
        dlToken: dl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("download-media error:", err);
    return jsonError(err instanceof Error ? err.message : "Unexpected error", 500);
  }
});

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
