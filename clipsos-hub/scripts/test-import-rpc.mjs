import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANON_KEY = "sb_publishable_utCaD8K6RdfbqIqOT9X9iw_wmz6fFkf";
const URL = "https://toyekrhhzqmltstrycdv.supabase.co/rest/v1/rpc/exec_sql";

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "import-leads-may18-part5.sql"), "utf-8");
  const cleanSql = sql.replace(/\b(BEGIN|COMMIT)\b;?/gi, "");
  
  console.log("Sending cleaned Part 5 SQL directly to exec_sql RPC...");
  
  const resp = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({ query: cleanSql })
  });

  console.log("Response status:", resp.status);
  const text = await resp.text();
  console.log("Response body:", text.substring(0, 1000));
}

main().catch(console.error);
