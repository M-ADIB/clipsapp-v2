/**
 * TeamSettingsPanel — Tab content for Settings > Team
 *
 * Embedded version of team management. Does NOT set its own header
 * (the parent OwnerSettingsPage handles that).
 *
 * Uses V2 design tokens only — no legacy surface or brand classes.
 */
import React, { useMemo } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useTeam, useInviteMember, useTenantPlanLimits } from "@/hooks/data";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, AlertTriangle } from "lucide-react";
import { format, isToday } from "date-fns";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TeamSettingsPanel() {
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("manager");

  const inviteMember = useInviteMember();
  const { data: planLimits } = useTenantPlanLimits();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    inviteMember.mutate(
      { email: email.trim(), role },
      {
        onSuccess: () => {
          setIsInviteOpen(false);
          setEmail("");
          setRole("manager");
          toast.success("Invitation sent successfully!");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to send invitation.");
        },
      },
    );
  };

  const { data: teamMembers = [], isLoading } = useTeam();

  // Plan limit enforcement — platform tenant has no limits
  const maxUsers = planLimits?.maxUsers ?? 999;
  const isPlatformTenant = planLimits?.isPlatformTenant ?? false;
  const isAtLimit = !isPlatformTenant && isFinite(maxUsers) && teamMembers.length >= maxUsers;

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "full_name",
        header: "Name",
        render: (item: any) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground-strong">
              {item.full_name || "Unknown"}
            </span>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (item: any) => (
          <span className="text-sm text-foreground-muted capitalize">
            {(item as any).role?.replace(/_/g, " ")}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (item: any) => (
          <StatusBadge
            variant={item.account_status === "active" ? "approved" : "draft"}
            label={item.account_status === "active" ? "Active" : "Inactive"}
          />
        ),
      },
      {
        key: "updated_at",
        header: "Last Active",
        render: (item: any) => (
          <span className="text-sm text-foreground-muted">
            {item.updated_at ? format(new Date(item.updated_at), "MMM d, yyyy") : "-"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* Action bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-foreground-muted md:text-sm">
            Manage roles, permissions, and team access.
          </p>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={isAtLimit ? 0 : undefined}>
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={isAtLimit}
                      onClick={() => setIsInviteOpen(true)}
                    >
                      {isAtLimit ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      Invite Member
                    </Button>
                  </span>
                </TooltipTrigger>
                {isAtLimit && (
                  <TooltipContent side="bottom">
                    <p className="text-xs">
                      You've reached the {maxUsers}-member limit on your{" "}
                      <strong>{planLimits?.planSlug}</strong> plan. Upgrade to add more.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleInvite} noValidate>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your internal team. They will receive an email to set
                    up their account.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="team-email">Email address</Label>
                    <Input
                      id="team-email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="team-role">Role</Label>
                    <select
                      id="team-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-surface-input px-3 py-2 text-sm text-foreground-strong ring-offset-background placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="manager">Manager</option>
                      <option value="senior_editor">Senior Editor</option>
                      <option value="content_creator">Content Creator</option>
                      <option value="editor">Editor</option>
                      <option value="closer">Closer</option>
                    </select>
                  </div>
                  {inviteMember.isError && (
                    <div className="text-sm text-status-danger">{inviteMember.error.message}</div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteOpen(false)}
                    disabled={inviteMember.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteMember.isPending}>
                    {inviteMember.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Members" value={String(teamMembers.length)} percent={100} />
          <StatCard
            title="Plan Limit"
            value={
              isPlatformTenant || !isFinite(maxUsers)
                ? "Unlimited"
                : `${teamMembers.length}/${maxUsers}`
            }
            percent={
              isPlatformTenant || !isFinite(maxUsers)
                ? 100
                : Math.round((teamMembers.length / maxUsers) * 100)
            }
          />
          <StatCard
            title="Active Today"
            value={String(
              teamMembers.filter((m) => m.updated_at && isToday(new Date(m.updated_at))).length,
            )}
            percent={100}
          />
          <StatCard
            title="Managers"
            value={String(teamMembers.filter((m) => (m as any).role === "manager").length)}
            percent={100}
          />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
            <DataTable columns={columns} data={teamMembers} rowKey={(row: any) => row.id} />
          </div>
        </div>
      </div>
    </FullBleed>
  );
}
