import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = "toyekrhhzqmltstrycdv";
const BASE_URL = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;

// Try multiple token sources
let TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_AUTH_TOKEN;

if (!TOKEN) {
  const homeDir = os.homedir();
  const configPaths = [
    path.join(homeDir, ".supabase", "access-token"),
    path.join(homeDir, "Library", "Application Support", "supabase", "access-token"),
  ];

  for (const p of configPaths) {
    try {
      TOKEN = fs.readFileSync(p, "utf-8").trim();
      if (TOKEN) break;
    } catch {}
  }
}

if (!TOKEN) {
  console.error(
    "❌ No access token found. Please set SUPABASE_ACCESS_TOKEN or log in to Supabase CLI.",
  );
  process.exit(1);
}

async function executeSql(sql) {
  const resp = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text.substring(0, 300)}`);
  }
  return await resp.json();
}

async function main() {
  const parts = [
    "import-leads-may18-part1.sql",
    "import-leads-may18-part2.sql",
    "import-leads-may18-part3.sql",
    "import-leads-may18-part4.sql",
    "import-leads-may18-part5.sql",
  ];

  console.log(`🚀 Starting execution of ${parts.length} leads SQL parts...`);

  const startTime = Date.now();
  for (const part of parts) {
    const filePath = path.join(__dirname, part);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}, skipping...`);
      continue;
    }

    console.log(`\n📄 Running ${part}...`);
    const sql = fs.readFileSync(filePath, "utf-8");

    try {
      const startPartTime = Date.now();
      const res = await executeSql(sql);
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

  // Verify
  try {
    const countRes = await executeSql(
      "SELECT count(*) FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6';",
    );
    console.log(`📈 Verification: total leads in DB for tenant is ${JSON.stringify(countRes)}`);
  } catch (err) {
    console.error(`⚠️ Verification failed: ${err.message}`);
  }
}

main().catch(console.error);
