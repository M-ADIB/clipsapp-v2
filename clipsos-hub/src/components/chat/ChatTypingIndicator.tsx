/**
 * ChatTypingIndicator — "X is typing…" animation.
 */

interface ChatTypingIndicatorProps {
  names: string[];
}

export function ChatTypingIndicator({ names }: ChatTypingIndicatorProps) {
  if (names.length === 0) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-foreground-muted">
      <div className="flex gap-0.5">
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
      </div>
      <span>{label}</span>
    </div>
  );
}
