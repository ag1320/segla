import { findProperty } from "../../controllers/business/propertiesController.js";
import {
  findFixedAssets,
  findFixedAsset,
  insertFixedAsset,
  updateFixedAsset,
  deleteFixedAsset,
  countCarryoversFrom,
  findCpaDepreciation,
  saveCpaDepreciation,
  deleteCpaDepreciation,
} from "../../controllers/business/fixedAssetsController.js";
import { ASSET_CLASSES, estimateThrough, yearlySchedule } from "./depreciation.js";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors.js";

// Each asset with its depreciation schedule by year and where it stands
// as of asOfDate.
async function listFixedAssets(asOfDate) {
  const assets = await findFixedAssets();
  const cpaRows = await findCpaDepreciation(assets.map((asset) => asset.fixed_asset_id));
  return assets.map((asset) => withSchedule(asset, cpaRows, asOfDate));
}

async function createFixedAsset({ propertyId, ...details }) {
  if (!(await findProperty(propertyId))) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
  await assertCarryoverValid(details.carryoverFromFixedAssetId, null);
  assertDisposalAfterService(details);

  return insertFixedAsset({ property_id: propertyId, ...toFixedAssetColumns(details) });
}

// Changing an asset changes future depreciation runs only: the next run
// posts whatever difference the change makes.
async function editFixedAsset(fixedAssetId, changes) {
  const asset = await getFixedAsset(fixedAssetId);
  if (changes.carryoverFromFixedAssetId !== undefined) {
    await assertCarryoverValid(changes.carryoverFromFixedAssetId, fixedAssetId);
  }
  assertDisposalAfterService({
    inServiceDate: changes.inServiceDate ?? asset.in_service_date,
    disposalDate: changes.disposalDate === undefined ? asset.disposal_date : changes.disposalDate,
  });

  return updateFixedAsset(fixedAssetId, toFixedAssetColumns(changes));
}

async function removeFixedAsset(fixedAssetId) {
  await getFixedAsset(fixedAssetId);
  if ((await countCarryoversFrom(fixedAssetId)) > 0) {
    throw new ConflictError("Another asset carries over this one's depreciation. Change that asset first.");
  }
  await deleteFixedAsset(fixedAssetId);
}

async function setCpaDepreciation({ fixedAssetId, taxYear, amountCents }) {
  const asset = await getFixedAsset(fixedAssetId);
  if (ASSET_CLASSES[asset.asset_class].lifeMonths === null) {
    throw new ValidationError("Land isn't depreciated");
  }
  if (taxYear < Number(asset.in_service_date.slice(0, 4))) {
    throw new ValidationError(`The asset went into service after ${taxYear}`);
  }
  await saveCpaDepreciation({ fixedAssetId, taxYear, amountCents });
}

async function clearCpaDepreciation({ fixedAssetId, taxYear }) {
  await getFixedAsset(fixedAssetId);
  await deleteCpaDepreciation({ fixedAssetId, taxYear });
}

async function getFixedAsset(fixedAssetId) {
  const asset = await findFixedAsset(fixedAssetId);
  if (!asset) {
    throw new NotFoundError(`Fixed asset ${fixedAssetId} not found`);
  }
  return asset;
}

async function assertCarryoverValid(carryoverFromFixedAssetId, fixedAssetId) {
  if (carryoverFromFixedAssetId === undefined || carryoverFromFixedAssetId === null) {
    return;
  }
  if (carryoverFromFixedAssetId === fixedAssetId) {
    throw new ValidationError("An asset can't carry over from itself");
  }
  await getFixedAsset(carryoverFromFixedAssetId);
}

function assertDisposalAfterService({ inServiceDate, disposalDate }) {
  if (disposalDate && inServiceDate && disposalDate < inServiceDate) {
    throw new ValidationError("The disposal date can't be before the in-service date");
  }
}

// The asset in the shape depreciation.js works with.
function toDepreciable(asset) {
  return {
    assetClass: asset.asset_class,
    costCents: asset.cost_cents,
    inServiceDate: asset.in_service_date,
    disposalDate: asset.disposal_date,
  };
}

function cpaByYearFor(fixedAssetId, cpaRows) {
  return Object.fromEntries(
    cpaRows.filter((row) => row.fixed_asset_id === fixedAssetId).map((row) => [row.tax_year, row.amount_cents]),
  );
}

function withSchedule(asset, cpaRows, asOfDate) {
  const depreciable = toDepreciable(asset);
  const accumulatedCents = estimateThrough(depreciable, asOfDate);
  return {
    ...asset,
    life_months: ASSET_CLASSES[asset.asset_class].lifeMonths,
    estimated_accumulated_cents: accumulatedCents,
    estimated_book_value_cents: asset.cost_cents - accumulatedCents,
    years: yearlySchedule(depreciable, cpaByYearFor(asset.fixed_asset_id, cpaRows)).map((row) => ({
      tax_year: row.taxYear,
      estimate_cents: row.estimateCents,
      cpa_cents: row.cpaCents,
      accumulated_cents: row.accumulatedCents,
      book_value_cents: row.bookValueCents,
    })),
  };
}

function toFixedAssetColumns({ name, assetClass, costCents, inServiceDate, disposalDate, carryoverFromFixedAssetId }) {
  return {
    name,
    asset_class: assetClass,
    cost_cents: costCents,
    in_service_date: inServiceDate,
    disposal_date: disposalDate,
    carryover_from_fixed_asset_id: carryoverFromFixedAssetId,
  };
}

export {
  listFixedAssets,
  createFixedAsset,
  editFixedAsset,
  removeFixedAsset,
  setCpaDepreciation,
  clearCpaDepreciation,
  toDepreciable,
  cpaByYearFor,
};
