import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { getMarketEquity } from "../../src/services/business/marketEquityService.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";

const accountIdsByNumber = {};
let entityId;
let propertyId;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

// The house comes on at $300,000 (land 60,000 + building 240,000) with a
// $248,000 mortgage and $52,000 of equity put in. $5,000 of depreciation
// since, so its book value is $295,000. $500 of startup costs (paid with
// owner money) sit in 1600. Book equity: 52,000 + 500 − 5,000 = $47,500.
// Market equity: 47,500 + (340,000 − 295,000) − 500 = $92,000.
beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Rental", status: "active", placed_in_service_date: "2027-07-01" })
    .returning("property_id");
  await post("2027-07-01", [
    line(1500, 6000000, "debit", propertyId),
    line(1510, 24000000, "debit", propertyId),
    line(2200, 24800000, "credit", propertyId),
    line(3000, 5200000, "credit"),
  ]);
  await post("2027-12-31", [line(5130, 500000, "debit", propertyId), line(1590, 500000, "credit", propertyId)]);
  await post("2027-08-01", [line(1600, 50000, "debit"), line(3000, 50000, "credit")]);
});

after(() => knex.destroy());

function post(entryDate, lines) {
  return postJournalEntry({ entityId, entryDate, memo: null, source: "manual", lines });
}
const line = (number, cents, side, propertyTag = null) => ({
  accountId: accountIdsByNumber[number],
  propertyId: propertyTag,
  [side === "debit" ? "debitCents" : "creditCents"]: cents,
});

test("market equity swaps each property's book value for its latest valuation and leaves out startup costs", async () => {
  await knex("property_valuations").insert({
    property_id: propertyId,
    valuation_date: "2027-11-01",
    value_cents: 34000000,
    source: "appraisal",
  });

  const equity = await getMarketEquity("2027-12-31");

  // Equity on the books: 52,000 + 500 contributed − 5,000 depreciation.
  assert.equal(equity.book_equity_cents, 4750000);
  assert.deepEqual(
    equity.properties.map((row) => [row.name, row.book_value_cents, row.market_value_cents]),
    [["Rental", 29500000, 34000000]],
  );
  assert.equal(equity.startup_costs_cents, 50000);
  assert.equal(equity.market_equity_cents, 4750000 + (34000000 - 29500000) - 50000);
});

test("without a valuation a property stays at book value, and a later valuation doesn't count early", async () => {
  await knex("property_valuations").insert({
    property_id: propertyId,
    valuation_date: "2028-03-01",
    value_cents: 35000000,
    source: "online_estimate",
  });

  const equity = await getMarketEquity("2027-12-31");

  assert.equal(equity.property_adjustment_cents, 0);
  assert.equal(equity.market_equity_cents, 4750000 - 50000);
});
