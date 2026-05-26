import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("http://localhost:5175/login");
    await page.fill("#login-email", "adib@theclips.agency");
    await page.fill("#login-password", "ClipsOS2026!");
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.href.includes("/login"));

    await page.goto("http://localhost:5175/client/videos?tab=calendar");
    await page.waitForSelector(".fc");
    await page.waitForTimeout(3000);

    const lineage = await page.evaluate(() => {
      let el = document.querySelector(".fc");
      const path = [];
      while (el) {
        const style = window.getComputedStyle(el);
        path.push({
          tagName: el.tagName,
          className: el.className,
          height: style.height,
          display: style.display,
          position: style.position,
          overflow: style.overflow,
        });
        el = el.parentElement;
      }
      return path;
    });

    console.log("LINEAGE:", JSON.stringify(lineage, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();
