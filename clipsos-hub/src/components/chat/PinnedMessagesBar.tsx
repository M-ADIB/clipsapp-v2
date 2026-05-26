/**
 * PinnedMessagesBar — collapsible bar showing pinned messages at the top of ChatMessageArea.
 *
 * - Shows "📌 X pinned messages" header with expand toggle
 * - Expanded: shows list with sender, preview, jump-to, and unpin actions
 * - Only shows unpin button for owner/manager/senior_editor
 */
import { useState } from "react";
import { Pin, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { PinnedMessage } from "@/hooks/use-chat";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface PinnedMessagesBarProps {
  pinnedMessages: PinnedMessage[];
  onUnpin: (messageId: string) => void;
  onJumpTo?: (messageId: string) => void;
  isUnpinning?: boolean;
}

export function PinnedMessagesBar({
  pinnedMessages,
  onUnpin,
  onJumpTo,
  isUnpinning,
}: PinnedMessagesBarProps) {
  const [expanded, setExpanded] = useState(false);
  const { role } = useAuth();

  if (!pinnedMessages.length) return null;

  const canUnpin = ["owner", "manager", "senior_editor"].includes(role ?? "");

  return (
    <div className="border-b border-border-subtle bg-surface-card/40 backdrop-blur-sm">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-surface-card/60 transition-colors"
      >
        <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <span className="text-xs font-semibold text-foreground">
          {pinnedMessages.length} pinned message{pinnedMessages.length !== 1 ? "s" : ""}
        </span>
        {pinnedMessages.length === 1 && (
          <span className="text-xs text-foreground-subtle truncate min-w-0 flex-1">
            — {pinnedMessages[0].message?.content?.slice(0, 60) ?? "Attachment"}
          </span>
        )}
        <div className="shrink-0 ml-auto">
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-foreground-subtle" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-foreground-subtle" />
          )}
        </div>
      </button>

      {/* Expanded list */}
      {expanded && (
        <div className="max-h-48 overflow-y-auto border-t border-border-subtle/50">
          {pinnedMessages.map((pin) => {
            const sender = pin.message?.sender;
            return (
              <div
                key={pin.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-2.5 hover:bg-surface-card/60 transition-colors",
                  "border-b border-border-subtle/30 last:border-b-0",
                )}
              >
                <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                  <AvatarImage src={sender?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {getInitials(sender?.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {sender?.full_name ?? "Unknown"}
                    </span>
                    <span className="text-[10px] text-foreground-subtle">
                      {new Date(pin.message?.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className="text-xs text-foreground-subtle line-clamp-2 mt-0.5 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => onJumpTo?.(pin.message_id)}
                  >
                    {pin.message?.content || "Attachment"}
                  </p>
                </div>

                {canUnpin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-foreground-subtle hover:text-destructive"
                    onClick={() => onUnpin(pin.message_id)}
                    disabled={isUnpinning}
                    aria-label="Unpin message"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
