/**
 * useChatRealtime — Supabase Realtime subscriptions for chat.
 *
 * Subscribes to postgres_changes on chat_messages for a given thread,
 * and manages a Presence channel for typing indicators per room.
 *
 * Uses unique channel names per mount to avoid "cannot add callbacks
 * after subscribe()" errors when React re-mounts effects.
 */
import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Global counter to generate unique channel names per subscription
let channelCounter = 0;

/**
 * Subscribe to real-time message changes for a specific thread.
 * Automatically updates the TanStack Query cache on INSERT/UPDATE/DELETE.
 */
export function useChatRealtimeMessages(threadId: string | null) {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!threadId || !tenantId) return;

    // Unique channel name prevents "cannot add callbacks after subscribe()" errors
    const channelName = `chat-msgs-${threadId}-${++channelCounter}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          // Invalidate messages for this thread to refetch
          qc.invalidateQueries({
            queryKey: queryKeys.chat.messages(tenantId, threadId),
          });
          // Also refresh rooms to update last message preview
          qc.invalidateQueries({
            queryKey: queryKeys.chat.rooms(tenantId),
          });
          // Refresh unread counts
          qc.invalidateQueries({
            queryKey: queryKeys.chat.unreadCounts(tenantId),
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [threadId, tenantId, qc]);
}

/**
 * Subscribe to real-time reaction changes for a thread.
 */
export function useChatRealtimeReactions(threadId: string | null) {
  const { tenantId } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!threadId || !tenantId) return;

    const channelName = `chat-rxn-${threadId}-${++channelCounter}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_reactions",
        },
        () => {
          qc.invalidateQueries({
            queryKey: queryKeys.chat.messages(tenantId, threadId),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, tenantId, qc]);
}

/**
 * Typing indicators via Supabase Presence.
 * Returns the list of currently typing users and a function to broadcast typing state.
 */
export function useChatTyping(roomId: string | null) {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const channelName = `typing-${roomId}-${++channelCounter}`;

    const channel = supabase.channel(channelName, {
      config: { presence: { key: user.id } },
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: user.id, is_typing: false });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [roomId, user]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !user) return;

      await channelRef.current.track({
        user_id: user.id,
        is_typing: isTyping,
        full_name: user.user_metadata?.full_name ?? "Someone",
      });

      // Auto-clear after 3 seconds
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({
              user_id: user.id,
              is_typing: false,
            });
          }
        }, 3000);
      }
    },
    [user],
  );

  return { setTyping };
}

/**
 * Global realtime subscription for sidebar unread badges.
 * Listens to ALL chat_messages inserts (tenant-wide) and immediately
 * invalidates sidebar unread counts so badges update in real time.
 *
 * Mount this once in the shell/layout (e.g. AppSidebar).
 */
export function useChatRealtimeGlobalBadges() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!tenantId) return;

    const channelName = `chat-global-badges-${tenantId}-${++channelCounter}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          // Immediately refresh sidebar badge counts
          qc.invalidateQueries({
            queryKey: queryKeys.chat.unreadCounts(tenantId),
          });
          // Also refresh room list for last-message preview
          qc.invalidateQueries({
            queryKey: queryKeys.chat.rooms(tenantId),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);
}
