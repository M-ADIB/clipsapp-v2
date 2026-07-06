/**
 * Maps each role to its default landing route. Used by the index route
 * to send a freshly-authenticated user to "their" dashboard.
 */
import type { AppRole } from "@/integrations/supabase/db-types";

export const ROLE_HOME: Record<AppRole, string> = {
  owner: "/owner",
  manager: "/manager",
  senior_editor: "/senior-editor",
  content_creator: "/content-creator",
  editor: "/editor",
  moderator: "/moderator",
  closer: "/closer",
  client: "/client",
};

export function homeForRole(role: AppRole | null | undefined): string {
  if (!role) return "/";
  return ROLE_HOME[role] ?? "/";
}

/**
 * URL-prefix → the role a route tree is scoped to. Order matters: longer,
 * more specific prefixes are listed before ones they'd otherwise match under
 * `startsWith` (e.g. `/senior-editor` before `/editor`). "platform" is a
 * pseudo-role gated by `isPlatformAdmin` rather than the user's app role.
 */
const ROUTE_ROLE_PREFIXES: ReadonlyArray<readonly [string, string]> = [
  ["/owner", "owner"],
  ["/manager", "manager"],
  ["/senior-editor", "senior_editor"],
  ["/content-creator", "content_creator"],
  ["/editor", "editor"],
  ["/moderator", "moderator"],
  ["/closer", "closer"],
  ["/client", "client"],
  ["/platform", "platform"],
];

/** The role a route path is scoped to, or null if the path isn't role-scoped. */
export function routeRoleForPath(pathname: string): string | null {
  for (const [prefix, role] of ROUTE_ROLE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return role;
  }
  return null;
}

/**
 * Given the current user and path, return where they should be redirected to
 * enforce role-aware routing, or `null` if access is allowed. Pure logic
 * extracted from the `_authenticated` layout so it can be unit-tested.
 */
export function resolveRoleRedirect(params: {
  role: AppRole;
  isPlatformAdmin: boolean;
  pathname: string;
}): string | null {
  const routeRole = routeRoleForPath(params.pathname);
  if (!routeRole) return null;
  if (routeRole === "platform") {
    return params.isPlatformAdmin ? null : homeForRole(params.role);
  }
  return routeRole !== params.role ? homeForRole(params.role) : null;
}
