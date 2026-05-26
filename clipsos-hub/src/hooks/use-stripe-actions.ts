/**
 * useStripeActions — mutations that call the stripe-actions Edge Function.
 *
 * Actions: create-payment-link, create-subscription, cancel-subscription,
 *          list-products, record-payment.
 *
 * All requests are authenticated via the user's JWT.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "./query-keys";

const FUNCTION_NAME = "stripe-actions";

async function callStripeAction<T = unknown>(action: string, payload: object = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message ?? "stripe-actions call failed");
  if (data && !data.success) throw new Error(data.error ?? "Action failed");
  return data.data as T;
}

// ── Create Payment Link ─────────────────────────────────────────────────────

export interface CreatePaymentLinkInput {
  client_id: string;
  amount: number; // in cents
  currency?: string;
  description?: string;
}

export interface PaymentLinkResult {
  payment_link_url: string;
  payment_link_id: string;
  stripe_customer_id: string;
}

export function useCreatePaymentLink() {
  return useMutation({
    mutationFn: (input: CreatePaymentLinkInput) =>
      callStripeAction<PaymentLinkResult>("create-payment-link", input),
  });
}

// ── Create Subscription ─────────────────────────────────────────────────────

export interface CreateSubscriptionInput {
  client_id: string;
  price_id?: string;
  amount?: number; // in cents, if no price_id
  currency?: string;
  interval?: "month" | "year";
  plan_name?: string;
}

export interface SubscriptionResult {
  subscription_id: string;
  status: string;
  client_secret: string | null;
  stripe_customer_id: string;
}

export function useCreateSubscription() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) =>
      callStripeAction<SubscriptionResult>("create-subscription", input),
    onSuccess: () => {
      if (tenantId) {
        qc.invalidateQueries({ queryKey: queryKeys.finance.subscriptions(tenantId) });
      }
    },
  });
}

// ── Cancel Subscription ─────────────────────────────────────────────────────

export function useCancelSubscription() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) =>
      callStripeAction("cancel-subscription", { subscription_id: subscriptionId }),
    onSuccess: () => {
      if (tenantId) {
        qc.invalidateQueries({ queryKey: queryKeys.finance.subscriptions(tenantId) });
      }
    },
  });
}

// ── List Products ───────────────────────────────────────────────────────────

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
}

interface StripePrice {
  id: string;
  product_id: string;
  product_name: string | null;
  unit_amount: number;
  currency: string;
  interval: string | null;
  nickname: string | null;
}

export interface StripeProductsResult {
  products: StripeProduct[];
  prices: StripePrice[];
}

export function useStripeProducts() {
  return useQuery({
    queryKey: ["stripe", "products"],
    queryFn: () => callStripeAction<StripeProductsResult>("list-products"),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ── Record Manual Payment ───────────────────────────────────────────────────

export interface RecordPaymentInput {
  client_id: string;
  amount: number; // in AED (not cents — manual payments)
  currency?: string;
  transaction_type?: string;
  category?: string;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
}

export function useRecordPayment() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordPaymentInput) => callStripeAction("record-payment", input),
    onSuccess: () => {
      if (tenantId) {
        qc.invalidateQueries({ queryKey: queryKeys.finance.transactions(tenantId) });
        qc.invalidateQueries({ queryKey: queryKeys.finance.charges(tenantId) });
      }
    },
  });
}

// ── Create Customer Portal Session ──────────────────────────────────────────

export interface CreatePortalSessionInput {
  client_id: string;
  return_url?: string;
}

export interface PortalSessionResult {
  url: string;
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: (input: CreatePortalSessionInput) =>
      callStripeAction<PortalSessionResult>("create-portal-session", input),
  });
}
