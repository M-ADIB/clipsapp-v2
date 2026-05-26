/**
 * useShareLinks — create and revoke guest review links.
 *
 * Supports three scopes:
 *   - 'video'  → share a single video (target_ids = [])
 *   - 'videos' → share a custom selection of videos (target_ids[])
 *   - 'cycle'  → share an entire cycle (cycle_id, target_ids = [])
 *
 * Permissions are stored as flat columns (allow_download, allow_comments)
 * AND mirrored into the legacy `permissions` jsonb so older readers keep
 * working.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ShareScope = "video" | "videos" | "cycle";

/* ─── Types ────────────────────────────────────────────────────────── */

export interface CreateShareLinkInput {
  scope: ShareScope;
  videoId?: string | null;
  videoIds?: string[];
  cycleId?: string | null;
  projectId?: string | null;
  allowDownload: boolean;
  allowComments: boolean;
  /** ms from now until expiry, or null for "never". */
  expiresInMs: number | null;
  /** If true, guest must enter name + email before viewing. */
  requireEmail?: boolean;
  /** Video title — used to build a short, readable URL slug. */
  videoTitle?: string | null;
}

export interface CreateShareLinkResult {
  id: string;
  token: string;
  url: string;
}

/* ─── URL helpers ──────────────────────────────────────────────────── */

/**
 * Build a short, readable slug from a video title + token suffix.
 * e.g. "My Amazing Video" → "my-amazing-video-a1b2c3"
 */
function slugify(title: string, tokenSuffix: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40); // cap length
  return slug ? `${slug}-${tokenSuffix}` : tokenSuffix;
}

export function buildShareUrl(token: string, scope: ShareScope): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const path =
    scope === "cycle"
      ? `/r/cycle/${token}`
      : scope === "videos"
        ? `/r/videos/${token}`
        : `/r/${token}`;
  return `${base}${path}`;
}

/* ─── Query keys ───────────────────────────────────────────────────── */

export const shareLinksKeys = {
  all: ["share-links"] as const,
  forVideo: (videoId: string) => [...shareLinksKeys.all, "video", videoId] as const,
};

/* ─── Create a share link ──────────────────────────────────────────── */

export function useCreateShareLink() {
  const queryClient = useQueryClient();
  const { user, tenantId } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateShareLinkInput): Promise<CreateShareLinkResult> => {
      if (!user) throw new Error("You must be signed in to share");
      if (!tenantId) throw new Error("No workspace selected");

      const expiresAt =
        input.expiresInMs === null
          ? // ~10 years out for "never"
            new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString()
          : new Date(Date.now() + input.expiresInMs).toISOString();

      const targetIds = input.scope === "videos" ? (input.videoIds ?? []) : [];

      const payload = {
        tenant_id: tenantId,
        created_by: user.id,
        scope: input.scope,
        video_id: input.scope === "video" ? (input.videoId ?? null) : null,
        cycle_id: input.scope === "cycle" ? (input.cycleId ?? null) : null,
        project_id: input.projectId ?? null,
        target_ids: targetIds,
        allow_download: input.allowDownload,
        allow_comments: input.allowComments,
        expires_at: expiresAt,
        is_active: true,
        require_email: input.requireEmail ?? false,
        permissions: {
          allow_download: input.allowDownload,
          allow_comments: input.allowComments,
        },
      };

      const { data, error } = await supabase
        .from("guest_review_links")
        .insert(payload as never)
        .select("id, token")
        .single();
      if (error) throw error;

      // Build a short, readable URL from the video title if available
      let urlToken = data.token as string;
      if (input.videoTitle && input.scope === "video") {
        // Use last 6 chars of token for uniqueness
        const shortSuffix = (data.token as string).slice(-6);
        urlToken = slugify(input.videoTitle, shortSuffix);
      }

      return {
        id: data.id,
        token: data.token,
        url: buildShareUrl(urlToken, input.scope),
      };
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: shareLinksKeys.all });
      if (input.videoId) {
        queryClient.invalidateQueries({
          queryKey: shareLinksKeys.forVideo(input.videoId),
        });
      }
    },
  });
}

/* ─── Revoke a share link ──────────────────────────────────────────── */

export function useRevokeShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, videoId }: { linkId: string; videoId?: string | null }) => {
      const { error } = await supabase
        .from("guest_review_links")
        .update({ is_active: false } as never)
        .eq("id", linkId);
      if (error) throw error;
      return { linkId, videoId };
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: shareLinksKeys.all });
      if (vars.videoId) {
        queryClient.invalidateQueries({
          queryKey: shareLinksKeys.forVideo(vars.videoId),
        });
      }
    },
  });
}

/* ─── URL builder export (for use in copy buttons) ─────────────── */
export { slugify };
