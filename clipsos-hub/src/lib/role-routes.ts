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
