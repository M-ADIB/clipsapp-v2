/**
 * useChat — Chat domain hooks (rooms, messages, reactions, read receipts).
 *
 * Follows the established TanStack Query pattern from use-crm.ts.
 */
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

// ── Types ───────────────────────────────────────────────────────────────────

export interface ChatRoomWithPreview {
  id: string;
  tenant_id: string;
  client_id: string | null;
  room_type: string; // 'workspace' | 'team'
  room_name: string | null; // direct name from chat_rooms.name
  created_at: string;
  updated_at: string;
  client_name: string | null;
  client_avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender: string | null;
  unread_count: number;
  is_muted: boolean;
  thread_id: string | null;
}

export interface SendMessageInput {
  thread_id: string;
  content: string;
  message_type?: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  reply_to_message_id?: string;
  mentioned_user_ids?: string[];
}

// ── Queries ─────────────────────────────────────────────────────────────────

export interface UseChatRoomsOptions {
  /** Filter rooms by type: 'team' or 'workspace'. If undefined, returns all. */
  roomType?: "team" | "workspace";
}

export function useChatRooms(options?: UseChatRoomsOptions) {
  const { tenantId, user } = useAuth();
  const roomType = options?.roomType;
  return useQuery({
    queryKey: [...queryKeys.chat.rooms(tenantId!), roomType ?? "all"],
    queryFn: async () => {
      // Fetch rooms — left-join client so team rooms (client_id IS NULL) still return
      // Include DM rooms alongside the primary room type
      let q = supabase
        .from("chat_rooms")
        .select(`*, client:clients!chat_rooms_client_id_fkey(name, company, logo_url)`)
        .eq("tenant_id", tenantId!)
        .order("updated_at", { ascending: false });
      if (roomType) {
        // Fetch primary room type + DMs
        q = q.in("room_type", [roomType, "dm"]);
      }
      const { data: rooms, error } = await q;
      if (error) throw error;
      if (!rooms?.length) return [] as ChatRoomWithPreview[];

      const roomIds = rooms.map((r) => r.id);
      const { data: threads } = await supabase
        .from("chat_threads")
        .select("id, room_id")
        .in("room_id", roomIds)
        .eq("title", "General");

      const threadMap = new Map((threads ?? []).map((t) => [t.room_id, t.id]));
      const threadIds = Array.from(threadMap.values());

      // Last message per thread
      const lastMsgMap: Record<
        string,
        { content: string; created_at: string; sender_name: string | null }
      > = {};
      if (threadIds.length > 0) {
        // Batch: get last message for each thread in parallel
        await Promise.all(
          threadIds.map(async (tid) => {
            const { data: msg } = await supabase
              .from("chat_messages")
              .select("content, created_at, sender_id")
              .eq("thread_id", tid)
              .eq("is_deleted", false)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (msg) {
              lastMsgMap[tid] = {
                content: msg.content ?? "",
                created_at: msg.created_at,
                sender_name: null,
              };
            }
          }),
        );
      }

      // Read receipts
      const { data: receipts } = await supabase
        .from("chat_read_receipts")
        .select("thread_id, last_read_at")
        .eq("user_id", user!.id)
        .in("thread_id", threadIds.length > 0 ? threadIds : ["__none__"]);
      const receiptMap = new Map((receipts ?? []).map((r) => [r.thread_id, r.last_read_at]));

      // Mutes
      const { data: mutes } = await supabase
        .from("chat_mutes")
        .select("room_id, muted_until")
        .eq("user_id", user!.id)
        .in("room_id", roomIds);
      // Filter out expired mutes
      const now = new Date().toISOString();
      const activeMutes = (mutes ?? []).filter((m) => {
        if (!m.muted_until) return true; // permanent
        return m.muted_until > now;
      });
      const muteSet = new Set(activeMutes.map((m) => m.room_id));

      // Unread counts
      const unreadMap = new Map<string, number>();
      if (threadIds.length > 0) {
        await Promise.all(
          threadIds.map(async (tid) => {
            const lastRead = receiptMap.get(tid);
            let qu = supabase
              .from("chat_messages")
              .select("id", { count: "exact", head: true })
              .eq("thread_id", tid)
              .eq("is_deleted", false)
              .neq("sender_id", user!.id);
            if (lastRead) qu = qu.gt("created_at", lastRead);
            const { count } = await qu;
            unreadMap.set(tid, count ?? 0);
          }),
        );
      }

      return rooms
        .map((room): ChatRoomWithPreview => {
          const threadId = threadMap.get(room.id) ?? null;
          const lastMsg = threadId ? lastMsgMap[threadId] : null;
          const clientData = room.client as {
            name: string;
            company: string | null;
            logo_url: string | null;
          } | null;

          // Display name logic:
          // - team: use room.name
          // - workspace: use client company/name
          // - dm: show the other person's name (strip "DM: A & B" → show B if current user is A)
          let displayName: string;
          if (room.room_type === "dm") {
            // Parse "DM: UserA & UserB" to show the other person's name
            const rawName = room.name ?? "Direct Message";
            const dmPrefix = "DM: ";
            if (rawName.startsWith(dmPrefix)) {
              const participants = rawName.slice(dmPrefix.length).split(" & ");
              // Match against the current user's name from auth metadata
              const myName = (user?.user_metadata?.full_name as string) ?? "";
              const otherName = participants.find((p) => p.toLowerCase() !== myName.toLowerCase());
              displayName = otherName ?? participants[0] ?? rawName.slice(dmPrefix.length);
            } else {
              displayName = rawName;
            }
          } else if (room.room_type === "team") {
            displayName = room.name ?? "Team Chat";
          } else {
            displayName = clientData?.company ?? clientData?.name ?? room.name ?? "Untitled";
          }

          return {
            id: room.id,
            tenant_id: room.tenant_id,
            client_id: room.client_id,
            room_type: room.room_type ?? "workspace",
            room_name: room.name,
            created_at: room.created_at,
            updated_at: room.updated_at,
            client_name: displayName,
            client_avatar_url:
              room.room_type === "workspace" ? (clientData?.logo_url ?? null) : null,
            last_message: lastMsg?.content ?? null,
            last_message_at: lastMsg?.created_at ?? null,
            last_message_sender: lastMsg?.sender_name ?? null,
            unread_count: threadId ? (unreadMap.get(threadId) ?? 0) : 0,
            is_muted: muteSet.has(room.id),
            thread_id: threadId,
          };
        })
        .sort((a, b) => {
          // Sort by last activity
          const aT = a.last_message_at ?? a.created_at;
          const bT = b.last_message_at ?? b.created_at;
          return new Date(bT).getTime() - new Date(aT).getTime();
        });
    },
    enabled: !!tenantId && !!user,
    refetchInterval: 30_000,
  });
}

