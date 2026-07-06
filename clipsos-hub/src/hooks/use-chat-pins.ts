/**
 * use-chat-pins — pinned-message hooks, split out of the use-chat god-module.
 * Re-exported from use-chat.ts so existing import sites keep working.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

export interface PinnedMessage {
  id: string;
  message_id: string;
  room_id: string;
  pinned_by: string;
  created_at: string;
  message: {
    id: string;
    content: string | null;
    sender_id: string;
    created_at: string;
    sender: { id: string; full_name: string | null; avatar_url: string | null } | null;
  };
}

export function usePinnedMessages(roomId: string | null) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.chat.pinnedMessages(tenantId!, roomId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_pinned_messages" as never)
        .select(
          `
          id, message_id, room_id, pinned_by, created_at,
          message:chat_messages!chat_pinned_messages_message_id_fkey(
            id, content, sender_id, created_at,
            sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)
          )
        ` as never,
        )
        .eq("room_id" as never, roomId!)
        .eq("tenant_id" as never, tenantId!)
        .order("created_at" as never, { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PinnedMessage[];
    },
    enabled: !!tenantId && !!roomId,
    staleTime: 30_000,
  });
}

export function usePinMessage() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from as any)("chat_pinned_messages")
        .insert({
          message_id: messageId,
          room_id: roomId,
          tenant_id: tenantId!,
          pinned_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({
        queryKey: queryKeys.chat.pinnedMessages(tenantId!, input.roomId),
      });
    },
  });
}

export function useUnpinMessage() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from as any)("chat_pinned_messages")
        .delete()
        .eq("message_id", messageId)
        .eq("tenant_id", tenantId!);
      if (error) throw error;
      return { roomId };
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({
        queryKey: queryKeys.chat.pinnedMessages(tenantId!, input.roomId),
      });
    },
  });
}
