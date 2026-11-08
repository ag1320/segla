import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import {
  listBankTransactions,
  postBankTransaction,
  postTransfer,
} from "../../src/services/business/bankTransactionsService.js";
import { reverseJournalEntry } from "../../src/services/business/postingService.js";
import { ValidationError, ConflictError } from "../../src/utils/errors.js";

const accountIdsByNumber = {};
const bankAccountIdsByAccountNumber = {};

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  for (const bankAccount of await knex("bank_accounts")) {
    const account = await knex("accounts").where({ account_id: bankAccount.account_id }).first();
    bankAccountIdsByAccountNumber[account.account_number] = bankAccount.bank_account_id;
  }
});

beforeEach(() =>
  knex.raw(
    "truncate bank_transactions, journal_lines, journal_entries, period_locks, rules, vendors restart identity",
  ),
);

after(() => knex.destroy());

let nextHash = 1;
async function importTransaction({
  bankAccountNumber,
  amountCents,
  date = "2026-10-26",
  description = "HARDWARE STORE",
}) {
  const [transaction] = await knex("bank_transactions")
    .insert({
      bank_account_id: bankAccountIdsByAccountNumber[bankAccountNumber],
      transaction_date: date,
      description,
      amount_cents: amountCents,
      dedupe_hash: `hash-${nextHash++}`,
      csv_row: {},
    })
    .returning("bank_transaction_id");
  return transaction.bank_transaction_id;
}

function split(accountNumber, amountCents) {
  return { accountId: accountIdsByNumber[accountNumber], amountCents };
}

function linesByAccountNumber(entry) {
  const numbersById = Object.fromEntries(
    Object.entries(accountIdsByNumber).map(([number, id]) => [id, Number(number)]),
  );
  return entry.lines
    .map((line) => [numbersById[line.account_id], line.debit_cents, line.credit_cents])
    .sort((a, b) => a[0] - b[0]);
}

function findTransaction(bankTransactionId) {
  return knex("bank_transactions").where({ bank_transaction_id: bankTransactionId }).first();
}

test("a debit-card purchase posts as a debit to the expense and a credit to checking", async () => {
  const id = await importTransaction({ bankAccountNumber: 1000, amountCents: -2226 });

  const entry = await postBankTransaction(id, { splits: [split(5100, 2226)] });

  assert.equal(entry.source, "import");
  assert.equal(entry.memo, "HARDWARE STORE");
  assert.deepEqual(linesByAccountNumber(entry), [
    [1000, 0, 2226],
    [5100, 2226, 0],
  ]);
  const transaction = await findTransaction(id);
  assert.equal(transaction.status, "posted");
  assert.equal(transaction.journal_entry_id, entry.journal_entry_id);
});

test("a card charge split across two categories credits the card for the total", async () => {
  const id = await importTransaction({ bankAccountNumber: 2000, amountCents: -10000 });

  const entry = await postBankTransaction(id, {
    splits: [split(5090, 7000), split(5100, 3000)],
  });

  assert.deepEqual(linesByAccountNumber(entry), [
    [2000, 0, 10000],
    [5090, 7000, 0],
    [5100, 3000, 0],
  ]);
});

test("a refund on the card debits the card and credits the expense", async () => {
  const id = await importTransaction({ bankAccountNumber: 2000, amountCents: 1500 });

  const entry = await postBankTransaction(id, { splits: [split(5100, 1500)] });

  assert.deepEqual(linesByAccountNumber(entry), [
    [2000, 1500, 0],
    [5100, 0, 1500],
  ]);
});

test("splits that don't add up to the transaction are rejected and nothing posts", async () => {
  const id = await importTransaction({ bankAccountNumber: 1000, amountCents: -2226 });

  await assert.rejects(
    () => postBankTransaction(id, { splits: [split(5100, 2000)] }),
    ValidationError,
  );
  assert.equal((await findTransaction(id)).status, "new");
  assert.equal((await knex("journal_entries")).length, 0);
});

test("a transaction posts only once", async () => {
  const id = await importTransaction({ bankAccountNumber: 1000, amountCents: -2226 });
  await postBankTransaction(id, { splits: [split(5100, 2226)] });

  await assert.rejects(
    () => postBankTransaction(id, { splits: [split(5100, 2226)] }),
    ConflictError,
  );
  assert.equal((await knex("journal_entries")).length, 1);
});

