/**
 * use-platform.ts — Cross-tenant data hooks for Platform Admin.
 *
 * These hooks bypass single-tenant scoping — they query across ALL tenants.
 * RLS policies on platform_admins ensure only super admins can access this data.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/db-types";

/* ── Types ──────────────────────────────────────────────────── */

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  brand_colors: Record<string, unknown> | null;
  plan: string | null;
  status: string;
  owner_email: string | null;
  max_users: number;
  max_clients: number;
  trial_ends_at: string | null;
  settings: Record<string, unknown> | null;
  is_platform_tenant: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  /** Computed counts (joined client-side) */
  user_count?: number;
  client_count?: number;
  video_count?: number;
}

export interface TenantStats {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  churned: number;
  totalUsers: number;
  totalClients: number;
  totalVideos: number;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  domain?: string;
  owner_email: string;
  plan: string;
  max_users: number;
  max_clients: number;
  trial_ends_at?: string | null;
  logo_url?: string;
  brand_colors?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

/* ── All Tenants ────────────────────────────────────────────── */

export function useAllTenants() {
  return useQuery({
    queryKey: ["platform", "tenants"],
    queryFn: async (): Promise<TenantRow[]> => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as TenantRow[];
    },
  });
}

/* ── Single Tenant ──────────────────────────────────────────── */

export function useTenant(tenantId: string | undefined) {
  return useQuery({
    queryKey: ["platform", "tenants", tenantId],
    enabled: !!tenantId,
    queryFn: async (): Promise<TenantRow | null> => {
      if (!tenantId) return null;
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as TenantRow;
    },
  });
}

/* ── Cross-Tenant Stats ─────────────────────────────────────── */

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform", "stats"],
    queryFn: async (): Promise<TenantStats> => {
      // Get all tenants — cast because generated types may not include new columns
      const { data: rawTenants, error: tErr } = await supabase.from("tenants").select("*");
      if (tErr) throw tErr;
      const allTenants = (rawTenants ?? []) as unknown as TenantRow[];

      // Separate platform tenant from external tenants
      const platformTenant = allTenants.find((t) => t.is_platform_tenant);
      const externalTenants = allTenants.filter((t) => !t.is_platform_tenant);
      const platformTenantId = platformTenant?.id;

      // Count users/clients/videos EXCLUDING the platform tenant
      let userCount = 0;
      let clientCount = 0;
      let videoCount = 0;

      if (platformTenantId) {
        // Exclude platform tenant from counts
        const [uRes, cRes, vRes] = await Promise.all([
          supabase
            .from("user_roles")
            .select("id", { count: "exact", head: true })
            .neq("tenant_id", platformTenantId),
          supabase
            .from("clients")
            .select("id", { count: "exact", head: true })
            .neq("tenant_id", platformTenantId),
          supabase
            .from("videos")
            .select("id", { count: "exact", head: true })
            .neq("tenant_id", platformTenantId),
        ]);
        if (uRes.error) throw uRes.error;
        if (cRes.error) throw cRes.error;
        if (vRes.error) throw vRes.error;
        userCount = uRes.count ?? 0;
        clientCount = cRes.count ?? 0;
        videoCount = vRes.count ?? 0;
      } else {
        // No platform tenant identified — show all counts
        const [uRes, cRes, vRes] = await Promise.all([
          supabase.from("user_roles").select("id", { count: "exact", head: true }),
          supabase.from("clients").select("id", { count: "exact", head: true }),
          supabase.from("videos").select("id", { count: "exact", head: true }),
        ]);
        if (uRes.error) throw uRes.error;
        if (cRes.error) throw cRes.error;
        if (vRes.error) throw vRes.error;
        userCount = uRes.count ?? 0;
        clientCount = cRes.count ?? 0;
        videoCount = vRes.count ?? 0;
      }

      return {
        total: externalTenants.length,
        active: externalTenants.filter((t) => t.status === "active").length,
        trial: externalTenants.filter((t) => t.status === "trial").length,
        suspended: externalTenants.filter((t) => t.status === "suspended").length,
        churned: externalTenants.filter((t) => t.status === "churned").length,
        totalUsers: userCount,
        totalClients: clientCount,
        totalVideos: videoCount,
      };
    },
  });
}

