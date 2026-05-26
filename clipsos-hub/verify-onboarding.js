import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "/Users/madibbaroudi/.gemini/antigravity/brain/5d4af964-c1b2-4dde-818a-d46ac4d3fd68";
const PORT = 5178;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  console.log("Starting Content Studio Onboarding Verification...");

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
    // -------------------------------------------------------------
    // PART 1: STRATEGIST / OWNER VIEW
    // -------------------------------------------------------------
    console.log("--- PART 1: OWNER VIEW ---");
    console.log("Navigating to login page...");
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector("#login-email");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log("Logging in as Owner...");
    await page.fill("#login-email", "adib@theclips.agency");
    await page.fill("#login-password", "ClipsOS2026!");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_owner_login_filled.png") });
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => !url.href.includes("/login"), { timeout: 15000 });
    console.log("Logged in successfully. URL:", page.url());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_owner_dashboard.png") });

    // Navigate to studio
    console.log("Navigating to Owner Studio...");
    await page.goto(`${BASE_URL}/owner/studio`);
    await page.waitForSelector("table tbody tr td:has-text('Ajmal Perfumes')");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_owner_studio_list.png") });

    // Select Ajmal Perfumes client
    console.log("Selecting Ajmal Perfumes client...");
    await page.click("table tbody tr td:has-text('Ajmal Perfumes')");
    await page.waitForSelector("text=Step 1 Highlight");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_owner_studio_foundation.png") });

    // Test Adding a Question
    console.log("Testing modular question actions (Adding)...");
    await page.click("button:has-text('Add Question')");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_question_added.png") });

    // Toggle required status
    console.log("Toggling question requirement status...");
    const requiredToggle = page.locator("button:has-text('Required'), button:has-text('Optional')").last();
    await requiredToggle.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_required_toggled.png") });

    // Click 'Send to Client' to activate the Studio
    console.log("Clicking 'Send to Client'...");
    await page.click("button:has-text('Send to Client')");
    await page.waitForSelector("text=Send Onboarding to Client");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_send_to_client_dialog.png") });
    
    // Close Send to Client dialog
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // Logout
    console.log("Logging out...");
    // Let's clear cookies and storage to logout cleanly
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    console.log("Logout completed.");

  } catch (err) {
    console.error("Owner view test failed:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "99_owner_error.png") });
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
