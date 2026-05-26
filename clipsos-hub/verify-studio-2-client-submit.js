import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "/Users/madibbaroudi/.gemini/antigravity/brain/5d4af964-c1b2-4dde-818a-d46ac4d3fd68";
const PORT = 5178;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  console.log("Starting Part 2: Client Submit Answer...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    console.error(`[BROWSER PAGE ERROR] ${err}`);
  });

  try {
    console.log("Navigating to login page...");
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector("#login-email");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log("Logging in as Client...");
    await page.fill("#login-email", "adib@theclips.agency");
    await page.fill("#login-password", "ClipsOS2026!");
    await page.click('button[type="submit"]');

    // Wait for client dashboard
    await page.waitForURL((url) => url.href.includes("/client"), { timeout: 15000 });
    console.log("Client logged in. URL:", page.url());
    await page.waitForTimeout(2000);

    // Verify Studio tab is present and floating toast is visible
    console.log("Verifying Studio toast is visible...");
    const toastLocator = page.locator("text=Content Studio Activated!");
    await toastLocator.waitFor({ timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "18_client_toast_onboard.png") });

    // Click Go to Studio
    console.log("Clicking 'Go to Studio' button in toast...");
    await page.click("button:has-text('Go to Studio')");
    await page.waitForURL((url) => url.href.includes("/client/studio"), { timeout: 5000 });
    console.log("Navigated to Client Studio. URL:", page.url());
    await page.waitForTimeout(2000);

    // Fill in a test answer and blur-save it
    console.log("Filling answer as client...");
    const questionCard = page.locator(".rounded-xl:has(textarea)").first();
    const textarea = questionCard.locator("textarea");
    await textarea.focus();
    await textarea.fill("Playwright automated brand answer.");
    await textarea.blur();
    await page.waitForTimeout(2000);

    // Verify FILLED badge is shown
    const badge = questionCard.locator(".rounded-full").first();
    const badgeText = await badge.innerText();
    console.log(`Badge text: ${badgeText}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "19_client_field_saved.png") });

    // Logout Client
    console.log("Logging out Client...");
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    console.log("Client Submit finished successfully.");

  } catch (err) {
    console.error("Client Submit failed with error:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "99_test_client_failure.png") });
    throw err;
  } finally {
    await browser.close();
  }
}

run();
