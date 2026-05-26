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
import { homeForRole } from "@/lib/role-routes";

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

  // Gate: enforce role-aware routing (prevent cross-role URL navigation)
  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && auth.role) {
      const path = location.pathname;
      
      // Determine what role the route is for based on the URL path prefix
      let routeRole: string | null = null;
      if (path.startsWith("/owner")) routeRole = "owner";
      else if (path.startsWith("/manager")) routeRole = "manager";
      else if (path.startsWith("/senior-editor")) routeRole = "senior_editor";
      else if (path.startsWith("/content-creator")) routeRole = "content_creator";
      else if (path.startsWith("/editor")) routeRole = "editor";
      else if (path.startsWith("/moderator")) routeRole = "moderator";
      else if (path.startsWith("/closer")) routeRole = "closer";
      else if (path.startsWith("/client")) routeRole = "client";
      else if (path.startsWith("/platform")) routeRole = "platform";

      if (routeRole) {
        if (routeRole === "platform") {
          if (!auth.isPlatformAdmin) {
            console.warn(`[AuthGuard] Access denied to /platform for non-admin user`);
            navigate({ to: homeForRole(auth.role), replace: true });
          }
        } else if (routeRole !== auth.role) {
          console.warn(`[AuthGuard] Access denied to /${routeRole} for user with role ${auth.role}`);
          navigate({ to: homeForRole(auth.role), replace: true });
        }
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.role, auth.isPlatformAdmin, location.pathname, navigate]);

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

  if (auth.isLoading || !auth.isAuthenticated) {
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
