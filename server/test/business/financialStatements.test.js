import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { postJournalEntry, reverseJournalEntry } from "../../src/services/business/postingService.js";
import {
  getProfitAndLoss,
  getBalanceSheet,
  getOwnersEquity,
} from "../../src/services/business/financialStatementsService.js";
import { getCashFlow } from "../../src/services/business/cashFlowService.js";

const accountIdsByNumber = {};
let entityId;
let propertyId;

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, leases, capex_components, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Test House" })
    .returning("property_id");
});

after(() => knex.destroy());

function post(entryDate, lines) {
  return postJournalEntry({ entityId, entryDate, memo: null, source: "manual", lines });
}
const debit = (number, cents, extra = {}) => ({ accountId: accountIdsByNumber[number], debitCents: cents, ...extra });
const credit = (number, cents, extra = {}) => ({ accountId: accountIdsByNumber[number], creditCents: cents, ...extra });

// Five months across a year end: buying the house with a mortgage, rent,
// card repairs, depreciation, a security deposit, a mortgage payment, a
// card payment, a draw, a company-wide cost, and a reversed mistake.
async function postSampleHistory() {
  const house = { propertyId };
  await post("2025-11-01", [debit(1000, 7000000), credit(3000, 7000000)]);
  await post("2025-11-15", [debit(1500, 5000000, house), debit(1510, 15000000, house), credit(2200, 18000000), credit(1000, 2000000)]);
  await post("2025-12-01", [debit(1000, 250000), credit(4000, 250000, house)]);
  await post("2025-12-05", [debit(5090, 40000, house), credit(2000, 40000)]);
  await post("2025-12-31", [debit(5130, 50000, house), credit(1590, 50000, house)]);
  await post("2026-01-03", [debit(1000, 200000), credit(2100, 200000, house)]);
  await post("2026-01-10", [debit(5070, 90000, house), debit(2200, 30000), credit(1000, 120000)]);
  await post("2026-01-20", [debit(2000, 40000), credit(1000, 40000)]);
  await post("2026-02-01", [debit(1000, 250000), credit(4000, 250000, house)]);
  await post("2026-02-10", [debit(5050, 30000), credit(1000, 30000)]);
  await post("2026-02-15", [debit(3100, 100000), credit(1000, 100000)]);
  const mistake = await post("2026-03-01", [debit(5100, 9999), credit(1000, 9999)]);
  await reverseJournalEntry(mistake.journal_entry_id, "2026-03-02");
}

function amountFor(section, name) {
  return section.rows.find((row) => row.name === name)?.amount_cents;
}

test("the balance sheet balances on every date", async () => {
  await postSampleHistory();

  const dates = [
    "2025-10-31", "2025-11-01", "2025-11-14", "2025-11-15", "2025-11-30", "2025-12-15",
    "2025-12-31", "2026-01-01", "2026-01-15", "2026-01-31", "2026-02-28", "2026-03-01", "2026-03-31",
  ];
  for (const asOfDate of dates) {
    const sheet = await getBalanceSheet({ entityId, asOfDate });
    assert.equal(sheet.assets.total_cents, sheet.total_liabilities_and_equity_cents, asOfDate);
  }
});

test("until a year is closed, equity shows earlier years' and this year's net income separately", async () => {
  await postSampleHistory();

  const sheet = await getBalanceSheet({ entityId, asOfDate: "2026-02-28" });

  assert.equal(amountFor(sheet.equity, "Net income, earlier years"), 250000 - 40000 - 50000);
  assert.equal(amountFor(sheet.equity, "Net income, this year"), 250000 - 90000 - 30000);
  assert.equal(amountFor(sheet.equity, "Owner Draws"), -100000);
  assert.equal(amountFor(sheet.assets, "Accumulated Depreciation"), -50000);
  assert.equal(amountFor(sheet.liabilities, "Mortgages"), 18000000 - 30000);
});

test("a balance sheet compared with an earlier date shows both columns, each balanced", async () => {
  await postSampleHistory();

  const sheet = await getBalanceSheet({ entityId, asOfDate: "2026-02-28", compareAsOfDate: "2025-12-31" });

  assert.equal(sheet.assets.compare_total_cents, sheet.compare_total_liabilities_and_equity_cents);
  const deposits = sheet.liabilities.rows.find((row) => row.name === "Tenant Security Deposits Held");
  assert.deepEqual([deposits.amount_cents, deposits.compare_amount_cents], [200000, 0]);
});

