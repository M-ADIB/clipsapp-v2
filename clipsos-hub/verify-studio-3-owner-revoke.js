import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "/Users/madibbaroudi/.gemini/antigravity/brain/5d4af964-c1b2-4dde-818a-d46ac4d3fd68";
const PORT = 5178;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  console.log("Starting Part 3: Owner Revoke Access...");

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

    console.log("Logging in as Owner...");
    await page.fill("#login-email", process.env.CLIPS_TEST_EMAIL);
    await page.fill("#login-password", process.env.CLIPS_TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => !url.href.includes("/login"), { timeout: 15000 });
    console.log("Logged in successfully. URL:", page.url());

    console.log("Navigating to Owner Studio to revoke access...");
    await page.goto(`${BASE_URL}/owner/studio`);
    await page.waitForSelector("table tbody tr td:has-text('Ajmal Perfumes')");
    await page.click("table tbody tr td:has-text('Ajmal Perfumes')");
    await page.waitForSelector("text=Step 1 Highlight");
    await page.waitForTimeout(2000);

    // Revoke access
    console.log("Clicking 'Unsend / Revoke Access'...");
    await page.click("button:has-text('Unsend / Revoke Access')");
    await page.waitForTimeout(2000);

    // Verify "Send to Client" button is back
    await page.waitForSelector("button:has-text('Send to Client')");
    console.log("Access successfully revoked.");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "20_access_revoked.png") });

    // Logout Owner
    console.log("Logging out Owner...");
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    console.log("Owner Revoke finished successfully.");

  } catch (err) {
    console.error("Owner Revoke failed with error:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "99_test_revoke_failure.png") });
    throw err;
  } finally {
    await browser.close();
  }
}

run();
