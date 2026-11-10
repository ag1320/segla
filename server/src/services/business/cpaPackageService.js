import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccounts, findAccountByNumber } from "../../controllers/business/accountsController.js";
import { findProperties } from "../../controllers/business/propertiesController.js";
import { findVendors } from "../../controllers/business/vendorsController.js";
import { findBankAccounts } from "../../controllers/business/bankAccountsController.js";
import { findReconciliations } from "../../controllers/business/reconciliationsController.js";
import { findMortgages } from "../../controllers/business/mortgagesController.js";
import { findFixedAssets, findCpaDepreciation } from "../../controllers/business/fixedAssetsController.js";
import { findFlaggedLines } from "../../controllers/business/yearEndController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { getTrialBalance, getGeneralLedger } from "./reportsService.js";
import { getProfitAndLoss, getBalanceSheet } from "./financialStatementsService.js";
import { getScheduleE } from "./scheduleEService.js";
import { get1099Candidates, getStartupCosts } from "./yearEndService.js";
import { buildSchedule } from "./amortization.js";
import { ASSET_CLASSES, yearlySchedule } from "./depreciation.js";
import { toDepreciable, cpaByYearFor } from "./fixedAssetsService.js";
import { NotFoundError } from "../../utils/errors.js";

const MORTGAGE_INTEREST = 5070;
const OTHER_INTEREST = 5080;
const ACCUMULATED_DEPRECIATION = 1590;

// Plain numbers (1234.56) so Excel can add them up.
const amount = (cents) => (cents / 100).toFixed(2);

// The files the CPA needs for a tax year, in the order they're usually
// read. Each builds { title, rows } from the same services as the reports.
const PACKAGE_FILES = {
  "trial-balance": { title: "Trial Balance (before closing)", build: trialBalanceFile },
  "general-ledger": { title: "General Ledger", build: generalLedgerFile },
  "profit-and-loss": { title: "Profit & Loss", build: profitAndLossFile },
  "balance-sheet": { title: "Balance Sheet", build: balanceSheetFile },
  "schedule-e": { title: "Schedule E Summary", build: scheduleEFile },
  "fixed-asset-rollforward": { title: "Fixed-Asset Rollforward", build: fixedAssetRollforwardFile },
  "interest-summary": { title: "Interest Summary", build: interestSummaryFile },
  "1099-candidates": { title: "1099 Candidates", build: candidates1099File },
  "startup-costs": { title: "Startup Costs", build: startupCostsFile },
  "cpa-flags": { title: "Items Flagged for CPA Review", build: cpaFlagsFile },
  reconciliations: { title: "Bank Reconciliations", build: reconciliationsFile },
};

// One package file: { file_name, title, subtitle, rows }, rows being
// arrays of cells ready for a CSV.
async function getPackageFile({ file, entityId, taxYear, allocation }) {
  const entity = await findEntity(entityId);
  if (!entity) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  const definition = PACKAGE_FILES[file];
  const rows = await definition.build({ entityId, taxYear, allocation });
  return {
    file_name: `${file}_${taxYear}.csv`,
    title: `${entity.name} – ${definition.title}`,
    subtitle: `Tax year ${taxYear}`,
    rows,
  };
}

async function trialBalanceFile({ entityId, taxYear }) {
  const trialBalance = await getTrialBalance({ entityId, asOfDate: `${taxYear}-12-31`, beforeClosing: true });
  return [
    ["Number", "Account", "Debit", "Credit"],
    ...trialBalance.rows.map((row) => [row.account_number, row.name, amount(row.debit_cents), amount(row.credit_cents)]),
    ["", "Total", amount(trialBalance.total_debit_cents), amount(trialBalance.total_credit_cents)],
  ];
}

async function generalLedgerFile({ entityId, taxYear }) {
  const ledger = await getGeneralLedger({ entityId, from: `${taxYear}-01-01`, to: `${taxYear}-12-31` });
  return [
    ["Account", "Date", "Entry", "Memo", "Debit", "Credit", "Balance"],
    ...ledger.accounts.flatMap((account) => {
      const label = `${account.account_number} ${account.name}`;
      return [
        [label, "", "", "Opening balance", "", "", amount(account.opening_balance_cents)],
        ...account.lines.map((line) => [
          label,
          line.entry_date,
          line.journal_entry_id,
          line.memo ?? "",
          line.debit_cents ? amount(line.debit_cents) : "",
          line.credit_cents ? amount(line.credit_cents) : "",
          amount(line.balance_cents),
        ]),
        [label, "", "", "Closing balance", "", "", amount(account.closing_balance_cents)],
      ];
    }),
  ];
}

const sectionRows = (title, section) => [
  [title, ""],
  ...section.rows.map((row) => [row.account_number ? `${row.account_number} ${row.name}` : row.name, amount(row.amount_cents)]),
  [`Total ${title.toLowerCase()}`, amount(section.total_cents)],
];

