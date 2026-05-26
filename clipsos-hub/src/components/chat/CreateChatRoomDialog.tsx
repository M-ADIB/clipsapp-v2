/**
 * CreateChatRoomDialog — dialog for creating new group channels or starting DMs.
 *
 * Supports:
 *  - Creating group channels (team or client chat)
 *  - Starting DMs with any user
 *  - Member selection with search
 *  - Client assignment (for workspace rooms)
 */
import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Search,
  Users,
  User,
  Check,
  Shield,
  ShieldCheck,
  Crown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateRoom, useStartDM, useRoomMembers } from "@/hooks/use-chat";
import type { RoomMember } from "@/hooks/use-chat";
import type { ChatMode } from "./ChatLayout";

interface CreateChatRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatMode: ChatMode;
  /** Called with the new room ID so the parent can select it */
  onRoomCreated?: (roomId: string) => void;
}

type CreateTab = "channel" | "dm";

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

export function CreateChatRoomDialog({
  open,
  onOpenChange,
  chatMode,
  onRoomCreated,
}: CreateChatRoomDialogProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<CreateTab>("channel");
  const [channelName, setChannelName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [dmTarget, setDmTarget] = useState<string | null>(null);
  const [dmSearch, setDmSearch] = useState("");

  const createRoom = useCreateRoom();
  const startDM = useStartDM();

  // Fetch all team members for member selection
  // We reuse useRoomMembers with a null roomId to get all tenant profiles
  const { data: allMembers, isLoading: membersLoading } = useRoomMembers(
    open ? "__fetch_all__" : null,
  );

  const isTeam = chatMode === "team";

  // Filter available members (exclude current user)
  const availableMembers = useMemo(() => {
    if (!allMembers) return [];
    return allMembers.filter((m) => m.id !== user?.id);
  }, [allMembers, user?.id]);

  // Channel member search
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return availableMembers;
    const q = search.toLowerCase();
    return availableMembers.filter(
      (m) => m.full_name?.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [availableMembers, search]);

  // DM user search
  const filteredDmUsers = useMemo(() => {
    if (!dmSearch.trim()) return availableMembers;
    const q = dmSearch.toLowerCase();
    return availableMembers.filter(
      (m) => m.full_name?.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [availableMembers, dmSearch]);

  const toggleMember = useCallback((userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }, []);

  const handleCreateChannel = useCallback(() => {
    const name = channelName.trim();
    if (!name) {
      toast.error("Please enter a channel name");
      return;
    }

    createRoom.mutate(
      {
        name,
        room_type: isTeam ? "team" : "workspace",
        member_ids: selectedMembers,
      },
      {
        onSuccess: (room) => {
          toast.success(`Channel "${name}" created`);
          onRoomCreated?.(room.id);
          handleClose();
        },
        onError: () => toast.error("Failed to create channel"),
      },
    );
  }, [channelName, isTeam, selectedMembers, createRoom, onRoomCreated]);

  const handleStartDM = useCallback(() => {
    if (!dmTarget) {
      toast.error("Please select a user");
      return;
    }

    startDM.mutate(
      {
        target_user_id: dmTarget,
        context: chatMode,
      },
      {
        onSuccess: (result) => {
          if (result.isExisting) {
            toast.info("Opening existing conversation");
          } else {
            toast.success("Direct message started");
          }
          onRoomCreated?.(result.id);
          handleClose();
        },
        onError: () => toast.error("Failed to start conversation"),
      },
    );
  }, [dmTarget, chatMode, startDM, onRoomCreated]);

  const handleClose = useCallback(() => {
    setChannelName("");
    setSearch("");
    setSelectedMembers([]);
    setDmTarget(null);
    setDmSearch("");
    setTab("channel");
    onOpenChange(false);
  }, [onOpenChange]);

  const isPending = createRoom.isPending || startDM.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            New Conversation
          </DialogTitle>
          <DialogDescription>
            Create a new group channel or start a direct message.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as CreateTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channel" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Channel
            </TabsTrigger>
            <TabsTrigger value="dm" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Direct Message
            </TabsTrigger>
          </TabsList>

          {/* ── Channel Creation ──────────────────────────────────── */}
          <TabsContent value="channel" className="space-y-4 mt-4">
            {/* Channel name */}
            <div className="space-y-2">
              <Label htmlFor="channel-name" className="text-xs font-medium text-foreground-muted">
                Channel Name
              </Label>
              <div className="relative">
                <Input
                  id="channel-name"
                  value={channelName}
                  onChange={(e) =>
                    setChannelName(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }
                  placeholder="e.g. marketing, design-team"
                  className="h-9 text-sm bg-surface-input border-border-subtle lowercase"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-foreground-subtle">
                Channel names must be lowercase with hyphens, no spaces.
              </p>
            </div>

            {/* Member selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground-muted flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Add Members
                {selectedMembers.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {selectedMembers.length} selected
                  </Badge>
                )}
              </Label>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-subtle" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or role…"
                  className="h-8 pl-8 text-xs bg-surface-input border-border-subtle"
                />
              </div>

              <ScrollArea className="max-h-[200px] rounded-lg border border-border-subtle">
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-foreground-subtle" />
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <p className="text-xs text-foreground-subtle text-center py-6">
                    {search ? "No users matching search" : "No team members found"}
                  </p>
                ) : (
                  <div className="p-1">
                    {filteredMembers.map((member) => {
                      const isSelected = selectedMembers.includes(member.id);
                      const roleMeta = getRoleMeta(member.role);
                      const RoleIcon = roleMeta.icon;

                      return (
                        <button
                          key={member.id}
                          onClick={() => toggleMember(member.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                            isSelected
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-surface-card/50 border border-transparent",
                          )}
                        >
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage src={member.avatar_url ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-medium text-foreground-strong truncate block">
                              {member.full_name ?? "Unknown"}
                            </span>
                            <div className="flex items-center gap-1">
                              <RoleIcon className={cn("h-2.5 w-2.5", roleMeta.color)} />
                              <span className="text-[10px] text-foreground-subtle">
                                {roleMeta.label}
                              </span>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border-subtle",
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* ── Direct Message ────────────────────────────────────── */}
          <TabsContent value="dm" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground-muted">
                Select a person to message
              </Label>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-subtle" />
                <Input
                  value={dmSearch}
                  onChange={(e) => setDmSearch(e.target.value)}
                  placeholder="Search by name or role…"
                  className="h-8 pl-8 text-xs bg-surface-input border-border-subtle"
                  autoFocus
                />
              </div>

              <ScrollArea className="max-h-[280px] rounded-lg border border-border-subtle">
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-foreground-subtle" />
                  </div>
                ) : filteredDmUsers.length === 0 ? (
                  <p className="text-xs text-foreground-subtle text-center py-6">
                    {dmSearch ? "No users matching search" : "No users found"}
                  </p>
                ) : (
                  <div className="p-1">
                    {filteredDmUsers.map((member) => {
                      const isSelected = dmTarget === member.id;
                      const roleMeta = getRoleMeta(member.role);
                      const RoleIcon = roleMeta.icon;

                      return (
                        <button
                          key={member.id}
                          onClick={() => setDmTarget(isSelected ? null : member.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                            isSelected
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-surface-card/50 border border-transparent",
                          )}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={member.avatar_url ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-foreground-strong truncate block">
                              {member.full_name ?? "Unknown"}
                            </span>
                            <div className="flex items-center gap-1">
                              <RoleIcon className={cn("h-2.5 w-2.5", roleMeta.color)} />
                              <span className="text-[10px] text-foreground-subtle">
                                {roleMeta.label}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          {tab === "channel" ? (
            <Button
              onClick={handleCreateChannel}
              disabled={!channelName.trim() || isPending}
              className="gap-1.5"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Create Channel
            </Button>
          ) : (
            <Button onClick={handleStartDM} disabled={!dmTarget || isPending} className="gap-1.5">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Start Message
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
