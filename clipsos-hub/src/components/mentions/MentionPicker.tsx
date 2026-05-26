/**
 * MentionPicker — Floating ARIA-compliant listbox for @mention suggestions.
 *
 * Shows avatar, name, and role badge for each user candidate.
 * Keyboard navigation is handled by the parent MentionTextarea;
 * this component only renders the list and handles pointer events.
 */
import { AtSign, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MentionUser } from "@/hooks/use-mention";
import { getMentionDisplayName } from "@/hooks/use-mention";

interface MentionPickerProps {
  users: MentionUser[];
  query: string;
  activeIndex: number;
  onSelect: (user: MentionUser) => void;
  onHover: (index: number) => void;
  instanceId: string;
  /** Position the picker above (default) or below the textarea. */
  position?: "above" | "below";
}

/** Role label formatting. */
function formatRole(role: string | null): string {
  if (!role) return "";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get initials from name for avatar fallback. */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MentionPicker({
  users,
  query,
  activeIndex,
  onSelect,
  onHover,
  instanceId,
  position = "above",
}: MentionPickerProps) {
  if (users.length === 0) return null;

  const listboxId = `${instanceId}-mention-listbox`;
  const optionId = (idx: number) => `${instanceId}-mention-opt-${idx}`;

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label="Mention suggestions"
      className={cn(
        "absolute left-0 right-0 z-50 max-h-52 overflow-y-auto rounded-lg border border-border bg-popover shadow-xl",
        "scrollbar-thin",
        position === "above" ? "bottom-full mb-1" : "top-full mt-1",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/60">
        <AtSign className="h-3 w-3 text-foreground-muted" />
        <span className="text-[11px] font-medium text-foreground-muted uppercase tracking-wide">
          Mention someone
        </span>
        {query && <span className="ml-auto text-[11px] text-foreground-subtle">"{query}"</span>}
      </div>

      {/* User list */}
      {users.map((user, idx) => {
        const name = getMentionDisplayName(user);
        const isActive = idx === activeIndex;
        const role = formatRole(user.role);

        return (
          <button
            key={user.id}
            id={optionId(idx)}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => onSelect(user)}
            onPointerEnter={() => onHover(idx)}
            className={cn(
              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
              isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
            )}
            tabIndex={-1}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={user.avatar_url ?? undefined} alt={name} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            <span className="truncate font-medium">{name}</span>

            {role && (
              <span className="ml-auto shrink-0 rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-foreground-muted">
                {role}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Re-export listbox/option ID generators for ARIA wiring
export function getMentionListboxId(instanceId: string): string {
  return `${instanceId}-mention-listbox`;
}

export function getMentionOptionId(instanceId: string, idx: number): string {
  return `${instanceId}-mention-opt-${idx}`;
}