async function profitAndLossFile({ entityId, taxYear }) {
  const profitAndLoss = await getProfitAndLoss({ entityId, from: `${taxYear}-01-01`, to: `${taxYear}-12-31` });
  return [
    ["Account", "Amount"],
    ...sectionRows("Income", profitAndLoss.income),
    ...sectionRows("Expenses", profitAndLoss.expenses),
    ["Net income", amount(profitAndLoss.net_income_cents)],
  ];
}

async function balanceSheetFile({ entityId, taxYear }) {
  const balanceSheet = await getBalanceSheet({ entityId, asOfDate: `${taxYear}-12-31` });
  return [
    ["Account", "Amount"],
    ...sectionRows("Assets", balanceSheet.assets),
    ...sectionRows("Liabilities", balanceSheet.liabilities),
    ...sectionRows("Equity", balanceSheet.equity),
    ["Total liabilities and equity", amount(balanceSheet.total_liabilities_and_equity_cents)],
  ];
}

async function scheduleEFile({ entityId, taxYear, allocation }) {
  const scheduleE = await getScheduleE({ entityId, taxYear, allocation });
  const total = (amounts) => amounts.reduce((sum, value) => sum + value, 0);
  return [
    ["Line", "Description", ...scheduleE.columns.map((column) => column.name), "Total"],
    ["2", "Fair rental days", ...scheduleE.columns.map((column) => column.fair_rental_days), ""],
    ...scheduleE.lines.map((line) => [line.line, line.label, ...line.amounts.map(amount), amount(total(line.amounts))]),
    ["20", "Total expenses", ...scheduleE.total_expenses.map(amount), amount(total(scheduleE.total_expenses))],
    ["21", "Income or (loss)", ...scheduleE.income_or_loss.map(amount), amount(total(scheduleE.income_or_loss))],
    [],
    ["", `Company-wide costs split: ${scheduleE.allocation ?? "not allocated"}`],
    ...scheduleE.not_on_schedule_e.map((item) => [
      "",
      `Not on Schedule E: ${item.account_number} ${item.name}${item.property_name ? ` (${item.property_name})` : ""}`,
      amount(item.amount_cents),
    ]),
  ];
}

// Each asset's year: cost, depreciation before the year, this year's
// (the CPA's figure where entered, else Segla's estimate) and after. The
// last row compares the schedule with 1590 in the books.
async function fixedAssetRollforwardFile({ entityId, taxYear }) {
  const [assets, properties, accumulatedAccount] = await Promise.all([
    findFixedAssets({ entityId }),
    findProperties(),
    findAccountByNumber(ACCUMULATED_DEPRECIATION),
  ]);
  const cpaRows = await findCpaDepreciation(assets.map((asset) => asset.fixed_asset_id));
  const propertyNames = new Map(properties.map((property) => [property.property_id, property.name]));
  const totals = await findAccountTotals({ entityId, to: `${taxYear}-12-31` });
  const booked = totals.find((row) => row.account_id === accumulatedAccount.account_id);

  let scheduleEndCents = 0;
  const rows = assets
    .filter((asset) => asset.in_service_date <= `${taxYear}-12-31`)
    .map((asset) => {
      const years = yearlySchedule(toDepreciable(asset), cpaByYearFor(asset.fixed_asset_id, cpaRows));
      const accumulatedThrough = (year) =>
        years.filter((row) => row.taxYear <= year).reduce((sum, row) => sum + (row.cpaCents ?? row.estimateCents), 0);
      const thisYear = years.find((row) => row.taxYear === taxYear);
      const source = thisYear && thisYear.cpaCents !== null ? "CPA" : "Estimate";
      const startCents = accumulatedThrough(taxYear - 1);
      const endCents = accumulatedThrough(taxYear);
      scheduleEndCents += endCents;
      return [
        propertyNames.get(asset.property_id),
        asset.name,
        asset.asset_class,
        ASSET_CLASSES[asset.asset_class].lifeMonths === null ? "" : `${ASSET_CLASSES[asset.asset_class].lifeMonths / 12}`,
        asset.in_service_date,
        asset.disposal_date ?? "",
        amount(asset.cost_cents),
        amount(startCents),
        amount(endCents - startCents),
        source,
        amount(endCents),
        amount(asset.cost_cents - endCents),
      ];
    });
  return [
    ["Property", "Asset", "Class", "Life (years)", "In service", "Disposed", "Cost", "Accumulated, start", "This year", "Source", "Accumulated, end", "Book value"],
    ...rows,
    [],
    ["Schedule accumulated depreciation", "", "", "", "", "", "", "", "", "", amount(scheduleEndCents)],
    ["Books (1590) at Dec 31", "", "", "", "", "", "", "", "", "", amount(booked ? booked.credit_cents - booked.debit_cents : 0)],
  ];
}

