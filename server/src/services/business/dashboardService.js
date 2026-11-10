import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccounts } from "../../controllers/business/accountsController.js";
import { findProperties } from "../../controllers/business/propertiesController.js";
import { findBankAccounts } from "../../controllers/business/bankAccountsController.js";
import { countNewBankTransactionsThrough } from "../../controllers/business/bankTransactionsController.js";
import { findLatestReconciliation } from "../../controllers/business/reconciliationsController.js";
import { hasJournalLinesThrough } from "../../controllers/business/journalEntriesController.js";
import { findLeases } from "../../controllers/business/leasesController.js";
import { findFlaggedLines } from "../../controllers/business/yearEndController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { getOperatingStatement } from "./operatingStatementService.js";
import { getCapexPlan } from "./capexService.js";
import { getMarketEquity } from "./marketEquityService.js";
import { daysBetween, dayBefore } from "../../utils/isoDates.js";
import { NotFoundError } from "../../utils/errors.js";

const OWNER_CONTRIBUTIONS = 3000;
const OWNER_DRAWS = 3100;
const STARTUP_COSTS = 1600;
const DEPRECIATION = 5130;
const LEASE_ENDING_DAYS = 60;

// Everything the business home page shows, as of asOfDate. Before any
// property is in service ("pre_launch") the useful numbers are cash and
// what's gone in and out; once one is ("operating"), the rental KPIs.
// Alerts apply in both.
async function getDashboard({ entityId, asOfDate }) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  const [accounts, properties, bankAccounts, totals, activityTotals, marketEquity] = await Promise.all([
    findAccounts(),
    findProperties(),
    findBankAccounts(),
    findAccountTotals({ entityId, to: asOfDate }),
    findAccountTotals({ entityId, to: asOfDate, excludeClosing: true }),
    getMarketEquity(asOfDate),
  ]);
  const accountsById = new Map(accounts.map((account) => [account.account_id, account]));
  const netDebit = (rows, accountId) => {
    const row = rows.find((item) => item.account_id === accountId);
    return row ? row.debit_cents - row.credit_cents : 0;
  };
  const byNumber = (number) => accounts.find((account) => account.account_number === number).account_id;

  const entityBanks = bankAccounts.filter((bankAccount) => bankAccount.entity_id === entityId && bankAccount.is_active);
  const isCard = (bankAccount) => accountsById.get(bankAccount.account_id).account_type === "liability";
  const cashCents = entityBanks.filter((bank) => !isCard(bank)).reduce((sum, bank) => sum + netDebit(totals, bank.account_id), 0);
  const cardOwedCents = entityBanks.filter(isCard).reduce((sum, bank) => sum - netDebit(totals, bank.account_id), 0);
  // Money spent running and preparing the business: expenses (not
  // depreciation, which spends nothing) plus startup costs.
  const spentCents =
    activityTotals
      .filter((row) => accountsById.get(row.account_id).account_type === "expense" && row.account_id !== byNumber(DEPRECIATION))
      .reduce((sum, row) => sum + row.debit_cents - row.credit_cents, 0) + netDebit(totals, byNumber(STARTUP_COSTS));

  const entityProperties = properties.filter((property) => property.entity_id === entityId);
  const activeProperties = entityProperties.filter((property) => property.status === "active");
  const nextConversion = entityProperties
    .filter((property) => property.status === "pre_rental" && property.target_conversion_date >= asOfDate)
    .map((property) => property.target_conversion_date)
    .sort()[0];

  return {
    entity_id: entityId,
    as_of_date: asOfDate,
    phase: activeProperties.length > 0 ? "operating" : "pre_launch",
    market_equity_cents: marketEquity.market_equity_cents,
    cash_cents: cashCents,
    card_owed_cents: cardOwedCents,
    contributed_cents: -netDebit(totals, byNumber(OWNER_CONTRIBUTIONS)),
    drawn_cents: netDebit(totals, byNumber(OWNER_DRAWS)),
    spent_cents: spentCents,
    days_to_conversion: nextConversion ? daysBetween(asOfDate, nextConversion) : null,
    operating: activeProperties.length > 0 ? await operatingKpis({ entityId, activeProperties, asOfDate }) : null,
    alerts: await alerts({ entityId, entityBanks, asOfDate }),
  };
}

