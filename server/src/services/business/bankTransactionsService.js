import knex from "../../controllers/dbConnection.js";
import { findBankAccount } from "../../controllers/business/bankAccountsController.js";
import {
  findBankTransactionForUpdate,
  updateBankTransaction,
} from "../../controllers/business/bankTransactionsController.js";
import { postJournalEntry } from "./postingService.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

// Turns an imported transaction into a posted journal entry.
// splits: [{ accountId, propertyId, amountCents, needsCpaReview }], each
// amount positive, together adding up to the transaction's amount. One
// split is the usual case; several split a purchase across categories.
async function postBankTransaction(bankTransactionId, { memo, splits }) {
  return knex.transaction(async (trx) => {
    const transaction = await findBankTransactionForUpdate(bankTransactionId, trx);
    if (!transaction) {
      throw new NotFoundError(`Bank transaction ${bankTransactionId} not found`);
    }
    if (transaction.status !== "new") {
      throw new ConflictError(`This transaction is already ${transaction.status}`);
    }

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
    return entry;
  });
}

// Moves a transaction between the Inbox ("new") and "excluded" (personal
// spending, card verifications). A posted one is undone by reversing its entry.
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

function formatDollars(cents) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export { postBankTransaction, changeBankTransactionStatus };
