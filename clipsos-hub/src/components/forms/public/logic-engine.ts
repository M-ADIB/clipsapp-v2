/**
 * Logic Engine — evaluates conditional rules against current form responses.
 * Used by PublicFormPage to determine field visibility and routing.
 */
import type { ConditionalRule, LogicCondition, LogicOperator } from "../form-builder-types";

/** Evaluate a single condition against the current value */
function evaluateCondition(condition: LogicCondition, responses: Record<string, unknown>): boolean {
  const currentValue = responses[condition.field_id];
  const targetValue = condition.value;
  const op = condition.operator;

  // Handle empty checks first
  if (op === "is_empty") {
    return (
      currentValue == null ||
      currentValue === "" ||
      (Array.isArray(currentValue) && currentValue.length === 0)
    );
  }
  if (op === "is_not_empty") {
    return (
      currentValue != null &&
      currentValue !== "" &&
      !(Array.isArray(currentValue) && currentValue.length === 0)
    );
  }

  // Normalize to string for comparison
  const current = String(currentValue ?? "").toLowerCase();
  const target = String(targetValue ?? "").toLowerCase();

  switch (op) {
    case "equals":
      return current === target;
    case "not_equals":
      return current !== target;
    case "contains":
      if (Array.isArray(currentValue)) {
        return (currentValue as string[]).some((v) => String(v).toLowerCase() === target);
      }
      return current.includes(target);
    case "not_contains":
      if (Array.isArray(currentValue)) {
        return !(currentValue as string[]).some((v) => String(v).toLowerCase() === target);
      }
      return !current.includes(target);
    case "greater_than":
      return Number(currentValue) > Number(targetValue);
    case "less_than":
      return Number(currentValue) < Number(targetValue);
    default:
      return false;
  }
}

/** Evaluate a full conditional rule (AND/OR gate) */
export function evaluateRule(rule: ConditionalRule, responses: Record<string, unknown>): boolean {
  if (!rule.conditions || rule.conditions.length === 0) return false;

  if (rule.logic_gate === "any") {
    return rule.conditions.some((c) => evaluateCondition(c, responses));
  }
  // "all" (AND)
  return rule.conditions.every((c) => evaluateCondition(c, responses));
}

/** Check if a field should be visible given current responses */
export function isFieldVisible(
  conditionalLogic: ConditionalRule | null | undefined,
  responses: Record<string, unknown>,
): boolean {
  if (!conditionalLogic) return true; // No logic = always visible

  const result = evaluateRule(conditionalLogic, responses);

  switch (conditionalLogic.action) {
    case "show":
      return result; // Show only when conditions met
    case "hide":
      return !result; // Hide when conditions met
    default:
      return true; // Other actions (skip, disqualify, end) don't affect visibility
  }
}

/** Check if a field triggers a disqualification or routing action */
export function checkFieldAction(
  conditionalLogic: ConditionalRule | null | undefined,
  responses: Record<string, unknown>,
): { action: "disqualify" | "end" | "skip_to_step"; target?: string } | null {
  if (!conditionalLogic) return null;

  const { action, target } = conditionalLogic;
  if (action !== "disqualify" && action !== "end" && action !== "skip_to_step") return null;

  const triggered = evaluateRule(conditionalLogic, responses);
  if (!triggered) return null;

  return { action, target };
}

/** Get list of COUNTRIES for the country field renderer */
export const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];
