/**
 * Import CRM People into Supabase via Management API
 * Usage: SUPABASE_ACCESS_TOKEN=xxx node scripts/import-via-api.cjs [people|deals]
 */
const fs = require("fs");
const path = require("path");

const PROJECT_ID = "toyekrhhzqmltstrycdv";
const BASE_URL = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;

// Try multiple token sources
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_AUTH_TOKEN;

if (!TOKEN) {
  // Fall back to reading from the Supabase CLI config
  const homeDir = require("os").homedir();
  const configPaths = [
    path.join(homeDir, ".supabase", "access-token"),
    path.join(homeDir, "Library", "Application Support", "supabase", "access-token"),
  ];

  let foundToken = null;
  for (const p of configPaths) {
    try {
      foundToken = fs.readFileSync(p, "utf8").trim();
      if (foundToken) break;
    } catch {}
  }

  if (!foundToken) {
    console.error(
      "❌ No access token found. Run: supabase login\n   Or set SUPABASE_ACCESS_TOKEN env var",
    );
    process.exit(1);
  }

  process.env.SUPABASE_ACCESS_TOKEN = foundToken;
}

const ACTIVE_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function executeSql(sql) {
  const resp = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACTIVE_TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text.substring(0, 200)}`);
  }
  return await resp.json();
}

async function main() {
  const type = process.argv[2] || "people";
  const dir = path.join(__dirname);

  let files;
  if (type === "deals") {
    files = ["deals-import.sql"];
  } else {
    files = fs
      .readdirSync(dir)
      .filter((f) => /^people_b\d{3}\.sql$/.test(f))
      .sort();
  }

  console.log(`📦 Importing ${type}: ${files.length} batch(es)\n`);

  let totalSuccess = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sql = fs.readFileSync(path.join(dir, file), "utf8");

    try {
      await executeSql(sql);
      totalSuccess++;
      const pct = (((i + 1) / files.length) * 100).toFixed(0);
      process.stdout.write(`\r✅ [${i + 1}/${files.length}] ${pct}% — ${file}`);
    } catch (err) {
      totalErrors++;
      console.error(`\n❌ [${i + 1}/${files.length}] ${file}: ${err.message}`);
    }

    // Small delay to avoid rate limiting
    if (i < files.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n📊 Done in ${elapsed}s: ${totalSuccess} batches OK, ${totalErrors} errors`);

  // Verify
  try {
    const result = await executeSql(
      `SELECT count(*) FROM crm_${type === "deals" ? "deals" : "people"}`,
    );
    console.log(`📈 Total rows in crm_${type}: ${JSON.stringify(result)}`);
  } catch (err) {
    console.error("Could not verify:", err.message);
  }
}

main().catch(console.error);
