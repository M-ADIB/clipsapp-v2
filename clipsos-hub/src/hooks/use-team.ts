import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./query-keys";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/integrations/supabase/db-types";

/**
 * Fetch the current tenant's plan limits from platform_plans.
 * Returns { maxUsers, maxClients } from the matching plan slug.
 */
export function useTenantPlanLimits() {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["tenant-plan-limits", tenantId],
    queryFn: async () => {
      // 1. Get current tenant info
      const { data: tenant, error: tErr } = await (supabase.from("tenants") as any)
        .select("plan, max_users, max_clients, is_platform_tenant")
        .eq("id", tenantId)
        .maybeSingle();

      if (tErr) throw tErr;

      // Platform tenant (Tenant Zero) = unlimited, no restrictions
      if (tenant?.is_platform_tenant) {
        return {
          maxUsers: Infinity,
          maxClients: Infinity,
          planSlug: "platform" as const,
          isPlatformTenant: true,
        };
      }

      const planSlug = tenant?.plan ?? "free";

      // 2. Get limits from platform_plans
      const { data: planRow, error: pErr } = await (supabase.from("platform_plans") as any)
        .select("max_users, max_clients")
        .eq("slug", planSlug)
        .maybeSingle();

      // Fall back to tenant-level limits if plan not found
      if (pErr || !planRow) {
        return {
          maxUsers: tenant?.max_users ?? 999,
          maxClients: tenant?.max_clients ?? 999,
          planSlug,
          isPlatformTenant: false,
        };
      }

      return {
        maxUsers: planRow.max_users as number,
        maxClients: planRow.max_clients as number,
        planSlug,
        isPlatformTenant: false,
      };
    },
    enabled: isAuthenticated && !!tenantId,
  });
}

/**
 * Custom hook to fetch all profiles within the current tenant (internal team members).
 * RLS ensures that the current user can only see profiles in their tenant.
 */
export function useTeam() {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.team.all(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles!inner(role)")
        .neq("user_roles.role", "client")
        .order("full_name", { ascending: true });

      if (error) throw error;

      // Flatten the role from the joined user_roles array
      return (data ?? []).map((p) => {
        const roleRow = Array.isArray(p.user_roles) ? p.user_roles[0] : p.user_roles;
        return {
          ...p,
          role: (roleRow as { role: string } | null)?.role ?? null,
          user_roles: undefined, // Remove nested object
        };
      });
    },
    enabled: isAuthenticated && !!tenantId,
  });
}

/**
 * Hook to invite a new team member to the current tenant.
 */
export function useInviteMember() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Assuming we have a Supabase Edge Function named "invite-user"
      // that handles auth.admin.inviteUserByEmail and adds the profile.
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, role, tenant_id: tenantId },
      });

      if (error) {
        throw new Error(error.message || "Failed to invite member");
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate the team query so the new member shows up (if they are inserted immediately)
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.team.all(tenantId) });
      }
    },
  });
}
