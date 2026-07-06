import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

/**
 * invite-user — invites a new team member via the Supabase Auth Admin API.
 *
 * SECURITY: This function uses the service-role key, so it MUST authorize the
 * caller itself (the gateway only proves the caller holds *some* valid JWT).
 * We therefore:
 *   1. Resolve the caller from their Bearer token.
 *   2. Look up the caller's role + tenant from `user_roles`.
 *   3. Require the caller to be an `owner` or `manager`.
 *   4. Force the invite into the CALLER's tenant (ignore any client-supplied
 *      tenant_id that doesn't match) — no cross-tenant invites.
 *   5. Only allow assigning roles the caller is permitted to grant
 *      (managers cannot mint owners/managers).
 */

// Roles each inviter role is allowed to assign. Owners can assign anything
// except another owner (owner creation is intentionally out-of-band).
const ASSIGNABLE_ROLES: Record<string, string[]> = {
  owner: [
    "manager",
    "senior_editor",
    "editor",
    "content_creator",
    "closer",
    "moderator",
    "client",
  ],
  manager: [
    "senior_editor",
    "editor",
    "content_creator",
    "closer",
    "moderator",
    "client",
  ],
};

serve(async (req) => {
  const preflight = handleCorsPreflightRequest(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Resolve the caller from their Bearer token.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return json({ error: "Unauthorized — no token provided" }, 401);
    }

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return json({ error: "Unauthorized — invalid or expired token" }, 401);
    }
    const callerId = userData.user.id;

    // 2. Look up the caller's role + tenant (highest-priority role wins).
    const { data: callerRoleRow, error: roleErr } = await admin
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", callerId)
      .order("role")
      .limit(1)
      .maybeSingle();

    if (roleErr) {
      return json({ error: "Failed to resolve caller role" }, 500);
    }
    const callerRole = callerRoleRow?.role ?? null;
    const callerTenant = callerRoleRow?.tenant_id ?? null;

    // 3. Only owner/manager may invite.
    const assignable = callerRole ? ASSIGNABLE_ROLES[callerRole] : undefined;
    if (!assignable || !callerTenant) {
      return json(
        { error: "Forbidden — only owners or managers can invite users" },
        403,
      );
    }

    const { email, role } = await req.json();
    if (!email || !role) {
      return json({ error: "Missing required fields: email, role" }, 400);
    }

    // 4/5. Enforce assignable-role allowlist. Tenant is forced to the caller's
    // own tenant below — any client-supplied tenant_id is ignored.
    if (!assignable.includes(role)) {
      return json(
        { error: `Forbidden — you are not allowed to assign the role "${role}"` },
        403,
      );
    }

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        role,
        tenant_id: callerTenant,
      },
    });

    if (error) throw error;

    return json({ user: data.user }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json({ error: message }, 400);
  }
});
