import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import {
  postJournalEntry,
  reverseJournalEntry,
} from "../../src/services/business/postingService.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../src/utils/errors.js";

let entityId;
const accountIdsByNumber = {};

before(async () => {
  const entity = await knex("entities")
    .where({ name: "Gettemy Properties" })
    .first();
  entityId = entity.entity_id;
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
});

beforeEach(() =>
  knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, properties restart identity",
  ),
);

after(() => knex.destroy());

function debit(accountNumber, cents) {
  return { accountId: accountIdsByNumber[accountNumber], debitCents: cents };
}

function credit(accountNumber, cents) {
  return { accountId: accountIdsByNumber[accountNumber], creditCents: cents };
}

function post(entryDate, lines) {
  return postJournalEntry({
    entityId,
    entryDate,
    memo: "Test entry",
    source: "manual",
    lines,
  });
}

function lockThrough(lockedThroughDate) {
  return knex("period_locks").insert({
    entity_id: entityId,
    locked_through_date: lockedThroughDate,
  });
}

async function countRows(table) {
  const [{ count }] = await knex(table).count();
  return Number(count);
}

// Debits minus credits, so asset and expense accounts come out positive.
async function balanceOf(accountNumber) {
  const [{ balance }] = await knex("journal_lines")
    .where({ account_id: accountIdsByNumber[accountNumber] })
    .select(knex.raw("coalesce(sum(debit_cents - credit_cents), 0) as balance"));
  return Number(balance);
}

test("a balanced entry is saved with all of its lines", async () => {
  const entry = await post("2026-10-01", [
    debit(1000, 1020000),
    credit(3000, 1020000),
  ]);

  assert.equal(entry.entry_date, "2026-10-01");
  assert.equal(entry.lines.length, 2);
  assert.equal(await balanceOf(1000), 1020000);
  assert.equal(await balanceOf(3000), -1020000);
});

test("an unbalanced entry is rejected and nothing is saved", async () => {
  await assert.rejects(
    post("2026-10-01", [debit(1000, 1020000), credit(3000, 1000000)]),
    ValidationError,
  );
  assert.equal(await countRows("journal_entries"), 0);
  assert.equal(await countRows("journal_lines"), 0);
});

test("each line must be a debit or a credit, not both or neither", async () => {
  const both = {
    accountId: accountIdsByNumber[1000],
    debitCents: 500,
    creditCents: 500,
  };
  const neither = { accountId: accountIdsByNumber[1000] };

  await assert.rejects(post("2026-10-01", [both, credit(3000, 500)]), ValidationError);
  await assert.rejects(
    post("2026-10-01", [neither, debit(1000, 500), credit(3000, 500)]),
    ValidationError,
  );
});

test("an entry needs at least two lines", async () => {
  await assert.rejects(post("2026-10-01", [debit(1000, 500)]), ValidationError);
  await assert.rejects(post("2026-10-01", []), ValidationError);
});

test("amounts must be whole, non-negative cents", async () => {
  await assert.rejects(
    post("2026-10-01", [debit(1000, 10.5), credit(3000, 10.5)]),
    ValidationError,
  );
  await assert.rejects(
    post("2026-10-01", [debit(1000, -500), credit(3000, -500)]),
    ValidationError,
  );
});

test("nothing posts on or before the locked-through date", async () => {
  await lockThrough("2026-09-30");
  const lines = [debit(1000, 500), credit(3000, 500)];

  await assert.rejects(post("2026-09-30", lines), ConflictError);
  await assert.rejects(post("2026-09-15", lines), ConflictError);
  await post("2026-10-01", lines);
  assert.equal(await countRows("journal_entries"), 1);
});

test("a reversal swaps every debit and credit, so each account nets to zero", async () => {
  const original = await post("2026-10-05", [
    debit(5050, 25000),
    credit(2000, 25000),
  ]);

  const reversal = await reverseJournalEntry(original.journal_entry_id, "2026-10-06");

  assert.equal(reversal.reverses_journal_entry_id, original.journal_entry_id);
  assert.equal(reversal.source, "system");
  assert.equal(await balanceOf(5050), 0);
  assert.equal(await balanceOf(2000), 0);
});

test("an entry can be reversed only once, and a reversal can't be reversed", async () => {
  const original = await post("2026-10-05", [
    debit(5050, 25000),
    credit(2000, 25000),
  ]);
  const reversal = await reverseJournalEntry(original.journal_entry_id, "2026-10-06");

  await assert.rejects(
    reverseJournalEntry(original.journal_entry_id, "2026-10-07"),
    ConflictError,
  );
  await assert.rejects(
    reverseJournalEntry(reversal.journal_entry_id, "2026-10-07"),
    ConflictError,
  );
});

test("an entry in a locked period is reversed with an entry dated in the open period", async () => {
  const original = await post("2026-09-10", [
    debit(5050, 25000),
    credit(2000, 25000),
  ]);
  await lockThrough("2026-09-30");

  await assert.rejects(
    reverseJournalEntry(original.journal_entry_id, "2026-09-20"),
    ConflictError,
  );
  await reverseJournalEntry(original.journal_entry_id, "2026-10-01");
  assert.equal(await balanceOf(5050), 0);
});

test("a reversal can't be dated before the entry it reverses", async () => {
  const original = await post("2026-10-05", [
    debit(5050, 25000),
    credit(2000, 25000),
  ]);
  await assert.rejects(
    reverseJournalEntry(original.journal_entry_id, "2026-10-04"),
    ValidationError,
  );
});

test("reversing an entry that doesn't exist is a not-found error", async () => {
  await assert.rejects(reverseJournalEntry(999, "2026-10-01"), NotFoundError);
});

test("assets equal liabilities plus equity plus net income", async () => {
  // Contribution, card expense, card payment, owner draw, bank interest.
  await post("2026-10-01", [debit(1000, 1020000), credit(3000, 1020000)]);
  await post("2026-10-05", [debit(5050, 25000), credit(2000, 25000)]);
  await post("2026-10-20", [debit(2000, 25000), credit(1000, 25000)]);
  await post("2026-10-25", [debit(3100, 50000), credit(1000, 50000)]);
  await post("2026-10-31", [debit(1000, 1234), credit(4900, 1234)]);

  const rows = await knex("journal_lines")
    .join("accounts", "accounts.account_id", "journal_lines.account_id")
    .groupBy("accounts.account_type")
    .select(
      "accounts.account_type",
      knex.raw("sum(debit_cents - credit_cents) as debit_balance"),
    );
  const debitBalance = (type) =>
    Number(rows.find((row) => row.account_type === type)?.debit_balance ?? 0);

  const assets = debitBalance("asset") + debitBalance("contra_asset");
  const liabilities = -debitBalance("liability");
  const equity = -debitBalance("equity");
  const netIncome = -debitBalance("income") - debitBalance("expense");

  assert.equal(assets, 1020000 - 25000 - 50000 + 1234);
  assert.equal(assets, liabilities + equity + netIncome);
});
