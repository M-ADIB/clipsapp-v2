import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { S3Client, CreateMultipartUploadCommand } from "npm:@aws-sdk/client-s3@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth ──
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");
    console.log("[init-upload] user:", user.id);

    // ── Input ──
    const { video_id, version_id, file_name, file_size, mime_type } = await req.json();
    if (!video_id || !version_id || !file_name || !file_size || !mime_type) {
      throw new Error(
        "Missing required fields: video_id, version_id, file_name, file_size, mime_type",
      );
    }
    console.log("[init-upload] file:", file_name, file_size);

    // ── Get tenant ──
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) throw new Error("No tenant found for user");
    const tenantId = profile.tenant_id;

    // ── Get video info ──
    const { data: video } = await serviceClient
      .from("videos")
      .select("client_id")
      .eq("id", video_id)
      .single();
    const clientId = video?.client_id || "unassigned";

    // ── 1. Stream Direct Creator Upload (TUS) ──
    // Try both secret names for compatibility
    const cfAccountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
    const cfApiToken =
      Deno.env.get("CLOUDFLARE_API_TOKEN_UNLIMITED") || Deno.env.get("CLOUDFLARE_R2_ACCOUNT_TOKEN");

    let tusUrl: string | null = null;
    let streamMediaId: string | null = null;

    if (cfAccountId && cfApiToken) {
      try {
        const maxDuration = Math.min(
          Math.max(300, Math.ceil((file_size / (1024 * 1024 * 1024)) * 480)),
          21600,
        );
        const expiry = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

        const streamRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream?direct_user=true`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cfApiToken}`,
              "Tus-Resumable": "1.0.0",
              "Upload-Length": String(file_size),
              "Upload-Metadata": [
                `name ${btoa(file_name)}`,
                `maxDurationSeconds ${btoa(String(maxDuration))}`,
                `expiry ${btoa(expiry)}`,
              ].join(","),
            },
          },
        );

        if (streamRes.ok || streamRes.status === 201) {
          tusUrl = streamRes.headers.get("location");
          streamMediaId = streamRes.headers.get("stream-media-id");
          console.log("[init-upload] Stream OK, mediaId:", streamMediaId);
        } else {
          const errBody = await streamRes.text();
          console.error("[init-upload] Stream API error:", streamRes.status, errBody);
        }
      } catch (streamErr) {
        console.error("[init-upload] Stream error (non-fatal):", streamErr.message);
      }
    } else {
      console.log("[init-upload] Skipping Stream (no creds)");
    }

    // ── 2. R2 Multipart Upload ──
    const r2AccessKey = Deno.env.get("CLOUDFLARE_R2_ACCESS_KEY_ID");
    const r2SecretKey = Deno.env.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
    const r2Bucket =
      Deno.env.get("CLOUDFLARE_S3_API_R2_BUCKET_VIDEO_ORIGINALS") || "video-originals";
    const r2Endpoint = Deno.env.get("CLOUDFLARE_R2_ENDPOINT_URL");

    console.log("[init-upload] R2 config:", {
      hasAccessKey: !!r2AccessKey,
      hasSecretKey: !!r2SecretKey,
      bucket: r2Bucket,
      hasEndpoint: !!r2Endpoint,
    });

    let r2UploadId: string | null = null;
    const safeFileName = file_name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const r2Key = `${tenantId}/${clientId}/${video_id}/${version_id}/original/${safeFileName}`;

    if (r2AccessKey && r2SecretKey && r2Bucket && r2Endpoint) {
      const s3 = new S3Client({
        region: "auto",
        endpoint: r2Endpoint,
        credentials: { accessKeyId: r2AccessKey, secretAccessKey: r2SecretKey },
      });

      const multipartRes = await s3.send(
        new CreateMultipartUploadCommand({
          Bucket: r2Bucket,
          Key: r2Key,
          ContentType: mime_type,
        }),
      );
      r2UploadId = multipartRes.UploadId ?? null;
      console.log("[init-upload] R2 multipart created:", r2UploadId);
    } else {
      throw new Error("R2 config incomplete. Check CLOUDFLARE_R2_* secrets.");
    }

    // ── 3. Calculate parts ──
    const R2_CHUNK_SIZE = 10 * 1024 * 1024;
    const r2PartsTotal = Math.ceil(file_size / R2_CHUNK_SIZE);

    // ── 4. Create upload session ──
    const { data: session, error: sessionError } = await serviceClient
      .from("upload_sessions")
      .insert({
        tenant_id: tenantId,
        video_id,
        version_id,
        file_name,
        file_size,
        mime_type,
        stream_upload_url: tusUrl,
        stream_media_id: streamMediaId,
        stream_status: tusUrl ? "pending" : "skipped",
        r2_upload_id: r2UploadId,
        r2_key: r2Key,
        r2_status: r2UploadId ? "pending" : "failed",
        r2_parts_total: r2PartsTotal,
        overall_status: "uploading",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("[init-upload] DB insert error:", sessionError);
      throw sessionError;
    }
    console.log("[init-upload] Session:", session.id);

    // ── 5. Update video_versions ──
    await serviceClient
      .from("video_versions")
      .update({ video_upload_status: "uploading" })
      .eq("id", version_id);

    return new Response(
      JSON.stringify({
        session_id: session.id,
        tus_url: tusUrl,
        stream_media_id: streamMediaId,
        r2_upload_id: r2UploadId,
        r2_key: r2Key,
        r2_parts_total: r2PartsTotal,
        r2_chunk_size: R2_CHUNK_SIZE,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("[init-upload] FATAL:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
