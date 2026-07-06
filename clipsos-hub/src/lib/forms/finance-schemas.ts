import { z } from "zod";

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "wire", label: "Wire Transfer" },
  { value: "other", label: "Other" },
] as const;

export const PAYMENT_CATEGORIES = [
  { value: "service_fee", label: "Service Fee" },
  { value: "retainer", label: "Retainer" },
  { value: "project_fee", label: "Project Fee" },
  { value: "setup_fee", label: "Setup Fee" },
  { value: "bonus", label: "Bonus" },
  { value: "other", label: "Other" },
] as const;

/**
 * Schema for the record/edit manual-payment dialog. Client required; amount is
 * a string (native number input) that must parse to a positive number.
 */
export const recordPaymentSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  amount: z.string().refine((v) => {
    const n = parseFloat(v);
    return !Number.isNaN(n) && n > 0;
  }, "Enter a valid amount"),
  paymentMethod: z.string(),
  category: z.string(),
  paymentDate: z.string(),
  notes: z.string(),
});

export type RecordPaymentValues = z.infer<typeof recordPaymentSchema>;

/** Schema for the operating-cost add/edit dialog. Name + amount required. */
export const costSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.string(),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string(),
  isRecurring: z.boolean(),
  recurrence: z.string(),
  nextDate: z.string(),
  credEmail: z.string(),
  notes: z.string(),
});

export type CostFormValues = z.infer<typeof costSchema>;

/** Schema for the Stripe payment-link dialog. */
export const paymentLinkSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  amount: z.string().refine((v) => {
    const n = parseFloat(v);
    return !Number.isNaN(n) && n > 0;
  }, "Enter a valid amount"),
  currency: z.string(),
  description: z.string(),
});

export type PaymentLinkValues = z.infer<typeof paymentLinkSchema>;
