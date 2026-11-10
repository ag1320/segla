import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccounts } from "../../controllers/business/accountsController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import { dayBefore } from "../../utils/isoDates.js";

// Which side makes each section's amounts read as positive numbers.
const DEBIT_SIDE = 1;
const CREDIT_SIDE = -1;

// Income and expenses for a period, and net income (income minus
// expenses). compareFrom/compareTo add a second column for another period.
// propertyId limits it to one property's lines; company-wide costs are
// left out (Schedule E allocates them in step 7.1).
async function getProfitAndLoss({ entityId, from, to, compareFrom, compareTo, propertyId }) {
  await assertEntityExists(entityId);
  assertPeriod(from, to);
  const hasComparison = compareFrom !== undefined || compareTo !== undefined;
  if (hasComparison) assertPeriod(compareFrom, compareTo);

  const [accounts, totals, compareTotals] = await Promise.all([
    findAccounts(),
    findAccountTotals({ entityId, from, to, propertyId, excludeClosing: true }),
    hasComparison
      ? findAccountTotals({ entityId, from: compareFrom, to: compareTo, propertyId, excludeClosing: true })
      : null,
  ]);
  const columns = [totals, compareTotals];

  const income = buildSection({ accounts, types: ["income"], side: CREDIT_SIDE, columns });
  const expenses = buildSection({ accounts, types: ["expense"], side: DEBIT_SIDE, columns });

  return {
    entity_id: entityId,
    from,
    to,
    compare_from: compareFrom ?? null,
    compare_to: compareTo ?? null,
    property_id: propertyId ?? null,
    income,
    expenses,
    net_income_cents: income.total_cents - expenses.total_cents,
    compare_net_income_cents: hasComparison ? income.compare_total_cents - expenses.compare_total_cents : null,
  };
}

// What the business owns, owes, and the owner's stake, as of a date, with
// an optional second date to compare. Until a year is closed (step 7.3),
// income and expenses aren't moved into Retained Earnings, so equity shows
// them as two lines: net income from earlier years, and this year's.
// Assets always equal liabilities plus equity.
async function getBalanceSheet({ entityId, asOfDate, compareAsOfDate }) {
  await assertEntityExists(entityId);
  const accounts = await findAccounts();
  const current = await balanceSheetTotals({ entityId, asOfDate, accounts });
  const compare = compareAsOfDate
    ? await balanceSheetTotals({ entityId, asOfDate: compareAsOfDate, accounts })
    : null;
  const columns = [current.allTotals, compare?.allTotals ?? null];

  const assets = buildSection({ accounts, types: ["asset", "contra_asset"], side: DEBIT_SIDE, columns });
  const liabilities = buildSection({ accounts, types: ["liability"], side: CREDIT_SIDE, columns });
  const equity = buildSection({ accounts, types: ["equity"], side: CREDIT_SIDE, columns });
  addEquityRow(equity, "Net income, earlier years", current.priorYearsNetIncome, compare?.priorYearsNetIncome);
  addEquityRow(equity, "Net income, this year", current.thisYearNetIncome, compare?.thisYearNetIncome);

  return {
    entity_id: entityId,
    as_of_date: asOfDate,
    compare_as_of_date: compareAsOfDate ?? null,
    assets,
    liabilities,
    equity,
    total_liabilities_and_equity_cents: liabilities.total_cents + equity.total_cents,
    compare_total_liabilities_and_equity_cents: compare
      ? liabilities.compare_total_cents + equity.compare_total_cents
      : null,
  };
}

