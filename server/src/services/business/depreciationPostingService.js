import knex from "../../controllers/dbConnection.js";
import { findEntity } from "../../controllers/business/entitiesController.js";
import { findAccountByNumber } from "../../controllers/business/accountsController.js";
import { findFixedAssets, findCpaDepreciation } from "../../controllers/business/fixedAssetsController.js";
import { findLockedThroughDate } from "../../controllers/business/periodLocksController.js";
import { findFirstLineDate } from "../../controllers/business/journalEntriesController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { postJournalEntry } from "./postingService.js";
import { targetThrough } from "./depreciation.js";
import { toDepreciable, cpaByYearFor } from "./fixedAssetsService.js";
import { addMonths, isMonthEnd, monthEnd } from "../../utils/isoDates.js";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors.js";

const DEPRECIATION_EXPENSE_ACCOUNT_NUMBER = 5130;
const ACCUMULATED_DEPRECIATION_ACCOUNT_NUMBER = 1590;

const nextMonthEnd = (isoMonthEnd) => monthEnd(addMonths(`${isoMonthEnd.slice(0, 7)}-01`, 1));

// For each month-end after the lock through throughDate, posts the
// difference between what accumulated depreciation should be (per
// property) and what the books show. Running it twice posts nothing new;
// a CPA figure or an asset change posts just the difference.
async function postDepreciationThrough({ entityId, throughDate }) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  if (!isMonthEnd(throughDate)) {
    throw new ValidationError("Depreciation posts through the last day of a month");
  }
  const assets = await findFixedAssets({ entityId });
  const cpaRows = await findCpaDepreciation(assets.map((asset) => asset.fixed_asset_id));
  const [expenseAccount, accumulatedAccount] = await Promise.all([
    findAccountByNumber(DEPRECIATION_EXPENSE_ACCOUNT_NUMBER),
    findAccountByNumber(ACCUMULATED_DEPRECIATION_ACCOUNT_NUMBER),
  ]);
  const lockedThroughDate = await findLockedThroughDate(entityId);

  // Start at the earliest month anything was depreciated or should be, so
  // depreciation booked for a since-deleted asset is taken back out too.
  const firstBooked = await findFirstLineDate({ entityId, accountId: accumulatedAccount.account_id });
  const startDates = [...assets.map((asset) => asset.in_service_date), firstBooked].filter(Boolean).sort();
  if (startDates.length === 0) {
    return [];
  }
  const firstActive = monthEnd(startDates[0]);
  const firstMonth =
    lockedThroughDate && lockedThroughDate >= firstActive ? nextMonthEnd(lockedThroughDate) : firstActive;

  const differences = (monthEndDate, trx) =>
    differencesByProperty({ entityId, assets, cpaRows, accumulatedAccount, monthEndDate }, trx);

  return knex.transaction(async (trx) => {
    if (lockedThroughDate && lockedThroughDate.slice(0, 4) < firstMonth.slice(0, 4)) {
      assertLockedYearSettled({ lockedThroughDate, differences: await differences(lockedThroughDate, trx) });
    }

    const posted = [];
    for (let month = firstMonth; month <= throughDate; month = nextMonthEnd(month)) {
      const lines = (await differences(month, trx)).flatMap(({ propertyId, cents }) =>
        depreciationLines({ propertyId, cents, expenseAccount, accumulatedAccount }),
      );
      if (lines.length === 0) {
        continue;
      }
      const entry = await postJournalEntry(
        { entityId, entryDate: month, memo: `Depreciation, ${month.slice(0, 7)}`, source: "system", lines },
        trx,
      );
      posted.push(entry);
    }
    return posted;
  });
}

// [{ propertyId, cents }] for every property whose target differs from
// the books; cents is positive when more depreciation is due. A property
// with depreciation booked but no assets left gets it all taken back.
async function differencesByProperty({ entityId, assets, cpaRows, accumulatedAccount, monthEndDate }, trx) {
  const totals = await findAccountTotals({ entityId, to: monthEndDate, byProperty: true }, trx);
  const bookedByProperty = new Map(
    totals
      .filter((row) => row.account_id === accumulatedAccount.account_id && row.property_id !== null)
      .map((row) => [row.property_id, row.credit_cents - row.debit_cents]),
  );
  const targetByProperty = new Map();
  for (const asset of assets) {
    const target = targetThrough(toDepreciable(asset), cpaByYearFor(asset.fixed_asset_id, cpaRows), monthEndDate);
    targetByProperty.set(asset.property_id, (targetByProperty.get(asset.property_id) ?? 0) + target);
  }

  const propertyIds = [...new Set([...bookedByProperty.keys(), ...targetByProperty.keys()])];
  return propertyIds
    .map((propertyId) => ({
      propertyId,
      cents: (targetByProperty.get(propertyId) ?? 0) - (bookedByProperty.get(propertyId) ?? 0),
    }))
    .filter((difference) => difference.cents !== 0);
}

function depreciationLines({ propertyId, cents, expenseAccount, accumulatedAccount }) {
  const amount = Math.abs(cents);
  const expense = { accountId: expenseAccount.account_id, propertyId };
  const accumulated = { accountId: accumulatedAccount.account_id, propertyId };
  return cents > 0
    ? [{ ...expense, debitCents: amount }, { ...accumulated, creditCents: amount }]
    : [{ ...accumulated, debitCents: amount }, { ...expense, creditCents: amount }];
}

// A difference left in a locked earlier year (usually the CPA's figure
// arriving after December was locked) must be booked in that year, so the
// run stops instead of pushing it into the next year.
function assertLockedYearSettled({ lockedThroughDate, differences }) {
  if (differences.length === 0) {
    return;
  }
  const year = lockedThroughDate.slice(0, 4);
  const cents = differences.reduce((total, difference) => total + difference.cents, 0);
  throw new ConflictError(
    `${year}'s depreciation in the books is off by $${(Math.abs(cents) / 100).toFixed(2)}, usually because the CPA's figures came in after ${year} was locked. Move the lock back to November 30, ${year}, post depreciation through December 31, ${year}, then lock again.`,
  );
}

export { postDepreciationThrough };
