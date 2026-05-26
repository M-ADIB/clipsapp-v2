/**
 * useCloserRegion — Manages the authenticated closer's region settings.
 *
 * Handles reading / creating / updating the closer_regions row
 * (which stores the Calendly API key and event filter).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

/* ------------------------------------------------------------------ */
/* Query key                                                           */
/* ------------------------------------------------------------------ */

export const closerRegionKeys = {
  mine: (userId: string) => ["closerRegion", "mine", userId] as const,
};

/* ------------------------------------------------------------------ */
/* Read                                                                */
/* ------------------------------------------------------------------ */

export function useCloserRegion() {
  const { user } = useAuth();
  const uid = user?.id;
  return useQuery({
    queryKey: closerRegionKeys.mine(uid!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closer_regions")
        .select("*")
        .eq("user_id", uid!)
        .maybeSingle();
      if (error) throw error;
      return data; // null if no row exists yet
    },
    enabled: !!uid,
  });
}

/* ------------------------------------------------------------------ */
/* Upsert (create or update)                                           */
/* ------------------------------------------------------------------ */

export function useUpsertCloserRegion() {
  const { user, tenantId } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      calendly_api_key?: string;
      calendar_event_filter?: string;
      region_name?: string;
      countries?: string[];
      calendly_webhook_uri?: string;
    }) => {
      // Check if a row already exists
      const { data: existing } = await supabase
        .from("closer_regions")
        .select("id")
        .eq("user_id", uid!)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from("closer_regions")
          .update({
            ...input,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", uid!)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("closer_regions")
          .insert({
            user_id: uid!,
            tenant_id: tenantId!,
            region_name: input.region_name || "Default",
            countries: input.countries || [],
            calendly_api_key: input.calendly_api_key,
            calendar_event_filter: input.calendar_event_filter || "30 Mins Discovery Call",
            calendly_webhook_uri: input.calendly_webhook_uri,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: closerRegionKeys.mine(uid!) });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Sync trigger — calls the Edge Function                              */
/* ------------------------------------------------------------------ */

export function useSyncCalendlyEvents() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-calendly-events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Sync failed (${res.status})`);
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate calendly events cache so the calendar refreshes
      qc.invalidateQueries({ queryKey: queryKeys.calendlyEvents.list(tenantId!) });
    },
  });
}
