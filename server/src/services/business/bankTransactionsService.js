import knex from "../../controllers/dbConnection.js";
import {
  findBankAccount,
  findBankAccounts,
} from "../../controllers/business/bankAccountsController.js";
import {
  findBankTransactions,
  findBankTransactionForUpdate,
  updateBankTransaction,
} from "../../controllers/business/bankTransactionsController.js";
import { findRules } from "../../controllers/business/rulesController.js";
import { postJournalEntry } from "./postingService.js";
import { createRule, findMatchingRule } from "./rulesService.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

// A card payment usually lands on the card a day or two after it leaves
// checking. Wider than that, it's probably two different payments.
const TRANSFER_MATCH_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// filters: { status, bankAccountId }, each optional. Inbox rows ("new")
// also carry suggested_rule_id, the rule whose pattern matches the
// description, and transfer_candidate_ids, the other side of a possible
// transfer between two imported accounts.
async function listBankTransactions(filters) {
  const transactions = await findBankTransactions(filters);
  if (filters.status !== "new") return transactions;

  const [rules, bankAccounts, allNew] = await Promise.all([
    findRules(),
    findBankAccounts(),
    findBankTransactions({ status: "new" }),
  ]);
  const entityByBankAccountId = Object.fromEntries(
    bankAccounts.map((bankAccount) => [bankAccount.bank_account_id, bankAccount.entity_id]),
  );

  return transactions.map((transaction) => ({
    ...transaction,
    suggested_rule_id: findMatchingRule(rules, transaction.description)?.rule_id ?? null,
    transfer_candidate_ids: allNew
      .filter((other) => isTransferPair(transaction, other, entityByBankAccountId))
      .map((other) => other.bank_transaction_id),
  }));
}

// Turns an imported transaction into a posted journal entry.
// splits: [{ accountId, propertyId, vendorId, amountCents, needsCpaReview }],
// each amount positive, together adding up to the transaction's amount. One
// split is the usual case; several split a purchase across categories.
// saveRule: { descriptionPattern }, optional, also saves the single split's
// category as a rule for future imports.
async function postBankTransaction(bankTransactionId, { memo, splits, saveRule }) {
  return knex.transaction(async (trx) => {
    const transaction = await findOpenTransaction(bankTransactionId, trx);
    const bankAccount = await findBankAccount(transaction.bank_account_id, trx);
    const size = Math.abs(transaction.amount_cents);

    const splitTotal = splits.reduce((total, split) => total + split.amountCents, 0);
    if (splitTotal !== size) {
      throw new ValidationError(
        `The splits add up to ${formatDollars(splitTotal)}, but the transaction is ${formatDollars(size)}`,
      );
    }
    if (splits.some((split) => split.accountId === bankAccount.account_id)) {
      throw new ValidationError(`A split can't go to ${bankAccount.name} itself`);
    }
    await assertNotAnImportedTransfer(splits, trx);
    if (saveRule && splits.length !== 1) {
      throw new ValidationError("A rule can only be saved from a transaction with one split");
    }

    // Money into the bank account debits its ledger account (checking goes
    // up, or the card balance goes down); money out credits it. The splits
    // take the other side.
    const isMoneyIn = transaction.amount_cents > 0;
    const bankLine = {
      accountId: bankAccount.account_id,
      debitCents: isMoneyIn ? size : 0,
      creditCents: isMoneyIn ? 0 : size,
    };
    const splitLines = splits.map((split) => ({
      accountId: split.accountId,
      propertyId: split.propertyId,
      vendorId: split.vendorId,
      debitCents: isMoneyIn ? 0 : split.amountCents,
      creditCents: isMoneyIn ? split.amountCents : 0,
      needsCpaReview: split.needsCpaReview,
    }));

    const entry = await postJournalEntry(
      {
        entityId: bankAccount.entity_id,
        entryDate: transaction.transaction_date,
        memo: memo || transaction.description,
        source: "import",
        lines: [bankLine, ...splitLines],
      },
      trx,
    );
    await updateBankTransaction(
      bankTransactionId,
      { status: "posted", journal_entry_id: entry.journal_entry_id },
      trx,
    );
    if (saveRule) {
      const [split] = splits;
      await createRule(
        {
          descriptionPattern: saveRule.descriptionPattern,
          accountId: split.accountId,
          propertyId: split.propertyId,
          vendorId: split.vendorId,
        },
        trx,
      );
    }
    return entry;
  });
}

