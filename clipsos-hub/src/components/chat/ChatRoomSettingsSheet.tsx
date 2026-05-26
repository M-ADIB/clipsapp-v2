/**
 * ChatRoomSettingsSheet — slide-out panel for room info, members, and management.
 *
 * Features:
 *  - Room info (name, type, created date)
 *  - Members list with role badges and Remove button
 *  - Add member dialog with client-to-team-chat confirmation
 *  - Leave room (self-removal)
 *  - Delete room (Owner/Manager only)
 */
import { useState, useCallback, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Megaphone,
  Users,
  UserPlus,
  UserMinus,
  LogOut,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  Crown,
  AlertTriangle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  useRoomMembers,
  useKickMember,
  useAddMember,
  useLeaveRoom,
  useDeleteRoom,
} from "@/hooks/use-chat";
import type { RoomMember, ChatRoomWithPreview } from "@/hooks/use-chat";
import type { ChatMode } from "./ChatLayout";

// ── Constants ────────────────────────────────────────────────────────────────
const CLIENT_ROLES = ["client"];

interface ChatRoomSettingsSheetProps {
  room: ChatRoomWithPreview;
  chatMode?: ChatMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomLeft?: () => void;
}

/** Map role slug to display data */
function getRoleMeta(role: string): { label: string; icon: typeof Crown; color: string } {
  switch (role) {
    case "owner":
      return { label: "Owner", icon: Crown, color: "text-amber-500" };
    case "manager":
      return { label: "Manager", icon: ShieldCheck, color: "text-blue-500" };
    case "senior_editor":
      return { label: "Senior Editor", icon: Shield, color: "text-violet-500" };
    case "content_creator":
      return { label: "Content Creator", icon: Shield, color: "text-emerald-500" };
    case "closer":
      return { label: "Closer", icon: Shield, color: "text-orange-500" };
    case "editor":
      return { label: "Editor", icon: Shield, color: "text-cyan-500" };
    case "moderator":
      return { label: "Moderator", icon: Shield, color: "text-pink-500" };
    case "client":
      return { label: "Client", icon: Shield, color: "text-rose-500" };
    default:
      return { label: role, icon: Shield, color: "text-foreground-subtle" };
  }
}

function getInitials(name: string | null): string {
  return (
    name
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "?"
  );
}

// ── MemberRow ────────────────────────────────────────────────────────────────

