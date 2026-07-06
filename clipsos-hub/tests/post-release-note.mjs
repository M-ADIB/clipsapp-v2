/**
 * Posts the refactor release note to the team "Announcements" chat room,
 * through the app UI (so RLS, sender identity, and realtime all go through
 * the normal code path). This is the ONLY script in tests/ that writes.
 *
 * If no room named "Announcements" exists it makes NO writes — it lists the
 * available team rooms and exits non-zero so a human can pick the target.
 *
 * Usage: CLIPS_TEST_EMAIL=.. CLIPS_TEST_PASSWORD=.. BASE_URL=.. node tests/post-release-note.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const EMAIL = process.env.CLIPS_TEST_EMAIL;
const PASSWORD = process.env.CLIPS_TEST_PASSWORD;
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;

const NOTE = [
  "🛠️ Heads up team — we just shipped a big under-the-hood refactor of the app.",
  "",
  "Nothing should look or behave differently (it was cleanup, security hardening, and speed work — no feature changes), but with a change this size some weird stuff might slip through.",
  "",
  "Please be on the lookout over the next few days: broken buttons, pages not loading, odd formatting, missing data — anything strange at all, drop it in this channel right away so we can fix it fast. Thanks! 🙏",
].join("\n");

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PW_CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  proxy: PROXY ? { server: PROXY, bypass: "localhost,127.0.0.1" } : undefined,
  args: ["--ignore-certificate-errors", "--no-sandbox"],
});
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

try {
  // Sign in
  await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 45000 });
  await page.fill("#login-email", EMAIL);
  await page.fill("#login-password", PASSWORD);
  await page.click('button:has-text("Sign in"), button[type="submit"]');
  await page.waitForTimeout(5000);
  if (page.url().endsWith("/login")) throw new Error("login failed");

  // Open team chat and find the Announcements room
  await page.goto(BASE + "/owner/team-chat", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2500);

  const announcements = page.locator("text=/^announcements$/i").first();
  if (!(await announcements.count())) {
    const names = await page
      .locator('[class*="room"], [role="button"]')
      .allTextContents()
      .catch(() => []);
    console.log("FAIL: no 'Announcements' room found. Visible room-ish elements:");
    for (const n of names.slice(0, 20)) console.log("  • " + n.slice(0, 80));
    process.exit(1);
  }
  await announcements.click();
  await page.waitForTimeout(2000);

  // Type + send (Enter sends; Shift+Enter is newline, so type the note with
  // Shift+Enter for line breaks)
  const input = page.locator('textarea[placeholder*="Type a message"]').first();
  if (!(await input.count())) throw new Error("chat input not found");
  await input.click();
  const lines = NOTE.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) await page.keyboard.press("Shift+Enter");
    if (lines[i]) await page.keyboard.type(lines[i]);
  }
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3000);

  // Verify the message rendered in the thread
  const posted = await page.locator("text=under-the-hood refactor").count();
  if (!posted) throw new Error("message not visible in thread after send");
  await page.screenshot({ path: process.env.SHOT_DIR ? `${process.env.SHOT_DIR}/release-note.png` : "release-note.png" });
  console.log("PASS: release note posted to Announcements");
} catch (err) {
  console.log("FAIL: " + err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
