/**
 * PersonalSettingsPage — Shared settings page for roles that only need
 * personal profile + password management (no app-wide settings).
 *
 * Used by: Editor, Closer, Moderator (and any future lightweight roles).
 * Owner/Manager/SE/CC have their own settings pages with additional tabs.
 */
import { useEffect, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Lock, Mail, Shield, LogOut } from "lucide-react";
import { ROLE_LABEL } from "@/integrations/supabase/db-types";

interface PersonalSettingsPageProps {
  /** Skip setHeaderConfig when rendered inside a parent hub */
  embedded?: boolean;
}

export function PersonalSettingsPage({ embedded }: PersonalSettingsPageProps) {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const { user, profile, role, signOut } = useAuth();

  useEffect(() => {
    if (embedded) return;
    setHeaderConfig({ title: "Settings" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, embedded]);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const handlePasswordChange = async () => {
    if (newPw !== confirmPw) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setChangingPw(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }
  };

  const displayName = profile?.full_name ?? user?.email ?? "—";
  const displayEmail = user?.email ?? "—";
  const roleLabel = role ? ROLE_LABEL[role] : "—";

  return (
    <FullBleed>
      <div className="flex flex-1 flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* ── Profile Info Card ── */}
        <div className="rounded-xl border border-border bg-surface-card p-4 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground-strong">
            <User className="h-4 w-4 text-primary" />
            Profile
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {displayName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground-strong">{displayName}</p>
                <p className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <Mail className="h-3 w-3" />
                  {displayEmail}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-raised px-3 py-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground-muted">Role: {roleLabel}</span>
            </div>
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div className="rounded-xl border border-border bg-surface-card p-4 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground-strong">
            <Lock className="h-4 w-4 text-primary" />
            Change Password
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-foreground-muted">Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-foreground-muted">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-foreground-muted">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none"
                placeholder="Confirm new password"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={changingPw || !newPw || !confirmPw}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPw ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>

        {/* ── Sign Out Section ── */}
        <div className="rounded-xl border border-border bg-surface-card p-4 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground-strong">
            <LogOut className="h-4 w-4 text-red-500" />
            Session
          </h2>
          <p className="mb-4 text-xs text-foreground-muted">
            Log out of your current session on this device.
          </p>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </FullBleed>
  );
}
