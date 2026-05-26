import fs from "fs";
import path from "path";

const csvPath =
  "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/Database CSV's - OLD APP/Leads May 18 2026.csv";
const sqlOutPath =
  "/Users/madibbaroudi/Desktop/Dashboards/New Clips App/clipsos-hub/scripts/import-leads-may18.sql";

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
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \n
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

function sqlEscape(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}

function parseDate(dateStr) {
  if (!dateStr) return "now()";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "now()";
  return `'${d.toISOString()}'`;
}

function run() {
  console.log("Reading CSV from:", csvPath);
  const data = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(data);

  if (rows.length === 0) {
    console.error("CSV is empty");
    return;
  }

  console.log("Total logical rows parsed by state machine:", rows.length);

  const sqlStatements = [];
  sqlStatements.push("-- ClipsOS V2 Leads Import Script");
  sqlStatements.push("-- Generated on " + new Date().toISOString());
  sqlStatements.push("BEGIN;");

  let importedCount = 0;
  let skippedNoEmail = 0;
  let skippedShortRow = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3) {
      skippedShortRow++;
      continue; // Skip invalid/empty rows
    }

    // Map fields
    const firstName = row[0] || "";
    const lastName = row[1] || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Unknown Lead";
    const email = row[2] || "";
    const phone = row[3] || "";
    const social = row[4] || "";
    const country = row[5] || "";
    const contentLanguage = row[6] || "";
    const businessType = row[7] || "";
    const monthlyRevenue = row[8] || "";
    const goals = row[9] || "";
    const obstacles = row[10] || "";
    const callConfirmedStr = row[11] || "No";
    const status = row[12] || "new";
    const notes = row[13] || "";
    const dateAdded = row[14] || "";

    if (!email) {
      skippedNoEmail++;
      continue;
    }

    const callConfirmed = callConfirmedStr.toLowerCase() === "yes";
    const createdAtSql = parseDate(dateAdded);

    // Build raw payload JSON object
    const rawPayload = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      social_username: social,
      country: country,
      content_language: contentLanguage,
      business_type: businessType,
      monthly_income_range: monthlyRevenue,
      goals_objectives: goals,
      obstacles: obstacles,
      call_attendance_confirmation: callConfirmedStr,
      status: status,
      notes: notes,
      date_added: dateAdded,
    };

    const rawPayloadStr = JSON.stringify(rawPayload);

    const statement = `
-- Lead ${i}: ${fullName} (${email})
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '${tenantId}',
    ${sqlEscape(fullName)},
    ${sqlEscape(email)},
    ${sqlEscape(phone)},
    ${sqlEscape(social)},
    ${sqlEscape(country)},
    ${sqlEscape(monthlyRevenue)},
    ${sqlEscape(goals)},
    ${sqlEscape(obstacles)},
    ${sqlEscape(notes)},
    ${createdAtSql},
    ${createdAtSql}
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '${tenantId}' AND email = ${sqlEscape(email)}
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '${tenantId}',
  (SELECT id FROM person_id_to_use),
  ${sqlEscape(firstName)},
  ${sqlEscape(lastName)},
  ${sqlEscape(email)},
  ${sqlEscape(phone)},
  ${sqlEscape(social)},
  ${sqlEscape(businessType)},
  ${sqlEscape(monthlyRevenue)},
  ${sqlEscape(goals)},
  ${sqlEscape(obstacles)},
  ${callConfirmed},
  ${sqlEscape(status)},
  ${sqlEscape(rawPayloadStr)}::jsonb,
  ${sqlEscape(country)},
  ${sqlEscape(contentLanguage)},
  false,
  ${createdAtSql},
  ${createdAtSql}
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '${tenantId}' AND email = ${sqlEscape(email)}
);
`;
    sqlStatements.push(statement);
    importedCount++;
  }

  sqlStatements.push("COMMIT;");

  fs.writeFileSync(sqlOutPath, sqlStatements.join("\n"));
  console.log(
    `Successfully generated SQL script at ${sqlOutPath} with ${importedCount} records. (Skipped: no email = ${skippedNoEmail}, short row = ${skippedShortRow})`,
  );
}

run();
