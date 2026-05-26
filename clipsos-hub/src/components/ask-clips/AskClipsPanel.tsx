/**
 * AskClipsPanel — the chat shell rendered inside the Popover or Dialog.
 *
 * Layout:
 *   [Header: avatar · "Clips" · brain · expand · clear · close]
 *   [Scroll area: empty state OR message list]
 *   [Composer: textarea + send/stop button]
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Brain, Loader2, Maximize2, Minimize2, Send, Square, Trash2, X } from "lucide-react";
import { useClipsChat } from "@/hooks/use-clips-chat";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { MemoryPanel } from "./MemoryPanel";
import { ClipsIcon } from "./ClipsIcon";

interface Props {
  onClose?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function AskClipsPanel({ onClose, expanded = false, onToggleExpand }: Props) {
  const location = useLocation();
  const { profile } = useAuth();
  const {
    conversationId,
    messages,
    isSending,
    loadingHistory,
    sendMessage,
    regenerate,
    stopStream,
    clearChat,
  } = useClipsChat(location.pathname);

  const [input, setInput] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || isSending || !conversationId) return;
    setInput("");
    await sendMessage(t);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName = profile?.full_name?.split(" ")[0] || profile?.email?.split("@")[0] || null;

  return (
    <div
      className={`flex flex-col bg-background ${expanded ? "h-full" : "h-[600px] max-h-[80vh]"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20">
          <ClipsIcon size={13} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight text-foreground">Clips</div>
          <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Always-on · sees this page
          </div>
        </div>
        <button
          onClick={() => setMemoryOpen(true)}
          className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-input hover:text-foreground"
          title="What Clips remembers"
          aria-label="What Clips remembers"
        >
          <Brain size={14} />
        </button>
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-input hover:text-foreground"
            title={expanded ? "Collapse" : "Expand to fullscreen"}
            aria-label={expanded ? "Collapse" : "Expand to fullscreen"}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        )}
        <button
          onClick={() => {
            if (window.confirm("Clear all messages?")) void clearChat();
          }}
          className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-input hover:text-foreground"
          title="Clear chat"
          aria-label="Clear chat"
        >
          <Trash2 size={14} />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-input hover:text-foreground"
            title="Close"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3"
        role="log"
        aria-live="polite"
      >
        {loadingHistory && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-foreground-muted" />
          </div>
        )}
        {!loadingHistory && messages.length === 0 && (
          <EmptyState onPick={handleSend} displayName={displayName} />
        )}
        <div className="space-y-4">
          {messages.map((m, idx) => {
            const isLastAssistant = m.role === "assistant" && idx === messages.length - 1;
            return (
              <MessageBubble
                key={m.id}
                message={m}
                isLast={isLastAssistant}
                onRegenerate={isLastAssistant ? regenerate : undefined}
                onRetry={m.failed ? regenerate : undefined}
              />
            );
          })}
          {isSending && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex items-center gap-2 text-xs italic text-foreground-muted">
              <ClipsIcon size={12} className="animate-pulse text-primary" /> Clips is thinking…
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border p-2.5">
        <div className="flex items-end gap-1.5">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Clips…"
            rows={1}
            className="max-h-32 min-h-[38px] resize-none bg-background text-sm"
          />
          {isSending ? (
            <button
              onClick={stopStream}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-danger/10 text-status-danger hover:bg-status-danger/20"
              aria-label="Stop"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || !conversationId}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={14} />
            </button>
          )}
        </div>
      </div>

      <MemoryPanel open={memoryOpen} onOpenChange={setMemoryOpen} />
    </div>
  );
}