// How the owner's stake changed over a period: where it started, money put
// in, money taken out, profit or loss, and where it ended. The ending
// figure is total equity on the balance sheet at `to`.
async function getOwnersEquity({ entityId, from, to }) {
  await assertEntityExists(entityId);
  assertPeriod(from, to);
  const [accounts, openingTotals, periodTotals] = await Promise.all([
    findAccounts(),
    findAccountTotals({ entityId, to: dayBefore(from) }),
    findAccountTotals({ entityId, from, to, excludeClosing: true }),
  ]);

  const changes = accounts
    .filter((account) => account.account_type === "equity")
    .map((account) => {
      const row = periodTotals.find((total) => total.account_id === account.account_id);
      return {
        account_id: account.account_id,
        account_number: account.account_number,
        name: account.name,
        amount_cents: row ? row.credit_cents - row.debit_cents : 0,
      };
    })
    .filter((row) => row.amount_cents !== 0);
  const periodNetIncome = netIncome(periodTotals, accounts);
  const openingEquity = totalEquity(openingTotals, accounts);

  return {
    entity_id: entityId,
    from,
    to,
    opening_equity_cents: openingEquity,
    changes,
    net_income_cents: periodNetIncome,
    closing_equity_cents: openingEquity + sumOf(changes, "amount_cents") + periodNetIncome,
  };
}

// Equity accounts plus every year's net income not yet closed into them.
function totalEquity(totals, accounts) {
  const equityIds = accounts
    .filter((account) => account.account_type === "equity")
    .map((account) => account.account_id);
  const equityAccounts = totals
    .filter((row) => equityIds.includes(row.account_id))
    .reduce((total, row) => total + row.credit_cents - row.debit_cents, 0);
  return equityAccounts + netIncome(totals, accounts);
}

async function balanceSheetTotals({ entityId, asOfDate, accounts }) {
  const yearStart = `${asOfDate.slice(0, 4)}-01-01`;
  const [allTotals, thisYearTotals] = await Promise.all([
    findAccountTotals({ entityId, to: asOfDate }),
    findAccountTotals({ entityId, from: yearStart, to: asOfDate }),
  ]);
  const allNetIncome = netIncome(allTotals, accounts);
  const thisYearNetIncome = netIncome(thisYearTotals, accounts);
  return { allTotals, thisYearNetIncome, priorYearsNetIncome: allNetIncome - thisYearNetIncome };
}

// Credits minus debits across every income and expense account.
function netIncome(totals, accounts) {
  const profitAndLossIds = accounts
    .filter((account) => account.account_type === "income" || account.account_type === "expense")
    .map((account) => account.account_id);
  return totals
    .filter((row) => profitAndLossIds.includes(row.account_id))
    .reduce((total, row) => total + row.credit_cents - row.debit_cents, 0);
}

// columns: [totals, compareTotals or null]. Rows with nothing in either
// column are left out.
function buildSection({ accounts, types, side, columns }) {
  const [totals, compareTotals] = columns;
  const amountIn = (rows, account) => {
    const row = rows.find((total) => total.account_id === account.account_id);
    return row ? side * (row.debit_cents - row.credit_cents) : 0;
  };

  const rows = accounts
    .filter((account) => types.includes(account.account_type))
    .map((account) => ({
      account_id: account.account_id,
      account_number: account.account_number,
      name: account.name,
      account_type: account.account_type,
      amount_cents: amountIn(totals, account),
      compare_amount_cents: compareTotals ? amountIn(compareTotals, account) : null,
    }))
    .filter((row) => row.amount_cents !== 0 || (row.compare_amount_cents ?? 0) !== 0);

  return {
    rows,
    total_cents: sumOf(rows, "amount_cents"),
    compare_total_cents: compareTotals ? sumOf(rows, "compare_amount_cents") : null,
  };
}

// A computed equity line that isn't an account.
function addEquityRow(equity, name, amount, compareAmount) {
  const hasComparison = equity.compare_total_cents !== null;
  if (amount === 0 && (compareAmount ?? 0) === 0) return;
  equity.rows.push({
    account_id: null,
    account_number: null,
    name,
    account_type: "equity",
    amount_cents: amount,
    compare_amount_cents: hasComparison ? compareAmount : null,
  });
  equity.total_cents += amount;
  if (hasComparison) equity.compare_total_cents += compareAmount;
}

function sumOf(rows, column) {
  return rows.reduce((total, row) => total + row[column], 0);
}

function assertPeriod(from, to) {
  if (!from || !to) {
    throw new ValidationError("A period needs both a start and an end date");
  }
  if (from > to) {
    throw new ValidationError("The start date must be on or before the end date");
  }
}

async function assertEntityExists(entityId) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
}

export { getProfitAndLoss, getBalanceSheet, getOwnersEquity };
