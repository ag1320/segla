import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import {
  postJournalEntry,
  reverseJournalEntry,
} from "../../src/services/business/postingService.js";
import {
  getReconciliationWorksheet,
  reconcile,
  undoReconciliation,
} from "../../src/services/business/reconciliationsService.js";
import { getPeriodLock, setPeriodLock } from "../../src/services/business/periodLocksService.js";
import { ValidationError, ConflictError } from "../../src/utils/errors.js";

const accountIdsByNumber = {};
const bankAccountIdsByAccountNumber = {};
let entityId;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  for (const bankAccount of await knex("bank_accounts")) {
    const account = await knex("accounts").where({ account_id: bankAccount.account_id }).first();
    bankAccountIdsByAccountNumber[account.account_number] = bankAccount.bank_account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

beforeEach(() =>
  knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, journal_lines, journal_entries, period_locks restart identity",
  ),
);

after(() => knex.destroy());

// Posts debitNumber / creditNumber for amountCents and returns the entry.
function post({ date, debitNumber, creditNumber, amountCents }) {
  return postJournalEntry({
    entityId,
    entryDate: date,
    memo: `${debitNumber} / ${creditNumber}`,
    source: "manual",
    lines: [
      { accountId: accountIdsByNumber[debitNumber], debitCents: amountCents },
      { accountId: accountIdsByNumber[creditNumber], creditCents: amountCents },
    ],
  });
}

async function checkingWorksheet(statementDate) {
  return getReconciliationWorksheet(bankAccountIdsByAccountNumber[1000], statementDate);
}

function reconcileChecking(statementDate, statementBalanceCents, lines) {
  return reconcile({
    bankAccountId: bankAccountIdsByAccountNumber[1000],
    statementDate,
    statementBalanceCents,
    clearedLineIds: lines.map((line) => line.journal_line_id),
  });
}

test("a statement reconciles when the last balance plus the cleared lines equals its ending balance", async () => {
  await post({ date: "2026-10-19", debitNumber: 1000, creditNumber: 3000, amountCents: 500000 });
  await post({ date: "2026-10-26", debitNumber: 5100, creditNumber: 1000, amountCents: 2226 });

  const worksheet = await checkingWorksheet("2026-10-31");
  assert.equal(worksheet.starting_balance_cents, 0);
  assert.deepEqual(worksheet.lines.map((line) => line.amount_cents), [500000, -2226]);

  await reconcileChecking("2026-10-31", 497774, worksheet.lines);

  const next = await checkingWorksheet("2026-11-30");
  assert.equal(next.last_statement_date, "2026-10-31");
  assert.equal(next.starting_balance_cents, 497774);
  assert.deepEqual(next.lines, []);
});

test("a statement that doesn't tie is rejected and nothing is cleared", async () => {
  await post({ date: "2026-10-19", debitNumber: 1000, creditNumber: 3000, amountCents: 500000 });
  const worksheet = await checkingWorksheet("2026-10-31");

  await assert.rejects(() => reconcileChecking("2026-10-31", 499999, worksheet.lines), ValidationError);

  assert.equal((await knex("reconciliations")).length, 0);
  assert.equal((await checkingWorksheet("2026-10-31")).lines.length, 1);
});

test("a line left unchecked carries over to the next statement", async () => {
  await post({ date: "2026-10-19", debitNumber: 1000, creditNumber: 3000, amountCents: 500000 });
  await post({ date: "2026-10-30", debitNumber: 5090, creditNumber: 1000, amountCents: 15000 });
  const [deposit, lateCheck] = (await checkingWorksheet("2026-10-31")).lines;

  await reconcileChecking("2026-10-31", 500000, [deposit]);

  const next = await checkingWorksheet("2026-11-30");
  assert.equal(next.starting_balance_cents, 500000);
  assert.deepEqual(next.lines.map((line) => line.journal_line_id), [lateCheck.journal_line_id]);
  await reconcileChecking("2026-11-30", 485000, next.lines);
});

test("a line clears on one statement only", async () => {
  await post({ date: "2026-10-19", debitNumber: 1000, creditNumber: 3000, amountCents: 500000 });
  const { lines } = await checkingWorksheet("2026-10-31");
  await reconcileChecking("2026-10-31", 500000, lines);

  await assert.rejects(() => reconcileChecking("2026-11-30", 1000000, lines), ValidationError);
});

