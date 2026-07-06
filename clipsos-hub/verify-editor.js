import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR =
  "/Users/madibbaroudi/.gemini/antigravity/brain/b53c407b-fe4f-48d0-9693-1909da53d8cb";

async function run() {
  console.log("Starting verification...");

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
    // 1. Go to Login page
    console.log("Navigating to login page...");
    await page.goto("http://localhost:5175/login");
    await page.waitForSelector("#login-email");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000); // Wait 3s for React hydration to complete
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_login_page.png") });

    // 2. Log in
    console.log("Logging in...");
    await page.click("#login-email");
    await page.fill("#login-email", process.env.CLIPS_TEST_EMAIL);
    await page.click("#login-password");
    await page.fill("#login-password", process.env.CLIPS_TEST_PASSWORD);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_b_login_filled.png") });
    await page.click('button[type="submit"]');

    // Wait for URL to change (away from /login)
    await page.waitForURL((url) => !url.href.includes("/login"), { timeout: 10000 });
    console.log("Login successful, redirected to:", page.url());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_logged_in.png") });

    // 3. Go to studio dashboard
    console.log("Navigating to Owner Studio Dashboard...");
    await page.goto("http://localhost:5175/owner/studio");

    // Wait for clients table to finish loading
    await page.waitForSelector("table tbody tr td:has-text('Ajmal Perfumes')");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_studio_dashboard.png") });

    // 4. Click the first client (Ajmal Perfumes)
    console.log("Clicking the first client...");
    await page.click("table tbody tr td:has-text('Ajmal Perfumes')");

    // Wait for detail view elements (sidebar)
    await page.waitForSelector("text=Content Cycles");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_client_detail.png") });

    // 5. Select first cycle in sidebar
    console.log("Selecting the first cycle in sidebar...");
    const cycleBtn = page.locator('aside nav button:has-text("Cycle")').first();
    await cycleBtn.waitFor();
    await cycleBtn.click();

    // Wait for editor to load
    console.log("Waiting for RichTextEditor to load...");
    await page.waitForSelector(".ProseMirror");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_editor_loaded.png") });

    // 6. Enter test text (a list item)
    console.log("Typing text in editor...");
    const editor = page.locator(".ProseMirror");
    await editor.focus();

    // Select all existing text and delete it
    await page.keyboard.press("Meta+A");
    await page.keyboard.press("Delete");
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Delete");

    // Let's type a list item first, since lists were broken before
    // We can do this by typing "* First List Item" to trigger markdown list shortcut
    await page.keyboard.type("* First List Item");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Second List Item");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Third List Item");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_editor_typed.png") });

    // 7. Select text and save as script via context menu
    console.log("Selecting text to convert to script...");
    // Let's use keyboard to select the text: Shift + ArrowUp
    await page.keyboard.press("Shift+ArrowUp");
    await page.keyboard.press("Shift+ArrowUp");

    // Take screenshot of selection
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_editor_selection.png") });

    console.log("Triggering context menu (right click)...");
    const secondItem = page.locator(".ProseMirror li:has-text('Second List Item')");
    await secondItem.click({ button: "right" });
    await page.waitForSelector("[data-context-menu]");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_context_menu_shown.png") });

    console.log("Clicking 'Save as Script'...");
    await page.click('button:has-text("Save as Script")');

    // Wait for script details block to be created
    await page.waitForSelector('[data-type="details"]');
    console.log("Script block created successfully!");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09_script_created.png") });

    // 8. Test collapsible behavior
    console.log("Verifying expand/collapse toggle...");
    // The details element is native. Let's find the details node summary or chevron button and click it.
    // In our CSS, details block has a detailsSummary button at the start.
    // Let's select the first details node and click its summary.
    const detailsNode = page.locator('[data-type="details"]').first();
    console.log("Details node HTML:", await detailsNode.evaluate((el) => el.outerHTML));
    const summaryNode = detailsNode
      .locator('summary, button, [data-type="detailsSummary"]')
      .first();

    // Check if open by default
    const isOpenInitial = await detailsNode.evaluate(
      (el) =>
        el.hasAttribute("open") ||
        el.getAttribute("open") === "true" ||
        el.classList.contains("is-open"),
    );
    console.log("Initial open state:", isOpenInitial);

    console.log("Clicking toggle summary...");
    await summaryNode.evaluate((el) => el.click());
    await page.waitForTimeout(500);
    const isOpenAfterClick = await detailsNode.evaluate((el) => {
      console.log(
        "evaluate state after collapse: openAttr=" +
          el.getAttribute("open") +
          " hasOpen=" +
          el.hasAttribute("open") +
          " classList=" +
          Array.from(el.classList).join(","),
      );
      return (
        el.hasAttribute("open") ||
        el.getAttribute("open") === "true" ||
        el.classList.contains("is-open") ||
        el.hasAttribute("data-open")
      );
    });
    console.log("Open state after collapse click:", isOpenAfterClick);
    if (isOpenInitial === isOpenAfterClick) {
      throw new Error(`Collapse toggle failed! Open state remained ${isOpenInitial}`);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10_script_toggled_collapse.png") });

    // Click it again to expand
    console.log("Clicking toggle summary to expand again...");
    await summaryNode.evaluate((el) => el.click());
    await page.waitForTimeout(500);
    const isOpenAfterSecondClick = await detailsNode.evaluate(
      (el) =>
        el.hasAttribute("open") ||
        el.getAttribute("open") === "true" ||
        el.classList.contains("is-open") ||
        el.hasAttribute("data-open"),
    );
    console.log("Open state after expand click:", isOpenAfterSecondClick);
    if (isOpenAfterSecondClick !== isOpenInitial) {
      throw new Error(`Expand toggle failed! Open state did not return to ${isOpenInitial}`);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11_script_toggled_expand.png") });

    // 9. Test keyboard shortcut
    console.log("Testing keyboard shortcut (Save as Script)...");
    // Type another list item outside details block
    await editor.focus();
    // Press ArrowDown to get past details block
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.type("New Paragraph for Shortcut Test");

    // Select it
    await page.keyboard.press("Shift+ArrowUp");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12_selection_for_shortcut.png") });

    // Press Cmd+Shift+S (Meta+Shift+S)
    console.log("Pressing keyboard shortcut...");
    await page.keyboard.down("Meta");
    await page.keyboard.down("Shift");
    await page.keyboard.press("KeyS");
    await page.keyboard.up("Shift");
    await page.keyboard.up("Meta");

    // Let's also try Control+Shift+S as a backup
    await page.keyboard.down("Control");
    await page.keyboard.down("Shift");
    await page.keyboard.press("KeyS");
    await page.keyboard.up("Shift");
    await page.keyboard.up("Control");

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13_after_shortcut.png") });

    // 10. Check if another details block exists
    const detailsCount = await page.locator('[data-type="details"]').count();
    console.log("Total details block count:", detailsCount);
  } catch (err) {
    console.error("Test failed with error:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "99_error_state.png") });
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
