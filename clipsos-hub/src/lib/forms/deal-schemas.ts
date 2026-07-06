import { z } from "zod";

export const STAGES = [
  "Pre-Booking Seat",
  "Payment Pending",
  "Closed/Paid",
  "Ghosted",
  "No Stage",
] as const;

export const REGIONS = ["UAE", "KSA", "USA", "UK", "EU", "Other"] as const;

/**
 * Schema for the create/edit CRM deal dialogs. Only the deal name is required;
 * everything else is optional. totalVideos is kept as a string in the form
 * (native number input) and parsed on submit, matching the previous behaviour.
 */
export const dealSchema = z.object({
  name: z.string().trim().min(1, "Deal name is required"),
  // Optional fields are plain strings (empty allowed); the forms supply "" as
  // the default value. Using z.string() rather than .optional().default()
  // keeps the zod input/output types aligned for react-hook-form's generics.
  personId: z.string(),
  plan: z.string(),
  stage: z.string().min(1),
  region: z.string().min(1),
  totalVideos: z.string(),
  notes: z.string(),
});

export type DealFormValues = z.infer<typeof dealSchema>;
