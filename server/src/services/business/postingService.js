import knex from "../../controllers/dbConnection.js";
import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccountsByIds } from "../../controllers/business/accountsController.js";
import { findPropertiesByIds } from "../../controllers/business/propertiesController.js";
import { findVendorsByIds } from "../../controllers/business/vendorsController.js";
import { findLockedThroughDate } from "../../controllers/business/periodLocksController.js";
import {
  findJournalEntry,
  findJournalLines,
  insertJournalEntry,
  insertJournalLines,
} from "../../controllers/business/journalEntriesController.js";
import { reopenBankTransactionsForEntry } from "../../controllers/business/bankTransactionsController.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// lines: [{ accountId, propertyId, vendorId, debitCents, creditCents, needsCpaReview }]
// Leave propertyId out for a company-wide line, and vendorId out when no
// vendor applies.
// Pass trx to post inside a caller's transaction (an import marks its bank
// transaction posted in the same transaction).
async function postJournalEntry({ entityId, entryDate, memo, source, lines }, trx = knex) {
  return writeJournalEntry(
    {
      entityId,
      entryDate,
      memo,
      source,
      lines,
      reversesJournalEntryId: null,
    },
    trx,
  );
}

// Posted entries are never edited or deleted. A mistake is undone by a new
// entry, dated entryDate, with every debit and credit swapped.
async function reverseJournalEntry(journalEntryId, entryDate) {
  assertIsoDate(entryDate);

  const original = await findJournalEntry(journalEntryId);
  if (!original) {
    throw new NotFoundError(`Journal entry ${journalEntryId} not found`);
  }
  if (original.reverses_journal_entry_id !== null) {
    throw new ConflictError(
      `Entry ${journalEntryId} is itself a reversal and can't be reversed. Post the original entry again instead.`,
    );
  }
  if (original.reversed_by_journal_entry_id !== null) {
    throw new ConflictError(
      `Entry ${journalEntryId} was already reversed by entry ${original.reversed_by_journal_entry_id}`,
    );
  }
  if (entryDate < original.entry_date) {
    throw new ValidationError(
      `A reversal can't be dated before the entry it reverses (${original.entry_date})`,
    );
  }

  const originalLines = await findJournalLines(journalEntryId);
  const reversedLines = originalLines.map((line) => ({
    accountId: line.account_id,
    propertyId: line.property_id,
    vendorId: line.vendor_id,
    debitCents: line.credit_cents,
    creditCents: line.debit_cents,
    needsCpaReview: line.needs_cpa_review,
  }));

  return knex.transaction(async (trx) => {
    const reversal = await writeJournalEntry(
      {
        entityId: original.entity_id,
        entryDate,
        memo: `Reversal of entry ${journalEntryId}`,
        source: "system",
        lines: reversedLines,
        reversesJournalEntryId: journalEntryId,
      },
      trx,
    );
    // An imported transaction whose entry is undone goes back to the Inbox
    // to be categorized again.
    await reopenBankTransactionsForEntry(journalEntryId, trx);
    return reversal;
  });
}

async function writeJournalEntry(
  { entityId, entryDate, memo, source, lines, reversesJournalEntryId },
  parentTrx,
) {
  assertIsoDate(entryDate);
  assertLinesBalance(lines);

  // Inside a caller's transaction this is a savepoint, so the entry commits
  // or rolls back together with the caller's own writes.
  return parentTrx.transaction(async (trx) => {
    const entity = await findEntity(entityId, trx);
    if (!entity) {
      throw new NotFoundError(`Entity ${entityId} not found`);
    }
    await assertPeriodOpen({ entityId, entryDate, trx });
    // A reversal must always be possible, even after an account is retired.
    await assertAccountsUsable({
      lines,
      allowInactive: reversesJournalEntryId !== null,
      trx,
    });
    await assertPropertiesBelongToEntity({ lines, entityId, trx });
    await assertVendorsExist(lines, trx);

    const entry = await insertJournalEntry(
      {
        entity_id: entityId,
        entry_date: entryDate,
        memo,
        source,
        reverses_journal_entry_id: reversesJournalEntryId,
      },
      trx,
    );
    const insertedLines = await insertJournalLines(
      lines.map((line) => ({
        journal_entry_id: entry.journal_entry_id,
        account_id: line.accountId,
        property_id: line.propertyId ?? null,
        vendor_id: line.vendorId ?? null,
        debit_cents: line.debitCents ?? 0,
        credit_cents: line.creditCents ?? 0,
        needs_cpa_review: line.needsCpaReview ?? false,
      })),
      trx,
    );
    return { ...entry, lines: insertedLines };
  });
}

