/**
 * /reset-password — public route Supabase redirects users to from the
 * password-reset email. The browser client picks up the recovery token
 * automatically, giving us a brief authenticated session in which
 * `updateUser({ password })` is allowed.
 *
 * Features:
 *  - Real-time password strength indicator (4 levels)
 *  - Password match checker
 *  - Show/hide password toggle
 *  - Minimum 8 characters enforced
 *  - Success feedback with auto-redirect
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

/* ------------------------------------------------------------------ */
/*  Strength calculator                                                */
/* ------------------------------------------------------------------ */

interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

function getPasswordStrength(pw: string): StrengthResult {
  if (!pw) return { score: 0, label: "", color: "" };

  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "var(--status-danger)" };
  if (score === 2) return { score: 2, label: "Fair", color: "var(--status-warning)" };
  if (score === 3) return { score: 3, label: "Good", color: "var(--status-info)" };
  return { score: 4, label: "Strong", color: "var(--status-success)" };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password && confirm && password === confirm;
  const canSubmit = password.length >= 8 && passwordsMatch && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast.error("Could not update password", { description: error.message });
      return;
    }

    setSuccess(true);
    toast.success("Password updated!");
    setTimeout(() => navigate({ to: "/", replace: true }), 2000);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-8 text-center shadow-2xl shadow-black/40">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-status-success/10">
            <CheckCircle2 className="h-8 w-8 text-status-success" />
          </div>
          <h1 className="font-display text-display-md text-foreground">Password updated</h1>
          <p className="mt-2 text-sm text-foreground-muted">Redirecting to your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 35%, transparent), transparent)",
        }}
      />

      <div className="relative w-full max-w-[420px]">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-card shadow-lg shadow-black/30">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-display-lg text-foreground">Set a new password</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Choose something strong — at least 8 characters.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface-card p-6 shadow-2xl shadow-black/40"
        >
          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-foreground-muted">
              New password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-overlay" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="h-11 pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-overlay transition-colors hover:text-foreground-muted"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {password && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          strength.score >= level ? strength.color : "var(--surface-input)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-foreground-muted">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-overlay" />
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-type your password"
                className="h-11 pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-overlay transition-colors hover:text-foreground-muted"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Match indicator */}
            {confirm && (
              <p
                className="text-xs"
                style={{
                  color: passwordsMatch ? "var(--status-success)" : "var(--status-danger)",
                }}
              >
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="h-11 w-full text-sm font-medium" disabled={!canSubmit}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            {submitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
