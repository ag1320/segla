import { findProperty } from "../../controllers/business/propertiesController.js";
import { findAccounts } from "../../controllers/business/accountsController.js";
import { findLeases } from "../../controllers/business/leasesController.js";
import { findValuations } from "../../controllers/business/propertyValuationsController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { dayAfter, daysInMonth, daysBetween } from "../../utils/isoDates.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

const RENTAL_INCOME = 4000;
// Interest and depreciation are financing and accounting costs, not the
// cost of running the property, so they sit below NOI.
const NON_OPERATING_EXPENSES = [5070, 5080, 5130];
const MORTGAGE_INTEREST = 5070;
const MORTGAGES = 2200;
const CAPITAL_ACCOUNTS = [1520, 1530, 1540];

// A real-estate view of one property from `from` through `to`:
//   gross potential rent (every in-service day rented: leased days at the
//     lease's rent, vacant days at market rent)
//   − vacancy − rent not collected = rent collected (ties to 4000)
//   + other income = effective gross income
//   − operating expenses = NOI
//   − debt service (interest + principal) = cash flow
//   − capital improvements = cash flow after capex
async function getOperatingStatement({ propertyId, from, to }) {
  if (to < from) {
    throw new ValidationError("The period ends before it starts");
  }
  const property = await findProperty(propertyId);
  if (!property) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
  const [accounts, totals, systemTotals, leases, valuations] = await Promise.all([
    findAccounts(),
    findAccountTotals({ entityId: property.entity_id, from, to, propertyId }),
    findAccountTotals({ entityId: property.entity_id, from, to, propertyId, source: "system" }),
    findLeases(),
    findValuations(propertyId),
  ]);
  const accountsByNumber = Object.fromEntries(accounts.map((account) => [account.account_number, account]));
  const net = (account, side) => {
    const row = totals.find((total) => total.account_id === account.account_id);
    return row ? side * (row.debit_cents - row.credit_cents) : 0;
  };

  const rent = rentForPeriod({
    property,
    leases: leases.filter((lease) => lease.property_id === propertyId),
    from,
    to,
  });
  const rentCollectedCents = net(accountsByNumber[RENTAL_INCOME], -1);
  const otherIncome = accounts
    .filter((account) => account.account_type === "income" && account.account_number !== RENTAL_INCOME)
    .map((account) => lineFor(account, net(account, -1)))
    .filter((line) => line.amount_cents !== 0);
  const effectiveGrossIncomeCents = rentCollectedCents + sum(otherIncome);

  const operatingExpenses = accounts
    .filter((account) => account.account_type === "expense" && !NON_OPERATING_EXPENSES.includes(account.account_number))
    .map((account) => lineFor(account, net(account, 1)))
    .filter((line) => line.amount_cents !== 0);
  const noiCents = effectiveGrossIncomeCents - sum(operatingExpenses);

  const interestCents = net(accountsByNumber[MORTGAGE_INTEREST], 1);
  const principalCents = principalPaid({ totals, systemTotals, mortgagesAccount: accountsByNumber[MORTGAGES] });
  const debtServiceCents = interestCents + principalCents;
  const cashFlowCents = noiCents - debtServiceCents;
  const capexCents = CAPITAL_ACCOUNTS.reduce((total, number) => total + Math.max(net(accountsByNumber[number], 1), 0), 0);

  const latestValuation = [...valuations].reverse().find((valuation) => valuation.valuation_date <= to) ?? null;
  const yearFraction = rent.daysInPeriod / 365;

  return {
    property_id: propertyId,
    from,
    to,
    gross_potential_rent_cents: rent.grossPotentialCents,
    vacancy_cents: rent.vacancyCents,
    uncollected_rent_cents: rent.scheduledCents - rentCollectedCents,
    rent_collected_cents: rentCollectedCents,
    other_income: otherIncome,
    effective_gross_income_cents: effectiveGrossIncomeCents,
    operating_expenses: operatingExpenses,
    operating_expenses_cents: sum(operatingExpenses),
    noi_cents: noiCents,
    interest_cents: interestCents,
    principal_cents: principalCents,
    debt_service_cents: debtServiceCents,
    cash_flow_cents: cashFlowCents,
    capex_cents: capexCents,
    cash_flow_after_capex_cents: cashFlowCents - capexCents,
    kpis: {
      physical_occupancy: ratio(rent.leasedDays, rent.inServiceDays),
      economic_occupancy: ratio(rentCollectedCents, rent.grossPotentialCents),
      expense_ratio: ratio(sum(operatingExpenses), effectiveGrossIncomeCents),
      dscr: ratio(noiCents, debtServiceCents),
      // Annualized NOI over the latest value: what the property earns on
      // what it's worth, before financing.
      cap_rate: latestValuation ? ratio(noiCents / yearFraction, latestValuation.value_cents) : null,
    },
  };
}

// Day by day across the period, each in-service day is leased (at that
// lease's rent for the month, prorated by day) or vacant (at market rent).
// Days before the property was placed in service don't count.
function rentForPeriod({ property, leases, from, to }) {
  const start = property.placed_in_service_date && property.placed_in_service_date > from
    ? property.placed_in_service_date
    : from;
  const marketRentCents = property.market_rent_cents ?? 0;
  let scheduledCents = 0;
  let vacancyCents = 0;
  let leasedDays = 0;
  let inServiceDays = 0;

  if (property.placed_in_service_date) {
    for (let day = start; day <= to; day = dayAfter(day)) {
      const monthDays = daysInMonth(day);
      const lease = leases.find((item) => occupies(item, day));
      inServiceDays += 1;
      if (lease) {
        leasedDays += 1;
        scheduledCents += lease.monthly_rent_cents / monthDays;
      } else {
        vacancyCents += marketRentCents / monthDays;
      }
    }
  }
  scheduledCents = Math.round(scheduledCents);
  vacancyCents = Math.round(vacancyCents);
  return {
    scheduledCents,
    vacancyCents,
    grossPotentialCents: scheduledCents + vacancyCents,
    leasedDays,
    inServiceDays,
    daysInPeriod: daysBetween(from, to) + 1,
  };
}

// A tenant is in the property from the start date until the day before
// they move out.
function occupies(lease, day) {
  return lease.start_date <= day && (!lease.move_out_date || day < lease.move_out_date);
}

// How much the mortgage went down from payments: its net decrease, leaving
// out the system entries that borrow (a conversion or purchase). A
// reversed payment nets to nothing.
function principalPaid({ totals, systemTotals, mortgagesAccount }) {
  const decrease = (rows) => {
    const row = rows.find((total) => total.account_id === mortgagesAccount.account_id);
    return row ? row.debit_cents - row.credit_cents : 0;
  };
  return decrease(totals) - decrease(systemTotals);
}

function lineFor(account, amountCents) {
  return { account_id: account.account_id, account_number: account.account_number, name: account.name, amount_cents: amountCents };
}

function ratio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : null;
}

function sum(lines) {
  return lines.reduce((total, line) => total + line.amount_cents, 0);
}

export { getOperatingStatement };
