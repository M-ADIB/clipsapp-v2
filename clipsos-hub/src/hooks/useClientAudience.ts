/**
 * useClientAudience — CRUD hook for client_audience_avatars.
 *
 * Provides:
 * - avatars list (sorted by order_index)
 * - createAvatar, updateAvatar, deleteAvatar mutations
 *
 * Note: Uses `as any` casts because client_audience_avatars was added
 * after the last type generation. Regenerate types to remove casts.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AudienceAvatar {
  id: string;
  tenant_id: string;
  client_id: string;
  name: string;
  emoji: string;
  age_range: string | null;
  location: string | null;
  income: string | null;
  occupation: string | null;
  fears_pains: string[];
  desires_goals: string[];
  blockers: string[];
  phrases: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export function useClientAudience(clientId: string | null | undefined) {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["client-audience", clientId];

  const { data: avatars = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await (supabase as any)
        .from("client_audience_avatars")
        .select("*")
        .eq("client_id", clientId)
        .order("order_index");
      if (error) throw error;
      return (data ?? []) as AudienceAvatar[];
    },
    enabled: !!clientId,
  });

  const createAvatar = useMutation({
    mutationFn: async (name?: string) => {
      if (!clientId || !tenantId) throw new Error("Missing client or tenant");
      const { data, error } = await (supabase as any)
        .from("client_audience_avatars")
        .insert({
          tenant_id: tenantId,
          client_id: clientId,
          name: name ?? "New Avatar",
          order_index: avatars.length,
        })
        .select()
        .single();
      if (error) throw error;
      return data as AudienceAvatar;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Avatar created");
    },
    onError: (err: Error) => toast.error("Failed to create avatar", { description: err.message }),
  });

  const updateAvatar = useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: Record<string, unknown> }) => {
      const { error } = await (supabase as any)
        .from("client_audience_avatars")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (err: Error) => toast.error("Save failed", { description: err.message }),
  });

  const deleteAvatar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("client_audience_avatars")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Avatar deleted");
    },
    onError: (err: Error) => toast.error("Delete failed", { description: err.message }),
  });

  return {
    avatars,
    isLoading,
    createAvatar,
    updateAvatar,
    deleteAvatar,
  };
}
