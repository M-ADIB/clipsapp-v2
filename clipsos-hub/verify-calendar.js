import { chromium } from "playwright";

async function run() {
  console.log("Starting calendar UI screenshot script...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    console.error(`[BROWSER PAGE ERROR] STACK:`, err.stack || err);
  });

  try {
    console.log("Navigating to login page...");
    await page.goto("http://localhost:5175/login");
    await page.waitForSelector("#login-email");
    await page.waitForLoadState("domcontentloaded");

    console.log("Logging in as client...");
    await page.fill("#login-email", process.env.CLIPS_TEST_EMAIL);
    await page.fill("#login-password", process.env.CLIPS_TEST_PASSWORD);
    await page.click('button[type="submit"]');

    console.log("Waiting for redirection...");
    await page.waitForURL((url) => !url.href.includes("/login"), { timeout: 30000 });

    console.log("Navigating to Client Videos Calendar page...");
    await page.goto("http://localhost:5175/client/videos?tab=calendar");
    await page.waitForLoadState("domcontentloaded");

    // Wait for the calendar to fully render
    await page.waitForSelector(".fc", { timeout: 10000 });
    await page.waitForTimeout(5000);

    console.log("Taking screenshot of the calendar page...");
    await page.screenshot({
      path: "/Users/madibbaroudi/.gemini/antigravity/brain/11f06219-a313-4110-9844-12ee4ecdf520/calendar_ui.png",
    });
    console.log("Screenshot saved successfully.");
  } catch (err) {
    console.error("Script failed with error:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
