import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANON_KEY = "sb_publishable_utCaD8K6RdfbqIqOT9X9iw_wmz6fFkf";
const URL = "https://toyekrhhzqmltstrycdv.supabase.co/rest/v1/rpc/exec_sql";

async function main() {
  const parts = [
    "import-leads-may18-part1.sql",
    "import-leads-may18-part2.sql",
    "import-leads-may18-part3.sql",
    "import-leads-may18-part4.sql",
    "import-leads-may18-part5.sql"
  ];

  console.log(`🚀 Starting execution of ${parts.length} leads SQL parts via RPC...`);

  const startTime = Date.now();
  for (const part of parts) {
    const filePath = path.join(__dirname, part);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}, skipping...`);
      continue;
    }

    console.log(`\n📄 Running ${part}...`);
    const sql = fs.readFileSync(filePath, "utf-8");
    const cleanSql = sql.replace(/\b(BEGIN|COMMIT)\b;?/gi, "");

    try {
      const startPartTime = Date.now();
      const resp = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": ANON_KEY,
          "Authorization": `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify({ query: cleanSql })
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text.substring(0, 300)}`);
      }

      const elapsedPart = ((Date.now() - startPartTime) / 1000).toFixed(1);
      console.log(`✅ Completed ${part} in ${elapsedPart}s.`);
    } catch (err) {
      console.error(`❌ Error executing ${part}: ${err.message}`);
      process.exit(1);
    }

    // Small delay between batches to be safe
    await new Promise((r) => setTimeout(r, 1000));
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 All SQL batches executed in ${totalElapsed}s.`);
}

main().catch(console.error);
