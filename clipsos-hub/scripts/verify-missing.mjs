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

// Supabase execute_sql tool equivalent (returns data since we use MCP execute_sql)
const PROJECT_ID = "toyekrhhzqmltstrycdv";
const token = ""; // we don't have local token, but wait, we can just execute a query via our Python/Node code that queries it? No, but wait, we can execute SQL via MCP! Let's print out the missing list first, then we can run a SQL query to check them!

async function main() {
  const text = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(text);
  
  const csvEmails = new Set();
  const emailToRow = {};
  for (let i = 1; i < rows.length; i++) {
    const email = rows[i][2];
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      csvEmails.add(cleanEmail);
      emailToRow[cleanEmail] = rows[i];
    }
  }

  console.log(`CSV has ${csvEmails.size} unique emails.`);
  
  // Write a SQL query to find which of these emails do not exist in crm_people or leads
  const emailList = Array.from(csvEmails);
  
  // Let's generate a temporary sql file that we can run to verify which ones are missing
  const sql = `
    SELECT email FROM (
      VALUES ${emailList.map(e => `('${e.replace(/'/g, "''")}')`).join(",\n")}
    ) as t(email)
    EXCEPT
    SELECT email FROM public.leads WHERE tenant_id = '${tenantId}';
  `;
  
  fs.writeFileSync(path.join(__dirname, "temp-check-missing.sql"), sql);
  console.log("Generated temp-check-missing.sql to check missing emails in leads table.");
}

main().catch(console.error);
