/**
 * AuthContext — single source of truth for the signed-in user + their role.
 *
 * - Subscribes to Supabase auth events (login, logout, token refresh).
 * - On session change, loads the user's profile + role from `profiles`
 *   and `user_roles` so every page can ask "who is this and what role?".
 * - Exposes signIn / signInWithMagicLink / signOut / resetPassword helpers.
 *
 * Rules:
 *  - `onAuthStateChange` is set up BEFORE `getSession` (Supabase best practice).
 *  - DB fetches are deferred via setTimeout(0) inside the auth callback to
 *    avoid the deadlocks documented in the Supabase JS client.
 *  - Cached role is for UX only — RLS in the database is the real gate.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile } from "@/integrations/supabase/db-types";
import { getDevRoleOverride } from "@/components/dev/DevTools";

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  /** The actual DB role (ignoring any dev override) */
  realRole: AppRole | null;
  /** Whether the tenant has dev_mode enabled */
  isDevMode: boolean;
  /** Whether this user is a platform-level super admin (cross-tenant) */
  isPlatformAdmin: boolean;
  tenantId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
  /** Override the active role (DevTools only) */
  setRoleOverride: (role: AppRole) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const ROLE_PRIORITY: AppRole[] = [
  "owner",
  "manager",
  "senior_editor",
  "content_creator",
  "editor",
  "moderator",
  "closer",
  "client",
];

function pickPrimaryRole(roles: AppRole[]): AppRole | null {
  for (const r of ROLE_PRIORITY) if (roles.includes(r)) return r;
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [realRole, setRealRole] = useState<AppRole | null>(null);
  const [roleOverride, setRoleOverride] = useState<AppRole | null>(getDevRoleOverride);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Active role = override ?? real
  const role = roleOverride ?? realRole;

  const initialResolvedRef = useRef(false);

  const loadProfileAndRole = useCallback(async (userId: string) => {
    try {
      // Core auth queries — must succeed
      const [{ data: profileRow }, { data: roleRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role, tenant_id").eq("user_id", userId),
      ]);

      setProfile(profileRow ?? null);
      const roles = (roleRows ?? []).map((r) => r.role as AppRole);
      setRealRole(pickPrimaryRole(roles));
      const tid = profileRow?.tenant_id ?? roleRows?.find((r) => r.tenant_id)?.tenant_id ?? null;
      setTenantId(tid);

      // Platform admin check — use RPC function (SECURITY DEFINER, bypasses RLS)
      try {
        const { data: isAdmin, error: platformErr } = await supabase.rpc("is_platform_admin", {
          uid: userId,
        });
        if (platformErr) {
          console.warn("[AuthContext] is_platform_admin RPC error:", platformErr.message);
          setIsPlatformAdmin(false);
        } else {
          setIsPlatformAdmin(!!isAdmin);
        }
      } catch {
        console.warn("[AuthContext] platform admin check failed, defaulting to false");
        setIsPlatformAdmin(false);
      }

      // Check if tenant has dev_mode
      if (tid) {
        const { data: tenant } = await supabase
          .from("tenants")
          .select("settings")
          .eq("id", tid)
          .maybeSingle();
        setIsDevMode(!!(tenant?.settings as Record<string, unknown>)?.dev_mode);
      }
    } catch (err) {
      console.error("[AuthContext] Failed to load profile/role", err);
      setProfile(null);
      setRealRole(null);
      setTenantId(null);
      setIsPlatformAdmin(false);
    }
  }, []);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const userId = nextSession.user.id;
        setTimeout(() => {
          void loadProfileAndRole(userId).finally(() => {
            if (!initialResolvedRef.current) {
              initialResolvedRef.current = true;
              setIsLoading(false);
            }
          });
        }, 0);
      } else {
        setProfile(null);
        setRealRole(null);
        setRoleOverride(null);
        setTenantId(null);
        setIsDevMode(false);
        setIsPlatformAdmin(false);
        if (!initialResolvedRef.current) {
          initialResolvedRef.current = true;
          setIsLoading(false);
        }
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session && !initialResolvedRef.current) {
        initialResolvedRef.current = true;
        setIsLoading(false);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [loadProfileAndRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    try {
      sessionStorage.setItem("explicit_sign_out", "true");
    } catch (e) {
      console.warn("sessionStorage not available:", e);
    }
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    return { error: error?.message ?? null };
  }, []);

  const refresh = useCallback(async () => {
    if (user?.id) await loadProfileAndRole(user.id);
  }, [user?.id, loadProfileAndRole]);

  const value = useMemo<AuthState>(
    () => ({
      isLoading,
      isAuthenticated: !!session,
      session,
      user,
      profile,
      role,
      realRole,
      isDevMode,
      isPlatformAdmin,
      tenantId,
      signIn,
      signInWithMagicLink,
      signOut,
      resetPassword,
      refresh,
      setRoleOverride,
    }),
    [
      isLoading,
      session,
      user,
      profile,
      role,
      realRole,
      isDevMode,
      isPlatformAdmin,
      tenantId,
      signIn,
      signInWithMagicLink,
      signOut,
      resetPassword,
      refresh,
      setRoleOverride,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be called inside <AuthProvider>");
  return ctx;
}
