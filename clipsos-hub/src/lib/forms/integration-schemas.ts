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
