/**
 * use-clips-chat — streaming chat hook for Ask Clips.
 *
 * Mirrors the Jarvis architecture from Hormone Harmony Hub:
 *  - One eternal conversation per user (via usePrimaryConversation)
 *  - SSE streaming from supabase/functions/clips-chat
 *  - Tool events surface as `tool_start` / `tool_end` SSE frames
 *  - Optimistic user + placeholder assistant messages, swapped to real ids on `done`
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePrimaryConversation } from "./use-primary-conversation";

export interface ClipsToolEvent {
  name: string;
  status: "running" | "done";
  summary?: string;
  arguments?: unknown;
  result?: unknown;
}

export interface ClipsMessage {
  id: string;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  tool_calls?: unknown;
  created_at: string;
  streaming?: boolean;
  failed?: boolean;
  toolEvents?: ClipsToolEvent[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clips-chat`;

export function useClipsChat(currentRoute?: string) {
  const { conversationId, loading: convoLoading } = usePrimaryConversation();
  const [messages, setMessages] = useState<ClipsMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const routeRef = useRef<string | undefined>(currentRoute);
  routeRef.current = currentRoute;

  // Load history once we know the conversation id
  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    (async () => {
      setLoadingHistory(true);
      const { data } = await supabase
        .from("ai_messages")
        .select("id, role, content, tool_calls, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (!cancelled) {
        setMessages((data as ClipsMessage[]) || []);
        setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);
  }, []);

  const clearChat = useCallback(async () => {
    if (!conversationId) return;
    await supabase.from("ai_messages").delete().eq("conversation_id", conversationId);
    setMessages([]);
    toast.success("Chat cleared");
  }, [conversationId]);

  const streamRequest = useCallback(
    async (
      payload: { message?: string; regenerate?: boolean },
      placeholderId: string,
    ): Promise<void> => {
      if (!conversationId) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setIsSending(true);

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            conversation_id: conversationId,
            current_route: routeRef.current,
            ...payload,
          }),
          signal: ctrl.signal,
        });

        if (!resp.ok || !resp.body) {
          const errText = await resp.text().catch(() => "");
          if (resp.status === 429) toast.error("Rate limit. Try again in a moment.");
          else if (resp.status === 402)
            toast.error("AI credits exhausted. Top up in workspace settings.");
          else toast.error(errText || "Clips is unavailable");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId ? { ...m, streaming: false, failed: true } : m,
            ),
          );
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        const events: ClipsToolEvent[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n\n")) !== -1) {
            const block = buf.slice(0, nl);
            buf = buf.slice(nl + 2);
            for (const line of block.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              try {
                const evt = JSON.parse(line.slice(6));
                if (evt.type === "text") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === placeholderId ? { ...m, content: (m.content || "") + evt.delta } : m,
                    ),
                  );
                } else if (evt.type === "tool_start") {
                  events.push({
                    name: evt.name,
                    status: "running",
                    arguments: evt.arguments,
                  });
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === placeholderId ? { ...m, toolEvents: [...events] } : m,
                    ),
                  );
                } else if (evt.type === "tool_end") {
                  const e = events.find((x) => x.name === evt.name && x.status === "running");
                  if (e) {
                    e.status = "done";
                    e.summary = evt.summary;
                    e.result = evt.result;
                  }
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === placeholderId ? { ...m, toolEvents: [...events] } : m,
                    ),
                  );
                } else if (evt.type === "done") {
                  const finalId = evt.message_id || placeholderId;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === placeholderId ? { ...m, id: finalId, streaming: false } : m,
                    ),
                  );
                } else if (evt.type === "error") {
                  toast.error(evt.message || "Stream error");
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === placeholderId ? { ...m, streaming: false, failed: true } : m,
                    ),
                  );
                }
              } catch {
                /* ignore */
              }
            }
          }
        }
      } catch (e) {
        const err = e as { name?: string; message?: string };
        if (err.name === "AbortError") return;
        toast.error(err?.message || "Connection lost");
        setMessages((prev) =>
          prev.map((m) => (m.id === placeholderId ? { ...m, streaming: false, failed: true } : m)),
        );
      } finally {
        abortRef.current = null;
        setIsSending(false);
      }
    },
    [conversationId],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !conversationId) return;
      const userMsg: ClipsMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      };
      const placeholder: ClipsMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        streaming: true,
      };
      setMessages((prev) => [...prev, userMsg, placeholder]);
      await streamRequest({ message: text }, placeholder.id);
    },
    [conversationId, streamRequest],
  );

  const regenerate = useCallback(async () => {
    if (!conversationId) return;
    setMessages((prev) => {
      const lastAsstIdx = [...prev].reverse().findIndex((m) => m.role === "assistant");
      if (lastAsstIdx === -1) return prev;
      return prev.slice(0, prev.length - 1 - lastAsstIdx);
    });
    const placeholder: ClipsMessage = {
      id: `asst-${Date.now()}`,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      streaming: true,
    };
    setMessages((prev) => [...prev, placeholder]);
    await streamRequest({ regenerate: true }, placeholder.id);
  }, [conversationId, streamRequest]);

  return {
    conversationId,
    convoLoading,
    messages,
    isSending,
    loadingHistory,
    sendMessage,
    regenerate,
    stopStream,
    clearChat,
  };
}
