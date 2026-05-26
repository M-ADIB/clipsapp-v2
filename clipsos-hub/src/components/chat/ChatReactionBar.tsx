/**
 * ChatReactionBar — emoji reactions display + quick-react buttons.
 */
import { cn } from "@/lib/utils";
import { Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "👀"];
const ALL_EMOJIS = [
  "👍",
  "👎",
  "❤️",
  "🔥",
  "😂",
  "😮",
  "😢",
  "🎉",
  "👀",
  "🙌",
  "💯",
  "✅",
  "❌",
  "⭐",
  "💡",
  "🚀",
];

interface Reaction {
  emoji: string;
  user_id: string;
}

interface ChatReactionBarProps {
  reactions: Reaction[];
  currentUserId: string;
  onReact: (emoji: string) => void;
}

/** Grouped reactions below a message (emoji pills with count). */
export function ChatReactionPills({ reactions, currentUserId, onReact }: ChatReactionBarProps) {
  if (reactions.length === 0) return null;

  // Group by emoji
  const groups = new Map<string, string[]>();
  for (const r of reactions) {
    const users = groups.get(r.emoji) ?? [];
    users.push(r.user_id);
    groups.set(r.emoji, users);
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Array.from(groups.entries()).map(([emoji, users]) => {
        const isMine = users.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all duration-150",
              "hover:scale-105",
              isMine
                ? "bg-primary/15 border border-primary/30 text-foreground-strong"
                : "bg-surface-card border border-border-subtle text-foreground-muted hover:border-primary/20",
            )}
          >
            <span>{emoji}</span>
            <span className="font-medium">{users.length}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Hover action bar for adding reactions to a message. */
export function ChatReactionPicker({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="rounded-md p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-card transition-colors">
          <Smile className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-surface-card border-border" align="start" side="top">
        {/* Quick emojis */}
        <div className="flex gap-1 mb-2">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => onReact(e)}
              className="rounded-md p-1.5 text-lg hover:bg-surface-input transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
        {/* Full grid */}
        <div className="grid grid-cols-8 gap-0.5 border-t border-border-subtle pt-2">
          {ALL_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => onReact(e)}
              className="rounded p-1 text-base hover:bg-surface-input transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