test("a card statement's balance is the amount owed: charges add, payments subtract", async () => {
  await post({ date: "2026-10-05", debitNumber: 5090, creditNumber: 2000, amountCents: 30000 });
  await post({ date: "2026-10-12", debitNumber: 5100, creditNumber: 2000, amountCents: 20000 });
  await post({ date: "2026-10-20", debitNumber: 2000, creditNumber: 1000, amountCents: 30000 });
  const worksheet = await getReconciliationWorksheet(bankAccountIdsByAccountNumber[2000], "2026-10-22");
  assert.deepEqual(worksheet.lines.map((line) => line.amount_cents), [30000, 20000, -30000]);

  await reconcile({
    bankAccountId: bankAccountIdsByAccountNumber[2000],
    statementDate: "2026-10-22",
    statementBalanceCents: 20000,
    clearedLineIds: worksheet.lines.map((line) => line.journal_line_id),
  });
});

test("the books lock only through a month end, and not while older transactions wait in the Inbox", async () => {
  await assert.rejects(() => setPeriodLock(entityId, "2026-10-30"), ValidationError);

  await knex("bank_transactions").insert({
    bank_account_id: bankAccountIdsByAccountNumber[1000],
    transaction_date: "2026-10-26",
    description: "HARDWARE STORE",
    amount_cents: -2226,
    dedupe_hash: "hash-1",
    csv_row: {},
  });
  await assert.rejects(() => setPeriodLock(entityId, "2026-10-31"), ConflictError);
  await setPeriodLock(entityId, "2026-09-30");

  assert.equal((await getPeriodLock(entityId)).locked_through_date, "2026-09-30");
});

test("a locked month can be reopened, but its reconciliation can't be undone while locked", async () => {
  await post({ date: "2026-10-19", debitNumber: 1000, creditNumber: 3000, amountCents: 500000 });
  const { lines } = await checkingWorksheet("2026-10-31");
  const reconciliation = await reconcileChecking("2026-10-31", 500000, lines);
  await setPeriodLock(entityId, "2026-10-31");

  await assert.rejects(() => undoReconciliation(reconciliation.reconciliation_id), ConflictError);
  await assert.rejects(
    () => post({ date: "2026-10-31", debitNumber: 5100, creditNumber: 1000, amountCents: 100 }),
    ConflictError,
  );

  await setPeriodLock(entityId, null);
  await undoReconciliation(reconciliation.reconciliation_id);
  assert.equal((await checkingWorksheet("2026-10-31")).lines.length, 1);
});

test("an entry reversed before it was reconciled cancels out with its reversal", async () => {
  await post({ date: "2026-10-19", debitNumber: 1000, creditNumber: 3000, amountCents: 500000 });
  const mistake = await post({ date: "2026-10-26", debitNumber: 5100, creditNumber: 1000, amountCents: 2226 });
  await reverseJournalEntry(mistake.journal_entry_id, "2026-11-08");
  await post({ date: "2026-10-26", debitNumber: 5090, creditNumber: 1000, amountCents: 2226 });

  const october = await checkingWorksheet("2026-10-31");
  assert.deepEqual(october.lines.map((line) => line.amount_cents), [500000, -2226]);
  await reconcileChecking("2026-10-31", 497774, october.lines);

  assert.deepEqual((await checkingWorksheet("2026-11-30")).lines, []);
});

test("a reconciled entry reversed later shows its reversal on the next statement", async () => {
  await post({ date: "2026-10-19", debitNumber: 1000, creditNumber: 3000, amountCents: 500000 });
  const purchase = await post({ date: "2026-10-26", debitNumber: 5100, creditNumber: 1000, amountCents: 2226 });
  await reconcileChecking("2026-10-31", 497774, (await checkingWorksheet("2026-10-31")).lines);

  await reverseJournalEntry(purchase.journal_entry_id, "2026-11-08");

  const november = await checkingWorksheet("2026-11-30");
  assert.deepEqual(november.lines.map((line) => line.amount_cents), [2226]);
});

test("a month locks only once every account with activity is reconciled through its last day", async () => {
  await post({ date: "2026-10-19", debitNumber: 1000, creditNumber: 3000, amountCents: 1015816 });
  const throughOct26 = (await checkingWorksheet("2026-10-26")).lines;
  await reconcileChecking("2026-10-26", 1015816, throughOct26);
  await post({ date: "2026-10-28", debitNumber: 5100, creditNumber: 1000, amountCents: 6000 });

  await assert.rejects(() => setPeriodLock(entityId, "2026-10-31"), ConflictError);

  const nextStatement = (await checkingWorksheet("2026-11-26")).lines;
  await reconcileChecking("2026-11-26", 1009816, nextStatement);
  await setPeriodLock(entityId, "2026-10-31");

  assert.equal((await getPeriodLock(entityId)).locked_through_date, "2026-10-31");
});
