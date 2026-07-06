/**
 * use-chat-reactions — reactions, read-receipts, mute, and attachment upload
 * hooks, split out of the use-chat god-module. Re-exported from use-chat.ts.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

export function useReactToMessage() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const { data: existing } = await supabase
        .from("chat_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", user!.id)
        .eq("emoji", emoji)
        .maybeSingle();
      if (existing) {
        await supabase.from("chat_reactions").delete().eq("id", existing.id);
        return { action: "removed" as const };
      }
      await supabase.from("chat_reactions").insert({
        message_id: messageId,
        user_id: user!.id,
        emoji,
        tenant_id: tenantId!,
      });
      return { action: "added" as const };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "messages", tenantId], exact: false });
    },
  });
}

export function useMarkAsRead() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      await supabase.from("chat_read_receipts").upsert(
        {
          thread_id: threadId,
          user_id: user!.id,
          last_read_at: new Date().toISOString(),
          tenant_id: tenantId!,
        },
        { onConflict: "thread_id,user_id" },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.unreadCounts(tenantId!) });
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
    },
  });
}

export type MuteDuration = "1h" | "8h" | "1d" | "forever" | "unmute";

export function useMuteRoom() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roomId, duration }: { roomId: string; duration: MuteDuration }) => {
      if (duration === "unmute") {
        await supabase.from("chat_mutes").delete().eq("room_id", roomId).eq("user_id", user!.id);
        return;
      }

      let muted_until: string | null = null;
      if (duration !== "forever") {
        const hours = duration === "1h" ? 1 : duration === "8h" ? 8 : 24;
        const until = new Date();
        until.setHours(until.getHours() + hours);
        muted_until = until.toISOString();
      }

      await supabase
        .from("chat_mutes")
        .upsert(
          { room_id: roomId, user_id: user!.id, tenant_id: tenantId!, muted_until },
          { onConflict: "room_id,user_id" },
        );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.rooms(tenantId!) });
    },
  });
}

export function useUploadChatAttachment() {
  const { tenantId, user } = useAuth();
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${tenantId}/${user!.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("chat-attachments")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
      return { url: urlData.publicUrl, type: file.type, name: file.name, size: file.size };
    },
  });
}
