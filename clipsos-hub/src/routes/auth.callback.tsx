/**
 * /auth/callback — handles the PKCE code exchange after Supabase redirects
 * from magic link clicks or password reset emails.
 *
 * With PKCE flow enabled in client.ts, Supabase appends `?code=...` to
 * the redirect URL. The JS client's `detectSessionInUrl: true` handles
 * the exchange automatically, but we need a route to land on so the app
 * renders and the client can process it.
 *
 * Flow:
 *   User clicks magic link → Supabase redirects to /auth/callback?code=XYZ
 *   → This page loads → Supabase JS exchanges code for session
 *   → onAuthStateChange fires → we redirect to "/"
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Give Supabase client a moment to process the URL params
    const timeout = setTimeout(() => {
      if (auth.isAuthenticated) {
        setSuccess(true);
        setTimeout(() => {
          navigate({ to: "/", replace: true });
        }, 1200);
      } else if (!auth.isLoading) {
        setError("Could not verify your sign-in link. It may have expired or already been used.");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  // Also watch for auth changes after initial load
  useEffect(() => {
    if (auth.isAuthenticated && !error) {
      setSuccess(true);
      const t = setTimeout(() => navigate({ to: "/", replace: true }), 1200);
      return () => clearTimeout(t);
    }
  }, [auth.isAuthenticated, error, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-8 text-center shadow-2xl shadow-black/40">
        {error ? (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-status-danger" />
            <h1 className="font-display text-display-md text-foreground">Link expired</h1>
            <p className="mt-2 text-sm text-foreground-muted">{error}</p>
            <Button
              className="mt-6 w-full"
              onClick={() => navigate({ to: "/login", replace: true })}
            >
              Back to sign in
            </Button>
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-status-success" />
            <h1 className="font-display text-display-md text-foreground">You're in!</h1>
            <p className="mt-2 text-sm text-foreground-muted">Redirecting to your workspace…</p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <h1 className="font-display text-display-md text-foreground">Verifying…</h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Completing your sign-in. Just a moment.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
