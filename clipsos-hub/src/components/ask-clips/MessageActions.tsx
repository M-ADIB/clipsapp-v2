/**
 * MessageActions — tiny icon-button row that appears under each message on hover.
 *
 * User messages: copy.
 * Assistant messages: copy + (regenerate if last).
 */
import { forwardRef, useState, type ReactNode } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  role: "user" | "assistant";
  content: string;
  isLast?: boolean;
  onRegenerate?: () => void;
}

export function MessageActions({ role, content, isLast, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${
        role === "user" ? "mt-1 justify-end" : "mt-1"
      }`}
    >
      <IconBtn onClick={copy} label="Copy">
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </IconBtn>
      {role === "assistant" && isLast && onRegenerate && (
        <IconBtn onClick={onRegenerate} label="Regenerate">
          <RefreshCw size={12} />
        </IconBtn>
      )}
    </div>
  );
}

const IconBtn = forwardRef<
  HTMLButtonElement,
  { onClick: () => void; label: string; children: ReactNode }
>(({ onClick, label, children }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    aria-label={label}
    title={label}
    className="rounded-md p-1.5 text-foreground-muted transition-colors hover:bg-surface-input hover:text-foreground"
  >
    {children}
  </button>
));
IconBtn.displayName = "IconBtn";
