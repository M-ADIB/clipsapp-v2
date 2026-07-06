import { z } from "zod";

/**
 * Zod schemas for the auth forms. Kept separate from the components so the
 * validation rules are pure and unit-testable. This is the reference pattern
 * for migrating the remaining hand-rolled forms to react-hook-form + zod.
 */
export const passwordLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;
