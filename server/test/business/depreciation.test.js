import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import knex from "../../src/controllers/dbConnection.js";
import { estimateThrough, yearlySchedule } from "../../src/services/business/depreciation.js";
import { createFixedAsset, setCpaDepreciation, removeFixedAsset } from "../../src/services/business/fixedAssetsService.js";
import { postDepreciationThrough } from "../../src/services/business/depreciationPostingService.js";
import { getTrialBalance } from "../../src/services/business/reportsService.js";
import { ConflictError } from "../../src/utils/errors.js";

let entityId;
let propertyId;

// A $200,000 building placed in service July 15, 2027, depreciated over
// 27.5 years (330 months) with July counted as half a month:
//   per month       200,000 ÷ 330       = $606.06
//   2027 (5.5 mo)   200,000 × 5.5 ÷ 330 = $3,333.33
//   2028 (12 mo)    200,000 × 12 ÷ 330  = $7,272.73
const BUILDING = {
  assetClass: "building",
  costCents: 20000000,
  inServiceDate: "2027-07-15",
  disposalDate: null,
};

before(async () => {
  entityId = (await knex("entities").first()).entity_id;
});

beforeEach(async () => {
  await knex.raw(
    "truncate reconciled_lines, reconciliations, bank_transactions, rules, journal_lines, journal_entries, period_locks, property_valuations, mortgages, cpa_depreciation, fixed_assets, properties restart identity",
  );
  [{ property_id: propertyId }] = await knex("properties")
    .insert({ entity_id: entityId, name: "Test House" })
    .returning("property_id");
});

after(() => knex.destroy());

const accumulatedDepreciation = async (asOfDate) => {
  const trialBalance = await getTrialBalance({ entityId, asOfDate });
  return trialBalance.rows.find((row) => row.account_number === 1590)?.credit_cents ?? 0;
};

const addBuilding = () =>
  createFixedAsset({ propertyId, name: "House", ...BUILDING, disposalDate: undefined });

test("a building's depreciation matches the hand calculation and ends at its cost", () => {
  const years = yearlySchedule(BUILDING, {});

  assert.equal(estimateThrough(BUILDING, "2027-07-31"), 30303);
  assert.deepEqual(
    years.slice(0, 2).map((year) => [year.taxYear, year.estimateCents]),
    [
      [2027, 333333],
      [2028, 727273],
    ],
  );
  assert.equal(years.at(-1).accumulatedCents, BUILDING.costCents);
  assert.equal(years.at(-1).bookValueCents, 0);
  assert.deepEqual(yearlySchedule({ ...BUILDING, assetClass: "land" }, {}), []);
});

test("posting depreciation books each month once, and the CPA's figure trues up December", async () => {
  await addBuilding();

  const firstRun = await postDepreciationThrough({ entityId, throughDate: "2027-12-31" });
  assert.equal(firstRun.length, 6);
  assert.equal(await accumulatedDepreciation("2027-12-31"), 333333);

  assert.deepEqual(await postDepreciationThrough({ entityId, throughDate: "2027-12-31" }), []);

  const [asset] = await knex("fixed_assets");
  await setCpaDepreciation({ fixedAssetId: asset.fixed_asset_id, taxYear: 2027, amountCents: 333400 });
  const trueUp = await postDepreciationThrough({ entityId, throughDate: "2027-12-31" });
  assert.equal(trueUp.length, 1);
  assert.equal(trueUp[0].entry_date, "2027-12-31");
  assert.equal(await accumulatedDepreciation("2027-12-31"), 333400);

  await postDepreciationThrough({ entityId, throughDate: "2028-12-31" });
  assert.equal(await accumulatedDepreciation("2028-12-31"), 333400 + 727273);
  const trialBalance = await getTrialBalance({ entityId, asOfDate: "2028-12-31" });
  assert.equal(trialBalance.total_debit_cents, trialBalance.total_credit_cents);
});

test("a CPA figure for a locked year isn't pushed into the next year", async () => {
  await addBuilding();
  await postDepreciationThrough({ entityId, throughDate: "2027-12-31" });
  await knex("period_locks").insert({ entity_id: entityId, locked_through_date: "2027-12-31" });

  const [asset] = await knex("fixed_assets");
  await setCpaDepreciation({ fixedAssetId: asset.fixed_asset_id, taxYear: 2027, amountCents: 333400 });

  await assert.rejects(postDepreciationThrough({ entityId, throughDate: "2028-01-31" }), ConflictError);
  assert.equal(await accumulatedDepreciation("2028-01-31"), 333333);
});

test("deleting an asset takes its booked depreciation back out on the next run", async () => {
  const asset = await addBuilding();
  await postDepreciationThrough({ entityId, throughDate: "2027-09-30" });
  assert.equal(await accumulatedDepreciation("2027-09-30"), estimateThrough(BUILDING, "2027-09-30"));

  await removeFixedAsset(asset.fixed_asset_id);
  await postDepreciationThrough({ entityId, throughDate: "2027-09-30" });
  assert.equal(await accumulatedDepreciation("2027-09-30"), 0);
});
