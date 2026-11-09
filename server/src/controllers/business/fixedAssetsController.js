import knex from "../dbConnection.js";

const FIXED_ASSET_COLUMNS = [
  "fixed_assets.fixed_asset_id",
  "fixed_assets.property_id",
  "fixed_assets.name",
  "fixed_assets.asset_class",
  "fixed_assets.cost_cents",
  knex.raw("to_char(fixed_assets.in_service_date, 'YYYY-MM-DD') as in_service_date"),
  knex.raw("to_char(fixed_assets.disposal_date, 'YYYY-MM-DD') as disposal_date"),
  "fixed_assets.carryover_from_fixed_asset_id",
  "fixed_assets.created_at",
  "fixed_assets.updated_at",
];

// entityId (optional) keeps the assets of that entity's properties.
function findFixedAssets({ entityId } = {}, trx = knex) {
  return trx("fixed_assets")
    .select(FIXED_ASSET_COLUMNS)
    .modify((query) => {
      if (entityId) {
        query
          .join("properties", "properties.property_id", "fixed_assets.property_id")
          .where("properties.entity_id", entityId);
      }
    })
    .orderBy([{ column: "fixed_assets.in_service_date" }, { column: "fixed_assets.fixed_asset_id" }]);
}

function findFixedAsset(fixedAssetId, trx = knex) {
  return trx("fixed_assets")
    .select(FIXED_ASSET_COLUMNS)
    .where("fixed_assets.fixed_asset_id", fixedAssetId)
    .first();
}

async function insertFixedAsset(fixedAsset, trx = knex) {
  const [{ fixed_asset_id }] = await trx("fixed_assets").insert(fixedAsset).returning("fixed_asset_id");
  return findFixedAsset(fixed_asset_id, trx);
}

async function updateFixedAsset(fixedAssetId, changes, trx = knex) {
  await trx("fixed_assets")
    .where({ fixed_asset_id: fixedAssetId })
    .update({ ...changes, updated_at: knex.fn.now() });
  return findFixedAsset(fixedAssetId, trx);
}

function deleteFixedAsset(fixedAssetId, trx = knex) {
  return trx("fixed_assets").where({ fixed_asset_id: fixedAssetId }).delete();
}

async function countCarryoversFrom(fixedAssetId, trx = knex) {
  const row = await trx("fixed_assets")
    .where({ carryover_from_fixed_asset_id: fixedAssetId })
    .count({ count: "*" })
    .first();
  return Number(row.count);
}

function findCpaDepreciation(fixedAssetIds, trx = knex) {
  return trx("cpa_depreciation")
    .whereIn("fixed_asset_id", fixedAssetIds)
    .select("fixed_asset_id", "tax_year", "amount_cents")
    .orderBy("tax_year");
}

function saveCpaDepreciation({ fixedAssetId, taxYear, amountCents }, trx = knex) {
  return trx("cpa_depreciation")
    .insert({ fixed_asset_id: fixedAssetId, tax_year: taxYear, amount_cents: amountCents })
    .onConflict(["fixed_asset_id", "tax_year"])
    .merge({ amount_cents: amountCents, updated_at: knex.fn.now() });
}

function deleteCpaDepreciation({ fixedAssetId, taxYear }, trx = knex) {
  return trx("cpa_depreciation").where({ fixed_asset_id: fixedAssetId, tax_year: taxYear }).delete();
}

export {
  findFixedAssets,
  findFixedAsset,
  insertFixedAsset,
  updateFixedAsset,
  deleteFixedAsset,
  countCarryoversFrom,
  findCpaDepreciation,
  saveCpaDepreciation,
  deleteCpaDepreciation,
};