export function useChatThread(roomId: string | null) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.chat.threads(tenantId!, roomId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("room_id", roomId!)
        .eq("title", "General")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!roomId,
  });
}

export function useChatMessages(threadId: string | null) {
  const { tenantId } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.chat.messages(tenantId!, threadId!),
    queryFn: async ({ pageParam }) => {
      // NOTE: Self-referential FK join (reply_to:chat_messages!...) causes
      // PostgREST to fail silently.  Fetch messages without it, then resolve
      // reply parents from the same result set in a second pass.
      let q = supabase
        .from("chat_messages")
        .select(
          `
          *,
          sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url),
          reactions:chat_reactions(id, emoji, user_id),
          mentions:chat_mentions(id, mentioned_user_id),
          attachments:chat_attachments(id, file_url, file_name, file_type, file_size)
        `,
        )
        .eq("thread_id", threadId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (pageParam) q = q.lt("created_at", pageParam as string);
      const { data, error } = await q;
      if (error) throw error;
      const messages = data ?? [];

      // Build a lookup of messages by ID so we can resolve reply parents
      const msgMap = new Map(messages.map((m) => [m.id, m]));

      // Find reply parent IDs that aren't in the current page
      const missingReplyIds = messages
        .filter((m) => m.reply_to_message_id && !msgMap.has(m.reply_to_message_id))
        .map((m) => m.reply_to_message_id!);

      let externalReplies = new Map<
        string,
        { id: string; content: string | null; sender_id: string }
      >();
      if (missingReplyIds.length > 0) {
        const { data: replyData } = await supabase
          .from("chat_messages")
          .select("id, content, sender_id")
          .in("id", missingReplyIds);
        if (replyData) {
          externalReplies = new Map(replyData.map((r) => [r.id, r]));
        }
      }

      // Attach reply_to data to each message
      return messages.map((m) => {
        if (!m.reply_to_message_id) return { ...m, reply_to: null };
        const parent =
          msgMap.get(m.reply_to_message_id) ?? externalReplies.get(m.reply_to_message_id);
        return {
          ...m,
          reply_to: parent
            ? { id: parent.id, content: parent.content, sender_id: parent.sender_id }
            : null,
        };
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 50) return undefined;
      return lastPage[lastPage.length - 1]?.created_at ?? undefined;
    },
    enabled: !!tenantId && !!threadId,
  });
}

