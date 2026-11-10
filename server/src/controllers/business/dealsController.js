import knex from "../dbConnection.js";

function findDeals(entityId, trx = knex) {
  return trx("deals").where({ entity_id: entityId }).orderBy("created_at", "desc");
}

function findDeal(dealId, trx = knex) {
  return trx("deals").where({ deal_id: dealId }).first();
}

async function insertDeal(deal, trx = knex) {
  const [inserted] = await trx("deals").insert(deal).returning("*");
  return inserted;
}

async function updateDeal(dealId, changes, trx = knex) {
  const [updated] = await trx("deals")
    .where({ deal_id: dealId })
    .update({ ...changes, updated_at: knex.fn.now() })
    .returning("*");
  return updated;
}

function deleteDeal(dealId, trx = knex) {
  return trx("deals").where({ deal_id: dealId }).delete();
}

export { findDeals, findDeal, insertDeal, updateDeal, deleteDeal };
