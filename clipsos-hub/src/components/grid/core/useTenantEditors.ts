/**
 * useTenantEditors — list of users in the tenant who can be assigned as editors.
 *
 * Returns profiles with role in (editor, senior_editor) so the EditorsCell
 * can render a picker. Cached for 5 minutes.
 */
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface EditorOption {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function useTenantEditors() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["grid", "tenant_editors", tenantId],
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<EditorOption[]> => {
      const { data: roleRows, error: roleErr } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["editor", "senior_editor"]);
      if (roleErr) throw roleErr;

      const userIds = Array.from(new Set((roleRows ?? []).map((r) => r.user_id)));
      if (userIds.length === 0) return [];

      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, tenant_id")
        .in("id", userIds)
        .eq("tenant_id", tenantId!);
      if (pErr) throw pErr;

      return (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
      }));
    },
  });
}

export function useVideoEditorsMap(videoIds: string[]) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ["grid", "video_editors", tenantId, videoIds.sort().join(",")],
    enabled: !!tenantId && videoIds.length > 0,
    queryFn: async (): Promise<Record<string, string[]>> => {
      const { data, error } = await supabase
        .from("video_editors")
        .select("video_id, editor_id")
        .in("video_id", videoIds);
      if (error) throw error;
      const map: Record<string, string[]> = {};
      for (const row of data ?? []) {
        if (!row.video_id) continue;
        (map[row.video_id] ??= []).push(row.editor_id);
      }
      return map;
    },
  });
}