function MemberRow({
  member,
  isCurrentUser,
  canManage,
  roomId,
  kickMember,
  addMember,
}: {
  member: RoomMember;
  isCurrentUser: boolean;
  canManage: boolean;
  roomId: string;
  kickMember: ReturnType<typeof useKickMember>;
  addMember: ReturnType<typeof useAddMember>;
}) {
  const roleMeta = getRoleMeta(member.role);
  const RoleIcon = roleMeta.icon;

  const handleKick = useCallback(() => {
    kickMember.mutate(
      { roomId, userId: member.id },
      {
        onSuccess: () => toast.success(`${member.full_name ?? "User"} removed from room`),
        onError: () => toast.error("Failed to remove member"),
      },
    );
  }, [kickMember, roomId, member.id, member.full_name]);

  const handleRestore = useCallback(() => {
    addMember.mutate(
      { roomId, userId: member.id },
      {
        onSuccess: () => toast.success(`${member.full_name ?? "User"} added back to room`),
        onError: () => toast.error("Failed to restore member"),
      },
    );
  }, [addMember, roomId, member.id, member.full_name]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        member.is_revoked ? "opacity-50" : "hover:bg-surface-card/50",
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={member.avatar_url ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
          {getInitials(member.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground-strong truncate">
            {member.full_name ?? "Unknown"}
          </span>
          {isCurrentUser && <span className="text-[10px] text-foreground-subtle">(you)</span>}
        </div>
        <div className="flex items-center gap-1">
          <RoleIcon className={cn("h-3 w-3", roleMeta.color)} />
          <span className="text-[11px] text-foreground-subtle">{roleMeta.label}</span>
        </div>
      </div>

      {member.is_revoked && (
        <Badge
          variant="outline"
          className="text-[10px] shrink-0 border-destructive/30 text-destructive"
        >
          Removed
        </Badge>
      )}

      {/* Action button — only visible for managers */}
      {canManage && !isCurrentUser && (
        <>
          {member.is_revoked ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
              onClick={handleRestore}
              title="Add back"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleKick}
              title="Remove from room"
            >
              <UserMinus className="h-3.5 w-3.5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ── AddMemberDialog ──────────────────────────────────────────────────────────

function AddMemberDialog({
  open,
  onOpenChange,
  roomId,
  roomType,
  activeMembers,
  allMembers,
  addMember,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomType: string;
  activeMembers: RoomMember[];
  allMembers: RoomMember[];
  addMember: ReturnType<typeof useAddMember>;
}) {
  const [search, setSearch] = useState("");
  const [confirmUser, setConfirmUser] = useState<RoomMember | null>(null);

  const isTeamRoom = roomType === "team";

  // Users that are NOT active in this room (either revoked or never added)
  const addableUsers = useMemo(() => {
    const activeMemberIds = new Set(activeMembers.map((m) => m.id));
    return allMembers.filter((m) => !activeMemberIds.has(m.id));
  }, [activeMembers, allMembers]);

  const filteredAddable = useMemo(() => {
    if (!search.trim()) return addableUsers;
    const q = search.toLowerCase();
    return addableUsers.filter(
      (m) => m.full_name?.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [addableUsers, search]);

  const handleAddClick = useCallback(
    (member: RoomMember) => {
      // Check if adding a client to a team chat — needs confirmation
      if (isTeamRoom && CLIENT_ROLES.includes(member.role)) {
        setConfirmUser(member);
        return;
      }
      // Otherwise add directly
      addMember.mutate(
        { roomId, userId: member.id },
        {
          onSuccess: () => {
            toast.success(`${member.full_name ?? "User"} added to room`);
          },
          onError: () => toast.error("Failed to add member"),
        },
      );
    },
    [isTeamRoom, addMember, roomId],
  );

  const handleConfirmAdd = useCallback(() => {
    if (!confirmUser) return;
    addMember.mutate(
      { roomId, userId: confirmUser.id },
      {
        onSuccess: () => {
          toast.success(`${confirmUser.full_name ?? "User"} added to team chat`);
          setConfirmUser(null);
        },
        onError: () => {
          toast.error("Failed to add member");
          setConfirmUser(null);
        },
      },
    );
  }, [confirmUser, addMember, roomId]);

  // Reset search when dialog closes
  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) {
        setSearch("");
        setConfirmUser(null);
      }
      onOpenChange(v);
    },
    [onOpenChange],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Members
            </DialogTitle>
            <DialogDescription>
              Search and add users to this {isTeamRoom ? "team channel" : "client chat"}.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-subtle" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or role…"
              className="h-9 pl-8 text-sm bg-surface-input border-border-subtle"
              autoFocus
            />
          </div>

          {/* List */}
          <ScrollArea className="max-h-[320px] -mx-1 pr-1">
            {filteredAddable.length === 0 ? (
              <p className="text-sm text-foreground-subtle text-center py-8">
                {search
                  ? `No users matching "${search}"`
                  : "All users are already members of this room."}
              </p>
            ) : (
              <div className="space-y-0.5">
                {filteredAddable.map((member) => {
                  const roleMeta = getRoleMeta(member.role);
                  const RoleIcon = roleMeta.icon;
                  const isClient = CLIENT_ROLES.includes(member.role);

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-card/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={member.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground-strong truncate">
                            {member.full_name ?? "Unknown"}
                          </span>
                          {isClient && isTeamRoom && (
                            <Badge
                              variant="outline"
                              className="text-[9px] border-rose-300 text-rose-500"
                            >
                              Client
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <RoleIcon className={cn("h-3 w-3", roleMeta.color)} />
                          <span className="text-[11px] text-foreground-subtle">
                            {roleMeta.label}
                          </span>
                        </div>
                      </div>

                      {member.is_revoked && (
                        <Badge
                          variant="outline"
                          className="text-[9px] shrink-0 border-amber-300 text-amber-600"
                        >
                          Previously removed
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                        onClick={() => handleAddClick(member)}
                        disabled={addMember.isPending}
                        title={`Add ${member.full_name ?? "user"}`}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Client-to-team-chat confirmation AlertDialog */}
      <AlertDialog open={!!confirmUser} onOpenChange={(v) => !v && setConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Add client to team chat?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                You are about to add <strong>{confirmUser?.full_name ?? "a client"}</strong> (Client
                role) to a <strong>team channel</strong>.
              </span>
              <span className="block text-amber-600 dark:text-amber-400">
                Clients will be able to see all messages in this channel, including internal team
                discussions.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAdd}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Yes, add to team chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ChatRoomSettingsSheet({
  room,
  chatMode = "client",
  open,
  onOpenChange,
  onRoomLeft,
}: ChatRoomSettingsSheetProps) {
  const { user, role } = useAuth();
  const [memberSearch, setMemberSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: members, isLoading: membersLoading } = useRoomMembers(open ? room.id : null);
  const kickMember = useKickMember();
  const addMemberMutation = useAddMember();
  const leaveRoom = useLeaveRoom();
  const deleteRoom = useDeleteRoom();

  const isTeam = chatMode === "team";
  const isAnnouncement = room.room_name?.toLowerCase() === "announcements";
  const canManage = role === "owner" || role === "manager";
  const canDelete = role === "owner";

  // Filter members by search
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) => m.full_name?.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [members, memberSearch]);

  // Split into active and removed
  const activeMembers = useMemo(
    () => filteredMembers.filter((m) => !m.is_revoked),
    [filteredMembers],
  );
  const removedMembers = useMemo(
    () => filteredMembers.filter((m) => m.is_revoked),
    [filteredMembers],
  );

  const handleLeave = useCallback(() => {
    leaveRoom.mutate(room.id, {
      onSuccess: () => {
        toast.success("You left the room");
        onOpenChange(false);
        onRoomLeft?.();
      },
      onError: () => toast.error("Failed to leave room"),
    });
  }, [leaveRoom, room.id, onOpenChange, onRoomLeft]);

  const handleDelete = useCallback(() => {
    deleteRoom.mutate(room.id, {
      onSuccess: () => {
        toast.success("Room deleted");
        onOpenChange(false);
        onRoomLeft?.();
      },
      onError: () => toast.error("Failed to delete room"),
    });
  }, [deleteRoom, room.id, onOpenChange, onRoomLeft]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[440px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            {room.room_type === "dm" ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                {(room.client_name ?? "?")
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
            ) : isAnnouncement ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Megaphone className="h-4 w-4 text-amber-500" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {(room.client_name ?? "?")
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <span>
              {room.client_name ?? (room.room_type === "dm" ? "Direct Message" : "Channel")}
            </span>
          </SheetTitle>
          <SheetDescription>
            {room.room_type === "dm"
              ? "Direct message conversation"
              : isAnnouncement
                ? "Important updates & announcements channel"
                : isTeam
                  ? "Team discussion channel"
                  : "Client workspace chat room"}
          </SheetDescription>
        </SheetHeader>

        {/* Room Info */}
        <div className="space-y-2 pb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-subtle">Type</span>
            <Badge variant="outline" className="text-[10px]">
              {room.room_type === "team" ? "Team Channel" : "Client Workspace"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-subtle">Created</span>
            <span className="text-foreground">
              {new Date(room.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Members Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground-strong flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
              {members && (
                <span className="text-xs font-normal text-foreground-subtle">
                  ({activeMembers.length} active)
                </span>
              )}
            </h3>

            {/* Add Members button — Owner/Manager only */}
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setAddDialogOpen(true)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add
              </Button>
            )}
          </div>

          {/* Search members */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-subtle" />
            <Input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search members…"
              className="h-8 pl-8 text-xs bg-surface-input border-border-subtle"
            />
          </div>

          {/* Members list */}
          {membersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-surface-card animate-pulse" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-24 rounded bg-surface-card animate-pulse" />
                    <div className="h-2.5 w-16 rounded bg-surface-card animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {/* Active members */}
              {activeMembers.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isCurrentUser={m.id === user?.id}
                  canManage={canManage}
                  roomId={room.id}
                  kickMember={kickMember}
                  addMember={addMemberMutation}
                />
              ))}

              {/* Removed members section */}
              {removedMembers.length > 0 && (
                <>
                  <div className="pt-3 pb-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-foreground-subtle px-3">
                      Removed ({removedMembers.length})
                    </span>
                  </div>
                  {removedMembers.map((m) => (
                    <MemberRow
                      key={m.id}
                      member={m}
                      isCurrentUser={m.id === user?.id}
                      canManage={canManage}
                      roomId={room.id}
                      kickMember={kickMember}
                      addMember={addMemberMutation}
                    />
                  ))}
                </>
              )}

              {filteredMembers.length === 0 && memberSearch && (
                <p className="text-xs text-foreground-subtle text-center py-4">
                  No members matching &quot;{memberSearch}&quot;
                </p>
              )}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Danger Zone */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground-strong">Danger Zone</h3>

          {/* Leave Room */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950"
              >
                <LogOut className="h-4 w-4" />
                Leave room
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave this room?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will no longer receive messages from this room. An owner or manager can add
                  you back.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLeave}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Leave room
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Room — Owner only */}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete room
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this room permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all messages, attachments, and data in this room.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SheetContent>

      {/* Add member dialog — rendered outside SheetContent to avoid z-index issues */}
      {canManage && members && (
        <AddMemberDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          roomId={room.id}
          roomType={room.room_type}
          activeMembers={activeMembers}
          allMembers={members}
          addMember={addMemberMutation}
        />
      )}
    </Sheet>
  );
}
