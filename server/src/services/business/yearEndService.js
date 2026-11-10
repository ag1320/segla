import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccounts, findAccountByNumber } from "../../controllers/business/accountsController.js";
import { findBankAccounts } from "../../controllers/business/bankAccountsController.js";
import { findVendors } from "../../controllers/business/vendorsController.js";
import { findProperties } from "../../controllers/business/propertiesController.js";
import { findVendorEntryLines, findAccountLines } from "../../controllers/business/yearEndController.js";
import { NotFoundError } from "../../utils/errors.js";

const STARTUP_COSTS = 1600;

// The 1099-NEC reporting threshold per payee per year: $600 through 2025,
// $2,000 from 2026 (the 2025 tax law; indexed for inflation after 2026,
// so confirm later years with the CPA).
function reportingThresholdCents(taxYear) {
  return taxYear <= 2025 ? 60000 : 200000;
}

// Vendors marked 1099-eligible and what they were paid in taxYear, split
// by how: card payments are reported by the card company (1099-K), so
// only bank and personal-money payments count toward the threshold.
// "Bank" includes checks, ACH and Zelle, and also Chase debit-card
// purchases, which the import can't tell apart; those can be set aside
// by hand.
async function get1099Candidates({ entityId, taxYear }) {
  await assertEntityExists(entityId);
  const [accounts, bankAccounts, vendors, lines] = await Promise.all([
    findAccounts(),
    findBankAccounts(),
    findVendors(),
    findVendorEntryLines({ entityId, from: `${taxYear}-01-01`, to: `${taxYear}-12-31` }),
  ]);
  const accountTypes = new Map(accounts.map((account) => [account.account_id, account.account_type]));
  const bankAccountIds = new Set(bankAccounts.map((bankAccount) => bankAccount.account_id));
  const isCard = (accountId) => bankAccountIds.has(accountId) && accountTypes.get(accountId) === "liability";
  const isBank = (accountId) => bankAccountIds.has(accountId) && accountTypes.get(accountId) === "asset";

  const entries = new Map();
  for (const line of lines) {
    entries.set(line.journal_entry_id, [...(entries.get(line.journal_entry_id) ?? []), line]);
  }

  const paid = new Map();
  for (const entryLines of entries.values()) {
    const method = paymentMethod(entryLines, { isCard, isBank });
    for (const line of entryLines.filter((item) => item.vendor_id !== null)) {
      const totals = paid.get(line.vendor_id) ?? { card: 0, bank: 0, personal: 0 };
      totals[method] += line.debit_cents - line.credit_cents;
      paid.set(line.vendor_id, totals);
    }
  }

  const thresholdCents = reportingThresholdCents(taxYear);
  const rows = vendors
    .filter((vendor) => vendor.is_1099_eligible && paid.has(vendor.vendor_id))
    .map((vendor) => {
      const totals = paid.get(vendor.vendor_id);
      const reportableCents = totals.bank + totals.personal;
      return {
        vendor_id: vendor.vendor_id,
        name: vendor.name,
        card_cents: totals.card,
        bank_cents: totals.bank,
        personal_cents: totals.personal,
        reportable_cents: reportableCents,
        needs_1099: reportableCents >= thresholdCents,
        has_w9_on_file: vendor.has_w9_on_file,
        w9_location: vendor.w9_location,
      };
    })
    .sort((a, b) => b.reportable_cents - a.reportable_cents);

  return { entity_id: entityId, tax_year: taxYear, threshold_cents: thresholdCents, rows };
}

// How an entry paid its vendor: by card if the money came off a card
// account, by bank if it came out of a bank account, otherwise with
// personal money (an owner contribution), which still counts for 1099s.
function paymentMethod(entryLines, { isCard, isBank }) {
  const sources = entryLines.filter((line) => line.credit_cents > 0).map((line) => line.account_id);
  if (sources.some(isCard)) return "card";
  if (sources.some(isBank)) return "bank";
  return "personal";
}

// Everything in 1600 Startup & Pre-Service Costs through asOfDate, by
// property, for the CPA to decide: deduct as startup costs once the rental
// begins, or add to the property's basis.
async function getStartupCosts({ entityId, asOfDate }) {
  await assertEntityExists(entityId);
  const startupAccount = await findAccountByNumber(STARTUP_COSTS);
  const [lines, properties, vendors] = await Promise.all([
    findAccountLines({ entityId, accountId: startupAccount.account_id, to: asOfDate }),
    findProperties(),
    findVendors(),
  ]);
  const propertyById = new Map(properties.map((property) => [property.property_id, property]));
  const vendorNames = new Map(vendors.map((vendor) => [vendor.vendor_id, vendor.name]));

  const groups = new Map();
  for (const line of lines) {
    const group = groups.get(line.property_id) ?? { property_id: line.property_id, lines: [], total_cents: 0 };
    const amountCents = line.debit_cents - line.credit_cents;
    group.lines.push({
      journal_line_id: line.journal_line_id,
      journal_entry_id: line.journal_entry_id,
      entry_date: line.entry_date,
      memo: line.memo,
      vendor_name: line.vendor_id === null ? null : vendorNames.get(line.vendor_id),
      amount_cents: amountCents,
      needs_cpa_review: line.needs_cpa_review,
    });
    group.total_cents += amountCents;
    groups.set(line.property_id, group);
  }

  const rows = [...groups.values()].map((group) => {
    const property = propertyById.get(group.property_id);
    return {
      ...group,
      property_name: property ? property.name : null,
      placed_in_service_date: property ? property.placed_in_service_date : null,
    };
  });
  return {
    entity_id: entityId,
    as_of_date: asOfDate,
    rows,
    total_cents: rows.reduce((total, row) => total + row.total_cents, 0),
  };
}

async function assertEntityExists(entityId) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
}

export { get1099Candidates, getStartupCosts, reportingThresholdCents };
