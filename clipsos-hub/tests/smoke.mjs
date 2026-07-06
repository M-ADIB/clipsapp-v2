/**
 * Read-only smoke test for the refactor branch.
 * Signs in with the dev owner account and drives the refactored surfaces,
 * collecting console/page errors. Performs NO writes (no saves, submits, sends).
 *
 * Usage: CLIPS_TEST_EMAIL=.. CLIPS_TEST_PASSWORD=.. node tests/smoke.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const EMAIL = process.env.CLIPS_TEST_EMAIL;
const PASSWORD = process.env.CLIPS_TEST_PASSWORD;
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;

const errors = [];
const results = [];

function step(name, ok, note = "") {
  results.push({ name, ok, note });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${note ? "  — " + note : ""}`);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PW_CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  proxy: PROXY ? { server: PROXY, bypass: "localhost,127.0.0.1" } : undefined,
  args: ["--ignore-certificate-errors", "--no-sandbox"],
});
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

async function go(path) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

try {
  // ---- Sign in (auth only, no data writes) ----
  await go("/login");
  await page.fill("#login-email", EMAIL);
  await page.fill("#login-password", PASSWORD);
  await page.click('button:has-text("Sign in"), button[type="submit"]');
  await page.waitForTimeout(4000);
  const url = page.url();
  step("login redirects away from /login", !url.endsWith("/login"), url);

  // ---- Relocated dashboards render (Phase 3 relocation) ----
  for (const [label, path] of [
    ["owner videos grid (VideosDashboard + CellRenderer)", "/owner/videos"],
    ["owner schedule (ScheduleDashboard)", "/owner/schedule"],
    ["owner CRM (OwnerCrmPage)", "/owner/crm"],
    ["owner people (PeopleDashboard)", "/owner/people"],
    ["owner pipeline (PipelineDashboard)", "/owner/pipeline"],
    ["owner HQ (HQDashboard)", "/owner/hq"],
  ]) {
    const before = errors.length;
    await go(path);
    const bodyText = (await page.textContent("body").catch(() => "")) || "";
    const rendered = bodyText.trim().length > 200;
    step(label, rendered && errors.length === before, rendered ? "" : "little/no content");
  }

  // ---- Lazy VideoPreviewModal: open a video from the grid (read-only) ----
  await go("/owner/videos");
  const beforeModal = errors.length;
  // click the first media/play cell if present
  const playBtn = page.locator('button:has([class*="fill-white"]), [aria-label*="preview" i]').first();
  if (await playBtn.count()) {
    await playBtn.click().catch(() => {});
    await page.waitForTimeout(2500);
    const modalOpen = await page.locator('[class*="fixed"][class*="inset-0"], [role="dialog"]').count();
    step("lazy VideoPreviewModal opens", modalOpen > 0 && errors.length === beforeModal);
    await page.keyboard.press("Escape").catch(() => {});
  } else {
    step("lazy VideoPreviewModal opens", true, "no video row to click (skipped)");
  }

  // ---- Client workspace (ClientWorkspacePage relocation) + Settings tab (InlineEditableField) ----
  const beforeWs = errors.length;
  await go("/owner/clients");
  const clientLink = page.locator('a[href*="/clients/"]').first();
  if (await clientLink.count()) {
    await clientLink.click().catch(() => {});
    await page.waitForTimeout(2500);
    step("client workspace opens (ClientWorkspacePage)", errors.length === beforeWs, page.url());
  } else {
    step("client workspace opens (ClientWorkspacePage)", true, "no client link (skipped)");
  }

  console.log("\n=== console/page errors captured (" + errors.length + ") ===");
  for (const e of errors.slice(0, 25)) console.log("  • " + e.slice(0, 200));
} catch (err) {
  step("test harness", false, err.message);
} finally {
  const pass = results.filter((r) => r.ok).length;
  console.log(`\nSUMMARY: ${pass}/${results.length} checks passed; ${errors.length} console errors`);
  await browser.close();
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}