export function useMentionSuggestions(roomId: string | null) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.chat.mentionSuggestions(tenantId!, roomId!),
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, user_roles!user_roles_user_id_profiles_fkey(role)")
        .eq("tenant_id", tenantId!);
      return (data ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        role: (p.user_roles as unknown as { role: string }[] | null)?.[0]?.role ?? "unknown",
      }));
    },
    enabled: !!tenantId && !!roomId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useSendMessage() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SendMessageInput) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          thread_id: input.thread_id,
          sender_id: user!.id,
          content: input.content,
          message_type: input.message_type ?? "text",
          tenant_id: tenantId!,
          reply_to_message_id: input.reply_to_message_id ?? null,
          mentioned_user_ids: input.mentioned_user_ids ?? [],
        } as never)
        .select(`*, sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)`)
        .single();
      if (error) throw error;
      if (input.attachment_url && input.attachment_type) {
        await supabase.from("chat_attachments").insert({
          message_id: data.id,
          file_url: input.attachment_url,
          file_name: input.attachment_name ?? "attachment",
          file_type: input.attachment_type,
          tenant_id: tenantId!,
        });
      }
      return data;
    },
    onSuccess: (_data, input) => {
      // Invalidate messages for this thread so the list refreshes immediately
      qc.invalidateQueries({
        queryKey: queryKeys.chat.messages(tenantId!, input.thread_id),
      });
      // Also refresh rooms to update last message preview + sidebar counts
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
      // Refresh sidebar unread counts
      qc.invalidateQueries({ queryKey: queryKeys.chat.unreadCounts(tenantId!) });
    },
  });
}

export function useEditMessage() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .update({ content, is_edited: true })
        .eq("id", messageId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "messages", tenantId], exact: false });
    },
  });
}

export function useDeleteMessage() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .update({ is_deleted: true })
        .eq("id", messageId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "messages", tenantId], exact: false });
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
    },
  });
}

// ── Reactions / read / mute / attachments (moved to use-chat-reactions.ts) ───
export {
  useReactToMessage,
  useMarkAsRead,
  useMuteRoom,
  useUploadChatAttachment,
  type MuteDuration,
} from "./use-chat-reactions";

// ── Room management (moved to use-chat-members.ts; re-exported) ──────────────
export {
  useRoomMembers,
  useKickMember,
  useAddMember,
  useLeaveRoom,
  useDeleteRoom,
  type RoomMember,
} from "./use-chat-members";

// ── Room creation ───────────────────────────────────────────────────────────

export interface CreateRoomInput {
  name: string;
  room_type: "team" | "workspace";
  /** Optional: pre-select members by user ID */
  member_ids?: string[];
  /** Optional: attach to a client workspace */
  client_id?: string;
}

