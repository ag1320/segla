import knex from "../dbConnection.js";

function findEntities(trx = knex) {
  return trx("entities").orderBy("name");
}

function findEntity(entityId, trx = knex) {
  return trx("entities").where({ entity_id: entityId }).first();
}

function updateEntity(entityId, changes, trx = knex) {
  return trx("entities")
    .where({ entity_id: entityId })
    .update({ ...changes, updated_at: knex.fn.now() });
}

export { findEntities, findEntity, updateEntity };