test("net income is income minus expenses, compared with another period", async () => {
  await postSampleHistory();

  const pnl = await getProfitAndLoss({
    entityId,
    from: "2026-01-01",
    to: "2026-03-31",
    compareFrom: "2025-10-01",
    compareTo: "2025-12-31",
  });

  assert.deepEqual([pnl.income.total_cents, pnl.income.compare_total_cents], [250000, 250000]);
  assert.deepEqual([pnl.expenses.total_cents, pnl.expenses.compare_total_cents], [120000, 90000]);
  assert.deepEqual([pnl.net_income_cents, pnl.compare_net_income_cents], [130000, 160000]);
  assert.equal(amountFor(pnl.expenses, "Supplies"), undefined);
});

test("this year's net income on the balance sheet matches the year-to-date P&L", async () => {
  await postSampleHistory();

  const sheet = await getBalanceSheet({ entityId, asOfDate: "2026-03-31" });
  const pnl = await getProfitAndLoss({ entityId, from: "2026-01-01", to: "2026-03-31" });

  assert.equal(amountFor(sheet.equity, "Net income, this year"), pnl.net_income_cents);
});

test("a property's P&L leaves out company-wide costs", async () => {
  await postSampleHistory();

  const pnl = await getProfitAndLoss({ entityId, from: "2026-01-01", to: "2026-03-31", propertyId });

  assert.equal(amountFor(pnl.expenses, "Legal & Professional Fees"), undefined);
  assert.equal(pnl.net_income_cents, 250000 - 90000);
});

function cashOnBalanceSheet(sheet) {
  return sheet.assets.rows
    .filter((row) => row.account_number >= 1000 && row.account_number <= 1099)
    .reduce((total, row) => total + row.amount_cents, 0);
}

test("ending cash on the cash flow statement matches the balance sheet's cash", async () => {
  await postSampleHistory();

  const periods = [
    ["2025-11-01", "2025-11-30"],
    ["2025-11-16", "2026-01-15"],
    ["2026-01-01", "2026-03-31"],
    ["2025-10-01", "2026-03-31"],
  ];
  for (const [from, to] of periods) {
    const cashFlow = await getCashFlow({ entityId, from, to });
    const sheet = await getBalanceSheet({ entityId, asOfDate: to });
    assert.equal(cashFlow.opening_cash_cents + cashFlow.net_change_cents, cashFlow.closing_cash_cents, `${from} to ${to}`);
    assert.equal(cashFlow.closing_cash_cents, cashOnBalanceSheet(sheet), `${from} to ${to}`);
  }
});

test("cash flows are grouped as operating, investing and financing", async () => {
  await postSampleHistory();

  const cashFlow = await getCashFlow({ entityId, from: "2025-11-01", to: "2026-03-31" });

  assert.equal(cashFlow.operating.total_cents, 500000 + 200000 - 90000 - 40000 - 30000);
  assert.equal(cashFlow.investing.total_cents, -20000000);
  assert.equal(cashFlow.financing.total_cents, 7000000 + 18000000 - 30000 - 100000);
  assert.equal(cashFlow.net_change_cents, 5410000);
  // Card charges aren't cash until the card is paid; the payment is.
  assert.equal(amountFor(cashFlow.operating, "Repairs"), undefined);
  assert.equal(amountFor(cashFlow.operating, "WF Signify Business Card"), -40000);
  // A reversed mistake nets to nothing.
  assert.equal(amountFor(cashFlow.operating, "Supplies"), undefined);
});

test("the owner's equity statement ends at the balance sheet's total equity", async () => {
  await postSampleHistory();

  const statement = await getOwnersEquity({ entityId, from: "2026-01-01", to: "2026-03-31" });
  const opening = await getBalanceSheet({ entityId, asOfDate: "2025-12-31" });
  const closing = await getBalanceSheet({ entityId, asOfDate: "2026-03-31" });

  assert.equal(statement.opening_equity_cents, opening.equity.total_cents);
  assert.equal(statement.closing_equity_cents, closing.equity.total_cents);
  assert.equal(statement.net_income_cents, 250000 - 90000 - 30000);
  assert.deepEqual(statement.changes.map((row) => [row.name, row.amount_cents]), [["Owner Draws", -100000]]);
});
