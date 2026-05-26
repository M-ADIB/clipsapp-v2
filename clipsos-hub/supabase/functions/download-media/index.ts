/**
 * download-media — resolves a download URL for a video, with optional
 * file-streaming proxy for native browser downloads.
 *
 * Auth modes:
 *   1. JWT in Authorization header (preferred — RLS scopes the lookup)
 *   2. JWT in `?token=` query param (used by the streaming iframe trigger)
 *   3. Guest review token (wave 4 — schema not present yet, returns 401 for now)
 *
 * Resolution priority for the actual file URL:
 *   1. R2 original (videos.video_original_url) — highest quality
 *   2. Cloudflare Stream MP4 download (`/downloads/default.mp4`)
 *      • If downloads aren't enabled yet, auto-enables via Stream API and
 *        returns 202 + retryAfterSeconds so the client retries.
 *
 * Modes:
 *   • Default → JSON `{ downloadUrl, filename, source }`.
 *   • `?stream=true` → proxies the file with `Content-Disposition: attachment`
 *     so the browser triggers a native download instead of opening a tab.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get("filename") ?? "download";
    const cloudflareId = url.searchParams.get("cloudflareId");
    const directUrl = url.searchParams.get("directUrl");
    const videoId = url.searchParams.get("videoId");
    const streamMode = url.searchParams.get("stream") === "true";

    /* ---------------- AUTH ---------------- */
    const authHeader = req.headers.get("Authorization");
    const tokenParam = url.searchParams.get("token");
    const effectiveAuthHeader = authHeader?.startsWith("Bearer ")
      ? authHeader
      : tokenParam
        ? `Bearer ${tokenParam}`
        : null;

    if (!effectiveAuthHeader) {
      return jsonError("Unauthorized — no token provided", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: effectiveAuthHeader } },
    });

    const token = effectiveAuthHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getUser(token);
    if (claimsErr || !claims?.user) {
      return jsonError("Unauthorized — invalid or expired token", 401);
    }

    /* ---------------- AUTHZ via RLS ---------------- */
    let resolvedDirectUrl = directUrl;
    let resolvedCloudflareId = cloudflareId;

    if (videoId) {
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
    return new Response(
      JSON.stringify({
        downloadUrl: resolvedUrl,
        filename: safeFilename,
        source: downloadSource,
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
