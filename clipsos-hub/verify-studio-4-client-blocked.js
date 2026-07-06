import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "/Users/madibbaroudi/.gemini/antigravity/brain/5d4af964-c1b2-4dde-818a-d46ac4d3fd68";
const PORT = 5178;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  console.log("Starting Part 4: Verify Client Blocked...");

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

    console.log("Logging in as Client again...");
    await page.fill("#login-email", process.env.CLIPS_TEST_EMAIL);
    await page.fill("#login-password", process.env.CLIPS_TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for client dashboard
    await page.waitForURL((url) => url.href.includes("/client"), { timeout: 15000 });
    console.log("Client logged in. URL:", page.url());
    await page.waitForTimeout(3000);

    // Verify Studio tab is NOT visible in the client sidebar
    console.log("Checking if Studio tab is hidden in Client sidebar...");
    const sidebarStudioItem = page.locator("aside nav, [data-sidebar]").locator("text=Studio");
    const count = await sidebarStudioItem.count();
    console.log(`Studio link count in client sidebar: ${count}`);
    if (count === 0) {
      console.log("SUCCESS: Studio tab is hidden for client after access revocation.");
    } else {
      throw new Error("FAIL: Studio tab is still visible for client!");
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "21_client_blocked_studio_hidden.png") });

    // Logout Client
    console.log("Logging out Client...");
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    console.log("Client Blocked check finished successfully.");

  } catch (err) {
    console.error("Client Blocked check failed with error:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "99_test_blocked_failure.png") });
    throw err;
  } finally {
    await browser.close();
  }
}

run();
