import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccounts } from "../../controllers/business/accountsController.js";
import { findAccountTotals, findLedgerLines } from "../../controllers/business/reportsController.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import { dayBefore } from "../../utils/isoDates.js";

const CREDIT_NORMAL_TYPES = ["contra_asset", "liability", "equity", "income"];

// Each account's balance as of asOfDate, in a debit or a credit column.
// Total debits always equal total credits, because every entry balanced;
// a trial balance that doesn't net to zero means the books are broken.
// Accounts with a zero balance are left out. beforeClosing leaves out a
// year-end close dated asOfDate (the balances the CPA works from), while
// earlier years stay closed.
async function getTrialBalance({ entityId, asOfDate, beforeClosing = false }) {
  await assertEntityExists(entityId);
  const [accounts, totals, sameDayClosing] = await Promise.all([
    findAccounts(),
    findAccountTotals({ entityId, to: asOfDate }),
    beforeClosing ? findAccountTotals({ entityId, from: asOfDate, to: asOfDate, source: "closing" }) : [],
  ]);
  const netOf = (rows, accountId) => {
    const row = rows.find((item) => item.account_id === accountId);
    return row ? row.debit_cents - row.credit_cents : 0;
  };

  const rows = accounts
    .map((account) => {
      const debitBalance = netOf(totals, account.account_id) - netOf(sameDayClosing, account.account_id);
      return {
        ...accountColumns(account),
        debit_cents: debitBalance > 0 ? debitBalance : 0,
        credit_cents: debitBalance < 0 ? -debitBalance : 0,
      };
    })
    .filter((row) => row.debit_cents !== 0 || row.credit_cents !== 0);

  return {
    entity_id: entityId,
    as_of_date: asOfDate,
    rows,
    total_debit_cents: sum(rows, "debit_cents"),
    total_credit_cents: sum(rows, "credit_cents"),
  };
}

// Every account with activity from `from` through `to`, or a balance
// carried in: its opening balance, each line with a running balance, and
// its closing balance. Balances are on the account's normal side (cash and
// expenses as debits, the card and income as credits), so they read as
// positive numbers.
async function getGeneralLedger({ entityId, from, to }) {
  await assertEntityExists(entityId);
  if (from > to) {
    throw new ValidationError("The start date must be on or before the end date");
  }
  const [accounts, openingTotals, lines] = await Promise.all([
    findAccounts(),
    findAccountTotals({ entityId, to: dayBefore(from) }),
    findLedgerLines({ entityId, from, to }),
  ]);

  const ledgerAccounts = accounts
    .map((account) => {
      const sign = CREDIT_NORMAL_TYPES.includes(account.account_type) ? -1 : 1;
      const opening = openingTotals.find((row) => row.account_id === account.account_id);
      const openingBalance = opening ? sign * (opening.debit_cents - opening.credit_cents) : 0;

      let balance = openingBalance;
      const accountLines = lines
        .filter((line) => line.account_id === account.account_id)
        .map((line) => {
          balance += sign * (line.debit_cents - line.credit_cents);
          return { ...line, balance_cents: balance };
        });

      return {
        ...accountColumns(account),
        opening_balance_cents: openingBalance,
        lines: accountLines,
        closing_balance_cents: balance,
      };
    })
    .filter((account) => account.lines.length > 0 || account.opening_balance_cents !== 0);

  return { entity_id: entityId, from, to, accounts: ledgerAccounts };
}

// Debit and credit totals for each account and property over a period
// (from and to each optional). property_id null is company-wide. The
// P&L, Schedule E and property statements are built from this.
async function getAccountBalances({ entityId, from, to }) {
  await assertEntityExists(entityId);
  return findAccountTotals({ entityId, from, to, byProperty: true });
}

function accountColumns(account) {
  return {
    account_id: account.account_id,
    account_number: account.account_number,
    name: account.name,
    account_type: account.account_type,
  };
}

async function assertEntityExists(entityId) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
}

function sum(rows, column) {
  return rows.reduce((total, row) => total + row[column], 0);
}

export { getTrialBalance, getGeneralLedger, getAccountBalances };
