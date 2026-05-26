/**
 * MentionTextarea — Universal drop-in replacement for <Textarea> with @mention typeahead.
 *
 * Usage:
 *   const users = useMentionUsers();
 *   <MentionTextarea
 *     value={body}
 *     onChange={setBody}
 *     onMentionsChange={setMentionIds}
 *     users={users}
 *     placeholder="Leave a comment..."
 *   />
 *
 * Features:
 *  • Detects `@query` at cursor position via regex
 *  • Renders MentionPicker popover with filtered suggestions
 *  • Keyboard nav: ↑/↓ to navigate, Enter/Tab to select, Escape to dismiss
 *  • Inserts @DisplayName into text and tracks user IDs
 *  • ARIA: combobox + listbox pattern
 *  • Fully controlled — parent owns value state
 */
import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MentionPicker, getMentionListboxId, getMentionOptionId } from "./MentionPicker";
import type { MentionUser } from "@/hooks/use-mention";
import { getMentionHandle } from "@/hooks/use-mention";

// ── Types ───────────────────────────────────────────────────────────────────

export interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  /** Called whenever the resolved set of mentioned user IDs changes. */
  onMentionsChange: (userIds: string[]) => void;
  /** Called on Cmd/Ctrl+Enter. */
  onSubmit?: () => void;
  /** Called on plain Enter (for chat-style submit). */
  onEnterSubmit?: () => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  /** The pool of mentionable users. Pass from useMentionUsers(). */
  users: MentionUser[];
  /** Max suggestions to show. Default: 6 */
  maxSuggestions?: number;
  /** Position picker above (default) or below. */
  pickerPosition?: "above" | "below";
}

export interface MentionTextareaRef {
  focus: () => void;
  insertAtCursor: (text: string) => void;
  textarea: HTMLTextAreaElement | null;
}

// ── Regex to detect @mention query at cursor ────────────────────────────────

const MENTION_REGEX = /(?:^|\s)@([\w.\-]*)$/;

// ── Component ───────────────────────────────────────────────────────────────

export const MentionTextarea = forwardRef<MentionTextareaRef, MentionTextareaProps>(
  function MentionTextarea(
    {
      value,
      onChange,
      onMentionsChange,
      onSubmit,
      onEnterSubmit,
      placeholder,
      rows = 2,
      disabled,
      className,
      users,
      maxSuggestions = 6,
      pickerPosition = "above",
    },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [mentionedUsers, setMentionedUsers] = useState<MentionUser[]>([]);

    const instanceId = useId();

    // ── Expose imperative API ──────────────────────────────────────
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      insertAtCursor: (text: string) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const before = value.substring(0, start);
        const after = value.substring(start);
        const newValue = `${before}${text}${after}`;
        onChange(newValue);
        requestAnimationFrame(() => {
          el.focus();
          el.selectionStart = start + text.length;
          el.selectionEnd = start + text.length;
        });
      },
      textarea: textareaRef.current,
    }));

    // ── Filtered suggestions ───────────────────────────────────────
    const filteredUsers = useMemo(() => {
      if (mentionQuery == null || !users.length) return [];
      const q = mentionQuery.toLowerCase();
      return users
        .filter((u) => {
          const searchable = [u.display_name, u.full_name, u.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return q === "" || searchable.includes(q);
        })
        .slice(0, maxSuggestions);
    }, [mentionQuery, users, maxSuggestions]);

    const pickerOpen = mentionQuery != null && filteredUsers.length > 0;

    // ── Text change handler ────────────────────────────────────────
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Detect @query at cursor
        if (users.length > 0) {
          const cursor = e.target.selectionStart ?? newValue.length;
          const before = newValue.slice(0, cursor);
          const match = before.match(MENTION_REGEX);
          const nextQuery = match ? match[1] : null;
          setMentionQuery(nextQuery);
          if (nextQuery !== mentionQuery) {
            setActiveIndex(-1);
          }
        }
      },
      [onChange, users.length, mentionQuery],
    );

    // ── Insert a mention ───────────────────────────────────────────
    const insertMention = useCallback(
      (user: MentionUser) => {
        const el = textareaRef.current;
        if (!el) return;
        const cursor = el.selectionStart ?? value.length;
        const before = value.slice(0, cursor);
        const after = value.slice(cursor);
        const handle = getMentionHandle(user);

        // Replace @query with @Handle
        const replaced = before.replace(MENTION_REGEX, (match) => {
          const lead = match.startsWith(" ") ? " " : match.startsWith("\n") ? "\n" : "";
          return `${lead}@${handle} `;
        });

        const newValue = replaced + after;
        onChange(newValue);
        setMentionQuery(null);
        setActiveIndex(-1);

        // Track mentioned user
        const updated = mentionedUsers.find((u) => u.id === user.id)
          ? mentionedUsers
          : [...mentionedUsers, user];
        setMentionedUsers(updated);

        // Resolve and notify parent
        const ids = updated
          .filter((u) => {
            const h = getMentionHandle(u);
            return newValue.includes(`@${h}`);
          })
          .map((u) => u.id);
        onMentionsChange(ids);

        requestAnimationFrame(() => el.focus());
      },
      [value, onChange, mentionedUsers, onMentionsChange],
    );

    // ── Keyboard handler ───────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Mention picker navigation
        if (pickerOpen) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < filteredUsers.length - 1 ? prev + 1 : 0));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredUsers.length - 1));
            return;
          }
          if ((e.key === "Enter" || e.key === "Tab") && activeIndex >= 0) {
            e.preventDefault();
            insertMention(filteredUsers[activeIndex]);
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setMentionQuery(null);
            setActiveIndex(-1);
            return;
          }
        }

        // Submit: Cmd/Ctrl + Enter
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onSubmit?.();
          return;
        }

        // Chat-style: plain Enter (no shift)
        if (e.key === "Enter" && !e.shiftKey && onEnterSubmit) {
          e.preventDefault();
          onEnterSubmit();
          return;
        }
      },
      [pickerOpen, filteredUsers, activeIndex, insertMention, onSubmit, onEnterSubmit],
    );

    // ── Blur handler: resolve mentions on focus loss ────────────────
    const handleBlur = useCallback(() => {
      // Small delay so picker clicks register first
      setTimeout(() => {
        setMentionQuery(null);
        setActiveIndex(-1);
      }, 200);

      // Resolve which mentions are still in the text
      const ids = mentionedUsers
        .filter((u) => {
          const handle = getMentionHandle(u);
          return value.includes(`@${handle}`);
        })
        .map((u) => u.id);
      onMentionsChange(ids);
    }, [value, mentionedUsers, onMentionsChange]);

    return (
      <div className="relative">
        {/* Mention picker */}
        {pickerOpen && (
          <MentionPicker
            users={filteredUsers}
            query={mentionQuery ?? ""}
            activeIndex={activeIndex}
            onSelect={insertMention}
            onHover={setActiveIndex}
            instanceId={instanceId}
            position={pickerPosition}
          />
        )}

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn("resize-none text-sm", className)}
          role="combobox"
          aria-expanded={pickerOpen}
          aria-controls={pickerOpen ? getMentionListboxId(instanceId) : undefined}
          aria-activedescendant={
            pickerOpen && activeIndex >= 0 ? getMentionOptionId(instanceId, activeIndex) : undefined
          }
          aria-autocomplete="list"
        />
      </div>
    );
  },
);
