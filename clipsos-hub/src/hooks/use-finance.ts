/**
 * useFinance — finance domain hooks (charges, subscriptions, transactions).
 * Finance data is owner-only at the RLS level.
 *
 * Realtime: stripe_charges and stripe_subscriptions tables have Supabase
 * Realtime enabled so the UI auto-refreshes when Stripe webhooks write data.
 */
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

export function useStripeCharges(filters?: { clientId?: string }) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.finance.charges(tenantId!, filters),
    queryFn: async () => {
      let query = supabase
        .from("stripe_charges")
        .select(`*, client:clients!stripe_charges_client_id_fkey(id, name)`)
        .eq("tenant_id", tenantId!);
      if (filters?.clientId) query = query.eq("client_id", filters.clientId);
      const { data, error } = await query.order("stripe_created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: 30_000, // 30s — realtime handles freshness
  });
}

export function useStripeSubscriptions() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.finance.subscriptions(tenantId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stripe_subscriptions")
        .select(`*, client:clients!stripe_subscriptions_client_id_fkey(id, name)`)
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: 30_000,
  });
}

export function useFinanceTransactions(filters?: { clientId?: string }) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.finance.transactions(tenantId!, filters),
    queryFn: async () => {
      let query = supabase
        .from("finance_transactions")
        .select(`*, client:clients!finance_transactions_client_id_fkey(id, name)`)
        .eq("tenant_id", tenantId!);
      if (filters?.clientId) query = query.eq("client_id", filters.clientId);
      const { data, error } = await query.order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

/** Combined finance for a single client (charges + subscriptions + transactions). */
export function useClientFinance(clientId: string | undefined) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: queryKeys.finance.byClient(tenantId!, clientId!),
    queryFn: async () => {
      const [charges, subs, transactions] = await Promise.all([
        supabase
          .from("stripe_charges")
          .select("*")
          .eq("tenant_id", tenantId!)
          .eq("client_id", clientId!)
          .order("stripe_created_at", { ascending: false }),
        supabase
          .from("stripe_subscriptions")
          .select("*")
          .eq("tenant_id", tenantId!)
          .eq("client_id", clientId!),
        supabase
          .from("finance_transactions")
          .select("*")
          .eq("tenant_id", tenantId!)
          .eq("client_id", clientId!)
          .order("payment_date", { ascending: false }),
      ]);
      if (charges.error) throw charges.error;
      if (subs.error) throw subs.error;
      if (transactions.error) throw transactions.error;
      return {
        charges: charges.data,
        subscriptions: subs.data,
        transactions: transactions.data,
      };
    },
    enabled: !!tenantId && !!clientId,
    staleTime: 30_000,
  });
}

/**
 * useStripeRealtimeSync — subscribes to Supabase Realtime changes on
 * stripe_charges and stripe_subscriptions, then invalidates the relevant
 * TanStack Query caches so the UI updates automatically.
 *
 * Mount this ONCE in the Finance page. It cleans up on unmount.
 */
export function useStripeRealtimeSync() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel("stripe-realtime-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stripe_charges",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          // Invalidate all finance charge queries for this tenant
          qc.invalidateQueries({ queryKey: queryKeys.finance.charges(tenantId) });
          // Also invalidate client-specific finance queries
          qc.invalidateQueries({ queryKey: queryKeys.finance.byClient(tenantId, "") });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stripe_subscriptions",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: queryKeys.finance.subscriptions(tenantId) });
          qc.invalidateQueries({ queryKey: queryKeys.finance.byClient(tenantId, "") });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);
}

export interface UpdateFinanceTransactionInput {
  id: string;
  client_id: string;
  amount: number; // in AED
  currency?: string;
  transaction_type?: string;
  category?: string;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
}

export function useUpdateFinanceTransaction() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateFinanceTransactionInput) => {
      const { id, ...data } = input;
      const { data: result, error } = await supabase
        .from("finance_transactions")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("tenant_id", tenantId!)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      if (tenantId) {
        qc.invalidateQueries({ queryKey: queryKeys.finance.transactions(tenantId) });
        qc.invalidateQueries({ queryKey: ["finance", "byClient", tenantId] });
      }
    },
  });
}

export function useDeleteFinanceTransaction() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("finance_transactions")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId!);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      if (tenantId) {
        qc.invalidateQueries({ queryKey: queryKeys.finance.transactions(tenantId) });
        qc.invalidateQueries({ queryKey: ["finance", "byClient", tenantId] });
      }
    },
  });
}
