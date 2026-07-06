import { z } from "zod";

/**
 * Schema for the guest review-access gate (name + email). Trims inputs so the
 * value handed to onComplete/localStorage is already clean, matching the
 * previous manual trim-then-validate behaviour.
 */
export const guestGateSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address"),
});

export type GuestGateValues = z.infer<typeof guestGateSchema>;
