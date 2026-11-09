import knex from "../../controllers/dbConnection.js";
import { findEntity } from "../../controllers/business/entitiesController.js";
import {
  findLockedThroughDate,
  saveLockedThroughDate,
  deletePeriodLock,
} from "../../controllers/business/periodLocksController.js";
import { countNewBankTransactionsThrough } from "../../controllers/business/bankTransactionsController.js";
import { findBankAccounts } from "../../controllers/business/bankAccountsController.js";
import { findLatestReconciliation } from "../../controllers/business/reconciliationsController.js";
import { hasJournalLinesThrough } from "../../controllers/business/journalEntriesController.js";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors.js";
import { isMonthEnd } from "../../utils/isoDates.js";

async function getPeriodLock(entityId) {
  await assertEntityExists(entityId);
  return { entity_id: entityId, locked_through_date: await findLockedThroughDate(entityId) };
}

// Locks the books through the end of a month, so nothing can be posted on
// or before that date. Moving the date earlier, or to null, reopens months
// to fix a mistake.
async function setPeriodLock(entityId, lockedThroughDate) {
  await assertEntityExists(entityId);

  return knex.transaction(async (trx) => {
    if (lockedThroughDate === null) {
      await deletePeriodLock(entityId, trx);
      return { entity_id: entityId, locked_through_date: null };
    }

    if (!isMonthEnd(lockedThroughDate)) {
      throw new ValidationError("Lock through the last day of a month");
    }
    const current = await findLockedThroughDate(entityId, trx);
    const isMovingForward = current === null || lockedThroughDate > current;
    if (isMovingForward) {
      // Once locked, these could only be posted with a later, wrong date.
      const waitingCount = await countNewBankTransactionsThrough(
        { entityId, throughDate: lockedThroughDate },
        trx,
      );
      if (waitingCount > 0) {
        throw new ConflictError(
          `${waitingCount} transaction${waitingCount === 1 ? " is" : "s are"} still waiting in the Inbox on or before ${lockedThroughDate}. Categorize or exclude them first.`,
        );
      }
      await assertReconciledThrough({ entityId, lockedThroughDate }, trx);
    }

    await saveLockedThroughDate(entityId, lockedThroughDate, trx);
    return { entity_id: entityId, locked_through_date: lockedThroughDate };
  });
}

// Every account with activity in the months being locked needs a
// reconciled statement ending on or after the lock date. Otherwise a
// mistake the next statement turns up would land in a locked month.
// Accounts with no entries yet have no statement to reconcile.
async function assertReconciledThrough({ entityId, lockedThroughDate }, trx) {
  const bankAccounts = await findBankAccounts(trx);
  for (const bankAccount of bankAccounts) {
    if (bankAccount.entity_id !== entityId || !bankAccount.is_active) continue;

    const hasActivity = await hasJournalLinesThrough(
      { accountId: bankAccount.account_id, throughDate: lockedThroughDate },
      trx,
    );
    if (!hasActivity) continue;

    const latest = await findLatestReconciliation(bankAccount.bank_account_id, trx);
    if (!latest || latest.statement_date < lockedThroughDate) {
      const reconciledText = latest ? `only through ${latest.statement_date}` : "not reconciled yet";
      throw new ConflictError(
        `${bankAccount.name} is ${reconciledText}. Reconcile its statement that ends on or after ${lockedThroughDate} first.`,
      );
    }
  }
}

async function assertEntityExists(entityId) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
}

export { getPeriodLock, setPeriodLock };
