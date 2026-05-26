import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANON_KEY = "sb_publishable_utCaD8K6RdfbqIqOT9X9iw_wmz6fFkf";
const URL = "https://toyekrhhzqmltstrycdv.supabase.co/functions/v1/bulk-sql-import";

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "import-leads-may18-part5.sql"), "utf-8");
  console.log("Sending Part 5 SQL to Edge Function...");
  
  const resp = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
      "apikey": ANON_KEY
    },
    body: JSON.stringify({ sql })
  });

  console.log("Response status:", resp.status);
  const text = await resp.text();
  console.log("Response body:", text.substring(0, 1000));
}

main().catch(console.error);
