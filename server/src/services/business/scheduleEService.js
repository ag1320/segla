import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccounts } from "../../controllers/business/accountsController.js";
import { findProperties } from "../../controllers/business/propertiesController.js";
import { findLeases } from "../../controllers/business/leasesController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { dayBefore, daysBetween } from "../../utils/isoDates.js";
import { NotFoundError } from "../../utils/errors.js";

// Schedule E's lines 3–19 (lines 20 and 21 are totals).
const SCHEDULE_E_LINES = {
  3: "Rents received",
  4: "Royalties received",
  5: "Advertising",
  6: "Auto and travel",
  7: "Cleaning and maintenance",
  8: "Commissions",
  9: "Insurance",
  10: "Legal and other professional fees",
  11: "Management fees",
  12: "Mortgage interest paid to banks, etc.",
  13: "Other interest",
  14: "Repairs",
  15: "Supplies",
  16: "Taxes",
  17: "Utilities",
  18: "Depreciation expense or depletion",
  19: "Other",
};
const INCOME_LINES = [3, 4];

// How company-wide costs are split across properties. The CPA picks.
const ALLOCATION_METHODS = ["equal", "rent", "days_in_service"];

// Schedule E for taxYear: one column per property in service that year,
// each line the total of the accounts mapped to it. Company-wide amounts
// are split across those properties by `allocation`; if none was in
// service, they stay in an unallocated column. Everything else (accounts
// with no Schedule E line, costs of a property not yet in service) is
// listed apart.
async function getScheduleE({ entityId, taxYear, allocation }) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  const from = `${taxYear}-01-01`;
  const to = `${taxYear}-12-31`;
  const [accounts, allProperties, leases, totals] = await Promise.all([
    findAccounts(),
    findProperties(),
    findLeases({ entityId }),
    findAccountTotals({ entityId, from, to, byProperty: true }),
  ]);
  const accountsById = new Map(accounts.map((account) => [account.account_id, account]));
  // Income reads as credits, expenses as debits.
  const amountOf = (row) => {
    const type = accountsById.get(row.account_id).account_type;
    return type === "income" ? row.credit_cents - row.debit_cents : row.debit_cents - row.credit_cents;
  };
  const profitAndLossRows = totals.filter((row) =>
    ["income", "expense"].includes(accountsById.get(row.account_id).account_type),
  );
  // Only rentals belong on Schedule E: a property not in service by year
  // end (still your home, or bought but not yet rentable) has no column,
  // and its tagged costs are listed apart with it.
  const inService = allProperties.filter(
    (property) =>
      property.entity_id === entityId && property.placed_in_service_date && property.placed_in_service_date <= to,
  );
  const inServiceIds = new Set(inService.map((property) => property.property_id));
  const isOnScheduleE = (row) =>
    accountsById.get(row.account_id).schedule_e_line !== null &&
    (row.property_id === null || inServiceIds.has(row.property_id));
  const onScheduleE = profitAndLossRows.filter(isOnScheduleE);
  const propertyNames = new Map(allProperties.map((property) => [property.property_id, property.name]));

  const properties = inService
    .map((property) => ({
      property_id: property.property_id,
      name: property.name,
      days_in_service: daysInService(property, from, to),
      fair_rental_days: rentedDays(
        leases.filter((lease) => lease.property_id === property.property_id),
        from,
        to,
      ),
    }));

  // cents[line][propertyId or "unallocated"]
  const cents = Object.fromEntries(Object.keys(SCHEDULE_E_LINES).map((line) => [line, {}]));
  const add = (line, column, amount) => {
    cents[line][column] = (cents[line][column] ?? 0) + amount;
  };
  for (const row of onScheduleE.filter((item) => item.property_id !== null)) {
    add(accountsById.get(row.account_id).schedule_e_line, row.property_id, amountOf(row));
  }

  const weights = allocationWeights({ properties, allocation, rentsByProperty: cents[3] });
  for (const row of onScheduleE.filter((item) => item.property_id === null)) {
    const line = accountsById.get(row.account_id).schedule_e_line;
    if (weights === null) {
      add(line, "unallocated", amountOf(row));
      continue;
    }
    splitByWeight(amountOf(row), weights).forEach((share, index) => add(line, properties[index].property_id, share));
  }

  const columns = [
    ...properties.map((property) => property.property_id),
    ...(weights === null && Object.values(cents).some((line) => line.unallocated) ? ["unallocated"] : []),
  ];
  const lines = Object.entries(SCHEDULE_E_LINES).map(([line, label]) => ({
    line: Number(line),
    label,
    amounts: columns.map((column) => cents[line][column] ?? 0),
  }));
  const columnSum = (lineNumbers) =>
    columns.map((_, index) =>
      lines.filter((line) => lineNumbers.includes(line.line)).reduce((total, line) => total + line.amounts[index], 0),
    );
  const incomeByColumn = columnSum(INCOME_LINES);
  const expensesByColumn = columnSum(Object.keys(SCHEDULE_E_LINES).map(Number).filter((line) => !INCOME_LINES.includes(line)));

  return {
    entity_id: entityId,
    tax_year: taxYear,
    allocation: weights === null ? null : allocation,
    columns: columns.map((column) => {
      const property = properties.find((item) => item.property_id === column);
      return property ? { ...property } : { property_id: null, name: "Not allocated", days_in_service: 0, fair_rental_days: 0 };
    }),
    lines,
    total_expenses: expensesByColumn,
    income_or_loss: incomeByColumn.map((income, index) => income - expensesByColumn[index]),
    not_on_schedule_e: notOnScheduleE({
      rows: profitAndLossRows.filter((row) => !isOnScheduleE(row)),
      accountsById,
      propertyNames,
      amountOf,
    }),
  };
}

