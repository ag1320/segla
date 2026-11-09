import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";
import { getOperatingStatement } from "../../src/services/business/operatingStatementService.js";

const accountIdsByNumber = {};
let entityId;
let propertyId;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, properties restart identity",
  );
});

after(() => knex.destroy());

function post(entryDate, lines, source = "manual") {
  return postJournalEntry({ entityId, entryDate, memo: null, source, lines });
}
const debit = (number, cents, tagged = true) => ({
  accountId: accountIdsByNumber[number],
  propertyId: tagged ? propertyId : null,
  debitCents: cents,
});
const credit = (number, cents, tagged = true) => ({
  accountId: accountIdsByNumber[number],
  propertyId: tagged ? propertyId : null,
  creditCents: cents,
});

// A rental placed in service July 15, 2027, market rent $2,500, worth
// $320,000. Vacant until Pat moves in Aug 1 at $2,400. Pat paid Aug–Nov
// but not December, plus a $50 late fee. By hand, Jul 1 – Dec 31:
//   GPR        12,000 scheduled + 2,500 × 17/31 vacant = 13,370.97
//   − vacancy  1,370.97   − uncollected 2,400   = rent collected 9,600
//   + late fee 50                                 = EGI 9,650
//   − insurance 600, repairs 350, taxes 1,800     = NOI 6,900
//   − interest 3,000 − principal 1,500            = cash flow 2,400
//   − new appliance 900                           = 1,500 after capex
// Depreciation (2,000) is below the line. Occupancy 153 of 170 days.
test("the sample property's operating statement matches the hand calculation", async () => {
  [{ property_id: propertyId }] = await knex("properties")
    .insert({
      entity_id: entityId,
      name: "Rental",
      status: "active",
      placed_in_service_date: "2027-07-15",
      market_rent_cents: 250000,
    })
    .returning("property_id");
  await knex("property_valuations").insert({
    property_id: propertyId,
    valuation_date: "2027-07-01",
    value_cents: 32000000,
    source: "appraisal",
  });
  await knex("leases").insert({
    property_id: propertyId,
    tenant_name: "Pat",
    start_date: "2027-08-01",
    monthly_rent_cents: 240000,
  });

  await post("2027-07-15", [debit(1510, 30000000), credit(2200, 25000000), credit(3000, 5000000)], "system");
  for (const month of ["08", "09", "10", "11"]) {
    await post(`2027-${month}-03`, [debit(1000, 240000, false), credit(4000, 240000)]);
  }
  await post("2027-11-20", [debit(1000, 5000, false), credit(4010, 5000)]);
  await post("2027-08-10", [debit(5040, 60000), debit(5090, 35000), debit(5110, 180000), credit(1000, 275000, false)]);
  await post("2027-12-01", [debit(5070, 300000), debit(2200, 150000), credit(1000, 450000, false)]);
  await post("2027-12-31", [debit(5130, 200000), credit(1590, 200000)]);
  await post("2027-09-15", [debit(1540, 90000), credit(1000, 90000, false)]);

  const statement = await getOperatingStatement({ propertyId, from: "2027-07-01", to: "2027-12-31" });

  assert.deepEqual(
    [
      statement.gross_potential_rent_cents,
      statement.vacancy_cents,
      statement.uncollected_rent_cents,
      statement.rent_collected_cents,
      statement.effective_gross_income_cents,
      statement.operating_expenses_cents,
      statement.noi_cents,
      statement.debt_service_cents,
      statement.cash_flow_cents,
      statement.capex_cents,
      statement.cash_flow_after_capex_cents,
    ],
    [1337097, 137097, 240000, 960000, 965000, 275000, 690000, 450000, 240000, 90000, 150000],
  );
  assert.equal(statement.kpis.physical_occupancy, 153 / 170);
  assert.equal(statement.kpis.dscr, 690000 / 450000);
  assert.equal(statement.kpis.cap_rate, (690000 / (184 / 365)) / 32000000);
});
