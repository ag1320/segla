import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { createLease, keepDeposit, getRentRoll } from "../../src/services/business/leasesService.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";
import { getProfitAndLoss, getBalanceSheet } from "../../src/services/business/financialStatementsService.js";
import { ValidationError } from "../../src/utils/errors.js";

const accountIdsByNumber = {};
let entityId;
let propertyId;
let lease;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

// A year lease from Aug 1, 2027 at $2,400 a month with a $2,400 deposit,
// paid into checking on July 25.
beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Rental", status: "active" })
    .returning("property_id");
  lease = await createLease({
    propertyId,
    tenantName: "Pat Tenant",
    startDate: "2027-08-01",
    endDate: "2028-07-31",
    monthlyRentCents: 240000,
    depositCents: 240000,
  });
  await post("2027-07-25", [
    { accountId: accountIdsByNumber[1000], debitCents: 240000 },
    { accountId: accountIdsByNumber[2100], propertyId, creditCents: 240000 },
  ]);
});

after(() => knex.destroy());

function post(entryDate, lines) {
  return postJournalEntry({ entityId, entryDate, memo: null, source: "manual", lines });
}

const liabilityRow = (balanceSheet, number) =>
  balanceSheet.liabilities.rows.find((row) => row.account_number === number)?.amount_cents ?? 0;

test("a sample lease shows on the rent roll, and its deposit is a liability, not income", async () => {
  const rentRoll = await getRentRoll({ entityId, asOfDate: "2027-08-15" });
  const [row] = rentRoll.rows;
  assert.equal(row.leases[0].tenant_name, "Pat Tenant");
  assert.equal(row.leases[0].status, "active");
  assert.equal(row.monthly_rent_cents, 240000);
  assert.equal(row.deposits_on_leases_cents, row.deposits_held_cents);
  assert.equal(row.is_vacant, false);

  const balanceSheet = await getBalanceSheet({ entityId, asOfDate: "2027-08-15" });
  assert.equal(liabilityRow(balanceSheet, 2100), 240000);
  const profitAndLoss = await getProfitAndLoss({ entityId, from: "2027-07-01", to: "2027-08-31" });
  assert.equal(profitAndLoss.net_income_cents, 0);
});

test("before the lease starts the property is vacant and the lease is upcoming", async () => {
  const [row] = (await getRentRoll({ entityId, asOfDate: "2027-07-28" })).rows;

  assert.equal(row.leases[0].status, "upcoming");
  assert.equal(row.monthly_rent_cents, 0);
  assert.equal(row.is_vacant, true);
  assert.equal(row.deposits_on_leases_cents, row.deposits_held_cents);
});

test("keeping part of a deposit turns it into income, and no more than is held can be kept", async () => {
  await knex("leases").where({ lease_id: lease.lease_id }).update({ move_out_date: "2028-07-31" });

  await assert.rejects(
    keepDeposit(lease.lease_id, { entryDate: "2028-08-05", amountCents: 240001 }),
    ValidationError,
  );
  await keepDeposit(lease.lease_id, { entryDate: "2028-08-05", amountCents: 30000 });
  await post("2028-08-06", [
    { accountId: accountIdsByNumber[2100], propertyId, debitCents: 210000 },
    { accountId: accountIdsByNumber[1000], creditCents: 210000 },
  ]);

  const balanceSheet = await getBalanceSheet({ entityId, asOfDate: "2028-08-31" });
  assert.equal(liabilityRow(balanceSheet, 2100), 0);
  const profitAndLoss = await getProfitAndLoss({ entityId, from: "2028-08-01", to: "2028-08-31" });
  assert.equal(profitAndLoss.net_income_cents, 30000);
  const [row] = (await getRentRoll({ entityId, asOfDate: "2028-08-31" })).rows;
  assert.deepEqual([row.leases.length, row.is_vacant, row.deposits_held_cents], [0, true, 0]);
});

test("a lease past its end date with the tenant still there is month-to-month", async () => {
  const [row] = (await getRentRoll({ entityId, asOfDate: "2028-09-15" })).rows;

  assert.equal(row.leases[0].status, "month_to_month");
  assert.equal(row.monthly_rent_cents, 240000);
});
