import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "/Users/madibbaroudi/.gemini/antigravity/brain/5d4af964-c1b2-4dde-818a-d46ac4d3fd68";
const PORT = 5178;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  console.log("Starting Client Onboarding View Verification...");

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
    // PART 2: CLIENT VIEW
    // -------------------------------------------------------------
    console.log("--- PART 2: CLIENT VIEW ---");
    console.log("Navigating to login page...");
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector("#login-email");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log("Logging in as Client (using Adib's role-swapped account)...");
    await page.fill("#login-email", process.env.CLIPS_TEST_EMAIL);
    await page.fill("#login-password", process.env.CLIPS_TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for client dashboard load
    await page.waitForURL((url) => url.href.includes("/client"), { timeout: 15000 });
    console.log("Client login successful. URL:", page.url());
    await page.waitForTimeout(3000); // Wait for React hydration & query loads
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_client_dashboard.png") });

    // Verify Onboarding Toast
    console.log("Checking for floating onboarding toast...");
    const toast = page.locator("text=Content Studio Activated!");
    await toast.waitFor({ timeout: 5000 });
    console.log("Onboarding toast found!");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09_client_toast_visible.png") });

    // Click 'Go to Studio'
    console.log("Clicking 'Go to Studio' button in toast...");
    await page.click("button:has-text('Go to Studio')");
    await page.waitForURL((url) => url.href.includes("/client/studio"), { timeout: 5000 });
    console.log("Navigated to Client Studio. URL:", page.url());
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10_client_studio_foundation.png") });

    // Verify Studio nav item is visible in Sidebar
    console.log("Verifying 'Studio' is visible in sidebar navigation...");
    const sidebarStudioItem = page.locator("aside nav, [data-sidebar]").locator("text=Studio");
    const count = await sidebarStudioItem.count();
    console.log(`Sidebar Studio menu item count: ${count}`);

    // Fill in an answer as client and verify badge updates on blur
    console.log("Finding question blocks...");
    const questionCard = page.locator(".rounded-xl:has(textarea)").first();
    await questionCard.waitFor();
    const textarea = questionCard.locator("textarea");
    
    console.log("Typing answer in question...");
    await textarea.focus();
    await textarea.fill("This is my brand new verified answer filled during browser test.");
    
    // Blur to trigger database save
    console.log("Blurring to save answer...");
    await textarea.blur();
    await page.waitForTimeout(2000); // Wait for save and state refresh

    // Check if the badge now reads 'FILLED'
    const badgeText = await questionCard.locator(".rounded-full").first().innerText();
    console.log(`Badge text after fill and blur: ${badgeText}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11_client_answer_filled.png") });

    // Logout
    console.log("Logging out client...");
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    console.log("Client logout completed.");

  } catch (err) {
    console.error("Client view test failed:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "99_client_error.png") });
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
