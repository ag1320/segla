import { findProperty } from "../../controllers/business/propertiesController.js";
import { findAccountByNumber } from "../../controllers/business/accountsController.js";
import {
  findMortgages,
  findMortgage,
  insertMortgage,
  updateMortgage,
  deleteMortgage,
} from "../../controllers/business/mortgagesController.js";
import { buildSchedule, monthlyPaymentCents } from "./amortization.js";
import { daysBetween } from "../../utils/isoDates.js";
import { NotFoundError } from "../../utils/errors.js";

const MORTGAGES_ACCOUNT_NUMBER = 2200;
const MORTGAGE_INTEREST_ACCOUNT_NUMBER = 5070;
const ESCROW_ACCOUNT_NUMBER = 1100;

async function listMortgages() {
  const mortgages = await findMortgages();
  return mortgages.map(withMonthlyPayment);
}

async function createMortgage({ propertyId, ...terms }) {
  if (!(await findProperty(propertyId))) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
  const liabilityAccount = await findAccountByNumber(MORTGAGES_ACCOUNT_NUMBER);

  const mortgage = await insertMortgage({
    property_id: propertyId,
    liability_account_id: liabilityAccount.account_id,
    ...toMortgageColumns(terms),
  });
  return withMonthlyPayment(mortgage);
}

// Changing the terms changes the schedule only. Payments already posted
// stay as they were; a wrong one is fixed by reversing it.
async function editMortgage(mortgageId, changes) {
  await getMortgage(mortgageId);
  return withMonthlyPayment(await updateMortgage(mortgageId, toMortgageColumns(changes)));
}

async function removeMortgage(mortgageId) {
  await getMortgage(mortgageId);
  await deleteMortgage(mortgageId);
}

async function getMortgageSchedule(mortgageId) {
  const mortgage = await getMortgage(mortgageId);
  return {
    ...withMonthlyPayment(mortgage),
    rows: scheduleFor(mortgage).map(toScheduleRow),
  };
}

// The split for a payment made on paymentDate: the scheduled payment whose
// due date is nearest, so paying a few days early or late (inside the
// grace period) still lands on the right month.
async function getMortgagePaymentSplit(mortgageId, paymentDate) {
  const mortgage = await getMortgage(mortgageId);
  const rows = scheduleFor(mortgage);
  const distance = (row) => Math.abs(daysBetween(paymentDate, row.dueDate));
  const nearest = rows.reduce((best, row) => (distance(row) < distance(best) ? row : best));

  const [interestAccount, escrowAccount] = await Promise.all([
    findAccountByNumber(MORTGAGE_INTEREST_ACCOUNT_NUMBER),
    findAccountByNumber(ESCROW_ACCOUNT_NUMBER),
  ]);
  return {
    mortgage_id: mortgage.mortgage_id,
    property_id: mortgage.property_id,
    ...toScheduleRow(nearest),
    interest_account_id: interestAccount.account_id,
    principal_account_id: mortgage.liability_account_id,
    escrow_account_id: escrowAccount.account_id,
  };
}

async function getMortgage(mortgageId) {
  const mortgage = await findMortgage(mortgageId);
  if (!mortgage) {
    throw new NotFoundError(`Mortgage ${mortgageId} not found`);
  }
  return mortgage;
}

function scheduleFor(mortgage) {
  return buildSchedule({
    principalCents: mortgage.original_principal_cents,
    annualRatePercent: mortgage.annual_rate_percent,
    termMonths: mortgage.term_months,
    firstPaymentDate: mortgage.first_payment_date,
    monthlyEscrowCents: mortgage.monthly_escrow_cents,
  });
}

function withMonthlyPayment(mortgage) {
  return {
    ...mortgage,
    monthly_payment_cents: monthlyPaymentCents({
      principalCents: mortgage.original_principal_cents,
      annualRatePercent: mortgage.annual_rate_percent,
      termMonths: mortgage.term_months,
    }),
  };
}

function toScheduleRow(row) {
  return {
    number: row.number,
    due_date: row.dueDate,
    interest_cents: row.interestCents,
    principal_cents: row.principalCents,
    escrow_cents: row.escrowCents,
    total_cents: row.totalCents,
    balance_cents: row.balanceCents,
  };
}

function toMortgageColumns({
  lender,
  originalPrincipalCents,
  annualRatePercent,
  termMonths,
  firstPaymentDate,
  monthlyEscrowCents,
}) {
  return {
    lender,
    original_principal_cents: originalPrincipalCents,
    annual_rate_percent: annualRatePercent,
    term_months: termMonths,
    first_payment_date: firstPaymentDate,
    monthly_escrow_cents: monthlyEscrowCents,
  };
}

export {
  listMortgages,
  createMortgage,
  editMortgage,
  removeMortgage,
  getMortgageSchedule,
  getMortgagePaymentSplit,
};