export function useCreateRoom() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      // 1. Create the room
      const { data: room, error: roomErr } = await supabase
        .from("chat_rooms")
        .insert({
          name: input.name,
          room_type: input.room_type,
          client_id: input.client_id ?? null,
          tenant_id: tenantId!,
        })
        .select()
        .single();
      if (roomErr) throw roomErr;

      // 2. Create default "General" thread
      await supabase.from("chat_threads").insert({
        room_id: room.id,
        title: "General",
        created_by: user!.id,
        tenant_id: tenantId!,
      });

      // 3. Grant access to selected members
      if (input.member_ids?.length) {
        const overrides = input.member_ids.map((uid) => ({
          room_id: room.id,
          user_id: uid,
          action: "grant" as const,
          granted_by: user!.id,
          tenant_id: tenantId!,
        }));
        await supabase.from("chat_room_access_overrides").insert(overrides);
      }

      return room;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
    },
  });
}

export interface StartDMInput {
  /** The other user's profile ID */
  target_user_id: string;
  /** Which sidebar the DM should primarily appear in */
  context: "team" | "client";
}

export function useStartDM() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: StartDMInput) => {
      // Check if a DM room already exists between these two users
      // Single query: find a DM room where both users have a 'grant' override
      const { data: existingMatch } = await supabase
        .from("chat_room_access_overrides")
        .select("room_id")
        .eq("action", "grant")
        .in("user_id", [user!.id, input.target_user_id])
        .in(
          "room_id",
          // Subquery: all DM rooms in this tenant
          (
            await supabase
              .from("chat_rooms")
              .select("id")
              .eq("tenant_id", tenantId!)
              .eq("room_type", "dm")
          ).data?.map((r) => r.id) ?? [],
        );

      // Group by room_id and find one with both users
      if (existingMatch?.length) {
        const roomCounts = new Map<string, number>();
        for (const o of existingMatch) {
          roomCounts.set(o.room_id, (roomCounts.get(o.room_id) ?? 0) + 1);
        }
        for (const [roomId, count] of roomCounts) {
          if (count >= 2) {
            return { id: roomId, isExisting: true };
          }
        }
      }

      // Create new DM room
      // Get the target user's name for the room display
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", input.target_user_id)
        .single();

      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .single();

      const roomName = `DM: ${currentProfile?.full_name ?? "User"} & ${targetProfile?.full_name ?? "User"}`;

      const { data: room, error } = await supabase
        .from("chat_rooms")
        .insert({
          name: roomName,
          room_type: "dm",
          tenant_id: tenantId!,
        })
        .select()
        .single();
      if (error) throw error;

      // Create thread
      await supabase.from("chat_threads").insert({
        room_id: room.id,
        title: "General",
        created_by: user!.id,
        tenant_id: tenantId!,
      });

      // Grant access to both users
      await supabase.from("chat_room_access_overrides").insert([
        {
          room_id: room.id,
          user_id: user!.id,
          action: "grant",
          granted_by: user!.id,
          tenant_id: tenantId!,
        },
        {
          room_id: room.id,
          user_id: input.target_user_id,
          action: "grant",
          granted_by: user!.id,
          tenant_id: tenantId!,
        },
      ]);

      return { id: room.id, isExisting: false };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
    },
  });
}

// ── Sidebar unread counts (aggregated by room type) ─────────────────────────

export interface SidebarUnreadCounts {
  /** Total unread messages across team channels */
  teamUnread: number;
  /** Total unread messages across client (workspace) channels */
  clientUnread: number;
  /** Count of unread @mentions in team channels */
  teamMentions: number;
  /** Count of unread @mentions in client channels */
  clientMentions: number;
}

