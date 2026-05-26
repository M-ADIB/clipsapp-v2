/**
 * Global @mention system — barrel exports.
 *
 * Usage:
 *   import { MentionTextarea, useMentionUsers } from "@/components/mentions";
 */
export { MentionTextarea } from "./MentionTextarea";
export type { MentionTextareaProps, MentionTextareaRef } from "./MentionTextarea";
export { MentionPicker } from "./MentionPicker";
export { MentionRenderer, containsMentions } from "./MentionRenderer";
export {
  useMentionUsers,
  getMentionDisplayName,
  getMentionHandle,
  resolveActiveMentions,
} from "@/hooks/use-mention";
export type { MentionUser } from "@/hooks/use-mention";
