/**
 * use-chat-messages — message send/edit/delete/forward + mention suggestions,
 * split out of the use-chat god-module. Re-exported from use-chat.ts so
 * existing import sites keep working. Pure move, no behavior change.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

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

export interface ForwardMessageInput {
  messageId: string;
  targetThreadId: string;
  originalContent: string;
  originalMessageType?: string;
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
