import knex from "../../controllers/dbConnection.js";
import { findBankAccount } from "../../controllers/business/bankAccountsController.js";
import { findAccountsByIds } from "../../controllers/business/accountsController.js";
import { findLockedThroughDate } from "../../controllers/business/periodLocksController.js";
import {
  findReconciliation,
  findLatestReconciliation,
  findUnclearedLines,
  insertReconciliation,
  insertReconciledLines,
  deleteReconciliation,
} from "../../controllers/business/reconciliationsController.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

const CREDIT_NORMAL_TYPES = ["contra_asset", "liability", "equity", "income"];

// Everything needed to reconcile one statement: where the last statement
// left off, and every line not cleared yet up to statementDate. Each
// line's amount_cents is signed the way the statement shows it: deposits
// add to checking, and charges add to what's owed on a card.
async function getReconciliationWorksheet(bankAccountId, statementDate) {
  const { bankAccount, isCreditNormal } = await findBankAccountWithSide(bankAccountId);
  const latest = await findLatestReconciliation(bankAccountId);
  const lines = await findUnclearedLines({ accountId: bankAccount.account_id, throughDate: statementDate });

  return {
    bank_account_id: bankAccountId,
    last_statement_date: latest?.statement_date ?? null,
    starting_balance_cents: latest?.statement_balance_cents ?? 0,
    lines: lines.map((line) => ({
      journal_line_id: line.journal_line_id,
      journal_entry_id: line.journal_entry_id,
      entry_date: line.entry_date,
      memo: line.memo,
      amount_cents: signedAmount(line, isCreditNormal),
    })),
  };
}

// Saves a statement as matched. The last statement's balance plus the
// cleared lines must equal this statement's ending balance exactly.
async function reconcile({ bankAccountId, statementDate, statementBalanceCents, clearedLineIds }) {
  const { bankAccount, isCreditNormal } = await findBankAccountWithSide(bankAccountId);

  return knex.transaction(async (trx) => {
    // One reconciliation per account at a time.
    await trx("bank_accounts").where({ bank_account_id: bankAccountId }).forUpdate().first();

    const latest = await findLatestReconciliation(bankAccountId, trx);
    if (latest && statementDate <= latest.statement_date) {
      throw new ValidationError(
        `${bankAccount.name} is already reconciled through ${latest.statement_date}. Pick a later statement date.`,
      );
    }

    const uncleared = await findUnclearedLines(
      { accountId: bankAccount.account_id, throughDate: statementDate },
      trx,
    );
    const clearedIds = new Set(clearedLineIds);
    const cleared = uncleared.filter((line) => clearedIds.has(line.journal_line_id));
    if (cleared.length !== clearedIds.size) {
      throw new ValidationError(
        "Some checked lines aren't open lines of this account on or before the statement date",
      );
    }

    const startingBalance = latest?.statement_balance_cents ?? 0;
    const clearedBalance = cleared.reduce(
      (balance, line) => balance + signedAmount(line, isCreditNormal),
      startingBalance,
    );
    const difference = statementBalanceCents - clearedBalance;
    if (difference !== 0) {
      throw new ValidationError(
        `The checked lines come to ${formatDollars(clearedBalance)}, but the statement says ${formatDollars(statementBalanceCents)} (off by ${formatDollars(difference)})`,
      );
    }

    const reconciliation = await insertReconciliation(
      {
        bank_account_id: bankAccountId,
        statement_date: statementDate,
        statement_balance_cents: statementBalanceCents,
      },
      trx,
    );
    await insertReconciledLines(reconciliation.reconciliation_id, [...clearedIds], trx);
    return reconciliation;
  });
}

// Only an account's latest reconciliation can be undone, and not once its
// month is locked.
async function undoReconciliation(reconciliationId) {
  const reconciliation = await findReconciliation(reconciliationId);
  if (!reconciliation) {
    throw new NotFoundError(`Reconciliation ${reconciliationId} not found`);
  }
  const latest = await findLatestReconciliation(reconciliation.bank_account_id);
  if (latest.reconciliation_id !== reconciliationId) {
    throw new ConflictError(
      `Undo the later statement (${latest.statement_date}) first`,
    );
  }
  const bankAccount = await findBankAccount(reconciliation.bank_account_id);
  const lockedThroughDate = await findLockedThroughDate(bankAccount.entity_id);
  if (lockedThroughDate && reconciliation.statement_date <= lockedThroughDate) {
    throw new ConflictError(
      `The books are locked through ${lockedThroughDate}. Reopen that month first.`,
    );
  }
  await deleteReconciliation(reconciliationId);
}

async function findBankAccountWithSide(bankAccountId) {
  const bankAccount = await findBankAccount(bankAccountId);
  if (!bankAccount) {
    throw new NotFoundError(`Bank account ${bankAccountId} not found`);
  }
  const [account] = await findAccountsByIds([bankAccount.account_id]);
  return { bankAccount, isCreditNormal: CREDIT_NORMAL_TYPES.includes(account.account_type) };
}

function signedAmount(line, isCreditNormal) {
  const change = line.debit_cents - line.credit_cents;
  return isCreditNormal ? -change : change;
}

function formatDollars(cents) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export { getReconciliationWorksheet, reconcile, undoReconciliation };
