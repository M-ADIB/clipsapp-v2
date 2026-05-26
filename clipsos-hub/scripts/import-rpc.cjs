/**
 * Import CRM data via Supabase JS Client + exec_sql RPC
 *
 * Usage: node scripts/import-rpc.cjs [people|deals]
 *
 * Uses the service_role key from .env to bypass RLS.
 */
const fs = require("fs");
const path = require("path");

// Read .env for SUPABASE_URL and service role key
const envPath = path.join(__dirname, "..", ".env");
const envFile = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const envVars = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^(VITE_)?(\w+)=(.+)$/);
  if (match) envVars[match[2]] = match[3].trim().replace(/^["']|["']$/g, "");
}

const SUPABASE_URL =
  envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL || "https://toyekrhhzqmltstrycdv.supabase.co";

// Try to find the service role key
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  envVars.SUPABASE_SERVICE_ROLE_KEY ||
  envVars.SERVICE_ROLE_KEY;

const ANON_KEY =
  process.env.SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY || envVars.VITE_SUPABASE_ANON_KEY;

const API_KEY = SERVICE_ROLE_KEY || ANON_KEY;

if (!API_KEY) {
  console.error("❌ No API key found. Set SUPABASE_SERVICE_ROLE_KEY in .env or env");
  console.error("Keys found:", Object.keys(envVars).join(", "));
  process.exit(1);
}

console.log("🔑 Using key type:", SERVICE_ROLE_KEY ? "service_role" : "anon");
console.log("🌐 URL:", SUPABASE_URL);

async function callRpc(sql) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
      Authorization: `Bearer ${API_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text.substring(0, 500)}`);
  }
}

async function main() {
  const type = process.argv[2] || "people";
  const dir = path.join(__dirname);

  let files;
  if (type === "deals") {
    files = ["deals-import.sql"];
  } else if (type === "leads") {
    files = fs
      .readdirSync(dir)
      .filter((f) => /^import-leads-may18-part\d+\.sql$/.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });
  } else if (type === "people_v2") {
    files = fs
      .readdirSync(dir)
      .filter((f) => /^people_v2_\d{2}\.sql$/.test(f))
      .sort();
  } else {
    // Use the 10x group files (pg00.sql - pg14.sql)
    files = fs
      .readdirSync(dir)
      .filter((f) => /^pg\d{2}\.sql$/.test(f))
      .sort();
  }

  console.log(`\n📦 Importing ${type}: ${files.length} batch(es)\n`);

  let totalSuccess = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const sizeKb = (sql.length / 1024).toFixed(0);

    try {
      await callRpc(sql);
      totalSuccess++;
      const pct = (((i + 1) / files.length) * 100).toFixed(0);
      console.log(`✅ [${i + 1}/${files.length}] ${pct}% — ${file} (${sizeKb}KB)`);
    } catch (err) {
      totalErrors++;
      console.error(`❌ [${i + 1}/${files.length}] ${file} (${sizeKb}KB): ${err.message}`);
    }

    // Rate limiting
    if (i < files.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n📊 Done in ${elapsed}s: ${totalSuccess} OK, ${totalErrors} errors`);
}

main().catch(console.error);
