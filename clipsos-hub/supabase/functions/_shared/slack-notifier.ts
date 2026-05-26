/**
 * Shared Slack notification utility.
 * Uses the Lovable Slack connector gateway to post messages.
 * Supports channel messages, DMs, and @mentions.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/slack/api";

// ── Email → Slack User ID mapping ──────────────────────────────────────
export const SLACK_USER_MAP: Record<string, string> = {
  // Agency team (theclips.agency emails)
  "abdelwahab@theclips.agency": "U0AC1N8PYDN",
  "adam@theclips.agency": "U0947BAMBU7",
  "adib@theclips.agency": "U08US1260T1",
  "ahmad@theclips.agency": "U0A3L1EDZNE",
  "akash@theclips.agency": "U06JPGVQ29Y",
  "anan@theclips.agency": "U083X9ZCQTG",
  "anas@theclips.agency": "U0AHYBND1C2",
  "charbel@theclips.agency": "U051HF07R1C",
  "divvay@theclips.agency": "U0A0U2GCMFW",
  "hussein@theclips.agency": "U0AGZ2P3QCW",
  "iyas@theclips.agency": "U07079MEXC6",
  "lynn@theclips.agency": "U06P98NN8N5",
  "maha@theclips.agency": "U0947BC5MJB",
  "mahmoud@theclips.agency": "U07B60TU6TV",
  "mirna@theclips.agency": "U0770676GMB",
  "mohamed@theclips.agency": "U07GQM7EJ9E",
  "mrinal@theclips.agency": "U06P64H70TF",
  "nahla@theclips.agency": "U07SD5F6HAT",
  "omar@theclips.agency": "U04VBP1S6GP",
  "omeir@theclips.agency": "U04V4UV9SF2",
  "rahul@theclips.agency": "U07B8JERGMS",
  "rajat@theclips.agency": "U081973SMBL",
  "sachin@theclips.agency": "U063F8ZB2JG",
  "shahidul@theclips.agency": "U06C4BL5WCU",
  "shrijit@theclips.agency": "U06UK9ZJL3D",
  "faheem@theclips.agency": "U06K26RGM41", // alias
  "syed@theclips.agency": "U06K26RGM41",
  "umair@theclips.agency": "U06K26RFPR7",
  "yasser@theclips.agency": "U08A50PG2LR",
  "kamal@theclips.agency": "U075PR32QQ5",
  // Omar uses non-theclips emails
  "omarmeski@maven-x.com": "U04VBP1S6GP",
  "omar.messky@gmail.com": "U04VBP1S6GP",
};

// ── Types ──────────────────────────────────────────────────────────────

interface SlackNotificationParams {
  channel: string;
  text: string;
  username?: string;
  icon_emoji?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

function getKeys(): { lovableKey: string; slackKey: string } | null {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const slackKey = Deno.env.get("SLACK_API_KEY");
  if (!lovableKey || !slackKey) {
    console.warn("[slack-notifier] Missing LOVABLE_API_KEY or SLACK_API_KEY");
    return null;
  }
  return { lovableKey, slackKey };
}

function headers(lovableKey: string, slackKey: string) {
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": slackKey,
    "Content-Type": "application/json",
  };
}

// ── Channel messages ───────────────────────────────────────────────────

export async function sendSlackNotification(
  params: SlackNotificationParams,
): Promise<{ success: boolean; error?: string }> {
  const keys = getKeys();
  if (!keys) return { success: false, error: "Keys not configured" };

  try {
    const response = await fetch(`${GATEWAY_URL}/chat.postMessage`, {
      method: "POST",
      headers: headers(keys.lovableKey, keys.slackKey),
      body: JSON.stringify({
        channel: params.channel,
        text: params.text,
        username: params.username || "ClipsOS",
        icon_emoji: params.icon_emoji || ":clapper:",
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      const errMsg = data.error || `HTTP ${response.status}`;
      console.error(`[slack-notifier] Failed to send: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    console.log(`[slack-notifier] ✅ Channel message sent to ${params.channel}`);
    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[slack-notifier] Exception: ${errMsg}`);
    return { success: false, error: errMsg };
  }
}

// ── Direct Messages ───────────────────────────────────────────────────

/**
 * Send a DM to a user by their email address.
 * Looks up the Slack user ID from SLACK_USER_MAP, opens a DM channel,
 * then posts the message.
 */
