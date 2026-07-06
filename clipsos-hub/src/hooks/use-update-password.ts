/**
 * useUpdatePassword — wraps supabase.auth.updateUser for the change-password
 * flow. Shared by the per-role settings pages (previously duplicated inline
 * supabase.auth calls).
 */
import { useMutation } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
  });
}
