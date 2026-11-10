import { centsToDollarsText, centsOrZero, isDollarAmount } from "../businessFormat";

// The deal editor's fields in groups: [field, label, kind, helper]. kind is
// "dollars", "percent" or "years". Dollar fields map to `${field}Cents`.
export const DEAL_FIELD_GROUPS = [
  ["Purchase", [
    ["purchasePrice", "Price", "dollars"],
    ["closingCosts", "Closing costs", "dollars"],
    ["rehab", "Repairs up front", "dollars"],
  ]],
  ["Financing", [
    ["downPaymentPercent", "Down payment", "percent"],
    ["interestRatePercent", "Interest rate", "percent"],
    ["termYears", "Term", "years"],
  ]],
  ["Income", [
    ["monthlyRent", "Rent per month", "dollars"],
    ["otherMonthlyIncome", "Other per month", "dollars", "Laundry, parking"],
    ["vacancyPercent", "Vacancy", "percent"],
  ]],
  ["Expenses", [
    ["propertyTax", "Property tax per year", "dollars"],
    ["insurance", "Insurance per year", "dollars"],
    ["repairsPercent", "Repairs", "percent", "Of rent collected"],
    ["capexPercent", "Capex reserve", "percent", "Of rent collected"],
    ["managementPercent", "Management", "percent", "Of rent collected"],
    ["utilitiesMonthly", "Utilities per month", "dollars"],
    ["hoaMonthly", "HOA per month", "dollars"],
    ["otherExpenses", "Other per year", "dollars"],
  ]],
];

const FIELDS = DEAL_FIELD_GROUPS.flatMap(([, fields]) => fields);
const NUMBER = /^\d+(\.\d+)?$/;

// Common starting assumptions for a single-family rental.
const DEFAULTS = {
  downPaymentPercent: "25",
  interestRatePercent: "7",
  termYears: "30",
  vacancyPercent: "5",
  repairsPercent: "5",
  capexPercent: "5",
  managementPercent: "0",
};

const centsKey = (field) => `${field}Cents`;

// A field's text: the saved value, or for a new deal its default.
function fieldText(deal, field, kind) {
  if (!deal) return DEFAULTS[field] ?? "";
  return kind === "dollars" ? centsToDollarsText(deal.inputs[centsKey(field)]) : String(deal.inputs[field]);
}

// deal is null for a new one.
export function dealToForm(deal) {
  return Object.fromEntries([
    ["name", deal?.name ?? ""],
    ...FIELDS.map(([field, , kind]) => [field, fieldText(deal, field, kind)]),
  ]);
}

// Blank amounts count as zero. null when any field isn't a number.
export function formToInputs(form) {
  const isValid = FIELDS.every(([field, , kind]) =>
    kind === "dollars" ? isDollarAmount(form[field]) : NUMBER.test(form[field].trim())
  );
  if (!isValid) return null;
  return Object.fromEntries(
    FIELDS.map(([field, , kind]) =>
      kind === "dollars" ? [centsKey(field), centsOrZero(form[field])] : [field, Number(form[field])]
    )
  );
}
