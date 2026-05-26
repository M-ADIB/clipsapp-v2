/**
 * Cloudflare Stream URL builders.
 *
 * `video_playback_url` in our DB looks like:
 *   https://customer-XXXXXX.cloudflarestream.com/<id>/manifest/video.m3u8
 *
 * From it we can derive the iframe URL, the thumbnail JPG, and the
 * downloads/default.mp4 URL.
 */

export interface CloudflareMedia {
  video_cloudflare_id?: string | null;
  video_playback_url?: string | null;
  video_thumbnail_url?: string | null;
}

const CLOUDFLARE_ID_RE = /cloudflarestream\.com\/([a-f0-9]{20,})/i;
const SUBDOMAIN_RE = /https:\/\/customer-([a-z0-9]+)\.cloudflarestream\.com/i;

export function getCloudflareId(media: CloudflareMedia | null | undefined): string | null {
  if (!media) return null;
  if (media.video_cloudflare_id) return media.video_cloudflare_id.split("?")[0];
  const haystack = media.video_playback_url ?? media.video_thumbnail_url ?? "";
  const match = haystack.match(CLOUDFLARE_ID_RE);
  return match?.[1] ?? null;
}

export function getCloudflareSubdomain(media: CloudflareMedia | null | undefined): string | null {
  if (!media) return null;
  const haystack = media.video_playback_url ?? media.video_thumbnail_url ?? "";
  const match = haystack.match(SUBDOMAIN_RE);
  return match?.[1] ?? null;
}

/** HLS manifest URL — the source of truth for the <video> player. */
export function getHlsManifestUrl(media: CloudflareMedia | null | undefined): string | null {
  if (media?.video_playback_url?.includes(".m3u8")) return media.video_playback_url;
  const id = getCloudflareId(media);
  const sub = getCloudflareSubdomain(media);
  if (!id) return null;
  if (sub) return `https://customer-${sub}.cloudflarestream.com/${id}/manifest/video.m3u8`;
  return `https://videodelivery.net/${id}/manifest/video.m3u8`;
}

/** Iframe URL — fallback player when HLS.js can't be loaded. */
export function getIframeUrl(media: CloudflareMedia | null | undefined): string | null {
  const id = getCloudflareId(media);
  const sub = getCloudflareSubdomain(media);
  if (!id) return null;
  const base = sub
    ? `https://customer-${sub}.cloudflarestream.com`
    : `https://iframe.videodelivery.net`;
  return `${base}/${id}/iframe`;
}

/** Hosted thumbnail JPG. */
export function getThumbnailUrl(
  media: CloudflareMedia | null | undefined,
  options: { height?: number; time?: number } = {},
): string | null {
  if (media?.video_thumbnail_url) return media.video_thumbnail_url;
  const id = getCloudflareId(media);
  if (!id) return null;
  const params = new URLSearchParams();
  if (options.height) params.set("height", String(options.height));
  if (options.time) params.set("time", `${options.time}s`);
  const qs = params.toString();
  return `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg${qs ? `?${qs}` : ""}`;
}
