/**
 * CSV Import Script — generates SQL for Supabase import
 * Reads crm_deals and crm_people CSVs and outputs SQL INSERT statements
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TENANT_ID = "520a4cfd-5183-4e11-aecc-bc71a52978b6";
const CSV_DIR = join(process.cwd(), "..", "Database CSV's - OLD APP");

function parseSemicolonCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const headers = lines[0].split(";").map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(";");
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx]?.trim() || null;
    });
    rows.push(row);
  }
  return rows;
}

function esc(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  // Escape single quotes
  const clean = String(val).replace(/'/g, "''");
  return `'${clean}'`;
}

function uuid(val) {
  if (!val || val === "") return "NULL";
  // Validate UUID format
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
    return `'${val}'`;
  }
  return "NULL";
}

function num(val) {
  if (!val || val === "") return "NULL";
  const n = parseFloat(val);
  return isNaN(n) ? "NULL" : String(n);
}

function ts(val) {
  if (!val || val === "") return "NULL";
  return `'${val}'`;
}

// --- DEALS ---
const dealsText = readFileSync(join(CSV_DIR, "crm_deals-export-2026-04-30_20-09-56.csv"), "utf8");
const deals = parseSemicolonCSV(dealsText);

let dealsSql = `-- CRM Deals Import (${deals.length} records)\n`;
dealsSql += `-- Generated ${new Date().toISOString()}\n\n`;

// Build batch INSERT
const dealsBatch = [];
for (const d of deals) {
  dealsBatch.push(
    `(${uuid(d.id)}, '${TENANT_ID}', ${esc(d.name)}, ${esc(d.stage)}, ${esc(d.plan)}, ${num(d.total_videos)}, ${esc(d.payment_method)}, ${esc(d.deal_owner)}, ${uuid(d.person_id)}, ${ts(d.next_due_date)}, ${num(d.stage_order) || 0}, ${esc(d.attio_record_id)}, ${esc(d.region)}, ${ts(d.created_at)}, ${ts(d.updated_at)})`,
  );
}

dealsSql += `INSERT INTO crm_deals (id, tenant_id, name, stage, plan, total_videos, payment_method, deal_owner, person_id, next_due_date, stage_order, attio_record_id, region, created_at, updated_at)\nVALUES\n`;
dealsSql += dealsBatch.join(",\n");
dealsSql += `\nON CONFLICT (id) DO NOTHING;\n`;

writeFileSync(join(process.cwd(), "scripts", "deals-import.sql"), dealsSql);
console.log(`✅ Deals: ${deals.length} records → deals-import.sql`);

// --- PEOPLE ---
const peopleText = readFileSync(join(CSV_DIR, "crm_people-export-2026-04-30_20-12-01.csv"), "utf8");
const people = parseSemicolonCSV(peopleText);

// People has many columns, need to batch in groups of 500
const BATCH_SIZE = 500;
let peopleSql = `-- CRM People Import (${people.length} records)\n`;
peopleSql += `-- Generated ${new Date().toISOString()}\n\n`;

for (let batch = 0; batch < people.length; batch += BATCH_SIZE) {
  const slice = people.slice(batch, batch + BATCH_SIZE);
  const rows = [];
  for (const p of slice) {
    rows.push(
      `(${uuid(p.id)}, '${TENANT_ID}', ${esc(p.full_name)}, ${esc(p.email)}, ${esc(p.phone)}, ${esc(p.invalid_phone_note)}, ${esc(p.job_title)}, ${uuid(p.company_id)}, ${esc(p.company_name)}, ${esc(p.social_link)}, ${esc(p.instagram)}, ${esc(p.facebook)}, ${esc(p.location)}, ${esc(p.country)}, ${esc(p.city)}, ${esc(p.deal_stage)}, ${esc(p.income_range)}, ${esc(p.goal)}, ${esc(p.obstacle)}, ${esc(p.fit)}, ${esc(p.interested_in)}, ${esc(p.payment_link)}, ${esc(p.client_status)}, ${uuid(p.assigned_to)}, ${ts(p.first_calendar_at)}, ${ts(p.last_calendar_at)}, ${esc(p.source)}, ${esc(p.description)}, ${esc(p.notes)}, ${p.active === "false" ? "false" : "true"}, ${esc(p.attio_record_id)}, ${ts(p.created_at)}, ${ts(p.updated_at)})`,
    );
  }
  peopleSql += `INSERT INTO crm_people (id, tenant_id, full_name, email, phone, invalid_phone_note, job_title, company_id, company_name, social_link, instagram, facebook, location, country, city, deal_stage, income_range, goal, obstacle, fit, interested_in, payment_link, client_status, assigned_to, first_calendar_at, last_calendar_at, source, description, notes, active, attio_record_id, created_at, updated_at)\nVALUES\n`;
  peopleSql += rows.join(",\n");
  peopleSql += `\nON CONFLICT (id) DO NOTHING;\n\n`;
}

writeFileSync(join(process.cwd(), "scripts", "people-import.sql"), peopleSql);
console.log(`✅ People: ${people.length} records → people-import.sql`);
