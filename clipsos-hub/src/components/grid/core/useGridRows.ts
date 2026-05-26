/**
 * useGridRows — fetches videos for the given scope plus all
 * custom_column_values + video_editors and stitches them into GridRow shape.
 *
 * Supports server-side pagination via the optional `pagination` param.
 * When omitted the hook falls back to fetching the entire scope (used for
 * client-scoped grids which are small enough that one fetch is fine).
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import type { GridRow, GridScope } from "./types";

export interface GridPagination {
  page: number; // 0-based
  pageSize: number; // rows per page (e.g. 25)
}

export const gridRowsKey = (tenantId: string, scope: GridScope, pagination?: GridPagination) =>
  [
    "grid",
    "rows",
    tenantId,
    scope.clientId ?? "all",
    scope.projectId ?? "all",
    scope.cycleId ?? "all",
    pagination?.page ?? "all",
    pagination?.pageSize ?? "all",
  ] as const;

export function useGridRows(scope: GridScope, pagination?: GridPagination) {
  const { tenantId } = useAuth();

  const videosQuery = useQuery({
    queryKey: gridRowsKey(tenantId ?? "", scope, pagination),
    queryFn: async () => {
      let q = supabase
        .from("videos")
        .select(
          `
          *,
          status:statuses!videos_status_id_fkey(id, display_name, slug, color),
          video_type:video_types!videos_video_type_id_fkey(id, display_name, slug),
          client:clients!videos_client_id_fkey(id, name),
          project:projects!videos_project_id_fkey(id, project_name)
        `,
          // Ask Supabase to include the total row count so we can compute page count
          { count: "exact" },
        )
        .eq("tenant_id", tenantId!)
        .is("archived_at", null);

      if (scope.clientId) q = q.eq("client_id", scope.clientId);
      if (scope.cycleId === "none") {
        // Sentinel: show only videos with no cycle assigned
        if (scope.projectId) q = q.eq("project_id", scope.projectId);
        q = q.is("cycle_id", null);
      } else if (scope.cycleId) {
        q = q.eq("cycle_id", scope.cycleId);
      } else {
        if (scope.projectId) q = q.eq("project_id", scope.projectId);
      }

      q = q.order("order_index", { ascending: true });

      // Server-side slice — only when pagination is provided
      if (pagination) {
        const from = pagination.page * pagination.pageSize;
        const to = from + pagination.pageSize - 1;
        q = q.range(from, to);
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
    enabled: !!tenantId,
    // Keep previous page data visible while the next page is loading
    placeholderData: (prev) => prev,
  });

  const videoIds = useMemo(
    () => (videosQuery.data?.data ?? []).map((v) => v.id),
    [videosQuery.data],
  );

  const valuesQuery = useQuery({
    queryKey: ["grid", "values", tenantId ?? "", videoIds],
    queryFn: async () => {
      if (videoIds.length === 0) return [];
      const { data, error } = await supabase
        .from("custom_column_values")
        .select("video_id, column_id, value")
        .in("video_id", videoIds);
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && videoIds.length > 0,
  });

  const editorsQuery = useQuery({
    queryKey: ["grid", "video_editors", tenantId ?? "", videoIds],
    queryFn: async () => {
      if (videoIds.length === 0) return [];
      const { data, error } = await supabase
        .from("video_editors")
        .select("video_id, editor_id")
        .in("video_id", videoIds);
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && videoIds.length > 0,
  });

  const commentsQuery = useQuery({
    queryKey: ["grid", "video_comments_count", tenantId ?? "", videoIds],
    queryFn: async () => {
      if (videoIds.length === 0) return [];
      const { data, error } = await supabase
        .from("video_comments")
        .select("video_id, comment_type")
        .in("video_id", videoIds);
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && videoIds.length > 0,
  });

  const rows = useMemo<GridRow[]>(() => {
    const videos = videosQuery.data?.data ?? [];
    const values = valuesQuery.data ?? [];
    const editors = editorsQuery.data ?? [];
    const comments = commentsQuery.data ?? [];

    const customByVideo = new Map<string, Record<string, string | null>>();
    for (const v of values) {
      const existing = customByVideo.get(v.video_id) ?? {};
      existing[`custom:${v.column_id}`] = v.value;
      customByVideo.set(v.video_id, existing);
    }

    const editorsByVideo = new Map<string, string[]>();
    for (const e of editors) {
      if (!e.video_id) continue;
      const arr = editorsByVideo.get(e.video_id) ?? [];
      arr.push(e.editor_id);
      editorsByVideo.set(e.video_id, arr);
    }

    const commentCountByVideo = new Map<string, number>();
    for (const c of comments) {
      if (!c.video_id) continue;
      if (c.comment_type === "thumbnail") continue; // Exclude thumbnail comments
      const count = commentCountByVideo.get(c.video_id) ?? 0;
      commentCountByVideo.set(c.video_id, count + 1);
    }

    return videos.map((v) => {
      const data: Record<string, unknown> = { ...v };
      data.client = (v as { client?: { name?: string } | null }).client?.name ?? null;
      data.project =
        (v as { project?: { project_name?: string } | null }).project?.project_name ?? null;
      data.editors = editorsByVideo.get(v.id) ?? [];
      data.review = {
        commentCount: commentCountByVideo.get(v.id) ?? 0,
        status: v.status ? (v.status as { slug?: string | null }).slug : null,
      };
      return {
        id: v.id,
        data,
        custom: customByVideo.get(v.id) ?? {},
      };
    });
  }, [videosQuery.data, valuesQuery.data, editorsQuery.data, commentsQuery.data]);

  return {
    rows,
    totalCount: videosQuery.data?.count ?? 0,
    isLoading: videosQuery.isLoading || (!!videoIds.length && commentsQuery.isLoading),
    isFetching: videosQuery.isFetching,
    isError: videosQuery.isError,
    error: videosQuery.error,
  };
}
