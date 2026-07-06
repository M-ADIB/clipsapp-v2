import { z } from "zod";

/**
 * Zod schemas for the auth forms. Kept separate from the components so the
 * validation rules are pure and unit-testable. This is the reference pattern
 * for migrating the remaining hand-rolled forms to react-hook-form + zod.
 */
const emailField = z.string().min(1, "Email is required").email("Enter a valid email");

export const passwordLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;

export const magicLinkSchema = z.object({
  email: emailField,
});

export type MagicLinkValues = z.infer<typeof magicLinkSchema>;
