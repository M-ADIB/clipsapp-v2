import { chromium } from "playwright";

async function run() {
  console.log("Starting full screen review error test...");

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
    // 1. Go to Login page
    console.log("Navigating to login page...");
    await page.goto("http://localhost:5173/login");
    await page.waitForSelector("#login-email");
    await page.waitForLoadState("domcontentloaded");

    // 2. Log in
    console.log("Logging in as client...");
    await page.fill("#login-email", process.env.CLIPS_TEST_EMAIL);
    await page.fill("#login-password", process.env.CLIPS_TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to complete
    console.log("Waiting for redirection...");
    await page.waitForURL((url) => !url.href.includes("/login"), { timeout: 15000 });
    console.log("Login successful, redirected to:", page.url());

    // 3. Go to client videos page
    console.log("Navigating to Client Videos page...");
    await page.goto("http://localhost:5173/client/videos");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(5000); // wait for feed cards to load and render

    // Check if feed view cards are present
    const cardSelector = "div:has-text('Click to review in full screen')";
    await page.waitForSelector(cardSelector, { timeout: 10000 });
    const count = await page.locator(cardSelector).count();
    console.log(`Found ${count} hover card overlay options.`);

    if (count > 0) {
      console.log("Hovering and clicking 'Click to review in full screen'...");
      const hoverArea = page.locator("div:has-text('Click to review in full screen')").first();
      await hoverArea.hover();
      await hoverArea.click();
      console.log("Clicked overlay, waiting 10 seconds for errors...");
      await page.waitForTimeout(10000);
    } else {
      console.log("No review cards found.");
    }
  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
