/**
 * Content Items → Videos Migration Script V3
 * Nulls out created_by and video_uploaded_by when user doesn't exist
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

const TENANT_ID = "520a4cfd-5183-4e11-aecc-bc71a52978b6";

// Valid auth.users IDs from the database
const VALID_USER_IDS = new Set([
  "d57a0a6e-1be7-422f-864f-5535a766a5d4",
  "da438093-e415-42a8-ac35-bc8f8defaf7b",
  "926ec852-5904-4d4e-86ea-c3195e162f71",
  "62dc22dc-f938-4a1b-b3d2-bed4d5e54db9",
  "cbca1385-4edd-41dc-b7c0-f30d3cd10c9f",
  "4752a5a7-c74c-4c86-ae5c-6139f4af84cf",
  "cc52a9e1-e00d-4b5e-9a68-f948f38de34d",
  "81cec010-d6cc-443e-85f8-b89f830be6e8",
  "a9d49c4c-f50c-4730-9f70-dcf111b9fb94",
  "290d26d7-2f11-42b6-9323-acdd3d2f045e",
  "b8fa58dd-f5eb-4e57-9cdd-665fc2dd6e46",
  "ba3cc6fa-d900-4d9a-bc19-581567933bae",
  "0d163ff0-f1ab-4683-9b6c-4e0084499506",
  "1e783bf7-9911-459a-897d-d93d30499eff",
  "70b429c0-0fb6-4561-acfa-5de4df1efa81",
  "31893d39-a9b3-42e4-abe2-87f18a557769",
  "f4861664-8477-4af1-bae1-db92cd70273e",
  "fefbba1c-81ba-483c-8bfa-4dc6b94f349b",
  "4426c1d8-4f41-43f6-aec6-de169ed58e53",
  "ae4e4261-e702-4f23-924d-d09e8fd99814",
  "5acafbb9-b354-4148-abf7-5d34a0d0413b",
  "c579ae6d-5802-4b9e-a25c-7c00a59215d3",
  "3c7a8150-1471-45bb-9c0f-2e4342604c03",
  "6a05b437-57f4-4597-9749-dbc796a7c4cf",
  "a8160fe1-4d6a-41d4-8c13-28c327b91290",
  "c7d37fc6-7426-4018-bdac-521022e23ac8",
  "6b55071f-0850-4608-ac08-f62b5b5be3e2",
  "f7c7351d-5c6e-4c84-b0c4-63ceb53fce52",
  "b5df1282-8c64-49da-8db3-fbd349e23244",
  "19a3b2b8-41d9-4c31-84a5-16cdbbbc0dd4",
  "cbdb5d74-da05-458b-8aa3-25afb341e397",
  "7eb5c9a3-9552-41b0-8b71-3d0ddb01dcc0",
  "79d857a2-f30a-4153-b6d2-3270ecdbd4fd",
  "0054046a-ca5f-4f71-95c0-181071bf6cb1",
  "1ea8b284-24f4-4a99-a362-7de41a466f56",
  "803fc098-b2ca-45e9-8318-048845d7130a",
  "3ddf9bec-30b6-419c-aea5-47a27148f4dc",
  "f9380125-6696-4e89-b014-28893aa1eda6",
  "abc5a362-d918-4347-bc14-e96aeb1f06bd",
  "9ebe5706-5a16-416b-b238-00f500d41809",
  "83a73522-e995-42cb-8a7f-c030d395b84c",
  "4a3385e2-f615-474a-a7e9-f4c293ce692a",
  "ee504e4f-4247-4f94-b3ec-17814e597867",
  "66dff24b-14f0-4f41-9cac-e0a4661b144e",
  "46b8c2a1-deb6-4225-94a3-162968a52f93",
  "63509bbc-c6b6-41f2-b454-08c6c0b61191",
  "db3efb0e-0725-489c-9583-582c72f14296",
  "d8a3c1fe-b12f-4355-b3b3-0a1cd7c73e5f",
  "043536f6-27a9-4f0c-89c3-2caba0f3c51b",
  "e87ffff8-22d0-442d-8cb8-cbd6734f706d",
  "66551e30-47c2-47d5-8120-cbe4810a70ba",
  "c34464c9-8d09-46d8-b4f8-9094263b8a05",
  "f7db2c79-a9fa-466d-97ea-e7294a0cb54b",
  "c76c0f28-5110-44fb-ac0f-015faad6e13a",
  "a1e37a65-2086-4741-846f-dadf1553c835",
  "105eb3a4-ebba-46ba-946e-4db7f7cadcea",
  "fb0d84d5-5216-43c7-863e-75cc3a2e5df2",
  "68e13b3d-0d17-4720-9f7a-17a30edd2bab",
  "ba1f1bf0-b160-406c-850a-fc845b1f4ab5",
  "26363ede-ee00-42b6-ae43-3f1ac6adca16",
]);

const STATUS_MAP = {
  "": "31f98277-b15a-4d30-8345-c89fdab1522e",
  not_started: "31f98277-b15a-4d30-8345-c89fdab1522e",
  ready_edit: "02fc025a-a7f0-4d22-985e-80ab078d66d2",
  in_progress: "02fc025a-a7f0-4d22-985e-80ab078d66d2",
  rough_cut: "ff2a3cbb-2172-453b-ba34-d9d2bcbee832",
  internal_revision: "2a165444-ee18-42ca-b4f1-01b8da6c40df",
  client_revision: "4224a7f0-d88f-4c69-92cb-56480823177e",
  client_approved: "1526effe-981f-4b94-a136-9be56b0c25e0",
  scheduled: "4d54ffb4-3bc9-4c6b-b520-c2d3ab7db4db",
  posted: "99cfaa37-fccc-42fc-8f6f-e3f8c1413bac",
  declined: "0938c541-dde1-4fcb-ba30-8e6ca6105ea1",
  cancelled: "102236d4-dd3c-428e-b95c-c5735b211f04",
};

const VIDEO_TYPE_MAP = {
  talking_head: "3867d909-307c-4138-a5f0-fd56127f305b",
  engaging_series: "fe4b045e-20cf-416b-a674-3089ae942f44",
  ad: "3cc7d215-fc8a-4855-8384-25dfbfd18ee0",
  voice_over: "2e7d310e-a77e-4fe7-883a-dac60afee6d7",
  jump_cut: "8e4d1d79-603b-4508-82b6-3dafa8f77d50",
  podcast_clip: "f26f08f2-9985-4e37-8fe6-0adbac2617c2",
  custom: "e827eb16-61ec-4717-bc5c-eb5db9899d78",
  vsl: "28acdb6e-b80e-40f3-b9f1-1975b63fc2b0",
  caption_video: "36faf411-3d15-4e60-8c95-30234f4df4be",
};

const VALID_PROJECT_IDS = new Set([
  "00b03cc2-88c8-4b5d-b2cc-a2008d13f764",
  "678870cc-598b-460e-af67-e75d4f49c76b",
  "0e66cf08-6f81-48af-a1f5-4e81523be102",
  "9345d8c7-7f0f-4b4e-88af-a6cf83f2c2db",
  "63c026bb-d73f-4897-8940-455f08123b1b",
  "8b2a4d05-50ff-4a77-a22b-19c6bb6da549",
  "e9fff895-adf0-4c5b-95bb-ace80495dd18",
  "6d0d87e3-dc33-42a9-9fa6-795ec61b383b",
  "ffff0859-bc7e-490e-9f27-f8a04be68c41",
  "696e6f41-4573-4f02-94b9-f51cc5041ce4",
  "aeb65ccb-e03d-47a0-8740-c78ee7b7bc05",
  "055305f6-232f-447b-96c9-3b0bb0410041",
  "872e9529-4066-4b24-a1fa-570d04eca889",
  "8a16622f-b9ce-4432-85ab-7786838de035",
  "84bb8694-2e95-496f-877e-e281077d5679",
  "b04591f8-4c2e-4b11-91b4-8c82c0aad926",
  "5122ea10-8795-4904-bb78-7ec8f2d67201",
  "1a2b31c1-d990-479a-93e0-fdbca4bfb91c",
  "5a371eb7-2847-47b9-903b-43bc1c4bed3f",
  "3efb0e46-595c-4c3a-9323-f55a6495dc54",
  "251c96e7-e940-451b-8170-f5e95d69e89f",
  "6e0b33d2-bb3c-483e-96ca-7e64a4905161",
  "41f2feed-4ace-46f2-ada1-78c20eeb9473",
  "1547cbe3-4cbe-469b-a3e8-69ac25d144b9",
  "a5134293-87ea-45ba-aeac-c49cffa21878",
  "2e0a919e-b92d-4ba0-893b-83f16d31edd2",
  "4fe1a82e-20da-4bef-a4a8-7a4372a86152",
  "d395b948-245b-4c5c-9ce2-3f7ef61dd98e",
  "3b8ee2c3-f16f-4b54-8e65-0643e4b32a88",
  "affcfb57-2c42-4fc0-bd8a-a3f1f6d1da13",
  "e952aad2-9895-4a8d-8e11-57bdc69961f1",
  "7ce92b1b-bb76-4c99-810c-c62c741fc7a5",
  "02349266-c5bc-4eee-b0fb-d391e456d431",
]);

function parseCSV(content) {
  const rows = [];
  let headers = null;
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      currentField += char;
      i++;
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ";") {
        currentRow.push(currentField.trim());
        currentField = "";
        i++;
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && i + 1 < content.length && content[i + 1] === "\n") i++;
        currentRow.push(currentField.trim());
        currentField = "";
        if (!headers) {
          headers = currentRow;
        } else if (currentRow.length === headers.length) {
          const obj = {};
          headers.forEach((h, idx) => {
            obj[h] = currentRow[idx] || "";
          });
          rows.push(obj);
        }
        currentRow = [];
        i++;
      } else {
        currentField += char;
        i++;
      }
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (headers && currentRow.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = currentRow[idx] || "";
      });
      rows.push(obj);
    }
  }
  return { headers, rows };
}

function escSQL(val) {
  if (!val || val === "") return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}
function validUserOrNull(val) {
  if (!val || val === "") return "NULL";
  if (VALID_USER_IDS.has(val)) return `'${val}'`;
  return "NULL"; // User doesn't exist in auth.users
}
function intOrNull(val) {
  if (!val || val === "" || isNaN(parseInt(val))) return "NULL";
  return parseInt(val).toString();
}
function bigintOrNull(val) {
  if (!val || val === "" || isNaN(parseInt(val))) return "NULL";
  return parseInt(val).toString();
}
function dateOrNull(val) {
  if (!val || val === "") return "NULL";
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return `'${val}'`;
  return "NULL";
}
function timestampOrNull(val) {
  if (!val || val === "") return "NULL";
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return `'${val}'`;
  return "NULL";
}
function boolOrDefault(val, d = "false") {
  if (val === "true" || val === "t") return "true";
  if (val === "false" || val === "f") return "false";
  return d;
}
function extractVideoType(typesField) {
  if (!typesField || typesField === "{}" || typesField === "") return null;
  try {
    const cleaned = typesField.replace(/\"\"/g, '"');
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  } catch {
    const match = typesField.match(/["']([a-z_]+)["']/);
    if (match) return match[1];
  }
  return null;
}
function resolveStatusId(s) {
  return STATUS_MAP[(s || "").trim().toLowerCase()] || STATUS_MAP[""];
}
function resolveVideoTypeId(tf) {
  const slug = extractVideoType(tf);
  if (!slug) return "NULL";
  return VIDEO_TYPE_MAP[slug] ? `'${VIDEO_TYPE_MAP[slug]}'` : "NULL";
}

// --- Main ---
const csvPath = resolve(
  "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/Database CSV's - OLD APP/updated-content_items-export-2026-05-04_09-09-21.csv",
);
const raw = readFileSync(csvPath, "utf-8");
const { rows } = parseCSV(raw);
console.log(`Parsed ${rows.length} rows`);

const stmts = [];
let nulledCreatedBy = 0;
let nulledUploadedBy = 0;

for (const row of rows) {
  const id = row.id;
  const clientId = row.client_id;
  if (!id || !clientId || !/^[0-9a-f]{8}-/i.test(id)) continue;

  const statusId = resolveStatusId(row.status);
  const videoTypeId = resolveVideoTypeId(row.types);
  const projectId =
    row.project_id && VALID_PROJECT_IDS.has(row.project_id) ? `'${row.project_id}'` : "NULL";

  const createdBy = validUserOrNull(row.created_by);
  const uploadedBy = validUserOrNull(row.video_uploaded_by);

  if (row.created_by && createdBy === "NULL") nulledCreatedBy++;
  if (row.video_uploaded_by && uploadedBy === "NULL") nulledUploadedBy++;

  stmts.push(
    `INSERT INTO videos (id, tenant_id, client_id, project_id, cycle_id, video_title, status_id, video_type_id, priority, post_date, order_index, video_cloudflare_id, video_playback_url, video_thumbnail_url, video_file_name, video_file_size, video_duration, video_width, video_height, aspect_ratio, video_original_url, video_original_storage_path, video_upload_status, video_upload_progress, video_error_message, video_uploaded_at, video_uploaded_by, thumbnail_storage_path, thumbnail_text, caption, caption_approved, caption_context, text_hook, freebie_word, freebie_content, transcript, transcription_status, detected_language, trial_date, notes, created_by, created_at, updated_at, archived_at) VALUES (${[
      `'${id}'`,
      `'${TENANT_ID}'`,
      `'${clientId}'`,
      projectId,
      "NULL",
      escSQL(row.video_title || "Untitled"),
      `'${statusId}'`,
      videoTypeId,
      `'medium'`,
      dateOrNull(row.post_date),
      intOrNull(row.order_index),
      escSQL(row.video_cloudflare_id),
      escSQL(row.video_playback_url),
      escSQL(row.video_thumbnail_url),
      escSQL(row.video_file_name),
      bigintOrNull(row.video_file_size),
      intOrNull(row.video_duration),
      intOrNull(row.video_width),
      intOrNull(row.video_height),
      escSQL(row.aspect_ratio || "9:16"),
      escSQL(row.video_original_url),
      escSQL(row.video_original_storage_path),
      row.video_upload_status && row.video_upload_status !== ""
        ? `'${row.video_upload_status}'::upload_status`
        : `'pending'::upload_status`,
      intOrNull(row.video_upload_progress) || "0",
      escSQL(row.video_error_message),
      timestampOrNull(row.video_uploaded_at),
      uploadedBy,
      escSQL(row.thumbnail_storage_path),
      escSQL(row.thumbnail_text),
      escSQL(row.caption),
      boolOrDefault(row.caption_approved),
      escSQL(row.caption_context),
      escSQL(row.text_hook),
      escSQL(row.freebie_word),
      escSQL(row.freebie_content),
      escSQL(row.transcript),
      escSQL(row.transcription_status || "pending"),
      escSQL(row.detected_language),
      escSQL(row.trial_date),
      escSQL(row.notes),
      createdBy,
      timestampOrNull(row.created_at) || "now()",
      timestampOrNull(row.updated_at) || "now()",
      "NULL",
    ].join(
      ", ",
    )}) ON CONFLICT (id) DO UPDATE SET project_id = COALESCE(EXCLUDED.project_id, videos.project_id), video_title = EXCLUDED.video_title, status_id = EXCLUDED.status_id, video_type_id = COALESCE(EXCLUDED.video_type_id, videos.video_type_id), post_date = EXCLUDED.post_date, order_index = EXCLUDED.order_index, video_cloudflare_id = COALESCE(EXCLUDED.video_cloudflare_id, videos.video_cloudflare_id), video_playback_url = COALESCE(EXCLUDED.video_playback_url, videos.video_playback_url), video_thumbnail_url = COALESCE(EXCLUDED.video_thumbnail_url, videos.video_thumbnail_url), video_file_name = COALESCE(EXCLUDED.video_file_name, videos.video_file_name), video_file_size = COALESCE(EXCLUDED.video_file_size, videos.video_file_size), video_duration = COALESCE(EXCLUDED.video_duration, videos.video_duration), video_width = COALESCE(EXCLUDED.video_width, videos.video_width), video_height = COALESCE(EXCLUDED.video_height, videos.video_height), aspect_ratio = EXCLUDED.aspect_ratio, video_original_url = COALESCE(EXCLUDED.video_original_url, videos.video_original_url), video_original_storage_path = COALESCE(EXCLUDED.video_original_storage_path, videos.video_original_storage_path), video_upload_status = EXCLUDED.video_upload_status, video_upload_progress = EXCLUDED.video_upload_progress, caption = COALESCE(EXCLUDED.caption, videos.caption), caption_approved = EXCLUDED.caption_approved, transcript = COALESCE(EXCLUDED.transcript, videos.transcript), transcription_status = EXCLUDED.transcription_status, detected_language = COALESCE(EXCLUDED.detected_language, videos.detected_language), thumbnail_storage_path = COALESCE(EXCLUDED.thumbnail_storage_path, videos.thumbnail_storage_path), thumbnail_text = COALESCE(EXCLUDED.thumbnail_text, videos.thumbnail_text), text_hook = COALESCE(EXCLUDED.text_hook, videos.text_hook), freebie_word = COALESCE(EXCLUDED.freebie_word, videos.freebie_word), freebie_content = COALESCE(EXCLUDED.freebie_content, videos.freebie_content), notes = COALESCE(EXCLUDED.notes, videos.notes), updated_at = EXCLUDED.updated_at;`,
  );
}

console.log(`Generated ${stmts.length} INSERT statements`);
console.log(`Nulled created_by: ${nulledCreatedBy} (user not in auth.users)`);
console.log(`Nulled video_uploaded_by: ${nulledUploadedBy} (user not in auth.users)`);

// Write combined
const outputDir = resolve(
  "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/clipsos-hub/scripts/migration-b5",
);
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const combined = stmts.join("\n");
writeFileSync(resolve(outputDir, "all_videos.sql"), combined);

// Write batches of 5
const BATCH_SIZE = 5;
let batchNum = 0;
for (let i = 0; i < stmts.length; i += BATCH_SIZE) {
  batchNum++;
  const batch = stmts.slice(i, i + BATCH_SIZE);
  writeFileSync(resolve(outputDir, `b${String(batchNum).padStart(3, "0")}.sql`), batch.join("\n"));
}
console.log(`Written ${batchNum} batch files (${BATCH_SIZE} stmts each)`);
