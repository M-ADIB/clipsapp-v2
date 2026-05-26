/**
 * /change-password — Forced password-change gate for bulk-imported accounts.
 *
 * Shown when `profiles.requires_password_change === true`.
 * Users cannot navigate away until they set a new password.
 * After success, the flag is cleared and they're redirected to their dashboard.
 *
 * Design matches the login page aesthetic (split panel, premium feel).
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Lock, Eye, EyeOff, Shield, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { homeForRole } from "@/lib/role-routes";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/change-password")({
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If not authenticated, redirect to login
  if (!auth.isLoading && !auth.isAuthenticated) {
    navigate({ to: "/login", replace: true });
    return null;
  }

  // If user doesn't need password change, redirect to dashboard
  if (!auth.isLoading && auth.profile && !auth.profile.requires_password_change) {
    navigate({ to: auth.role ? homeForRole(auth.role) : "/", replace: true });
    return null;
  }

  // Loading state
  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const passwordsMatch = newPassword === confirmPassword;
  const isValid = newPassword.length >= 6 && passwordsMatch;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Update the auth password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message);
        setIsSubmitting(false);
        return;
      }

      // Clear the requires_password_change flag
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ requires_password_change: false })
        .eq("id", auth.user!.id);

      if (profileError) {
        toast.error("Password updated but failed to clear flag. Please try logging in again.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Password updated successfully!");

      // Refresh the auth context to pick up the new profile state
      await auth.refresh();

      // Redirect after a brief moment
      setTimeout(() => {
        navigate({ to: auth.role ? homeForRole(auth.role) : "/", replace: true });
      }, 1500);
    } catch {
      toast.error("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left hero panel (hidden on mobile) ─────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-primary/15 blur-3xl animate-pulse [animation-delay:2s]" />

        <div className="relative flex h-full flex-col items-center justify-center px-16">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Secure your account
          </h2>
          <p className="mt-4 max-w-sm text-center text-base text-muted-foreground">
            Your account was created with a temporary password. Set a new password to secure your
            workspace and get started.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "At least 6 characters",
              "Something you'll remember",
              "Don't reuse old passwords",
            ].map((tip, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-surface-card/50 px-4 py-3 backdrop-blur-sm"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground-muted">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────── */}
      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 flex justify-center lg:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">Set your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome,{" "}
            <span className="font-medium text-foreground">
              {auth.profile?.full_name || auth.user?.email}
            </span>
            ! Choose a new password to continue.
          </p>

          {isSuccess ? (
            <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-card p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Password updated!</p>
                <p className="mt-1 text-sm text-muted-foreground">Redirecting to your dashboard…</p>
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* New password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                  New password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    autoFocus
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                  Confirm password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-destructive">Passwords don't match</p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Set password & continue"
                )}
              </Button>

              {/* Sign out escape */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => auth.signOut()}
                  className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Sign out instead
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
