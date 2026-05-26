/**
 * useNotifications / useTasks — communication + task hooks.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/db-types";

// ── Notifications ───────────────────────────────────────────────────────────

export function useNotifications() {
  const { tenantId, user } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.list(tenantId!, user!.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!user,
  });
}

export function useUnreadNotificationCount() {
  const { tenantId, user } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(tenantId!, user!.id),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId!)
        .eq("user_id", user!.id)
        .eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!tenantId && !!user,
    refetchInterval: 30_000, // Poll every 30s
  });
}

export function useMarkNotificationRead() {
  const { tenantId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("tenant_id", tenantId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list(tenantId!, user!.id) });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(tenantId!, user!.id) });
    },
  });
}

// ── Tasks ────────────────────────────────────────────────────────────────────

export function useTasks(filters?: { assignedTo?: string; status?: string }) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks.list(tenantId!, filters),
    queryFn: async () => {
      let query = supabase.from("tasks").select("*").eq("tenant_id", tenantId!);
      if (filters?.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
      if (filters?.status) query = query.eq("status", filters.status);
      const { data, error } = await query.order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

export function useMyTasks() {
  const { tenantId, user } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks.byAssignee(tenantId!, user!.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("assigned_to", user!.id)
        .neq("status", "done")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!user,
  });
}

export function useCreateTask() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TablesInsert<"tasks">, "tenant_id">) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...input, tenant_id: tenantId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.list(tenantId!) });
    },
  });
}

export function useUpdateTask() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"tasks"> & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.list(tenantId!) });
    },
  });
}

// ── Activity Log ─────────────────────────────────────────────────────────────

export function useActivityLog(filters?: {
  entityType?: string;
  entityId?: string;
  limit?: number;
}) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey:
      filters?.entityType && filters?.entityId
        ? queryKeys.activityLog.byEntity(tenantId!, filters.entityType, filters.entityId)
        : queryKeys.activityLog.list(tenantId!, filters),
    queryFn: async () => {
      let query = supabase
        .from("activity_log")
        .select(
          `
          *,
          actor:profiles(id, full_name, avatar_url)
        `,
        )
        .eq("tenant_id", tenantId!);

      if (filters?.entityType === "client" && filters?.entityId) {
        query = query.or(
          `and(entity_type.eq.clients,entity_id.eq.${filters.entityId}),metadata->>client_id.eq.${filters.entityId}`,
        );
      } else {
        if (filters?.entityType) query = query.eq("entity_type", filters.entityType);
        if (filters?.entityId) query = query.eq("entity_id", filters.entityId);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(filters?.limit ?? 50);
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}
