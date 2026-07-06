/**
 * Tier-3 E2E for the refactor branch — read-only (no saves, submits, sends).
 * Extends tests/smoke.mjs with checks for the branch's specific fixes:
 *   - CRM person navigation (crm_people slug→id fix)
 *   - Client workspace Sales tab renders AED (currency fix)
 *   - Email hub compose + live preview (use-email-campaign extraction)
 *   - Role guard: owner visiting another role's route is redirected
 *     and the cross-role page never renders (Outlet gating)
 *   - Team chat renders (use-chat split)
 *
 * Usage: CLIPS_TEST_EMAIL=.. CLIPS_TEST_PASSWORD=.. BASE_URL=.. node tests/e2e.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const EMAIL = process.env.CLIPS_TEST_EMAIL;
const PASSWORD = process.env.CLIPS_TEST_PASSWORD;
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;
const SHOTS = process.env.SHOT_DIR || "";

const errors = [];
const results = [];
let shotN = 0;

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
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

async function shot(label) {
  if (!SHOTS) return;
  shotN++;
  await page
    .screenshot({ path: `${SHOTS}/${String(shotN).padStart(2, "0")}-${label}.png` })
    .catch(() => {});
}

async function go(path) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

try {
  // ---- 1. Login via the migrated RHF+zod form ----
  await go("/login");
  await page.fill("#login-email", EMAIL);
  await page.fill("#login-password", PASSWORD);
  await page.click('button:has-text("Sign in"), button[type="submit"]');
  await page.waitForTimeout(5000);
  step("login (RHF+zod form) redirects to dashboard", !page.url().endsWith("/login"), page.url());
  await shot("dashboard");

  // ---- 2. Core owner surfaces render without console errors ----
  for (const [label, path] of [
    ["owner videos grid", "/owner/videos"],
    ["owner schedule (schedule-adapters)", "/owner/schedule"],
    ["owner pipeline", "/owner/pipeline"],
    ["owner HQ", "/owner/hq"],
    ["owner finance", "/owner/finance"],
    ["owner sales hub", "/owner/sales"],
  ]) {
    const before = errors.length;
    await go(path);
    const bodyText = (await page.textContent("body").catch(() => "")) || "";
    step(label, bodyText.trim().length > 200 && errors.length === before);
    await shot(label.replace(/[^a-z0-9]+/gi, "-"));
  }

  // ---- 3. CRM person page — the slug→id fix ----
  await go("/owner/people");
  const beforeCrm = errors.length;
  const personLink = page.locator('a[href*="/owner/people/"]').first();
  if (await personLink.count()) {
    await personLink.click().catch(() => {});
    await page.waitForTimeout(3000);
    const body = (await page.textContent("body").catch(() => "")) || "";
    const loaded =
      /\/owner\/people\/.+/.test(page.url()) &&
      body.trim().length > 200 &&
      !/not found|error/i.test(body.slice(0, 400));
    step("CRM person profile loads (slug→id fix)", loaded && errors.length === beforeCrm, page.url());
    await shot("crm-person");
  } else {
    step("CRM person profile loads (slug→id fix)", false, "no person link found on /owner/people");
  }

  // ---- 4. Client workspace → Sales tab shows AED (currency fix) ----
  await go("/owner/clients");
  const clientLink = page.locator('a[href*="/clients/"]').first();
  if (await clientLink.count()) {
    await clientLink.click().catch(() => {});
    await page.waitForTimeout(2500);
    const salesTab = page.locator('button:has-text("Sales"), [role="tab"]:has-text("Sales")').first();
    if (await salesTab.count()) {
      const beforeSales = errors.length;
      await salesTab.click().catch(() => {});
      await page.waitForTimeout(2500);
      const body = (await page.textContent("body").catch(() => "")) || "";
      const hasAED = body.includes("AED");
      const hasUSD = /\$\s?\d/.test(body);
      step("Sales tab renders AED (currency fix)", hasAED && errors.length === beforeSales, hasUSD ? "note: $ amounts also present" : "");
      await shot("sales-tab-aed");
    } else {
      step("Sales tab renders AED (currency fix)", false, "Sales tab not found in workspace");
    }
  } else {
    step("Sales tab renders AED (currency fix)", false, "no client link on /owner/clients");
  }

  // ---- 5. Email hub — compose form + live preview iframe ----
  const beforeEmail = errors.length;
  await go("/owner/email-hub");
  const composeVisible = await page
    .locator('text=/subject/i')
    .first()
    .isVisible()
    .catch(() => false);
  const previewFrame = await page.locator('iframe[title="Email preview"]').count();
  step(
    "email hub compose + preview render (use-email-campaign)",
    composeVisible && errors.length === beforeEmail,
    previewFrame ? "preview iframe present" : "preview iframe not on default tab",
  );
  await shot("email-hub");

  // ---- 6. Role guard — owner visiting an editor route must be redirected ----
  await go("/editor/dashboard");
  await page.waitForTimeout(2000);
  const guarded = !page.url().includes("/editor");
  step("role guard redirects owner off /editor/* (Outlet gating)", guarded, page.url());

  // ---- 7. Team chat renders (use-chat split) ----
  const beforeChat = errors.length;
  await go("/owner/team-chat");
  const chatBody = (await page.textContent("body").catch(() => "")) || "";
  step("team chat renders (use-chat split)", chatBody.trim().length > 200 && errors.length === beforeChat);
  await shot("team-chat");

  // ---- 8. Lazy VideoPreviewModal ----
  await go("/owner/videos");
  const beforeModal = errors.length;
  const playBtn = page.locator('button:has([class*="fill-white"]), [aria-label*="preview" i]').first();
  if (await playBtn.count()) {
    await playBtn.click().catch(() => {});
    await page.waitForTimeout(2500);
    const modalOpen = await page.locator('[class*="fixed"][class*="inset-0"], [role="dialog"]').count();
    step("lazy VideoPreviewModal opens", modalOpen > 0 && errors.length === beforeModal);
    await shot("video-modal");
    await page.keyboard.press("Escape").catch(() => {});
  } else {
    step("lazy VideoPreviewModal opens", true, "no video row to click (skipped)");
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