export function useSidebarUnreadCounts() {
  const { tenantId, user } = useAuth();
  return useQuery({
    queryKey: queryKeys.chat.unreadCounts(tenantId!),
    queryFn: async (): Promise<SidebarUnreadCounts> => {
      // 1. Get all rooms
      const { data: rooms } = await supabase
        .from("chat_rooms")
        .select("id, room_type")
        .eq("tenant_id", tenantId!);
      if (!rooms?.length)
        return { teamUnread: 0, clientUnread: 0, teamMentions: 0, clientMentions: 0 };

      // 2. Get threads for each room
      const roomIds = rooms.map((r) => r.id);
      const { data: threads } = await supabase
        .from("chat_threads")
        .select("id, room_id")
        .in("room_id", roomIds)
        .eq("title", "General");
      const threadToRoom = new Map((threads ?? []).map((t) => [t.id, t.room_id]));
      const threadIds = Array.from(threadToRoom.keys());
      if (!threadIds.length)
        return { teamUnread: 0, clientUnread: 0, teamMentions: 0, clientMentions: 0 };

      // 3. Get read receipts
      const { data: receipts } = await supabase
        .from("chat_read_receipts")
        .select("thread_id, last_read_at")
        .eq("user_id", user!.id)
        .in("thread_id", threadIds);
      const receiptMap = new Map((receipts ?? []).map((r) => [r.thread_id, r.last_read_at]));

      // Room type lookup
      const roomTypeMap = new Map(rooms.map((r) => [r.id, r.room_type]));

      // 4. Count unread messages per thread
      let teamUnread = 0;
      let clientUnread = 0;
      await Promise.all(
        threadIds.map(async (tid) => {
          const lastRead = receiptMap.get(tid);
          let q = supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("thread_id", tid)
            .eq("is_deleted", false)
            .neq("sender_id", user!.id);
          if (lastRead) q = q.gt("created_at", lastRead);
          const { count } = await q;
          const roomId = threadToRoom.get(tid);
          const roomType = roomId ? roomTypeMap.get(roomId) : null;
          if (roomType === "team") teamUnread += count ?? 0;
          else clientUnread += count ?? 0;
        }),
      );

      // 5. Count unread @mentions
      let teamMentions = 0;
      let clientMentions = 0;
      const { data: mentions } = await supabase
        .from("chat_mentions")
        .select("id, message_id")
        .eq("mentioned_user_id", user!.id)
        .eq("is_read", false)
        .eq("tenant_id", tenantId!);
      if (mentions?.length) {
        // Get messages to map back to threads -> rooms
        const mentionMsgIds = mentions.map((m) => m.message_id);
        const { data: mentionMsgs } = await supabase
          .from("chat_messages")
          .select("id, thread_id")
          .in("id", mentionMsgIds);
        for (const msg of mentionMsgs ?? []) {
          const roomId = threadToRoom.get(msg.thread_id);
          const roomType = roomId ? roomTypeMap.get(roomId) : null;
          if (roomType === "team") teamMentions++;
          else clientMentions++;
        }
      }

      return { teamUnread, clientUnread, teamMentions, clientMentions };
    },
    enabled: !!tenantId && !!user,
    refetchInterval: 15_000, // Poll every 15s for responsive sidebar badges
    staleTime: 10_000,
  });
}

// ── Forward ─────────────────────────────────────────────────────────────────

export interface ForwardMessageInput {
  messageId: string;
  targetThreadId: string;
  originalContent: string;
  originalMessageType?: string;
}

export function useForwardMessage() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ForwardMessageInput) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          thread_id: input.targetThreadId,
          sender_id: user!.id,
          content: input.originalContent,
          message_type: input.originalMessageType ?? "text",
          tenant_id: tenantId!,
          is_forwarded: true,
          forwarded_from_message_id: input.messageId,
        } as never)
        .select(`*, sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)`)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({
        queryKey: queryKeys.chat.messages(tenantId!, input.targetThreadId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
      qc.invalidateQueries({ queryKey: queryKeys.chat.unreadCounts(tenantId!) });
    },
  });
}

// ── Pinning (moved to use-chat-pins.ts; re-exported for compatibility) ───────
export {
  usePinnedMessages,
  usePinMessage,
  useUnpinMessage,
  type PinnedMessage,
} from "./use-chat-pins";
