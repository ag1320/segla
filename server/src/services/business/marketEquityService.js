import { findEntities } from "../../controllers/business/entitiesController.js";
import { findAccounts } from "../../controllers/business/accountsController.js";
import { findProperties } from "../../controllers/business/propertiesController.js";
import { findValuations } from "../../controllers/business/propertyValuationsController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { getBalanceSheet } from "./financialStatementsService.js";

const PROPERTY_ASSET_ACCOUNTS = [1500, 1510, 1520, 1530, 1540];
const ACCUMULATED_DEPRECIATION = 1590;
const STARTUP_COSTS = 1600;
const ACCUMULATED_AMORTIZATION = 1610;

// What the business is worth to you as of asOfDate, for personal net
// worth: book equity, with each property swapped from its book value (cost
// less depreciation) to its latest market value, less startup costs still
// on the books (they're an accounting asset, not something you could
// sell). A property with no valuation stays at book value. Summed across
// every entity.
async function getMarketEquity(asOfDate) {
  const [entities, accounts, properties] = await Promise.all([findEntities(), findAccounts(), findProperties()]);
  const accountIds = new Map(accounts.map((account) => [account.account_number, account.account_id]));
  const propertyAssetIds = new Set(PROPERTY_ASSET_ACCOUNTS.map((number) => accountIds.get(number)));

  let bookEquityCents = 0;
  let startupCostsCents = 0;
  const propertyRows = [];
  for (const entity of entities) {
    const [balanceSheet, totals] = await Promise.all([
      getBalanceSheet({ entityId: entity.entity_id, asOfDate }),
      findAccountTotals({ entityId: entity.entity_id, to: asOfDate, byProperty: true }),
    ]);
    bookEquityCents += balanceSheet.equity.total_cents;

    const netDebit = (accountId, propertyId) =>
      totals
        .filter((row) => row.account_id === accountId && (propertyId === undefined || row.property_id === propertyId))
        .reduce((sum, row) => sum + row.debit_cents - row.credit_cents, 0);
    startupCostsCents +=
      netDebit(accountIds.get(STARTUP_COSTS)) + netDebit(accountIds.get(ACCUMULATED_AMORTIZATION));

    for (const property of properties.filter((item) => item.entity_id === entity.entity_id)) {
      const bookValueCents =
        totals
          .filter((row) => propertyAssetIds.has(row.account_id) && row.property_id === property.property_id)
          .reduce((sum, row) => sum + row.debit_cents - row.credit_cents, 0) +
        netDebit(accountIds.get(ACCUMULATED_DEPRECIATION), property.property_id);
      if (bookValueCents === 0) continue;
      const valuations = await findValuations(property.property_id);
      const latest = [...valuations].reverse().find((valuation) => valuation.valuation_date <= asOfDate);
      propertyRows.push({
        property_id: property.property_id,
        name: property.name,
        book_value_cents: bookValueCents,
        market_value_cents: latest ? latest.value_cents : bookValueCents,
      });
    }
  }

  const propertyAdjustmentCents = propertyRows.reduce(
    (sum, row) => sum + row.market_value_cents - row.book_value_cents,
    0,
  );
  return {
    as_of_date: asOfDate,
    book_equity_cents: bookEquityCents,
    property_adjustment_cents: propertyAdjustmentCents,
    startup_costs_cents: startupCostsCents,
    market_equity_cents: bookEquityCents + propertyAdjustmentCents - startupCostsCents,
    properties: propertyRows,
  };
}

export { getMarketEquity };
