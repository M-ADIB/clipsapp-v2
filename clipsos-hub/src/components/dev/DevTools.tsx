/**
 * DevTools — Floating role-switcher for development.
 *
 * Only renders when the tenant has `settings.dev_mode = true`.
 * Lets you preview any role's dashboard/navigation WITHOUT changing
 * the database — it overrides the role in AuthContext via localStorage.
 *
 * RLS still uses your REAL role (owner) so you'll see owner-level data
 * regardless of which dashboard skin you're previewing. This is purely
 * a frontend navigation/layout preview tool.
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bug,
  ChevronDown,
  ChevronUp,
  Crown,
  Shield,
  Scissors,
  Palette,
  Film,
  MessageSquare,
  Phone,
  User,
  X,
  Copy,
  Check,
  KeyRound,
} from "lucide-react";
import type { AppRole } from "@/integrations/supabase/db-types";

const DEV_ROLE_KEY = "clipsos-dev-role-override";

/** Dev login credentials — Owner account with DevTools role-switching access */
const DEV_CREDENTIALS = {
  email: "adib@theclips.agency",
  password: "ClipsOS2026!",
  note: "Owner account — use DevTools to switch to any role",
} as const;

const ROLES: { role: AppRole; label: string; icon: typeof Crown; color: string }[] = [
  { role: "owner", label: "Owner", icon: Crown, color: "#E91E63" },
  { role: "manager", label: "Manager", icon: Shield, color: "#9C27B0" },
  { role: "senior_editor", label: "Senior Editor", icon: Scissors, color: "#3F51B5" },
  { role: "content_creator", label: "Content Creator", icon: Palette, color: "#009688" },
  { role: "editor", label: "Editor", icon: Film, color: "#FF9800" },
  { role: "moderator", label: "Moderator", icon: MessageSquare, color: "#607D8B" },
  { role: "closer", label: "Closer", icon: Phone, color: "#F44336" },
  { role: "client", label: "Client", icon: User, color: "#4CAF50" },
];

export function getDevRoleOverride(): AppRole | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(DEV_ROLE_KEY);
  if (stored && ROLES.some((r) => r.role === stored)) return stored as AppRole;
  return null;
}

export function clearDevRoleOverride(): void {
  localStorage.removeItem(DEV_ROLE_KEY);
}

interface DevToolsProps {
  /** The user's actual DB role */
  realRole: AppRole | null;
  /** Currently active role (may be overridden) */
  activeRole: AppRole | null;
  /** Callback to change the active role in AuthContext */
  onRoleSwitch: (role: AppRole) => void;
  /** Whether dev mode is enabled (tenant settings) */
  enabled: boolean;
}

export function DevTools({ realRole, activeRole, onRoleSwitch, enabled }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showCreds, setShowCreds] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const navigate = useNavigate();

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  useEffect(() => {
    // Restore persisted override on mount
    const override = getDevRoleOverride();
    if (override && override !== activeRole) {
      onRoleSwitch(override);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  const handleSwitch = (role: AppRole) => {
    localStorage.setItem(DEV_ROLE_KEY, role);
    onRoleSwitch(role);
    // Navigate to the role's dashboard
    const prefix = role.replace("_", "-");
    navigate({ to: `/${prefix}` });
    setIsOpen(false);
  };

  const handleReset = () => {
    clearDevRoleOverride();
    if (realRole) {
      onRoleSwitch(realRole);
      const prefix = realRole.replace("_", "-");
      navigate({ to: `/${prefix}` });
    }
    setIsOpen(false);
  };

  const isOverridden = activeRole !== realRole;
  const activeConfig = ROLES.find((r) => r.role === activeRole);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 md:bottom-4 right-4 z-[9999] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/80 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-[#E91E63]/50"
        title="DevTools"
        style={
          isOverridden
            ? { borderColor: activeConfig?.color, boxShadow: `0 0 12px ${activeConfig?.color}44` }
            : {}
        }
      >
        <Bug className="h-4 w-4 text-white/70" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-[9999] w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0F]/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
        <div className="flex items-center gap-2">
          <Bug className="h-3.5 w-3.5 text-[#E91E63]" />
          <span className="text-xs font-semibold text-white/80">DevTools</span>
          {isOverridden && (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              OVERRIDE
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="rounded p-0.5 text-white/40 transition-colors hover:text-white/70"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="rounded p-0.5 text-white/40 transition-colors hover:text-white/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Current state */}
      <div className="border-b border-white/5 px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-white/30">Viewing as</div>
        <div className="mt-1 flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: activeConfig?.color ?? "#666" }}
          />
          <span className="text-sm font-medium text-white">{activeConfig?.label ?? "Unknown"}</span>
        </div>
        {isOverridden && (
          <div className="mt-1 text-[10px] text-white/30">
            Real role: <span className="text-white/50">{realRole}</span>
          </div>
        )}
      </div>

      {/* Dev Credentials */}
      <button
        onClick={() => setShowCreds(!showCreds)}
        className="flex w-full items-center justify-between border-b border-white/5 px-3 py-2 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white/70"
      >
        <span className="flex items-center gap-1.5">
          <KeyRound className="h-3 w-3" />
          Dev Credentials
        </span>
        {showCreds ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {showCreds && (
        <div className="space-y-1.5 border-b border-white/5 px-3 py-2">
          <div className="text-[10px] text-white/30">{DEV_CREDENTIALS.note}</div>
          {/* Email */}
          <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30">Email</div>
              <div className="font-mono text-[11px] text-white/80">{DEV_CREDENTIALS.email}</div>
            </div>
            <button
              onClick={() => copyToClipboard(DEV_CREDENTIALS.email, "email")}
              className="rounded p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
              title="Copy email"
            >
              {copied === "email" ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
          {/* Password */}
          <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30">Password</div>
              <div className="font-mono text-[11px] text-white/80">{DEV_CREDENTIALS.password}</div>
            </div>
            <button
              onClick={() => copyToClipboard(DEV_CREDENTIALS.password, "password")}
              className="rounded p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
              title="Copy password"
            >
              {copied === "password" ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toggle role list */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white/70"
      >
        <span>Switch role</span>
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {/* Role list */}
      {isOpen && (
        <div className="max-h-[280px] overflow-y-auto border-t border-white/5">
          {ROLES.map(({ role, label, icon: Icon, color }) => {
            const isActive = role === activeRole;
            return (
              <button
                key={role}
                onClick={() => handleSwitch(role)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-xs transition-colors ${
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/70"
                }`}
              >
                <Icon className="h-3.5 w-3.5" style={{ color }} />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                )}
              </button>
            );
          })}

          {/* Reset button */}
          {isOverridden && (
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-1.5 border-t border-white/5 px-3 py-2 text-[10px] text-amber-400 transition-colors hover:bg-amber-500/10"
            >
              Reset to real role ({realRole})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
