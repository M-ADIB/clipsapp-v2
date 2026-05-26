/**
 * MessageBubble — renders a single Ask Clips chat message.
 *
 * - User messages: right-aligned primary bubble.
 * - Assistant messages: left-aligned with sparkle avatar, markdown body,
 *   live tool pills (during stream) or persisted tool labels (post-stream),
 *   and copy/regenerate hover actions.
 */
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { ClipsMessage, ClipsToolEvent } from "@/hooks/use-clips-chat";
import { MessageActions } from "./MessageActions";
import { ToolPill } from "./ToolPill";

interface Props {
  message: ClipsMessage;
  isLast?: boolean;
  onRegenerate?: () => void;
  onRetry?: () => void;
}

export function MessageBubble({ message, isLast, onRegenerate, onRetry }: Props) {
  if (message.role === "user") {
    return (
      <div className="group flex flex-col items-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          {message.content}
        </div>
        <MessageActions role="user" content={message.content} />
      </div>
    );
  }

  const liveEvents: ClipsToolEvent[] | undefined = message.toolEvents;
  const persistedCalls = (message.tool_calls as { calls?: string[] } | undefined)?.calls;

  return (
    <div className="group flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20">
        <Sparkles
          size={14}
          className={message.streaming ? "animate-pulse text-primary" : "text-primary"}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {liveEvents && liveEvents.length > 0 && (
          <div className="space-y-1">
            {liveEvents.map((e, i) => (
              <ToolPill key={i} event={e} />
            ))}
          </div>
        )}
        {!liveEvents && persistedCalls && persistedCalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {persistedCalls.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-foreground-muted"
              >
                <Check size={10} /> {c.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-table:my-2 prose-pre:my-2 prose-pre:bg-muted prose-pre:text-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
            }}
          >
            {message.content || (message.streaming ? "…" : "")}
          </ReactMarkdown>
        </div>

        {message.failed && (
          <div className="flex items-center gap-2 text-xs text-status-danger">
            <span>Message failed.</span>
            {onRetry && (
              <button onClick={onRetry} className="underline hover:no-underline">
                Retry
              </button>
            )}
          </div>
        )}

        {!message.streaming && !message.failed && message.content && (
          <MessageActions
            role="assistant"
            content={message.content}
            isLast={isLast}
            onRegenerate={onRegenerate}
          />
        )}
      </div>
    </div>
  );
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ inline, className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  if (inline) return <code className={className}>{children}</code>;

  const text = String(children).replace(/\n$/, "");
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Code copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group/code relative">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-border bg-background/80 p-1.5 text-foreground-muted opacity-0 transition-opacity hover:text-foreground group-hover/code:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
      <pre className="overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
