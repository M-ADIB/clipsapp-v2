/**
 * useUploadHistory — TanStack Query hook for upload session history.
 *
 * Queries `upload_sessions` ordered by `created_at DESC` with pagination
 * and optional status filtering. Joins profile data for the uploader.
 * RLS handles tenant scoping automatically.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/hooks/query-keys";

// ── Types ───────────────────────────────────────────────────────────

export type UploadHistoryStatus = "all" | "completed" | "failed" | "in_progress" | "cancelled";

export interface UploadSessionProfile {
  full_name: string | null;
  avatar_url: string | null;
}

export interface UploadSessionRow {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  overall_status: string;
  stream_status: string;
  r2_status: string;
  r2_parts_completed: number;
  r2_parts_total: number;
  created_at: string;
  completed_at: string | null;
  created_by: string | null;
  /** Joined from profiles table */
  uploader: UploadSessionProfile | null;
}

export interface UseUploadHistoryOptions {
  /** Filter by overall_status category */
  statusFilter?: UploadHistoryStatus;
  /** Page number (0-indexed) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Enable/disable the query */
  enabled?: boolean;
}

// ── Status filter mapping ───────────────────────────────────────────

const STATUS_FILTER_MAP: Record<UploadHistoryStatus, string[] | null> = {
  all: null,
  completed: ["completed"],
  failed: ["failed"],
  cancelled: ["cancelled"],
  in_progress: ["uploading", "initializing", "processing", "pending"],
};

// ── Page size ───────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20;

// ── Hook ────────────────────────────────────────────────────────────

export function useUploadHistory(options: UseUploadHistoryOptions = {}) {
  const { tenantId } = useAuth();
  const { statusFilter = "all", page = 0, pageSize = DEFAULT_PAGE_SIZE, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.uploadSessions.list(tenantId ?? "", {
      statusFilter,
      page,
      pageSize,
    }),
    queryFn: async (): Promise<{
      data: UploadSessionRow[];
      count: number;
    }> => {
      // Build query
      let query = supabase
        .from("upload_sessions")
        .select(
          "id, file_name, file_size, mime_type, overall_status, stream_status, r2_status, r2_parts_completed, r2_parts_total, created_at, completed_at, created_by",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Apply status filter
      const statuses = STATUS_FILTER_MAP[statusFilter];
      if (statuses) {
        query = query.in("overall_status", statuses);
      }

      const { data: sessions, error, count } = await query;

      if (error) throw error;
      if (!sessions || sessions.length === 0) {
        return { data: [], count: count ?? 0 };
      }

      // Fetch uploader profiles in one batch
      const uploaderIds = [
        ...new Set(sessions.map((s) => s.created_by).filter((id): id is string => id !== null)),
      ];

      let profileMap = new Map<string, UploadSessionProfile>();

      if (uploaderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", uploaderIds);

        if (profiles) {
          profileMap = new Map(
            profiles.map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]),
          );
        }
      }

      // Merge profiles into sessions
      const enriched: UploadSessionRow[] = sessions.map((s) => ({
        ...s,
        uploader: s.created_by ? (profileMap.get(s.created_by) ?? null) : null,
      }));

      return { data: enriched, count: count ?? 0 };
    },
    enabled: enabled && !!tenantId,
    staleTime: 30_000, // 30s — upload history doesn't change rapidly
  });
}
