import { z } from "zod";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Schema for the create-client dialog. Mirrors the previous manual validation:
 * name required, email valid only if provided, videos_per_month numeric if
 * provided. Optional fields stay as strings (empty allowed) so the zod
 * input/output types line up with react-hook-form.
 */
export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required"),
  email: z.string().refine((v) => v === "" || EMAIL_RE.test(v), "Invalid email address"),
  workspace_type: z.enum(["individual", "company"]),
  account_status: z.enum(["onboarding", "active", "trial"]),
  industry: z.string(),
  videos_per_month: z
    .string()
    .refine((v) => v === "" || !Number.isNaN(Number(v)), "Must be a number"),
  description: z.string(),
});

export type CreateClientValues = z.infer<typeof createClientSchema>;