// Each property's share of company-wide costs, or null when there's no
// property to share them (none in service, or every weight is zero).
function allocationWeights({ properties, allocation, rentsByProperty }) {
  if (properties.length === 0) return null;
  const weightOf = {
    equal: () => 1,
    rent: (property) => Math.max(rentsByProperty[property.property_id] ?? 0, 0),
    days_in_service: (property) => property.days_in_service,
  }[allocation];
  const weights = properties.map(weightOf);
  return weights.some((weight) => weight > 0) ? weights : null;
}

// Splits cents in proportion to weights so the shares add back to exactly
// cents: each share is rounded down, then the leftover cents go to the
// largest remainders.
function splitByWeight(cents, weights) {
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  const exact = weights.map((weight) => (cents * weight) / totalWeight);
  const shares = exact.map(Math.floor);
  let leftover = cents - shares.reduce((total, share) => total + share, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; leftover > 0; i = (i + 1) % byRemainder.length, leftover -= 1) {
    shares[byRemainder[i].index] += 1;
  }
  return shares;
}

// Income and expenses left off Schedule E, by account (and by property for
// a property not yet in service). reason: "no_line" for an account that
// belongs elsewhere (bank interest is Schedule B), "not_in_service" for
// a property that wasn't a rental that year.
function notOnScheduleE({ rows, accountsById, propertyNames, amountOf }) {
  const groups = new Map();
  for (const row of rows) {
    const hasLine = accountsById.get(row.account_id).schedule_e_line !== null;
    const propertyId = hasLine ? row.property_id : null;
    const key = `${row.account_id}-${propertyId}`;
    const group = groups.get(key) ?? {
      account_id: row.account_id,
      property_id: propertyId,
      reason: hasLine ? "not_in_service" : "no_line",
      amount_cents: 0,
    };
    group.amount_cents += amountOf(row);
    groups.set(key, group);
  }
  return [...groups.values()]
    .filter((group) => group.amount_cents !== 0)
    .map((group) => {
      const account = accountsById.get(group.account_id);
      return {
        ...group,
        account_number: account.account_number,
        name: account.name,
        property_name: group.property_id === null ? null : propertyNames.get(group.property_id),
      };
    })
    .sort((a, b) => a.account_number - b.account_number || (a.property_name ?? "").localeCompare(b.property_name ?? ""));
}

function daysInService(property, from, to) {
  if (!property.placed_in_service_date || property.placed_in_service_date > to) return 0;
  const start = property.placed_in_service_date > from ? property.placed_in_service_date : from;
  return daysBetween(start, to) + 1;
}

// Days a tenant was in the property during the year (Schedule E line 2's
// fair rental days), counting overlapping leases once.
function rentedDays(leases, from, to) {
  const days = new Set();
  for (const lease of leases) {
    const start = lease.start_date > from ? lease.start_date : from;
    // A tenant who moves out on a day isn't there that day.
    const lastDay = lease.move_out_date ? dayBefore(lease.move_out_date) : to;
    const end = lastDay < to ? lastDay : to;
    for (let offset = 0; start <= end && offset <= daysBetween(start, end); offset++) {
      days.add(Date.parse(`${start}T00:00:00Z`) + offset * 86400000);
    }
  }
  return days.size;
}

export { getScheduleE, ALLOCATION_METHODS };
