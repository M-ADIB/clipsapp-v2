import fs from "fs";
import path from "path";

const sqlPath =
  "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/clipsos-hub/scripts/import-leads-may18.sql";
const outDir = "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/clipsos-hub/scripts";

function run() {
  console.log("Reading full SQL file...");
  const content = fs.readFileSync(sqlPath, "utf-8");

  // Split by the lead comments "-- Lead "
  const parts = content.split(/-- Lead \d+:/);

  if (parts.length <= 1) {
    console.error("Could not split SQL file into leads.");
    return;
  }

  const header = parts[0].replace("BEGIN;", "").trim();
  const commit = "COMMIT;";

  const leads = parts.slice(1).map((leadSql, idx) => {
    return `-- Lead ${idx + 1}:${leadSql.trim()}`;
  });

  const batchSize = 50;
  const numBatches = Math.ceil(leads.length / batchSize);

  console.log(`Total leads to split: ${leads.length} in ${numBatches} batches of ${batchSize}`);

  for (let b = 0; b < numBatches; b++) {
    const start = b * batchSize;
    const end = Math.min(start + batchSize, leads.length);
    const batchLeads = leads.slice(start, end);

    const batchSql = [
      "-- ClipsOS V2 Leads Import Script - Part " + (b + 1),
      "-- Leads " + (start + 1) + " to " + end,
      ...batchLeads,
    ].join("\n\n");

    const outPath = path.join(outDir, `import-leads-may18-part${b + 1}.sql`);
    fs.writeFileSync(outPath, batchSql);
    console.log(`Saved Part ${b + 1} (${batchLeads.length} leads) to ${outPath}`);
  }
}

run();
