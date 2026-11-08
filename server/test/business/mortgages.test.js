import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { buildSchedule, monthlyPaymentCents } from "../../src/services/business/amortization.js";
import { createMortgage, getMortgagePaymentSplit } from "../../src/services/business/mortgagesService.js";
import { postJournalEntry } from "../../src/services/business/postingService.js";
import { getTrialBalance } from "../../src/services/business/reportsService.js";

const accountIdsByNumber = {};
let entityId;
let propertyId;

// $300,000 at 2.75% for 30 years: every mortgage calculator and servicer
// quotes $1,224.72 a month, and the first month's interest is
// 300,000 × 2.75% ÷ 12 = $687.50.
const TERMS = {
  principalCents: 30000000,
  annualRatePercent: 2.75,
  termMonths: 360,
  firstPaymentDate: "2026-12-01",
  monthlyEscrowCents: 41250,
};

before(async () => {
  for (const account of await knex("accounts")) {
    accountIdsByNumber[account.account_number] = account.account_id;
  }
  entityId = (await knex("entities").first()).entity_id;
});

beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Test House" })
    .returning("property_id");
});

after(() => knex.destroy());

test("the schedule matches the servicer's payment, and principal adds up to the amount borrowed", () => {
  const rows = buildSchedule(TERMS);

  assert.equal(monthlyPaymentCents(TERMS), 122472);
  assert.equal(rows.length, 360);
  assert.deepEqual(
    [rows[0].dueDate, rows[0].interestCents, rows[0].principalCents, rows[0].totalCents],
    ["2026-12-01", 68750, 53722, 122472 + 41250],
  );
  assert.equal(rows[1].dueDate, "2027-01-01");
  assert.ok(rows.slice(0, -1).every((row) => row.interestCents + row.principalCents === 122472));
  assert.equal(rows.reduce((total, row) => total + row.principalCents, 0), TERMS.principalCents);
  assert.equal(rows.at(-1).balanceCents, 0);
});

test("a payment made a few days early pre-fills a balanced split, and the books' loan balance then matches the schedule", async () => {
  const mortgage = await createMortgage({
    propertyId,
    lender: "Test Servicer",
    originalPrincipalCents: TERMS.principalCents,
    annualRatePercent: TERMS.annualRatePercent,
    termMonths: TERMS.termMonths,
    firstPaymentDate: TERMS.firstPaymentDate,
    monthlyEscrowCents: TERMS.monthlyEscrowCents,
  });
  // The loan arrives on the books with the house (the conversion wizard
  // does this for real in a later step).
  await postJournalEntry({
    entityId,
    entryDate: "2026-11-01",
    memo: "Loan on the books",
    source: "manual",
    lines: [
      { accountId: accountIdsByNumber[1510], propertyId, debitCents: TERMS.principalCents },
      { accountId: accountIdsByNumber[2200], propertyId, creditCents: TERMS.principalCents },
    ],
  });

  const split = await getMortgagePaymentSplit(mortgage.mortgage_id, "2026-11-27");
  assert.equal(split.due_date, "2026-12-01");
  assert.equal(split.interest_cents + split.principal_cents + split.escrow_cents, split.total_cents);

  await postJournalEntry({
    entityId,
    entryDate: "2026-11-27",
    memo: "Mortgage payment",
    source: "manual",
    lines: [
      { accountId: split.interest_account_id, propertyId, debitCents: split.interest_cents },
      { accountId: split.principal_account_id, propertyId, debitCents: split.principal_cents },
      { accountId: split.escrow_account_id, propertyId, debitCents: split.escrow_cents },
      { accountId: accountIdsByNumber[1000], creditCents: split.total_cents },
    ],
  });

  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2026-11-30" });
  const mortgagesRow = trialBalance.rows.find((row) => row.account_number === 2200);
  assert.equal(mortgagesRow.credit_cents, split.balance_cents);
  assert.equal(trialBalance.total_debit_cents, trialBalance.total_credit_cents);
});
