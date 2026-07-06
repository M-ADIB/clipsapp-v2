import { z } from "zod";

/** Slack integration settings. Empty webhook clears the config. */
export const slackSettingsSchema = z.object({
  webhookUrl: z.string(),
  notificationsEnabled: z.boolean(),
});
export type SlackSettingsValues = z.infer<typeof slackSettingsSchema>;

/** Resend integration settings. Empty key clears the config. */
export const resendSettingsSchema = z.object({
  apiKey: z.string(),
  fromEmail: z.string(),
});
export type ResendSettingsValues = z.infer<typeof resendSettingsSchema>;

/** Stripe integration settings. All keys optional (empty clears the config). */
export const stripeSettingsSchema = z.object({
  publicKey: z.string(),
  secretKey: z.string(),
  webhookSecret: z.string(),
});
export type StripeSettingsValues = z.infer<typeof stripeSettingsSchema>;

/** Calendly settings — API key required, event filter optional. */
export const calendlySettingsSchema = z.object({
  apiKey: z.string().trim().min(1, "Please enter your Calendly API key."),
  eventFilter: z.string(),
});
export type CalendlySettingsValues = z.infer<typeof calendlySettingsSchema>;
