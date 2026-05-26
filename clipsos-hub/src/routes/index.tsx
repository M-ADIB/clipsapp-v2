/**
 * Index route — bounces the user based on auth + role state.
 *  - Not signed in → /login
 *  - Signed in with role → /{role-slug}
 *  - Signed in with no role yet → "Awaiting role assignment"
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { homeForRole } from "@/lib/role-routes";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      navigate({ to: "/login", replace: true });
      return;
    }
    // Force password change before proceeding to dashboard
    if (auth.profile && auth.profile.requires_password_change) {
      navigate({ to: "/change-password", replace: true });
      return;
    }
    if (auth.role) {
      navigate({ to: homeForRole(auth.role), replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.role, auth.profile, navigate]);

  if (auth.isAuthenticated && !auth.isLoading && !auth.role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center">
          <h1 className="font-display text-display-md text-foreground">Awaiting role assignment</h1>
          <p className="mt-3 text-sm text-foreground-muted">
            Your account is signed in but doesn't have a role yet. An owner or manager needs to
            grant you access. Please reach out to your workspace administrator.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => auth.signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
