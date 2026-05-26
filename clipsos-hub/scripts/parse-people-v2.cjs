/**
 * CRM People CSV → SQL Import (Proper CSV Parsing)
 *
 * Handles:
 * - Semicolon-delimited CSV with quoted fields
 * - Multi-line quoted fields
 * - Semicolons within quoted values
 * - Data validation for timestamps, UUIDs, booleans
 */
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const TENANT_ID = "520a4cfd-5183-4e11-aecc-bc71a52978b6";
const CSV_PATH = path.join(
  __dirname,
  "..",
  "..",
  "Database CSV's - OLD APP",
  "crm_people-export-2026-04-30_20-12-01.csv",
);
const OUTPUT_DIR = path.join(__dirname);

// ── Column mapping (CSV header → SQL column) ──────────────────────
const COLUMNS = [
  "id",
  "tenant_id",
  "full_name",
  "email",
  "phone",
  "invalid_phone_note",
  "job_title",
  "company_id",
  "company_name",
  "social_link",
  "instagram",
  "facebook",
  "location",
  "country",
  "city",
  "deal_stage",
  "income_range",
  "goal",
  "obstacle",
  "fit",
  "interested_in",
  "payment_link",
  "client_status",
  "assigned_to",
  "first_calendar_at",
  "last_calendar_at",
  "source",
  "description",
  "notes",
  "active",
  "attio_record_id",
  "created_at",
  "updated_at",
];

// ── Value helpers ─────────────────────────────────────────────────
function isValidUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function isValidTimestamp(v) {
  if (!v) return false;
  // Must look like a date/timestamp, not a URL or random text
  return /^\d{4}-\d{2}-\d{2}/.test(v);
}

function esc(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  return "'" + String(v).replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
}

function uuid(v) {
  if (!v || v === "") return "NULL";
  if (isValidUuid(v)) return "'" + v + "'";
  return "NULL";
}

function ts(v) {
  if (!v || v === "") return "NULL";
  if (!isValidTimestamp(v)) return "NULL"; // Skip garbage timestamps
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function bool(v) {
  if (v === "true" || v === true) return "true";
  if (v === "false" || v === false) return "false";
  return "true"; // default
}

// ── Parse CSV ─────────────────────────────────────────────────────
console.log("📄 Reading CSV:", CSV_PATH);
const raw = fs.readFileSync(CSV_PATH, "utf8");

const records = parse(raw, {
  delimiter: ";",
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  relax_quotes: true,
  trim: true,
  quote: '"',
  escape: '"',
});

console.log(`📊 Parsed ${records.length} records`);

// ── Generate SQL batches ──────────────────────────────────────────
const BATCH = 300; // rows per INSERT
let batchIdx = 0;
let totalRows = 0;

// Clean up old batch files
const oldFiles = fs.readdirSync(OUTPUT_DIR).filter((f) => /^people_v2_\d+\.sql$/.test(f));
for (const f of oldFiles) fs.unlinkSync(path.join(OUTPUT_DIR, f));

for (let start = 0; start < records.length; start += BATCH) {
  const slice = records.slice(start, start + BATCH);

  let sql = "INSERT INTO crm_people (" + COLUMNS.join(", ") + ") VALUES\n";

  const values = slice.map((p) => {
    const vals = [
      uuid(p.id),
      `'${TENANT_ID}'`,
      esc(p.full_name),
      esc(p.email),
      esc(p.phone ? p.phone.trim() : null),
      esc(p.invalid_phone_note),
      esc(p.job_title),
      uuid(p.company_id),
      esc(p.company_name),
      esc(p.social_link),
      esc(p.instagram),
      esc(p.facebook),
      esc(p.location),
      esc(p.country),
      esc(p.city),
      esc(p.deal_stage),
      esc(p.income_range),
      esc(p.goal),
      esc(p.obstacle),
      esc(p.fit),
      esc(p.interested_in),
      esc(p.payment_link),
      esc(p.client_status),
      uuid(p.assigned_to),
      ts(p.first_calendar_at),
      ts(p.last_calendar_at),
      esc(p.source),
      esc(p.description),
      esc(p.notes),
      bool(p.active),
      esc(p.attio_record_id),
      ts(p.created_at) === "NULL" ? "NOW()" : ts(p.created_at),
      ts(p.updated_at) === "NULL" ? "NOW()" : ts(p.updated_at),
    ];
    return "(" + vals.join(", ") + ")";
  });

  sql += values.join(",\n") + "\nON CONFLICT (id) DO NOTHING;\n";

  const outFile = `people_v2_${String(batchIdx).padStart(2, "0")}.sql`;
  fs.writeFileSync(path.join(OUTPUT_DIR, outFile), sql);
  totalRows += slice.length;
  batchIdx++;
}

console.log(`✅ Generated ${batchIdx} batch files (${totalRows} rows) → scripts/people_v2_*.sql`);
console.log("🚀 Run: node scripts/import-rpc.cjs people_v2");
