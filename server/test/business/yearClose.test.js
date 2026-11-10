import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { closeYear, listYearClosings } from "../../src/services/business/yearCloseService.js";
import { postJournalEntry, reverseJournalEntry } from "../../src/services/business/postingService.js";
import { getTrialBalance } from "../../src/services/business/reportsService.js";
import {
  getProfitAndLoss,
  getBalanceSheet,
  getOwnersEquity,
} from "../../src/services/business/financialStatementsService.js";
import { getScheduleE } from "../../src/services/business/scheduleEService.js";
import { ConflictError, ValidationError } from "../../src/utils/errors.js";

const accountIdsByNumber = {};
let entityId;
let propertyId;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

// 2024: $10,000 of rent and $2,000 of repairs on the rental, and a $500
// CPA fee company-wide. Net income $7,500.
beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Rental", status: "active", placed_in_service_date: "2024-01-01" })
    .returning("property_id");
  await post("2024-03-01", [debit(1000, 1000000), credit(4000, 1000000, propertyId)]);
  await post("2024-06-01", [debit(5090, 200000, propertyId), credit(1000, 200000)]);
  await post("2024-12-15", [debit(5050, 50000), credit(1000, 50000)]);
});

after(() => knex.destroy());

function post(entryDate, lines) {
  return postJournalEntry({ entityId, entryDate, memo: null, source: "manual", lines });
}
const debit = (number, cents, propertyTag = null) => ({ accountId: accountIdsByNumber[number], propertyId: propertyTag, debitCents: cents });
const credit = (number, cents, propertyTag = null) => ({ accountId: accountIdsByNumber[number], propertyId: propertyTag, creditCents: cents });
const balanceOf = (trialBalance, number) => {
  const row = trialBalance.rows.find((item) => item.account_number === number);
  return row ? row.debit_cents - row.credit_cents : 0;
};

test("the year closes to retained earnings, and the year's reports still show what happened", async () => {
  const closing = await closeYear({ entityId, year: 2024 });
  assert.equal(closing.net_income_cents, 750000);
  assert.equal(closing.entry_date, "2024-12-31");

  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2024-12-31" });
  assert.deepEqual([4000, 5090, 5050, 3900].map((number) => balanceOf(trialBalance, number)), [0, 0, 0, -750000]);
  assert.equal(trialBalance.total_debit_cents, trialBalance.total_credit_cents);

  const profitAndLoss = await getProfitAndLoss({ entityId, from: "2024-01-01", to: "2024-12-31" });
  assert.equal(profitAndLoss.net_income_cents, 750000);
  const scheduleE = await getScheduleE({ entityId, taxYear: 2024, allocation: "equal" });
  assert.deepEqual(scheduleE.income_or_loss, [750000]);

  const balanceSheet = await getBalanceSheet({ entityId, asOfDate: "2024-12-31" });
  assert.equal(balanceSheet.assets.total_cents, balanceSheet.total_liabilities_and_equity_cents);
  assert.deepEqual(
    balanceSheet.equity.rows.map((row) => [row.name, row.amount_cents]),
    [["Retained Earnings", 750000]],
  );
  const ownersEquity = await getOwnersEquity({ entityId, from: "2024-01-01", to: "2024-12-31" });
  assert.equal(ownersEquity.net_income_cents, 750000);
  assert.equal(ownersEquity.closing_equity_cents, balanceSheet.equity.total_cents);
});

test("a year closes once, only after it ends, and reopens by reversing its close on the same date", async () => {
  const closing = await closeYear({ entityId, year: 2024 });
  assert.deepEqual((await listYearClosings(entityId)).map((item) => [item.year, item.net_income_cents]), [[2024, 750000]]);

  await assert.rejects(closeYear({ entityId, year: 2024 }), ConflictError);
  await assert.rejects(closeYear({ entityId, year: new Date().getFullYear() }), ValidationError);
  await assert.rejects(reverseJournalEntry(closing.journal_entry_id, "2025-01-05"), ValidationError);

  await reverseJournalEntry(closing.journal_entry_id, "2024-12-31");
  assert.deepEqual(await listYearClosings(entityId), []);
  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2024-12-31" });
  assert.deepEqual([4000, 3900].map((number) => balanceOf(trialBalance, number)), [-1000000, 0]);
  const profitAndLoss = await getProfitAndLoss({ entityId, from: "2024-01-01", to: "2024-12-31" });
  assert.equal(profitAndLoss.net_income_cents, 750000);
});