test("a posting into a locked period leaves the transaction in the Inbox", async () => {
  const id = await importTransaction({ bankAccountNumber: 1000, amountCents: -2226 });
  const entity = await knex("entities").first();
  await knex("period_locks").insert({ entity_id: entity.entity_id, locked_through_date: "2026-10-31" });

  await assert.rejects(
    () => postBankTransaction(id, { splits: [split(5100, 2226)] }),
    ConflictError,
  );
  assert.equal((await findTransaction(id)).status, "new");
});

test("reversing an imported entry sends its transaction back to the Inbox", async () => {
  const id = await importTransaction({ bankAccountNumber: 1000, amountCents: -2226 });
  const entry = await postBankTransaction(id, { splits: [split(5100, 2226)] });

  await reverseJournalEntry(entry.journal_entry_id, "2026-10-27");

  const transaction = await findTransaction(id);
  assert.equal(transaction.status, "new");
  assert.equal(transaction.journal_entry_id, null);
});

test("a card payment from checking and its arrival on the card post as one transfer", async () => {
  const leavingChecking = await importTransaction({ bankAccountNumber: 1000, amountCents: -50000, date: "2026-11-03" });
  const arrivingOnCard = await importTransaction({ bankAccountNumber: 2000, amountCents: 50000, date: "2026-11-04" });

  const inbox = await listBankTransactions({ status: "new" });
  const checkingRow = inbox.find((row) => row.bank_transaction_id === leavingChecking);
  assert.deepEqual(checkingRow.transfer_candidate_ids, [arrivingOnCard]);

  const entry = await postTransfer(arrivingOnCard, leavingChecking);

  assert.equal(entry.entry_date, "2026-11-03");
  assert.deepEqual(linesByAccountNumber(entry), [
    [1000, 0, 50000],
    [2000, 50000, 0],
  ]);
  for (const id of [leavingChecking, arrivingOnCard]) {
    const transaction = await findTransaction(id);
    assert.equal(transaction.status, "posted");
    assert.equal(transaction.journal_entry_id, entry.journal_entry_id);
  }
});

test("a transfer's two sides must be equal, opposite and in different accounts", async () => {
  const payment = await importTransaction({ bankAccountNumber: 1000, amountCents: -50000 });
  const wrongAmount = await importTransaction({ bankAccountNumber: 2000, amountCents: 40000 });
  const sameAccount = await importTransaction({ bankAccountNumber: 1000, amountCents: 50000 });

  await assert.rejects(() => postTransfer(payment, wrongAmount), ValidationError);
  await assert.rejects(() => postTransfer(payment, sameAccount), ValidationError);
  assert.equal((await knex("journal_entries")).length, 0);
});

test("reversing a transfer sends both sides back to the Inbox", async () => {
  const payment = await importTransaction({ bankAccountNumber: 1000, amountCents: -50000 });
  const arrival = await importTransaction({ bankAccountNumber: 2000, amountCents: 50000 });
  const entry = await postTransfer(payment, arrival);

  await reverseJournalEntry(entry.journal_entry_id, "2026-10-27");

  for (const id of [payment, arrival]) {
    assert.equal((await findTransaction(id)).status, "new");
  }
});

test("a card payment can't be categorized to the card, which would count it twice", async () => {
  const payment = await importTransaction({ bankAccountNumber: 1000, amountCents: -50000 });

  await assert.rejects(
    () => postBankTransaction(payment, { splits: [split(2000, 50000)] }),
    ValidationError,
  );
  assert.equal((await findTransaction(payment)).status, "new");
});

test("a rule saved while posting suggests the same category for the next import", async () => {
  const [vendor] = await knex("vendors").insert({ name: "Hardware Store" }).returning("*");
  const first = await importTransaction({ bankAccountNumber: 1000, amountCents: -2226, description: "HARDWARE STORE #12" });

  const entry = await postBankTransaction(first, {
    splits: [{ ...split(5100, 2226), vendorId: vendor.vendor_id }],
    saveRule: { descriptionPattern: "hardware store" },
  });

  const expenseLine = entry.lines.find((line) => line.account_id === accountIdsByNumber[5100]);
  assert.equal(expenseLine.vendor_id, vendor.vendor_id);
  const second = await importTransaction({ bankAccountNumber: 1000, amountCents: -999, description: "HARDWARE STORE #40" });
  const [rule] = await knex("rules");
  const [row] = await listBankTransactions({ status: "new" });
  assert.equal(row.bank_transaction_id, second);
  assert.equal(row.suggested_rule_id, rule.rule_id);
  assert.equal(rule.account_id, accountIdsByNumber[5100]);
  assert.equal(rule.vendor_id, vendor.vendor_id);
});
