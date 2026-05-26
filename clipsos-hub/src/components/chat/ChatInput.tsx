/**
 * ChatInput — message composer with auto-resize, file upload, voice notes,
 * rich text toolbar, @mention typeahead, and send.
 *
 * Includes:
 *  - Rich text formatting toolbar (Bold, Italic, Underline, Link, List)
 *  - @mention typeahead via global MentionTextarea
 *  - File attachment picker
 *  - Voice note recording (tap to start, tap to stop & send)
 *  - Emoji picker integration
 *  - Enter to send, Shift+Enter for newline
 */
import { useState, useRef, useCallback, type ChangeEvent } from "react";
import {
  Send,
  Paperclip,
  X,
  Mic,
  Square,
  Loader2,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  Smile,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatVoiceRecorder } from "@/hooks/use-chat-voice-recorder";
import { toast } from "sonner";

import { MentionTextarea } from "@/components/mentions";
import type { MentionTextareaRef } from "@/components/mentions";
import { useMentionUsers } from "@/hooks/use-mention";

interface ChatInputProps {
  onSend: (content: string, attachment?: File, mentionedUserIds?: string[]) => void;
  onSendVoiceNote?: (url: string, type: string, name: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "👀", "🔥", "✅", "🚀"];

export function ChatInput({ onSend, onSendVoiceNote, onTyping, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const mentionRef = useRef<MentionTextareaRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorder = useChatVoiceRecorder();
  const lastSentRef = useRef<number>(0);

  // Global mention users
  const mentionUsers = useMentionUsers();

  const SEND_COOLDOWN_MS = 500;

  const handleSend = useCallback(() => {
    const now = Date.now();
    if (now - lastSentRef.current < SEND_COOLDOWN_MS) {
      toast.info("Slow down — wait a moment", { duration: 1500 });
      return;
    }
    const trimmed = value.trim();
    if (!trimmed && !attachment) return;
    lastSentRef.current = now;
    onSend(trimmed, attachment ?? undefined, mentionedUserIds);
    setValue("");
    setAttachment(null);
    setMentionedUserIds([]);
  }, [value, attachment, mentionedUserIds, onSend]);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onTyping?.();
    },
    [onTyping],
  );

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
    // Reset so same file can be selected again
    e.target.value = "";
  }, []);

  // ── Rich text helpers ─────────────────────────────────────────────
  const wrapSelection = useCallback(
    (prefix: string, suffix: string) => {
      const el = mentionRef.current?.textarea;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = value.substring(start, end);
      const before = value.substring(0, start);
      const after = value.substring(end);
      const newValue = `${before}${prefix}${selected}${suffix}${after}`;
      setValue(newValue);
      // Restore cursor after wrap
      setTimeout(() => {
        el.focus();
        el.selectionStart = start + prefix.length;
        el.selectionEnd = end + prefix.length;
      }, 0);
    },
    [value],
  );

  const insertAtCursor = useCallback((text: string) => {
    mentionRef.current?.insertAtCursor(text);
  }, []);

  // ─── Voice note handlers ──────────────────────────────────────────
  const handleVoiceToggle = useCallback(async () => {
    if (voiceRecorder.isRecording) {
      // Stop & upload
      const result = await voiceRecorder.stop();
      if (result && onSendVoiceNote) {
        onSendVoiceNote(result.url, result.type, result.name);
      }
    } else {
      // Start recording
      await voiceRecorder.start();
    }
  }, [voiceRecorder, onSendVoiceNote]);

  const handleVoiceCancel = useCallback(() => {
    voiceRecorder.cancel();
  }, [voiceRecorder]);

  const formatRecordTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const canSend = value.trim().length > 0 || !!attachment;
  const isVoiceBusy = voiceRecorder.isUploading;

  return (
    <div className="border-t border-border-subtle bg-background">
      {/* Attachment preview */}
      {attachment && (
        <div className="mx-3 mt-2 flex items-center gap-2 rounded-lg bg-surface-card px-3 py-2 text-sm">
          <Paperclip className="h-4 w-4 text-foreground-muted shrink-0" />
          <span className="truncate text-foreground">{attachment.name}</span>
          <span className="text-foreground-subtle text-xs shrink-0">
            {(attachment.size / 1024).toFixed(0)} KB
          </span>
          <button
            onClick={() => setAttachment(null)}
            className="ml-auto text-foreground-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Voice recording state */}
      {voiceRecorder.isRecording && (
        <div className="mx-3 mt-2 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5">
          {/* Pulsing indicator */}
          <div className="relative flex h-3 w-3 items-center justify-center shrink-0">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />
            <div className="h-2 w-2 rounded-full bg-red-500" />
          </div>

          {/* Timer */}
          <span className="font-mono text-sm font-medium text-red-400">
            {formatRecordTime(voiceRecorder.duration)}
          </span>

          {/* Waveform bars */}
          <div className="flex h-4 items-end gap-0.5 flex-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-red-400/60 transition-all duration-150"
                style={{
                  height: `${4 + Math.random() * 12}px`,
                  animationDelay: `${i * 40}ms`,
                }}
              />
            ))}
          </div>

          {/* Cancel */}
          <button
            onClick={handleVoiceCancel}
            className="text-red-400/70 hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Emoji picker (quick) */}
      {showEmojiPicker && (
        <div className="mx-3 mt-2 flex items-center gap-1 rounded-lg bg-surface-card border border-border-subtle px-2 py-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                insertAtCursor(emoji);
                setShowEmojiPicker(false);
              }}
              className="rounded-md p-1.5 text-base hover:bg-surface-input transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Rich text toolbar */}
      <div className="flex items-center gap-0.5 px-3 pt-2 pb-1">
        <button
          onClick={() => wrapSelection("**", "**")}
          className="rounded-md p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
          title="Bold"
          disabled={disabled || voiceRecorder.isRecording}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => wrapSelection("_", "_")}
          className="rounded-md p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
          title="Italic"
          disabled={disabled || voiceRecorder.isRecording}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => wrapSelection("__", "__")}
          className="rounded-md p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
          title="Underline"
          disabled={disabled || voiceRecorder.isRecording}
        >
          <Underline className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-4 bg-border-subtle mx-1" />

        <button
          onClick={() => wrapSelection("[", "](url)")}
          className="rounded-md p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
          title="Link"
          disabled={disabled || voiceRecorder.isRecording}
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => insertAtCursor("\n- ")}
          className="rounded-md p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
          title="Bullet list"
          disabled={disabled || voiceRecorder.isRecording}
        >
          <List className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-4 bg-border-subtle mx-1" />

        <button
          onClick={() => insertAtCursor("@")}
          className="rounded-md p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
          title="Mention"
          disabled={disabled || voiceRecorder.isRecording}
        >
          <AtSign className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            showEmojiPicker
              ? "text-primary bg-primary/10"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-card",
          )}
          title="Emoji"
          disabled={disabled || voiceRecorder.isRecording}
        >
          <Smile className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 pb-3">
        {/* File upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-lg p-2 text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
          disabled={disabled || voiceRecorder.isRecording}
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        />

        {/* Voice note button */}
        <button
          onClick={handleVoiceToggle}
          disabled={disabled || isVoiceBusy}
          className={cn(
            "shrink-0 rounded-lg p-2 transition-colors",
            voiceRecorder.isRecording
              ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-card",
          )}
          title={voiceRecorder.isRecording ? "Stop & send voice note" : "Record voice note"}
        >
          {isVoiceBusy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : voiceRecorder.isRecording ? (
            <Square className="h-5 w-5 fill-current" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>

        {/* MentionTextarea — replaces plain textarea */}
        <div className="flex-1 min-w-0">
          <MentionTextarea
            ref={mentionRef}
            value={value}
            onChange={handleChange}
            onMentionsChange={setMentionedUserIds}
            onEnterSubmit={handleSend}
            users={mentionUsers}
            placeholder={voiceRecorder.isRecording ? "Recording voice note…" : "Type a message…"}
            rows={1}
            disabled={disabled || voiceRecorder.isRecording}
            className={cn(
              "rounded-xl bg-surface-input px-4 py-2.5",
              "border-border-subtle focus:border-primary/40",
              "scrollbar-thin",
              voiceRecorder.isRecording && "opacity-50 cursor-not-allowed",
            )}
            pickerPosition="above"
          />
        </div>

        {/* Send button */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!canSend || disabled || voiceRecorder.isRecording}
          className={cn(
            "shrink-0 h-10 w-10 rounded-xl transition-all duration-200",
            canSend
              ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
              : "bg-surface-input text-foreground-subtle",
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
