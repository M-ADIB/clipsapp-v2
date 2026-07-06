import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "/Users/madibbaroudi/.gemini/antigravity/brain/5d4af964-c1b2-4dde-818a-d46ac4d3fd68";
const PORT = 5178;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  console.log("Starting Part 1: Owner Setup...");

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

    // Navigate to studio
    console.log("Navigating to Owner Studio...");
    await page.goto(`${BASE_URL}/owner/studio`);
    await page.waitForSelector("table tbody tr td:has-text('Ajmal Perfumes')");

    // Select Ajmal Perfumes client
    console.log("Selecting Ajmal Perfumes client...");
    await page.click("table tbody tr td:has-text('Ajmal Perfumes')");
    await page.waitForSelector("text=Step 1 Highlight");
    await page.waitForTimeout(2000);

    // Revoke access first if it is active
    const unsendBtn = page.locator("button:has-text('Unsend / Revoke Access')");
    if (await unsendBtn.count() > 0) {
      console.log("Onboarding is currently active. Revoking first to reset state...");
      await unsendBtn.click();
      await page.waitForTimeout(1500);
      console.log("Access revoked.");
    }

    // 1. Test Adding and Renaming a Section
    console.log("Testing Section-level controls: Adding a new section...");
    await page.click("button:has-text('Add New Section')");
    await page.waitForSelector("label:has-text('Section Name')");
    await page.fill("#new-section-name", "Verification Section");
    await page.click("button:has-text('Create Section')");
    await page.waitForTimeout(1500);

    // Verify it is there
    console.log("Verifying section creation...");
    await page.waitForSelector("text=VERIFICATION SECTION");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12_section_added.png") });

    // Rename the section
    console.log("Renaming the section...");
    const sectionHeader = page.locator("div.group\\/section:has-text('VERIFICATION SECTION')");
    await sectionHeader.hover();
    await sectionHeader.locator("button[title='Rename Section']").click();
    await page.fill("input[value='VERIFICATION SECTION']", "TESTING SECTION RENAME");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1500);

    // Verify rename
    await page.waitForSelector("text=TESTING SECTION RENAME");
    console.log("Section successfully renamed.");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13_section_renamed.png") });

    // 2. Test Custom Template Saving
    console.log("Testing template saving...");
    await page.click("button:has-text('Save current as Template')");
    await page.waitForSelector("label:has-text('Template Name')");
    await page.fill("#template-name", "Verify Custom Template");
    await page.click("button:has-text('Save Template')");
    await page.waitForTimeout(2000);

    // Verify that the template appears in the category buttons
    console.log("Checking if custom template appears in category selector...");
    await page.waitForSelector("text=Verify Custom Template");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "14_custom_template_listed.png") });

    // Clean up: delete custom section we created
    console.log("Deleting custom section...");
    const testSectionHeader = page.locator("div.group\\/section:has-text('TESTING SECTION RENAME')");
    await testSectionHeader.hover();
    await testSectionHeader.locator("button[title='Delete Section and all its questions']").click();
    await page.waitForSelector("text=Delete Section");
    await page.click("button:has-text('Delete Section')");
    await page.waitForTimeout(1500);
    console.log("Custom section deleted.");

    // 3. Test Dynamic Document System (Docs)
    console.log("Testing Dynamic Docs: Creating a new doc...");
    await page.click("button[title='Create new Doc']");
    await page.waitForTimeout(2000);

    // Rename the doc (input is already focused on creation)
    console.log("Renaming document in the sidebar...");
    await page.fill("input[value^='Doc ']", "Playwright Strategy");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1500);

    // Verify title matches
    await page.waitForSelector("h2:has-text('Playwright Strategy')");
    console.log("Document successfully renamed to 'Playwright Strategy'.");

    // Write text in TipTap rich text editor
    console.log("Typing content in TipTap editor...");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.fill("This is the playwright automated test content for Ajmal Perfumes strategy doc.");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "15_doc_typed.png") });

    // Delete the doc
    console.log("Deleting the strategy doc...");
    const docItem = page.locator("div.group:has-text('Playwright Strategy')").first();
    await docItem.hover();
    await docItem.locator("button[title='Delete Doc']").click();
    await page.waitForSelector("text=Delete Document");
    await page.click("button:has-text('Delete')");
    await page.waitForTimeout(2000);

    // Verify it reverts to Foundation view
    await page.waitForSelector("text=Step 1 Highlight");
    console.log("Strategy doc deleted, view reverted to Foundation.");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "16_doc_deleted_reverted.png") });

    // 4. Send to Client
    console.log("Sending onboarding to client...");
    await page.click("button:has-text('Send to Client')");
    await page.waitForSelector("text=Send Onboarding to Client");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "17_send_to_client_dialog.png") });

    // Close dialog
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // Logout Owner
    console.log("Logging out Owner...");
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    console.log("Owner Setup finished successfully.");

  } catch (err) {
    console.error("Owner Setup failed with error:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "99_test_setup_failure.png") });
    throw err;
  } finally {
    await browser.close();
  }
}

run();