export async function sendSlackDM(
  email: string,
  text: string,
  options?: { username?: string; icon_emoji?: string },
): Promise<{ success: boolean; error?: string }> {
  const keys = getKeys();
  if (!keys) return { success: false, error: "Keys not configured" };

  const slackUserId = SLACK_USER_MAP[email.toLowerCase()];
  if (!slackUserId) {
    console.warn(`[slack-notifier] No Slack ID for email: ${email}`);
    return { success: false, error: `No Slack mapping for ${email}` };
  }

  try {
    // Step 1: Open DM channel
    const openRes = await fetch(`${GATEWAY_URL}/conversations.open`, {
      method: "POST",
      headers: headers(keys.lovableKey, keys.slackKey),
      body: JSON.stringify({ users: slackUserId }),
    });
    const openData = await openRes.json();
    if (!openRes.ok || !openData.ok) {
      const errMsg = openData.error || `HTTP ${openRes.status}`;
      console.error(`[slack-notifier] conversations.open failed: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    const dmChannelId = openData.channel?.id;
    if (!dmChannelId) {
      return { success: false, error: "No DM channel returned" };
    }

    // Step 2: Post message to DM channel
    const msgRes = await fetch(`${GATEWAY_URL}/chat.postMessage`, {
      method: "POST",
      headers: headers(keys.lovableKey, keys.slackKey),
      body: JSON.stringify({
        channel: dmChannelId,
        text,
        username: options?.username || "ClipsOS",
        icon_emoji: options?.icon_emoji || ":clapper:",
      }),
    });
    const msgData = await msgRes.json();
    if (!msgRes.ok || !msgData.ok) {
      const errMsg = msgData.error || `HTTP ${msgRes.status}`;
      console.error(`[slack-notifier] DM postMessage failed: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    console.log(`[slack-notifier] ✅ DM sent to ${email} (${slackUserId})`);
    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[slack-notifier] DM exception: ${errMsg}`);
    return { success: false, error: errMsg };
  }
}

/**
 * Send DMs to multiple users by email. Best-effort, won't throw.
 */
export async function sendSlackDMBulk(
  emails: string[],
  text: string,
  options?: { username?: string; icon_emoji?: string },
): Promise<void> {
  await Promise.allSettled(emails.map((email) => sendSlackDM(email, text, options)));
}

// ── @Mention helper ───────────────────────────────────────────────────

/** Emails that have opted out of Slack @mentions in notifications. */
const MENTION_OPT_OUT: Set<string> = new Set(["sachin@theclips.agency", "iyas@theclips.agency"]);

/**
 * Returns a Slack @mention string like `<@U12345>` for use in channel messages.
 * Returns empty string if no mapping exists or user opted out.
 */
export function mentionUser(email: string): string {
  const lower = email.toLowerCase();
  if (MENTION_OPT_OUT.has(lower)) return "";
  const slackUserId = SLACK_USER_MAP[lower];
  return slackUserId ? `<@${slackUserId}>` : "";
}

/**
 * Extract a Slack channel ID from an archive URL.
 * e.g. "https://theclipsagency.slack.com/archives/C09NBNK049K" → "C09NBNK049K"
 * Returns null if URL is missing or malformed.
 */
export function extractSlackChannelId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const id = url.trim().split("/").pop();
    return id && /^[A-Z0-9]+$/i.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Channel ID constants */
export const SLACK_CHANNELS = {
  ERRORS: "C0AJU248JKG",
  CLIENT_ACTIVITY: "C0AJPMWJPM1",
  VIDEO_UPDATES: "C0AK91J7K09",
  SECURITY: "C0AK91LDYLR",
  CLIPS_APP: "C0A6P4R0SKF",
  INBOUND_LEADS: "C09H1N4VCG2",
} as const;