// Posts both sides of a move between two imported accounts (a card payment
// from checking) as one entry, so the money isn't counted twice.
async function postTransfer(bankTransactionId, otherBankTransactionId) {
  if (bankTransactionId === otherBankTransactionId) {
    throw new ValidationError("A transfer needs two different transactions");
  }

  return knex.transaction(async (trx) => {
    // Lock in id order so two overlapping requests can't deadlock.
    const [firstId, secondId] = [bankTransactionId, otherBankTransactionId].sort((a, b) => a - b);
    const first = await findOpenTransaction(firstId, trx);
    const second = await findOpenTransaction(secondId, trx);

    if (first.bank_account_id === second.bank_account_id) {
      throw new ValidationError("Both sides of a transfer are in the same account");
    }
    if (first.amount_cents + second.amount_cents !== 0) {
      throw new ValidationError(
        "A transfer's two sides must be the same amount, one leaving and one arriving",
      );
    }
    const [moneyOut, moneyIn] = first.amount_cents < 0 ? [first, second] : [second, first];
    const fromAccount = await findBankAccount(moneyOut.bank_account_id, trx);
    const toAccount = await findBankAccount(moneyIn.bank_account_id, trx);
    if (fromAccount.entity_id !== toAccount.entity_id) {
      throw new ValidationError("The two accounts belong to different entities");
    }

    const size = moneyIn.amount_cents;
    const entry = await postJournalEntry(
      {
        entityId: fromAccount.entity_id,
        // Cash basis: the transfer happens when the money leaves.
        entryDate: moneyOut.transaction_date,
        memo: `Transfer from ${fromAccount.name} to ${toAccount.name}`,
        source: "import",
        lines: [
          { accountId: toAccount.account_id, debitCents: size },
          { accountId: fromAccount.account_id, creditCents: size },
        ],
      },
      trx,
    );
    for (const side of [moneyOut, moneyIn]) {
      await updateBankTransaction(
        side.bank_transaction_id,
        { status: "posted", journal_entry_id: entry.journal_entry_id },
        trx,
      );
    }
    return entry;
  });
}

// Moves a transaction between the Inbox ("new") and "excluded". Excluded
// rows never reach the ledger, so only exclude ones that cancel out (card
// verification deposits) or duplicates, or the account won't reconcile.
// Personal spending on a business account is an owner draw, not excluded.
// A posted one is undone by reversing its entry.
async function changeBankTransactionStatus(bankTransactionId, status) {
  return knex.transaction(async (trx) => {
    const transaction = await findBankTransactionForUpdate(bankTransactionId, trx);
    if (!transaction) {
      throw new NotFoundError(`Bank transaction ${bankTransactionId} not found`);
    }
    if (transaction.status === "posted") {
      throw new ConflictError(
        `This transaction is posted as entry ${transaction.journal_entry_id}. Reverse that entry instead.`,
      );
    }
    return updateBankTransaction(bankTransactionId, { status }, trx);
  });
}

// Locks the row until trx ends, so two clicks can't post it twice.
async function findOpenTransaction(bankTransactionId, trx) {
  const transaction = await findBankTransactionForUpdate(bankTransactionId, trx);
  if (!transaction) {
    throw new NotFoundError(`Bank transaction ${bankTransactionId} not found`);
  }
  if (transaction.status !== "new") {
    throw new ConflictError(`This transaction is already ${transaction.status}`);
  }
  return transaction;
}

// Categorizing a card payment to the card's ledger account would post the
// payment once from checking and again when the card's side is imported.
async function assertNotAnImportedTransfer(splits, trx) {
  const bankAccounts = await findBankAccounts(trx);
  for (const split of splits) {
    const other = bankAccounts.find(
      (bankAccount) => bankAccount.import_format !== null && bankAccount.account_id === split.accountId,
    );
    if (other) {
      throw new ValidationError(
        `Money moving to or from ${other.name} is a transfer. Import that account's CSV and use Match transfer, so it isn't counted twice.`,
      );
    }
  }
}

function isTransferPair(transaction, other, entityByBankAccountId) {
  const daysApart =
    Math.abs(Date.parse(transaction.transaction_date) - Date.parse(other.transaction_date)) / DAY_MS;
  return (
    other.bank_account_id !== transaction.bank_account_id &&
    entityByBankAccountId[other.bank_account_id] === entityByBankAccountId[transaction.bank_account_id] &&
    other.amount_cents === -transaction.amount_cents &&
    daysApart <= TRANSFER_MATCH_DAYS
  );
}

function formatDollars(cents) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export {
  listBankTransactions,
  postBankTransaction,
  postTransfer,
  changeBankTransactionStatus,
  findOpenTransaction,
};
