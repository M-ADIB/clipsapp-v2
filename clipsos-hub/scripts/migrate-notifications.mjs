#!/usr/bin/env node
/**
 * Notifications Migration Script
 *
 * Parses the old-app CSV, maps old user_ids → new user_ids via email,
 * validates, transforms URLs, and outputs batched SQL INSERT statements.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// ── Config ─────────────────────────────────────────────────────────
const CSV_PATH = resolve(
  "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/Database CSV's - OLD APP/notifications-export-2026-05-04_08-21-15.csv",
);
const OLD_PROFILES_PATH = resolve(
  "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/Database CSV's - OLD APP/team-profiles-export-2026-05-03_17-04-44.csv",
);
const TENANT_ID = "520a4cfd-5183-4e11-aecc-bc71a52978b6";
const BATCH_SIZE = 500;

// ── New profiles (from Supabase query) ──────────────────────────────
// Map: email → new_user_id
const NEW_PROFILES = {
  "abdelwahab@theclips.agency": "5acafbb9-b354-4148-abf7-5d34a0d0413b",
  "adam@theclips.agency": "81cec010-d6cc-443e-85f8-b89f830be6e8",
  "adib@theclips.agency": "d57a0a6e-1be7-422f-864f-5535a766a5d4",
  "ahmad@theclips.agency": "c579ae6d-5802-4b9e-a25c-7c00a59215d3",
  "amit.bhattacharjee@ajmal.net": "cbdb5d74-da05-458b-8aa3-25afb341e397",
  "akash@theclips.agency": "ae4e4261-e702-4f23-924d-d09e8fd99814",
  "ali@revivauae.com": "7eb5c9a3-9552-41b0-8b71-3d0ddb01dcc0",
  "anan@theclips.agency": "f7c7351d-5c6e-4c84-b0c4-63ceb53fce52",
  "anas@theclips.agency": "cc52a9e1-e00d-4b5e-9a68-f948f38de34d",
  "ahmed@aquafun.ae": "79d857a2-f30a-4153-b6d2-3270ecdbd4fd",
  "charbel@theclips.agency": "a8160fe1-4d6a-41d4-8c13-28c327b91290",
  "viandy.dumas@cntxt.tech": "0054046a-ca5f-4f71-95c0-181071bf6cb1",
  "diana@pland.ae": "1ea8b284-24f4-4a99-a362-7de41a466f56",
  "divvay@theclips.agency": "f4861664-8477-4af1-bae1-db92cd70273e",
  "drarunbabu02@gmail.com": "803fc098-b2ca-45e9-8318-048845d7130a",
  "dr.anjamf@gmail.com": "3ddf9bec-30b6-419c-aea5-47a27148f4dc",
  "imajed88@gmail.com": "f9380125-6696-4e89-b014-28893aa1eda6",
  "shaaban56@yahoo.com": "abc5a362-d918-4347-bc14-e96aeb1f06bd",
  "mohdmdane@gmail.com": "9ebe5706-5a16-416b-b238-00f500d41809",
  "muna.balfaqeeh77@gmail.com": "83a73522-e995-42cb-8a7f-c030d395b84c",
  "shbuhamer@gmail.com": "4a3385e2-f615-474a-a7e9-f4c293ce692a",
  "roza.shahrory1@gmail.com": "ee504e4f-4247-4f94-b3ec-17814e597867",
  "ghiwaibrahim@hotmail.com": "66dff24b-14f0-4f41-9cac-e0a4661b144e",
  "hager@beatfitness.me": "46b8c2a1-deb6-4225-94a3-162968a52f93",
  "albitarhaya9@gmail.com": "63509bbc-c6b6-41f2-b454-08c6c0b61191",
  "hussein@theclips.agency": "3c7a8150-1471-45bb-9c0f-2e4342604c03",
  "huyen@onlinemarketingfordoctors.com": "db3efb0e-0725-489c-9583-582c72f14296",
  "iyas@theclips.agency": "62dc22dc-f938-4a1b-b3d2-bed4d5e54db9",
  "thefilmengineer@gmail.com": "ba1f1bf0-b160-406c-850a-fc845b1f4ab5",
  "jihad.miski@hotmail.com": "d8a3c1fe-b12f-4355-b3b3-0a1cd7c73e5f",
  "kamal@theclips.agency": "4752a5a7-c74c-4c86-ae5c-6139f4af84cf",
  "leenaparwani6@gmail.com": "043536f6-27a9-4f0c-89c3-2caba0f3c51b",
  "lynn@theclips.agency": "da438093-e415-42a8-ac35-bc8f8defaf7b",
  "maen.ftouni@coinquant.ai": "e87ffff8-22d0-442d-8cb8-cbd6734f706d",
  "maha@theclips.agency": "6b55071f-0850-4608-ac08-f62b5b5be3e2",
  "mahmoud@theclips.agency": "6a05b437-57f4-4597-9749-dbc796a7c4cf",
  "maram.marroun@gmail.com": "66551e30-47c2-47d5-8120-cbe4810a70ba",
  "mirna@theclips.agency": "926ec852-5904-4d4e-86ea-c3195e162f71",
  "mohamed@theclips.agency": "290d26d7-2f11-42b6-9323-acdd3d2f045e",
  "mrinal@theclips.agency": "1e783bf7-9911-459a-897d-d93d30499eff",
  "info@nadahawa.com": "c34464c9-8d09-46d8-b4f8-9094263b8a05",
  "nahla@theclips.agency": "c7d37fc6-7426-4018-bdac-521022e23ac8",
  "omar.messky@gmail.com": "19a3b2b8-41d9-4c31-84a5-16cdbbbc0dd4",
  "omar@productized.ae": "26363ede-ee00-42b6-ae43-3f1ac6adca16",
  "omarmeski@maven-x.com": "b5df1282-8c64-49da-8db3-fbd349e23244",
  "omeir@theclips.agency": "cbca1385-4edd-41dc-b7c0-f30d3cd10c9f",
  "rahul@theclips.agency": "fefbba1c-81ba-483c-8bfa-4dc6b94f349b",
  "rajat@theclips.agency": "b8fa58dd-f5eb-4e57-9cdd-665fc2dd6e46",
  "ruba.alissa@abecae.com": "f7db2c79-a9fa-466d-97ea-e7294a0cb54b",
  "sachin@theclips.agency": "4426c1d8-4f41-43f6-aec6-de169ed58e53",
  "shahidul@theclips.agency": "ba3cc6fa-d900-4d9a-bc19-581567933bae",
  "shrijit@theclips.agency": "31893d39-a9b3-42e4-abe2-87f18a557769",
  "sparsh230@gmail.com": "c76c0f28-5110-44fb-ac0f-015faad6e13a",
  "syed@theclips.agency": "70b429c0-0fb6-4561-acfa-5de4df1efa81",
  "hello@tinachagoury.com": "a1e37a65-2086-4741-846f-dadf1553c835",
  "umair@theclips.agency": "0d163ff0-f1ab-4683-9b6c-4e0084499506",
  "info@webcraftr.co": "105eb3a4-ebba-46ba-946e-4db7f7cadcea",
  "yasser@theclips.agency": "a9d49c4c-f50c-4730-9f70-dcf111b9fb94",
  "dubai@samovarcarpets.com": "fb0d84d5-5216-43c7-863e-75cc3a2e5df2",
  "z.tursynovv@gmail.com": "68e13b3d-0d17-4720-9f7a-17a30edd2bab",
  // Additional emails for mapping (hager had two)
  "hager.aboutaleb@gmail.com": "46b8c2a1-deb6-4225-94a3-162968a52f93",
  // adib had two accounts in old system
  "adib.baroudi2@gmail.com": "d57a0a6e-1be7-422f-864f-5535a766a5d4",
  // mirna had two emails
  "mirnaezz65@gmail.com": "926ec852-5904-4d4e-86ea-c3195e162f71",
  // ruba had two emails
  "ruba8111@gmail.com": "f7db2c79-a9fa-466d-97ea-e7294a0cb54b",
  // theclipsagency
  "theclipsagency@gmail.com": "d57a0a6e-1be7-422f-864f-5535a766a5d4",
  // social@theclips.academy → map to adib
  "social@theclips.academy": "d57a0a6e-1be7-422f-864f-5535a766a5d4",
  // mail@theclips.agency → map to adib (owner)
  "mail@theclips.agency": "d57a0a6e-1be7-422f-864f-5535a766a5d4",
  // yasmin not in new profiles → skip
  // scrollsft@gmail.com not in new profiles → skip
  // adeebxdgamer@gmail.com not in new profiles → skip
  // alhasan.y.shennar@gmail.com not in new profiles → skip
};

// Valid enums
const VALID_TYPES = new Set([
  "info",
  "success",
  "warning",
  "error",
  "mention",
  "comment",
  "status_change",
  "assignment",
  "approval",
  "chat",
  "task",
]);
const VALID_PRIORITIES = new Set(["low", "normal", "high", "urgent"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Build old_user_id → email mapping from old profiles CSV ──────
function buildOldIdToEmailMap() {
  const raw = readFileSync(OLD_PROFILES_PATH, "utf-8");
  const lines = raw.split("\n");
  const map = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // CSV: id;email;full_name;...
    const parts = line.split(";");
    if (parts.length >= 2) {
      const oldId = parts[0].trim();
      const email = parts[1].trim().toLowerCase();
      if (UUID_RE.test(oldId) && email) {
        map[oldId] = email;
      }
    }
  }
  return map;
}

// ── URL Rewriting ──────────────────────────────────────────────────
function rewriteUrl(link) {
  if (!link || link.trim() === "") return null;
  let url = link.trim();
  url = url.replace(/^\/admin\/security$/, "/owner/settings");
  url = url.replace(/^\/admin\/error-logs.*$/, "/owner/settings");
  url = url.replace(/^\/owner\/sales\/leads/, "/owner/leads");
  url = url.replace(/^\/sales\/leads/, "/closer/leads");
  url = url.replace(/^\/admin\//, "/owner/");
  url = url.replace(/^\/editor-admin\//, "/owner/");
  url = url.replace(/^\/sales\//, "/closer/");
  return url;
}

// ── SQL Escaping ───────────────────────────────────────────────────
function sqlEsc(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + str.replace(/\0/g, "").replace(/'/g, "''") + "'";
}

// ── CSV Parser (handles quoted fields with embedded ; and newlines) ──
function parseCSV(content) {
  const rows = [];
  let i = 0;
  const len = content.length;
  if (content.charCodeAt(0) === 0xfeff) i = 1;

  // Skip header line
  while (i < len && content[i] !== "\n") i++;
  i++;

  while (i < len) {
    const fields = [];
    let fieldCount = 0;

    while (fieldCount < 9 && i < len) {
      let field = "";
      if (content[i] === '"') {
        i++;
        while (i < len) {
          if (content[i] === '"') {
            if (i + 1 < len && content[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++;
              break;
            }
          } else {
            field += content[i];
            i++;
          }
        }
      } else {
        while (i < len && content[i] !== ";" && content[i] !== "\n" && content[i] !== "\r") {
          field += content[i];
          i++;
        }
      }
      fields.push(field);
      fieldCount++;

      if (i < len && content[i] === ";") {
        i++;
      } else if (i < len && (content[i] === "\r" || content[i] === "\n")) {
        if (content[i] === "\r" && i + 1 < len && content[i + 1] === "\n") i += 2;
        else i++;
        break;
      }
    }

    if (i < len && (content[i] === "\r" || content[i] === "\n")) {
      if (content[i] === "\r" && i + 1 < len && content[i + 1] === "\n") i += 2;
      else i++;
    }

    if (fields.length >= 7) {
      rows.push(fields);
    }
  }
  return rows;
}

// ── Main ───────────────────────────────────────────────────────────
function main() {
  console.log("=== Notifications Migration Script ===\n");

  // Build mapping: old_user_id → email → new_user_id
  const oldIdToEmail = buildOldIdToEmailMap();
  console.log(`Old profiles mapped: ${Object.keys(oldIdToEmail).length}`);

  // Build old_user_id → new_user_id
  const oldToNew = {};
  const unmappedEmails = new Set();
  for (const [oldId, email] of Object.entries(oldIdToEmail)) {
    const newId = NEW_PROFILES[email];
    if (newId) {
      oldToNew[oldId] = newId;
    } else {
      unmappedEmails.add(email);
    }
  }
  console.log(`Old→New user mappings: ${Object.keys(oldToNew).length}`);
  if (unmappedEmails.size > 0) {
    console.log(`Unmapped emails (no new profile): ${[...unmappedEmails].join(", ")}`);
  }

  // Parse notifications CSV
  const raw = readFileSync(CSV_PATH, "utf-8");
  console.log(`\nRead CSV: ${raw.length} bytes`);
  const rows = parseCSV(raw);
  console.log(`Parsed rows: ${rows.length}`);

  // Stats
  let skippedMissingUser = 0;
  let skippedMalformed = 0;
  let skippedBadUuid = 0;
  const missingOldIds = new Set();
  const typeStats = {};
  const priorityStats = {};
  const validRows = [];
  const seenIds = new Set();

  for (let ri = 0; ri < rows.length; ri++) {
    const fields = rows[ri];
    const id = fields[0]?.trim();
    const oldUserId = fields[1]?.trim();
    const title = fields[2]?.trim();
    const message = fields[3]?.trim();
    let type = fields[4]?.trim()?.toLowerCase();
    const readStr = fields[5]?.trim()?.toLowerCase();
    const link = fields[6]?.trim();
    const createdAt = fields[7]?.trim();
    let priority = fields[8]?.trim()?.toLowerCase();

    // Validate id is a UUID
    if (!UUID_RE.test(id)) {
      skippedBadUuid++;
      continue;
    }

    // Deduplicate
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    // Validate old user_id
    if (!UUID_RE.test(oldUserId)) {
      skippedMalformed++;
      continue;
    }

    // Map old → new user_id
    const newUserId = oldToNew[oldUserId];
    if (!newUserId) {
      skippedMissingUser++;
      missingOldIds.add(oldUserId);
      continue;
    }

    // Type
    if (!type || !VALID_TYPES.has(type)) type = "info";
    typeStats[type] = (typeStats[type] || 0) + 1;

    // Priority
    if (!priority || !VALID_PRIORITIES.has(priority)) priority = "normal";
    priorityStats[priority] = (priorityStats[priority] || 0) + 1;

    // Boolean
    const readBool = readStr === "true";

    // URL
    const rewrittenLink = rewriteUrl(link);

    // Title is required
    if (!title) {
      skippedMalformed++;
      continue;
    }

    validRows.push({
      id,
      userId: newUserId,
      title,
      message: message || "",
      type,
      priority,
      read: readBool,
      link: rewrittenLink,
      createdAt: createdAt || new Date().toISOString(),
    });
  }

  console.log(`\n=== Results ===`);
  console.log(`Valid rows: ${validRows.length}`);
  console.log(`Skipped (missing user mapping): ${skippedMissingUser}`);
  console.log(`Skipped (malformed): ${skippedMalformed}`);
  console.log(`Skipped (bad uuid): ${skippedBadUuid}`);
  console.log(`Unmapped old user IDs: ${missingOldIds.size}`);
  if (missingOldIds.size > 0) {
    console.log(`  → ${[...missingOldIds].join(", ")}`);
  }
  console.log(`\nType distribution:`, typeStats);
  console.log(`Priority distribution:`, priorityStats);

  // Generate SQL batches
  const batches = [];
  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    const values = batch.map((r) => {
      const linkVal = r.link ? sqlEsc(r.link) : "NULL";
      return `  (${sqlEsc(r.id)}, ${sqlEsc(TENANT_ID)}, ${sqlEsc(r.userId)}, ${sqlEsc(r.title)}, ${sqlEsc(r.message)}, '${r.type}', '${r.priority}', ${r.read}, ${linkVal}, '{}'::jsonb, ${sqlEsc(r.createdAt)})`;
    });

    const sql = `INSERT INTO notifications (id, tenant_id, user_id, title, message, type, priority, read, link, metadata, created_at)\nVALUES\n${values.join(",\n")}\nON CONFLICT (id) DO NOTHING;`;

    batches.push(sql);
  }

  console.log(`\nGenerated ${batches.length} SQL batches of up to ${BATCH_SIZE} rows each.`);

  // Write batch JSON for programmatic use
  const batchesPath = resolve(
    "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/clipsos-hub/scripts/notifications-batches.json",
  );
  writeFileSync(batchesPath, JSON.stringify(batches, null, 2), "utf-8");
  console.log(`Batch JSON written to: ${batchesPath}`);
  console.log(`Total rows to insert: ${validRows.length}`);
}

main();
