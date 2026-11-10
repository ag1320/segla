import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccounts, findAccountByNumber } from "../../controllers/business/accountsController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { findClosingEntries } from "../../controllers/business/journalEntriesController.js";
import { postJournalEntry } from "./postingService.js";
import { ConflictError, NotFoundError, ValidationError } from "../../utils/errors.js";

const RETAINED_EARNINGS = 3900;

// Closing a year: one entry on Dec 31 zeroes every income and expense
// account (property by property) and puts the difference, the year's net
// income, into retained earnings. It sweeps everything through Dec 31, so
// an earlier year left open is closed along with it. Undo it by reversing
// the entry in the Ledger.
async function closeYear({ entityId, year }) {
  await assertEntityExists(entityId);
  const closingDate = `${year}-12-31`;
  const today = new Date().toISOString().slice(0, 10);
  if (closingDate >= today) {
    throw new ValidationError(`${year} isn't over yet`);
  }
  const [accounts, totals, retainedEarnings] = await Promise.all([
    findAccounts(),
    findAccountTotals({ entityId, to: closingDate, byProperty: true }),
    findAccountByNumber(RETAINED_EARNINGS),
  ]);
  const isProfitAndLoss = new Set(
    accounts
      .filter((account) => account.account_type === "income" || account.account_type === "expense")
      .map((account) => account.account_id),
  );

  const lines = totals
    .filter((row) => isProfitAndLoss.has(row.account_id) && row.debit_cents !== row.credit_cents)
    .map((row) => {
      const balance = row.debit_cents - row.credit_cents;
      const side = balance > 0 ? "creditCents" : "debitCents";
      return { accountId: row.account_id, propertyId: row.property_id, [side]: Math.abs(balance) };
    });
  if (lines.length === 0) {
    throw new ConflictError(`Nothing to close for ${year}: it's already closed or had no income or expenses`);
  }
  // Credits minus debits on the closing lines: income (credit-normal)
  // closes with debits, so the year's net income comes out of this sum.
  const netIncomeCents = lines.reduce(
    (total, line) => total + (line.debitCents ?? 0) - (line.creditCents ?? 0),
    0,
  );
  const retainedLine =
    netIncomeCents >= 0
      ? { accountId: retainedEarnings.account_id, creditCents: netIncomeCents }
      : { accountId: retainedEarnings.account_id, debitCents: -netIncomeCents };

  const entry = await postJournalEntry({
    entityId,
    entryDate: closingDate,
    memo: `Close ${year} to retained earnings`,
    source: "closing",
    lines: netIncomeCents === 0 ? lines : [...lines, retainedLine],
  });
  return { ...entry, net_income_cents: netIncomeCents };
}

// Each closed year (not since reopened) and the net income it closed.
async function listYearClosings(entityId) {
  await assertEntityExists(entityId);
  const retainedEarnings = await findAccountByNumber(RETAINED_EARNINGS);
  const closings = await findClosingEntries({ entityId, retainedEarningsAccountId: retainedEarnings.account_id });
  return closings.map((closing) => ({
    year: Number(closing.entry_date.slice(0, 4)),
    journal_entry_id: closing.journal_entry_id,
    entry_date: closing.entry_date,
    net_income_cents: closing.retained_credit_cents - closing.retained_debit_cents,
  }));
}

async function assertEntityExists(entityId) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
}

export { closeYear, listYearClosings };