/* ── Per-Tenant Counts ──────────────────────────────────────── */

export function useTenantCounts(tenantId: string | undefined) {
  return useQuery({
    queryKey: ["platform", "tenant-counts", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      if (!tenantId) return { users: 0, clients: 0, videos: 0 };

      const [{ count: users }, { count: clients }, { count: videos }] = await Promise.all([
        supabase
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId),
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId),
        supabase
          .from("videos")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId),
      ]);

      return {
        users: users ?? 0,
        clients: clients ?? 0,
        videos: videos ?? 0,
      };
    },
  });
}

/* ── Tenant Users ───────────────────────────────────────────── */

export function useTenantUsers(tenantId: string | undefined) {
  return useQuery({
    queryKey: ["platform", "tenant-users", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at")
        .eq("tenant_id", tenantId);

      if (error) throw error;
      if (!data?.length) return [];

      // Get profiles for these users
      const userIds = data.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      return data.map((r) => ({
        ...r,
        profile: profileMap.get(r.user_id) ?? null,
      }));
    },
  });
}

/* ── Create Tenant ──────────────────────────────────────────── */

export function useCreateTenant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTenantPayload) => {
      // Insert the tenant — cast insert body to bypass strict generated types
      const insertBody = {
        name: payload.name,
        slug: payload.slug,
        domain: payload.domain ?? null,
        owner_email: payload.owner_email,
        plan: payload.plan,
        max_users: payload.max_users,
        max_clients: payload.max_clients,
        trial_ends_at: payload.trial_ends_at ?? null,
        logo_url: payload.logo_url ?? null,
        brand_colors: (payload.brand_colors ?? null) as unknown as Json,
        settings: (payload.settings ?? {
          theme_mode: "dark",
          app_name: payload.name,
        }) as unknown as Json,
        status: "trial",
      } as Record<string, unknown>;

      const { data: tenant, error: tErr } = await supabase
        .from("tenants")
        .insert(insertBody as any)
        .select("id")
        .single();

      if (tErr) throw tErr;

      // Seed default lookup data (statuses, video types, deal stages)
      const { error: seedErr } = await supabase.rpc("seed_tenant_defaults", {
        _tenant_id: tenant.id,
      });
      if (seedErr) {
        console.warn("[useCreateTenant] seed_tenant_defaults failed:", seedErr.message);
        // Non-blocking — tenant is created, defaults can be seeded manually
      }

      return tenant;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platform"] });
    },
  });
}

/* ── Update Tenant ──────────────────────────────────────────── */

export function useUpdateTenant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tenantId,
      updates,
    }: {
      tenantId: string;
      updates: Partial<
        Pick<
          TenantRow,
          | "name"
          | "slug"
          | "domain"
          | "plan"
          | "status"
          | "max_users"
          | "max_clients"
          | "trial_ends_at"
          | "owner_email"
          | "logo_url"
          | "brand_colors"
          | "settings"
        >
      >;
    }) => {
      // Cast to bypass strict generated types for new columns
      const { error } = await (supabase.from("tenants") as any).update(updates).eq("id", tenantId);

      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platform"] });
    },
  });
}

/* ── Platform Plans ────────────────────────────────────────── */

export interface PlatformPlan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  period: string;
  max_users: number;
  max_clients: number;
  features: string[];
  is_popular: boolean;
  sort_order: number;
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Fetch all platform plans sorted by sort_order. */
export function usePlatformPlans() {
  return useQuery({
    queryKey: ["platform", "plans"],
    queryFn: async (): Promise<PlatformPlan[]> => {
      const { data, error } = await (supabase.from("platform_plans") as any)
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data ?? []) as PlatformPlan[];
    },
  });
}

/** Update a single platform plan. */
export function useUpdatePlan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      updates,
    }: {
      planId: string;
      updates: Partial<Omit<PlatformPlan, "id" | "created_at" | "updated_at">>;
    }) => {
      const { error } = await (supabase.from("platform_plans") as any)
        .update(updates)
        .eq("id", planId);

      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platform", "plans"] });
    },
  });
}