// Mortgage interest by property: what the amortization schedule says was
// due in the year (compare with each lender's Form 1098) against what the
// books recorded.
async function interestSummaryFile({ entityId, taxYear }) {
  const [properties, mortgages, accounts] = await Promise.all([findProperties(), findMortgages(), findAccounts()]);
  const entityProperties = properties.filter((property) => property.entity_id === entityId);
  const accountIds = new Map(accounts.map((account) => [account.account_number, account.account_id]));
  const totals = await findAccountTotals({
    entityId,
    from: `${taxYear}-01-01`,
    to: `${taxYear}-12-31`,
    byProperty: true,
    excludeClosing: true,
  });
  const bookedFor = (accountNumber, propertyId) => {
    const row = totals.find((item) => item.account_id === accountIds.get(accountNumber) && item.property_id === propertyId);
    return row ? row.debit_cents - row.credit_cents : 0;
  };

  const rows = entityProperties.flatMap((property) => {
    const propertyMortgages = mortgages.filter((mortgage) => mortgage.property_id === property.property_id);
    const scheduleCents = propertyMortgages.reduce((sum, mortgage) => {
      const schedule = buildSchedule({
        principalCents: mortgage.original_principal_cents,
        annualRatePercent: mortgage.annual_rate_percent,
        termMonths: mortgage.term_months,
        firstPaymentDate: mortgage.first_payment_date,
        monthlyEscrowCents: mortgage.monthly_escrow_cents,
      });
      return sum + schedule.filter((row) => row.dueDate.startsWith(String(taxYear))).reduce((total, row) => total + row.interestCents, 0);
    }, 0);
    const bookedCents = bookedFor(MORTGAGE_INTEREST, property.property_id);
    const otherCents = bookedFor(OTHER_INTEREST, property.property_id);
    if (scheduleCents === 0 && bookedCents === 0 && otherCents === 0) return [];
    return [[
      property.name,
      propertyMortgages.map((mortgage) => mortgage.lender).join("; "),
      amount(scheduleCents),
      amount(bookedCents),
      amount(bookedCents - scheduleCents),
      amount(otherCents),
    ]];
  });
  return [
    ["Property", "Lender", "Schedule interest", "Books mortgage interest (5070)", "Difference", "Other interest (5080)"],
    ...rows,
  ];
}

async function candidates1099File({ entityId, taxYear }) {
  const candidates = await get1099Candidates({ entityId, taxYear });
  return [
    ["Vendor", "Card (excluded)", "Bank", "Personal", "Reportable", "Needs 1099", "W-9"],
    ...candidates.rows.map((row) => [
      row.name,
      amount(row.card_cents),
      amount(row.bank_cents),
      amount(row.personal_cents),
      amount(row.reportable_cents),
      row.needs_1099 ? "Yes" : "No",
      row.has_w9_on_file ? row.w9_location || "On file" : "Missing",
    ]),
    [],
    ["Threshold", amount(candidates.threshold_cents)],
  ];
}

async function startupCostsFile({ entityId, taxYear }) {
  const summary = await getStartupCosts({ entityId, asOfDate: `${taxYear}-12-31` });
  return [
    ["Property", "In service", "Date", "Memo", "Vendor", "Amount", "CPA review"],
    ...summary.rows.flatMap((row) =>
      row.lines.map((line) => [
        row.property_name ?? "Company-wide",
        row.placed_in_service_date ?? "",
        line.entry_date,
        line.memo ?? "",
        line.vendor_name ?? "",
        amount(line.amount_cents),
        line.needs_cpa_review ? "Yes" : "",
      ]),
    ),
    ["Total", "", "", "", "", amount(summary.total_cents), ""],
  ];
}

async function cpaFlagsFile({ entityId, taxYear }) {
  const [lines, accounts, properties, vendors] = await Promise.all([
    findFlaggedLines({ entityId, from: `${taxYear}-01-01`, to: `${taxYear}-12-31` }),
    findAccounts(),
    findProperties(),
    findVendors(),
  ]);
  const accountLabels = new Map(accounts.map((account) => [account.account_id, `${account.account_number} ${account.name}`]));
  const propertyNames = new Map(properties.map((property) => [property.property_id, property.name]));
  const vendorNames = new Map(vendors.map((vendor) => [vendor.vendor_id, vendor.name]));
  return [
    ["Date", "Entry", "Memo", "Account", "Property", "Vendor", "Debit", "Credit"],
    ...lines.map((line) => [
      line.entry_date,
      line.journal_entry_id,
      line.memo ?? "",
      accountLabels.get(line.account_id),
      line.property_id === null ? "Company-wide" : propertyNames.get(line.property_id),
      line.vendor_id === null ? "" : vendorNames.get(line.vendor_id),
      line.debit_cents ? amount(line.debit_cents) : "",
      line.credit_cents ? amount(line.credit_cents) : "",
    ]),
  ];
}

async function reconciliationsFile({ entityId, taxYear }) {
  const [bankAccounts, reconciliations] = await Promise.all([findBankAccounts(), findReconciliations()]);
  const entityAccounts = new Map(
    bankAccounts.filter((bankAccount) => bankAccount.entity_id === entityId).map((bankAccount) => [bankAccount.bank_account_id, bankAccount.name]),
  );
  return [
    ["Account", "Statement date", "Statement balance"],
    ...reconciliations
      .filter((item) => entityAccounts.has(item.bank_account_id) && item.statement_date.startsWith(String(taxYear)))
      .map((item) => [entityAccounts.get(item.bank_account_id), item.statement_date, amount(item.statement_balance_cents)]),
  ];
}

export { getPackageFile, PACKAGE_FILES };
