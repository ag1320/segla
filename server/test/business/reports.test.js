import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { postJournalEntry, reverseJournalEntry } from "../../src/services/business/postingService.js";
import {
  getTrialBalance,
  getGeneralLedger,
  getAccountBalances,
} from "../../src/services/business/reportsService.js";

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
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Test House" })
    .returning("property_id");
});

after(() => knex.destroy());

function post(entryDate, lines) {
  return postJournalEntry({ entityId, entryDate, memo: null, source: "manual", lines });
}
const debit = (number, cents, extra = {}) => ({ accountId: accountIdsByNumber[number], debitCents: cents, ...extra });
const credit = (number, cents, extra = {}) => ({ accountId: accountIdsByNumber[number], creditCents: cents, ...extra });

// A month of typical activity: a contribution, card purchases for the
// house and the company, a card payment, a draw, interest, and a mistake
// that was reversed.
async function postSampleMonth() {
  await post("2026-10-01", [debit(1000, 1020000), credit(3000, 1020000)]);
  await post("2026-10-05", [debit(5100, 25000, { propertyId }), credit(2000, 25000)]);
  await post("2026-10-06", [debit(5020, 4000), credit(2000, 4000)]);
  await post("2026-10-20", [debit(2000, 25000), credit(1000, 25000)]);
  await post("2026-10-25", [debit(3100, 50000), credit(1000, 50000)]);
  await post("2026-10-31", [debit(1000, 1234), credit(4900, 1234)]);
  const mistake = await post("2026-10-15", [debit(5090, 9999), credit(1000, 9999)]);
  await reverseJournalEntry(mistake.journal_entry_id, "2026-10-16");
}

function rowFor(rows, number) {
  return rows.find((row) => row.account_number === number);
}

test("the trial balance nets to zero", async () => {
  await postSampleMonth();

  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2026-10-31" });

  assert.equal(trialBalance.total_debit_cents, trialBalance.total_credit_cents);
  assert.equal(trialBalance.total_debit_cents, 1020000 - 25000 - 50000 + 1234 + 25000 + 4000 + 50000);
  assert.deepEqual(
    [rowFor(trialBalance.rows, 1000).debit_cents, rowFor(trialBalance.rows, 2000).credit_cents],
    [1020000 - 25000 - 50000 + 1234, 4000],
  );
  assert.equal(rowFor(trialBalance.rows, 5090), undefined);
});

test("a trial balance as of an earlier date leaves out later entries", async () => {
  await postSampleMonth();

  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2026-10-05" });

  assert.equal(trialBalance.total_debit_cents, trialBalance.total_credit_cents);
  assert.equal(rowFor(trialBalance.rows, 1000).debit_cents, 1020000);
  assert.equal(rowFor(trialBalance.rows, 2000).credit_cents, 25000);
  assert.equal(rowFor(trialBalance.rows, 3100), undefined);
});

test("each account's general ledger runs from its opening to its closing balance, matching the trial balance", async () => {
  await postSampleMonth();

  const ledger = await getGeneralLedger({ entityId, from: "2026-10-10", to: "2026-10-31" });
  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2026-10-31" });

  const checking = ledger.accounts.find((account) => account.account_number === 1000);
  assert.equal(checking.opening_balance_cents, 1020000);
  assert.deepEqual(
    checking.lines.map((line) => line.balance_cents),
    [1010001, 1020000, 995000, 945000, 946234],
  );
  for (const account of ledger.accounts) {
    const row = rowFor(trialBalance.rows, account.account_number);
    const trialBalanceAmount = row ? row.debit_cents + row.credit_cents : 0;
    assert.equal(Math.abs(account.closing_balance_cents), trialBalanceAmount, `account ${account.account_number}`);
  }
});

test("balances by property add up to the company total for each account", async () => {
  await postSampleMonth();
  await post("2026-10-07", [debit(5100, 1500), credit(2000, 1500)]);

  const balances = await getAccountBalances({ entityId, from: "2026-10-01", to: "2026-10-31" });
  const supplies = balances.filter((row) => row.account_id === accountIdsByNumber[5100]);

  assert.deepEqual(
    supplies.map((row) => [row.property_id, row.debit_cents]).sort(),
    [[propertyId, 25000], [null, 1500]].sort(),
  );
  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2026-10-31" });
  assert.equal(rowFor(trialBalance.rows, 5100).debit_cents, 26500);
});
