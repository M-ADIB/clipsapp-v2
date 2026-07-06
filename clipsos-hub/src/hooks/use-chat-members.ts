/**
 * use-chat-members — room membership hooks (members list + access overrides +
 * leave/delete), split out of the use-chat god-module. Re-exported from
 * use-chat.ts so existing import sites keep working.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

export interface RoomMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_revoked: boolean;
}

export function useRoomMembers(roomId: string | null) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["chat", "room-members", tenantId, roomId],
    queryFn: async () => {
      // Get all tenant profiles with roles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, user_roles!user_roles_user_id_profiles_fkey(role)")
        .eq("tenant_id", tenantId!);

      // Get access overrides for this room
      const { data: overrides } = await supabase
        .from("chat_room_access_overrides")
        .select("user_id, action")
        .eq("room_id", roomId!);

      const overrideMap = new Map<string, string>();
      // Process overrides — later entries override earlier ones
      (overrides ?? []).forEach((o) => {
        overrideMap.set(o.user_id, o.action);
      });

      return (profiles ?? []).map((p): RoomMember => {
        const role = (p.user_roles as unknown as { role: string }[] | null)?.[0]?.role ?? "unknown";
        const overrideAction = overrideMap.get(p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          role,
          is_revoked: overrideAction === "revoke",
        };
      });
    },
    enabled: !!tenantId && !!roomId,
  });
}

export function useKickMember() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roomId, userId }: { roomId: string; userId: string }) => {
      await supabase.from("chat_room_access_overrides").upsert(
        {
          room_id: roomId,
          user_id: userId,
          action: "revoke",
          granted_by: user!.id,
          tenant_id: tenantId!,
        },
        { onConflict: "room_id,user_id" },
      );
    },
    onSuccess: (_, { roomId }) => {
      qc.invalidateQueries({ queryKey: ["chat", "room-members", tenantId, roomId] });
    },
  });
}

export function useAddMember() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roomId, userId }: { roomId: string; userId: string }) => {
      await supabase.from("chat_room_access_overrides").upsert(
        {
          room_id: roomId,
          user_id: userId,
          action: "grant",
          granted_by: user!.id,
          tenant_id: tenantId!,
        },
        { onConflict: "room_id,user_id" },
      );
    },
    onSuccess: (_, { roomId }) => {
      qc.invalidateQueries({ queryKey: ["chat", "room-members", tenantId, roomId] });
    },
  });
}

export function useLeaveRoom() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: string) => {
      await supabase.from("chat_room_access_overrides").upsert(
        {
          room_id: roomId,
          user_id: user!.id,
          action: "revoke",
          granted_by: user!.id,
          tenant_id: tenantId!,
        },
        { onConflict: "room_id,user_id" },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
    },
  });
}

export function useDeleteRoom() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: string) => {
      // Atomic deletion via SECURITY DEFINER function (single transaction)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)("delete_chat_room", { _room_id: roomId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
    },
  });
}
