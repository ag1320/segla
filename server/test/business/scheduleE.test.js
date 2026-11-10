import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { getScheduleE } from "../../src/services/business/scheduleEService.js";
import { getProfitAndLoss } from "../../src/services/business/financialStatementsService.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";

const accountIdsByNumber = {};
let entityId;
let oakId;
let pineId;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

// 2028: Oak (in service all year) rents for $24,000, Pine (from July 1)
// for $12,000. Company-wide: the CPA's $600 fee (line 10) and $100 of
// software (line 19). Bank interest of $40 is Schedule B, not E.
beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties restart identity",
  );
  [{ property_id: oakId }, { property_id: pineId }] = await knex("properties")
    .insert([
      { entity_id: entityId, name: "Oak", status: "active", placed_in_service_date: "2027-06-01" },
      { entity_id: entityId, name: "Pine", status: "active", placed_in_service_date: "2028-07-01" },
    ])
    .returning("property_id");

  await post([cash(2400000, "in"), line(4000, oakId, 2400000, "credit")]);
  await post([cash(1200000, "in"), line(4000, pineId, 1200000, "credit")]);
  await post([line(5090, oakId, 50000, "debit"), cash(50000, "out")]);
  await post([line(5050, null, 60000, "debit"), cash(60000, "out")]);
  await post([line(5190, null, 100, "debit"), cash(100, "out")]);
  await post([cash(4000, "in"), line(4900, null, 4000, "credit")]);
});

after(() => knex.destroy());

function post(lines) {
  return postJournalEntry({ entityId, entryDate: "2028-09-15", memo: null, source: "manual", lines });
}
const line = (number, propertyId, cents, side) => ({
  accountId: accountIdsByNumber[number],
  propertyId,
  [side === "debit" ? "debitCents" : "creditCents"]: cents,
});
const cash = (cents, direction) => line(1000, null, cents, direction === "in" ? "debit" : "credit");
const amountsOn = (scheduleE, lineNumber) => scheduleE.lines.find((item) => item.line === lineNumber).amounts;

test("company-wide costs split by rent: Oak takes two thirds, Pine one third", async () => {
  const scheduleE = await getScheduleE({ entityId, taxYear: 2028, allocation: "rent" });

  assert.deepEqual(scheduleE.columns.map((column) => column.name), ["Oak", "Pine"]);
  assert.deepEqual(amountsOn(scheduleE, 3), [2400000, 1200000]);
  assert.deepEqual(amountsOn(scheduleE, 10), [40000, 20000]);
  // 100 cents by 2:1 is 66.67 and 33.33: the odd cent goes to the larger remainder.
  assert.deepEqual(amountsOn(scheduleE, 19), [67, 33]);
  assert.deepEqual(scheduleE.income_or_loss, [2400000 - 50000 - 40000 - 67, 1200000 - 20000 - 33]);
  assert.deepEqual(
    scheduleE.not_on_schedule_e.map((item) => [item.account_number, item.amount_cents]),
    [[4900, 4000]],
  );
});

test("Schedule E totals tie to the P&L, whatever the allocation", async () => {
  const profitAndLoss = await getProfitAndLoss({ entityId, from: "2028-01-01", to: "2028-12-31" });

  for (const allocation of ["equal", "rent", "days_in_service"]) {
    const scheduleE = await getScheduleE({ entityId, taxYear: 2028, allocation });
    const scheduleETotal = scheduleE.income_or_loss.reduce((total, amount) => total + amount, 0);
    const offScheduleE = scheduleE.not_on_schedule_e.reduce((total, item) => total + item.amount_cents, 0);
    assert.equal(scheduleETotal + offScheduleE, profitAndLoss.net_income_cents, allocation);
  }
});

test("with no property in service, company-wide costs stay unallocated", async () => {
  await knex("properties").update({ placed_in_service_date: null });
  await knex.raw("truncate reconciled_lines, reconciliations, bank_transactions, journal_lines, journal_entries restart identity");
  await post([line(5050, null, 60000, "debit"), cash(60000, "out")]);

  const scheduleE = await getScheduleE({ entityId, taxYear: 2028, allocation: "equal" });

  assert.deepEqual(scheduleE.columns.map((column) => column.name), ["Not allocated"]);
  assert.deepEqual(amountsOn(scheduleE, 10), [60000]);
});

test("a property not yet in service gets no column or share; its costs are listed apart", async () => {
  const [{ property_id: elmId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Elm", status: "pre_rental" })
    .returning("property_id");
  await post([line(5100, elmId, 2226, "debit"), cash(2226, "out")]);

  const scheduleE = await getScheduleE({ entityId, taxYear: 2028, allocation: "equal" });

  assert.deepEqual(scheduleE.columns.map((column) => column.name), ["Oak", "Pine"]);
  assert.deepEqual(amountsOn(scheduleE, 10), [30000, 30000]);
  assert.deepEqual(
    scheduleE.not_on_schedule_e.map((item) => [item.account_number, item.property_name, item.amount_cents, item.reason]),
    [
      [4900, null, 4000, "no_line"],
      [5100, "Elm", 2226, "not_in_service"],
    ],
  );
});
