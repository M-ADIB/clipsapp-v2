// Centralized CORS configuration for all edge functions
// Restricts requests to only allowed origins

const ALLOWED_ORIGINS = [
  'https://theclips.agency',
  'https://app.theclips.agency',
  'https://www.theclips.agency',
  'https://theclipsagency.lovable.app',
  'https://app-theclips-agency.lovable.app',
  // Lovable preview domains
  'https://id-preview--a5ccb935-4d6b-4ab7-b758-d7fb11dc716d.lovable.app',
];

// Also allow any *.lovable.app subdomain for preview deployments
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any lovable.app preview subdomain
  if (/^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin)) return true;
  // Allow lovableproject.com preview domains
  if (/^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin)) return true;
  return false;
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-upload-id, x-storage-path, x-part-number, upload-offset, x-upload-url, x-content-item-id, x-chunk-index, x-version-id, x-trial-id, x-recovery-check, tus-resumable',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}
