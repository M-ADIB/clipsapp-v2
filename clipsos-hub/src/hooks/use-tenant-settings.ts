import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TenantSettings {
  app_name?: string;
  dev_mode?: boolean;
  slack_webhook_url?: string;
  resend_api_key?: string;
  resend_from_email?: string;
  stripe_public_key?: string;
  stripe_secret_key?: string;
  stripe_webhook_secret?: string;
  [key: string]: any;
}

export function useTenantSettings() {
  const { tenantId, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tenant-settings", tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID");
      const { data, error } = await supabase
        .from("tenants")
        .select("settings")
        .eq("id", tenantId)
        .single();

      if (error) throw error;
      return (data?.settings || {}) as TenantSettings;
    },
    enabled: isAuthenticated && !!tenantId,
  });

  const mutation = useMutation({
    mutationFn: async (newSettings: TenantSettings) => {
      if (!tenantId) throw new Error("No tenant ID");

      // Fetch current settings to merge
      const { data: current, error: fetchError } = await supabase
        .from("tenants")
        .select("settings")
        .eq("id", tenantId)
        .single();

      if (fetchError) throw fetchError;

      const currentSettings =
        current?.settings &&
        typeof current.settings === "object" &&
        !Array.isArray(current.settings)
          ? (current.settings as Record<string, unknown>)
          : {};

      const mergedSettings = {
        ...currentSettings,
        ...newSettings,
      };

      const { data, error } = await supabase
        .from("tenants")
        .update({ settings: mergedSettings })
        .eq("id", tenantId)
        .select("settings")
        .single();

      if (error) throw error;
      return data.settings as TenantSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tenant-settings", tenantId], data);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    updateSettings: mutation.mutateAsync,
  };
}