// NOI and debt coverage for the year so far, cash flow and occupancy for
// this month, across every property in service, plus the capex reserve.
async function operatingKpis({ entityId, activeProperties, asOfDate }) {
  const yearStart = `${asOfDate.slice(0, 4)}-01-01`;
  const monthStart = `${asOfDate.slice(0, 7)}-01`;
  const [yearToDate, thisMonth, capexPlan] = await Promise.all([
    Promise.all(activeProperties.map((property) => getOperatingStatement({ propertyId: property.property_id, from: yearStart, to: asOfDate }))),
    Promise.all(activeProperties.map((property) => getOperatingStatement({ propertyId: property.property_id, from: monthStart, to: asOfDate }))),
    getCapexPlan({ entityId, asOfDate }),
  ]);
  const sum = (statements, field) => statements.reduce((total, statement) => total + statement[field], 0);
  const occupancies = thisMonth.map((statement) => statement.kpis.physical_occupancy).filter((value) => value !== null);
  const debtServiceCents = sum(yearToDate, "debt_service_cents");
  return {
    noi_ytd_cents: sum(yearToDate, "noi_cents"),
    cash_flow_this_month_cents: sum(thisMonth, "cash_flow_cents"),
    occupancy: occupancies.length > 0 ? occupancies.reduce((total, value) => total + value, 0) / occupancies.length : null,
    dscr: debtServiceCents > 0 ? sum(yearToDate, "noi_cents") / debtServiceCents : null,
    capex_funded_ratio: capexPlan.funded_ratio,
  };
}

// Things that need doing: Inbox items, accounts not reconciled through
// last month, lines flagged for the CPA this year, leases ending soon.
async function alerts({ entityId, entityBanks, asOfDate }) {
  const lastMonthEnd = dayBefore(`${asOfDate.slice(0, 7)}-01`);
  const [inboxCount, behind, flagged, leases] = await Promise.all([
    countNewBankTransactionsThrough({ entityId, throughDate: asOfDate }),
    accountsBehind({ entityBanks, lastMonthEnd }),
    findFlaggedLines({ entityId, from: `${asOfDate.slice(0, 4)}-01-01`, to: asOfDate }),
    findLeases({ entityId }),
  ]);
  const endingSoon = leases.filter(
    (lease) =>
      lease.end_date &&
      !lease.move_out_date &&
      lease.end_date >= asOfDate &&
      daysBetween(asOfDate, lease.end_date) <= LEASE_ENDING_DAYS,
  );
  return {
    inbox_count: inboxCount,
    unreconciled_accounts: behind,
    cpa_flag_count: flagged.length,
    leases_ending: endingSoon.map((lease) => ({ lease_id: lease.lease_id, tenant_name: lease.tenant_name, end_date: lease.end_date })),
  };
}

// Bank accounts with activity through last month whose latest statement
// is older than last month's end.
async function accountsBehind({ entityBanks, lastMonthEnd }) {
  const behind = [];
  for (const bank of entityBanks) {
    const [latest, hasActivity] = await Promise.all([
      findLatestReconciliation(bank.bank_account_id),
      hasJournalLinesThrough({ accountId: bank.account_id, throughDate: lastMonthEnd }),
    ]);
    if (hasActivity && (!latest || latest.statement_date < lastMonthEnd)) {
      behind.push({ bank_account_id: bank.bank_account_id, name: bank.name, reconciled_through: latest?.statement_date ?? null });
    }
  }
  return behind;
}

export { getDashboard };
