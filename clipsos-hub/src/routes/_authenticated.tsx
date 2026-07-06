/**
 * Pathless layout route — every file under `src/routes/_authenticated/`
 * is automatically protected. We render a centered loader while auth
 * resolves, then redirect to /login if no session exists.
 */
import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app-shell/AppShell";
import { resolveRoleRedirect } from "@/lib/role-routes";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      if (location.pathname === "/login") return;
      let isExplicitSignOut = false;
      try {
        isExplicitSignOut = sessionStorage.getItem("explicit_sign_out") === "true";
        if (isExplicitSignOut) {
          sessionStorage.removeItem("explicit_sign_out");
        }
      } catch (e) {
        console.warn("sessionStorage read failed:", e);
      }

      if (isExplicitSignOut) {
        navigate({
          to: "/login",
          replace: true,
        });
      } else {
        navigate({
          to: "/login",
          search: { redirect: location.pathname + window.location.search },
          replace: true,
        });
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, location.pathname, navigate]);

  // Gate: enforce role-aware routing (prevent cross-role URL navigation).
  // Decision logic lives in the pure, unit-tested `resolveRoleRedirect`.
  // Computed during render so we can gate the <Outlet/> below on it — that
  // stops a cross-role child component from mounting for a frame before the
  // redirect fires (uses the same resolved auth data, so no lockout risk).
  const roleRedirect =
    !auth.isLoading && auth.isAuthenticated && auth.role
      ? resolveRoleRedirect({
          role: auth.role,
          isPlatformAdmin: auth.isPlatformAdmin,
          pathname: location.pathname,
        })
      : null;

  useEffect(() => {
    if (roleRedirect) {
      console.warn(`[AuthGuard] Access denied to ${location.pathname} for role ${auth.role}`);
      navigate({ to: roleRedirect, replace: true });
    }
  }, [roleRedirect, location.pathname, auth.role, navigate]);

  // Gate: force password change before accessing any protected route
  useEffect(() => {
    if (
      !auth.isLoading &&
      auth.isAuthenticated &&
      auth.profile &&
      auth.profile.requires_password_change
    ) {
      navigate({ to: "/change-password", replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.profile, navigate]);

  // Show the loader while auth resolves, and also when a role redirect is
  // pending — so the cross-role child route never mounts.
  if (auth.isLoading || !auth.isAuthenticated || roleRedirect) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
