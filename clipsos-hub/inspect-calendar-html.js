import { chromium } from "playwright";

async function run() {
  console.log("Starting calendar DOM inspection...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    console.log("Navigating to login page...");
    await page.goto("http://localhost:5175/login");
    await page.fill("#login-email", process.env.CLIPS_TEST_EMAIL);
    await page.fill("#login-password", process.env.CLIPS_TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.href.includes("/login"), { timeout: 15000 });

    console.log("Navigating to calendar tab...");
    await page.goto("http://localhost:5175/client/videos?tab=calendar");
    await page.waitForSelector(".fc", { timeout: 10000 });
    await page.waitForTimeout(3000);

    const details = await page.evaluate(() => {
      const fc = document.querySelector(".fc");
      if (!fc) return "FullCalendar not found";

      const elements = Array.from(fc.querySelectorAll("*")).map((el) => {
        const style = window.getComputedStyle(el);
        return {
          tagName: el.tagName,
          className: el.className,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          height: style.height,
          width: style.width,
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      });

      return {
        fcDisplay: window.getComputedStyle(fc).display,
        fcHeight: window.getComputedStyle(fc).height,
        fcWidth: window.getComputedStyle(fc).width,
        totalChildren: elements.length,
        sampleChildren: elements.slice(0, 15),
        harness: elements.find((e) => e.className.includes("harness")) || null,
        daygridBody: elements.find((e) => e.className.includes("daygrid-body")) || null,
      };
    });

    console.log("Calendar DOM Details:", JSON.stringify(details, null, 2));
  } catch (err) {
    console.error("Failed:", err);
  } finally {
    await browser.close();
  }
}

run();
