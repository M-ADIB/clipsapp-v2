/**
 * MentionRenderer — Parses text containing @mentions and highlights them.
 *
 * Usage:
 *   <MentionRenderer text="Hey @AdibBaroudi check this out" />
 *
 * Renders @Handle as highlighted inline pills (Slack/WhatsApp style).
 * - Blue text + subtle background for light/dark mode
 * - Clickable (future: open profile popover)
 */
import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface MentionRendererProps {
  /** The raw text content that may contain @Handle patterns */
  text: string;
  /** Additional class names for the outer wrapper */
  className?: string;
  /** If true, renders in a style suitable for the current user's own bubble (inverted colors) */
  isOwn?: boolean;
}

/**
 * Regex to match @Handle patterns in text.
 * Handles like "AdibBaroudi", "Dr.FatimaAnjam", "John-Doe" etc.
 * Won't match emails like user@domain.com (requires word boundary or whitespace before @)
 */
const MENTION_PATTERN = /(?:^|(?<=\s))@([\w][\w.\-]*)/g;

/**
 * Splits text into segments of plain text and @mention handles.
 */
function parseMentions(text: string): Array<{ type: "text" | "mention"; value: string }> {
  const segments: Array<{ type: "text" | "mention"; value: string }> = [];
  let lastIndex = 0;

  // Use matchAll for safe iteration
  const matches = text.matchAll(MENTION_PATTERN);
  for (const match of matches) {
    const matchStart = match.index ?? 0;
    // Include any leading whitespace that was part of the lookbehind
    const atIndex = text.lastIndexOf("@", matchStart + match[0].length - 1);

    // Add plain text before this match
    if (atIndex > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, atIndex) });
    }

    // Add the mention (full @Handle)
    const handle = match[1]; // The captured handle without @
    segments.push({ type: "mention", value: handle });

    lastIndex = atIndex + 1 + handle.length; // After @Handle
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  // If no matches at all, return original text
  if (segments.length === 0) {
    segments.push({ type: "text", value: text });
  }

  return segments;
}

/**
 * Converts a PascalCase/camelCase handle back to a display name.
 * e.g. "AdibBaroudi" → "Adib Baroudi"
 */
function handleToDisplayName(handle: string): string {
  // Insert space before each uppercase letter that follows a lowercase letter
  return handle.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
}

export function MentionRenderer({ text, className, isOwn }: MentionRendererProps) {
  const segments = parseMentions(text);
  const hasMentions = segments.some((s) => s.type === "mention");

  // Fast path — no mentions, just render plain text
  if (!hasMentions) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, i) => {
        if (segment.type === "text") {
          return <Fragment key={i}>{segment.value}</Fragment>;
        }

        const displayName = handleToDisplayName(segment.value);
        return (
          <span
            key={i}
            className={cn(
              "inline-flex items-center rounded-[4px] px-1 py-[1px] text-[0.925em] font-semibold transition-colors cursor-default",
              isOwn ? "bg-mention/30 text-mention" : "bg-mention/15 text-mention",
            )}
            title={`@${segment.value}`}
            role="link"
            tabIndex={0}
          >
            @{displayName}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Standalone helper to check if a text string contains any @mentions.
 */
export function containsMentions(text: string): boolean {
  // Use inline regex without /g flag to avoid stateful lastIndex bug
  return /(?:^|(?<=\s))@([\w][\w.\-]*)/.test(text);
}
