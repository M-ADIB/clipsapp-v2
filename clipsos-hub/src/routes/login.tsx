/**
 * /login — Premium, industry-standard login page.
 *
 * Inspired by Linear, Vercel, and Supabase login screens.
 * Features:
 *  - Split-panel layout: left = branded hero, right = auth form
 *  - Password visibility toggle (eye icon)
 *  - "Forgot password?" inline link with toast feedback
 *  - Magic link with sent-state confirmation + 60s resend timer
 *  - Redirect preservation (?redirect= param)
 *  - Auto-redirect if already authenticated
 *  - Branded logo from BrandingContext (falls back to Sparkles icon)
 *  - Animated gradient mesh background
 *  - Smooth transitions between tabs
 *  - Loading spinner on submit buttons
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import tcaLogo from "@/assets/tca-logo.png";
import { homeForRole } from "@/lib/role-routes";
import {
  magicLinkSchema,
  passwordLoginSchema,
  type MagicLinkValues,
  type PasswordLoginValues,
} from "@/lib/forms/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ------------------------------------------------------------------ */
/*  Route definition                                                   */
/* ------------------------------------------------------------------ */

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  // Auto-redirect if already signed in
  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && auth.role) {
      navigate({
        to: homeForRole(auth.role),
        replace: true,
      });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.role, navigate]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left Panel: Branded Hero ── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Animated gradient mesh background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.16 0.002 286) 0%, oklch(0.22 0.030 300) 30%, oklch(0.18 0.040 310) 60%, oklch(0.14 0.010 286) 100%)",
          }}
        />

        {/* Floating orbs */}
        <div
          aria-hidden
          className="animate-pulse-slow absolute left-[20%] top-[20%] h-[400px] w-[400px] rounded-full opacity-25"
          style={{
            background: "radial-gradient(closest-side, oklch(0.65 0.15 300 / 0.4), transparent)",
            animation: "float-1 8s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-[15%] right-[15%] h-[300px] w-[300px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(closest-side, oklch(0.80 0.10 310 / 0.3), transparent)",
            animation: "float-2 10s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="absolute left-[50%] top-[60%] h-[200px] w-[200px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(closest-side, oklch(0.70 0.12 280 / 0.3), transparent)",
            animation: "float-3 12s ease-in-out infinite",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-md px-12 text-center">
          {/* Logo */}
          <img
            src={tcaLogo}
            alt="TheClipsAgency"
            className="mx-auto mb-10 h-10 w-auto object-contain"
          />
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Subtle ambient glow on mobile */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/4 -translate-y-1/4 rounded-full opacity-20 lg:opacity-10"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 30%, transparent), transparent)",
          }}
        />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile logo (hidden on desktop since left panel shows it) */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-card shadow-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-display-lg text-foreground-strong">Welcome back</h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Auth card */}
          <AuthCard />

          {/* Footer */}
          <div className="mt-8 space-y-3 text-center">
            <div className="flex items-center justify-center gap-4 text-[11px] text-foreground-disabled">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Row-level security
              </span>
              <span className="h-3 w-px bg-border" />
              <span>Encrypted at rest</span>
              <span className="h-3 w-px bg-border" />
              <span>SOC 2 ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating orb animations ── */}
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 15px) scale(1.03); }
          66% { transform: translate(20px, -25px) scale(0.97); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -10px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Auth Card — toggles between password and magic link                */
/* ------------------------------------------------------------------ */

function AuthCard() {
  const [view, setView] = useState<"password" | "magic">("password");

  return (
    <div className="rounded-xl border border-border bg-surface-card p-6 shadow-xl shadow-black/10 dark:shadow-black/40">
      {view === "password" ? (
        <>
          <PasswordForm />

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-foreground-disabled">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Magic link toggle */}
          <button
            type="button"
            onClick={() => setView("magic")}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sign in with Magic Link
          </button>
        </>
      ) : (
        <>
          <MagicLinkForm />

          {/* Back to password */}
          <button
            type="button"
            onClick={() => setView("password")}
            className="mt-4 flex w-full items-center justify-center gap-2 text-xs text-foreground-muted transition-colors hover:text-foreground"
          >
            <Lock className="h-3 w-3" />
            Use password instead
          </button>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Password Form                                                      */
/* ------------------------------------------------------------------ */

function PasswordForm() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const form = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });
  const {
    register,
    handleSubmit,
    getValues,
    setFocus,
    formState: { errors, isSubmitting },
  } = form;

  // Auto-focus email on mount
  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const onSubmit = async ({ email, password }: PasswordLoginValues) => {
    const { error } = await auth.signIn(email.trim(), password);

    if (error) {
      toast.error("Sign-in failed", {
        description:
          error === "Invalid login credentials"
            ? "Wrong email or password. Try again or use a magic link."
            : error,
      });
      return;
    }

    toast.success("Welcome back!");
    navigate({ to: "/", replace: true });
  };

  const handleReset = async () => {
    const email = getValues("email");
    if (!email.trim()) {
      toast.error("Enter your email first", {
        description: "Type your email address above, then click 'Forgot?'",
      });
      setFocus("email");
      return;
    }
    setResetting(true);
    const { error } = await auth.resetPassword(email.trim());
    setResetting(false);

    if (error) {
      toast.error("Could not send reset email", { description: error });
    } else {
      toast.success("Reset link sent!", {
        description: `Check ${email} for a password reset link.`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-xs text-foreground-muted">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-disabled" />
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@agency.com"
            className="h-11 bg-surface-input pl-10 text-sm"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-status-danger" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-xs text-foreground-muted">
            Password
          </Label>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
          >
            {resetting ? "Sending…" : "Forgot password?"}
          </button>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-disabled" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 bg-surface-input pl-10 pr-10 text-sm"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-disabled transition-colors hover:text-foreground-muted"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-status-danger" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="h-11 w-full text-sm font-medium" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="mr-2 h-4 w-4" />
        )}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Magic Link Form                                                    */
/* ------------------------------------------------------------------ */

const RESEND_COOLDOWN = 60; // seconds

function MagicLinkForm() {
  const auth = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const onSubmit = async ({ email }: MagicLinkValues) => {
    const { error } = await auth.signInWithMagicLink(email.trim());

    if (error) {
      toast.error("Could not send magic link", { description: error });
    } else {
      setSentEmail(email.trim());
      setSent(true);
      setCooldown(RESEND_COOLDOWN);
      toast.success("Magic link sent!");
    }
  };

  const handleResend = async () => {
    const email = getValues("email");
    if (cooldown > 0 || !email.trim()) return;
    setSubmitting(true);
    const { error } = await auth.signInWithMagicLink(email.trim());
    setSubmitting(false);

    if (error) {
      toast.error("Could not resend", { description: error });
    } else {
      setCooldown(RESEND_COOLDOWN);
      toast.success("New magic link sent!");
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface-raised/50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-success/10">
            <CheckCircle2 className="h-6 w-6 text-status-success" />
          </div>
          <p className="text-sm font-medium text-foreground-strong">Check your inbox</p>
          <p className="mt-1 text-xs text-foreground-muted">
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{sentEmail}</span>
          </p>
          <p className="mt-3 text-xs text-foreground-disabled">
            Can't find it? Check your spam folder.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || submitting}
          className="w-full text-center text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:text-foreground-disabled"
        >
          {submitting ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend magic link"}
        </button>

        <button
          type="button"
          onClick={() => {
            setSent(false);
            setSentEmail("");
            reset({ email: "" });
            setCooldown(0);
          }}
          className="w-full text-center text-xs text-foreground-muted transition-colors hover:text-foreground"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="magic-email" className="text-xs text-foreground-muted">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-disabled" />
          <Input
            id="magic-email"
            type="email"
            autoComplete="email"
            placeholder="you@agency.com"
            className="h-11 bg-surface-input pl-10 text-sm"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-status-danger" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <p className="text-xs text-foreground-disabled">
        We'll send a one-time sign-in link to your email. No password needed.
      </p>

      <Button type="submit" className="h-11 w-full text-sm font-medium" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        {isSubmitting ? "Sending…" : "Send magic link"}
      </Button>
    </form>
  );
}
