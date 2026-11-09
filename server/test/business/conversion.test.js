import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { previewConversion, convertProperty } from "../../src/services/business/conversionService.js";
import { getTrialBalance } from "../../src/services/business/reportsService.js";
import { getBalanceSheet } from "../../src/services/business/financialStatementsService.js";
import { ConflictError } from "../../src/utils/errors.js";

let entityId;
let propertyId;

// $300,000 in the house (price, closing costs, improvements), worth
// $340,000 on move-out day, land 20% of value. Owes $248,000, with $1,500
// in escrow. The lower figure is the basis: $60,000 land, $240,000
// building. Equity moving in: 300,000 + 1,500 − 248,000 = $53,500.
const CONVERSION = {
  placedInServiceDate: "2027-07-15",
  adjustedBasisCents: 30000000,
  fairMarketValueCents: 34000000,
  landPercent: 20,
  mortgageBalanceCents: 24800000,
  escrowBalanceCents: 150000,
};

before(async () => {
  entityId = (await knex("entities").first()).entity_id;
});

beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Test House", status: "pre_rental" })
    .returning("property_id");
});

after(() => knex.destroy());

const countEntries = async () => {
  const row = await knex("journal_entries").count({ count: "*" }).first();
  return Number(row.count);
};

const balanceOf = (trialBalance, number) => {
  const row = trialBalance.rows.find((item) => item.account_number === number);
  return row ? row.debit_cents - row.credit_cents : 0;
};

test("a conversion posts one balanced entry at the lower basis, with the difference as owner equity", async () => {
  const result = await convertProperty(propertyId, CONVERSION);

  assert.equal(result.basis_source, "adjusted_basis");
  assert.deepEqual([result.land_cents, result.building_cents, result.contribution_cents], [6000000, 24000000, 5350000]);

  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2027-07-31" });
  assert.equal(trialBalance.total_debit_cents, trialBalance.total_credit_cents);
  assert.equal(balanceOf(trialBalance, 1500), 6000000);
  assert.equal(balanceOf(trialBalance, 1510), 24000000);
  assert.equal(balanceOf(trialBalance, 1100), 150000);
  assert.equal(balanceOf(trialBalance, 2200), -24800000);
  assert.equal(balanceOf(trialBalance, 3000), -5350000);
  assert.equal(await countEntries(), 1);

  const balanceSheet = await getBalanceSheet({ entityId, asOfDate: "2027-07-31" });
  assert.equal(balanceSheet.assets.total_cents, balanceSheet.total_liabilities_and_equity_cents);
});

test("the property becomes an active rental with land and building assets, and can't convert twice", async () => {
  await convertProperty(propertyId, CONVERSION);

  const property = await knex("properties").where({ property_id: propertyId }).first();
  assert.equal(property.status, "active");
  assert.equal(Number(property.building_basis_cents), 24000000);
  const assets = await knex("fixed_assets").orderBy("asset_class");
  assert.deepEqual(
    assets.map((asset) => [asset.asset_class, Number(asset.cost_cents)]),
    [
      ["building", 24000000],
      ["land", 6000000],
    ],
  );

  await assert.rejects(convertProperty(propertyId, CONVERSION), ConflictError);
});

test("a house worth less than what's in it converts at its market value", async () => {
  const preview = await previewConversion(propertyId, { ...CONVERSION, fairMarketValueCents: 28000000 });

  assert.equal(preview.basis_source, "fair_market_value");
  assert.equal(preview.land_cents + preview.building_cents, 28000000);
  assert.equal(await countEntries(), 0);
});

test("an escrow deficit comes over as money owed and lowers the equity moving in", async () => {
  const preview = await previewConversion(propertyId, { ...CONVERSION, escrowBalanceCents: -40000 });

  const escrowAccountId = (await knex("accounts").where({ account_number: 1100 }).first()).account_id;
  const escrowLine = preview.lines.find((line) => line.account_id === escrowAccountId);
  assert.deepEqual([escrowLine.debit_cents, escrowLine.credit_cents], [0, 40000]);
  assert.equal(preview.contribution_cents, 30000000 - 40000 - 24800000);
  const debits = preview.lines.reduce((total, line) => total + line.debit_cents, 0);
  const credits = preview.lines.reduce((total, line) => total + line.credit_cents, 0);
  assert.equal(debits, credits);
});
