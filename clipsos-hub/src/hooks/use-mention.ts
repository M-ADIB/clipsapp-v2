/**
 * useMentionUsers — Global hook for @mention user suggestions.
 *
 * Wraps the existing useTeam() query to provide a consistent
 * MentionUser shape for all surfaces (video comments, thumbnail
 * comments, chat, and any future component).
 *
 * Returns [] when unauthenticated — safe for guest contexts.
 */
import { useMemo } from "react";
import { useTeam } from "./use-team";

// ── Types ───────────────────────────────────────────────────────────────────

export interface MentionUser {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  email: string | null;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useMentionUsers(): MentionUser[] {
  const { data: team } = useTeam();

  return useMemo(() => {
    if (!team?.length) return [];
    return team.map(
      (p): MentionUser => ({
        id: p.id,
        display_name: p.display_name ?? null,
        full_name: p.full_name ?? null,
        avatar_url: p.avatar_url ?? null,
        role: ((p as Record<string, unknown>).role as string | null) ?? null,
        email: p.email ?? null,
      }),
    );
  }, [team]);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the display label for a mention user (best available name). */
export function getMentionDisplayName(user: MentionUser): string {
  return user.display_name ?? user.full_name ?? user.email ?? "Unknown";
}

/** Returns a handle-safe string (no spaces) for insertion into text. */
export function getMentionHandle(user: MentionUser): string {
  const name = getMentionDisplayName(user);
  return name.replace(/\s+/g, "");
}

/**
 * Given final text and a set of mentioned users, resolve which mentions
 * are still present in the text. Useful before submitting to filter
 * out mentions the user deleted after inserting.
 */
export function resolveActiveMentions(text: string, mentionedUsers: MentionUser[]): string[] {
  return mentionedUsers
    .filter((u) => {
      const handle = getMentionHandle(u);
      return text.includes(`@${handle}`);
    })
    .map((u) => u.id);
}
