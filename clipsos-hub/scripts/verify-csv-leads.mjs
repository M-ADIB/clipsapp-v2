import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/Database CSV's - OLD APP/Leads May 18 2026.csv";
const tenantId = "520a4cfd-5183-4e11-aecc-bc71a52978b6";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(current.trim());
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

async function main() {
  const text = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(text);
  const emails = [];

  for (let i = 1; i < rows.length; i++) {
    const email = rows[i][2];
    if (email) {
      emails.push(email.trim());
    }
  }

  console.log(`CSV contains ${emails.length} unique/total emails.`);

  // Query database
  const ANON_KEY = "sb_publishable_utCaD8K6RdfbqIqOT9X9iw_wmz6fFkf";
  const URL = "https://toyekrhhzqmltstrycdv.supabase.co/rest/v1/rpc/exec_sql";

  // Check crm_people
  const crmQuery = `SELECT count(*) FROM public.crm_people WHERE tenant_id = '${tenantId}' AND email IN (${emails.map(e => `'${e.replace(/'/g, "''")}'`).join(",")})`;
  const leadsQuery = `SELECT count(*) FROM public.leads WHERE tenant_id = '${tenantId}' AND email IN (${emails.map(e => `'${e.replace(/'/g, "''")}'`).join(",")})`;

  const runQuery = async (query) => {
    const resp = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({ query })
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
    }
    const text = await resp.text();
    return text ? JSON.parse(text) : null;
  };

  const crmCount = await runQuery(crmQuery);
  const leadsCount = await runQuery(leadsQuery);

  console.log("CRM People matching CSV emails:", JSON.stringify(crmCount));
  console.log("Leads matching CSV emails:", JSON.stringify(leadsCount));
}

main().catch(console.error);