function assertIsoDate(date) {
  const parsed = new Date(date);
  const isValid =
    ISO_DATE.test(date) &&
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date;
  if (!isValid) {
    throw new ValidationError(`"${date}" is not a valid YYYY-MM-DD date`);
  }
}

function assertLinesBalance(lines) {
  if (!Array.isArray(lines) || lines.length < 2) {
    throw new ValidationError("An entry needs at least two lines");
  }

  let totalDebits = 0;
  let totalCredits = 0;
  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    const debit = line.debitCents ?? 0;
    const credit = line.creditCents ?? 0;

    if (!Number.isInteger(line.accountId)) {
      throw new ValidationError(`Line ${lineNumber} needs an account`);
    }
    if (!isWholeCents(debit) || !isWholeCents(credit)) {
      throw new ValidationError(
        `Line ${lineNumber}: amounts must be whole, non-negative cents`,
      );
    }
    if ((debit > 0) === (credit > 0)) {
      throw new ValidationError(
        `Line ${lineNumber} must be either a debit or a credit`,
      );
    }
    totalDebits += debit;
    totalCredits += credit;
  }

  if (totalDebits !== totalCredits) {
    throw new ValidationError(
      `Entry doesn't balance: debits ${formatDollars(totalDebits)}, credits ${formatDollars(totalCredits)}`,
    );
  }
}

async function assertPeriodOpen({ entityId, entryDate, trx }) {
  const lockedThroughDate = await findLockedThroughDate(entityId, trx);
  if (lockedThroughDate && entryDate <= lockedThroughDate) {
    throw new ConflictError(
      `The books are locked through ${lockedThroughDate}. Date the entry after that.`,
    );
  }
}

async function assertAccountsUsable({ lines, allowInactive, trx }) {
  const accountIds = [...new Set(lines.map((line) => line.accountId))];
  const accounts = await findAccountsByIds(accountIds, trx);

  for (const accountId of accountIds) {
    const account = accounts.find((row) => row.account_id === accountId);
    if (!account) {
      throw new ValidationError(`Account ${accountId} doesn't exist`);
    }
    if (!account.is_active && !allowInactive) {
      throw new ValidationError(
        `Account ${account.account_number} ${account.name} is inactive`,
      );
    }
  }
}

async function assertPropertiesBelongToEntity({ lines, entityId, trx }) {
  const propertyIds = [
    ...new Set(
      lines.map((line) => line.propertyId).filter((id) => id != null),
    ),
  ];
  if (propertyIds.length === 0) return;

  const properties = await findPropertiesByIds(propertyIds, trx);
  for (const propertyId of propertyIds) {
    const property = properties.find((row) => row.property_id === propertyId);
    if (!property) {
      throw new ValidationError(`Property ${propertyId} doesn't exist`);
    }
    if (property.entity_id !== entityId) {
      throw new ValidationError(`${property.name} belongs to a different entity`);
    }
  }
}

async function assertVendorsExist(lines, trx) {
  const vendorIds = [
    ...new Set(lines.map((line) => line.vendorId).filter((id) => id != null)),
  ];
  if (vendorIds.length === 0) return;

  const vendors = await findVendorsByIds(vendorIds, trx);
  const missingId = vendorIds.find((id) => !vendors.some((row) => row.vendor_id === id));
  if (missingId !== undefined) {
    throw new ValidationError(`Vendor ${missingId} doesn't exist`);
  }
}

function isWholeCents(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function formatDollars(cents) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export { postJournalEntry, reverseJournalEntry };
